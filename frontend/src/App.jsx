import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Lesson from './pages/Lesson/Lesson';
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
          <Route 
            path="dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
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