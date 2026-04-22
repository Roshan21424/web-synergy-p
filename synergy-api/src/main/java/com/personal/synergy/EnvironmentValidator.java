package com.personal.synergy;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Validates that required environment variables are present at startup.
 * Fails fast with a clear message rather than cryptic errors later.
 */
@Slf4j
@Component
public class EnvironmentValidator {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.app.jwtSecret}")
    private String jwtSecret;

    @Value("${spring.data.redis.url:}")
    private String redisUrl;

    @PostConstruct
    public void validate() {
        log.info("Validating required environment configuration...");

        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                "FATAL: JWT_SECRET environment variable is not set. Application cannot start.");
        }

        if (dbUrl == null || dbUrl.isBlank()) {
            throw new IllegalStateException(
                "FATAL: DATABASE_URL environment variable is not set. Application cannot start.");
        }

        if (redisUrl == null || redisUrl.isBlank()) {
            log.warn("REDIS_URL is not set — Redis-dependent features (presence, call state) will fail.");
        }

        log.info("Environment validation passed.");
    }
}