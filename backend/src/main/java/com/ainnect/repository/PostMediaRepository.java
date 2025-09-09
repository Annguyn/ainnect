package com.ainnect.repository;

import com.ainnect.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
	List<PostMedia> findByPost_Id(Long postId);
}
