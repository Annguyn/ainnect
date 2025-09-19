package com.ainnect.dto.post;

import com.ainnect.common.enums.PostVisibility;
import com.ainnect.common.enums.ReactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class PostDtos {
    @Getter
    public static class CreateRequest {
        private Long groupId;
        @NotBlank
        @Size(max = 10000)
        private String content;
        private PostVisibility visibility = PostVisibility.public_;
    }

    @Getter
    public static class UpdateRequest {
        @NotBlank
        @Size(max = 10000)
        private String content;
        private PostVisibility visibility = PostVisibility.public_;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long authorId;
        private Long groupId;
        private String content;
        private PostVisibility visibility;
        private Integer commentCount;
        private Integer reactionCount;
        private Integer shareCount;
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
}


