package com.ainnect.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file, String category);
    String storeAvatarFile(MultipartFile file, Long userId);
    String storeCoverFile(MultipartFile file, Long userId);
    void deleteFile(String fileName);
    boolean isValidImageFile(MultipartFile file);
}
