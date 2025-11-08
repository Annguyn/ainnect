import React, { useState, useEffect } from 'react';
import { 
  getUserEducations, 
  getUserWorkExperiences, 
  getUserInterests, 
  getUserLocations,
  Education,
  WorkExperience,
  Interest,
  Location
} from '../../services/profileService';
import { EducationCard } from './EducationCard';
import { WorkExperienceCard } from './WorkExperienceCard';
import { InterestCard } from './InterestCard';
import { LocationCard } from './LocationCard';
import { GraduationCap, Briefcase, Heart, MapPin, Loader2 } from 'lucide-react';

interface ProfileDetailsSectionProps {
  userId: number;
}

export const ProfileDetailsSection: React.FC<ProfileDetailsSectionProps> = ({ userId }) => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        setLoading(true);
        const [eduData, workData, interestData, locationData] = await Promise.all([
          getUserEducations(userId),
          getUserWorkExperiences(userId),
          getUserInterests(userId),
          getUserLocations(userId)
        ]);

        setEducations(eduData);
        setWorkExperiences(workData);
        setInterests(interestData);
        setLocations(locationData);
      } catch (error) {
        console.error('Failed to fetch profile details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const hasAnyData = educations.length > 0 || workExperiences.length > 0 || 
                     interests.length > 0 || locations.length > 0;

  if (!hasAnyData) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No additional information available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {educations.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Education
            </h2>
          </div>
          <div className="space-y-3">
            {educations.map((education) => (
              <EducationCard key={education.id} education={education} />
            ))}
          </div>
        </section>
      )}

      {workExperiences.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-secondary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Work Experience
            </h2>
          </div>
          <div className="space-y-3">
            {workExperiences.map((work) => (
              <WorkExperienceCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      )}

      {interests.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-accent-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Interests
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interests.map((interest) => (
              <InterestCard key={interest.id} interest={interest} />
            ))}
          </div>
        </section>
      )}

      {locations.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-tertiary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Locations
            </h2>
          </div>
          <div className="space-y-3">
            {locations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

