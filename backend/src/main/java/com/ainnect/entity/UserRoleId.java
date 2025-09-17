package com.ainnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class UserRoleId implements Serializable {
	@Column(name = "user_id", columnDefinition = "BIGINT")
	private Long userId;

	@Column(name = "role_id", columnDefinition = "SMALLINT")
	private Short roleId;
}
