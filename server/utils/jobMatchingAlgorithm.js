class JobMatchingAlgorithm {
  constructor() {
    this.weights = {
      academicPerformance: 0.4,
      certificates: 0.2,
      workExperience: 0.3,
      relevance: 0.1
    };
  }

  // Main matching function
  async calculateMatchScore(studentProfile, jobRequirements) {
    try {
      const scores = {
        academicPerformance: this.calculateAcademicScore(studentProfile, jobRequirements),
        certificates: this.calculateCertificateScore(studentProfile, jobRequirements),
        workExperience: this.calculateExperienceScore(studentProfile, jobRequirements),
        relevance: this.calculateRelevanceScore(studentProfile, jobRequirements)
      };

      // Calculate weighted score
      const totalScore = Object.keys(scores).reduce((total, key) => {
        return total + (scores[key] * this.weights[key]);
      }, 0);

      return {
        score: Math.round(totalScore * 100),
        breakdown: scores,
        qualified: totalScore >= 0.55 // 55% threshold (two-tier system)
      };
    } catch (error) {
      console.error('Job matching error:', error);
      return { score: 0, breakdown: {}, qualified: false };
    }
  }

  // Calculate academic performance score
  calculateAcademicScore(studentProfile, jobRequirements) {
    if (!jobRequirements.qualifications || jobRequirements.qualifications.length === 0) {
      return 0.5; // Default score if no specific qualifications required
    }

    const highSchoolResults = studentProfile.highSchoolResults || [];
    const requiredSubjects = jobRequirements.qualifications;

    if (highSchoolResults.length === 0) return 0;

    // Calculate average grade
    const totalGrade = highSchoolResults.reduce((sum, subject) => sum + subject.grade, 0);
    const averageGrade = totalGrade / highSchoolResults.length;

    // Normalize grade to 0-1 scale (assuming grades are 1-7 or 1-100)
    const normalizedGrade = Math.min(averageGrade / 100, 1);

    // Check if student has required subjects
    const hasRequiredSubjects = requiredSubjects.every(reqSubject =>
      highSchoolResults.some(subject => 
        subject.name.toLowerCase().includes(reqSubject.toLowerCase())
      )
    );

    return hasRequiredSubjects ? normalizedGrade : normalizedGrade * 0.5;
  }

  // Calculate certificate score
  calculateCertificateScore(studentProfile, jobRequirements) {
    const studentCertificates = studentProfile.certificates || [];
    const requiredCertificates = jobRequirements.certificates || [];

    if (requiredCertificates.length === 0) return 0.5;

    const matchingCertificates = requiredCertificates.filter(reqCert =>
      studentCertificates.some(studentCert =>
        studentCert.name.toLowerCase().includes(reqCert.toLowerCase())
      )
    );

    return matchingCertificates.length / requiredCertificates.length;
  }

  // Calculate work experience score
  calculateExperienceScore(studentProfile, jobRequirements) {
    const studentExperience = studentProfile.workExperience || [];
    const requiredExperience = jobRequirements.workExperience || 0;

    if (requiredExperience === 0) return 0.5;

    const totalMonths = studentExperience.reduce((total, exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (endDate - startDate) / (1000 * 60 * 60 * 24 * 30);
      return total + Math.max(months, 0);
    }, 0);

    const experienceYears = totalMonths / 12;
    const score = Math.min(experienceYears / requiredExperience, 1);

    return score;
  }

  // Calculate relevance score (skills match)
  calculateRelevanceScore(studentProfile, jobRequirements) {
    const studentSkills = studentProfile.skills || [];
    const requiredSkills = jobRequirements.skills || [];

    if (requiredSkills.length === 0) return 0.5;

    const matchingSkills = requiredSkills.filter(reqSkill =>
      studentSkills.some(studentSkill =>
        studentSkill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );

    return matchingSkills.length / requiredSkills.length;
  }

  // Filter and rank candidates for a job
  async getQualifiedCandidates(jobRequirements, candidates, minScore = 60) {
    try {
      const qualifiedCandidates = [];

      for (const candidate of candidates) {
        const matchResult = await this.calculateMatchScore(candidate, jobRequirements);
        
        if (matchResult.qualified && matchResult.score >= minScore) {
          qualifiedCandidates.push({
            ...candidate,
            matchScore: matchResult.score,
            matchBreakdown: matchResult.breakdown
          });
        }
      }

      // Sort by match score (descending)
      return qualifiedCandidates.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error('Candidate filtering error:', error);
      return [];
    }
  }

  // Get job recommendations for a student
  async getJobRecommendations(studentProfile, availableJobs, limit = 10) {
    try {
      const recommendations = [];

      for (const job of availableJobs) {
        const matchResult = await this.calculateMatchScore(studentProfile, job.requirements);
        
        if (matchResult.qualified) {
          recommendations.push({
            ...job,
            matchScore: matchResult.score,
            matchBreakdown: matchResult.breakdown
          });
        }
      }

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Job recommendation error:', error);
      return [];
    }
  }
}

module.exports = new JobMatchingAlgorithm();