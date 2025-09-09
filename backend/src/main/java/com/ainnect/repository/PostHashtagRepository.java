package com.ainnect.repository;

import com.ainnect.entity.PostHashtag;
import com.ainnect.entity.PostHashtagId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostHashtagRepository extends JpaRepository<PostHashtag, PostHashtagId> {
	List<PostHashtag> findByPost_Id(Long postId);
}
