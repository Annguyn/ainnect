package com.ainnect.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudflareStorageService {
    String uploadFile(MultipartFile file, String category);
    void deleteFile(String fileKey);
    boolean isEnabled();
}

