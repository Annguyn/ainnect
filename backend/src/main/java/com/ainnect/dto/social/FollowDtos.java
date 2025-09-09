package com.ainnect.dto.social;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class FollowDtos {
	@Getter
	public static class FollowRequest {
		@NotNull
		private Long followerId;
		@NotNull
		private Long followeeId;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class FollowResponse {
		private Long followerId;
		private Long followeeId;
	}
}
