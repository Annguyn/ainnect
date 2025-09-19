package com.ainnect.repository;

import com.ainnect.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
	@EntityGraph(attributePaths = {"author", "group"})
	Optional<Post> findById(Long id);
	@EntityGraph(attributePaths = {"author", "group"})
	List<Post> findByAuthor_Id(Long authorId);
	
	@EntityGraph(attributePaths = {"author", "group"})
	List<Post> findByGroup_Id(Long groupId);
	
	@EntityGraph(attributePaths = {"author", "group"})
	@Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL ORDER BY p.createdAt DESC")
	Page<Post> findAllActivePosts(Pageable pageable);
}

