import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../utils/api';

const RequestHelp = () => {
  const [formData, setFormData] = useState({
    subject: '',
    type: '',
    description: '',
    preferredTime: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  const subjects = ['Math', 'Science', 'English', 'History', 'Computer Science', 'Other'];
  const types = ['Homework', 'Concept Understanding', 'Test Prep', 'General Help'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting request with data:', formData);
      
      // Convert preferredTime to ISO string if needed
      const requestData = {
        ...formData,
        preferredTime: new Date(formData.preferredTime).toISOString()
      };
      
      console.log('Processed request data:', requestData);
      
      await api.post('/requests', requestData);
      showSuccess('Help request submitted successfully! A volunteer will be matched with you soon.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting request:', error);
      if (error.response?.data?.details) {
        console.error('Validation errors:', error.response.data.details);
        showError(`Failed to submit request: ${error.response.data.details.map(d => d.msg).join(', ')}`);
      } else {
        showError('Failed to submit request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Generate time slots for the next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      // Add slots for 3 PM to 8 PM
      for (let hour = 15; hour <= 20; hour++) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);
        
        if (slotTime > now) { // Only future slots
          const isoString = slotTime.toISOString();
          console.log('Generated time slot:', isoString);
          
          slots.push({
            value: isoString,
            label: slotTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })
          });
        }
      }
    }
    
    return slots;
  };

  return (
    <div style={{ maxWidth: '600px', margin: '32px auto' }}>
      <div className="card">
        <h1 style={{ marginBottom: '8px', color: 'rgba(45, 55, 72, 0.9)' }}>Request Academic Support</h1>
        <p style={{ color: 'rgba(45, 55, 72, 0.7)', marginBottom: '32px' }}>
          Share your learning goals and we'll connect you with an expert tutor
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject</label>
            <select
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Type of Help</label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">Select type of help</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Preferred Time</label>
            <select
              name="preferredTime"
              required
              value={formData.preferredTime}
              onChange={handleChange}
            >
              <option value="">Select preferred time</option>
              {generateTimeSlots().map(slot => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              required
              rows="4"
              placeholder="Describe what you need help with. Be specific about the topic or problem you're working on..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? 'Connecting...' : 'Find My Tutor'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>Your Learning Journey</h3>
        <div style={{ color: 'rgba(45, 55, 72, 0.7)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '12px' }}>
            1. Expert tutors specializing in {formData.subject || 'your subject'} will review your request
          </p>
          <p style={{ marginBottom: '12px' }}>
            2. A qualified mentor will accept your request and reach out to you
          </p>
          <p style={{ marginBottom: '12px' }}>
            3. Connect with your tutor for a personalized learning session
          </p>
          <p>
            4. Provide feedback and continue your academic growth with additional sessions
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestHelp;