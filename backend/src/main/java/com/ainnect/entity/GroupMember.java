package com.ainnect.entity;

import com.ainnect.common.enums.GroupMemberRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "group_members")
public class GroupMember {
	@EmbeddedId
	private GroupMemberId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("groupId")
	@JoinColumn(name = "group_id", nullable = false)
	private Community group;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("userId")
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false)
	private GroupMemberRole role = GroupMemberRole.member;

	@Column(name = "joined_at", nullable = false)
	private LocalDateTime joinedAt;
}

