import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Onboarding from './pages/Onboarding/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import Lesson from './pages/Lesson/Lesson';
import LessonReview from './pages/LessonReview/LessonReview';
import Dictionary from './pages/Dictionary/Dictionary';
import Profile from './pages/Profile/Profile';
import './styles/global.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route
            path="onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="lesson/:id/review"
            element={
              <PrivateRoute>
                <LessonReview />
              </PrivateRoute>
            }
          />
          <Route
            path="lesson/:id"
            element={
              <PrivateRoute>
                <Lesson />
              </PrivateRoute>
            }
          />
          <Route
            path="dictionary"
            element={
              <PrivateRoute>
                <Dictionary />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
