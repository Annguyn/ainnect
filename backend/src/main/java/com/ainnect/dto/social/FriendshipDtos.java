package com.ainnect.dto.social;

import com.ainnect.common.enums.FriendshipStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class FriendshipDtos {
	@Getter
	public static class RequestFriendshipRequest {
		@NotNull
		private Long requesterId;
		@NotNull
		private Long otherUserId;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class FriendshipResponse {
		private Long userIdLow;
		private Long userIdHigh;
		private FriendshipStatus status;
		private Long requestedBy;
	}
}
