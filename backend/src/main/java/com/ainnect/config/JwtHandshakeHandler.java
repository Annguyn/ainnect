package com.ainnect.config;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import jakarta.servlet.http.HttpServletRequest;

public class JwtHandshakeHandler extends DefaultHandshakeHandler {

    private final JwtUtil jwtUtil;

    public JwtHandshakeHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected Principal determineUser(@NonNull ServerHttpRequest request, @NonNull WebSocketHandler wsHandler,
                                      @NonNull Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servlet) {
            HttpServletRequest http = servlet.getServletRequest();
            String token = http.getParameter("token");
            if (token != null && !token.isBlank()) {
                try {
                    String username = jwtUtil.extractUsername(token);
                    if (username != null && jwtUtil.validateToken(token, username)) {
                        return () -> username;
                    }
                } catch (Exception ignored) { }
            }
        }
        return super.determineUser(request, wsHandler, attributes);
    }
}


