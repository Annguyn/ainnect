package com.ainnect.service;

import com.ainnect.dto.profile.EducationDtos;
import com.ainnect.dto.profile.InterestDtos;
import com.ainnect.dto.profile.LocationDtos;
import com.ainnect.dto.profile.ProfileDtos;
import com.ainnect.dto.profile.WorkExperienceDtos;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProfileService {

    ProfileDtos.ProfileResponse getUserProfile(Long userId, Long currentUserId, int page, int size);
    ProfileDtos.ProfileUpdateResponse updateProfile(ProfileDtos.ProfileUpdateRequest request, Long userId);

    ProfileDtos.ProfilePostsResponse getUserPosts(Long userId, Long currentUserId, Pageable pageable);

    ProfileDtos.FollowersResponse getUserFollowers(Long userId, Long currentUserId, Pageable pageable);
    ProfileDtos.FollowingResponse getUserFollowing(Long userId, Long currentUserId, Pageable pageable);
    ProfileDtos.FriendsResponse getUserFriends(Long userId, Long currentUserId, Pageable pageable);

    ProfileDtos.SocialStatsResponse getUserSocialStats(Long userId, Long currentUserId);

    EducationDtos.Response createEducation(EducationDtos.CreateRequest request, Long userId);
    EducationDtos.Response updateEducation(Long educationId, EducationDtos.UpdateRequest request, Long userId);
    void deleteEducation(Long educationId, Long userId);
    List<EducationDtos.Response> getUserEducations(Long userId);

    WorkExperienceDtos.Response createWorkExperience(WorkExperienceDtos.CreateRequest request, Long userId);
    WorkExperienceDtos.Response updateWorkExperience(Long workExperienceId, WorkExperienceDtos.UpdateRequest request, Long userId);
    void deleteWorkExperience(Long workExperienceId, Long userId);
    List<WorkExperienceDtos.Response> getUserWorkExperiences(Long userId);

    InterestDtos.Response createInterest(InterestDtos.CreateRequest request, Long userId);
    InterestDtos.Response updateInterest(Long interestId, InterestDtos.UpdateRequest request, Long userId);
    void deleteInterest(Long interestId, Long userId);
    List<InterestDtos.Response> getUserInterests(Long userId);

    LocationDtos.Response createLocation(LocationDtos.CreateRequest request, Long userId);
    LocationDtos.Response updateLocation(Long locationId, LocationDtos.UpdateRequest request, Long userId);
    void deleteLocation(Long locationId, Long userId);
    List<LocationDtos.Response> getUserLocations(Long userId);

    boolean isProfileVisible(Long userId, Long currentUserId);
    boolean canViewPosts(Long userId, Long currentUserId);
}