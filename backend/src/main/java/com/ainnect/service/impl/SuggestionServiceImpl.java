package com.ainnect.service.impl;

import com.ainnect.dto.suggestion.SuggestionDtos;
import com.ainnect.repository.EducationRepository;
import com.ainnect.repository.InterestRepository;
import com.ainnect.repository.UserLocationRepository;
import com.ainnect.repository.WorkExperienceRepository;
import com.ainnect.service.SuggestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SuggestionServiceImpl implements SuggestionService {

    private final EducationRepository educationRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final InterestRepository interestRepository;
    private final UserLocationRepository userLocationRepository;

    @Override
    public List<SuggestionDtos.SchoolSuggestion> suggestSchools(String query, int limit) {
        List<String> schoolNames = educationRepository.findDistinctSchoolNamesContainingIgnoreCase(query);
        
        return schoolNames.stream()
                .limit(limit)
                .map(schoolName -> {
                    Long count = educationRepository.countBySchoolName(schoolName);
                    return SuggestionDtos.SchoolSuggestion.builder()
                            .schoolName(schoolName)
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SuggestionDtos.CompanySuggestion> suggestCompanies(String query, int limit) {
        List<String> companyNames = workExperienceRepository.findDistinctCompanyNamesContainingIgnoreCase(query);
        
        return companyNames.stream()
                .limit(limit)
                .map(companyName -> {
                    Long count = workExperienceRepository.countByCompanyName(companyName);
                    return SuggestionDtos.CompanySuggestion.builder()
                            .companyName(companyName)
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SuggestionDtos.InterestSuggestion> suggestInterests(String query, int limit) {
        List<String> interestNames = interestRepository.findDistinctNamesContainingIgnoreCase(query);
        
        return interestNames.stream()
                .limit(limit)
                .map(name -> {
                    Long count = interestRepository.countByName(name);
                    return SuggestionDtos.InterestSuggestion.builder()
                            .name(name)
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SuggestionDtos.LocationSuggestion> suggestLocations(String query, int limit) {
        List<String> locationNames = userLocationRepository.findDistinctLocationNamesContainingIgnoreCase(query);
        
        return locationNames.stream()
                .limit(limit)
                .map(locationName -> {
                    Long count = userLocationRepository.countByLocationName(locationName);
                    return SuggestionDtos.LocationSuggestion.builder()
                            .locationName(locationName)
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SuggestionDtos.CategorySuggestion> getInterestCategories() {
        List<String> categories = interestRepository.findDistinctCategories();
        
        return categories.stream()
                .map(category -> SuggestionDtos.CategorySuggestion.builder()
                        .category(category)
                        .build())
                .collect(Collectors.toList());
    }
}

