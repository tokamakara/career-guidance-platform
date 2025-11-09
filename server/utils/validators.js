const { SUBJECTS, GRADES } = require('./constants');

class Validators {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    return password && password.length >= 6;
  }

  static validateName(name) {
    return name && name.trim().length >= 2;
  }

  static validateGrades(grades) {
    if (!grades || typeof grades !== 'object') return false;
    
    for (const [subject, grade] of Object.entries(grades)) {
      if (!SUBJECTS.includes(subject)) return false;
      if (!GRADES.hasOwnProperty(grade)) return false;
    }
    
    return true;
  }

  static validateCourseRequirements(requirements) {
    if (!requirements || typeof requirements !== 'object') return false;
    
    for (const [subject, grade] of Object.entries(requirements)) {
      if (!SUBJECTS.includes(subject)) return false;
      if (!GRADES.hasOwnProperty(grade)) return false;
    }
    
    return true;
  }

  static validateApplicationData(applicationData) {
    const { courseId, institutionId, studentId } = applicationData;
    return !!(courseId && institutionId && studentId);
  }

  static validateJobData(jobData) {
    const { title, description, companyId, requirements } = jobData;
    return !!(title && description && companyId && requirements);
  }

  static validateInstitutionData(institutionData) {
    const { name, email, address, phone } = institutionData;
    return !!(name && email && address && phone);
  }

  static validateCompanyData(companyData) {
    const { name, email, industry, address } = companyData;
    return !!(name && email && industry && address);
  }
}

module.exports = Validators;