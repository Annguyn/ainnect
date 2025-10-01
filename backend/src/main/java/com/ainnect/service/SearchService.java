package com.ainnect.service;

import com.ainnect.dto.search.SearchDtos;
import org.springframework.data.domain.Pageable;

public interface SearchService {
    
    /**
     * Search across all types (users, groups, posts)
     */
    SearchDtos.SearchResponse searchAll(String keyword, Long currentUserId, Pageable pageable);
    
    /**
     * Search users only
     */
    SearchDtos.UserSearchResponse searchUsers(String keyword, Long currentUserId, Pageable pageable);
    
    /**
     * Search groups/communities only
     */
    SearchDtos.GroupSearchResponse searchGroups(String keyword, Long currentUserId, Pageable pageable);
    
    /**
     * Search posts only (with privacy filtering)
     */
    SearchDtos.PostSearchResponse searchPosts(String keyword, Long currentUserId, Pageable pageable);
}
