package com.ainnect.service.impl;

import com.ainnect.service.CloudflareStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
public class CloudflareStorageServiceImpl implements CloudflareStorageService {

    @Value("${cloudflare.r2.enabled:false}")
    private boolean enabled;

    @Value("${cloudflare.r2.account-id:}")
    private String accountId;

    @Value("${cloudflare.r2.access-key-id:}")
    private String accessKeyId;

    @Value("${cloudflare.r2.secret-access-key:}")
    private String secretAccessKey;

    @Value("${cloudflare.r2.bucket-name:}")
    private String bucketName;

    @Value("${cloudflare.r2.public-url:}")
    private String publicUrl;

    private S3Client s3Client;

    @Autowired
    public void initializeS3Client() {
        log.info("Initializing Cloudflare R2 client - enabled: {}, configured: {}", enabled, isConfigured());
        log.debug("R2 Config - Account ID: {}, Bucket: {}, Public URL: {}", 
                accountId, bucketName, publicUrl);
        
        if (enabled && isConfigured()) {
            try {
                AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
                
                String endpoint = String.format("https://%s.r2.cloudflarestorage.com", accountId);
                
                S3Configuration s3Config = S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build();
                
                this.s3Client = S3Client.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(StaticCredentialsProvider.create(credentials))
                        .endpointOverride(URI.create(endpoint))
                        .serviceConfiguration(s3Config)
                        .httpClientBuilder(ApacheHttpClient.builder()
                                .connectionTimeout(Duration.ofSeconds(60))
                                .socketTimeout(Duration.ofSeconds(60))
                                .maxConnections(100))
                        .build();
                
                log.info("Cloudflare R2 client initialized successfully with endpoint: {}", endpoint);
            } catch (Exception e) {
                log.error("Failed to initialize Cloudflare R2 client: {}", e.getMessage(), e);
                this.enabled = false;
            }
        } else {
            log.info("Cloudflare R2 is disabled or not configured");
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String category) {
        if (!enabled || !isConfigured()) {
            throw new IllegalStateException("Cloudflare R2 is not enabled or configured");
        }

        String fileName = generateFileName(file);
        String key = category + "/" + fileName;

        try {
            log.info("Attempting to upload file to R2: bucket={}, key={}", bucketName, key);
            
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            String fileUrl = buildPublicUrl(key);
            log.info("File uploaded successfully to R2: {}", fileUrl);
            return fileUrl;
            
        } catch (Exception e) {
            log.error("Failed to upload file to R2. Error type: {}, Message: {}", 
                    e.getClass().getName(), e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to Cloudflare R2", e);
        }
    }

    @Override
    public void deleteFile(String fileKey) {
        if (!enabled || !isConfigured()) {
            log.warn("Cloudflare R2 is not enabled or configured, skipping delete");
            return;
        }

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully from R2: {}", fileKey);
            
        } catch (Exception e) {
            log.error("Failed to delete file from R2: {}", e.getMessage());
        }
    }

    @Override
    public boolean isEnabled() {
        return enabled && isConfigured();
    }

    private boolean isConfigured() {
        return accountId != null && !accountId.trim().isEmpty() &&
               accessKeyId != null && !accessKeyId.trim().isEmpty() &&
               secretAccessKey != null && !secretAccessKey.trim().isEmpty() &&
               bucketName != null && !bucketName.trim().isEmpty() &&
               publicUrl != null && !publicUrl.trim().isEmpty();
    }

    private String buildPublicUrl(String key) {
        String url = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
        return url + "/" + key;
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
                case "video/mp4":
                    return ".mp4";
                case "video/avi":
                    return ".avi";
                case "video/mov":
                case "video/quicktime":
                    return ".mov";
                case "video/wmv":
                    return ".wmv";
                case "video/flv":
                    return ".flv";
                case "video/webm":
                    return ".webm";
                case "video/mkv":
                    return ".mkv";
                case "video/3gp":
                    return ".3gp";
                default:
                    return ".jpg";
            }
        }

        return ".jpg";
    }
}

