package com.ainnect.dto.reaction;

import com.ainnect.common.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

public class ReactionDtos {
	
	@Getter
	@Builder
	@AllArgsConstructor
	public static class ReactionResponse {
		private Long id;
		private ReactionType type;
		private Long userId;
		private String username;
		private String displayName;
		private String avatarUrl;
		private LocalDateTime createdAt;
	}
	
	@Getter
	@Builder
	@AllArgsConstructor
	public static class ReactionSummary {
		private Integer totalCount;
		private List<ReactionTypeCount> reactionCounts;
		private List<ReactionResponse> recentReactions; 
		private Boolean currentUserReacted;
		private ReactionType currentUserReactionType;
	}
	
	@Getter
	@Builder
	@AllArgsConstructor
	public static class ReactionTypeCount {
		private ReactionType type;
		private Integer count;
	}
}

