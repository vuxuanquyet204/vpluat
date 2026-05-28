package com.lawfirm.brs.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
@RequiredArgsConstructor
@Slf4j
public class CacheInvalidationListener implements MessageListener {

    private final RedisMessageListenerContainer listenerContainer;

    private static final String CACHE_EVICT_CHANNEL = "cache:evict";

    @PostConstruct
    public void init() {
        listenerContainer.addMessageListener(this, new ChannelTopic(CACHE_EVICT_CHANNEL));
        log.info("Cache invalidation listener registered on channel: {}", CACHE_EVICT_CHANNEL);
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String payload = new String(message.getBody());
        log.debug("Received cache eviction event: {}", payload);

        String[] parts = payload.split(":", 2);
        if (parts.length == 2) {
            String cacheName = parts[0];
            String key = parts[1];
            handleEviction(cacheName, key);
        }
    }

    private void handleEviction(String cacheName, String key) {
        log.info("Invalidating cache entry: {}:{}", cacheName, key);
    }
}
