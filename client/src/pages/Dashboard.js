import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/requests/my');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      completed: 'status-completed'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getWhatsAppLink = (number, name) => {
    if (!number) return null;
    
    // Format WhatsApp number - remove any non-digit characters except the + at the beginning
    const formattedNumber = number.replace(/[^\d+]/g, '').replace(/^\+/, '');
    const message = `Hello ${name}, I'm contacting you regarding our SkillBridge tutoring session.`;
    
    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
  };
  
  console.log('Dashboard requests:', requests);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <div className="dashboard-grid">
        {/* Quick Action Card */}
        <div className="card">
          <h2 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>
            {user.userType === 'kid' ? 'Academic Support' : 'Share Your Expertise'}
          </h2>
          <p style={{ marginBottom: '24px', color: 'rgba(45, 55, 72, 0.7)' }}>
            {user.userType === 'kid' 
              ? 'Connect with expert tutors for personalized academic assistance'
              : 'Mentor students and make a meaningful impact on their learning journey'
            }
          </p>
          <Link
            to={user.userType === 'kid' ? '/request-help' : '/available-requests'}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {user.userType === 'kid' ? 'Request Tutoring' : 'Start Mentoring'}
          </Link>
        </div>

        {/* Stats Card */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>Your Progress</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
                {requests.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Total {user.userType === 'kid' ? 'Requests' : 'Sessions'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {requests.filter(r => r.status === 'completed').length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ marginBottom: '24px', color: 'rgba(45, 55, 72, 0.9)' }}>
          {user.userType === 'kid' ? 'Your Learning Sessions' : 'Your Mentoring Sessions'}
        </h3>
        
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>
              {user.userType === 'kid' 
                ? "Ready to accelerate your learning? Click 'Request Tutoring' to connect with an expert!"
                : "Ready to make an impact? Click 'Start Mentoring' to help students succeed!"
              }
            </p>
          </div>
        ) : (
          <div>
            {requests.slice(0, 5).map((request) => (
              <div key={request._id} className="request-item">
                <div className="request-header">
                  <div>
                    <span className="request-subject">{request.subject}</span>
                    <span style={{ margin: '0 8px', color: '#d1d5db' }}>•</span>
                    <span style={{ color: '#6b7280' }}>{request.type}</span>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                
                <div className="request-meta">
                  {user.userType === 'kid' && request.volunteer_name && (
                    <span>
                      Volunteer: {request.volunteer_name} 
                      {request.status === 'accepted' && request.volunteer_whatsapp_number && (
                        <>
                          {' • '}
                          <a 
                            href={getWhatsAppLink(request.volunteer_whatsapp_number, request.volunteer_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-link"
                          >
                            <i className="bi bi-whatsapp"></i> WhatsApp
                          </a>
                        </>
                      )}
                      {' • '}
                    </span>
                  )}
                  {user.userType === 'volunteer' && request.kid_name && (
                    <span>
                      Student: {request.kid_name} ({request.kid_grade || 'N/A'}) 
                      {request.status === 'accepted' && request.kid_whatsapp_number && (
                        <>
                          {' • '}
                          <a 
                            href={getWhatsAppLink(request.kid_whatsapp_number, request.kid_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-link"
                          >
                            <i className="bi bi-whatsapp"></i> WhatsApp
                          </a>
                        </>
                      )}
                      {' • '}
                    </span>
                  )}
                  Requested: {formatDate(request.createdAt)}
                </div>
                
                <p style={{ color: '#374151', fontSize: '14px' }}>
                  {request.description}
                </p>
              </div>
            ))}
            
            {requests.length > 5 && (
              <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px' }}>
                Showing 5 of {requests.length} {user.userType === 'kid' ? 'requests' : 'sessions'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;