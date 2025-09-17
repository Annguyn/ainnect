package com.ainnect.repository;

import com.ainnect.entity.User;
import com.ainnect.entity.UserMention;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserMentionRepository extends JpaRepository<UserMention, Long> {
	
	// Lấy danh sách mention của một user
	Page<UserMention> findByMentionedOrderByCreatedAtDesc(User mentioned, Pageable pageable);
	
	// Lấy danh sách user được mention trong một target cụ thể
	List<UserMention> findByTargetTypeAndTargetId(String targetType, Long targetId);
	
	// Lấy danh sách mention mà user đã tạo
	Page<UserMention> findByMentionerOrderByCreatedAtDesc(User mentioner, Pageable pageable);
	
	// Kiểm tra xem user có được mention trong target không
	boolean existsByMentionedAndTargetTypeAndTargetId(User mentioned, String targetType, Long targetId);
	
	// Lấy danh sách user được mention trong một post
	@Query("SELECT um.mentioned FROM UserMention um WHERE um.targetType = 'POST' AND um.targetId = :postId")
	List<User> findMentionedUsersInPost(@Param("postId") Long postId);
	
	// Lấy danh sách user được mention trong một comment
	@Query("SELECT um.mentioned FROM UserMention um WHERE um.targetType = 'COMMENT' AND um.targetId = :commentId")
	List<User> findMentionedUsersInComment(@Param("commentId") Long commentId);
	
	// Đếm số lần user được mention
	long countByMentioned(User mentioned);
}
