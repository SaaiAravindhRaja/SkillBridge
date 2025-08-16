import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequestHelp from './pages/RequestHelp';
import AvailableRequests from './pages/AvailableRequests';
import SessionChat from './pages/SessionChat';
import MySessions from './pages/MySessions';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <Router>
              <div className="App">
                <Header />
                <main className="container">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/request-help" element={
                      <ProtectedRoute userType="kid">
                        <RequestHelp />
                      </ProtectedRoute>
                    } />
                    <Route path="/available-requests" element={
                      <ProtectedRoute userType="volunteer">
                        <AvailableRequests />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-sessions" element={
                      <ProtectedRoute>
                        <MySessions />
                      </ProtectedRoute>
                    } />
                    <Route path="/session/:sessionId" element={
                      <ProtectedRoute>
                        <SessionChat />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
              </div>
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;