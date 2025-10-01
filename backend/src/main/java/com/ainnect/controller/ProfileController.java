package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.dto.profile.EducationDtos;
import com.ainnect.dto.profile.InterestDtos;
import com.ainnect.dto.profile.LocationDtos;
import com.ainnect.dto.profile.ProfileDtos;
import com.ainnect.dto.profile.WorkExperienceDtos;
import com.ainnect.service.ProfileService;
import com.ainnect.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final FileStorageService fileStorageService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProfileDtos.ProfileResponse>> getUserProfile(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long currentUserId = extractUserIdFromToken(authHeader);
            ProfileDtos.ProfileResponse response = profileService.getUserProfile(userId, currentUserId, page, size);
            
            return ResponseEntity.ok(ApiResponse.<ProfileDtos.ProfileResponse>builder()
                    .result("SUCCESS")
                    .message("Profile retrieved successfully")
                    .data(response)
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Error getting user profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.<ProfileDtos.ProfileResponse>builder()
                    .result("ERROR")
                    .message(e.getMessage())
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user profile: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileDtos.ProfileResponse>builder()
                    .result("ERROR")
                    .message("Failed to get profile: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/{userId}/posts")
    public ResponseEntity<ApiResponse<ProfileDtos.ProfilePostsResponse>> getUserPosts(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long currentUserId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            ProfileDtos.ProfilePostsResponse response = profileService.getUserPosts(userId, currentUserId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<ProfileDtos.ProfilePostsResponse>builder()
                    .result("SUCCESS")
                    .message("User posts retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user posts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileDtos.ProfilePostsResponse>builder()
                    .result("ERROR")
                    .message("Failed to get user posts: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<ApiResponse<ProfileDtos.FollowersResponse>> getUserFollowers(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long currentUserId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            ProfileDtos.FollowersResponse response = profileService.getUserFollowers(userId, currentUserId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<ProfileDtos.FollowersResponse>builder()
                    .result("SUCCESS")
                    .message("User followers retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user followers: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileDtos.FollowersResponse>builder()
                    .result("ERROR")
                    .message("Failed to get user followers: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<ApiResponse<ProfileDtos.FollowingResponse>> getUserFollowing(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long currentUserId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            ProfileDtos.FollowingResponse response = profileService.getUserFollowing(userId, currentUserId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<ProfileDtos.FollowingResponse>builder()
                    .result("SUCCESS")
                    .message("User following retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user following: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileDtos.FollowingResponse>builder()
                    .result("ERROR")
                    .message("Failed to get user following: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/{userId}/friends")
    public ResponseEntity<ApiResponse<ProfileDtos.FriendsResponse>> getUserFriends(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long currentUserId = extractUserIdFromToken(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            ProfileDtos.FriendsResponse response = profileService.getUserFriends(userId, currentUserId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<ProfileDtos.FriendsResponse>builder()
                    .result("SUCCESS")
                    .message("User friends retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user friends: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileDtos.FriendsResponse>builder()
                    .result("ERROR")
                    .message("Failed to get user friends: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/{userId}/social-stats")
    public ResponseEntity<ApiResponse<ProfileDtos.SocialStatsResponse>> getUserSocialStats(
            @PathVariable("userId") Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long currentUserId = extractUserIdFromToken(authHeader);
            ProfileDtos.SocialStatsResponse response = profileService.getUserSocialStats(userId, currentUserId);
            
            return ResponseEntity.ok(ApiResponse.<ProfileDtos.SocialStatsResponse>builder()
                    .result("SUCCESS")
                    .message("User social stats retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user social stats: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileDtos.SocialStatsResponse>builder()
                    .result("ERROR")
                    .message("Failed to get user social stats: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    // Education endpoints
    @PostMapping(value = "/education", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<EducationDtos.Response>> createEducation(
            @RequestParam("schoolName") String schoolName,
            @RequestParam(value = "degree", required = false) String degree,
            @RequestParam(value = "fieldOfStudy", required = false) String fieldOfStudy,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "isCurrent", defaultValue = "false") Boolean isCurrent,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            EducationDtos.CreateRequest request = new EducationDtos.CreateRequest();
            request.setSchoolName(schoolName);
            request.setDegree(degree);
            request.setFieldOfStudy(fieldOfStudy);
            if (startDate != null && !startDate.isEmpty()) {
                request.setStartDate(java.time.LocalDate.parse(startDate));
            }
            if (endDate != null && !endDate.isEmpty()) {
                request.setEndDate(java.time.LocalDate.parse(endDate));
            }
            request.setIsCurrent(isCurrent);
            request.setDescription(description);
            
            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "schools");
                request.setImageUrl(imageUrl);
            }
            // Note: If no image file is provided, imageUrl will remain null
            
            EducationDtos.Response response = profileService.createEducation(request, userId);
            return ResponseEntity.ok(ApiResponse.<EducationDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Education created successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error creating education: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<EducationDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to create education: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @PutMapping(value = "/education/{educationId}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<EducationDtos.Response>> updateEducation(
            @PathVariable("educationId") Long educationId,
            @RequestParam("schoolName") String schoolName,
            @RequestParam(value = "degree", required = false) String degree,
            @RequestParam(value = "fieldOfStudy", required = false) String fieldOfStudy,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "isCurrent", defaultValue = "false") Boolean isCurrent,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            EducationDtos.UpdateRequest request = new EducationDtos.UpdateRequest();
            request.setSchoolName(schoolName);
            request.setDegree(degree);
            request.setFieldOfStudy(fieldOfStudy);
            if (startDate != null && !startDate.isEmpty()) {
                request.setStartDate(java.time.LocalDate.parse(startDate));
            }
            if (endDate != null && !endDate.isEmpty()) {
                request.setEndDate(java.time.LocalDate.parse(endDate));
            }
            request.setIsCurrent(isCurrent);
            request.setDescription(description);
            
            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "schools");
                request.setImageUrl(imageUrl);
            }
            // Note: If no image file is provided, imageUrl will remain null and won't update existing image
            
            EducationDtos.Response response = profileService.updateEducation(educationId, request, userId);
            return ResponseEntity.ok(ApiResponse.<EducationDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Education updated successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error updating education: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<EducationDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to update education: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @DeleteMapping("/education/{educationId}")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(
            @PathVariable("educationId") Long educationId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            profileService.deleteEducation(educationId, userId);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .result("SUCCESS")
                    .message("Education deleted successfully")
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Error deleting education: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .result("ERROR")
                    .message("Failed to delete education: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/education")
    public ResponseEntity<ApiResponse<java.util.List<EducationDtos.Response>>> getUserEducations(
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            java.util.List<EducationDtos.Response> response = profileService.getUserEducations(userId);
            return ResponseEntity.ok(ApiResponse.<java.util.List<EducationDtos.Response>>builder()
                    .result("SUCCESS")
                    .message("User educations retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user educations: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<java.util.List<EducationDtos.Response>>builder()
                    .result("ERROR")
                    .message("Failed to get user educations: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    // Work experience endpoints
    @PostMapping(value = "/work-experience", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<WorkExperienceDtos.Response>> createWorkExperience(
            @RequestParam("companyName") String companyName,
            @RequestParam("position") String position,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "isCurrent", defaultValue = "false") Boolean isCurrent,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            WorkExperienceDtos.CreateRequest request = new WorkExperienceDtos.CreateRequest();
            request.setCompanyName(companyName);
            request.setPosition(position);
            request.setLocation(location);
            if (startDate != null && !startDate.isEmpty()) {
                request.setStartDate(java.time.LocalDate.parse(startDate));
            }
            if (endDate != null && !endDate.isEmpty()) {
                request.setEndDate(java.time.LocalDate.parse(endDate));
            }
            request.setIsCurrent(isCurrent);
            request.setDescription(description);
            
            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "companies");
                request.setImageUrl(imageUrl);
            }
            // Note: If no image file is provided, imageUrl will remain null
            
            WorkExperienceDtos.Response response = profileService.createWorkExperience(request, userId);
            return ResponseEntity.ok(ApiResponse.<WorkExperienceDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Work experience created successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error creating work experience: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<WorkExperienceDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to create work experience: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @PutMapping(value = "/work-experience/{workExperienceId}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<WorkExperienceDtos.Response>> updateWorkExperience(
            @PathVariable("workExperienceId") Long workExperienceId,
            @RequestParam("companyName") String companyName,
            @RequestParam("position") String position,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "isCurrent", defaultValue = "false") Boolean isCurrent,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            WorkExperienceDtos.UpdateRequest request = new WorkExperienceDtos.UpdateRequest();
            request.setCompanyName(companyName);
            request.setPosition(position);
            request.setLocation(location);
            if (startDate != null && !startDate.isEmpty()) {
                request.setStartDate(java.time.LocalDate.parse(startDate));
            }
            if (endDate != null && !endDate.isEmpty()) {
                request.setEndDate(java.time.LocalDate.parse(endDate));
            }
            request.setIsCurrent(isCurrent);
            request.setDescription(description);
            
            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "companies");
                request.setImageUrl(imageUrl);
            }
            // Note: If no image file is provided, imageUrl will remain null and won't update existing image
            
            WorkExperienceDtos.Response response = profileService.updateWorkExperience(workExperienceId, request, userId);
            return ResponseEntity.ok(ApiResponse.<WorkExperienceDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Work experience updated successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error updating work experience: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<WorkExperienceDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to update work experience: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @DeleteMapping("/work-experience/{workExperienceId}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkExperience(
            @PathVariable("workExperienceId") Long workExperienceId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            profileService.deleteWorkExperience(workExperienceId, userId);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .result("SUCCESS")
                    .message("Work experience deleted successfully")
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Error deleting work experience: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .result("ERROR")
                    .message("Failed to delete work experience: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/work-experience")
    public ResponseEntity<ApiResponse<java.util.List<WorkExperienceDtos.Response>>> getUserWorkExperiences(
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            java.util.List<WorkExperienceDtos.Response> response = profileService.getUserWorkExperiences(userId);
            return ResponseEntity.ok(ApiResponse.<java.util.List<WorkExperienceDtos.Response>>builder()
                    .result("SUCCESS")
                    .message("User work experiences retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user work experiences: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<java.util.List<WorkExperienceDtos.Response>>builder()
                    .result("ERROR")
                    .message("Failed to get user work experiences: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    // Interest endpoints
    @PostMapping(value = "/interest", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<InterestDtos.Response>> createInterest(
            @RequestParam("name") String name,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            InterestDtos.CreateRequest request = new InterestDtos.CreateRequest();
            request.setName(name);
            request.setCategory(category);
            request.setDescription(description);
            
            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "interests");
                request.setImageUrl(imageUrl);
            }
            
            InterestDtos.Response response = profileService.createInterest(request, userId);
            return ResponseEntity.ok(ApiResponse.<InterestDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Interest created successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error creating interest: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<InterestDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to create interest: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @PutMapping(value = "/interest/{interestId}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<InterestDtos.Response>> updateInterest(
            @PathVariable("interestId") Long interestId,
            @RequestParam("name") String name,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            InterestDtos.UpdateRequest request = new InterestDtos.UpdateRequest();
            request.setName(name);
            request.setCategory(category);
            request.setDescription(description);
            
            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "interests");
                request.setImageUrl(imageUrl);
            }
            
            InterestDtos.Response response = profileService.updateInterest(interestId, request, userId);
            return ResponseEntity.ok(ApiResponse.<InterestDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Interest updated successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error updating interest: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<InterestDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to update interest: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @DeleteMapping("/interest/{interestId}")
    public ResponseEntity<ApiResponse<Void>> deleteInterest(
            @PathVariable("interestId") Long interestId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            profileService.deleteInterest(interestId, userId);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .result("SUCCESS")
                    .message("Interest deleted successfully")
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Error deleting interest: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .result("ERROR")
                    .message("Failed to delete interest: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/interest")
    public ResponseEntity<ApiResponse<java.util.List<InterestDtos.Response>>> getUserInterests(
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            java.util.List<InterestDtos.Response> response = profileService.getUserInterests(userId);
            return ResponseEntity.ok(ApiResponse.<java.util.List<InterestDtos.Response>>builder()
                    .result("SUCCESS")
                    .message("User interests retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user interests: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<java.util.List<InterestDtos.Response>>builder()
                    .result("ERROR")
                    .message("Failed to get user interests: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    // Location endpoints
    @PostMapping(value = "/location", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<LocationDtos.Response>> createLocation(
            @RequestParam("locationName") String locationName,
            @RequestParam(value = "locationType", required = false) String locationType,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "isCurrent", defaultValue = "false") Boolean isCurrent,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            LocationDtos.CreateRequest request = new LocationDtos.CreateRequest();
            request.setLocationName(locationName);
            request.setLocationType(locationType);
            request.setAddress(address);
            request.setLatitude(latitude);
            request.setLongitude(longitude);
            request.setDescription(description);
            request.setIsCurrent(isCurrent);
            
            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "locations");
                request.setImageUrl(imageUrl);
            }
            
            LocationDtos.Response response = profileService.createLocation(request, userId);
            return ResponseEntity.ok(ApiResponse.<LocationDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Location created successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error creating location: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<LocationDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to create location: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @PutMapping(value = "/location/{locationId}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<LocationDtos.Response>> updateLocation(
            @PathVariable("locationId") Long locationId,
            @RequestParam("locationName") String locationName,
            @RequestParam(value = "locationType", required = false) String locationType,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "isCurrent", defaultValue = "false") Boolean isCurrent,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            LocationDtos.UpdateRequest request = new LocationDtos.UpdateRequest();
            request.setLocationName(locationName);
            request.setLocationType(locationType);
            request.setAddress(address);
            request.setLatitude(latitude);
            request.setLongitude(longitude);
            request.setDescription(description);
            request.setIsCurrent(isCurrent);
            
            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(image, "locations");
                request.setImageUrl(imageUrl);
            }
            
            LocationDtos.Response response = profileService.updateLocation(locationId, request, userId);
            return ResponseEntity.ok(ApiResponse.<LocationDtos.Response>builder()
                    .result("SUCCESS")
                    .message("Location updated successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error updating location: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<LocationDtos.Response>builder()
                    .result("ERROR")
                    .message("Failed to update location: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @DeleteMapping("/location/{locationId}")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(
            @PathVariable("locationId") Long locationId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            profileService.deleteLocation(locationId, userId);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .result("SUCCESS")
                    .message("Location deleted successfully")
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Error deleting location: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .result("ERROR")
                    .message("Failed to delete location: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/location")
    public ResponseEntity<ApiResponse<java.util.List<LocationDtos.Response>>> getUserLocations(
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            java.util.List<LocationDtos.Response> response = profileService.getUserLocations(userId);
            return ResponseEntity.ok(ApiResponse.<java.util.List<LocationDtos.Response>>builder()
                    .result("SUCCESS")
                    .message("User locations retrieved successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user locations: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<java.util.List<LocationDtos.Response>>builder()
                    .result("ERROR")
                    .message("Failed to get user locations: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    private Long extractUserIdFromToken(String authHeader) {
        return 1L;
    }
}