package com.personal.synergy.security.jwtutils;

import tools.jackson.databind.ObjectMapper;   // FIX: was tools.jackson.databind.ObjectMapper (Jackson 3.x — wrong for Spring Boot 3.x)
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
public class AuthEntryPoint implements AuthenticationEntryPoint {

    // Reuse a single ObjectMapper instance — it's thread-safe and expensive to create
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        log.warn("Unauthorized request to {}: {}", request.getServletPath(), authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        MAPPER.writeValue(response.getOutputStream(), Map.of(
                "status",  HttpServletResponse.SC_UNAUTHORIZED,
                "error",   "Unauthorized",
                "message", authException.getMessage(),
                "path",    request.getServletPath()
        ));
    }
}