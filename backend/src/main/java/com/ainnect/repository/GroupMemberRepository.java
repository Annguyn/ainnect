package com.ainnect.repository;

import com.ainnect.entity.GroupMember;
import com.ainnect.entity.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
	List<GroupMember> findByGroup_Id(Long groupId);
	List<GroupMember> findByUser_Id(Long userId);
}

