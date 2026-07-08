import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// Lazy load all other pages
const StudentDashboard = React.lazy(() => import('./pages/dashboard/StudentDashboard'));
const LecturerDashboard = React.lazy(() => import('./pages/dashboard/LecturerDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/dashboard/AdminDashboard'));
const InventoryPage = React.lazy(() => import('./pages/inventory/InventoryPage'));

const ToolLoanPage = React.lazy(() => import('./pages/inventory/ToolLoanPage'));
const MaterialRepositoryPage = React.lazy(() => import('./pages/learning/MaterialRepositoryPage'));
const CalendarPage = React.lazy(() => import('./pages/calendar/CalendarPage'));
const ResearchMetricsPage = React.lazy(() => import('./pages/research/ResearchMetricsPage'));
const LabSupportPage = React.lazy(() => import('./pages/support/LabSupportPage'));
const BacteriaDetectionPage = React.lazy(() => import('./pages/lab/BacteriaDetectionPage'));
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const AIFeedbackPage = React.lazy(() => import('./pages/admin/AIFeedbackPage'));
const UEQQuestionnairePage = React.lazy(() => import('./pages/research/UEQQuestionnairePage'));

const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
const CourseManagementPage = React.lazy(() => import('./pages/admin/CourseManagementPage'));
const ClassMasterPage = React.lazy(() => import('./pages/admin/ClassMasterPage'));

const LoanManagementPage = React.lazy(() => import('./pages/admin/LoanManagementPage'));
const PendingValidationPage = React.lazy(() => import('./pages/lecturer/PendingValidationPage'));
const LabMasterPage = React.lazy(() => import('./pages/admin/LabMasterPage'));
const IPCameraViewerPage = React.lazy(() => import('./pages/admin/IPCameraViewerPage'));
const CategoryMasterPage = React.lazy(() => import('./pages/admin/CategoryMasterPage'));
const MediaManagerPage = React.lazy(() => import('./pages/admin/MediaManagerPage'));
const TransactionHistoryPage = React.lazy(() => import('./pages/inventory/TransactionHistoryPage'));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage'));
const LecturerClassPage = React.lazy(() => import('./pages/lecturer/LecturerClassPage'));
const CourseCatalogPage = React.lazy(() => import('./pages/learning/CourseCatalogPage'));

// Simple loading fallback
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

function App() {
    return (
        <SettingsProvider>
            <ThemeProvider>
                <Router>
                    <AuthProvider>
                        <ToastProvider>
                            <div className="min-h-screen bg-transparent font-poppins">
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                {/* Public */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<LoginPage />} />

                                {/* Student Routes */}
                                <Route path="/dashboard/student" element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <StudentDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/student/catalog" element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <CourseCatalogPage />
                                    </ProtectedRoute>
                                } />

                                {/* Lecturer Routes */}
                                <Route path="/dashboard/lecturer" element={
                                    <ProtectedRoute allowedRoles={['lecturer']}>
                                        <LecturerDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/lecturer/classes" element={
                                    <ProtectedRoute allowedRoles={['lecturer']}>
                                        <LecturerClassPage />
                                    </ProtectedRoute>
                                } />

                                {/* Admin Routes */}
                                <Route path="/dashboard/admin" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/ai-feedback" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AIFeedbackPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/users" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <UserManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/settings" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <SettingsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/courses" element={
                                    <ProtectedRoute allowedRoles={['admin', 'lecturer']}>
                                        <CourseManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/classes" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ClassMasterPage />
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/loans" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <LoanManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/laboratories" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <LabMasterPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/ip-camera" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <IPCameraViewerPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/categories" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <CategoryMasterPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/media" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <MediaManagerPage />
                                    </ProtectedRoute>
                                } />

                                {/* Shared Routes (all authenticated users) */}
                                <Route path="/inventory" element={
                                    <ProtectedRoute><InventoryPage /></ProtectedRoute>
                                } />
                                <Route path="/transactions" element={
                                    <ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>
                                } />
                                <Route path="/loans" element={
                                    <ProtectedRoute><ToolLoanPage /></ProtectedRoute>
                                } />
                                <Route path="/materials" element={
                                    <ProtectedRoute><MaterialRepositoryPage /></ProtectedRoute>
                                } />
                                <Route path="/calendar" element={
                                    <ProtectedRoute><CalendarPage /></ProtectedRoute>
                                } />
                                <Route path="/analytics" element={
                                    <ProtectedRoute><ResearchMetricsPage /></ProtectedRoute>
                                } />

                                <Route path="/lab/bacteria-detection" element={
                                    <ProtectedRoute><BacteriaDetectionPage /></ProtectedRoute>
                                } />

                                <Route path="/support" element={
                                    <ProtectedRoute><LabSupportPage /></ProtectedRoute>
                                } />
                                <Route path="/profile" element={
                                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                                } />
                                <Route path="/research/ueq" element={
                                    <ProtectedRoute><UEQQuestionnairePage /></ProtectedRoute>
                                } />
                            </Routes>
                        </Suspense>
                    </div>
                </ToastProvider>
            </AuthProvider>
        </Router>
        </ThemeProvider>
        </SettingsProvider>
    );
}

export default App;
