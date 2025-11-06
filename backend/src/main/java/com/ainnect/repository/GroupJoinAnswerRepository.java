package com.ainnect.repository;

import com.ainnect.entity.GroupJoinAnswer;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupJoinAnswerRepository extends JpaRepository<GroupJoinAnswer, Long> {
	
	@EntityGraph(attributePaths = {"question"})
	@Query("SELECT a FROM GroupJoinAnswer a WHERE a.joinRequest.id = :joinRequestId")
	List<GroupJoinAnswer> findByJoinRequestId(@Param("joinRequestId") Long joinRequestId);
	
	void deleteByJoinRequestId(Long joinRequestId);
}

