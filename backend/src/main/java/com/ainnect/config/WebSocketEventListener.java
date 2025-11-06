package com.ainnect.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
public class WebSocketEventListener {

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String username = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : "Anonymous";
        Object ip = headerAccessor.getSessionAttributes() != null ? headerAccessor.getSessionAttributes().get("ip") : null;
        Object ua = headerAccessor.getSessionAttributes() != null ? headerAccessor.getSessionAttributes().get("userAgent") : null;
        Object origin = headerAccessor.getSessionAttributes() != null ? headerAccessor.getSessionAttributes().get("origin") : null;

        String auth = headerAccessor.getFirstNativeHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ") && auth.length() > 16) {
            auth = auth.substring(0, 12) + "..." + auth.substring(auth.length() - 4);
        }

        log.info("WS CONNECT sessionId={}, user={}, ip={}, ua={}, origin={}, auth={}",
                sessionId, username, ip, ua, origin, auth);
    }

    @EventListener
    public void handleStompSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        java.util.Map<String, java.util.List<String>> nativeHeaders = accessor.toNativeHeaderMap();
        java.util.Map<String, Object> masked = new java.util.HashMap<>();
        if (nativeHeaders != null) {
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
        }
        log.info("WS STOMP CONNECT sessionId={}, nativeHeaders={}", sessionId, masked);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        String username = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : "Anonymous";
        Object ip = headerAccessor.getSessionAttributes() != null ? headerAccessor.getSessionAttributes().get("ip") : null;
        Object ua = headerAccessor.getSessionAttributes() != null ? headerAccessor.getSessionAttributes().get("userAgent") : null;
        Object origin = headerAccessor.getSessionAttributes() != null ? headerAccessor.getSessionAttributes().get("origin") : null;

        log.info("WS DISCONNECT sessionId={}, user={}, ip={}, ua={}, origin={}",
                sessionId, username, ip, ua, origin);
    }
}
