package com.ainnect.repository;

import com.ainnect.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShareRepository extends JpaRepository<Share, Long> {
	List<Share> findByPost_Id(Long postId);
	List<Share> findByByUser_Id(Long userId);
}

