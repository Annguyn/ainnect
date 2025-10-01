package com.ainnect.repository;

import com.ainnect.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

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
	
	// Privacy-aware queries
	@EntityGraph(attributePaths = {"author", "group"})
	@Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL AND " +
		   "(p.visibility = 'public_' OR " +
		   "(p.visibility = 'friends' AND p.author.id IN " +
		   "(SELECT f.followee.id FROM Follow f WHERE f.follower.id = :currentUserId)) OR " +
		   "(p.visibility = 'private_' AND p.author.id = :currentUserId) OR " +
		   "(p.visibility = 'group' AND p.group.id IN " +
		   "(SELECT gm.group.id FROM GroupMember gm WHERE gm.user.id = :currentUserId))) " +
		   "ORDER BY p.createdAt DESC")
	Page<Post> findVisiblePostsForUser(@Param("currentUserId") Long currentUserId, Pageable pageable);
	
    @EntityGraph(attributePaths = {"author", "group", "media"})
	@Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL AND p.author.id = :authorId AND " +
		   "(p.visibility = 'public_' OR " +
		   "(p.visibility = 'friends' AND p.author.id IN " +
		   "(SELECT f.followee.id FROM Follow f WHERE f.follower.id = :currentUserId)) OR " +
		   "(p.visibility = 'private_' AND p.author.id = :currentUserId)) " +
		   "ORDER BY p.createdAt DESC")
	Page<Post> findVisiblePostsByAuthor(@Param("authorId") Long authorId, @Param("currentUserId") Long currentUserId, Pageable pageable);
	
	/**
	 * Search posts by content with privacy filtering
	 */
	@EntityGraph(attributePaths = {"author", "group", "media"})
	@Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL AND " +
		   "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
		   "(p.visibility = 'public_' OR " +
		   "(p.visibility = 'friends' AND p.author.id IN " +
		   "(SELECT f.followee.id FROM Follow f WHERE f.follower.id = :currentUserId)) OR " +
		   "(p.visibility = 'private_' AND p.author.id = :currentUserId) OR " +
		   "(p.visibility = 'group' AND p.group.id IN " +
		   "(SELECT gm.group.id FROM GroupMember gm WHERE gm.user.id = :currentUserId))) " +
		   "ORDER BY p.createdAt DESC")
	Page<Post> searchPosts(@Param("keyword") String keyword, @Param("currentUserId") Long currentUserId, Pageable pageable);
	
	// Additional methods for profile
    @EntityGraph(attributePaths = {"author", "group", "media"})
    @Query("SELECT p FROM Post p WHERE p.author.id = :authorId AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
	List<Post> findLatestPostsByAuthor(@Param("authorId") Long authorId, Pageable pageable);
	
	long countByAuthor_IdAndDeletedAtIsNull(Long authorId);
}

