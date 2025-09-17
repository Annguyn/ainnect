package com.ainnect.entity;

import com.ainnect.common.enums.ConversationMemberRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "conversation_members")
public class ConversationMember {
	@EmbeddedId
	private ConversationMemberId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("conversationId")
	@JoinColumn(name = "conversation_id", nullable = false)
	private Conversation conversation;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("userId")
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false)
	private ConversationMemberRole role = ConversationMemberRole.member;

	@Column(name = "joined_at", nullable = false)
	private LocalDateTime joinedAt;

	@Column(name = "last_read_message_id")
	private Long lastReadMessageId;
}

