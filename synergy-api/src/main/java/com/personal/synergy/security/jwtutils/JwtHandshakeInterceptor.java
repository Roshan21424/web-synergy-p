package com.personal.synergy.security.jwtutils;

import com.personal.synergy.security.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor   // FIX: constructor injection — removed @Autowired field injection
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtils jwtUtils;
    // UserDetailsServiceImpl kept in case you need to load/validate the full user at handshake.
    // Remove if you only need the username from the token.
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        HttpServletRequest servlet = servletRequest.getServletRequest();

        // 1. Try Authorization header first
        String authHeader = servlet.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateJwtToken(token)) {
                attributes.put("username", jwtUtils.getUserNameFromJwtToken(token));
                return true;
            }
        }

        // 2. Fallback: token query parameter (SockJS / browser EventSource)
        String paramToken = servlet.getParameter("token");
        if (paramToken != null && jwtUtils.validateJwtToken(paramToken)) {
            attributes.put("username", jwtUtils.getUserNameFromJwtToken(paramToken));
            return true;
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest req, ServerHttpResponse res,
                               WebSocketHandler wsHandler, Exception ex) {
        // no-op
    }
}