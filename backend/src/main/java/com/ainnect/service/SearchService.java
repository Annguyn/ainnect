package com.ainnect.service;

import com.ainnect.dto.search.SearchDtos;
import org.springframework.data.domain.Pageable;

public interface SearchService {
    

    SearchDtos.SearchResponse searchAll(String keyword, Long currentUserId, Pageable pageable);
    

    SearchDtos.UserSearchResponse searchUsers(String keyword, Long currentUserId, Pageable pageable);
    

    SearchDtos.GroupSearchResponse searchGroups(String keyword, Long currentUserId, Pageable pageable);

    SearchDtos.PostSearchResponse searchPosts(String keyword, Long currentUserId, Pageable pageable);
}
