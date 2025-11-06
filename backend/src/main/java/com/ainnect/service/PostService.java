package com.ainnect.service;

import com.ainnect.dto.comment.CommentDtos;
import com.ainnect.dto.post.PostDtos;
import com.ainnect.dto.reaction.ReactionDtos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {
	PostDtos.Response create(PostDtos.CreateRequest request, Long authorId);

	PostDtos.Response update(Long postId, PostDtos.UpdateRequest request);

	void delete(Long postId);

	PostDtos.Response getById(Long postId);

	PostDtos.Response getByIdForUser(Long postId, Long currentUserId);

	Page<PostDtos.Response> getFeed(Pageable pageable);

	Page<PostDtos.Response> listByAuthor(Long authorId, Pageable pageable);
	
	// Privacy-aware methods
	Page<PostDtos.Response> getFeedForUser(Long currentUserId, Pageable pageable);
	
	Page<PostDtos.Response> listByAuthorForUser(Long authorId, Long currentUserId, Pageable pageable);

	// Comments
	Long addComment(Long postId, PostDtos.CommentCreateRequest request, Long authorId);

	Page<CommentDtos.Response> listComments(Long postId, Pageable pageable);
	CommentDtos.PaginatedResponse listCommentsWithPagination(Long postId, int page, int size);

	// Reactions
	void reactToPost(Long postId, PostDtos.ReactionRequest request, Long userId);

	void unreactToPost(Long postId, Long userId);
	
	Page<ReactionDtos.ReactionResponse> getPostReactions(Long postId, Pageable pageable);

	// Share
	Long sharePost(Long postId, PostDtos.ShareRequest request, Long userId);
	
	// Group posts
	PostDtos.Response createGroupPost(Long groupId, PostDtos.CreateRequest request, Long authorId);
	
	Page<PostDtos.Response> getGroupPosts(Long groupId, Long currentUserId, Pageable pageable);
}


