package com.personal.synergy;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Local in-process cache using Caffeine.
 *
 * Requires in pom.xml:
 *   <dependency>
 *     <groupId>com.github.ben-manes.caffeine</groupId>
 *     <artifactId>caffeine</artifactId>
 *   </dependency>
 *   <dependency>
 *     <groupId>org.springframework.boot</groupId>
 *     <artifactId>spring-boot-starter-cache</artifactId>
 *   </dependency>
 */
@EnableCaching
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("userDetails");
        manager.setCaffeine(
            Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(500)
        );
        return manager;
    }
}