package com.ainnect.repository;

import com.ainnect.common.enums.GroupMemberRole;
import com.ainnect.entity.GroupMember;
import com.ainnect.entity.GroupMemberId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
	List<GroupMember> findByGroup_Id(Long groupId);
	List<GroupMember> findByUser_Id(Long userId);
	boolean existsByGroupIdAndUserId(Long groupId, Long userId);
	boolean existsByGroupIdAndUserIdAndRole(Long groupId, Long userId, GroupMemberRole role);
	int countByGroupId(Long groupId);

	@Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId ORDER BY gm.joinedAt DESC")
	Page<GroupMember> findByGroupId(@Param("groupId") Long groupId, Pageable pageable);
	

	@Query("SELECT gm FROM GroupMember gm WHERE gm.user.id = :userId ORDER BY gm.joinedAt DESC")
	Page<GroupMember> findByUserId(@Param("userId") Long userId, Pageable pageable);
	

	Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
	

	void deleteByGroupIdAndUserId(Long groupId, Long userId);
	
	Long countByUserId(Long userId);
	
	@Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :communityId")
	Long countByCommunityId(@Param("communityId") Long communityId);
}

