package com.ainnect.dto.comment;

import com.ainnect.common.enums.ReactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class CommentDtos {
	@Getter
	public static class ReplyRequest {
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
	@Builder
	@AllArgsConstructor
	public static class Response {
		private Long id;
		private Long postId;
		private Long authorId;
		private String authorUsername;
		private String authorDisplayName;
		private String authorAvatarUrl;
		private Long parentId;
		private String content;
		private Integer reactionCount;
		private boolean hasChild;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class PaginatedResponse {
		private java.util.List<Response> comments;
		private int currentPage;
		private int pageSize;
		private long totalElements;
		private int totalPages;
		private boolean hasNext;
		private boolean hasPrevious;
	}
}


