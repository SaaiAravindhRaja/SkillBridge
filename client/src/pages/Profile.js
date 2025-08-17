import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await api.get('/users/profile');
      console.log('Profile response:', response.data);
      
      // Normalize the user data
      const profileData = response.data;
      
      // Fix user type property if needed
      if (profileData.user_type && !profileData.userType) {
        profileData.userType = profileData.user_type;
      }
      
      // Make sure rating is a number or null
      if (profileData.rating === undefined || profileData.rating === null || profileData.rating === '') {
        profileData.rating = 0;
      } else if (typeof profileData.rating === 'string') {
        profileData.rating = parseFloat(profileData.rating) || 0;
      }
      
      // Make sure totalSessions is a number
      if (profileData.total_sessions !== undefined && profileData.totalSessions === undefined) {
        profileData.totalSessions = profileData.total_sessions;
      }
      if (typeof profileData.totalSessions !== 'number') {
        profileData.totalSessions = parseInt(profileData.totalSessions || '0') || 0;
      }
      
      // Make sure badges is an array
      if (!Array.isArray(profileData.badges)) {
        profileData.badges = [];
      }
      
      setProfile(profileData);
      setFormData(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/users/profile', formData);
      setProfile(response.data);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectsChange = (subject) => {
    const currentSubjects = formData.subjects || [];
    const updatedSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    
    setFormData(prev => ({
      ...prev,
      subjects: updatedSubjects
    }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div style={{ marginTop: '32px', maxWidth: '800px', margin: '32px auto' }}>
      <div className="card">
        <h1 style={{ marginBottom: '8px', color: 'rgba(45, 55, 72, 0.9)' }}>
          My Profile
        </h1>
        <p style={{ color: 'rgba(45, 55, 72, 0.7)', marginBottom: '32px' }}>
          Update your information and preferences
        </p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>
              Basic Information
            </h3>
            
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'rgba(45, 55, 72, 0.6)', fontSize: '12px' }}>
                Email cannot be changed
              </small>
            </div>

            <div className="form-group">
              <label>User Type</label>
              <input
                type="text"
                value={formData.userType === 'kid' ? 'Student' : 'Tutor'}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'rgba(45, 55, 72, 0.6)', fontSize: '12px' }}>
                User type cannot be changed
              </small>
            </div>
          </div>

          {/* Type-specific Information */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>
              {user.userType === 'kid' ? 'Student Information' : 'Tutor Information'}
            </h3>

            {user.userType === 'kid' ? (
              <>
                <div className="form-group">
                  <label>School Name</label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Grade</label>
                  <select
                    name="grade"
                    value={formData.grade || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Grade</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Guardian Contact (Optional)</label>
                  <input
                    type="email"
                    name="parentContact"
                    value={formData.parentContact || ''}
                    onChange={handleChange}
                    placeholder="guardian@example.com"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>School/University</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Year/Level</label>
                  <select
                    name="year"
                    value={formData.year || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="High School">High School</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Areas of Expertise</label>
                  <div className="subjects-grid">
                    {['Math', 'Science', 'English', 'History', 'Computer Science', 'Other'].map(subject => {
                      const selected = (formData.subjects || []).includes(subject);
                      return (
                        <label key={subject} className={`subject-pill ${selected ? 'selected' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleSubjectsChange(subject)}
                          />
                          {subject}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Statistics */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>
              Your Statistics
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '16px',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
                  {profile.totalSessions || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Total Sessions
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                  {profile.rating && !isNaN(parseFloat(profile.rating)) ? parseFloat(profile.rating).toFixed(1) : 'N/A'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Average Rating
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>
                  {profile.badges?.length || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Badges Earned
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                  {profile.isVerified ? 'Yes' : 'No'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Verified
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFormData(profile)}
              disabled={saving}
            >
              Reset Changes
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: '120px' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;