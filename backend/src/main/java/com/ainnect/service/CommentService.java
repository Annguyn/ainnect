package com.ainnect.service;

import com.ainnect.dto.comment.CommentDtos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
	Page<CommentDtos.Response> listByPost(Long postId, Pageable pageable);
	CommentDtos.PaginatedResponse listByPostWithPagination(Long postId, int page, int size);

	Page<CommentDtos.Response> listReplies(Long commentId, Pageable pageable);
	CommentDtos.PaginatedResponse listRepliesWithPagination(Long commentId, int page, int size);

	Long replyToComment(Long commentId, CommentDtos.ReplyRequest request, Long authorId);

	void reactToComment(Long commentId, CommentDtos.ReactionRequest request, Long userId);

	void unreactToComment(Long commentId, Long userId);

	void deleteComment(Long commentId, Long userId);
}


