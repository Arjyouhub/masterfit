import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Filter, Printer, Download, RefreshCw, ShieldAlert, 
  CheckCircle, Clock, Eye, AlertCircle, Sparkles, Check, ChevronDown, CheckSquare, Square
} from 'lucide-react';
import StudentIDCard from '../StudentPortal/StudentIDCard.jsx';

export default function StudentIDCardsManager({ apiBaseUrl, sessionToken, userRole, userBranch, userBatch, branches = [], batches = [] }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [selectedBranch, setSelectedBranch] = useState(userBranch || 'All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Selection
  const [previewingStudent, setPreviewingStudent] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkPrintingMode, setBulkPrintingMode] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Sync selectedBranch if userBranch updates asynchronously
  useEffect(() => {
    if (userBranch && userRole !== 'superadmin' && userRole !== 'developer') {
      setSelectedBranch(userBranch);
    }
  }, [userBranch, userRole]);

  const fetchIdCardsList = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      const activeBranch = (userRole !== 'superadmin' && userRole !== 'developer')
        ? (userBranch || selectedBranch)
        : selectedBranch;

      if (activeBranch && activeBranch !== 'All') params.append('branch', activeBranch);
      if (selectedBatch && selectedBatch !== 'All') params.append('batch', selectedBatch);
      if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${apiBaseUrl}/admin/id-cards/list?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load student ID cards');
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdCardsList();
  }, [selectedBranch, selectedBatch, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIdCardsList();
  };

  // Quick Action: Regenerate QR Code
  const handleRegenerateQR = async (student) => {
    if (!window.confirm(`Are you sure you want to regenerate QR code for ${student.name} (${student.uniqueStudentId})? Any old printed cards will become inactive.`)) {
      return;
    }
    setActionInProgress(student.id);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/students/${student.id}/regenerate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate QR');
      setSuccessMsg(data.message || 'QR code regenerated successfully!');
      fetchIdCardsList();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  // Quick Action: Revoke QR Code
  const handleRevokeQR = async (student) => {
    if (!window.confirm(`Revoke QR code for ${student.name}? The student won't be able to log in or mark attendance using this card.`)) {
      return;
    }
    setActionInProgress(student.id);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/students/${student.id}/revoke-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke QR');
      setSuccessMsg(data.message || 'QR code revoked!');
      fetchIdCardsList();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  // Quick Action: Update ID Card Status
  const handleUpdateStatus = async (studentId, newStatus) => {
    try {
      const res = await fetch(`${apiBaseUrl}/admin/students/${studentId}/update-id-card-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, idCardStatus: newStatus } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Selection toggle
  const toggleSelectStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.id));
    }
  };

  // Bulk Print Trigger
  const handleBulkPrint = () => {
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student ID card to print.');
      return;
    }
    setBulkPrintingMode(true);
  };

  // Metric counts
  const totalCount = students.length;
  const generatedCount = students.filter(s => s.idCardStatus === 'Generated').length;
  const printedCount = students.filter(s => s.idCardStatus === 'Printed').length;
  const pendingCount = students.filter(s => s.idCardStatus === 'Pending' || !s.idCardStatus).length;

  return (
    <div className="id-cards-admin-container">
      {/* Top Header */}
      <div className="id-cards-admin-header">
        <div>
          <h1 className="id-cards-admin-title">
            <CreditCard size={28} color="#eab308" />
            <span>Student ID Cards & QR Management</span>
          </h1>
          <p className="id-cards-admin-subtitle">
            Generate, print, preview official MASTERFIT Academy ID cards with unique permanent IDs (MF-XXXX) and instant QR credentials.
          </p>
        </div>

        <div className="id-cards-header-actions">
          {selectedStudentIds.length > 0 && (
            <button 
              className="id-btn print-btn"
              onClick={handleBulkPrint}
            >
              <Printer size={16} />
              <span>Bulk Print ({selectedStudentIds.length})</span>
            </button>
          )}
          <button 
            className="id-btn secondary-btn"
            onClick={fetchIdCardsList}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spinning-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="id-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="id-metric-card">
          <div className="metric-icon total"><CreditCard size={20} /></div>
          <div className="metric-data">
            <span className="metric-val">{totalCount}</span>
            <span className="metric-lbl">Total Students</span>
          </div>
        </div>
        <div className="id-metric-card">
          <div className="metric-icon generated"><CheckCircle size={20} /></div>
          <div className="metric-data">
            <span className="metric-val">{students.filter(s => s.qrStatus === 'Active' || !s.qrStatus).length}</span>
            <span className="metric-lbl">Active ID Cards</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="admin-id-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="admin-id-alert success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="id-filter-bar">
        <form onSubmit={handleSearchSubmit} className="id-search-form">
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by student name or ID (e.g. Rahul or MF-0001)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" onClick={() => { setSearchQuery(''); fetchIdCardsList(); }} className="clear-search-btn">
              &times;
            </button>
          )}
        </form>

        <div className="id-filters-right">
          {/* Branch filter */}
          {(userRole === 'superadmin' || userRole === 'developer') && (
            <div className="id-select-wrap">
              <label>Branch:</label>
              <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="All">All Branches</option>
                {(branches || []).map((b, idx) => {
                  const bName = typeof b === 'string' ? b : (b?.name || b?.branchName || '');
                  if (!bName) return null;
                  return <option key={idx} value={bName}>{bName}</option>;
                })}
              </select>
            </div>
          )}

          {/* Batch filter */}
          <div className="id-select-wrap">
            <label>Batch:</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
              <option value="All">All Batches</option>
              {(batches || []).map((b, idx) => {
                const bName = typeof b === 'string' ? b : (b?.name || b?.batchName || b?.code || b?.id || '');
                if (!bName) return null;
                const bVal = typeof b === 'string' ? b : (b?.id || b?.code || b?.name || '');
                return <option key={idx} value={bVal}>{bName}</option>;
              })}
            </select>
          </div>


        </div>
      </div>

      {/* Main Student ID Table */}
      <div className="id-table-wrapper">
        <table className="id-cards-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <button type="button" onClick={toggleSelectAll} className="checkbox-toggle-btn">
                  {selectedStudentIds.length === students.length && students.length > 0 ? (
                    <CheckSquare size={18} color="#eab308" />
                  ) : (
                    <Square size={18} color="#64748b" />
                  )}
                </button>
              </th>
              <th>Student Details</th>
              <th>Student ID</th>
              <th>Branch & Batch</th>
              <th>Belt Rank</th>
              <th>QR Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <RefreshCw size={24} className="spinning-icon" color="#eab308" style={{ margin: '0 auto 10px auto' }} />
                  <p style={{ color: '#94a3b8', margin: 0 }}>Loading student ID records...</p>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <AlertCircle size={28} color="#64748b" style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ color: '#cbd5e1', fontWeight: 600, margin: '0 0 4px 0' }}>No student ID cards found</p>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Try clearing filters or search query</span>
                </td>
              </tr>
            ) : (
              students.map(student => {
                const studentKey = student.id || student._id || student.uniqueStudentId;
                const isSelected = selectedStudentIds.includes(studentKey);
                const initials = String(student.name || 'S')
                  .trim()
                  .split(/\s+/)
                  .map(n => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'S';

                return (
                  <tr key={studentKey} className={isSelected ? 'selected-row' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => toggleSelectStudent(studentKey)} 
                        className="checkbox-toggle-btn"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} color="#eab308" />
                        ) : (
                          <Square size={18} color="#64748b" />
                        )}
                      </button>
                    </td>

                    <td>
                      <div className="id-student-cell">
                        {student.photo ? (
                          <img src={student.photo} alt="" className="id-table-avatar" />
                        ) : (
                          <div className="id-table-avatar-placeholder">{initials}</div>
                        )}
                        <div>
                          <div className="student-table-name">{student.name}</div>
                          <span className="student-table-sub">Enrolled: {student.joinDate || 'Active'}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="uid-table-badge">
                        {student.uniqueStudentId || `MF-${String(student.id).padStart(4, '0')}`}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.82rem' }}>{student.branch}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>{student.batch}</span>
                      </div>
                    </td>

                    <td>
                      <span className="belt-rank-tag">{student.belt || 'White'}</span>
                    </td>

                    <td>
                      {student.qrStatus === 'Revoked' ? (
                        <span className="qr-status-pill revoked">Revoked</span>
                      ) : (
                        <span className="qr-status-pill active">Active</span>
                      )}
                    </td>



                    <td style={{ textAlign: 'center' }}>
                      <div className="id-action-buttons">
                        <button 
                          className="action-icon-btn preview"
                          onClick={() => setPreviewingStudent(student)}
                          title="Preview ID Card"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-icon-btn print"
                          onClick={() => setPreviewingStudent(student)}
                          title="Print / Download PDF"
                        >
                          <Printer size={16} />
                        </button>

                        {student.qrStatus !== 'Revoked' && (
                          <button 
                            className="action-icon-btn revoke"
                            onClick={() => handleRevokeQR(student)}
                            disabled={actionInProgress === student.id}
                            title="Revoke QR Code"
                          >
                            <ShieldAlert size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Single ID Card Preview Modal */}
      {previewingStudent && (
        <StudentIDCard 
          student={previewingStudent}
          onClose={() => setPreviewingStudent(null)}
          isModal={true}
        />
      )}

      {/* Bulk Print Modal Sheet */}
      {bulkPrintingMode && (
        <div className="id-card-modal-backdrop">
          <div className="id-card-modal-wrapper" style={{ maxWidth: '960px' }}>
            <div className="id-card-toolbar no-print">
              <div className="toolbar-title">
                <Printer size={20} color="#eab308" />
                <span>Bulk Print {selectedStudentIds.length} Student ID Cards</span>
              </div>
              <div className="toolbar-actions">
                <button className="id-btn print-btn" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>Print All {selectedStudentIds.length} Cards</span>
                </button>
                <button className="id-close-btn" onClick={() => setBulkPrintingMode(false)}>
                  &times;
                </button>
              </div>
            </div>

            <div id="printable-id-card" className="bulk-print-sheet">
              {students.filter(s => selectedStudentIds.includes(s.id)).map(student => (
                <div key={student.id} className="bulk-card-wrapper" style={{ margin: '14px' }}>
                  <StudentIDCard student={student} isModal={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS */}
      <style>{`
        .id-cards-admin-container {
          padding: 24px;
          color: #f8fafc;
        }
        .id-cards-admin-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }
        .id-cards-admin-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.65rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 6px 0;
        }
        .id-cards-admin-subtitle {
          color: #94a3b8;
          font-size: 0.85rem;
          margin: 0;
          max-width: 650px;
        }
        .id-cards-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .id-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .id-metric-card {
          background: #11141d;
          border: 1px solid #1f2738;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .metric-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .metric-icon.total { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .metric-icon.generated { background: rgba(234, 179, 8, 0.15); color: #eab308; }
        .metric-icon.printed { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .metric-icon.pending { background: rgba(249, 115, 22, 0.15); color: #f97316; }
        .metric-data { display: flex; flex-direction: column; }
        .metric-val { font-size: 1.45rem; font-weight: 800; color: #f8fafc; line-height: 1.1; }
        .metric-lbl { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-top: 3px; }

        .id-filter-bar {
          background: #11141d;
          border: 1px solid #1f2738;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 20px;
        }
        .id-search-form {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 260px;
        }
        .id-search-form svg {
          position: absolute;
          left: 12px;
          pointer-events: none;
        }
        .id-search-form input {
          width: 100%;
          background: #090c12;
          border: 1px solid #232b3e;
          border-radius: 8px;
          padding: 8px 36px 8px 36px;
          color: #f8fafc;
          font-size: 0.85rem;
          outline: none;
        }
        .clear-search-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.2rem;
          cursor: pointer;
        }
        .id-filters-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .id-select-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .id-select-wrap label {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 600;
        }
        .id-select-wrap select {
          background: #090c12;
          border: 1px solid #232b3e;
          color: #f8fafc;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .id-table-wrapper {
          background: #11141d;
          border: 1px solid #1f2738;
          border-radius: 14px;
          overflow-x: auto;
        }
        .id-cards-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .id-cards-table th {
          background: #090c12;
          padding: 12px 16px;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #1f2738;
        }
        .id-cards-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #1a202c;
          font-size: 0.85rem;
        }
        .id-cards-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .id-cards-table tr.selected-row {
          background: rgba(234, 179, 8, 0.05);
        }
        .checkbox-toggle-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .id-student-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .id-table-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .id-table-avatar-placeholder {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #1e2638;
          color: #eab308;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .student-table-name {
          color: #f8fafc;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .student-table-sub {
          color: #64748b;
          font-size: 0.72rem;
        }
        .uid-table-badge {
          background: rgba(234, 179, 8, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.35);
          color: #facc15;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.78rem;
          letter-spacing: 0.5px;
        }
        .belt-rank-tag {
          background: #1e2638;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #e2e8f0;
          font-weight: 600;
        }
        .qr-status-pill {
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .qr-status-pill.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .qr-status-pill.revoked {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .card-status-select {
          background: #090c12;
          border: 1px solid #232b3e;
          color: #f8fafc;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .card-status-select.Printed {
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.4);
        }
        .card-status-select.Generated {
          color: #eab308;
          border-color: rgba(234, 179, 8, 0.4);
        }
        .card-status-select.Pending {
          color: #94a3b8;
        }
        .id-action-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .action-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e2638;
          border: 1px solid #2a3449;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-icon-btn.preview:hover { background: #3b82f6; color: #fff; }
        .action-icon-btn.print:hover { background: #eab308; color: #0b0e15; }
        .action-icon-btn.regen:hover { background: #10b981; color: #fff; }
        .action-icon-btn.revoke:hover { background: #ef4444; color: #fff; }

        .admin-id-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }
        .admin-id-alert.error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
        .admin-id-alert.success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }
        .secondary-btn {
          background: #1e2638;
          color: #f8fafc;
          border: 1px solid #2a3449;
        }
        .secondary-btn:hover {
          background: #28334a;
        }
        .bulk-print-sheet {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

