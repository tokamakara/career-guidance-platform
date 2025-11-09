// Firestore Database Schema Documentation
const dbSchema = {
  // Users collection - stores all user profiles
  users: {
    fields: {
      uid: 'string', // Firebase Auth UID
      email: 'string',
      firstName: 'string',
      lastName: 'string',
      role: 'string', // 'student', 'institute', 'company', 'admin'
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      emailVerified: 'boolean',
      
      // Student specific fields
      stage: 'string', // 'highschool', 'graduate'
      dateOfBirth: 'timestamp',
      phone: 'string',
      address: 'string',
      highSchool: 'string',
      highSchoolResults: 'array', // Array of subject results
      educationApplications: 'array', // References to education applications
      jobApplications: 'array', // References to job applications
      documents: 'map', // Transcripts, certificates, etc.
      
      // Institute specific fields
      institutionName: 'string',
      institutionType: 'string', // 'university', 'college', 'vocational'
      location: 'string',
      contactPerson: 'string',
      phone: 'string',
      website: 'string',
      description: 'string',
      status: 'string', // 'pending', 'approved', 'suspended'
      
      // Company specific fields
      companyName: 'string',
      industry: 'string',
      size: 'string', // 'small', 'medium', 'large'
      website: 'string',
      description: 'string',
      contactPerson: 'string',
      phone: 'string',
      status: 'string' // 'pending', 'approved', 'suspended'
    }
  },

  // Institutions collection
  institutions: {
    fields: {
      id: 'string',
      name: 'string',
      type: 'string',
      location: 'string',
      description: 'string',
      website: 'string',
      contactEmail: 'string',
      phone: 'string',
      logoUrl: 'string',
      status: 'string', // 'active', 'inactive'
      createdAt: 'timestamp',
      adminId: 'string' // Reference to user who manages this institution
    },
    subcollections: {
      faculties: {
        fields: {
          id: 'string',
          name: 'string',
          description: 'string',
          createdAt: 'timestamp'
        },
        subcollections: {
          courses: {
            fields: {
              id: 'string',
              name: 'string',
              code: 'string',
              duration: 'string', // e.g., '4 years'
              requirements: 'array', // Array of qualification requirements
              description: 'string',
              fees: 'number',
              seatsAvailable: 'number',
              applicationDeadline: 'timestamp',
              status: 'string' // 'open', 'closed'
            }
          }
        }
      },
      applications: {
        fields: {
          id: 'string',
          studentId: 'string',
          courseId: 'string',
          facultyId: 'string',
          applicationDate: 'timestamp',
          status: 'string', // 'pending', 'admitted', 'rejected', 'waiting'
          documents: 'array', // Supporting documents
          notes: 'string'
        }
      }
    }
  },

  // Companies collection
  companies: {
    fields: {
      id: 'string',
      name: 'string',
      industry: 'string',
      size: 'string',
      location: 'string',
      website: 'string',
      description: 'string',
      contactEmail: 'string',
      phone: 'string',
      logoUrl: 'string',
      status: 'string', // 'active', 'inactive'
      createdAt: 'timestamp',
      adminId: 'string' // Reference to user who manages this company
    },
    subcollections: {
      jobs: {
        fields: {
          id: 'string',
          title: 'string',
          department: 'string',
          type: 'string', // 'full-time', 'part-time', 'internship'
          location: 'string',
          description: 'string',
          requirements: 'array', // Job requirements
          qualifications: 'array', // Required qualifications
          skills: 'array', // Required skills
          salaryRange: 'map', // { min: number, max: number, currency: string }
          applicationDeadline: 'timestamp',
          status: 'string', // 'open', 'closed'
          createdAt: 'timestamp'
        },
        subcollections: {
          applications: {
            fields: {
              id: 'string',
              studentId: 'string',
              applicationDate: 'timestamp',
              status: 'string', // 'pending', 'shortlisted', 'rejected', 'hired'
              coverLetter: 'string',
              notes: 'string',
              matchScore: 'number' // Automated matching score
            }
          }
        }
      }
    }
  },

  // Applications collection (can also be subcollections)
  educationApplications: {
    fields: {
      id: 'string',
      studentId: 'string',
      institutionId: 'string',
      facultyId: 'string',
      courseId: 'string',
      applicationDate: 'timestamp',
      status: 'string', // 'pending', 'under-review', 'admitted', 'rejected', 'waiting'
      priority: 'number', // 1 or 2 (max 2 applications per institution)
      documents: 'array',
      notes: 'string',
      admissionDecision: 'map' // { decision: string, decisionDate: timestamp, notes: string }
    }
  },

  // Job Applications collection
  jobApplications: {
    fields: {
      id: 'string',
      studentId: 'string',
      companyId: 'string',
      jobId: 'string',
      applicationDate: 'timestamp',
      status: 'string', // 'pending', 'under-review', 'shortlisted', 'rejected', 'hired'
      coverLetter: 'string',
      matchScore: 'number', // 0-100 based on qualifications match
      interviewSchedule: 'map' // { date: timestamp, location: string, notes: string }
    }
  },

  // System-wide collections
  notifications: {
    fields: {
      id: 'string',
      userId: 'string',
      type: 'string', // 'application', 'admission', 'job', 'system'
      title: 'string',
      message: 'string',
      read: 'boolean',
      createdAt: 'timestamp',
      actionUrl: 'string', // URL to relevant page
      metadata: 'map' // Additional data
    }
  },

  reports: {
    fields: {
      id: 'string',
      type: 'string', // 'admissions', 'employment', 'system'
      title: 'string',
      data: 'map',
      generatedAt: 'timestamp',
      generatedBy: 'string' // Admin user ID
    }
  }
};

module.exports = { dbSchema };