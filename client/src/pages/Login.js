import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Simplified Google Auth simulation for demo
  const handleGoogleLogin = async () => {
    if (!userType) {
      alert('Please select if you are a kid or volunteer first');
      return;
    }

    setLoading(true);

    // Simulate Google OAuth response
    const mockGoogleData = {
      googleId: `demo_${userType}_${Date.now()}`,
      profileObj: {
        email: userType === 'kid' ? `demo.kid.${Date.now()}@example.com` : `demo.volunteer.${Date.now()}@example.com`,
        name: userType === 'kid' ? 'Demo Student' : 'Demo Tutor'
      }
    };

    const result = await login(mockGoogleData, userType, additionalInfo);

    if (result.success) {
      navigate('/');
    } else {
      alert(result.error);
    }

    setLoading(false);
  };

  const handleAdditionalInfoSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (userType === 'kid') {
      if (!additionalInfo.school || !additionalInfo.grade) {
        alert('Please fill in all required fields (School and Grade)');
        return;
      }
    } else if (userType === 'volunteer') {
      if (!additionalInfo.university || !additionalInfo.year) {
        alert('Please fill in all required fields (University and Year)');
        return;
      }
    }
    
    handleGoogleLogin();
  };

  if (step === 1) {
    return (
      <div className="container" style={{ maxWidth: '500px', marginTop: '100px' }}>
        <div className="card">
          <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#4f46e5' }}>
            Welcome to SkillBridge
          </h1>
          <p style={{ textAlign: 'center', marginBottom: '32px', color: 'rgba(45, 55, 72, 0.7)' }}>
            Connecting students with expert tutors for academic excellence
          </p>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'rgba(45, 55, 72, 0.9)' }}>I am joining as a:</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                className={`btn ${userType === 'kid' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setUserType('kid')}
                style={{ flex: 1 }}
              >
                Student
              </button>
              <button
                className={`btn ${userType === 'volunteer' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setUserType('volunteer')}
                style={{ flex: 1 }}
              >
                Tutor
              </button>
            </div>
          </div>

          {userType && (
            <button
              className="btn btn-primary"
              onClick={() => setStep(2)}
              style={{ width: '100%' }}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '24px', color: 'rgba(45, 55, 72, 0.9)' }}>
          {userType === 'kid' ? 'Student Profile Setup' : 'Tutor Profile Setup'}
        </h2>

        <form onSubmit={handleAdditionalInfoSubmit}>
          {userType === 'kid' ? (
            <>
              <div className="form-group">
                <label>School Name</label>
                <input
                  type="text"
                  required
                  value={additionalInfo.school || ''}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, school: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Grade</label>
                <select
                  required
                  value={additionalInfo.grade || ''}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, grade: e.target.value })}
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
                  placeholder="guardian@example.com"
                  value={additionalInfo.parentContact || ''}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, parentContact: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>School/University</label>
                <input
                  type="text"
                  required
                  value={additionalInfo.university || ''}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, university: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Year/Level</label>
                <select
                  required
                  value={additionalInfo.year || ''}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, year: e.target.value })}
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
                    const selected = (additionalInfo.subjects || []).includes(subject);
                    return (
                      <label key={subject} className={`subject-pill ${selected ? 'selected' : ''}`}>
                        {/* Keep a hidden checkbox for accessibility & form semantics */}
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const subjects = additionalInfo.subjects || [];
                            const next = e.target.checked
                              ? [...subjects, subject]
                              : subjects.filter(s => s !== subject);
                            setAdditionalInfo({ ...additionalInfo, subjects: next });
                          }}
                        />
                        {subject}
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? 'Creating Profile...' : 'Join SkillBridge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;