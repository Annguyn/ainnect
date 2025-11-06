package com.ainnect.entity;

import com.ainnect.common.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", columnDefinition = "BIGINT")
	private Long id;

	@Column(name = "username", length = 50, nullable = false, unique = true)
	private String username;

	@Column(name = "email", length = 255, nullable = false, unique = true)
	private String email;

	@Column(name = "phone", length = 20)
	private String phone;

	@Column(name = "password_hash", length = 255, nullable = false)
	private String passwordHash;

	@Column(name = "display_name", length = 100, nullable = false)
	private String displayName;

	@Column(name = "avatar_url", length = 500)
	private String avatarUrl;

	@Column(name = "cover_url", length = 500)
	private String coverUrl;

	@Column(name = "bio", length = 500)
	private String bio;

	@Enumerated(EnumType.STRING)
	@Column(name = "gender")
	private Gender gender;

	@Column(name = "birthday")
	private LocalDate birthday;

	@Column(name = "location", length = 255)
	private String location;

	@Column(name = "is_active", nullable = false)
	private Boolean isActive = true;

	@Column(name = "created_at", nullable = false, updatable = false)
	@org.hibernate.annotations.CreationTimestamp
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	@org.hibernate.annotations.UpdateTimestamp
	private LocalDateTime updatedAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	@OneToMany(mappedBy = "user")
	private Set<UserRole> userRoles = new HashSet<>();
}
