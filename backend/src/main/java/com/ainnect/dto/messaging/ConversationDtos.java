package com.ainnect.dto.messaging;

import com.ainnect.common.enums.ConversationMemberRole;
import com.ainnect.common.enums.ConversationType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

public class ConversationDtos {
	@Getter
	public static class CreateRequest {
		@NotNull
		private Long createdBy;
		@NotNull
		private ConversationType type;
		@Size(max = 200)
		private String title;
		@NotEmpty
		private List<Long> memberIds;
	}

	@Getter
	public static class AddMemberRequest {
		@NotNull
		private Long userId;
		private ConversationMemberRole role = ConversationMemberRole.member;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class ConversationResponse {
		private Long id;
		private ConversationType type;
		private String title;
	}
}
