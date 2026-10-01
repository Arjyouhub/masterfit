import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function FirstLoginMpinModal({ token, apiBaseUrl, onSuccess }) {
  const [newMpin, setNewMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const weakList = [
    '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999',
    '123456', '234567', '345678', '456789', '567890', '654321', '765432', '876543', '987654', '098765'
  ];

  const validate = () => {
    if (newMpin.length !== 6) {
      return 'MPIN must be exactly 6 numeric digits';
    }
    if (weakList.includes(newMpin) || /^(\d{2})\1\1$/.test(newMpin)) {
      return 'This MPIN is too predictable. Avoid sequences like 123456 or repeated digits.';
    }
    if (newMpin !== confirmMpin) {
      return 'Confirm MPIN does not match';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/student/change-mpin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newMpin,
          confirmMpin
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update MPIN');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-modal-overlay">
      <div className="student-modal-card">
        <div className="student-modal-header">
          <div className="student-icon-badge primary">
            <ShieldCheck size={28} />
          </div>
          <h2>Create Your New MPIN</h2>
          <p>For your account security, you must set a private 6-digit MPIN before accessing the student portal.</p>
        </div>

        {error && (
          <div className="student-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-modal-form">
          <div className="student-input-group">
            <label>New 6-Digit MPIN</label>
            <div className="student-input-wrap">
              <Lock size={18} className="student-input-icon" />
              <input
                type={showMpin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={newMpin}
                onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
                autoFocus
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

          <div className="student-input-group">
            <label>Confirm 6-Digit MPIN</label>
            <div className="student-input-wrap">
              <Lock size={18} className="student-input-icon" />
              <input
                type={showMpin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={confirmMpin}
                onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <div className="student-security-hints">
            <div className="hint-title">Security Guidelines:</div>
            <ul>
              <li>Must be exactly 6 numeric digits</li>
              <li>Avoid simple combinations like 123456 or 000000</li>
              <li>Keep this MPIN confidential at all times</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || newMpin.length !== 6 || confirmMpin.length !== 6}
            className="student-btn primary full"
          >
            {loading ? 'Securing MPIN...' : 'Set MPIN & Enter Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}
