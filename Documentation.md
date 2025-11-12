# Career & Education Gateway - Complete System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [System Modules](#system-modules)
5. [Features & Functionality](#features--functionality)
6. [API Documentation](#api-documentation)
7. [Enhancements & Improvements](#enhancements--improvements)
8. [Setup & Installation](#setup--installation)
9. [Deployment](#deployment)
10. [Security Features](#security-features)
11. [Testing](#testing)
12. [Future Improvements](#future-improvements)

---

## System Overview

**Career & Education Gateway** is a comprehensive platform designed to bridge the gap between students, educational institutions, and employers in Lesotho. The system facilitates:

- **Student Applications** to higher learning institutions
- **Job Matching** between students and companies
- **Admission Management** for institutions
- **Candidate Management** for companies
- **System Administration** and analytics

### Key Objectives
- Streamline the application process for students
- Enable institutions to manage admissions efficiently
- Help companies find qualified candidates
- Provide comprehensive analytics and reporting
- Ensure data security and user privacy

---

## Architecture

### System Architecture
The platform follows a **3-tier architecture**:

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - React 18.2.0                         │
│  - React Router v6                      │
│  - Tailwind CSS                         │
│  - Recharts (Visualization)            │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/REST API
               │
┌──────────────▼──────────────────────────┐
│      Backend (Express.js)                │
│  - Express.js                            │
│  - Firebase Admin SDK                    │
│  - JWT Authentication                   │
│  - Rate Limiting                        │
│  - Validation (Joi)                     │
└──────────────┬──────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────┐
│      Database (Firebase Firestore)       │
│  - NoSQL Document Database              │
│  - Real-time Updates                    │
│  - Cloud Storage (Files)                │
└─────────────────────────────────────────┘
```

### Frontend Structure
```
client/src/
├── components/          # Reusable components
│   ├── common/         # Common components (Navbar, Footer, etc.)
│   ├── forms/          # Form components
│   └── ui/             # UI components (Table, Button, etc.)
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
├── pages/              # Page components
│   ├── Admin/          # Admin module pages
│   ├── Auth/           # Authentication pages
│   ├── Company/        # Company module pages
│   ├── Home/           # Public pages
│   ├── Institute/      # Institute module pages
│   └── Student/        # Student module pages
├── routes/             # Route definitions
├── services/           # API services
└── utils/              # Utility functions
```

### Backend Structure
```
server/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middlewares/        # Express middlewares
├── models/             # Data models
├── routes/             # API routes
├── utils/              # Utility functions
└── tests/              # Test files
```

---

## Technology Stack

### Frontend Technologies
- **React 18.2.0** - UI library
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Firebase Client SDK** - Authentication & real-time features
- **React Hot Toast** - Notifications

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin SDK** - Backend Firebase services
- **JWT** - Authentication tokens
- **Joi** - Data validation
- **Nodemailer** - Email service
- **PDFKit** - PDF generation
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting

### Database & Storage
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Authentication** - User authentication

---

## System Modules

### 1. Student Module

#### Overview
Students have access to two main dashboards:
- **Education Dashboard** - For institution applications
- **Career Dashboard** - For job applications

#### Education Dashboard Features
- **Browse Institutions**: View all available institutions and their courses
- **Course Qualification Check**: System automatically checks if student qualifies based on high school subjects and grades
- **Apply to Institutions**: Apply only to courses for which they qualify
- **My Applications**: Track all education applications with status updates
- **Admission Results**: View admission decisions
- **High School Results Entry**: Required before applying to institutions
- **Profile Management**: Update personal information

#### Career Dashboard Features
- **Job Listings**: Browse available job postings
- **Job Recommendations**: AI-powered job matching based on profile
- **Apply to Jobs**: Submit job applications with documents
- **My Job Applications**: Track all job applications
- **Document Upload**: Upload CV, certificates, etc. (PDF only)
- **Profile Management**: Update career profile

#### Key Functionality
- **Two-Tier Application System**: 
  - Qualified (≥55% match score) → Shortlisted
  - Not Qualified (<55% match score) → Rejected
- **Email Notifications**: Receive emails for application status changes
- **UI Notifications**: Real-time notifications in the notification bell
- **Document Management**: Upload and manage application documents

---

### 2. Institute Module

#### Overview
Educational institutions can manage their courses, faculties, and student applications.

#### Features
- **Dashboard**: Overview of applications, courses, and statistics
- **Faculty Management**: Create and manage faculties
- **Course Management**: 
  - Create courses with requirements
  - Set minimum subject requirements
  - Set minimum grade requirements
  - Define course capacity
- **Applications Management**: 
  - View all applications
  - Review student qualifications
  - Admit/Reject/Waitlist students
  - Automatic waitlist promotion when capacity opens
- **Admissions Management**: 
  - Monitor admission status
  - Manage waitlists
  - View admitted students
- **Profile Management**: Update institution information
- **PDF Export**: Export admitted students as PDF

#### Key Functionality
- **Automatic Qualification Check**: System checks if students meet course requirements
- **Waitlist Management**: Automatic promotion when spots become available
- **Email Notifications**: Send admission decisions to students
- **Capacity Management**: Track available spots per course

---

### 3. Company Module

#### Overview
Companies can post jobs, review applications, and manage candidates.

#### Features
- **Dashboard**: Overview of jobs, applicants, and statistics
- **Post Jobs**: Create job postings with requirements
- **View Applicants**: 
  - See only qualified candidates (≥55% match score)
  - View match scores and candidate profiles
  - Filter and search candidates
- **Application Management**:
  - Update application status (Accepted, Rejected, Hired)
  - Bulk actions (Approve/Reject all selected)
  - Individual status updates
  - Add notes to applications
- **Filtered Candidates**: Search and filter candidates by various criteria
- **Profile Management**: Update company information
- **PDF Export**: Export admitted candidates as PDF

#### Key Functionality
- **Two-Tier System**: 
  - Only qualified candidates (≥55%) are visible to companies
  - Rejected candidates are automatically filtered out
- **Bulk Operations**: Select multiple candidates and update status simultaneously
- **Email Notifications**: Send status updates to candidates
- **Match Score Display**: See how well candidates match job requirements

---

### 4. Admin Module

#### Overview
System administrators have full access to manage the platform, view analytics, and generate reports.

#### Features

##### Dashboard
- **System Statistics**: 
  - Total users, institutions, companies
  - Total applications and jobs
  - Pending approvals
- **Quick Actions**: Links to key management pages
- **Real-time Data**: Fetched from API endpoints

##### Applications Overview
- **Three Tabs**:
  - **Institute Applications**: All education applications
  - **Company Applications**: All job applications
  - **Combined Overview**: Both types together
- **Advanced Filtering**:
  - Filter by institution/company ID
  - Filter by course/job ID
  - Filter by status
  - Filter by date range
  - Search across multiple fields
- **Statistics Summary**: Real-time stats for each tab
- **Export Functionality**: CSV and Excel export

##### Analytics & Reports
- **Three Tabs**:
  - **Institute Analytics**: Education application analytics
  - **Company Analytics**: Job application analytics
  - **Combined Analytics**: Overall system analytics
- **Visualizations**:
  - Pie charts for status breakdown
  - Bar charts for top institutions/companies
  - Bar charts for popular courses/job types
  - Comparison charts
- **Key Metrics**:
  - Total applications
  - Admission/Qualification rates
  - Rejection rates
  - Average match scores
- **Date Range Filtering**: Filter analytics by date range
- **Export Statistics**: Export analytics data as CSV

##### User Management
- **Manage Institutions**: Approve, suspend, or remove institutions
- **Manage Companies**: Approve, suspend, or remove companies
- **User Management**: View and manage all users
- **Pending Approvals**: Quick view of pending registrations

##### Reports
- **System Reports**: Generate various system reports
- **Export Options**: CSV and Excel export
- **Date Range Selection**: Filter reports by date

##### PDF Exports
- **Company Admitted Candidates**: Export PDF of admitted candidates
- **Institute Admitted Students**: Export PDF of admitted students

#### Key Functionality
- **Comprehensive Analytics**: Visual charts and graphs for data insights
- **Advanced Filtering**: Multi-criteria filtering and search
- **Export Capabilities**: CSV, Excel, and PDF exports
- **Real-time Updates**: Live data from Firestore
- **Role-based Access**: Only admins can access these features

---

## Features & Functionality

### Authentication & Authorization
- **Multi-role System**: Student, Institute, Company, Admin
- **Firebase Authentication**: Secure authentication
- **Google Sign-In**: OAuth integration
- **JWT Tokens**: Secure API access
- **Role-based Access Control (RBAC)**: Route and feature protection
- **Email Verification**: Required for account activation
- **Password Reset**: Secure password recovery

### Job Matching Algorithm
- **Weighted Scoring System**:
  - Education match (30%)
  - Skills match (25%)
  - Experience match (20%)
  - Location match (15%)
  - Additional qualifications (10%)
- **Qualification Threshold**: 55% minimum for qualification
- **Automatic Status Assignment**: Shortlisted or Rejected based on score

### Course Qualification System
- **Subject Requirements**: Check if student has required subjects
- **Grade Requirements**: Verify minimum grades are met
- **Automatic Filtering**: Only qualified courses shown to students
- **Real-time Validation**: Instant feedback on eligibility

### Notification System
- **Email Notifications**:
  - Application status changes
  - Admission decisions
  - Job application updates
  - Detailed feedback for rejections
- **UI Notifications**:
  - Real-time notification bell
  - Notification history
  - Mark as read functionality
  - Action links to relevant pages

### Document Management
- **File Upload**: PDF only for job applications
- **Firebase Storage**: Secure file storage
- **File Validation**: Size and type validation
- **Document Tracking**: Link documents to applications

### Data Export
- **CSV Export**: Export data as CSV files
- **Excel Export**: Export data as Excel files
- **PDF Export**: Generate PDF reports
- **Custom Formatting**: Properly formatted exports with headers

### Search & Filtering
- **Advanced Search**: Search across multiple fields
- **Multi-criteria Filtering**: Filter by multiple parameters
- **Date Range Filtering**: Filter by date ranges
- **Real-time Filtering**: Instant results as you type

### Loading States
- **Skeleton Loaders**: Professional loading placeholders
- **Progressive Loading**: Load data incrementally
- **Error Handling**: Graceful error messages
- **Empty States**: Helpful messages when no data

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Admin Routes

#### Dashboard
- `GET /admin/dashboard` - Get dashboard statistics
  - Returns: Total users, institutions, companies, applications, jobs, pending approvals

#### Applications Overview
- `GET /admin/applications/institute` - Get institute applications
  - Query params: `institutionId`, `courseId`, `status`, `startDate`, `endDate`
- `GET /admin/applications/company` - Get company applications
  - Query params: `companyId`, `jobId`, `status`, `startDate`, `endDate`
- `GET /admin/applications/combined` - Get combined applications
  - Query params: `startDate`, `endDate`, `status`

#### Analytics
- `GET /admin/analytics/institute` - Get institute analytics
  - Query params: `startDate`, `endDate`
- `GET /admin/analytics/company` - Get company analytics
  - Query params: `startDate`, `endDate`
- `GET /admin/analytics/combined` - Get combined analytics
  - Query params: `startDate`, `endDate`

#### PDF Exports
- `GET /admin/export/company/:companyId/admitted` - Export company admitted candidates
- `GET /admin/export/institute/:institutionId/admitted` - Export institute admitted students

#### User Management
- `GET /admin/users` - Get all users
- `PUT /admin/approve/:userId` - Approve user registration
- `PUT /admin/suspend/:userId` - Suspend user account
- `PUT /admin/reactivate/:userId` - Reactivate user account
- `DELETE /admin/users/:userId` - Delete user account

### Job Routes

#### Job Management
- `POST /api/jobs` - Create job posting
- `GET /api/jobs` - Get all jobs (with pagination)
- `GET /api/jobs/:jobId` - Get job details
- `PUT /api/jobs/:jobId` - Update job posting
- `DELETE /api/jobs/:jobId` - Delete job posting

#### Applications
- `POST /api/jobs/:jobId/apply` - Apply to job
- `GET /api/jobs/:jobId/applications` - Get job applications (company only)
- `GET /api/jobs/applications/qualified` - Get qualified candidates (company only)
- `PATCH /api/jobs/applications/:applicationId/status` - Update application status
- `PATCH /api/jobs/:jobId/applications/bulk-status` - Bulk update application status

#### Recommendations
- `GET /api/jobs/recommendations` - Get job recommendations for student
- `GET /api/jobs/candidates/recommended` - Get recommended candidates for company

### Application Routes (Education)
- `POST /api/applications` - Apply to institution course
- `GET /api/applications/student` - Get student's applications
- `GET /api/applications/institute` - Get institute applications
- `PUT /api/applications/:applicationId/status` - Update application status

### Company Routes
- `GET /company/dashboard` - Get company dashboard stats
- `GET /company/jobs` - Get company's jobs
- `GET /company/applicants` - Get company's applicants
- `GET /company/export/admitted/:jobId?` - Export admitted candidates PDF

### Institute Routes
- `GET /institute/dashboard` - Get institute dashboard stats
- `GET /institute/courses` - Get institute courses
- `GET /institute/applications` - Get institute applications
- `GET /institute/export/admitted/:courseId?` - Export admitted students PDF

### Student Routes
- `GET /student/dashboard` - Get student dashboard
- `GET /student/profile` - Get student profile
- `PUT /student/profile` - Update student profile
- `POST /student/documents` - Upload documents

### Auth Routes
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/reset-password` - Request password reset
- `POST /auth/verify-email` - Verify email address

---

## Enhancements & Improvements

### Recent Enhancements (2024)

#### 1. Admin Module Enhancements
- **Applications Overview Page**: 
  - Three-tab interface (Institute, Company, Combined)
  - Advanced filtering and search
  - Real-time statistics
  - CSV and Excel export
  
- **Analytics & Reports Page**:
  - Visual charts using Recharts
  - Pie charts for status breakdown
  - Bar charts for top performers
  - Date range filtering
  - Export capabilities

- **Dashboard Improvements**:
  - API integration (replaced direct Firebase calls)
  - Pending approval badges
  - Quick links to new pages
  - Enhanced error handling

#### 2. Export Functionality
- **Export Utilities**: Created reusable export functions
- **CSV Export**: Properly formatted CSV with BOM for Excel
- **Excel Export**: Excel-compatible exports
- **PDF Export**: Professional PDF reports for admitted candidates/students
- **Export Notifications**: Success/error notifications

#### 3. Search & Filtering
- **Advanced Search**: Multi-field search functionality
- **Real-time Filtering**: Instant results as you type
- **Multi-criteria Filters**: Filter by multiple parameters simultaneously
- **Date Range Filtering**: Filter by custom date ranges
- **Clear Filters**: One-click filter reset

#### 4. Loading States
- **Skeleton Loaders**: Professional loading placeholders
- **Skeleton Components**: Cards, tables, charts
- **Smooth Transitions**: Better UX during loading

#### 5. Error Handling
- **Comprehensive Error Messages**: Clear, actionable error messages
- **Notification Integration**: Toast notifications for all errors
- **Graceful Degradation**: System continues working even with errors
- **Empty State Handling**: Helpful messages when no data

#### 6. Empty States
- **Professional Empty States**: Well-designed empty state components
- **Helpful Guidance**: Instructions on what to do next
- **Clear Filter Options**: Easy way to reset filters
- **Contextual Messages**: Different messages based on context

#### 7. UI/UX Improvements
- **Responsive Design**: Works on all screen sizes
- **Professional Styling**: Consistent design language
- **Hover Effects**: Interactive elements
- **Button States**: Disabled states, loading states
- **Color Scheme**: Professional color palette (removed purple, using green/black)

#### 8. Two-Tier Application System
- **Qualification Threshold**: 55% minimum match score
- **Automatic Status Assignment**: Shortlisted or Rejected
- **Company Visibility**: Only qualified candidates visible
- **Admin Visibility**: Full visibility for reporting

#### 9. Email Notifications
- **Comprehensive Email Templates**: Professional email designs
- **Status-specific Templates**: Different templates for different statuses
- **Detailed Feedback**: Specific reasons for rejections
- **Improvement Suggestions**: Helpful tips for rejected candidates

#### 10. Performance Optimizations
- **Data Caching**: Reduced API calls
- **Parallel Queries**: Faster data loading
- **Debouncing**: Optimized search input
- **Lazy Loading**: Code splitting for better performance

---

## Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Git

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd career-guidance-platform
```

#### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

#### 3. Firebase Configuration

##### Frontend Configuration
Create `client/src/services/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

##### Backend Configuration
Place Firebase service account key at:
```
server/config/keys/serviceAccountKey.json
```

#### 4. Environment Variables

##### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

##### Server (.env)
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

#### 5. Run Development Servers

##### Option 1: Run Both Together
```bash
npm run dev
```

##### Option 2: Run Separately
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

#### 6. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Documentation: http://localhost:5000/api-docs (if Swagger is configured)

---

## Deployment

### Frontend Deployment (React)

#### Build for Production
```bash
cd client
npm run build
```

#### Deploy to Firebase Hosting
```bash
firebase init hosting
firebase deploy --only hosting
```

#### Deploy to Netlify
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`

#### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Backend Deployment (Node.js)

#### Deploy to Heroku
```bash
heroku create your-app-name
git push heroku main
```

#### Deploy to Firebase Functions
```bash
firebase init functions
firebase deploy --only functions
```

#### Deploy to AWS/Google Cloud
- Use container services (Docker)
- Set up environment variables
- Configure load balancer
- Set up monitoring

### Environment Variables for Production
Ensure all environment variables are set in your hosting platform:
- Firebase credentials
- JWT secret
- Email service credentials
- API URLs

---

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access Control**: Routes protected by user roles
- **Firebase Authentication**: Industry-standard authentication
- **Email Verification**: Required for account activation
- **Password Hashing**: Secure password storage

### API Security
- **Rate Limiting**: Prevent abuse with express-rate-limit
- **CORS**: Configured for allowed origins
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Parameterized queries (Firestore handles this)

### Data Security
- **Firebase Security Rules**: Database access control
- **File Upload Validation**: Type and size validation
- **HTTPS**: Encrypted data transmission
- **Environment Variables**: Sensitive data in .env files

### Best Practices
- **Error Handling**: No sensitive data in error messages
- **Logging**: Comprehensive logging without sensitive data
- **Token Expiration**: JWT tokens expire after set time
- **Secure Headers**: Helmet.js for security headers

---

## Testing

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Test Coverage
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Component Tests**: React component testing

### Test Files
- `server/tests/auth.test.js` - Authentication tests
- `server/tests/job.test.js` - Job functionality tests
- `server/tests/institute.test.js` - Institute functionality tests
- `server/tests/student.test.js` - Student functionality tests
- `server/tests/jobMatching.test.js` - Matching algorithm tests

---

## Future Improvements

### Planned Features
1. **Real-time Chat**: Communication between users
2. **Video Interviews**: Integrated video calling
3. **Advanced Analytics**: Machine learning insights
4. **Mobile App**: Native mobile applications
5. **Multi-language Support**: Support for multiple languages
6. **Advanced Search**: Elasticsearch integration
7. **Notification Preferences**: Customizable notification settings
8. **Application Templates**: Reusable application templates
9. **Bulk Operations**: More bulk actions for admins
10. **Advanced Reporting**: More detailed reports and insights

### Technical Improvements
1. **Caching Strategy**: Redis for better performance
2. **Database Optimization**: Query optimization
3. **CDN Integration**: Faster asset delivery
4. **Monitoring**: Application performance monitoring
5. **Error Tracking**: Sentry or similar service
6. **API Versioning**: Version control for API
7. **GraphQL**: Alternative to REST API
8. **Microservices**: Break down into microservices
9. **Docker**: Containerization
10. **CI/CD Pipeline**: Automated deployment

---

## Support & Contact

### Documentation
- This documentation file
- API documentation (Swagger)
- Code comments

### Issues
- GitHub Issues for bug reports
- Feature requests
- Questions and discussions

### Maintenance
- Regular security updates
- Bug fixes
- Feature additions
- Performance optimizations

---

## License

MIT License - See LICENSE file for details

---

## Credits

**Career & Education Gateway**
- Developed by: Toka Makaka
- Institution: Limkokwing University
- Year: 2024

---

## Version History

### Version 1.0.0 (Current)
- Initial release
- All core features implemented
- Admin enhancements completed
- Export functionality added
- Advanced search and filtering
- Comprehensive documentation

---

**Last Updated**: 2024
**Documentation Version**: 1.0.0

