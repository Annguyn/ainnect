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
	
	// Kiểm tra user đã bookmark post chưa
	boolean existsByUserAndPost(User user, Post post);
	
	// Tìm bookmark của user cho một post cụ thể
	Optional<PostBookmark> findByUserAndPost(User user, Post post);
	
	// Lấy danh sách bookmark của user
	Page<PostBookmark> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
	
	// Lấy danh sách post đã bookmark bởi user
	@Query("SELECT pb.post FROM PostBookmark pb WHERE pb.user = :user ORDER BY pb.createdAt DESC")
	Page<Post> findBookmarkedPostsByUser(@Param("user") User user, Pageable pageable);
	
	// Đếm số bookmark của một post
	long countByPost(Post post);
	
	// Đếm số bookmark của user
	long countByUser(User user);
	
	// Lấy danh sách user đã bookmark một post
	@Query("SELECT pb.user FROM PostBookmark pb WHERE pb.post = :post ORDER BY pb.createdAt DESC")
	List<User> findUsersByPost(@Param("post") Post post);
}
