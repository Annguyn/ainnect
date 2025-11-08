import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Contact from './pages/Contact';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import SearchPage from './pages/SearchPage';
import FriendRequestsPage from './pages/FriendRequestsPage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import FriendsPage from './pages/FriendsPage';
import BlockedUsersPage from './pages/BlockedUsersPage';
import ReportsPage from './pages/ReportsPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupPage } from './pages/GroupPage';
import MessagingPage from './pages/MessagingPage';
import ConversationPage from './pages/ConversationPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminGroupsPage } from './pages/admin/AdminGroupsPage';
import { AdminPostsPage } from './pages/admin/AdminPostsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminProtectedRoute } from './components/admin';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<SearchPage />} />
        
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        
        <Route path="/friend-requests" element={<FriendRequestsPage />} />
        <Route path="/followers" element={<FollowersPage />} />
        <Route path="/followers/:userId" element={<FollowersPage />} />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/following/:userId" element={<FollowingPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/friends/:userId" element={<FriendsPage />} />
        <Route path="/blocked-users" element={<BlockedUsersPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        <Route path="/notifications" element={<NotificationsPage />} />

        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />

        {/* Messaging Routes */}
        <Route path="/messages" element={<MessagingPage />} />
        <Route path="/messages/:conversationId" element={<ConversationPage />} />
        
        {/* Backward compatibility - redirect old messaging route */}
        <Route path="/messaging" element={<Navigate to="/messages" replace />} />
        <Route path="/messaging/:conversationId" element={<Navigate to="/messages/:conversationId" replace />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsersPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <AdminProtectedRoute>
              <AdminGroupsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <AdminProtectedRoute>
              <AdminPostsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminProtectedRoute>
              <AdminLogsPage />
            </AdminProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
