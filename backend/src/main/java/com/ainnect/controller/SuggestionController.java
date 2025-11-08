package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.dto.suggestion.SuggestionDtos;
import com.ainnect.service.SuggestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/suggestions")
@RequiredArgsConstructor
public class SuggestionController {

    private final SuggestionService suggestionService;

    @GetMapping("/schools")
    public ResponseEntity<ApiResponse<SuggestionDtos.SuggestionResponse<SuggestionDtos.SchoolSuggestion>>> suggestSchools(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestHeader("Authorization") String authHeader) {
        try {
            List<SuggestionDtos.SchoolSuggestion> suggestions = suggestionService.suggestSchools(query, limit);
            
            SuggestionDtos.SuggestionResponse<SuggestionDtos.SchoolSuggestion> response = 
                    SuggestionDtos.SuggestionResponse.<SuggestionDtos.SchoolSuggestion>builder()
                            .suggestions(suggestions)
                            .total(suggestions.size())
                            .build();
            
            return ResponseEntity.ok(ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.SchoolSuggestion>>builder()
                    .result("SUCCESS")
                    .message("School suggestions retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting school suggestions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.SchoolSuggestion>>builder()
                            .result("ERROR")
                            .message("Failed to get school suggestions: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<SuggestionDtos.SuggestionResponse<SuggestionDtos.CompanySuggestion>>> suggestCompanies(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestHeader("Authorization") String authHeader) {
        try {
            List<SuggestionDtos.CompanySuggestion> suggestions = suggestionService.suggestCompanies(query, limit);
            
            SuggestionDtos.SuggestionResponse<SuggestionDtos.CompanySuggestion> response = 
                    SuggestionDtos.SuggestionResponse.<SuggestionDtos.CompanySuggestion>builder()
                            .suggestions(suggestions)
                            .total(suggestions.size())
                            .build();
            
            return ResponseEntity.ok(ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.CompanySuggestion>>builder()
                    .result("SUCCESS")
                    .message("Company suggestions retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting company suggestions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.CompanySuggestion>>builder()
                            .result("ERROR")
                            .message("Failed to get company suggestions: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @GetMapping("/interests")
    public ResponseEntity<ApiResponse<SuggestionDtos.SuggestionResponse<SuggestionDtos.InterestSuggestion>>> suggestInterests(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestHeader("Authorization") String authHeader) {
        try {
            List<SuggestionDtos.InterestSuggestion> suggestions = suggestionService.suggestInterests(query, limit);
            
            SuggestionDtos.SuggestionResponse<SuggestionDtos.InterestSuggestion> response = 
                    SuggestionDtos.SuggestionResponse.<SuggestionDtos.InterestSuggestion>builder()
                            .suggestions(suggestions)
                            .total(suggestions.size())
                            .build();
            
            return ResponseEntity.ok(ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.InterestSuggestion>>builder()
                    .result("SUCCESS")
                    .message("Interest suggestions retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting interest suggestions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.InterestSuggestion>>builder()
                            .result("ERROR")
                            .message("Failed to get interest suggestions: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<SuggestionDtos.SuggestionResponse<SuggestionDtos.LocationSuggestion>>> suggestLocations(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestHeader("Authorization") String authHeader) {
        try {
            List<SuggestionDtos.LocationSuggestion> suggestions = suggestionService.suggestLocations(query, limit);
            
            SuggestionDtos.SuggestionResponse<SuggestionDtos.LocationSuggestion> response = 
                    SuggestionDtos.SuggestionResponse.<SuggestionDtos.LocationSuggestion>builder()
                            .suggestions(suggestions)
                            .total(suggestions.size())
                            .build();
            
            return ResponseEntity.ok(ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.LocationSuggestion>>builder()
                    .result("SUCCESS")
                    .message("Location suggestions retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting location suggestions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.LocationSuggestion>>builder()
                            .result("ERROR")
                            .message("Failed to get location suggestions: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @GetMapping("/interest-categories")
    public ResponseEntity<ApiResponse<SuggestionDtos.SuggestionResponse<SuggestionDtos.CategorySuggestion>>> getInterestCategories(
            @RequestHeader("Authorization") String authHeader) {
        try {
            List<SuggestionDtos.CategorySuggestion> suggestions = suggestionService.getInterestCategories();
            
            SuggestionDtos.SuggestionResponse<SuggestionDtos.CategorySuggestion> response = 
                    SuggestionDtos.SuggestionResponse.<SuggestionDtos.CategorySuggestion>builder()
                            .suggestions(suggestions)
                            .total(suggestions.size())
                            .build();
            
            return ResponseEntity.ok(ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.CategorySuggestion>>builder()
                    .result("SUCCESS")
                    .message("Interest categories retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting interest categories: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.<SuggestionDtos.SuggestionResponse<SuggestionDtos.CategorySuggestion>>builder()
                            .result("ERROR")
                            .message("Failed to get interest categories: " + e.getMessage())
                            .data(null)
                            .build());
        }
    }
}

