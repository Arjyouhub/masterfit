import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, RefreshCw, Zap } from 'lucide-react';

export default function QRCameraScanner({ onScanSuccess, onClose, title = "Scan MASTERFIT ID Card" }) {
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'reader-qr-canvas-container';

  useEffect(() => {
    let html5QrCode;
    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError('');
        setScanning(true);

        html5QrCode = new Html5Qrcode(scannerContainerId);
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
            // Success callback
            if (isMounted) {
              stopAndCleanUp().then(() => {
                onScanSuccess(decodedText);
              });
            }
          },
          (errorMessage) => {
            // Frame scan failure (expected on empty frames, ignore)
          }
        );
      } catch (err) {
        console.error("Camera scanner start error:", err);
        if (isMounted) {
          setCameraError(err.message || 'Could not access device camera. Please check camera permissions.');
          setScanning(false);
        }
      }
    };

    const stopAndCleanUp = async () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          console.warn("Camera stop error:", e);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopAndCleanUp();
    };
  }, []);

  const handleClose = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {}
    }
    onClose();
  };

  const toggleTorch = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } catch (e) {
        console.warn("Torch not supported on this device:", e);
      }
    }
  };

  return (
    <div className="qr-modal-backdrop">
      <div className="qr-modal-content">
        <div className="qr-modal-header">
          <div className="qr-modal-title">
            <Camera size={20} color="#eab308" />
            <span>{title}</span>
          </div>
          <button className="qr-modal-close" onClick={handleClose} title="Close Scanner">
            <X size={20} />
          </button>
        </div>

        <div className="qr-modal-body">
          {cameraError ? (
            <div className="camera-error-container">
              <AlertCircle size={36} color="#ef4444" />
              <h4>Camera Access Denied or Unavailable</h4>
              <p>{cameraError}</p>
              <button 
                className="student-btn secondary"
                onClick={() => window.location.reload()}
                style={{ marginTop: '12px' }}
              >
                <RefreshCw size={15} /> Try Again
              </button>
            </div>
          ) : (
            <div className="camera-viewfinder-wrapper">
              <div id={scannerContainerId} className="camera-feed-area"></div>
              <div className="viewfinder-overlay">
                <div className="scan-corner top-left"></div>
                <div className="scan-corner top-right"></div>
                <div className="scan-corner bottom-left"></div>
                <div className="scan-corner bottom-right"></div>
                <div className="scan-laser-line"></div>
              </div>
            </div>
          )}

          <div className="qr-modal-instructions">
            <p>Position the QR code on your MASTERFIT ID Card inside the camera box</p>
          </div>
        </div>

        <div className="qr-modal-footer">
          <button 
            type="button" 
            className={`torch-toggle-btn ${torchOn ? 'active' : ''}`}
            onClick={toggleTorch}
            title="Toggle Flashlight"
          >
            <Zap size={16} />
            <span>{torchOn ? 'Torch ON' : 'Torch OFF'}</span>
          </button>
          <button type="button" className="student-btn secondary" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        .qr-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          padding: 16px;
        }
        .qr-modal-content {
          background: #11141d;
          border: 1px solid #232b3e;
          border-radius: 16px;
          max-width: 480px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        }
        .qr-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #1f2738;
          background: #090c12;
        }
        .qr-modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f8fafc;
          font-weight: 700;
          font-size: 1.05rem;
        }
        .qr-modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .qr-modal-close:hover {
          color: #f87171;
          background: rgba(239, 68, 68, 0.1);
        }
        .qr-modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .camera-viewfinder-wrapper {
          position: relative;
          width: 100%;
          max-width: 320px;
          height: 320px;
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        }
        .camera-feed-area {
          width: 100% !important;
          height: 100% !important;
        }
        .camera-feed-area video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 14px;
        }
        .viewfinder-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .scan-corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: #eab308;
          border-style: solid;
        }
        .scan-corner.top-left {
          top: 30px;
          left: 30px;
          border-width: 3px 0 0 3px;
          border-top-left-radius: 6px;
        }
        .scan-corner.top-right {
          top: 30px;
          right: 30px;
          border-width: 3px 3px 0 0;
          border-top-right-radius: 6px;
        }
        .scan-corner.bottom-left {
          bottom: 30px;
          left: 30px;
          border-width: 0 0 3px 3px;
          border-bottom-left-radius: 6px;
        }
        .scan-corner.bottom-right {
          bottom: 30px;
          right: 30px;
          border-width: 0 3px 3px 0;
          border-bottom-right-radius: 6px;
        }
        .scan-laser-line {
          position: absolute;
          width: calc(100% - 60px);
          height: 2px;
          background: linear-gradient(90deg, transparent, #eab308, #facc15, #eab308, transparent);
          box-shadow: 0 0 8px #eab308;
          animation: scanLaser 2.2s infinite ease-in-out;
        }
        @keyframes scanLaser {
          0% { top: 35px; opacity: 0.3; }
          50% { top: calc(100% - 35px); opacity: 1; }
          100% { top: 35px; opacity: 0.3; }
        }
        .qr-modal-instructions {
          margin-top: 14px;
          text-align: center;
        }
        .qr-modal-instructions p {
          color: #94a3b8;
          font-size: 0.85rem;
          margin: 0;
        }
        .camera-error-container {
          text-align: center;
          padding: 30px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .camera-error-container h4 {
          color: #f87171;
          margin: 0;
          font-size: 1.05rem;
        }
        .camera-error-container p {
          color: #94a3b8;
          font-size: 0.82rem;
          line-height: 1.4;
          margin: 0;
        }
        .qr-modal-footer {
          padding: 12px 20px;
          border-top: 1px solid #1f2738;
          background: #090c12;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .torch-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1e2638;
          border: 1px solid #2a3449;
          color: #94a3b8;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .torch-toggle-btn.active {
          background: #eab308;
          color: #0b0e15;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

