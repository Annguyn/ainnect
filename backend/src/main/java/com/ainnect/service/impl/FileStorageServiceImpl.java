package com.ainnect.service.impl;

import com.ainnect.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
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
    private final String baseUrl;
    
    // Supported image formats
    private static final List<String> SUPPORTED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    // Supported video formats
    private static final List<String> SUPPORTED_VIDEO_TYPES = Arrays.asList(
        "video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", 
        "video/webm", "video/mkv", "video/3gp", "video/quicktime"
    );
    
    // All supported media types (images + videos)
    private static final List<String> SUPPORTED_MEDIA_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
        "video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", 
        "video/webm", "video/mkv", "video/3gp", "video/quicktime"
    );
    
    // Supported file categories
    private static final List<String> SUPPORTED_CATEGORIES = Arrays.asList(
        "avatars", "schools", "companies", "interests", "locations", "posts", "general"
    );
    
    // Max file size: 100MB
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024;

    public FileStorageServiceImpl(@Value("${app.file.upload-dir:uploads}") String uploadDir,
                                @Value("${app.file.base-url:http://localhost:8080}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            // Create directories for different file categories
            Files.createDirectories(this.fileStorageLocation.resolve("avatars"));
            Files.createDirectories(this.fileStorageLocation.resolve("schools"));
            Files.createDirectories(this.fileStorageLocation.resolve("companies"));
            Files.createDirectories(this.fileStorageLocation.resolve("interests"));
            Files.createDirectories(this.fileStorageLocation.resolve("locations"));
            Files.createDirectories(this.fileStorageLocation.resolve("posts"));
            Files.createDirectories(this.fileStorageLocation.resolve("general"));
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

        String fileName = generateFileName(file);
        
        try {
            Path categoryPath = this.fileStorageLocation.resolve(category);
            Files.createDirectories(categoryPath);
            
            Path targetLocation = categoryPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return baseUrl + "/api/files/" + category + "/" + fileName;
        } catch (IOException ex) {
            log.error("Could not store file {}. Error: {}", fileName, ex.getMessage());
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    @Override
    public String storeAvatarFile(MultipartFile file, Long userId) {
        if (!isValidMediaFile(file)) {
            throw new IllegalArgumentException("File avatar không hợp lệ");
        }

        String fileName = "avatar_" + userId + "_" + UUID.randomUUID().toString() + getFileExtension(file);
        
        try {
            Path avatarPath = this.fileStorageLocation.resolve("avatars");
            Files.createDirectories(avatarPath);
            
            Path targetLocation = avatarPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return baseUrl + "/api/files/avatars/" + fileName;
        } catch (IOException ex) {
            log.error("Could not store avatar file for user {}. Error: {}", userId, ex.getMessage());
            throw new RuntimeException("Không thể lưu file avatar. Vui lòng thử lại!", ex);
        }
    }

    @Override
    public String storeCoverFile(MultipartFile file, Long userId) {
        if (!isValidMediaFile(file)) {
            throw new IllegalArgumentException("File cover không hợp lệ");
        }

        String fileName = "cover_" + userId + "_" + UUID.randomUUID().toString() + getFileExtension(file);
        
        try {
            Path coverPath = this.fileStorageLocation.resolve("avatars"); // Store in avatars folder for now
            Files.createDirectories(coverPath);
            
            Path targetLocation = coverPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return baseUrl + "/api/files/avatars/" + fileName;
        } catch (IOException ex) {
            log.error("Could not store cover file for user {}. Error: {}", userId, ex.getMessage());
            throw new RuntimeException("Không thể lưu file cover. Vui lòng thử lại!", ex);
        }
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            // Extract category from fileName (format: category/filename)
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
        
        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File quá lớn. Kích thước tối đa là 100MB");
        }
        
        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !SUPPORTED_MEDIA_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPEG, PNG, GIF, WebP, MP4, AVI, MOV, WMV, FLV, WebM, MKV, 3GP");
        }
        
        return true;
    }
    
    private boolean isValidCategory(String category) {
        return category != null && SUPPORTED_CATEGORIES.contains(category.toLowerCase());
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
        
        // Fallback based on content type
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
