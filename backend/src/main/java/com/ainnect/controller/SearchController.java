package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.search.SearchDtos;
import com.ainnect.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final JwtUtil jwtUtil;

   
    @GetMapping
    public ResponseEntity<ApiResponse<SearchDtos.SearchResponse>> searchAll(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.<SearchDtos.SearchResponse>builder()
                                .result("ERROR")
                                .message("Từ khóa tìm kiếm không được để trống")
                                .data(null)
                                .build());
            }
            Long currentUserId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            
            SearchDtos.SearchResponse response = searchService.searchAll(keyword, currentUserId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<SearchDtos.SearchResponse>builder()
                    .result("SUCCESS")
                    .message("Search completed successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<SearchDtos.SearchResponse>builder()
                            .result("ERROR")
                            .message("Search failed: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }


    @GetMapping("/users")
    public ResponseEntity<ApiResponse<SearchDtos.UserSearchResponse>> searchUsers(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.<SearchDtos.UserSearchResponse>builder()
                                .result("ERROR")
                                .message("Từ khóa tìm kiếm không được để trống")
                                .data(null)
                                .build());
            }
            Long currentUserId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            
            SearchDtos.UserSearchResponse response = searchService.searchUsers(keyword, currentUserId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<SearchDtos.UserSearchResponse>builder()
                    .result("SUCCESS")
                    .message("User search completed successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<SearchDtos.UserSearchResponse>builder()
                            .result("ERROR")
                            .message("User search failed: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }


    @GetMapping("/groups")
    public ResponseEntity<ApiResponse<SearchDtos.GroupSearchResponse>> searchGroups(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.<SearchDtos.GroupSearchResponse>builder()
                                .result("ERROR")
                                .message("Từ khóa tìm kiếm không được để trống")
                                .data(null)
                                .build());
            }
            Long currentUserId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            
            SearchDtos.GroupSearchResponse response = searchService.searchGroups(keyword, currentUserId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<SearchDtos.GroupSearchResponse>builder()
                    .result("SUCCESS")
                    .message("Group search completed successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<SearchDtos.GroupSearchResponse>builder()
                            .result("ERROR")
                            .message("Group search failed: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }
    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<SearchDtos.PostSearchResponse>> searchPosts(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.<SearchDtos.PostSearchResponse>builder()
                                .result("ERROR")
                                .message("Từ khóa tìm kiếm không được để trống")
                                .data(null)
                                .build());
            }
            Long currentUserId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            
            SearchDtos.PostSearchResponse response = searchService.searchPosts(keyword, currentUserId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<SearchDtos.PostSearchResponse>builder()
                    .result("SUCCESS")
                    .message("Post search completed successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<SearchDtos.PostSearchResponse>builder()
                            .result("ERROR")
                            .message("Post search failed: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }

    private Long extractUserIdFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}
