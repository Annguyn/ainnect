package com.ainnect.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;

@Slf4j
@Configuration
@ConditionalOnProperty(name = "app.cache.flush-on-startup", havingValue = "true")
public class RedisStartupCleaner {

    @Bean
    public ApplicationRunner flushRedisOnStartup(RedisConnectionFactory connectionFactory) {
        return args -> {
            try (RedisConnection connection = connectionFactory.getConnection()) {
                connection.serverCommands().flushDb();
                log.warn("Redis FLUSHDB executed on startup due to app.cache.flush-on-startup=true");
            } catch (Exception e) {
                log.error("Failed to FLUSHDB on startup", e);
            }
        };
    }
}


