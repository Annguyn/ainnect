package com.ainnect.dto.device;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class UserDeviceDtos {
	@Getter
	public static class RegisterRequest {
		@NotNull
		private Long userId;

		@NotBlank
		@Size(max = 100)
		private String deviceId;

		@Size(max = 255)
		private String deviceInfo;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class Response {
		private Long id;
		private Long userId;
		private String deviceId;
		private String deviceInfo;
	}
}
