import React, { useState } from 'react';
import { Smartphone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, HelpCircle, ArrowLeft, AlertCircle, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';

export default function StudentLogin({ apiBaseUrl, onLoginSuccess, onGoToWebsite, onBackToWebsite, onGoToStaffLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'create'
  const handleGoBack = onGoToWebsite || onBackToWebsite;
  
  // Login form state
  const [mobileNumber, setMobileNumber] = useState('');
  const [mpin, setMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  
  // Create MPIN form state
  const [createMobile, setCreateMobile] = useState('');
  const [createMpin, setCreateMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [showCreateMpin, setShowCreateMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleMobileChange = (e, setter) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setter(val);
    setError('');
  };

  const handleMpinChange = (e, setter) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setter(val);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mobileNumber.length !== 10) {
      setError('Please enter your 10-digit registered mobile number');
      return;
    }
    if (mpin.length !== 6) {
      setError('Please enter your 6-digit MPIN');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, mpin })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.needsMpinSetup) {
          setCreateMobile(mobileNumber);
        }
        throw new Error(data.error || 'Login failed. Please verify your credentials.');
      }

      if (data.token) {
        localStorage.setItem('umai_student_token', data.token);
        if (data.student) {
          localStorage.setItem('umai_student_data', JSON.stringify(data.student));
        }
        document.cookie = `umai_student_token=${encodeURIComponent(data.token)}; path=/; max-age=604800;`;
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (createMobile.length !== 10) {
      setError('Please enter your 10-digit registered mobile number');
      return;
    }
    if (createMpin.length !== 6) {
      setError('MPIN must be exactly 6 numeric digits');
      return;
    }
    if (createMpin !== confirmMpin) {
      setError('Confirm MPIN does not match new MPIN');
      return;
    }

    const weakList = [
      '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999',
      '123456', '234567', '345678', '456789', '567890', '654321', '765432', '876543', '987654', '098765'
    ];
    if (weakList.includes(createMpin) || /^(\d{2})\1\1$/.test(createMpin)) {
      setError('This MPIN is too predictable. Avoid sequences like 123456 or repeated digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/student/create-mpin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: createMobile,
          newMpin: createMpin,
          confirmMpin: confirmMpin
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create MPIN. Please try again.');
      }

      if (data.token) {
        localStorage.setItem('umai_student_token', data.token);
        if (data.student) {
          localStorage.setItem('umai_student_data', JSON.stringify(data.student));
        }
        document.cookie = `umai_student_token=${encodeURIComponent(data.token)}; path=/; max-age=604800;`;
      }

      setSuccessMsg('MPIN created successfully! Logging you into the portal...');
      setTimeout(() => {
        onLoginSuccess(data);
      }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchToCreateTab = () => {
    setActiveTab('create');
    setError('');
    setSuccessMsg('');
    setShowForgotModal(false);
    if (mobileNumber && !createMobile) {
      setCreateMobile(mobileNumber);
    }
  };

  const switchToLoginTab = () => {
    setActiveTab('login');
    setError('');
    setSuccessMsg('');
    if (createMobile && !mobileNumber) {
      setMobileNumber(createMobile);
    }
  };

  return (
    <div className="student-login-page">
      <div className="student-login-backdrop"></div>
      
      <div className="student-login-container">
        <div className="student-login-card">
          {/* Top Branding */}
          <div className="student-login-brand">
            <div className="student-brand-icon">
              <ShieldCheck size={32} />
            </div>
            <h1>Student Portal</h1>
            <p>Access your training attendance, fee history, receipts, and academy updates</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="student-auth-tabs">
            <button
              type="button"
              className={`student-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={switchToLoginTab}
            >
              <Lock size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`student-auth-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={switchToCreateTab}
            >
              <KeyRound size={15} />
              <span>Create MPIN</span>
            </button>
          </div>

          {error && (
            <div className="student-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="student-alert success">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab 1: Sign In with MPIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="student-login-form">
              <div className="student-input-group">
                <label>Registered Mobile Number</label>
                <div className="student-input-wrap">
                  <span className="student-prefix">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => handleMobileChange(e, setMobileNumber)}
                    required
                    autoFocus
                  />
                  <Smartphone size={18} className="student-input-icon-right" />
                </div>
              </div>

              <div className="student-input-group">
                <div className="student-label-row">
                  <label>6-Digit MPIN</label>
                  <button
                    type="button"
                    className="student-forgot-link"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot MPIN?
                  </button>
                </div>
                <div className="student-input-wrap">
                  <Lock size={18} className="student-input-icon" />
                  <input
                    type={showMpin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="••••••"
                    value={mpin}
                    onChange={(e) => handleMpinChange(e, setMpin)}
                    required
                  />
                  <button
                    type="button"
                    className="student-toggle-eye"
                    onClick={() => setShowMpin(!showMpin)}
                    tabIndex="-1"
                  >
                    {showMpin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || mobileNumber.length !== 10 || mpin.length !== 6}
                className="student-btn primary full login-btn"
              >
                {loading ? (
                  <span className="spinner-text">Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Student Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="student-form-subtext">
                <span>First time login or no MPIN?</span>{' '}
                <button
                  type="button"
                  onClick={switchToCreateTab}
                  className="student-inline-link"
                >
                  Create MPIN
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Create MPIN (Using Registered Mobile Number Only) */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="student-login-form">
              <div className="student-info-banner">
                <Sparkles size={16} />
                <span>Create or reset your 6-digit MPIN using your enrolled mobile number. No OTP delay.</span>
              </div>

              <div className="student-input-group">
                <label>Registered Mobile Number</label>
                <div className="student-input-wrap">
                  <span className="student-prefix">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={createMobile}
                    onChange={(e) => handleMobileChange(e, setCreateMobile)}
                    required
                    autoFocus
                  />
                  <Smartphone size={18} className="student-input-icon-right" />
                </div>
                <span className="student-input-hint">Must match mobile number registered with academy</span>
              </div>

              <div className="student-input-group">
                <label>New 6-Digit MPIN</label>
                <div className="student-input-wrap">
                  <Lock size={18} className="student-input-icon" />
                  <input
                    type={showCreateMpin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="••••••"
                    value={createMpin}
                    onChange={(e) => handleMpinChange(e, setCreateMpin)}
                    required
                  />
                  <button
                    type="button"
                    className="student-toggle-eye"
                    onClick={() => setShowCreateMpin(!showCreateMpin)}
                    tabIndex="-1"
                  >
                    {showCreateMpin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="student-input-group">
                <label>Confirm 6-Digit MPIN</label>
                <div className="student-input-wrap">
                  <Lock size={18} className="student-input-icon" />
                  <input
                    type={showConfirmMpin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="••••••"
                    value={confirmMpin}
                    onChange={(e) => handleMpinChange(e, setConfirmMpin)}
                    required
                  />
                  <button
                    type="button"
                    className="student-toggle-eye"
                    onClick={() => setShowConfirmMpin(!showConfirmMpin)}
                    tabIndex="-1"
                  >
                    {showConfirmMpin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="student-security-hints">
                <div className="hint-title">Security Guidelines:</div>
                <ul>
                  <li>Must be exactly 6 numeric digits</li>
                  <li>Avoid simple sequences like 123456 or repeated digits</li>
                  <li>Only registered academy student numbers are authorized</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || createMobile.length !== 10 || createMpin.length !== 6 || confirmMpin.length !== 6}
                className="student-btn primary full login-btn"
              >
                {loading ? (
                  <span className="spinner-text">Creating MPIN...</span>
                ) : (
                  <>
                    <span>Create MPIN & Access Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="student-form-subtext">
                <span>Already have your MPIN?</span>{' '}
                <button
                  type="button"
                  onClick={switchToLoginTab}
                  className="student-inline-link"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          <div className="student-login-footer">
            <div className="zero-otp-badge">
              <Sparkles size={14} />
              <span>Instant, secure access using registered mobile number only</span>
            </div>

            <div className="student-nav-links single-center" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleGoBack} className="student-link-btn">
                <ArrowLeft size={16} />
                <span>Return to Website</span>
              </button>
              {onGoToStaffLogin && (
                <button onClick={onGoToStaffLogin} className="student-link-btn" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <Lock size={15} />
                  <span>Staff / Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot MPIN Modal */}
      {showForgotModal && (
        <div className="student-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="student-modal-card forgot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="student-modal-header">
              <div className="student-icon-badge primary">
                <KeyRound size={28} />
              </div>
              <h2>Forgot or Need New MPIN?</h2>
              <p>You can create or reset your MPIN instantly using your registered mobile number.</p>
            </div>

            <div className="student-forgot-body">
              <div className="contact-card">
                <div className="contact-title">Instant Self-Service MPIN Reset</div>
                <div className="contact-info">
                  Enter your enrolled mobile number to set a new 6-digit MPIN. No SMS waiting or admin visit required.
                </div>
              </div>
            </div>

            <div className="student-modal-actions">
              <button
                type="button"
                className="student-btn primary full"
                onClick={switchToCreateTab}
              >
                Reset / Create MPIN Now
              </button>
              <button
                type="button"
                className="student-btn secondary full"
                onClick={() => setShowForgotModal(false)}
                style={{ marginTop: '0.5rem' }}
              >
                Close & Return to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
