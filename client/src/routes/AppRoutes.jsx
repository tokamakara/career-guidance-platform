import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Auth Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import VerifyEmail from '../pages/Auth/VerifyEmail';
import ResetPassword from '../pages/Auth/ResetPassword';

// Home Pages
import HomePage from '../pages/Home/HomePage';
import About from '../pages/Home/About';
import Contact from '../pages/Home/Contact';
import Institutions from '../pages/Home/Institutions';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageInstitutions from '../pages/Admin/ManageInstitutions';
import ManageCompanies from '../pages/Admin/ManageCompanies';
import Reports from '../pages/Admin/Reports';
import AdmissionsMonitor from '../pages/Admin/AdmissionsMonitor';

// Institute Pages
import InstituteDashboard from '../pages/Institute/Dashboard';
import InstituteFaculties from '../pages/Institute/Faculties';
import InstituteCourses from '../pages/Institute/Courses';
import InstituteApplications from '../pages/Institute/Applications';
import InstituteAdmissions from '../pages/Institute/Admissions';
import InstituteProfile from '../pages/Institute/Profile';

// Student Pages
import StudentDashboardHome from '../pages/Student/DashboardHome';
import EducationDashboard from '../pages/Student/EducationDashboard/Dashboard';
import BrowseInstitutions from '../pages/Student/EducationDashboard/BrowseInstitutions';
import ApplyInstitutions from '../pages/Student/EducationDashboard/ApplyInstitutions';
import MyApplications from '../pages/Student/EducationDashboard/MyApplications';
import AdmissionResults from '../pages/Student/EducationDashboard/AdmissionResults';
import CareerDashboard from '../pages/Student/CareerDashboard/Dashboard';
import JobListings from '../pages/Student/CareerDashboard/JobListings';
import MyJobApplications from '../pages/Student/CareerDashboard/MyJobApplications';
import UploadDocuments from '../pages/Student/CareerDashboard/UploadDocuments';
import StudentProfile from '../pages/Student/Shared/Settings';

// Company Pages
import CompanyDashboard from '../pages/Company/Dashboard';
import PostJob from '../pages/Company/PostJob';
import CompanyApplicants from '../pages/Company/Applicants';
import FilteredCandidates from '../pages/Company/FilteredCandidates';
import CompanyProfile from '../pages/Company/Profile';

// Error Pages
import ErrorPage from '../pages/ErrorPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/institutions" element={<Institutions />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/institutions"
        element={
          <ProtectedRoute requiredRole="admin">
            <ManageInstitutions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute requiredRole="admin">
            <ManageCompanies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="admin">
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/admissions"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdmissionsMonitor />
          </ProtectedRoute>
        }
      />

      {/* Institute Routes */}
      <Route
        path="/institute/dashboard"
        element={
          <ProtectedRoute requiredRole="institute">
            <InstituteDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/institute/faculties"
        element={
          <ProtectedRoute requiredRole="institute">
            <InstituteFaculties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/institute/courses"
        element={
          <ProtectedRoute requiredRole="institute">
            <InstituteCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/institute/applications"
        element={
          <ProtectedRoute requiredRole="institute">
            <InstituteApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/institute/admissions"
        element={
          <ProtectedRoute requiredRole="institute">
            <InstituteAdmissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/institute/profile"
        element={
          <ProtectedRoute requiredRole="institute">
            <InstituteProfile />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboardHome />
          </ProtectedRoute>
        }
      />
      
      {/* Education Dashboard Routes */}
      <Route
        path="/student/education"
        element={
          <ProtectedRoute requiredRole="student">
            <EducationDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/education/institutions"
        element={
          <ProtectedRoute requiredRole="student">
            <BrowseInstitutions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/education/apply"
        element={
          <ProtectedRoute requiredRole="student">
            <ApplyInstitutions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/education/applications"
        element={
          <ProtectedRoute requiredRole="student">
            <MyApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/education/results"
        element={
          <ProtectedRoute requiredRole="student">
            <AdmissionResults />
          </ProtectedRoute>
        }
      />
      
      {/* Career Dashboard Routes */}
      <Route
        path="/student/career"
        element={
          <ProtectedRoute requiredRole="student">
            <CareerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/career/jobs"
        element={
          <ProtectedRoute requiredRole="student">
            <JobListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/career/applications"
        element={
          <ProtectedRoute requiredRole="student">
            <MyJobApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/career/documents"
        element={
          <ProtectedRoute requiredRole="student">
            <UploadDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      {/* Company Routes */}
      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/post-job"
        element={
          <ProtectedRoute requiredRole="company">
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/applicants"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyApplicants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/candidates"
        element={
          <ProtectedRoute requiredRole="company">
            <FilteredCandidates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/profile"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyProfile />
          </ProtectedRoute>
        }
      />

      {/* Error Routes */}
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/unauthorized" element={<ErrorPage message="You are not authorized to access this page." />} />
      <Route path="*" element={<ErrorPage message="Page not found." />} />
    </Routes>
  );
};

export default AppRoutes;