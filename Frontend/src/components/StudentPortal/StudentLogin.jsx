import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, Sparkles, CheckCircle2, QrCode, CreditCard, Lock, Camera } from 'lucide-react';
import QRCameraScanner from './QRCameraScanner.jsx';

export default function StudentLogin({ apiBaseUrl, onLoginSuccess, onGoToWebsite, onBackToWebsite, onGoToStaffLogin }) {
  const handleGoBack = onGoToWebsite || onBackToWebsite;
  const [studentIdInput, setStudentIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Direct Student ID Login (Zero MPIN required)
  const handleIdLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanId = String(studentIdInput).trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter your Unique Student ID (e.g. MF-0001 or 1042)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: cleanId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your Student ID.');
      }

      if (data.token) {
        localStorage.setItem('umai_student_token', data.token);
        if (data.student) {
          localStorage.setItem('umai_student_data', JSON.stringify(data.student));
        }
        document.cookie = `umai_student_token=${encodeURIComponent(data.token)}; path=/; max-age=604800;`;
      }

      setSuccessMsg(`Welcome, ${data.student?.name || 'Student'}! Opening portal...`);
      setTimeout(() => {
        onLoginSuccess(data);
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Instant Camera QR Scan Login handler
  const handleQrScanned = async (decodedData) => {
    setShowCameraScanner(false);
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // Check if scanned as URL (e.g. /#/student/qr-login/MF-0001)
      let targetIdOrPayload = decodedData;
      if (typeof decodedData === 'string' && decodedData.includes('/student/qr-login/')) {
        const parts = decodedData.split('/student/qr-login/');
        targetIdOrPayload = parts[1] ? parts[1].split('/')[0].split('?')[0] : decodedData;
      }

      const res = await fetch(`${apiBaseUrl}/student/qr-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          qrData: decodedData,
          studentId: targetIdOrPayload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid or unrecognized MASTERFIT QR Code.');
      }

      if (data.token) {
        localStorage.setItem('umai_student_token', data.token);
        if (data.student) {
          localStorage.setItem('umai_student_data', JSON.stringify(data.student));
        }
        document.cookie = `umai_student_token=${encodeURIComponent(data.token)}; path=/; max-age=604800;`;
      }

      setSuccessMsg(`Verified! Welcome, ${data.student?.name || 'Student'}! Opening portal...`);
      setTimeout(() => {
        onLoginSuccess(data);
      }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

          {/* Camera Scanner Quick Trigger */}
          <div className="student-qr-helper-banner">
            <div className="qr-banner-icon">
              <QrCode size={26} color="#eab308" />
            </div>
            <div className="qr-banner-text">
              <strong>Have a MASTERFIT ID Card?</strong>
              <span>Scan your card's QR code with your camera to log in instantly without typing anything!</span>
            </div>
            <button 
              type="button" 
              className="banner-scan-action-btn"
              onClick={() => setShowCameraScanner(true)}
              title="Open Camera Scanner"
            >
              <Camera size={16} />
              <span>Scan QR</span>
            </button>
          </div>

          {/* Direct Unique Student ID Form */}
          <form onSubmit={handleIdLoginSubmit} className="student-login-form">
            <div className="student-input-group">
              <label>Unique Student ID</label>
              <div className="student-input-wrap clean-id-input-wrap">
                <div className="input-prefix-badge">
                  <CreditCard size={18} color="#eab308" />
                </div>
                <input
                  type="text"
                  placeholder="Enter Student ID (e.g. MF-0001 or 1042)"
                  value={studentIdInput}
                  onChange={(e) => {
                    setStudentIdInput(e.target.value);
                    setError('');
                  }}
                  className="clean-student-input"
                  required
                  autoFocus
                />
              </div>
              <span className="student-input-hint">Direct instant access with Unique Student ID (e.g. MF-0001) or Camera QR Scan</span>
            </div>

            <button
              type="submit"
              disabled={loading || !studentIdInput.trim()}
              className="student-btn primary full login-btn"
              style={{ marginTop: '0.75rem' }}
            >
              {loading ? (
                <span className="spinner-text">Authenticating Student ID...</span>
              ) : (
                <>
                  <span>Login to Student Portal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="student-login-footer">
            <div className="zero-otp-badge">
              <Sparkles size={14} />
              <span>Instant QR Scan & Student ID login supported &bull; Master Fit Academy</span>
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

      {/* In-page Camera QR Scanner Modal */}
      {showCameraScanner && (
        <QRCameraScanner 
          onScanSuccess={handleQrScanned}
          onClose={() => setShowCameraScanner(false)}
          title="Scan MASTERFIT ID Card"
        />
      )}

      {/* Scoped CSS */}
      <style>{`
        .clean-id-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .input-prefix-badge {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 2;
        }
        .clean-student-input {
          width: 100% !important;
          padding-left: 44px !important;
          padding-right: 14px !important;
          height: 48px !important;
          box-sizing: border-box !important;
        }
        .student-qr-helper-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(234, 179, 8, 0.08);
          border: 1px dashed rgba(234, 179, 8, 0.35);
          padding: 12px 14px;
          border-radius: 12px;
          margin-bottom: 18px;
        }
        .qr-banner-icon {
          background: rgba(234, 179, 8, 0.15);
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .qr-banner-text {
          display: flex;
          flex-direction: column;
          font-size: 0.78rem;
          color: #fef08a;
          line-height: 1.35;
          text-align: left;
          flex: 1;
        }
        .qr-banner-text strong {
          color: #facc15;
          margin-bottom: 2px;
        }
        .qr-banner-text span {
          color: #cbd5e1;
          font-size: 0.74rem;
        }
        .banner-scan-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #eab308;
          color: #0b0e15;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.78rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .banner-scan-action-btn:hover {
          background: #facc15;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
