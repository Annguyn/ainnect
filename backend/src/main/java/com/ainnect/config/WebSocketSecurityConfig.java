package com.ainnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    // Debug incoming native headers (mask Authorization)
                    try {
                        java.util.Map<String, java.util.List<String>> nativeHeaders = accessor.toNativeHeaderMap();
                        if (nativeHeaders != null) {
                            java.util.Map<String, Object> masked = new java.util.HashMap<>();
                            for (var e : nativeHeaders.entrySet()) {
                                if ("Authorization".equalsIgnoreCase(e.getKey())) {
                                    String val = e.getValue() != null && !e.getValue().isEmpty() ? e.getValue().get(0) : null;
                                    if (val != null && val.startsWith("Bearer ") && val.length() > 16) {
                                        masked.put(e.getKey(), val.substring(0, 12) + "..." + val.substring(val.length() - 4));
                                    } else {
                                        masked.put(e.getKey(), "***");
                                    }
                                } else {
                                    masked.put(e.getKey(), e.getValue());
                                }
                            }
                            org.slf4j.LoggerFactory.getLogger(WebSocketSecurityConfig.class)
                                .info("WS CONNECT nativeHeaders={}", masked);
                        }
                    } catch (Exception ignore) { }
                    
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        try {
                            String token = authHeader.substring(7);
                            String username = jwtUtil.extractUsername(token);
                            
                            if (username != null && jwtUtil.validateToken(token, username)) {
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                                accessor.setUser(authentication);
                                if (accessor.getSessionAttributes() != null) {
                                    accessor.getSessionAttributes().put("principalName", userDetails.getUsername());
                                }
                            } else {
                                org.slf4j.LoggerFactory.getLogger(WebSocketSecurityConfig.class)
                                    .warn("WS CONNECT invalid token or username null");
                            }
                        } catch (Exception e) {
                            org.slf4j.LoggerFactory.getLogger(WebSocketSecurityConfig.class)
                                .warn("WS CONNECT token parse/validate error: {}", e.getMessage());
                        }
                    }
                }

                // Ensure Principal is present for subsequent frames (SEND/SUBSCRIBE)
                if (accessor != null && (StompCommand.SEND.equals(accessor.getCommand()) || StompCommand.SUBSCRIBE.equals(accessor.getCommand()))) {
                    if (accessor.getUser() == null) {
                        // Try restore from session attributes first
                        if (accessor.getSessionAttributes() != null) {
                            Object principalName = accessor.getSessionAttributes().get("principalName");
                            if (principalName instanceof String pn && !pn.isBlank()) {
                                try {
                                    UserDetails userDetails = userDetailsService.loadUserByUsername(pn);
                                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                                    accessor.setUser(authentication);
                                    return message;
                                } catch (Exception ignored) { }
                            }
                        }
                        String authHeader = accessor.getFirstNativeHeader("Authorization");
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            try {
                                String token = authHeader.substring(7);
                                String username = jwtUtil.extractUsername(token);
                                if (username != null && jwtUtil.validateToken(token, username)) {
                                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                                    accessor.setUser(authentication);
                                }
                            } catch (Exception ignored) { }
                        }
                    }
                }
                
                return message;
            }
        });
    }
}
