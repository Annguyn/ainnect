package com.ainnect.dto.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class RoleDtos {
	@Getter
	public static class CreateOrUpdateRequest {
		@NotBlank
		@Size(max = 30)
		private String code;

		@NotBlank
		@Size(max = 50)
		private String name;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class Response {
		private Short id;
		private String code;
		private String name;
	}
}
