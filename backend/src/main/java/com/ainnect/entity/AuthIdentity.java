package com.ainnect.entity;

import com.ainnect.common.enums.AuthProvider;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "auth_identities")
public class AuthIdentity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "provider", nullable = false)
	private AuthProvider provider;

	@Column(name = "provider_uid", length = 255, nullable = false)
	private String providerUid;

	@Column(name = "meta_json", columnDefinition = "TEXT")
	private String metaJson;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
