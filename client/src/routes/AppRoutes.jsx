import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

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
import PrivacyPolicy from '../pages/Home/PrivacyPolicy';
import TermsOfService from '../pages/Home/TermsOfService';
import FAQ from '../pages/Home/FAQ';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageInstitutions from '../pages/Admin/ManageInstitutions';
import ManageCompanies from '../pages/Admin/ManageCompanies';
import Reports from '../pages/Admin/Reports';
import AdmissionsMonitor from '../pages/Admin/AdmissionsMonitor';
import ApplicationsOverview from '../pages/Admin/ApplicationsOverview';
import Analytics from '../pages/Admin/Analytics';

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
const StudentProfile = React.lazy(() => import('../pages/Student/EducationDashboard/Profile'));
const StudentSettings = React.lazy(() => import('../pages/Student/Shared/Settings'));

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import CompanyLayout from '../layouts/CompanyLayout';
import AdminLayout from '../layouts/AdminLayout';

// Company Pages
import CompanyDashboard from '../pages/Company/Dashboard';
import PostJob from '../pages/Company/PostJob';
import CompanyJobs from '../pages/Company/Jobs';
import CompanyApplicants from '../pages/Company/Applicants';
import FilteredCandidates from '../pages/Company/FilteredCandidates';
import CompanyProfile from '../pages/Company/Profile';
import CompanySettings from '../pages/Company/Settings';

// Error Pages
import ErrorPage from '../pages/ErrorPage';

// Component to redirect to role-specific profile
const ProfileRedirect = () => {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  switch (userProfile.role) {
    case 'student':
      return <Navigate to="/student/profile" replace />;
    case 'institute':
      return <Navigate to="/institute/profile" replace />;
    case 'company':
      return <Navigate to="/company/profile" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

// Component to redirect to role-specific settings
const SettingsRedirect = () => {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  switch (userProfile.role) {
    case 'student':
      return <Navigate to="/student/settings" replace />;
    case 'institute':
      return <Navigate to="/institute/profile" replace />;
    case 'company':
      return <Navigate to="/company/settings" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/institutions" element={<Institutions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/faq" element={<FAQ />} />
      
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
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/institutions"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <ManageInstitutions />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <ManageCompanies />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <Reports />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/admissions"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdmissionsMonitor />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications-overview"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <ApplicationsOverview />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <Analytics />
            </AdminLayout>
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
            <StudentLayout>
              <StudentDashboardHome />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Education Dashboard Routes */}
      <Route
        path="/student/education"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <EducationDashboard />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/education/institutions"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <BrowseInstitutions />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/education/apply"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <ApplyInstitutions />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/education/applications"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <MyApplications />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/education/results"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <AdmissionResults />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Career Dashboard Routes */}
      <Route
        path="/student/career"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <CareerDashboard />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/career/jobs"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <JobListings />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/career/applications"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <MyJobApplications />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/career/documents"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <UploadDocuments />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <Suspense fallback={<Loader />}>
                <StudentProfile />
              </Suspense>
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout>
              <Suspense fallback={<Loader />}>
                <StudentSettings />
              </Suspense>
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      {/* Company Routes */}
      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyLayout>
              <CompanyDashboard />
            </CompanyLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/jobs"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyLayout>
              <CompanyJobs />
            </CompanyLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/post-job"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyLayout>
              <PostJob />
            </CompanyLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/applicants"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyLayout>
              <CompanyApplicants />
            </CompanyLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/candidates"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyLayout>
              <FilteredCandidates />
            </CompanyLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/profile"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyLayout>
              <CompanyProfile />
            </CompanyLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/settings"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyLayout>
              <CompanySettings />
            </CompanyLayout>
          </ProtectedRoute>
        }
      />

      {/* Generic Profile and Settings Routes - Redirect based on role */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsRedirect />
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