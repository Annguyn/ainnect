package com.ainnect.entity;

import com.ainnect.common.enums.FriendshipStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "friendships")
public class Friendship {
	@EmbeddedId
	private FriendshipId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("userIdLow")
	@JoinColumn(name = "user_id_low", nullable = false)
	private User userLow;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("userIdHigh")
	@JoinColumn(name = "user_id_high", nullable = false)
	private User userHigh;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private FriendshipStatus status;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "requested_by", nullable = false)
	private User requestedBy;

	@Column(name = "responded_at")
	private LocalDateTime respondedAt;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
