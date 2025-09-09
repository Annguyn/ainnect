package com.ainnect.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post_hashtags")
public class PostHashtag {
	@EmbeddedId
	private PostHashtagId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("postId")
	@JoinColumn(name = "post_id", nullable = false)
	private Post post;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("hashtagId")
	@JoinColumn(name = "hashtag_id", nullable = false)
	private Hashtag hashtag;
}
