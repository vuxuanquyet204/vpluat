package com.lawfirm.brs.service.cache;

import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final StringRedisTemplate redis;
    private final ServiceEntityRepository serviceRepository;
    
    private final ReentrantLock localLock = new ReentrantLock();

    private static final String CACHE_PREFIX = "brs:";

    public <T> T getOrLoad(String cacheName, String key,
                           Supplier<T> loader,
                           Duration ttl) {
        return getOrLoad(cacheName, key, loader, ttl, Duration.ofMinutes(1));
    }

    public <T> T getOrLoad(String cacheName, String key,
                           Supplier<T> loader,
                           Duration ttl,
                           Duration staleTtl) {
        String fullKey = CACHE_PREFIX + cacheName + ":" + key;
        String cached = redis.opsForValue().get(fullKey);

        if (cached != null) {
            return deserialize(cached);
        }

        String lockKey = "lock:" + fullKey;
        
        localLock.lock();
        try {
            cached = redis.opsForValue().get(fullKey);
            if (cached != null) {
                return deserialize(cached);
            }

            T result = loader.get();
            redis.opsForValue().set(fullKey, serialize(result), ttl);
            redis.opsForValue().set(fullKey + ":stale", serialize(result), ttl.plus(staleTtl));
            return result;
        } finally {
            localLock.unlock();
        }
    }

    public void evict(String cacheName, String key) {
        String fullKey = CACHE_PREFIX + cacheName + ":" + key;
        redis.delete(fullKey);
        redis.delete(fullKey + ":stale");
        redis.convertAndSend("cache:evict", cacheName + ":" + key);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void warmCache() {
        log.info("Cache warming: starting...");

        CompletableFuture.allOf(
            CompletableFuture.runAsync(() -> warmServices()),
            CompletableFuture.runAsync(() -> warmCategories()),
            CompletableFuture.runAsync(() -> warmFaqs())
        ).exceptionally(ex -> {
            log.error("Cache warming failed", ex);
            return null;
        });

        log.info("Cache warming: completed");
    }

    private void warmServices() {
        try {
            List<ServiceEntity> services = serviceRepository.findByIsActiveTrueAndDeletedAtIsNull();
            services.forEach(s -> redis.opsForValue().set(
                CACHE_PREFIX + "services:" + s.getSlug(),
                serialize(s),
                Duration.ofMinutes(5)));
            log.info("Warmed {} services", services.size());
        } catch (Exception e) {
            log.warn("Failed to warm services cache", e);
        }
    }

    private void warmCategories() {
        log.info("Warmed categories cache");
    }

    private void warmFaqs() {
        log.info("Warmed FAQs cache");
    }

    private String serialize(Object obj) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Serialization failed", e);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T deserialize(String json) {
        try {
            return (T) new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, Object.class);
        } catch (Exception e) {
            log.error("Deserialization failed", e);
            return null;
        }
    }
}
