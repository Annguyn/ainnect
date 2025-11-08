package com.ainnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        
        config.setApplicationDestinationPrefixes("/app");
        
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        String[] allowedOrigins = {
            "https://*.ainnect.me",
            "https://ainnect.me",
            "http://192.168.*.*",
            "http://192.168.*.*:*",
            "http://10.0.2.2",
            "http://10.0.2.2:*",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "*"
        };
        
        registry.addEndpoint("/ws")
                .addInterceptors(new HttpHandshakeInterceptor())
                .setHandshakeHandler(new JwtHandshakeHandler(jwtUtil))
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS()
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js")
                .setStreamBytesLimit(512 * 1024)
                .setHttpMessageCacheSize(1000)
                .setDisconnectDelay(30 * 1000);

        registry.addEndpoint("/ws-messaging")
                .addInterceptors(new HttpHandshakeInterceptor())
                .setHandshakeHandler(new JwtHandshakeHandler(jwtUtil))
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS()
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js")
                .setStreamBytesLimit(512 * 1024)
                .setHttpMessageCacheSize(1000)
                .setDisconnectDelay(30 * 1000);
        
        registry.addEndpoint("/ws")
                .addInterceptors(new HttpHandshakeInterceptor())
                .setHandshakeHandler(new JwtHandshakeHandler(jwtUtil))
                .setAllowedOriginPatterns(allowedOrigins);
        
        registry.addEndpoint("/ws-messaging")
                .addInterceptors(new HttpHandshakeInterceptor())
                .setHandshakeHandler(new JwtHandshakeHandler(jwtUtil))
                .setAllowedOriginPatterns(allowedOrigins);
    }
}
