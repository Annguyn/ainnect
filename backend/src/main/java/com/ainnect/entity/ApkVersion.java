package com.ainnect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "apk_versions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApkVersion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String versionName;
    
    @Column(nullable = false)
    private Integer versionCode;
    
    @Column(nullable = false, length = 500)
    private String apkUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Column(length = 100)
    private String fileName;
    
    @Column(nullable = false)
    private LocalDateTime releaseDate;
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.releaseDate = LocalDateTime.now();
        if (this.isActive == null) {
            this.isActive = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

