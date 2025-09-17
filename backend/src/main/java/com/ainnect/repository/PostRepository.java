package com.ainnect.repository;

import com.ainnect.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
	List<Post> findByAuthor_Id(Long authorId);
	List<Post> findByGroup_Id(Long groupId);
}

