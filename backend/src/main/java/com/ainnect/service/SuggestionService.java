package com.ainnect.service;

import com.ainnect.dto.suggestion.SuggestionDtos;

import java.util.List;

public interface SuggestionService {
    
    List<SuggestionDtos.SchoolSuggestion> suggestSchools(String query, int limit);
    
    List<SuggestionDtos.CompanySuggestion> suggestCompanies(String query, int limit);
    
    List<SuggestionDtos.InterestSuggestion> suggestInterests(String query, int limit);
    
    List<SuggestionDtos.LocationSuggestion> suggestLocations(String query, int limit);
    
    List<SuggestionDtos.CategorySuggestion> getInterestCategories();
}

