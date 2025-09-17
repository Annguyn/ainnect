package com.ainnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roles")
public class Role {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", columnDefinition = "SMALLINT")
	private Short id;

	@Column(name = "code", length = 30, nullable = false, unique = true)
	private String code;

	@Column(name = "name", length = 50, nullable = false)
	private String name;

	@OneToMany(mappedBy = "role")
	private Set<UserRole> userRoles = new HashSet<>();
}
