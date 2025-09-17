package com.ainnect.dto.comment;

import com.ainnect.common.enums.ReactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

public class CommentDtos {
	@Getter
	public static class ReplyRequest {
		@NotNull
		private Long authorId;
		@NotBlank
		@Size(max = 5000)
		private String content;
	}

	@Getter
	public static class ReactionRequest {
		@NotNull
		private Long userId;
		@NotNull
		private ReactionType type;
	}
}


