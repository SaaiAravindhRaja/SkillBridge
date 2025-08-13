import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AvailableRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableRequests();
  }, []);

  const fetchAvailableRequests = async () => {
    try {
      const response = await axios.get('/api/requests/available');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`/api/requests/${requestId}/accept`);
      alert('Request accepted! You can now help this student.');
      fetchAvailableRequests(); // Refresh the list
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. It may have been taken by another volunteer.');
    }
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

  const getTimeUntil = (dateString) => {
    const now = new Date();
    const requestTime = new Date(dateString);
    const diffHours = Math.ceil((requestTime - now) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than 1 hour';
    if (diffHours < 24) return `${diffHours} hours`;
    return `${Math.ceil(diffHours / 24)} days`;
  };

  if (loading) {
    return <div>Loading available requests...</div>;
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '8px', color: 'rgba(45, 55, 72, 0.9)' }}>Mentoring Opportunities</h1>
        <p style={{ color: 'rgba(45, 55, 72, 0.7)', marginBottom: '24px' }}>
          Select students to mentor based on your expertise and availability
        </p>
        
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>No mentoring opportunities available</h3>
            <p>Check back soon for new learning requests from students!</p>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '24px', color: 'rgba(45, 55, 72, 0.8)' }}>
              {requests.length} student{requests.length !== 1 ? 's' : ''} seeking academic support
            </p>
            
            {requests.map((request) => (
              <div key={request._id} className="request-item">
                <div className="request-header">
                  <div>
                    <span className="request-subject">{request.subject}</span>
                    <span style={{ margin: '0 8px', color: '#d1d5db' }}>•</span>
                    <span style={{ color: '#6b7280' }}>{request.type}</span>
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#059669',
                    fontWeight: '600'
                  }}>
                    In {getTimeUntil(request.preferredTime)}
                  </span>
                </div>
                
                <div className="request-meta">
                  Student: {request.kidId.name} ({request.kidId.grade}) from {request.kidId.school} • 
                  Preferred time: {formatDate(request.preferredTime)}
                </div>
                
                <p style={{ 
                  color: '#374151', 
                  fontSize: '14px', 
                  marginBottom: '16px',
                  lineHeight: '1.5'
                }}>
                  {request.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Requested {formatDate(request.createdAt)}
                  </span>
                  <button
                    className="btn btn-success"
                    onClick={() => handleAcceptRequest(request._id)}
                  >
                    Accept & Mentor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>Your Impact as a Mentor</h3>
        <div style={{ color: 'rgba(45, 55, 72, 0.7)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '12px' }}>
            1. Review learning requests in your areas of expertise
          </p>
          <p style={{ marginBottom: '12px' }}>
            2. Select "Accept & Mentor" for requests that align with your schedule
          </p>
          <p style={{ marginBottom: '12px' }}>
            3. Connect with your student for a personalized tutoring session
          </p>
          <p>
            4. Guide them through concepts and help build their academic confidence
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvailableRequests;