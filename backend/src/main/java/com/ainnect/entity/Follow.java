package com.ainnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "follows")
public class Follow {
	@EmbeddedId
	private FollowId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("followerId")
	@JoinColumn(name = "follower_id", nullable = false)
	private User follower;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("followeeId")
	@JoinColumn(name = "followee_id", nullable = false)
	private User followee;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
