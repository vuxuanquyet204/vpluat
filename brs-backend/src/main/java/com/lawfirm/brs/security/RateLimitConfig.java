package com.lawfirm.brs.security;

import com.lawfirm.brs.config.AppProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limit configuration using Bucket4j.
 */
@Component
@RequiredArgsConstructor
public class RateLimitConfig {

    private final AppProperties appProperties;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public Bucket authBucket(String key) {
        return buckets.computeIfAbsent("auth:" + key, k ->
            Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(appProperties.getRateLimit().getAuth())
                    .refillGreedy(appProperties.getRateLimit().getAuth(), Duration.ofMinutes(1))
                    .build())
                .build()
        );
    }

    public Bucket bookingBucket(String key) {
        return buckets.computeIfAbsent("booking:" + key, k ->
            Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(appProperties.getRateLimit().getBooking())
                    .refillGreedy(appProperties.getRateLimit().getBooking(), Duration.ofMinutes(1))
                    .build())
                .build()
        );
    }

    public Bucket leadBucket(String key) {
        return buckets.computeIfAbsent("lead:" + key, k ->
            Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(appProperties.getRateLimit().getLead())
                    .refillGreedy(appProperties.getRateLimit().getLead(), Duration.ofMinutes(1))
                    .build())
                .build()
        );
    }

    public Bucket searchBucket(String key) {
        return buckets.computeIfAbsent("search:" + key, k ->
            Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(appProperties.getRateLimit().getSearch())
                    .refillGreedy(appProperties.getRateLimit().getSearch(), Duration.ofMinutes(1))
                    .build())
                .build()
        );
    }

    public Bucket chatbotBucket(String sessionId) {
        return buckets.computeIfAbsent("chatbot:" + sessionId, k ->
            Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(appProperties.getRateLimit().getChatbotPerSession())
                    .refillGreedy(appProperties.getRateLimit().getChatbotPerSession(), Duration.ofMinutes(1))
                    .build())
                .build()
        );
    }
}
