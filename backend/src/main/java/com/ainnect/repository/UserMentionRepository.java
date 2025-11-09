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
	
	Page<UserMention> findByMentionedOrderByCreatedAtDesc(User mentioned, Pageable pageable);
	
	List<UserMention> findByTargetTypeAndTargetId(String targetType, Long targetId);
	
	Page<UserMention> findByMentionerOrderByCreatedAtDesc(User mentioner, Pageable pageable);
	
	boolean existsByMentionedAndTargetTypeAndTargetId(User mentioned, String targetType, Long targetId);
	
	@Query("SELECT um.mentioned FROM UserMention um WHERE um.targetType = 'POST' AND um.targetId = :postId")
	List<User> findMentionedUsersInPost(@Param("postId") Long postId);
	
	@Query("SELECT um.mentioned FROM UserMention um WHERE um.targetType = 'COMMENT' AND um.targetId = :commentId")
	List<User> findMentionedUsersInComment(@Param("commentId") Long commentId);
	
	long countByMentioned(User mentioned);
}
