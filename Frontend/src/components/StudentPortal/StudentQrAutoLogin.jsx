import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function StudentQrAutoLogin({ apiBaseUrl, onLoginSuccess, onGoToLogin, onGoToWebsite }) {
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);

  // Extract student ID from hash (e.g. #/student/qr-login/1042)
  const getScannedId = () => {
    const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
    const cleanHash = hash.replace(/^#\/?/, '/');
    const parts = cleanHash.split('/student/qr-login/');
    const raw = parts[1] ? parts[1].split('/')[0].split('?')[0] : '';
    return String(raw).replace(/[^0-9]/g, '');
  };

  const studentId = getScannedId();

  const performAutoLogin = async () => {
    setStatus('processing');
    setErrorMsg('');

    if (!studentId) {
      setStatus('error');
      setErrorMsg('No valid Student ID found in scanned QR code.');
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/student/qr-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate student ID.');
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
    <div className="student-login-page">
      <div className="student-login-backdrop"></div>

      <div className="student-login-container">
        <div className="student-login-card" style={{ maxWidth: '460px', textAlign: 'center', padding: '36px 28px' }}>
          {/* Header Branding */}
          <div className="student-brand-icon" style={{ margin: '0 auto 16px auto', width: '56px', height: '56px' }}>
            <ShieldCheck size={32} color="#eab308" />
          </div>

          <h2 style={{ color: '#f8fafc', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px 0' }}>
            Master Fit Academy
          </h2>
          <span style={{ color: '#eab308', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Instant QR Scan Login
          </span>

          {/* Status 1: Processing */}
          {status === 'processing' && (
            <div style={{ marginTop: '32px', marginBottom: '24px' }}>
              <div className="qr-spin-ring">
                <RefreshCw size={36} className="spinning-icon" color="#eab308" />
              </div>
              <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: '20px 0 8px 0' }}>
                Verifying Student #{studentId || '...'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Logging you into Student Portal without MPIN...
              </p>
            </div>
          )}

          {/* Status 2: Success */}
          {status === 'success' && (
            <div style={{ marginTop: '28px', marginBottom: '20px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(34, 197, 94, 0.15)', 
                border: '2px solid #22c55e', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px auto' 
              }}>
                <CheckCircle2 size={36} color="#22c55e" />
              </div>
              <h3 style={{ color: '#22c55e', fontSize: '1.2rem', margin: '0 0 6px 0' }}>
                Logged In Successfully!
              </h3>
              <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem', margin: '0 0 4px 0' }}>
                Welcome, {studentInfo?.name || 'Student'}!
              </p>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                Opening your dashboard...
              </span>
            </div>
          )}

          {/* Status 3: Error */}
          {status === 'error' && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.15)', 
                border: '2px solid #ef4444', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 14px auto' 
              }}>
                <AlertCircle size={32} color="#ef4444" />
              </div>
              <h4 style={{ color: '#f87171', fontSize: '1.1rem', margin: '0 0 8px 0' }}>
                Authentication Failed
              </h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0 0 24px 0', lineHeight: 1.4 }}>
                {errorMsg}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={performAutoLogin}
                  className="student-btn primary full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <RefreshCw size={16} />
                  <span>Retry Scan Login</span>
                </button>
                <button 
                  onClick={onGoToLogin}
                  className="student-btn secondary full"
                >
                  Go to Student Login
                </button>
                <button 
                  onClick={onGoToWebsite}
                  className="student-link-btn"
                  style={{ margin: '10px auto 0 auto' }}
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}

          {/* Feature Badge Footer */}
          <div style={{ 
            marginTop: '28px', 
            paddingTop: '16px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            color: '#eab308', 
            fontSize: '0.78rem' 
          }}>
            <Sparkles size={14} />
            <span>Official Master Fit Martial Arts Digital Pass</span>
          </div>
        </div>
      </div>

      <style>{`
        .qr-spin-ring {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(234, 179, 8, 0.1);
          border: 2px dashed rgba(234, 179, 8, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .spinning-icon {
          animation: qrSpin 1.4s linear infinite;
        }
        @keyframes qrSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

