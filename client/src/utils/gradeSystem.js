// Lesotho Cambridge O-Level Grading System
export const GRADE_SYSTEM = {
  'A*': { min: 90, max: 100, points: 1, label: 'A* (90-100%)' },
  'A': { min: 80, max: 89, points: 2, label: 'A (80-89%)' },
  'B': { min: 70, max: 79, points: 3, label: 'B (70-79%)' },
  'C': { min: 60, max: 69, points: 4, label: 'C (60-69%)' },
  'D': { min: 50, max: 59, points: 5, label: 'D (50-59%)' },
  'E': { min: 40, max: 49, points: 6, label: 'E (40-49%)' },
  'F': { min: 30, max: 39, points: 7, label: 'F (30-39%)' },
  'G': { min: 0, max: 29, points: 8, label: 'G (0-29%)' }
};

export const HIGH_SCHOOL_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Physical Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Geography',
  'History',
  'Accounting',
  'Economics',
  'Business Studies',
  'Computer Studies',
  'Agriculture',
  'Sesotho',
  'French',
  'Religious Education',
  'Development Studies',
  'Literature in English'
];

// Convert grade letter to minimum percentage required
export const gradeToPercentage = (grade) => {
  return GRADE_SYSTEM[grade]?.min || 0;
};

// Check if student grade meets course requirement
export const meetsGradeRequirement = (studentGrade, requiredGrade) => {
  const studentPercentage = typeof studentGrade === 'string' 
    ? gradeToPercentage(studentGrade) 
    : studentGrade;
  
  const requiredPercentage = gradeToPercentage(requiredGrade);
  
  return studentPercentage >= requiredPercentage;
};

// Get all possible grades for dropdown
export const getGradeOptions = () => {
  return Object.keys(GRADE_SYSTEM).map(grade => ({
    value: grade,
    label: GRADE_SYSTEM[grade].label
  }));
};