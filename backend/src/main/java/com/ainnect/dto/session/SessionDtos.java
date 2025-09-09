package com.ainnect.dto.session;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class SessionDtos {
	@Getter
	public static class CreateRequest {
		@NotNull
		private Long userId;

		@NotBlank
		@Size(min = 64, max = 64)
		private String refreshTokenHash;

		@Size(max = 255)
		private String userAgent;

		@Size(max = 45)
		private String ip;

		@NotNull
		@Future
		private LocalDateTime expiresAt;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class Response {
		private Long id;
		private Long userId;
		private String refreshTokenHash;
		private String userAgent;
		private String ip;
		private LocalDateTime expiresAt;
	}
}
