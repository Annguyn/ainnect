package com.ainnect.repository;

import com.ainnect.entity.Post;
import com.ainnect.entity.PostBookmark;
import com.ainnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {
	
	boolean existsByUserAndPost(User user, Post post);
	
	Optional<PostBookmark> findByUserAndPost(User user, Post post);
	
	Page<PostBookmark> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
	
	@Query("SELECT pb.post FROM PostBookmark pb WHERE pb.user = :user ORDER BY pb.createdAt DESC")
	Page<Post> findBookmarkedPostsByUser(@Param("user") User user, Pageable pageable);
	long countByPost(Post post);
	
	long countByUser(User user);
	
	@Query("SELECT pb.user FROM PostBookmark pb WHERE pb.post = :post ORDER BY pb.createdAt DESC")
	List<User> findUsersByPost(@Param("post") Post post);
}
