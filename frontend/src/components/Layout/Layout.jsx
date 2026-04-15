import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './Layout.css';
import Button from '../Button/Button';

const Layout = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <header className="layout-header">
        <div className="header-content">
          <nav className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">Каталог</Link>
                <Link to="/profile" className="nav-link">Профиль</Link>
                <Button variant="secondary" onClick={handleLogout} className="logout-btn">
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Войти</Link>
                <Link to="/register">
                  <Button variant="primary">Регистрация</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="layout-main">
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;