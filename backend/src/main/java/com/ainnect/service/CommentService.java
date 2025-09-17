package com.ainnect.service;

import com.ainnect.dto.comment.CommentDtos;
import com.ainnect.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
	Page<Comment> listByPost(Long postId, Pageable pageable);

	Page<Comment> listReplies(Long commentId, Pageable pageable);

	Long replyToComment(Long commentId, CommentDtos.ReplyRequest request);

	void reactToComment(Long commentId, CommentDtos.ReactionRequest request);

	void unreactToComment(Long commentId, Long userId);
}


