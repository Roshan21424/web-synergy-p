package com.personal.synergy.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(
                5,
                Refill.intervally(5, Duration.ofMinutes(1))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    @Bean
    public Filter rateLimitFilter() {
        return (req, res, chain) -> {

            HttpServletRequest request = (HttpServletRequest) req;
            HttpServletResponse response = (HttpServletResponse) res;

            // Apply only on auth endpoints
            if (request.getRequestURI().startsWith("/auth/")) {

                String ip = request.getRemoteAddr();

                Bucket bucket = cache.computeIfAbsent(ip, k -> createNewBucket());

                if (!bucket.tryConsume(1)) {
                    response.setStatus(429);
                    response.getWriter().write("Too many requests");
                    return;
                }
            }

            chain.doFilter(req, res);
        };
    }
}