import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Custom styles for improved UI
const styles = {
  container: {
    maxWidth: '550px',
    margin: '50px auto'
  },
  card: {
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    border: 'none',
    overflow: 'hidden',
    background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
    position: 'relative'
  },
  cardBody: {
    padding: '2.5rem',
    position: 'relative'
  },
  cardBorder: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '4px',
    background: 'linear-gradient(to right, #4f46e5, #8b5cf6)',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px'
  },
  logo: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: '2.5rem',
    letterSpacing: '-0.5px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.8rem',
    fontWeight: '700',
    fontSize: '1.75rem',
    color: '#1e293b'
  },
  formGroup: {
    marginBottom: '1.8rem'
  },
  label: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#334155',
    fontSize: '0.95rem'
  },
  input: {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '1rem',
    transition: 'all 0.2s ease-in-out',
    height: 'auto',
    width: '100%',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  },
  inputFocus: {
    borderColor: '#4f46e5',
    boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.15)',
    backgroundColor: '#fff'
  },
  button: {
    padding: '14px 0',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '10px',
    transition: 'all 0.25s ease-in-out',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    border: 'none'
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    color: '#334155',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  linkButton: {
    color: '#4f46e5',
    textDecoration: 'none',
    padding: '0',
    background: 'none',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s ease-in-out'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '14px 18px',
    borderRadius: '10px',
    marginBottom: '1.8rem',
    fontWeight: '500',
    border: '1px solid #fecaca',
    fontSize: '0.95rem'
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
    gap: '12px'
  },
  step: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 5px',
    backgroundColor: '#e2e8f0',
    color: '#64748b',
    fontWeight: '600',
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    fontSize: '1rem'
  },
  stepActive: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
    transform: 'scale(1.05)'
  },
  stepCompleted: {
    backgroundColor: '#22c55e',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(34, 197, 94, 0.25)'
  },
  userTypeCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.25s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    backgroundColor: '#ffffff'
  },
  userTypeSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f7ff',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.12)',
    transform: 'translateY(-2px)'
  },
  userTypeIcon: {
    fontSize: '32px',
    marginRight: '16px',
    backgroundColor: '#f1f5f9',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
  },
  checkboxContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '12px'
  },
  checkbox: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    transition: 'all 0.25s ease-in-out',
    fontWeight: '500',
    fontSize: '0.95rem'
  },
  checkboxSelected: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    borderColor: '#4f46e5',
    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
    transform: 'translateY(-2px)'
  }
};

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleToggleMode = () => {
    setIsRegistering(!isRegistering);
    setStep(1);
    setError('');
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await loginWithEmail(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        // Handle network errors with a more user-friendly message
        if (result.isNetworkError) {
          setError(
            'Cannot connect to the server. Please check that the server is running and try again.'
          );
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Unhandled error during login:', err);
    }
    
    setLoading(false);
  };

  const handleEmailRegistration = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!userType) {
      setError('Please select if you are a kid or volunteer first');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await registerWithEmail(email, password, name, userType, additionalInfo);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    }
    
    setLoading(false);
  };
  
  const handleAdditionalInfoSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields and WhatsApp number
    if (!additionalInfo.whatsappNumber) {
      setError('Please enter your WhatsApp number');
      return;
    }
    
    // Basic WhatsApp number validation (should start with + and have at least 10 digits)
    const whatsappRegex = /^\+[0-9]{10,15}$/;
    if (!whatsappRegex.test(additionalInfo.whatsappNumber)) {
      setError('Please enter a valid WhatsApp number with country code (e.g., +1234567890)');
      return;
    }
    
    if (userType === 'kid') {
      if (!additionalInfo.school || !additionalInfo.grade) {
        setError('Please fill in all required fields (School and Grade)');
        return;
      }
    } else if (userType === 'volunteer') {
      if (!additionalInfo.university || !additionalInfo.year) {
        setError('Please fill in all required fields (University and Year)');
        return;
      }
    }
    
    handleEmailRegistration(e);
  };

  if (!isRegistering) {
    // Login Form
    return (
      <div className="container" style={styles.container}>
        <div className="card" style={styles.card}>
          <div style={styles.cardBorder}></div>
          <div className="card-body" style={styles.cardBody}>
            <h1 style={styles.logo}>
              SkillBridge
            </h1>
            <h2 style={styles.title}>Welcome Back</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <form onSubmit={handleEmailLogin}>
              <div style={styles.formGroup}>
                <label htmlFor="email" className="form-label" style={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                    e.target.style.backgroundColor = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="password" className="form-label" style={styles.label}>Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                    e.target.style.backgroundColor = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                  required
                />
              </div>
              <div className="d-grid gap-2">
                <button 
                  type="submit" 
                  className="btn"
                  style={{...styles.button, ...styles.primaryButton}}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#4338ca';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#4f46e5';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <i className="fas fa-circle-notch fa-spin" style={{marginRight: '8px'}}></i>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </div>
            </form>
            
            <div className="text-center mt-4">
              <p>Don't have an account? <button 
                style={styles.linkButton} 
                onClick={handleToggleMode}
                onMouseOver={(e) => {
                  e.target.style.color = '#4338ca';
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#4f46e5';
                  e.target.style.textDecoration = 'none';
                }}
              >Create an account</button></p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Registration Form
    return (
      <div className="container" style={styles.container}>
        <div className="card" style={styles.card}>
          <div style={styles.cardBorder}></div>
          <div className="card-body" style={styles.cardBody}>
            <h1 style={styles.logo}>
              SkillBridge
            </h1>            {step === 1 && (
              <>
                <h2 style={styles.title}>Create an Account</h2>
                
                <div style={styles.stepIndicator}>
                  <div style={{...styles.step, ...styles.stepActive}}>1</div>
                  <div style={styles.step}>2</div>
                  <div style={styles.step}>3</div>
                </div>
                
                <div style={{marginBottom: '1.5rem'}}>
                  <h5 style={{fontWeight: '600', marginBottom: '1rem'}}>I am a:</h5>
                  
                  <div 
                    style={{
                      ...styles.userTypeCard, 
                      ...(userType === 'kid' ? styles.userTypeSelected : {})
                    }}
                    onClick={() => setUserType('kid')}
                  >
                    <div style={styles.userTypeIcon}>👨‍🎓</div>
                    <div>
                      <div style={{fontWeight: '500'}}>Student</div>
                      <div style={{fontSize: '0.9rem', color: '#64748b'}}>Looking for help with schoolwork</div>
                    </div>
                  </div>
                  
                  <div 
                    style={{
                      ...styles.userTypeCard, 
                      ...(userType === 'volunteer' ? styles.userTypeSelected : {})
                    }}
                    onClick={() => setUserType('volunteer')}
                  >
                    <div style={styles.userTypeIcon}>👩‍🏫</div>
                    <div>
                      <div style={{fontWeight: '500'}}>Volunteer</div>
                      <div style={{fontSize: '0.9rem', color: '#64748b'}}>Ready to help students learn</div>
                    </div>
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button
                    style={{...styles.button, ...styles.primaryButton}}
                    onClick={() => userType ? setStep(2) : setError('Please select if you are a student or volunteer')}
                    disabled={!userType}
                    type="button"
                    className="btn"
                    onMouseOver={(e) => {
                      if (userType) {
                        e.target.style.backgroundColor = '#4338ca';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#4f46e5';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
                    }}
                  >
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{marginLeft: '8px'}}>
                        <path fillRule="evenodd" d="M8.5 1.5a.5.5 0 0 0-1 0v5.793L5.354 5.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 7.293V1.5z" transform="rotate(90) translate(0, -16)"/>
                      </svg>
                    </span>
                  </button>
                </div>
              </>
            )}
            
            {step === 2 && (
              <>
                <h2 style={styles.title}>
                  {userType === 'kid' ? 'Student Registration' : 'Volunteer Registration'}
                </h2>
                
                <div style={styles.stepIndicator}>
                  <div style={{...styles.step, ...styles.stepCompleted}}>✓</div>
                  <div style={{...styles.step, ...styles.stepActive}}>2</div>
                  <div style={styles.step}>3</div>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setStep(3);
                }}>
                  <div style={styles.formGroup}>
                    <label htmlFor="name" className="form-label" style={styles.label}>Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4f46e5';
                        e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                        e.target.style.backgroundColor = '#fff';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#f8fafc';
                      }}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label htmlFor="email" className="form-label" style={styles.label}>Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4f46e5';
                        e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                        e.target.style.backgroundColor = '#fff';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#f8fafc';
                      }}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label htmlFor="password" className="form-label" style={styles.label}>Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a secure password (min. 6 characters)"
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4f46e5';
                        e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                        e.target.style.backgroundColor = '#fff';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#f8fafc';
                      }}
                      required
                      minLength="6"
                    />
                    <small className="text-muted">Password must be at least 6 characters long</small>
                  </div>
                  <div className="d-flex justify-content-between" style={{marginTop: '2rem', gap: '16px'}}>
                    <button 
                      className="btn" 
                      onClick={() => setStep(1)} 
                      type="button"
                      style={{...styles.button, ...styles.secondaryButton, width: '40%'}}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#cbd5e1';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#e2e8f0';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '8px'}}>
                          <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                        </svg>
                        Back
                      </span>
                    </button>
                    <button 
                      type="submit" 
                      className="btn"
                      style={{...styles.button, ...styles.primaryButton, width: '60%'}}
                      disabled={!name || !email || !password}
                      onMouseOver={(e) => {
                        if (name && email && password) {
                          e.target.style.backgroundColor = '#4338ca';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#4f46e5';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
                      }}
                    >
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        Continue
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginLeft: '8px'}}>
                          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      </span>
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {step === 3 && (
              <>
                <h2 style={styles.title}>
                  {userType === 'kid' ? 'Student Information' : 'Volunteer Information'}
                </h2>
                
                <div style={styles.stepIndicator}>
                  <div style={{...styles.step, ...styles.stepCompleted}}>✓</div>
                  <div style={{...styles.step, ...styles.stepCompleted}}>✓</div>
                  <div style={{...styles.step, ...styles.stepActive}}>3</div>
                </div>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleAdditionalInfoSubmit}>
                  {userType === 'kid' ? (
                    <>
                      <div style={styles.formGroup}>
                        <label htmlFor="school" className="form-label" style={styles.label}>School Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="school"
                          value={additionalInfo.school || ''}
                          onChange={(e) => setAdditionalInfo({...additionalInfo, school: e.target.value})}
                          placeholder="Enter your school name"
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor="grade" className="form-label" style={styles.label}>Grade Level</label>
                        <select 
                          className="form-select" 
                          id="grade"
                          value={additionalInfo.grade || ''}
                          onChange={(e) => setAdditionalInfo({...additionalInfo, grade: e.target.value})}
                          style={{...styles.input, appearance: 'auto'}}
                          required
                        >
                          <option value="">Select Your Grade</option>
                          <option value="1">Grade 1</option>
                          <option value="2">Grade 2</option>
                          <option value="3">Grade 3</option>
                          <option value="4">Grade 4</option>
                          <option value="5">Grade 5</option>
                          <option value="6">Grade 6</option>
                          <option value="7">Grade 7</option>
                          <option value="8">Grade 8</option>
                          <option value="9">Grade 9</option>
                          <option value="10">Grade 10</option>
                          <option value="11">Grade 11</option>
                          <option value="12">Grade 12</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor="parentContact" className="form-label" style={styles.label}>Parent Contact (optional)</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="parentContact"
                          value={additionalInfo.parentContact || ''}
                          onChange={(e) => setAdditionalInfo({...additionalInfo, parentContact: e.target.value})}
                          placeholder="Parent's email or phone number"
                          style={styles.input}
                        />
                        <small className="text-muted">This helps us ensure a safe learning environment</small>
                      </div>
                      
                      <div style={styles.formGroup}>
                        <label htmlFor="whatsappNumber" className="form-label" style={styles.label}>WhatsApp Number</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          id="whatsappNumber"
                          value={additionalInfo.whatsappNumber || ''}
                          onChange={(e) => setAdditionalInfo({...additionalInfo, whatsappNumber: e.target.value})}
                          placeholder="Enter WhatsApp number with country code (e.g., +1234567890)"
                          style={styles.input}
                          required
                        />
                        <small className="text-muted">We'll use this for session coordination</small>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.formGroup}>
                        <label htmlFor="university" className="form-label" style={styles.label}>University/College</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="university"
                          value={additionalInfo.university || ''}
                          onChange={(e) => setAdditionalInfo({...additionalInfo, university: e.target.value})}
                          placeholder="Enter your university or college name"
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label htmlFor="year" className="form-label" style={styles.label}>Year/Level</label>
                        <select 
                          className="form-select" 
                          id="year"
                          value={additionalInfo.year || ''}
                          onChange={(e) => setAdditionalInfo({...additionalInfo, year: e.target.value})}
                          style={{...styles.input, appearance: 'auto'}}
                          required
                        >
                          <option value="">Select Your Year</option>
                          <option value="High School">High School</option>
                          <option value="Freshman">Freshman</option>
                          <option value="Sophomore">Sophomore</option>
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Graduate">Graduate</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label className="form-label" style={styles.label}>Subjects You Can Help With</label>
                        <div style={styles.checkboxContainer}>
                          {['Math', 'Science', 'English', 'History', 'Computer Science', 'Other'].map(subject => (
                            <div 
                              key={subject}
                              style={{
                                ...styles.checkbox,
                                ...(additionalInfo.subjects?.includes(subject) ? styles.checkboxSelected : {})
                              }}
                              onClick={() => {
                                const subjects = additionalInfo.subjects || [];
                                if (subjects.includes(subject)) {
                                  setAdditionalInfo({...additionalInfo, subjects: subjects.filter(s => s !== subject)});
                                } else {
                                  setAdditionalInfo({...additionalInfo, subjects: [...subjects, subject]});
                                }
                              }}
                            >
                              {subject}
                            </div>
                          ))}
                        </div>
                        <small className="text-muted">Select all subjects you're comfortable tutoring</small>
                      </div>
                      
                      <div style={styles.formGroup}>
                        <label htmlFor="whatsappNumber" className="form-label" style={styles.label}>WhatsApp Number</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          id="whatsappNumber"
                          value={additionalInfo.whatsappNumber || ''}
                          onChange={(e) => setAdditionalInfo({...additionalInfo, whatsappNumber: e.target.value})}
                          placeholder="Enter WhatsApp number with country code (e.g., +1234567890)"
                          style={styles.input}
                          required
                        />
                        <small className="text-muted">Students will contact you via WhatsApp for tutoring sessions</small>
                      </div>
                    </>
                  )}
                  <div className="d-flex justify-content-between" style={{marginTop: '2rem', gap: '16px'}}>
                    <button 
                      className="btn" 
                      onClick={() => setStep(2)} 
                      type="button"
                      style={{...styles.button, ...styles.secondaryButton, width: '40%'}}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#cbd5e1';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#e2e8f0';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '8px'}}>
                          <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                        </svg>
                        Back
                      </span>
                    </button>
                    <button 
                      type="submit" 
                      className="btn"
                      style={{...styles.button, ...styles.primaryButton, width: '60%'}}
                      disabled={loading}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.target.style.backgroundColor = '#4338ca';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#4f46e5';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
                      }}
                    >
                      {loading ? (
                        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <i className="fas fa-circle-notch fa-spin" style={{marginRight: '8px'}}></i>
                          Creating Account...
                        </span>
                      ) : (
                        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          Complete Registration
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{marginLeft: '8px'}}>
                            <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm.354-5.854a.5.5 0 0 0-.708 0l-2 2a.5.5 0 1 0 .708.708L8 10.207l1.646 1.647a.5.5 0 0 0 .708-.708l-2-2z" transform="translate(16, 0) scale(-1, 1) rotate(90)" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
            
            <div className="text-center mt-4">
              <p>Already have an account? <button 
                style={styles.linkButton} 
                onClick={handleToggleMode}
                onMouseOver={(e) => {
                  e.target.style.color = '#4338ca';
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#4f46e5';
                  e.target.style.textDecoration = 'none';
                }}
              >Sign in</button></p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Login;