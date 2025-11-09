const { GRADES } = require('./constants');

class Helpers {
  static calculateGradeScore(grade) {
    return GRADES[grade] || 0;
  }

  static meetsGradeRequirement(studentGrade, requiredGrade) {
    const studentScore = this.calculateGradeScore(studentGrade);
    const requiredScore = this.calculateGradeScore(requiredGrade);
    return studentScore >= requiredScore;
  }

  static calculateJobMatchScore(student, job) {
    let score = 0;
    
    // Academic performance (40%)
    const academicScore = this.calculateAcademicScore(student);
    score += academicScore * 0.4;
    
    // Certificates (20%)
    const certificateScore = this.calculateCertificateScore(student, job);
    score += certificateScore * 0.2;
    
    // Work experience (30%)
    const experienceScore = this.calculateExperienceScore(student, job);
    score += experienceScore * 0.3;
    
    // Skills relevance (10%)
    const skillsScore = this.calculateSkillsScore(student, job);
    score += skillsScore * 0.1;
    
    return Math.round(score);
  }

  static calculateAcademicScore(student) {
    if (!student.academicRecords || student.academicRecords.length === 0) return 0;
    
    const latestRecord = student.academicRecords[student.academicRecords.length - 1];
    if (!latestRecord.grades) return 0;
    
    const grades = Object.values(latestRecord.grades);
    const totalScore = grades.reduce((sum, grade) => sum + this.calculateGradeScore(grade), 0);
    return totalScore / grades.length;
  }

  static calculateCertificateScore(student, job) {
    if (!student.certificates || student.certificates.length === 0) return 0;
    if (!job.requiredCertificates || job.requiredCertificates.length === 0) return 50;
    
    const studentCerts = student.certificates.map(cert => cert.name.toLowerCase());
    const requiredCerts = job.requiredCertificates.map(cert => cert.toLowerCase());
    
    const matchedCerts = requiredCerts.filter(cert => 
      studentCerts.some(studentCert => studentCert.includes(cert))
    );
    
    return (matchedCerts.length / requiredCerts.length) * 100;
  }

  static calculateExperienceScore(student, job) {
    if (!student.workExperience || student.workExperience.length === 0) return 0;
    
    const totalMonths = student.workExperience.reduce((total, exp) => {
      return total + (exp.durationMonths || 0);
    }, 0);
    
    const requiredMonths = job.requiredExperience || 0;
    
    if (requiredMonths === 0) return totalMonths > 0 ? 80 : 40;
    
    return Math.min((totalMonths / requiredMonths) * 100, 100);
  }

  static calculateSkillsScore(student, job) {
    if (!student.skills || student.skills.length === 0) return 0;
    if (!job.requiredSkills || job.requiredSkills.length === 0) return 50;
    
    const studentSkills = student.skills.map(skill => skill.toLowerCase());
    const requiredSkills = job.requiredSkills.map(skill => skill.toLowerCase());
    
    const matchedSkills = requiredSkills.filter(skill => 
      studentSkills.some(studentSkill => studentSkill.includes(skill))
    );
    
    return (matchedSkills.length / requiredSkills.length) * 100;
  }

  static formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static generateApplicationId() {
    return `APP${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }
}

module.exports = Helpers;