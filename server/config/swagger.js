const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Career Guidance Platform API',
      version: '1.0.0',
      description: 'API documentation for the Career Guidance and Employment Integration Platform for Lesotho',
      contact: {
        name: 'API Support',
        email: 'support@careerguidance.ls'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.careerguidance.ls',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase ID Token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 10
            },
            total: {
              type: 'integer',
              example: 100
            },
            totalPages: {
              type: 'integer',
              example: 10
            },
            hasNextPage: {
              type: 'boolean',
              example: true
            },
            hasPrevPage: {
              type: 'boolean',
              example: false
            },
            lastDocId: {
              type: 'string',
              example: 'document-id'
            }
          }
        },
        Job: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'job-id'
            },
            title: {
              type: 'string',
              example: 'Software Developer'
            },
            department: {
              type: 'string',
              example: 'IT'
            },
            type: {
              type: 'string',
              enum: ['full-time', 'part-time', 'contract', 'internship'],
              example: 'full-time'
            },
            location: {
              type: 'string',
              example: 'Maseru, Lesotho'
            },
            description: {
              type: 'string',
              example: 'Job description...'
            },
            requirements: {
              type: 'object',
              properties: {
                qualifications: {
                  type: 'array',
                  items: { type: 'string' }
                },
                certificates: {
                  type: 'array',
                  items: { type: 'string' }
                },
                workExperience: {
                  type: 'number',
                  example: 2
                },
                skills: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            salaryRange: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
                currency: { type: 'string', example: 'LSL' }
              }
            },
            applicationDeadline: {
              type: 'string',
              format: 'date-time'
            },
            companyName: {
              type: 'string',
              example: 'Company Name'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Application: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'application-id'
            },
            studentId: {
              type: 'string',
              example: 'student-id'
            },
            courseId: {
              type: 'string',
              example: 'course-id'
            },
            institutionId: {
              type: 'string',
              example: 'institution-id'
            },
            status: {
              type: 'string',
              enum: ['pending', 'under-review', 'admitted', 'rejected', 'waiting', 'accepted'],
              example: 'pending'
            },
            applicationDate: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Jobs',
        description: 'Job listing and management endpoints'
      },
      {
        name: 'Applications',
        description: 'Application management endpoints'
      },
      {
        name: 'Students',
        description: 'Student-specific endpoints'
      },
      {
        name: 'Institutes',
        description: 'Institution-specific endpoints'
      },
      {
        name: 'Companies',
        description: 'Company-specific endpoints'
      },
      {
        name: 'Admin',
        description: 'Admin-specific endpoints'
      }
    ]
  },
  apis: [
    './server/routes/*.js',
    './server/controllers/*.js',
    './server.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

