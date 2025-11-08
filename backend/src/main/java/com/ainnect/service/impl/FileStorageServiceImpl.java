package com.ainnect.service.impl;

import com.ainnect.service.CloudflareStorageService;
import com.ainnect.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;
    private final String cdnUrl;
    private final boolean useCdn;
    
    @Autowired
    private CloudflareStorageService cloudflareStorageService;
    
    private static final List<String> SUPPORTED_MEDIA_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
        "video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", 
        "video/webm", "video/mkv", "video/3gp", "video/quicktime"
    );
    
    private static final List<String> SUPPORTED_CATEGORIES = Arrays.asList(
        "avatars", "schools", "companies", "interests", "locations", "posts", "general", "messages"
    );
    
    // Max file size: 100MB
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024;

    public FileStorageServiceImpl(@Value("${app.file.upload-dir:uploads}") String uploadDir,
                                @Value("${app.file.cdn-url:}") String cdnUrl,
                                @Value("${app.file.use-cdn:false}") boolean useCdn) {
        this.cdnUrl = cdnUrl;
        this.useCdn = useCdn && cdnUrl != null && !cdnUrl.trim().isEmpty();
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation.resolve("avatars"));
            Files.createDirectories(this.fileStorageLocation.resolve("schools"));
            Files.createDirectories(this.fileStorageLocation.resolve("companies"));
            Files.createDirectories(this.fileStorageLocation.resolve("interests"));
            Files.createDirectories(this.fileStorageLocation.resolve("locations"));
            Files.createDirectories(this.fileStorageLocation.resolve("posts"));
            Files.createDirectories(this.fileStorageLocation.resolve("general"));
            Files.createDirectories(this.fileStorageLocation.resolve("messages"));
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String category) {
        if (!isValidMediaFile(file)) {
            throw new IllegalArgumentException("File không hợp lệ");
        }
        
        if (!isValidCategory(category)) {
            throw new IllegalArgumentException("Category không hợp lệ. Các category được hỗ trợ: " + SUPPORTED_CATEGORIES);
        }

        if (cloudflareStorageService.isEnabled()) {
            String fileUrl = cloudflareStorageService.uploadFile(file, category);
            log.info("File uploaded to Cloudflare R2: {}", fileUrl);
            return fileUrl;
        } else {
            throw new IllegalStateException("Cloudflare R2 is not enabled. Please configure R2 storage.");
        }
    }

    @Override
    public String storeAvatarFile(MultipartFile file, Long userId) {
        if (!isValidMediaFile(file)) {
            throw new IllegalArgumentException("File avatar không hợp lệ");
        }

        if (cloudflareStorageService.isEnabled()) {
            String fileUrl = cloudflareStorageService.uploadFile(file, "avatars");
            log.info("Avatar uploaded to Cloudflare R2 for user {}: {}", userId, fileUrl);
            return fileUrl;
        } else {
            throw new IllegalStateException("Cloudflare R2 is not enabled. Please configure R2 storage.");
        }
    }

    @Override
    public String storeCoverFile(MultipartFile file, Long userId) {
        if (!isValidMediaFile(file)) {
            throw new IllegalArgumentException("File cover không hợp lệ");
        }

        if (cloudflareStorageService.isEnabled()) {
            String fileUrl = cloudflareStorageService.uploadFile(file, "avatars");
            log.info("Cover uploaded to Cloudflare R2 for user {}: {}", userId, fileUrl);
            return fileUrl;
        } else {
            throw new IllegalStateException("Cloudflare R2 is not enabled. Please configure R2 storage.");
        }
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            String[] parts = fileName.split("/", 2);
            if (parts.length == 2) {
                String category = parts[0];
                if (!isValidCategory(category)) {
                    log.warn("Invalid category in file path: {}", category);
                    return;
                }
            }
            
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.error("Could not delete file {}. Error: {}", fileName, ex.getMessage());
        }
    }

    @Override
    public boolean isValidImageFile(MultipartFile file) {
        return isValidMediaFile(file);
    }
    
    public boolean isValidMediaFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File quá lớn. Kích thước tối đa là 100MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !SUPPORTED_MEDIA_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPEG, PNG, GIF, WebP, MP4, AVI, MOV, WMV, FLV, WebM, MKV, 3GP");
        }
        
        return true;
    }
    
    private boolean isValidCategory(String category) {
        return category != null && SUPPORTED_CATEGORIES.contains(category.toLowerCase());
    }
    
    /**
     * Build file URL based on CDN configuration
     * If CDN is enabled and configured, return CDN URL
     * Otherwise return API endpoint URL
     */
    private String buildFileUrl(String category, String fileName) {
        if (useCdn) {
            // Remove trailing slash from CDN URL if exists
            String cdn = cdnUrl.endsWith("/") ? cdnUrl.substring(0, cdnUrl.length() - 1) : cdnUrl;
            return cdn + "/" + category + "/" + fileName;
        } else {
            // Return API endpoint URL (served by FileController)
            return "/api/files/" + category + "/" + fileName;
        }
    }

    private String generateFileName(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null) {
            originalFileName = StringUtils.cleanPath(originalFileName);
        }
        String extension = getFileExtension(file);
        return UUID.randomUUID().toString() + extension;
    }
    
    private String getFileExtension(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null && originalFileName.contains(".")) {
            return originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        String contentType = file.getContentType();
        if (contentType != null) {
            switch (contentType.toLowerCase()) {
                case "image/jpeg":
                case "image/jpg":
                    return ".jpg";
                case "image/png":
                    return ".png";
                case "image/gif":
                    return ".gif";
                case "image/webp":
                    return ".webp";
                default:
                    return ".jpg";
            }
        }
        
        return ".jpg";
    }
}
