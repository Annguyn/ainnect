package com.ainnect.repository;

import com.ainnect.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface PostRepository extends JpaRepository<Post, Long> {
    @EntityGraph(attributePaths = {"author", "group", "media"})
	@NonNull
	Optional<Post> findById(@NonNull Long id);
    @EntityGraph(attributePaths = {"author", "group", "media"})
	List<Post> findByAuthor_Id(Long authorId);
	
    @EntityGraph(attributePaths = {"author", "group", "media"})
	Page<Post> findByAuthor_IdAndDeletedAtIsNull(Long authorId, Pageable pageable);
	
    @EntityGraph(attributePaths = {"author", "group", "media"})
	List<Post> findByGroup_Id(Long groupId);
	
	@EntityGraph(attributePaths = {"author", "group"})
	@Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL ORDER BY p.createdAt DESC")
	Page<Post> findAllActivePosts(Pageable pageable);
	
	@EntityGraph(attributePaths = {"author", "group"})
	@Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL " +
	   "AND p.author.id NOT IN (SELECT ub.blocked.id FROM UserBlock ub WHERE ub.blocker.id = :currentUserId) " +
	   "AND p.author.id NOT IN (SELECT ub.blocker.id FROM UserBlock ub WHERE ub.blocked.id = :currentUserId) " +
	   "AND (p.visibility = 'public_' OR " +
	   "(p.visibility = 'friends' AND EXISTS (" +
	   "  SELECT 1 FROM Friendship fr " +
	   "  WHERE fr.status = com.ainnect.common.enums.FriendshipStatus.accepted " +
	   "    AND ((fr.userLow.id = :currentUserId AND fr.userHigh.id = p.author.id) " +
	   "      OR (fr.userHigh.id = :currentUserId AND fr.userLow.id = p.author.id))" +
	   ")) OR " +
	   "(p.visibility = 'private_' AND p.author.id = :currentUserId) OR " +
	   "(p.visibility = 'group' AND p.group.id IN (" +
	   "  SELECT gm.group.id FROM GroupMember gm WHERE gm.user.id = :currentUserId))) " +
	   "ORDER BY p.createdAt DESC")
	Page<Post> findVisiblePostsForUser(@Param("currentUserId") Long currentUserId, Pageable pageable);
	
    @EntityGraph(attributePaths = {"author", "group", "media"})
	@Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL AND p.author.id = :authorId " +
	   "AND :currentUserId NOT IN (SELECT ub.blocker.id FROM UserBlock ub WHERE ub.blocked.id = :authorId) " +
	   "AND :currentUserId NOT IN (SELECT ub.blocked.id FROM UserBlock ub WHERE ub.blocker.id = :authorId) " +
	   "AND (p.visibility = 'public_' OR " +
	   "(p.visibility = 'friends' AND EXISTS (" +
	   "  SELECT 1 FROM Friendship fr " +
	   "  WHERE fr.status = com.ainnect.common.enums.FriendshipStatus.accepted " +
	   "    AND ((fr.userLow.id = :currentUserId AND fr.userHigh.id = :authorId) " +
	   "      OR (fr.userHigh.id = :currentUserId AND fr.userLow.id = :authorId))" +
	   ")) OR " +
	   "(p.visibility = 'private_' AND p.author.id = :currentUserId)) " +
	   "ORDER BY p.createdAt DESC")
	Page<Post> findVisiblePostsByAuthor(@Param("authorId") Long authorId, @Param("currentUserId") Long currentUserId, Pageable pageable);
	
	/**
	 * Search posts by content with privacy filtering
	 */
	@EntityGraph(attributePaths = {"author", "group", "media"})
	@Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL " +
	   "AND p.author.id NOT IN (SELECT ub.blocked.id FROM UserBlock ub WHERE ub.blocker.id = :currentUserId) " +
	   "AND p.author.id NOT IN (SELECT ub.blocker.id FROM UserBlock ub WHERE ub.blocked.id = :currentUserId) " +
	   "AND LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
	   "(p.visibility = 'public_' OR " +
	   "(p.visibility = 'friends' AND EXISTS (" +
	   "  SELECT 1 FROM Friendship fr " +
	   "  WHERE fr.status = com.ainnect.common.enums.FriendshipStatus.accepted " +
	   "    AND ((fr.userLow.id = :currentUserId AND fr.userHigh.id = p.author.id) " +
	   "      OR (fr.userHigh.id = :currentUserId AND fr.userLow.id = p.author.id))" +
	   ")) OR " +
	   "(p.visibility = 'private_' AND p.author.id = :currentUserId) OR " +
	   "(p.visibility = 'group' AND p.group.id IN (" +
	   "  SELECT gm.group.id FROM GroupMember gm WHERE gm.user.id = :currentUserId))) " +
	   "ORDER BY p.createdAt DESC")
	Page<Post> searchPosts(@Param("keyword") String keyword, @Param("currentUserId") Long currentUserId, Pageable pageable);
	
	// Additional methods for profile
    @EntityGraph(attributePaths = {"author", "group", "media"})
    @Query("SELECT p FROM Post p WHERE p.author.id = :authorId AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
	List<Post> findLatestPostsByAuthor(@Param("authorId") Long authorId, Pageable pageable);
	
	long countByAuthor_IdAndDeletedAtIsNull(Long authorId);
	
	@EntityGraph(attributePaths = {"author", "media"})
	Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
	
	@EntityGraph(attributePaths = {"author", "media"})
	Page<Post> findByAuthor_IdOrderByCreatedAtDesc(Long authorId, Pageable pageable);
	
	Long countByAuthorId(Long authorId);
	
	@Query("SELECT COUNT(p) FROM Post p WHERE p.group.id = :communityId AND p.deletedAt IS NULL")
	Long countByCommunityId(@Param("communityId") Long communityId);
	
	@Query("SELECT COUNT(p) FROM Post p WHERE p.createdAt >= :since AND p.deletedAt IS NULL")
	Long countNewPostsSince(@Param("since") java.time.LocalDateTime since);
	
	@Query("SELECT DATE(p.createdAt) as date, COUNT(p) as count FROM Post p " +
		   "WHERE p.createdAt >= :since AND p.deletedAt IS NULL " +
		   "GROUP BY DATE(p.createdAt) " +
		   "ORDER BY DATE(p.createdAt)")
	java.util.List<Object[]> getPostGrowthStats(@Param("since") java.time.LocalDateTime since);
}

