package com.ainnect.config;

import java.security.Principal;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import jakarta.servlet.http.HttpServletRequest;

public class JwtHandshakeHandler extends DefaultHandshakeHandler {

    private static final Logger log = LoggerFactory.getLogger(JwtHandshakeHandler.class);
    private final JwtUtil jwtUtil;

    public JwtHandshakeHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected Principal determineUser(@NonNull ServerHttpRequest request, @NonNull WebSocketHandler wsHandler,
                                      @NonNull Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servlet) {
            HttpServletRequest http = servlet.getServletRequest();
            
            String token = null;
            String tokenSource = null;
            
            String authHeader = http.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                tokenSource = "header";
            }
            
            if (token == null || token.isBlank()) {
                token = http.getParameter("token");
                if (token != null && !token.isBlank()) {
                    tokenSource = "query";
                }
            }
            
            if (token != null && !token.isBlank()) {
                try {
                    String username = jwtUtil.extractUsername(token);
                    if (username != null && jwtUtil.validateToken(token, username)) {
                        log.info("WebSocket authentication successful for user: {} (token from: {})", username, tokenSource);
                        return () -> username;
                    } else {
                        log.warn("WebSocket authentication failed: invalid token (from: {})", tokenSource);
                    }
                } catch (Exception e) {
                    log.error("WebSocket authentication error (from: {}): {}", tokenSource, e.getMessage());
                }
            } else {
                log.warn("WebSocket authentication failed: no token provided. Query: {}, Headers: {}", 
                    http.getQueryString(), 
                    authHeader != null ? "Authorization header present" : "No Authorization header");
            }
        }
        return super.determineUser(request, wsHandler, attributes);
    }
}


