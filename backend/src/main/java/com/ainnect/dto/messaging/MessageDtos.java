package com.ainnect.dto.messaging;

import com.ainnect.common.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class MessageDtos {
	@Getter
	public static class SendRequest {
		@NotNull
		private Long conversationId;
		@NotNull
		private Long senderId;
		private String content;
		private MessageType messageType = MessageType.text;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class MessageResponse {
		private Long id;
		private Long conversationId;
		private Long senderId;
		private String content;
		private MessageType messageType;
	}
}

