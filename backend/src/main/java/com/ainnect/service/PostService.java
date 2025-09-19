package com.ainnect.service;

import com.ainnect.dto.post.PostDtos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {
	PostDtos.Response create(PostDtos.CreateRequest request, Long authorId);

	PostDtos.Response update(Long postId, PostDtos.UpdateRequest request);

	void delete(Long postId);

	PostDtos.Response getById(Long postId);

	Page<PostDtos.Response> getFeed(Pageable pageable);

	Page<PostDtos.Response> listByAuthor(Long authorId, Pageable pageable);

	// Comments
	Long addComment(Long postId, PostDtos.CommentCreateRequest request, Long authorId);

	Page<com.ainnect.entity.Comment> listComments(Long postId, Pageable pageable);

	// Reactions
	void reactToPost(Long postId, PostDtos.ReactionRequest request, Long userId);

	void unreactToPost(Long postId, Long userId);

	// Share
	Long sharePost(Long postId, PostDtos.ShareRequest request, Long userId);
}


