package com.ainnect.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
public class UrlNormalizationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain chain)
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        
        if (requestURI != null && requestURI.endsWith(".") && !requestURI.equals("/")) {
            String normalizedURI = requestURI.substring(0, requestURI.length() - 1);
            
            HttpServletRequestWrapper wrappedRequest = new HttpServletRequestWrapper(request) {
                @Override
                public String getRequestURI() {
                    return normalizedURI;
                }
                
                @Override
                public StringBuffer getRequestURL() {
                    StringBuffer url = new StringBuffer();
                    String scheme = getScheme();
                    int port = getServerPort();
                    
                    url.append(scheme);
                    url.append("://");
                    url.append(getServerName());
                    if ((scheme.equals("http") && port != 80) || (scheme.equals("https") && port != 443)) {
                        url.append(':');
                        url.append(port);
                    }
                    url.append(normalizedURI);
                    String queryString = getQueryString();
                    if (queryString != null) {
                        url.append('?').append(queryString);
                    }
                    return url;
                }
                
                @Override
                public String getServletPath() {
                    String servletPath = super.getServletPath();
                    if (servletPath != null && servletPath.endsWith(".")) {
                        return servletPath.substring(0, servletPath.length() - 1);
                    }
                    return servletPath;
                }
                
                @Override
                public String getPathInfo() {
                    String pathInfo = super.getPathInfo();
                    if (pathInfo != null && pathInfo.endsWith(".")) {
                        return pathInfo.substring(0, pathInfo.length() - 1);
                    }
                    return pathInfo;
                }
            };
            
            chain.doFilter(wrappedRequest, response);
        } else {
            chain.doFilter(request, response);
        }
    }
}

