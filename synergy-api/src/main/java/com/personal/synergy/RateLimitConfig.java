package com.personal.synergy;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate-limits /auth/login and /auth/signup to 5 requests per minute per IP.
 *
 * Requires in pom.xml:
 *   <dependency>
 *     <groupId>com.bucket4j</groupId>
 *     <artifactId>bucket4j-core</artifactId>
 *     <version>8.10.1</version>
 *   </dependency>
 */
@Slf4j
@Configuration
public class RateLimitConfig {

    // Per-IP bucket registry — one bucket per client IP
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    @Bean
    public Filter rateLimitFilter() {
        return (req, res, chain) -> {
            HttpServletRequest httpReq = (HttpServletRequest) req;
            String uri = httpReq.getRequestURI();

            if (uri.startsWith("/auth/login") || uri.startsWith("/auth/signup")) {
                String clientIp = getClientIp(httpReq);
                Bucket bucket = buckets.computeIfAbsent(clientIp, k -> createBucket());

                if (!bucket.tryConsume(1)) {
                    log.warn("Rate limit exceeded for IP {} on {}", clientIp, uri);
                    HttpServletResponse httpRes = (HttpServletResponse) res;
                    httpRes.setStatus(429);
                    httpRes.setContentType("application/json");
                    httpRes.getWriter().write(
                        "{\"message\":\"Too many requests. Please wait before trying again.\",\"status\":false}"
                    );
                    return;
                }
            }

            chain.doFilter(req, res);
        };
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}