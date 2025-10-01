package com.ainnect.dto.post;

import com.ainnect.common.enums.MediaType;
import com.ainnect.common.enums.PostVisibility;
import com.ainnect.common.enums.ReactionType;
import com.ainnect.dto.reaction.ReactionDtos;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

public class PostDtos {
    @Getter
    @Setter
    public static class CreateRequest {
        private Long groupId;
        @NotBlank
        @Size(max = 10000)
        private String content;
        private PostVisibility visibility = PostVisibility.public_;
        private List<String> mediaUrls; // URLs of uploaded media files (optional)
    }

    @Getter
    @Setter
    public static class UpdateRequest {
        @NotBlank
        @Size(max = 10000)
        private String content;
        private PostVisibility visibility = PostVisibility.public_;
        private List<String> mediaUrls; // URLs of uploaded media files (optional)
    }

    // Multipart form data DTOs for direct media upload
    @Getter
    public static class CreateWithMediaRequest {
        private Long groupId;
        @NotBlank
        @Size(max = 10000)
        private String content;
        private PostVisibility visibility = PostVisibility.public_;
        // Media files will be handled as MultipartFile[] in controller
    }

    @Getter
    public static class UpdateWithMediaRequest {
        @NotBlank
        @Size(max = 10000)
        private String content;
        private PostVisibility visibility = PostVisibility.public_;
        // Media files will be handled as MultipartFile[] in controller
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long authorId;
        private String authorUsername;
        private String authorDisplayName;
        private String authorAvatarUrl;
        private Long groupId;
        private String content;
        private PostVisibility visibility;
        private Integer commentCount;
        private Integer reactionCount;
        private Integer shareCount;
        private ReactionDtos.ReactionSummary reactions;
        private List<MediaResponse> media;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime updatedAt;
    }

    @Getter
    public static class CommentCreateRequest {
        private Long parentId;
        @NotBlank
        @Size(max = 5000)
        private String content;
    }

    @Getter
    public static class ReactionRequest {
        @NotNull
        private ReactionType type;
    }

    @Getter
    public static class ShareRequest {
        @Size(max = 10000)
        private String comment;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MediaResponse {
        private Long id;
        private String mediaUrl;
        private MediaType mediaType;
        private java.time.LocalDateTime createdAt;
    }
}


