package com.ainnect.entity;

import com.ainnect.common.enums.ReportReason;
import com.ainnect.common.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reports")
public class Report {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reporter_id", nullable = false, columnDefinition = "BIGINT")
	private User reporter;

	@Column(name = "target_type", length = 50, nullable = false)
	private String targetType; // POST, COMMENT, USER

	@Column(name = "target_id", nullable = false)
	private Long targetId;

	@Enumerated(EnumType.STRING)
	@Column(name = "reason", nullable = false)
	private ReportReason reason;

	@Column(name = "description", length = 1000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private ReportStatus status = ReportStatus.PENDING;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reviewed_by", columnDefinition = "BIGINT")
	private User reviewedBy;

	@Column(name = "reviewed_at")
	private LocalDateTime reviewedAt;

	@Column(name = "admin_note", length = 500)
	private String adminNote;

	@Column(name = "created_at", nullable = false, updatable = false)
	@org.hibernate.annotations.CreationTimestamp
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	@org.hibernate.annotations.UpdateTimestamp
	private LocalDateTime updatedAt;
}
