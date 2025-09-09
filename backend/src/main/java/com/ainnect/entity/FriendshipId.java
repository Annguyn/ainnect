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
public class FriendshipId implements Serializable {
	@Column(name = "user_id_low")
	private Long userIdLow;

	@Column(name = "user_id_high")
	private Long userIdHigh;
}
