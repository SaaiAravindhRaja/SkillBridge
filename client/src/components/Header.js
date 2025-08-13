import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            SkillBridge
          </Link>
          
          {user && (
            <nav className="nav-links">
              <Link to="/">Dashboard</Link>
              
              {user.userType === 'kid' && (
                <Link to="/request-help">Request Tutoring</Link>
              )}
              
              {user.userType === 'volunteer' && (
                <Link to="/available-requests">Find Students</Link>
              )}
              
              <span>Hi, {user.name}!</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;