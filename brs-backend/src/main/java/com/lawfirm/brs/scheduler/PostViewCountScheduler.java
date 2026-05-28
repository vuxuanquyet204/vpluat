package com.lawfirm.brs.scheduler;

import com.lawfirm.brs.entity.Post;
import com.lawfirm.brs.repository.jpa.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Set;

/**
 * Scheduler for updating and syncing post view counts.
 * Maintains view counts in Redis for performance and persists to DB periodically.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PostViewCountScheduler {

    private final PostRepository postRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String VIEW_COUNT_KEY_PREFIX = "post:views:";
    private static final Duration VIEW_SYNC_INTERVAL = Duration.ofMinutes(5);

    /**
     * Sync view counts from Redis to database.
     * Runs every 5 minutes.
     */
    @Scheduled(fixedRate = 300000)
    public void syncViewCountsToDatabase() {
        log.debug("Running view count sync scheduler...");
        
        try {
            Set<String> keys = redisTemplate.keys(VIEW_COUNT_KEY_PREFIX + "*");
            
            if (keys == null || keys.isEmpty()) {
                log.debug("No view count keys found to sync.");
                return;
            }
            
            int syncedCount = 0;
            int errorCount = 0;
            
            for (String key : keys) {
                try {
                    String postId = key.replace(VIEW_COUNT_KEY_PREFIX, "");
                    Object countObj = redisTemplate.opsForValue().get(key);
                    
                    if (countObj == null) {
                        continue;
                    }
                    
                    int redisCount = parseViewCount(countObj);
                    int dbCount = getDbViewCount(postId);
                    int totalCount = dbCount + redisCount;
                    
                    if (redisCount > 0) {
                        updateDbViewCount(postId, totalCount);
                        redisTemplate.opsForValue().set(key, 0);
                        syncedCount++;
                    }
                    
                } catch (Exception e) {
                    errorCount++;
                    log.warn("Failed to sync view count for key {}: {}", key, e.getMessage());
                }
            }
            
            log.info("View count sync completed. Synced {} posts, {} errors.", syncedCount, errorCount);
            
        } catch (Exception e) {
            log.error("Error during view count sync: {}", e.getMessage(), e);
        }
    }

    /**
     * Increment view count in Redis for a specific post.
     * Called by the view tracking endpoint.
     *
     * @param postId the post ID
     */
    public void incrementViewCount(String postId) {
        String key = VIEW_COUNT_KEY_PREFIX + postId;
        redisTemplate.opsForValue().increment(key);
    }

    /**
     * Get current view count for a post (Redis + DB).
     *
     * @param postId the post ID
     * @return total view count
     */
    public int getViewCount(String postId) {
        String key = VIEW_COUNT_KEY_PREFIX + postId;
        Object redisCount = redisTemplate.opsForValue().get(key);
        int dbCount = getDbViewCount(postId);
        int pendingCount = parseViewCount(redisCount);
        return dbCount + pendingCount;
    }

    /**
     * Force flush all pending view counts to database.
     * Can be called manually or during deployment.
     */
    public void flushAllViewCounts() {
        log.info("Force flushing all view counts to database...");
        syncViewCountsToDatabase();
        log.info("View count flush completed.");
    }

    private int parseViewCount(Object countObj) {
        if (countObj == null) {
            return 0;
        }
        if (countObj instanceof Number) {
            return ((Number) countObj).intValue();
        }
        try {
            return Integer.parseInt(countObj.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private int getDbViewCount(String postId) {
        return postRepository.findById(java.util.UUID.fromString(postId))
            .map(Post::getViews)
            .orElse(0);
    }

    private void updateDbViewCount(String postId, int totalCount) {
        postRepository.findById(java.util.UUID.fromString(postId))
            .ifPresent(post -> {
                post.setViews(totalCount);
                postRepository.save(post);
            });
    }
}
