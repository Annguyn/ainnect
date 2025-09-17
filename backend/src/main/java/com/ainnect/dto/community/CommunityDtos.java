package com.ainnect.dto.community;

import com.ainnect.common.enums.Privacy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class CommunityDtos {
	@Getter
	public static class CreateRequest {
		@NotNull
		private Long ownerId;
		@NotBlank
		@Size(max = 120)
		private String name;
		@Size(max = 500)
		private String description;
		private Privacy privacy = Privacy.public_;
	}

	@Getter
	public static class UpdateRequest {
		@NotBlank
		@Size(max = 120)
		private String name;
		@Size(max = 500)
		private String description;
		private Privacy privacy = Privacy.public_;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class Response {
		private Long id;
		private Long ownerId;
		private String name;
		private String description;
		private Privacy privacy;
	}
}

