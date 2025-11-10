package com.ainnect.repository;

import com.ainnect.entity.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
	@EntityGraph(attributePaths = {"post", "author", "parent"})
	@NonNull
	Optional<Comment> findById(@NonNull Long id);
	
	@EntityGraph(attributePaths = {"post", "author", "parent"})
	List<Comment> findByPost_Id(Long postId);

	@EntityGraph(attributePaths = {"post", "author", "parent"})
	List<Comment> findByPost_IdAndParentIsNullOrderByCreatedAtDesc(Long postId);
	
	@EntityGraph(attributePaths = {"post", "author", "parent"})
	List<Comment> findByParent_Id(Long parentId);

	boolean existsByParent_Id(Long parentId);
}

