export * from './authService';
export * from './userService';
export * from './postService';
export * from './commentService';
export * from './fileService';
export * from './suggestionService';
export * from './socialService';
export * from './apkVersionService';

// Profile service exports (avoiding conflicts with userService)
export {
  profileService,
  createEducation,
  getEducations,
  updateEducation,
  deleteEducation,
  createWorkExperience,
  getWorkExperiences,
  updateWorkExperience,
  deleteWorkExperience,
  createInterest,
  getInterests,
  updateInterest,
  deleteInterest,
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation,
  getCompleteProfile,
  updateProfile as updateUserProfile,
  uploadAvatar as uploadUserAvatar
} from './profileService';

export type {
  Education,
  WorkExperience,
  Interest,
  Location,
  CompleteProfile,
  CreateEducationRequest,
  UpdateEducationRequest,
  CreateWorkExperienceRequest,
  UpdateWorkExperienceRequest,
  UpdateInterestRequest,
  UpdateLocationRequest,
  CreateInterestRequest,
  CreateLocationRequest,
  UpdateProfileRequest
} from './profileService';
