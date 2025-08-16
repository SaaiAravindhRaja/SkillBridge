import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const MySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/sessions/my');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: { bg: '#fbbf24', text: 'white' },
      active: { bg: '#10b981', text: 'white' },
      completed: { bg: '#667eea', text: 'white' },
      cancelled: { bg: '#ef4444', text: 'white' }
    };
    
    const style = statusClasses[status] || { bg: '#6b7280', text: 'white' };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        color: style.text
      }}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getSessionTitle = (session) => {
    const otherUser = user.userType === 'kid' ? session.volunteer : session.kid;
    return `${session.request?.subject} with ${otherUser?.name}`;
  };

  const getSessionSubtitle = (session) => {
    const otherUser = user.userType === 'kid' ? session.volunteer : session.kid;
    if (user.userType === 'kid') {
      return `Tutor: ${otherUser?.name} (${otherUser?.university})`;
    } else {
      return `Student: ${otherUser?.name} (Grade ${otherUser?.grade})`;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your sessions..." />;
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, color: 'rgba(45, 55, 72, 0.9)' }}>My Sessions</h1>
            <p style={{ margin: '4px 0 0 0', color: 'rgba(45, 55, 72, 0.7)' }}>
              Manage your {user.userType === 'kid' ? 'tutoring' : 'mentoring'} sessions
            </p>
          </div>
          
          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'scheduled', 'active', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>
              {filter === 'all' ? 'No sessions yet' : `No ${filter} sessions`}
            </h3>
            <p>
              {user.userType === 'kid' 
                ? "Request help to start your first tutoring session!"
                : "Accept help requests to start mentoring students!"
              }
            </p>
            <Link 
              to={user.userType === 'kid' ? '/request-help' : '/available-requests'}
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
            >
              {user.userType === 'kid' ? 'Request Help' : 'Find Students'}
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '24px', color: 'rgba(45, 55, 72, 0.8)' }}>
              {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` (${filter})`}
            </p>
            
            {filteredSessions.map((session) => (
              <div key={session.id} className="request-item" style={{ marginBottom: '16px' }}>
                <div className="request-header" style={{ marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'rgba(45, 55, 72, 0.9)' }}>
                      {getSessionTitle(session)}
                    </h3>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(45, 55, 72, 0.7)' }}>
                      {getSessionSubtitle(session)}
                    </p>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', color: 'rgba(45, 55, 72, 0.7)', marginBottom: '4px' }}>
                    <strong>Type:</strong> {session.request?.type} • 
                    <strong> Scheduled:</strong> {formatDate(session.scheduledTime)}
                  </div>
                  
                  {session.request?.description && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'rgba(45, 55, 72, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      marginTop: '8px'
                    }}>
                      <strong>Topic:</strong> {session.request.description}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Created {formatDate(session.createdAt)}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {session.status === 'scheduled' && (
                      <Link
                        to={`/session/${session.id}`}
                        className="btn btn-success"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        Join Session
                      </Link>
                    )}
                    
                    {session.status === 'active' && (
                      <Link
                        to={`/session/${session.id}`}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        Continue Session
                      </Link>
                    )}
                    
                    {session.status === 'completed' && (
                      <Link
                        to={`/session/${session.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        View Session
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>Session Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
              {sessions.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Sessions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Completed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>
              {sessions.filter(s => s.status === 'scheduled').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Upcoming</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              {sessions.filter(s => s.status === 'active').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Now</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySessions;