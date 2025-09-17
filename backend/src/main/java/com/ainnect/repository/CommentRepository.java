package com.ainnect.repository;

import com.ainnect.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
	List<Comment> findByPost_Id(Long postId);
	List<Comment> findByParent_Id(Long parentId);
}

