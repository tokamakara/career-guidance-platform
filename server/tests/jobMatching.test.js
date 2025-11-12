const jobMatchingAlgorithm = require('../utils/jobMatchingAlgorithm');

describe('Job Matching Algorithm', () => {
  describe('calculateMatchScore', () => {
    it('should calculate match score for a qualified candidate', async () => {
      const studentProfile = {
        highSchoolResults: [
          { name: 'Mathematics', grade: 85 },
          { name: 'English', grade: 80 },
          { name: 'Science', grade: 90 }
        ],
        certificates: ['Computer Science', 'Programming'],
        workExperience: [
          {
            startDate: '2022-01-01',
            endDate: '2023-12-31'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js']
      };

      const jobRequirements = {
        qualifications: ['Mathematics', 'English'],
        certificates: ['Computer Science'],
        workExperience: 1,
        skills: ['JavaScript', 'React']
      };

      const result = await jobMatchingAlgorithm.calculateMatchScore(
        studentProfile,
        jobRequirements
      );

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('qualified');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return qualified false for low match score', async () => {
      const studentProfile = {
        highSchoolResults: [
          { name: 'Mathematics', grade: 40 },
          { name: 'English', grade: 45 }
        ],
        certificates: [],
        workExperience: [],
        skills: []
      };

      const jobRequirements = {
        qualifications: ['Mathematics', 'English'],
        certificates: ['Computer Science'],
        workExperience: 5,
        skills: ['JavaScript', 'React', 'Node.js']
      };

      const result = await jobMatchingAlgorithm.calculateMatchScore(
        studentProfile,
        jobRequirements
      );

      expect(result.qualified).toBe(false);
    });
  });

  describe('calculateAcademicScore', () => {
    it('should return 0.5 when no qualifications required', () => {
      const studentProfile = {
        highSchoolResults: [
          { name: 'Mathematics', grade: 85 }
        ]
      };

      const jobRequirements = {
        qualifications: []
      };

      const score = jobMatchingAlgorithm.calculateAcademicScore(
        studentProfile,
        jobRequirements
      );

      expect(score).toBe(0.5);
    });

    it('should return 0 when student has no results', () => {
      const studentProfile = {
        highSchoolResults: []
      };

      const jobRequirements = {
        qualifications: ['Mathematics']
      };

      const score = jobMatchingAlgorithm.calculateAcademicScore(
        studentProfile,
        jobRequirements
      );

      expect(score).toBe(0);
    });
  });

  describe('calculateCertificateScore', () => {
    it('should return 1.0 when all certificates match', () => {
      const studentProfile = {
        certificates: ['Computer Science', 'Programming']
      };

      const jobRequirements = {
        certificates: ['Computer Science', 'Programming']
      };

      const score = jobMatchingAlgorithm.calculateCertificateScore(
        studentProfile,
        jobRequirements
      );

      expect(score).toBe(1.0);
    });

    it('should return 0.5 when no certificates required', () => {
      const studentProfile = {
        certificates: ['Computer Science']
      };

      const jobRequirements = {
        certificates: []
      };

      const score = jobMatchingAlgorithm.calculateCertificateScore(
        studentProfile,
        jobRequirements
      );

      expect(score).toBe(0.5);
    });
  });

  describe('calculateExperienceScore', () => {
    it('should return 1.0 when experience exceeds requirement', () => {
      const studentProfile = {
        workExperience: [
          {
            startDate: '2020-01-01',
            endDate: '2023-12-31'
          }
        ]
      };

      const jobRequirements = {
        workExperience: 2
      };

      const score = jobMatchingAlgorithm.calculateExperienceScore(
        studentProfile,
        jobRequirements
      );

      expect(score).toBe(1.0);
    });

    it('should return 0.5 when no experience required', () => {
      const studentProfile = {
        workExperience: []
      };

      const jobRequirements = {
        workExperience: 0
      };

      const score = jobMatchingAlgorithm.calculateExperienceScore(
        studentProfile,
        jobRequirements
      );

      expect(score).toBe(0.5);
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should return 1.0 when all skills match', () => {
      const studentProfile = {
        skills: ['JavaScript', 'React', 'Node.js']
      };

      const jobRequirements = {
        skills: ['JavaScript', 'React', 'Node.js']
      };

      const score = jobMatchingAlgorithm.calculateRelevanceScore(
        studentProfile,
        jobRequirements
      );

      expect(score).toBe(1.0);
    });

    it('should return 0.5 when no skills required', () => {
      const studentProfile = {
        skills: ['JavaScript']
      };

      const jobRequirements = {
        skills: []
      };

      const score = jobMatchingAlgorithm.calculateRelevanceScore(
        studentProfile,
        jobRequirements
      );

      expect(score).toBe(0.5);
    });
  });
});

