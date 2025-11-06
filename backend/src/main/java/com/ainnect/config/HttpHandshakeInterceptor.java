package com.ainnect.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

public class HttpHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(HttpHandshakeInterceptor.class);

    @Override
    public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                                   @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servlet) {
            HttpServletRequest httpServletRequest = servlet.getServletRequest();
            String ip = getClientIp(httpServletRequest);
            String userAgent = httpServletRequest.getHeader("User-Agent");
            String origin = httpServletRequest.getHeader("Origin");
            attributes.put("ip", ip);
            attributes.put("userAgent", userAgent);
            attributes.put("origin", origin);

            Map<String, String> maskedHeaders = maskSensitiveHeaders(request.getHeaders());
            String query = httpServletRequest.getQueryString();
            log.info("WS HANDSHAKE ip={}, origin={}, ua={}, query={}, headers={}",
                    ip, origin, userAgent, query, maskedHeaders);
        }
        return true;
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                               @NonNull WebSocketHandler wsHandler, Exception exception) {
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) {
            return xri;
        }
        return request.getRemoteAddr();
    }

    private Map<String, String> maskSensitiveHeaders(HttpHeaders headers) {
        Map<String, String> out = new HashMap<>();
        headers.forEach((k, v) -> {
            if (v == null || v.isEmpty()) {
                out.put(k, "");
            } else if ("Authorization".equalsIgnoreCase(k)) {
                String val = v.get(0);
                if (val != null && val.startsWith("Bearer ") && val.length() > 16) {
                    out.put(k, val.substring(0, 12) + "..." + val.substring(val.length() - 4));
                } else {
                    out.put(k, "***");
                }
            } else {
                out.put(k, v.get(0));
            }
        });
        return out;
    }
}


