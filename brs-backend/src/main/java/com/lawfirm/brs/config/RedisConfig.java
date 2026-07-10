package com.lawfirm.brs.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis configuration for caching and session management.
 *
 * Caches are stored in Redis (not in-memory) so they're shared across
 * instances and survive restarts. Per-cache TTLs come from
 * application.yml: app.cache.{name}.
 */
@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${app.cache.services:5}")
    private long servicesTtl;

    @Value("${app.cache.lawyers:5}")
    private long lawyersTtl;

    @Value("${app.cache.faqs:10}")
    private long faqsTtl;

    @Value("${app.cache.posts:2}")
    private long postsTtl;

    @Value("${app.cache.search:2}")
    private long searchTtl;

    @Value("${app.cache.locale:60}")
    private long localeTtl;

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        return container;
    }

    /**
     * Redis-backed CacheManager. Replaces the previous in-memory
     * ConcurrentMapCacheManager so cache entries are shared across all
     * backend instances, survive restarts, and respect per-cache TTLs.
     */
    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default config: 5 minutes TTL, JSON values, string keys,
        // no caching of nulls (avoids poisoning the cache on miss).
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .disableCachingNullValues()
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        // Per-cache TTL overrides keyed by @Cacheable(value = "...").
        Map<String, RedisCacheConfiguration> perCache = new HashMap<>();
        perCache.put("services", defaultConfig.entryTtl(Duration.ofMinutes(servicesTtl)));
        perCache.put("lawyers",  defaultConfig.entryTtl(Duration.ofMinutes(lawyersTtl)));
        perCache.put("faqs",     defaultConfig.entryTtl(Duration.ofMinutes(faqsTtl)));
        perCache.put("posts",    defaultConfig.entryTtl(Duration.ofMinutes(postsTtl)));
        perCache.put("search",   defaultConfig.entryTtl(Duration.ofMinutes(searchTtl)));
        perCache.put("locale",   defaultConfig.entryTtl(Duration.ofMinutes(localeTtl)));
        // Reviews cache is touched by ReviewService.
        perCache.put("reviews",  defaultConfig.entryTtl(Duration.ofMinutes(2)));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(perCache)
            .transactionAware()
            .build();
    }
}