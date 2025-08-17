import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const SessionChat = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState('scheduled');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSession();
    fetchMessages();
    
    // Set up polling for new messages
    const messagePollingInterval = setInterval(() => {
      fetchMessages();
    }, 5000);
    
    return () => {
      clearInterval(messagePollingInterval);
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSession = async () => {
    try {
      const response = await api.get(`/sessions/my`);
      const userSession = response.data.find(s => s.id === parseInt(sessionId));
      if (userSession) {
        setSession(userSession);
        setSessionStatus(userSession.status);
      } else {
        navigate('/my-sessions');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      navigate('/my-sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/sessions/${sessionId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/sessions/${sessionId}/messages`, {
        message: newMessage,
        type: 'text'
      });
      
      // Fetch messages immediately after sending to update the UI
      fetchMessages();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/sessions/${sessionId}/status`, { status: newStatus });
      setSessionStatus(newStatus);
      // Refresh session data after status change
      fetchSession();
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#fbbf24',
      active: '#10b981',
      completed: '#667eea',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <LoadingSpinner message="Loading session..." />;
  }

  if (!session) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="card">
          <h2>Session Not Found</h2>
          <p>The session you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/my-sessions" className="btn btn-primary">
            Back to My Sessions
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = user.userType === 'kid' ? session.volunteer : session.kid;

  return (
    <div style={{ marginTop: '20px', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Session Header */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, color: 'rgba(45, 55, 72, 0.9)' }}>
              {session.request?.subject} - {session.request?.type}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'rgba(45, 55, 72, 0.7)' }}>
              with {otherUser?.name} {otherUser?.university && `(${otherUser.university})`}
              {otherUser?.grade && `(Grade ${otherUser.grade})`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span 
              style={{ 
                padding: '6px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: '600',
                backgroundColor: getStatusColor(sessionStatus),
                color: 'white'
              }}
            >
              {sessionStatus.toUpperCase()}
            </span>
            {sessionStatus === 'scheduled' && (
              <button 
                className="btn btn-success"
                onClick={() => handleStatusChange('active')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Start Session
              </button>
            )}
            {sessionStatus === 'active' && (
              <button 
                className="btn btn-primary"
                onClick={() => handleStatusChange('completed')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                End Session
              </button>
            )}
          </div>
        </div>
        
        {session.request?.description && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            fontSize: '14px',
            color: 'rgba(45, 55, 72, 0.8)'
          }}>
            <strong>Topic:</strong> {session.request.description}
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0' }}>
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'rgba(45, 55, 72, 0.6)',
              padding: '40px'
            }}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.senderId === user.id ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: message.senderId === user.id 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.3)',
                    color: message.senderId === user.id ? 'white' : 'rgba(45, 55, 72, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                    {message.message}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    opacity: 0.7,
                    textAlign: 'right'
                  }}>
                    {formatTime(message.createdAt || message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicator removed */}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              style={{ 
                flex: 1,
                padding: '12px 16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '25px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                fontSize: '14px'
              }}
              disabled={sessionStatus === 'completed' || sessionStatus === 'cancelled'}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newMessage.trim() || sessionStatus === 'completed' || sessionStatus === 'cancelled'}
              style={{ 
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '14px'
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionChat;