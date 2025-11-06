package com.ainnect.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "group_join_answers")
public class GroupJoinAnswer {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "join_request_id", nullable = false)
	private GroupJoinRequest joinRequest;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "question_id", nullable = false)
	private GroupJoinQuestion question;

	@Column(name = "answer", length = 1000, nullable = false)
	private String answer;
}

