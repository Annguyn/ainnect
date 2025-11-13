package com.ainnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private RequestLoggingInterceptor requestLoggingInterceptor;

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "https://*.ainnect.me",
                    "https://www.ainnect.me",
                    "https://api.ainnect.me",
                    "https://ainnect.me",
                    "https://*.stg.ainnect.me",
                    "https://api-stg.ainnect.me",
                    "https://www.stg.ainnect.me",
                    "https://cdn-stg.ainnect.me",
                    "https://stg.ainnect.me",
                    "http://192.168.*.*",
                    "http://192.168.*.*:*",
                    "http://10.0.2.2",
                    "http://10.0.2.2:*",
                    "http://localhost:*",
                    "http://127.0.0.1:*"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)
                .exposedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String absolute = Paths.get(uploadDir).toAbsolutePath().toString().replace("\\", "/");
        if (!absolute.endsWith("/")) {
            absolute = absolute + "/";
        }

        registry.addResourceHandler("/api/files/**")
                .addResourceLocations("file:" + absolute)
                .setCachePeriod(3600);

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(requestLoggingInterceptor);
    }
}