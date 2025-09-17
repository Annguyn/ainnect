package com.ainnect.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    
    // Lưu trữ blacklist token (trong thực tế nên dùng Redis hoặc database)
    private static final Set<String> tokenBlacklist = new HashSet<>();
    
    public static void addToBlacklist(String token) {
        tokenBlacklist.add(token);
    }
    
    public static boolean isBlacklisted(String token) {
        return tokenBlacklist.contains(token);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Kiểm tra header Authorization
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token
        jwt = authHeader.substring(7);
        
        try {
            // Kiểm tra token có trong blacklist không
            if (isBlacklisted(jwt)) {
                filterChain.doFilter(request, response);
                return;
            }
            
            username = jwtUtil.extractUsername(jwt);

            // Nếu username tồn tại và chưa có authentication trong context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Validate token
                if (jwtUtil.validateToken(jwt, username)) {
                    // Tạo authentication token
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication vào SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token không hợp lệ, không làm gì cả
            logger.debug("JWT Token validation failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
