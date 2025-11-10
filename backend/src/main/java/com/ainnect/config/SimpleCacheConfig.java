package com.ainnect.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@EnableCaching
@ConditionalOnProperty(name = "spring.cache.type", havingValue = "simple", matchIfMissing = false)
public class SimpleCacheConfig {

    @Bean
    public CacheManager cacheManager() {
        log.info("Using SimpleCacheManager (Redis not available or disabled)");
        return new SimpleCacheManager();
    }
}

