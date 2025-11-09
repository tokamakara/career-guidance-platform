import { meetsGradeRequirement, HIGH_SCHOOL_SUBJECTS } from './gradeSystem';

// Check if student qualifies for a specific course
export const checkCourseQualification = (studentGrades, courseRequirements) => {
  if (!studentGrades || Object.keys(studentGrades).length === 0) {
    return { qualified: false, missingSubjects: [], failedRequirements: [] };
  }

  if (!courseRequirements || Object.keys(courseRequirements).length === 0) {
    return { qualified: true, missingSubjects: [], failedRequirements: [] };
  }

  const missingSubjects = [];
  const failedRequirements = [];

  for (const [requiredSubject, requiredGrade] of Object.entries(courseRequirements)) {
    const studentGrade = studentGrades[requiredSubject];
    
    // Check if student has this subject
    if (!studentGrade) {
      missingSubjects.push(requiredSubject);
      continue;
    }
    
    // Check if student meets the grade requirement
    if (!meetsGradeRequirement(studentGrade, requiredGrade)) {
      failedRequirements.push({
        subject: requiredSubject,
        studentGrade,
        requiredGrade,
        message: `${requiredSubject}: You have ${studentGrade}, but need ${requiredGrade}`
      });
    }
  }

  const qualified = missingSubjects.length === 0 && failedRequirements.length === 0;

  return {
    qualified,
    missingSubjects,
    failedRequirements,
    message: qualified 
      ? 'You meet all requirements! ✅' 
      : `You don't meet ${missingSubjects.length + failedRequirements.length} requirement(s)`
  };
};

// Get all qualified courses from an institution
export const getQualifiedCourses = (institution, studentGrades) => {
  if (!institution?.courses || !studentGrades) return [];
  
  return institution.courses.filter(course => {
    const qualification = checkCourseQualification(studentGrades, course.requirements);
    return qualification.qualified;
  });
};

// Get course qualification details with reasons
export const getCourseQualificationDetails = (course, studentGrades) => {
  return checkCourseQualification(studentGrades, course.requirements);
};

// Check if student can apply to institution (has at least one qualified course)
export const canApplyToInstitution = (institution, studentGrades) => {
  return getQualifiedCourses(institution, studentGrades).length > 0;
};