import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, AlertCircle, RefreshCw, CheckCircle2, ArrowRight, ArrowLeft, Flame } from 'lucide-react';

export default function StudentQrAutoLogin({ apiBaseUrl, onLoginSuccess, onGoToLogin, onGoToWebsite }) {
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);

  // Extract clean student ID from hash (e.g. #/student/qr-login/MF-CHM-0092 or #/student/qr-login/1042)
  const getScannedId = () => {
    const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
    const cleanHash = hash.replace(/^#\/?/, '/');
    const parts = cleanHash.split('/student/qr-login/');
    const raw = parts[1] ? decodeURIComponent(parts[1].split('/')[0].split('?')[0]).trim().toUpperCase() : '';
    return raw;
  };

  const studentId = getScannedId();

  const performAutoLogin = async () => {
    setStatus('processing');
    setErrorMsg('');

    if (!studentId) {
      setStatus('error');
      setErrorMsg('No valid Student ID found in the scanned QR credential.');
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/student/qr-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: studentId,
          uniqueId: studentId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate student QR pass.');
      }

      setStudentInfo(data.student);
      setStatus('success');

      if (data.token) {
        localStorage.setItem('umai_student_token', data.token);
        if (data.student) {
          localStorage.setItem('umai_student_data', JSON.stringify(data.student));
        }
        document.cookie = `umai_student_token=${encodeURIComponent(data.token)}; path=/; max-age=604800;`;
      }

      // Smooth transition to Student Portal
      setTimeout(() => {
        onLoginSuccess(data);
      }, 700);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Unable to log in with this QR code.');
    }
  };

  useEffect(() => {
    performAutoLogin();
  }, [studentId]);

  return (
    <div className="modern-qr-login-page">
      <div className="modern-qr-bg-glow"></div>

      <div className="modern-qr-card-container">
        {/* Header Branding */}
        <div className="modern-qr-header">
          <div className="academy-badge-halo">
            <ShieldCheck size={36} color="#eab308" />
          </div>
          <div className="academy-brand-pill">
            <Flame size={12} color="#ef4444" />
            <span>MASTERFIT MARTIAL ARTS ACADEMY</span>
          </div>
          <h1 className="modern-portal-heading">Digital Pass Scanner</h1>
          <span className="qr-badge-sub">INSTANT QR AUTHENTICATION</span>
        </div>

        {/* Status 1: Processing */}
        {status === 'processing' && (
          <div className="status-box processing">
            <div className="qr-spin-ring">
              <RefreshCw size={32} className="spinning-icon" color="#eab308" />
            </div>
            <h3 className="status-title">Verifying Student ID</h3>
            <div className="target-id-pill">{studentId || 'Scanning...'}</div>
            <p className="status-desc">
              Authenticating official MASTERFIT Academy digital pass...
            </p>
          </div>
        )}

        {/* Status 2: Success */}
        {status === 'success' && (
          <div className="status-box success">
            <div className="qr-success-icon">
              <CheckCircle2 size={38} color="#22c55e" />
            </div>
            <h3 className="status-title green">Pass Verified!</h3>
            <p className="student-name-welcome">
              Welcome, {studentInfo?.name || 'Student'}!
            </p>
            <div className="target-id-pill success">
              {studentInfo?.uniqueStudentId || studentId}
            </div>
            <span className="redirecting-text">
              Opening your student portal...
            </span>
          </div>
        )}

        {/* Status 3: Error */}
        {status === 'error' && (
          <div className="status-box error">
            <div className="qr-error-icon">
              <AlertCircle size={34} color="#ef4444" />
            </div>
            <h4 className="status-title red">Authentication Failed</h4>
            <p className="status-desc error-text">
              {errorMsg}
            </p>

            <div className="error-actions-col">
              <button 
                type="button"
                onClick={performAutoLogin}
                className="qr-action-btn primary"
              >
                <RefreshCw size={15} />
                <span>Retry Verification</span>
              </button>
              <button 
                type="button"
                onClick={onGoToLogin}
                className="qr-action-btn secondary"
              >
                <span>Enter Student ID Manually</span>
                <ArrowRight size={15} />
              </button>
              <button 
                type="button"
                onClick={onGoToWebsite}
                className="qr-action-link"
              >
                <ArrowLeft size={14} />
                <span>Return to Website</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="modern-qr-footer">
          <Sparkles size={13} color="#eab308" />
          <span>Official MASTERFIT Academy Digital ID Pass</span>
        </div>
      </div>

      <style>{`
        .modern-qr-login-page {
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

        .modern-qr-bg-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 480px;
          max-width: 90vw;
          height: 340px;
          background: radial-gradient(circle, rgba(234, 179, 8, 0.14) 0%, rgba(239, 68, 68, 0.06) 45%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          filter: blur(40px);
        }

        .modern-qr-card-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(17, 24, 39, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 34px 26px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(234, 179, 8, 0.15);
          box-sizing: border-box;
          text-align: center;
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
          font-size: 1.55rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .qr-badge-sub {
          display: inline-block;
          color: #eab308;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .status-box {
          margin: 26px 0 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-spin-ring {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(234, 179, 8, 0.1);
          border: 2px dashed rgba(234, 179, 8, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .spinning-icon {
          animation: qrSpin 1.4s linear infinite;
        }

        @keyframes qrSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .status-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px;
        }

        .status-title.green {
          color: #4ade80;
        }

        .status-title.red {
          color: #f87171;
        }

        .target-id-pill {
          display: inline-block;
          background: rgba(234, 179, 8, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.3);
          color: #fef08a;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }

        .target-id-pill.success {
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.3);
          color: #86efac;
        }

        .status-desc {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.4;
          margin: 0;
          max-width: 320px;
        }

        .status-desc.error-text {
          color: #fca5a5;
          margin-bottom: 20px;
        }

        .qr-success-icon {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.12);
          border: 2px solid #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.25);
        }

        .student-name-welcome {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px;
        }

        .redirecting-text {
          font-size: 0.78rem;
          color: #94a3b8;
          margin-top: 4px;
        }

        .qr-error-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.12);
          border: 2px solid #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .error-actions-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .qr-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 44px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .qr-action-btn.primary {
          background: #eab308;
          color: #0b0e15;
          border: none;
        }

        .qr-action-btn.primary:hover {
          background: #facc15;
        }

        .qr-action-btn.secondary {
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .qr-action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .qr-action-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
        }

        .qr-action-link:hover {
          color: #ffffff;
        }

        .modern-qr-footer {
          margin-top: 24px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.72rem;
        }
      `}</style>
    </div>
  );
}
