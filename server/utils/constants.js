const GRADES = {
  'A*': 90,
  'A': 80,
  'B': 70,
  'C': 60,
  'D': 50,
  'E': 40,
  'F': 30,
  'G': 0
};

const APPLICATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted'
};

const ADMISSION_STATUS = {
  PENDING: 'pending',
  ADMITTED: 'admitted',
  REJECTED: 'rejected',
  WAITLISTED: 'waitlisted'
};

const USER_ROLES = {
  STUDENT: 'student',
  INSTITUTE: 'institute',
  COMPANY: 'company',
  ADMIN: 'admin'
};

const JOB_MATCHING_WEIGHTS = {
  ACADEMIC_PERFORMANCE: 0.4,
  CERTIFICATES: 0.2,
  WORK_EXPERIENCE: 0.3,
  SKILLS_RELEVANCE: 0.1
};

const SUBJECTS = [
  'English',
  'Mathematics',
  'Physical Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Accounting',
  'Business Studies',
  'Economics',
  'Geography',
  'History',
  'Computer Science',
  'French',
  'Sesotho',
  'Religious Studies',
  'Agriculture'
];

module.exports = {
  GRADES,
  APPLICATION_STATUS,
  ADMISSION_STATUS,
  USER_ROLES,
  JOB_MATCHING_WEIGHTS,
  SUBJECTS
};