import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, Sparkles, CheckCircle2, QrCode, CreditCard, Lock, Camera, Flame } from 'lucide-react';
import QRCameraScanner from './QRCameraScanner.jsx';

export default function StudentLogin({ apiBaseUrl, onLoginSuccess, onGoToWebsite, onBackToWebsite, onGoToStaffLogin }) {
  const handleGoBack = onGoToWebsite || onBackToWebsite;
  const [studentIdInput, setStudentIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Direct Student ID Login Submit (Zero mobile number or MPIN required)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanInput = String(studentIdInput).trim().toUpperCase();
    if (!cleanInput) {
      setError('Please enter your Unique Student ID (e.g. MF-0001 or 1042)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: cleanInput,
          identifier: cleanInput
        })
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
        targetIdOrPayload = parts[1] ? decodeURIComponent(parts[1].split('/')[0].split('?')[0]).trim() : decodedData;
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
    <div className="modern-student-login-wrap">
      <div className="modern-login-bg-glow"></div>
      
      <div className="modern-login-box">
        {/* Top Academy Crest & Title */}
        <div className="modern-login-header">
          <div className="academy-badge-halo">
            <ShieldCheck size={36} color="#eab308" />
          </div>
          <div className="academy-brand-pill">
            <Flame size={12} color="#ef4444" />
            <span>MASTERFIT MARTIAL ARTS ACADEMY</span>
          </div>
          <h1 className="modern-portal-heading">Student Portal</h1>
          <p className="modern-portal-sub">Access your training attendance, fee dues, receipts, belt progression, and official ID card</p>
        </div>

        {error && (
          <div className="modern-login-alert error">
            <AlertCircle size={18} className="alert-svg-icon" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="modern-login-alert success">
            <CheckCircle2 size={18} className="alert-svg-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Camera Scanner Fast Access Card */}
        <div className="modern-qr-card">
          <div className="qr-card-left">
            <div className="qr-chip-icon">
              <QrCode size={24} color="#eab308" />
            </div>
            <div className="qr-card-copy">
              <span className="qr-card-title">Have an ID Card?</span>
              <span className="qr-card-desc">Scan card QR code with your camera for instant sign in</span>
            </div>
          </div>
          <button 
            type="button" 
            className="qr-scan-launch-btn"
            onClick={() => setShowCameraScanner(true)}
            title="Scan QR Code with Camera"
          >
            <Camera size={16} />
            <span>Scan QR</span>
          </button>
        </div>

        <div className="modern-login-divider">
          <span>OR SIGN IN WITH STUDENT ID</span>
        </div>

        {/* Pure Student ID Form (Zero Mobile Number Required) */}
        <form onSubmit={handleLoginSubmit} className="modern-login-form">
          <div className="modern-form-field">
            <label className="field-label">Unique Student ID</label>
            <div className="field-input-container">
              <div className="field-icon-badge">
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
                className="modern-text-input"
                required
                autoFocus
                autoComplete="off"
              />
            </div>
            <span className="field-hint-text">
              Direct instant access using your permanent MASTERFIT Student ID (e.g. MF-XXXX) or numeric ID.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !studentIdInput.trim()}
            className="modern-submit-btn"
          >
            {loading ? (
              <span className="btn-loading-text">Authenticating Student...</span>
            ) : (
              <>
                <span>Access Student Portal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Bottom Utility Links */}
        <div className="modern-login-foot">
          <div className="security-notice-badge">
            <Sparkles size={13} color="#eab308" />
            <span>Zero Password & Zero OTP Required &bull; Masterfit Academy</span>
          </div>

          <div className="modern-link-row">
            <button type="button" onClick={handleGoBack} className="foot-nav-btn">
              <ArrowLeft size={15} />
              <span>Return to Website</span>
            </button>
            {onGoToStaffLogin && (
              <button type="button" onClick={onGoToStaffLogin} className="foot-nav-btn staff-portal-btn">
                <Lock size={14} />
                <span>Trainer / Admin Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera QR Scanner Modal */}
      {showCameraScanner && (
        <QRCameraScanner 
          onScanSuccess={handleQrScanned}
          onClose={() => setShowCameraScanner(false)}
          title="Scan MASTERFIT ID Card"
        />
      )}

      {/* Scoped CSS Styles for Modern & Responsive Layout */}
      <style>{`
        .modern-student-login-wrap {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #090c12;
          padding: 20px 16px;
          position: relative;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow-x: hidden;
        }

        .modern-login-bg-glow {
          position: absolute;
          top: 15%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          max-width: 90vw;
          height: 350px;
          background: radial-gradient(circle, rgba(234, 179, 8, 0.12) 0%, rgba(239, 68, 68, 0.05) 45%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          filter: blur(40px);
        }

        .modern-login-box {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(234, 179, 8, 0.15);
          box-sizing: border-box;
          animation: modernFadeIn 0.35s ease-out;
        }

        @keyframes modernFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modern-login-header {
          text-align: center;
          margin-bottom: 22px;
        }

        .academy-badge-halo {
          width: 64px;
          height: 64px;
          margin: 0 auto 12px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(239, 68, 68, 0.12));
          border: 1px solid rgba(234, 179, 8, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(234, 179, 8, 0.2);
        }

        .academy-brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #fca5a5;
          margin-bottom: 8px;
        }

        .modern-portal-heading {
          font-size: 1.65rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .modern-portal-sub {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.45;
          margin: 0;
        }

        .modern-login-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 0.82rem;
          line-height: 1.4;
          margin-bottom: 18px;
        }

        .modern-login-alert.error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .modern-login-alert.success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }

        .alert-svg-icon {
          flex-shrink: 0;
        }

        /* Modern QR Card */
        .modern-qr-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
          border: 1px dashed rgba(234, 179, 8, 0.38);
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 20px;
        }

        .qr-card-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .qr-chip-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(234, 179, 8, 0.18);
          border: 1px solid rgba(234, 179, 8, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .qr-card-copy {
          display: flex;
          flex-direction: column;
          text-align: left;
          min-width: 0;
        }

        .qr-card-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #fef08a;
          margin-bottom: 2px;
        }

        .qr-card-desc {
          font-size: 0.72rem;
          color: #cbd5e1;
          line-height: 1.3;
        }

        .qr-scan-launch-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eab308;
          color: #0b0e15;
          border: none;
          padding: 9px 13px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s ease;
          box-shadow: 0 3px 12px rgba(234, 179, 8, 0.3);
        }

        .qr-scan-launch-btn:hover {
          background: #facc15;
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(234, 179, 8, 0.45);
        }

        /* Divider */
        .modern-login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 18px 0;
          color: #64748b;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.7px;
        }

        .modern-login-divider::before,
        .modern-login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modern-login-divider span {
          padding: 0 10px;
        }

        /* Form */
        .modern-login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .modern-form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }

        .field-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .field-input-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .field-icon-badge {
          position: absolute;
          left: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 2;
        }

        .modern-text-input {
          width: 100%;
          box-sizing: border-box;
          height: 48px;
          padding-left: 44px;
          padding-right: 14px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }

        .modern-text-input:focus {
          border-color: #eab308;
          background: rgba(15, 23, 42, 0.95);
          box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.2);
        }

        .field-hint-text {
          font-size: 0.71rem;
          color: #64748b;
          line-height: 1.35;
        }

        .modern-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 48px;
          margin-top: 6px;
          background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
          color: #0b0e15;
          border: none;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(234, 179, 8, 0.35);
        }

        .modern-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(234, 179, 8, 0.45);
        }

        .modern-submit-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-loading-text {
          display: inline-block;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Footer */
        .modern-login-foot {
          margin-top: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
        }

        .security-notice-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #94a3b8;
        }

        .modern-link-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          width: 100%;
        }

        .foot-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .foot-nav-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .foot-nav-btn.staff-portal-btn {
          color: #cbd5e1;
        }

        .foot-nav-btn.staff-portal-btn:hover {
          color: #facc15;
        }

        /* Mobile Adjustments */
        @media (max-width: 480px) {
          .modern-login-box {
            padding: 24px 18px;
            border-radius: 16px;
          }

          .academy-badge-halo {
            width: 54px;
            height: 54px;
            margin-bottom: 10px;
          }

          .modern-portal-heading {
            font-size: 1.4rem;
          }

          .modern-qr-card {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .qr-scan-launch-btn {
            justify-content: center;
            width: 100%;
          }

          .modern-link-row {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
