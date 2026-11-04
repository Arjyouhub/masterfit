import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, QrCode, CheckCircle2, AlertCircle, RefreshCw, Zap, X, 
  Calendar, CreditCard, User, ArrowRight, ShieldCheck, Check
} from 'lucide-react';

export default function AdminQRScanner({ apiBaseUrl, sessionToken, onSelectStudent, onClose }) {
  const [scannedStudent, setScannedStudent] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [manualIdInput, setManualIdInput] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'admin-qr-canvas-area';

  const startScanner = async () => {
    try {
      setErrorMsg('');
      setCameraActive(true);

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleQRIdentified(decodedText);
        },
        () => {} // Frame scan error, ignore
      );
    } catch (err) {
      console.warn("Scanner start error:", err);
      setCameraActive(false);
      setErrorMsg('Camera access failed. You can enter the Student ID manually below.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const handleQRIdentified = async (decodedData) => {
    await stopScanner();
    setCameraActive(false);
    setErrorMsg('');
    setAttendanceSuccessMsg('');

    try {
      const res = await fetch(`${apiBaseUrl}/admin/qr-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ qrData: decodedData })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to identify student card');
      }

      setScannedStudent(data.student);
      setTodayAttendance(data.todayAttendance);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    const clean = manualIdInput.trim().toUpperCase();
    if (!clean) return;

    setLoadingSearch(true);
    await handleQRIdentified(clean);
    setLoadingSearch(false);
  };

  const handleMarkAttendance = async () => {
    if (!scannedStudent) return;
    setMarkingAttendance(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${apiBaseUrl}/admin/qr-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          qrData: scannedStudent.uniqueStudentId || scannedStudent.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record attendance');

      setAttendanceSuccessMsg(data.message || 'Marked Present for today!');
      setTodayAttendance('Present');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleScanNext = async () => {
    setScannedStudent(null);
    setTodayAttendance(null);
    setAttendanceSuccessMsg('');
    setErrorMsg('');
    setManualIdInput('');
    await startScanner();
  };

  const toggleTorch = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } catch (e) {
        console.warn("Torch toggle not supported:", e);
      }
    }
  };

  return (
    <div className="admin-qr-container">
      {/* Header */}
      <div className="admin-qr-header">
        <div className="admin-qr-title">
          <QrCode size={28} color="#eab308" />
          <div>
            <h2>MASTERFIT Staff QR Scanner</h2>
            <p>Scan any student ID card to inspect profile, check fee status, and record instant attendance.</p>
          </div>
        </div>
        {onClose && (
          <button className="admin-qr-close" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="admin-qr-alert error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {attendanceSuccessMsg && (
        <div className="admin-qr-alert success">
          <CheckCircle2 size={18} />
          <span>{attendanceSuccessMsg}</span>
        </div>
      )}

      <div className="admin-qr-content-grid">
        {/* Left Column: Live Camera or Recognized Student */}
        <div className="admin-scanner-column">
          {cameraActive ? (
            <div className="admin-viewfinder-card">
              <div className="viewfinder-header">
                <span>Align Student QR Code</span>
                <button 
                  type="button" 
                  className={`torch-btn ${torchOn ? 'active' : ''}`}
                  onClick={toggleTorch}
                >
                  <Zap size={14} /> {torchOn ? 'Torch ON' : 'Torch OFF'}
                </button>
              </div>

              <div className="viewfinder-screen">
                <div id={scannerContainerId} className="feed-box"></div>
                <div className="laser-overlay">
                  <div className="corner tl"></div>
                  <div className="corner tr"></div>
                  <div className="corner bl"></div>
                  <div className="corner br"></div>
                  <div className="laser-beam"></div>
                </div>
              </div>

              <div className="viewfinder-footer">
                <p>Support rear camera and direct scan with flashlight</p>
              </div>
            </div>
          ) : scannedStudent ? (
            /* Identified Student Card */
            <div className="scanned-student-card">
              <div className="card-top-status">
                <div className="verified-badge">
                  <CheckCircle2 size={16} /> Verified MASTERFIT Pass
                </div>
                <span className="uid-highlight">{scannedStudent.uniqueStudentId}</span>
              </div>

              <div className="scanned-student-header">
                {scannedStudent.photo ? (
                  <img src={scannedStudent.photo} alt="" className="scanned-photo" />
                ) : (
                  <div className="scanned-photo-placeholder">
                    <User size={36} />
                  </div>
                )}
                <div>
                  <h3>{scannedStudent.name}</h3>
                  <div className="belt-pill">{scannedStudent.belt || 'White Belt'}</div>
                  <span className="branch-meta">{scannedStudent.branch} &bull; {scannedStudent.batch}</span>
                </div>
              </div>

              <div className="scanned-metrics-row">
                <div className="s-metric">
                  <span className="s-lbl">Today's Attendance:</span>
                  <span className={`s-val ${todayAttendance === 'Present' ? 'text-green' : 'text-amber'}`}>
                    {todayAttendance === 'Present' ? '✓ PRESENT' : '○ NOT MARKED'}
                  </span>
                </div>
                <div className="s-metric">
                  <span className="s-lbl">QR Credential:</span>
                  <span className={`s-val ${scannedStudent.qrStatus === 'Active' ? 'text-green' : 'text-red'}`}>
                    {scannedStudent.qrStatus || 'Active'}
                  </span>
                </div>
              </div>

              <div className="scanned-actions-row">
                {todayAttendance !== 'Present' ? (
                  <button 
                    className="qr-btn primary mark-att-btn"
                    onClick={handleMarkAttendance}
                    disabled={markingAttendance}
                  >
                    <CheckCircle2 size={18} />
                    <span>{markingAttendance ? 'Recording...' : 'Mark Attendance Today'}</span>
                  </button>
                ) : (
                  <div className="already-marked-badge">
                    <Check size={16} /> Attendance Recorded for Today
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {onSelectStudent && (
                    <button 
                      className="qr-btn secondary"
                      onClick={() => onSelectStudent(scannedStudent)}
                    >
                      <User size={15} />
                      <span>Full Profile</span>
                    </button>
                  )}
                  <button 
                    className="qr-btn accent"
                    onClick={handleScanNext}
                  >
                    <RefreshCw size={15} />
                    <span>Scan Next Student</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-scan-state">
              <Camera size={40} color="#64748b" />
              <h4>Camera Paused</h4>
              <button className="qr-btn primary" onClick={startScanner}>
                <RefreshCw size={15} /> Reopen Camera
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Manual Fallback ID Entry */}
        <div className="admin-manual-column">
          <div className="manual-card">
            <h4>Manual ID Lookup</h4>
            <p>If the student does not have their physical ID card, type their Unique Student ID below:</p>

            <form onSubmit={handleManualLookup} className="manual-form">
              <div className="input-wrap">
                <CreditCard size={18} color="#eab308" />
                <input 
                  type="text" 
                  placeholder="e.g. MF-0001 or 1042" 
                  value={manualIdInput}
                  onChange={(e) => setManualIdInput(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="qr-btn primary full"
                disabled={loadingSearch || !manualIdInput.trim()}
              >
                {loadingSearch ? 'Looking up...' : 'Lookup Student'}
              </button>
            </form>

            <div className="manual-hints">
              <div className="hint-item">
                <ShieldCheck size={14} color="#eab308" />
                <span>Permanent MF format across all academy branches</span>
              </div>
              <div className="hint-item">
                <Check size={14} color="#22c55e" />
                <span>Accepts full MF ID or raw admission number</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-qr-container {
          background: #0d1017;
          border: 1px solid #1f2738;
          border-radius: 16px;
          padding: 24px;
          color: #f8fafc;
          max-width: 900px;
          margin: 0 auto;
        }
        .admin-qr-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid #1f2738;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .admin-qr-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .admin-qr-title h2 {
          margin: 0 0 4px 0;
          font-size: 1.35rem;
          font-weight: 800;
        }
        .admin-qr-title p {
          margin: 0;
          color: #94a3b8;
          font-size: 0.82rem;
        }
        .admin-qr-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
        .admin-qr-content-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .admin-qr-content-grid {
            grid-template-columns: 1fr;
          }
        }
        .admin-viewfinder-card {
          background: #11141d;
          border: 1px solid #1f2738;
          border-radius: 14px;
          overflow: hidden;
        }
        .viewfinder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #090c12;
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 700;
          border-bottom: 1px solid #1f2738;
        }
        .torch-btn {
          background: #1e2638;
          border: 1px solid #2a3449;
          color: #cbd5e1;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .torch-btn.active {
          background: #eab308;
          color: #0b0e15;
          font-weight: 700;
        }
        .viewfinder-screen {
          position: relative;
          width: 100%;
          height: 300px;
          background: #000;
        }
        .feed-box {
          width: 100% !important;
          height: 100% !important;
        }
        .feed-box video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        .laser-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
        }
        .corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: #eab308;
          border-style: solid;
        }
        .corner.tl { top: 25px; left: 25px; border-width: 3px 0 0 3px; }
        .corner.tr { top: 25px; right: 25px; border-width: 3px 3px 0 0; }
        .corner.bl { bottom: 25px; left: 25px; border-width: 0 0 3px 3px; }
        .corner.br { bottom: 25px; right: 25px; border-width: 0 3px 3px 0; }
        .laser-beam {
          position: absolute;
          width: calc(100% - 50px);
          height: 2px;
          background: linear-gradient(90deg, transparent, #eab308, transparent);
          box-shadow: 0 0 8px #eab308;
          animation: laserBeam 2s infinite ease-in-out;
        }
        @keyframes laserBeam {
          0% { top: 30px; }
          50% { top: 270px; }
          100% { top: 30px; }
        }
        .viewfinder-footer {
          padding: 8px 14px;
          background: #090c12;
          border-top: 1px solid #1f2738;
          text-align: center;
        }
        .viewfinder-footer p {
          margin: 0;
          color: #64748b;
          font-size: 0.72rem;
        }
        .scanned-student-card {
          background: #11141d;
          border: 1px solid #232b3e;
          border-radius: 14px;
          padding: 20px;
        }
        .card-top-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .verified-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #22c55e;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .uid-highlight {
          background: rgba(234, 179, 8, 0.15);
          color: #facc15;
          padding: 3px 10px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.85rem;
          border: 1px solid rgba(234, 179, 8, 0.4);
        }
        .scanned-student-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }
        .scanned-photo {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #eab308;
        }
        .scanned-photo-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #1e2638;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          border: 2px solid #eab308;
        }
        .scanned-student-header h3 {
          margin: 0 0 4px 0;
          font-size: 1.2rem;
          font-weight: 800;
        }
        .belt-pill {
          display: inline-block;
          background: #1e2638;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .branch-meta {
          display: block;
          color: #94a3b8;
          font-size: 0.78rem;
        }
        .scanned-metrics-row {
          background: #090c12;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #1f2738;
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .s-metric {
          display: flex;
          flex-direction: column;
        }
        .s-lbl {
          font-size: 0.68rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
        }
        .s-val {
          font-size: 0.88rem;
          font-weight: 800;
          margin-top: 2px;
        }
        .text-green { color: #22c55e; }
        .text-amber { color: #f59e0b; }
        .text-red { color: #ef4444; }
        .mark-att-btn {
          width: 100%;
          padding: 12px;
          font-size: 0.95rem;
          background: #22c55e !important;
          color: #0b0e15 !important;
          font-weight: 800;
        }
        .mark-att-btn:hover {
          background: #16a34a !important;
        }
        .already-marked-badge {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .qr-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .qr-btn.primary { background: #eab308; color: #0b0e15; }
        .qr-btn.secondary { background: #1e2638; color: #f8fafc; border: 1px solid #2a3449; flex: 1; }
        .qr-btn.accent { background: #2563eb; color: #fff; flex: 1; }
        .qr-btn.full { width: 100%; }

        .manual-card {
          background: #11141d;
          border: 1px solid #1f2738;
          border-radius: 14px;
          padding: 20px;
        }
        .manual-card h4 {
          margin: 0 0 6px 0;
          font-size: 1rem;
        }
        .manual-card p {
          color: #94a3b8;
          font-size: 0.8rem;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }
        .manual-form .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .manual-form .input-wrap svg {
          position: absolute;
          left: 12px;
          pointer-events: none;
        }
        .manual-form input {
          width: 100%;
          background: #090c12;
          border: 1px solid #232b3e;
          border-radius: 8px;
          padding: 10px 12px 10px 38px;
          color: #f8fafc;
          font-size: 0.9rem;
          font-weight: 600;
          outline: none;
        }
        .manual-hints {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hint-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.74rem;
          color: #94a3b8;
        }
        .admin-qr-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }
        .admin-qr-alert.error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
        .admin-qr-alert.success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }
      `}</style>
    </div>
  );
}

