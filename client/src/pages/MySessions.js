import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

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
      const response = await api.get('/sessions/my');
      
      if (!response.data || !Array.isArray(response.data)) {
        setSessions([]);
        return;
      }
      
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error.message);
      setSessions([]); // Set to empty array on error
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

  // Normalize the session data to handle inconsistent property naming
  const normalizedSessions = (sessions || []).map(session => {
    if (!session) return null;
    
    return {
      ...session,
      id: session.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      status: session.status || 'scheduled',
      scheduled_time: session.scheduled_time || session.scheduledTime || new Date().toISOString(),
      created_at: session.created_at || session.createdAt || new Date().toISOString(),
      subject: session.subject || 'General Help',
      type: session.type || 'Academic',
      description: session.description || 'No description provided',
      kid_name: session.kid_name || 'Unknown Student',
      volunteer_name: session.volunteer_name || 'Unknown Tutor'
    };
  }).filter(Boolean); // Remove any null values
  
  // Monitor sessions data changes
  useEffect(() => {
    // Component will re-render when sessions or normalizedSessions change
  }, [sessions, normalizedSessions]);
  
  const filteredSessions = normalizedSessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getSessionTitle = (session) => {
    return `${session.subject || 'Session'} - ${session.type || 'General Help'}`;
  };

  const getSessionSubtitle = (session) => {
    if (user.userType === 'kid') {
      return `Tutor: ${session.volunteer_name || 'Unknown'}`;
    } else {
      return `Student: ${session.kid_name || 'Unknown'} (${session.grade || 'N/A'})`;
    }
  };
  
  const getWhatsAppLink = (number, name) => {
    if (!number) return null;
    
    // Format WhatsApp number - remove any non-digit characters except the + at the beginning
    const formattedNumber = number.replace(/[^\d+]/g, '').replace(/^\+/, '');
    const message = `Hello ${name}, I'm contacting you regarding our SkillBridge tutoring session.`;
    
    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
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
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
              {normalizedSessions.length > 0 && filter !== 'all' 
                ? `You have ${normalizedSessions.length} session(s) with different status. Try the "All" filter to see them.` 
                : ''}
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
                    <strong>Type:</strong> {session.type} • 
                    <strong> Scheduled:</strong> {formatDate(session.scheduled_time)}
                    
                    {/* WhatsApp Contact */}
                    {session.status !== 'pending' && (
                      <>
                        {user.userType === 'kid' && session.volunteer_whatsapp_number && (
                          <>
                            {' • '}
                            <a 
                              href={getWhatsAppLink(session.volunteer_whatsapp_number, session.volunteer_name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="whatsapp-link"
                            >
                              <i className="bi bi-whatsapp"></i> Contact Tutor
                            </a>
                          </>
                        )}
                        
                        {user.userType === 'volunteer' && session.kid_whatsapp_number && (
                          <>
                            {' • '}
                            <a 
                              href={getWhatsAppLink(session.kid_whatsapp_number, session.kid_name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="whatsapp-link"
                            >
                              <i className="bi bi-whatsapp"></i> Contact Student
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  
                  {session.description && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'rgba(45, 55, 72, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      marginTop: '8px'
                    }}>
                      <strong>Topic:</strong> {session.description}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Created {formatDate(session.createdAt)}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to={`/session/${session.id}`}
                      className={`btn ${session.status === 'scheduled' ? 'btn-success' : 
                                        session.status === 'active' ? 'btn-primary' : 
                                        'btn-secondary'}`}
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      {session.status === 'scheduled' ? 'Join Session' : 
                       session.status === 'active' ? 'Continue Session' : 
                       'View Session'}
                    </Link>
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
              {normalizedSessions.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Sessions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {normalizedSessions.filter(s => s.status === 'completed').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Completed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>
              {normalizedSessions.filter(s => s.status === 'scheduled').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Upcoming</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              {normalizedSessions.filter(s => s.status === 'active').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Now</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySessions;