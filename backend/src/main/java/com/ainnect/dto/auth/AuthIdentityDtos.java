package com.ainnect.dto.auth;

import com.ainnect.common.enums.AuthProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class AuthIdentityDtos {
	@Getter
	public static class CreateRequest {
		@NotNull
		private Long userId;

		@NotNull
		private AuthProvider provider;

		@NotBlank
		@Size(max = 255)
		private String providerUid;

		private String metaJson;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class Response {
		private Long id;
		private Long userId;
		private AuthProvider provider;
		private String providerUid;
		private String metaJson;
	}
}
