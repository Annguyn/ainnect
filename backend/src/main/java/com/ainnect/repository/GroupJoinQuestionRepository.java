package com.ainnect.repository;

import com.ainnect.entity.GroupJoinQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupJoinQuestionRepository extends JpaRepository<GroupJoinQuestion, Long> {
	
	@Query("SELECT q FROM GroupJoinQuestion q WHERE q.group.id = :groupId AND q.deletedAt IS NULL ORDER BY q.displayOrder ASC")
	List<GroupJoinQuestion> findByGroupId(@Param("groupId") Long groupId);
	
	@Query("SELECT q FROM GroupJoinQuestion q WHERE q.group.id = :groupId AND q.isRequired = true AND q.deletedAt IS NULL ORDER BY q.displayOrder ASC")
	List<GroupJoinQuestion> findRequiredQuestionsByGroupId(@Param("groupId") Long groupId);
	
	void deleteByGroupId(Long groupId);
}

