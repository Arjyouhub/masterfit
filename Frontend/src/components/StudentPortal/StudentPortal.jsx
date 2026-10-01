import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, CreditCard, CalendarCheck, History, Bell, User, LogOut,
  CheckCircle2, Clock, AlertTriangle, XCircle, ChevronRight, UploadCloud,
  FileText, ArrowRight, Shield, Award, MapPin, Calendar, Smartphone, RefreshCw,
  ExternalLink, Eye, ChevronLeft, AlertCircle, Sparkles, Check, Copy, Users, ShieldCheck
} from 'lucide-react';
import FirstLoginMpinModal from './FirstLoginMpinModal.jsx';

export default function StudentPortal({ apiBaseUrl, initialStudent, token, sessionToken, onLogout }) {
  const authToken = token || sessionToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('umai_student_token') : '');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [student, setStudent] = useState(initialStudent || {});
  const [mustChangeMpin, setMustChangeMpin] = useState(initialStudent?.mustChangeMPIN || false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Portal Data States
  const [profileData, setProfileData] = useState(null);
  const [feeData, setFeeData] = useState({ feeRecords: [], summary: {} });
  const [paymentHistory, setPaymentHistory] = useState({ submissions: [], officialPayments: [] });
  const [attendanceData, setAttendanceData] = useState({ month: '', days: [], presentCount: 0, absentCount: 0, percentage: 100 });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMonthsForPay, setSelectedMonthsForPay] = useState([]);
  const [payFormData, setPayFormData] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI',
    transactionId: '',
    proofImage: ''
  });
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');
  const [payErrorMsg, setPayErrorMsg] = useState('');

  // Proof Viewer Modal
  const [viewProofModal, setViewProofModal] = useState(null);

  // Month selector for attendance
  const [selectedAttMonth, setSelectedAttMonth] = useState(new Date().toISOString().slice(0, 7));

  // Copy feedback state
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldName) => {
    if (!text || text === 'N/A') return;
    try {
      navigator.clipboard.writeText(String(text).trim());
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 1800);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'Not Specified';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Fetch all initial data
  const loadPortalData = async () => {
    try {
      setRefreshing(true);
      const headers = { 'Authorization': `Bearer ${authToken}` };

      // 1. Profile / Me
      const meRes = await fetch(`${apiBaseUrl}/student/me`, { headers });
      if (meRes.ok) {
        const meJson = await meRes.json();
        setProfileData(meJson);
        if (meJson.student) {
          setStudent(prev => ({ ...prev, ...meJson.student }));
          setMustChangeMpin(meJson.student.mustChangeMPIN);
        }
        setUnreadNotifsCount(meJson.unreadNotifications || 0);
      }

      // 2. Fees
      const feeRes = await fetch(`${apiBaseUrl}/student/fees`, { headers });
      if (feeRes.ok) {
        const feeJson = await feeRes.json();
        setFeeData(feeJson);
      }

      // 3. Payment History
      const payRes = await fetch(`${apiBaseUrl}/student/payments/history`, { headers });
      if (payRes.ok) {
        const payJson = await payRes.json();
        setPaymentHistory(payJson);
      }

      // 4. Attendance
      const attRes = await fetch(`${apiBaseUrl}/student/attendance?month=${selectedAttMonth}`, { headers });
      if (attRes.ok) {
        const attJson = await attRes.json();
        setAttendanceData(attJson);
      }

      // 5. Notifications
      const notifRes = await fetch(`${apiBaseUrl}/student/notifications`, { headers });
      if (notifRes.ok) {
        const notifJson = await notifRes.json();
        setNotifications(notifJson.notifications || []);
        setUnreadNotifsCount(notifJson.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading student portal data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, [selectedAttMonth]);

  // Handle Pay Modal Opening
  const handleOpenPayModal = (preselectedMonth = null) => {
    setPayErrorMsg('');
    setPaySuccessMsg('');
    const pendingMonths = feeData.feeRecords.filter(r => r.status === 'PENDING' || r.status === 'REJECTED');

    if (preselectedMonth) {
      setSelectedMonthsForPay([preselectedMonth]);
    } else {
      setSelectedMonthsForPay(pendingMonths.map(p => p.feeMonth));
    }
    setPayFormData({
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: 'UPI',
      transactionId: '',
      proofImage: ''
    });
    setIsPayModalOpen(true);
  };

  const toggleSelectMonth = (ym) => {
    setSelectedMonthsForPay(prev => {
      if (prev.includes(ym)) {
        return prev.filter(m => m !== ym);
      } else {
        return [...prev, ym];
      }
    });
  };

  const handleProofImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPayErrorMsg('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPayFormData(prev => ({ ...prev, proofImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPayErrorMsg('');
    setPaySuccessMsg('');

    if (selectedMonthsForPay.length === 0) {
      setPayErrorMsg('Please select at least one fee month to pay');
      return;
    }
    if (!payFormData.proofImage) {
      setPayErrorMsg('Please upload a screenshot or receipt of your payment');
      return;
    }

    const monthlyRate = student.monthlyRate || profileData?.student?.monthlyRate || 1000;
    const totalAmount = selectedMonthsForPay.length * monthlyRate;

    const feeAllocations = selectedMonthsForPay.map(ym => ({
      feeMonth: ym,
      feeType: 'monthly',
      amount: monthlyRate,
      description: `${ym} Fee`
    }));

    setPaySubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/student/payments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          paymentDate: payFormData.paymentDate,
          totalAmount,
          paymentMethod: payFormData.paymentMethod,
          transactionId: payFormData.transactionId,
          feeAllocations,
          proofImage: payFormData.proofImage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment proof');
      }

      setPaySuccessMsg('Payment submitted successfully! It is now under admin verification.');
      await loadPortalData();
      setTimeout(() => {
        setIsPayModalOpen(false);
        setPaySuccessMsg('');
      }, 2000);
    } catch (err) {
      setPayErrorMsg(err.message);
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await fetch(`${apiBaseUrl}/student/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadNotifsCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  };

  return (
    <div className="student-portal-wrapper">
      {/* First Login MPIN Enforcer */}
      {mustChangeMpin && (
        <FirstLoginMpinModal
          token={authToken}
          apiBaseUrl={apiBaseUrl}
          onSuccess={() => {
            setMustChangeMpin(false);
            loadPortalData();
          }}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="student-sidebar">
        <div className="student-sidebar-brand">
          <div className="student-brand-icon-sm">
            <Shield size={22} />
          </div>
          <div className="student-brand-text">
            <span className="brand-title">MASTER FIT</span>
            <span className="brand-badge">STUDENT PORTAL</span>
          </div>
        </div>

        <nav className="student-sidebar-nav">
          <button
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentTab === 'fees' ? 'active' : ''}`}
            onClick={() => setCurrentTab('fees')}
          >
            <CreditCard size={20} />
            <span>My Fees</span>
            {feeData.summary?.pendingMonthsCount > 0 && (
              <span className="nav-badge pending">{feeData.summary.pendingMonthsCount}</span>
            )}
          </button>
          <button
            className={`nav-item ${currentTab === 'payments' ? 'active' : ''}`}
            onClick={() => setCurrentTab('payments')}
          >
            <History size={20} />
            <span>Payment History</span>
          </button>
          <button
            className={`nav-item ${currentTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setCurrentTab('attendance')}
          >
            <CalendarCheck size={20} />
            <span>Attendance</span>
          </button>
          <button
            className={`nav-item ${currentTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setCurrentTab('notifications')}
          >
            <Bell size={20} />
            <span>Notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="nav-badge notif">{unreadNotifsCount}</span>
            )}
          </button>
          <button
            className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentTab('profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </nav>

        <div className="student-sidebar-footer">
          <div className="student-user-card">
            <div className="user-avatar">
              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="user-info">
              <span className="user-name">{student.name || 'Student'}</span>
              <span className="user-id">ID: #{student.id}</span>
            </div>
          </div>
          <button onClick={onLogout} className="logout-btn" title="Sign Out">
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Portal View */}
      <main className="student-main-content">
        {/* Top Header */}
        <header className="student-header">
          <div className="student-header-title">
            <h1>{currentTab === 'dashboard' ? (student.name ? `Hi, ${student.name.split(' ')[0]}` : 'Dashboard') : currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace('-', ' ')}</h1>
          </div>

          <div className="student-header-actions">
            <button
              onClick={loadPortalData}
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
              title="Refresh Data"
            >
              <RefreshCw size={17} />
            </button>
            <button
              onClick={() => setCurrentTab('notifications')}
              className="notif-header-btn"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifsCount > 0 && <span className="notif-dot"></span>}
            </button>
            <button onClick={onLogout} className="mobile-logout-btn" title="Sign Out">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="student-tab-viewport">
          {/* TAB: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="student-dashboard-view">
              {/* Profile Card Banner */}
              <div className="student-hero-card">
                <div className="hero-avatar-wrap">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} className="hero-avatar" />
                  ) : (
                    <div className="hero-avatar-fallback">
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                  <span className="belt-tag" style={{ background: getBeltColor(student.belt) }}></span>
                </div>

                <div className="hero-details">
                  <div className="hero-name-row">
                    <h2>{student.name}</h2>
                    <span className="student-status-badge active">Active Member</span>
                  </div>
                  <div className="hero-meta-chips">
                    <span className="hero-chip"><strong>ID:</strong> #{student.id}</span>
                    <span className="hero-chip belt" style={{ borderColor: getBeltColor(student.belt), color: getBeltColor(student.belt) }}>
                      <Award size={13} /> {student.belt || 'White'} Belt
                    </span>
                    <span className="hero-chip"><MapPin size={12} /> {student.branch}</span>
                    <span className="hero-chip">🥋 {student.batchName || student.batch || 'General'}</span>
                  </div>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="student-stats-row">
                {/* Attendance Stat */}
                <div className="student-stat-card" onClick={() => setCurrentTab('attendance')}>
                  <div className="stat-card-header">
                    <span className="stat-label">This Month Attendance</span>
                    <CalendarCheck size={18} className="stat-icon att" />
                  </div>
                  <div className="stat-main-number">
                    {profileData?.attendance?.attendancePercentage || 100}%
                  </div>
                  <div className="stat-sub-info">
                    <span className="green-text">{profileData?.attendance?.presentCount || 0} Present</span>
                    <span className="sep">•</span>
                    <span className="red-text">{profileData?.attendance?.absentCount || 0} Absent</span>
                  </div>
                </div>

                {/* Fees Stat */}
                <div className="student-stat-card" onClick={() => setCurrentTab('fees')}>
                  <div className="stat-card-header">
                    <span className="stat-label">Pending Dues</span>
                    <CreditCard size={18} className="stat-icon fee" />
                  </div>
                  <div className={`stat-main-number ${feeData.summary?.totalPendingAmount > 0 ? 'red' : 'green'}`}>
                    ₹{(feeData.summary?.totalPendingAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="stat-sub-info">
                    {feeData.summary?.pendingMonthsCount > 0 ? (
                      <span className="red-text">{feeData.summary.pendingMonthsCount} month(s) pending</span>
                    ) : (
                      <span className="green-text">All dues cleared</span>
                    )}
                  </div>
                </div>

                {/* Quick Pay Action */}
                <div className="student-stat-card action-card" onClick={() => handleOpenPayModal()}>
                  <div className="stat-card-header">
                    <span className="stat-label">Quick Settlement</span>
                    <Sparkles size={18} className="stat-icon action" />
                  </div>
                  <div className="stat-action-body">
                    <span className="pay-prompt">Pay Online & Upload Proof</span>
                    <button className="mini-pay-btn">
                      <span>Pay Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lower Section: Recent Submissions + Notifications */}
              <div className="student-dashboard-split">
                {/* Recent Submissions */}
                <div className="student-content-panel">
                  <div className="panel-header">
                    <h3>Recent Payment Activities</h3>
                    <button onClick={() => setCurrentTab('payments')} className="panel-link">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="panel-body">
                    {paymentHistory.submissions?.length === 0 && paymentHistory.officialPayments?.length === 0 ? (
                      <div className="empty-panel">
                        <FileText size={32} />
                        <p>No recent payment submissions found.</p>
                      </div>
                    ) : (
                      <div className="activity-list">
                        {paymentHistory.submissions?.slice(0, 3).map((sub) => (
                          <div key={sub._id || sub.submissionId} className="activity-item">
                            <div className="activity-icon-wrap">
                              {getStatusIcon(sub.status)}
                            </div>
                            <div className="activity-details">
                              <div className="activity-title">
                                ₹{sub.totalAmount?.toLocaleString('en-IN')} — {sub.paymentMethod}
                              </div>
                              <div className="activity-sub">
                                Covered: {sub.feeAllocations?.map(a => a.feeMonth).join(', ')} • {sub.paymentDate}
                              </div>
                            </div>
                            <span className={`status-badge-mini ${getStatusClass(sub.status)}`}>
                              {sub.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Notifications */}
                <div className="student-content-panel">
                  <div className="panel-header">
                    <h3>Academy Announcements</h3>
                    <button onClick={() => setCurrentTab('notifications')} className="panel-link">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="panel-body">
                    {notifications.length === 0 ? (
                      <div className="empty-panel">
                        <Bell size={32} />
                        <p>No new notifications at this time.</p>
                      </div>
                    ) : (
                      <div className="activity-list">
                        {notifications.slice(0, 3).map((n) => (
                          <div
                            key={n._id}
                            className={`notif-item-preview ${n.isRead ? 'read' : 'unread'}`}
                            onClick={() => handleMarkNotifRead(n._id)}
                          >
                            <div className="notif-dot-col">
                              {!n.isRead && <span className="blue-dot"></span>}
                            </div>
                            <div className="notif-content">
                              <div className="notif-title">{n.title}</div>
                              <div className="notif-desc">{n.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MY FEES */}
          {currentTab === 'fees' && (
            <div className="student-fees-view">
              <div className="fees-banner-card">
                <div className="fees-banner-content">
                  <h2>Fee Management</h2>
                  <p>View your monthly fee schedule, pending balances, and submit digital payment receipts.</p>
                  <div className="fee-summary-strip">
                    <div className="strip-item">
                      <span className="strip-label">Monthly Rate</span>
                      <span className="strip-value">₹{(student.monthlyRate || profileData?.student?.monthlyRate || 1000).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="strip-item">
                      <span className="strip-label">Pending Dues</span>
                      <span className="strip-value red">₹{(feeData.summary?.totalPendingAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="strip-item">
                      <span className="strip-label">Total Paid Months</span>
                      <span className="strip-value green">{feeData.summary?.paidMonthsCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="fees-banner-cta">
                  <button onClick={() => handleOpenPayModal()} className="student-btn primary">
                    <CreditCard size={15} />
                    <span>Pay Pending Fees</span>
                  </button>
                </div>
              </div>

              {/* Fee Schedule Container: Desktop Table + Mobile App Cards */}
              <div className="student-card table-card fee-schedule-card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <h3>Fee Schedule</h3>
                    <span className="schedule-hint">Monthly fee records from academy billing registry</span>
                  </div>
                  {feeData.summary?.pendingMonthsCount > 0 && (
                    <span className="pending-counter-badge">
                      {feeData.summary.pendingMonthsCount} Pending
                    </span>
                  )}
                </div>

                {/* Desktop View: Table */}
                <div className="fees-desktop-table-wrap">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>Fee Month</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Details</th>
                        <th className="action-col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeData.feeRecords?.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-table-td">No fee records found.</td>
                        </tr>
                      ) : (
                        feeData.feeRecords.map((item) => (
                          <tr key={item.feeMonth}>
                            <td className="month-td">
                              <span className="month-name">{formatMonthName(item.feeMonth)}</span>
                              <span className="month-raw">({item.feeMonth})</span>
                            </td>
                            <td className="amount-td">₹{item.amount?.toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`status-pill ${getStatusClass(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="details-td">
                              {item.status === 'PAID' && (
                                <span className="green-sub-text">Paid & Verified</span>
                              )}
                              {item.status === 'PAYMENT UNDER REVIEW' && (
                                <span className="amber-sub-text">Awaiting Admin Verification</span>
                              )}
                              {item.status === 'REJECTED' && (
                                <span className="red-sub-text">Reason: {item.rejectionReason || 'Receipt Unverified'}</span>
                              )}
                              {item.status === 'PENDING' && (
                                <span className="gray-sub-text">Due for settlement</span>
                              )}
                            </td>
                            <td className="action-col">
                              {item.status !== 'PAID' && item.status !== 'PAYMENT UNDER REVIEW' ? (
                                <button
                                  onClick={() => handleOpenPayModal(item.feeMonth)}
                                  className="table-pay-btn"
                                >
                                  Pay Now
                                </button>
                              ) : (
                                <span className="completed-check">
                                  <Check size={16} />
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: High-End Native App Month Cards */}
                <div className="fees-mobile-cards-list">
                  {feeData.feeRecords?.length === 0 ? (
                    <div className="empty-fee-records">
                      <CreditCard size={32} />
                      <p>No fee records found for this student account.</p>
                    </div>
                  ) : (
                    feeData.feeRecords.map((item) => (
                      <div key={item.feeMonth} className={`fee-mobile-card ${item.status === 'PAID' ? 'is-paid' : item.status === 'PENDING' ? 'is-pending' : ''}`}>
                        <div className="f-mob-header">
                          <div className="f-mob-title">
                            <span className="f-mob-month">{formatMonthName(item.feeMonth)}</span>
                            <span className="f-mob-code">{item.feeMonth}</span>
                          </div>
                          <span className={`status-pill ${getStatusClass(item.status)}`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="f-mob-action-row">
                          <div className="f-mob-amount-block">
                            <span className="f-mob-amount">₹{item.amount?.toLocaleString('en-IN')}</span>
                            <div className="f-mob-status-note">
                              {item.status === 'PAID' && (
                                <span className="green-sub-text">Paid & Verified</span>
                              )}
                              {item.status === 'PAYMENT UNDER REVIEW' && (
                                <span className="amber-sub-text">Under Review</span>
                              )}
                              {item.status === 'REJECTED' && (
                                <span className="red-sub-text">Receipt Rejected</span>
                              )}
                              {item.status === 'PENDING' && (
                                <span className="gray-sub-text">Due for settlement</span>
                              )}
                            </div>
                          </div>

                          <div className="f-mob-btn-wrap">
                            {item.status !== 'PAID' && item.status !== 'PAYMENT UNDER REVIEW' ? (
                              <button
                                onClick={() => handleOpenPayModal(item.feeMonth)}
                                className="f-mob-pay-btn"
                              >
                                <CreditCard size={13} />
                                <span>Pay Now</span>
                                <ChevronRight size={12} style={{ marginLeft: '1px', opacity: 0.85 }} />
                              </button>
                            ) : item.status === 'PAID' ? (
                              <div className="f-mob-cleared-badge">
                                <Check size={14} />
                                <span>Settled</span>
                              </div>
                            ) : (
                              <div className="f-mob-review-badge">
                                <Clock size={14} />
                                <span>In Review</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {item.status === 'REJECTED' && item.rejectionReason && (
                          <div className="f-mob-reject-reason">
                            Reason: {item.rejectionReason}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS (HISTORY & PROOF) */}
          {currentTab === 'payments' && (
            <div className="student-payments-view">
              <div className="payments-header-row">
                <div>
                  <h2>Payment Submissions & Receipts</h2>
                  <p>Track all digital receipts, approved payments, and submitted proof screenshots</p>
                </div>
                <button onClick={() => handleOpenPayModal()} className="student-btn primary">
                  <UploadCloud size={18} />
                  <span>Submit New Payment Proof</span>
                </button>
              </div>

              {/* Submissions List */}
              <div className="submissions-grid">
                {paymentHistory.submissions?.length === 0 && paymentHistory.officialPayments?.length === 0 ? (
                  <div className="empty-card">
                    <History size={40} />
                    <p>No payment submissions recorded yet.</p>
                  </div>
                ) : (
                  paymentHistory.submissions?.map((sub) => (
                    <div key={sub._id || sub.submissionId} className="payment-record-card">
                      <div className="record-header">
                        <div className="record-title-group">
                          <span className="record-id">{sub.submissionId}</span>
                          <span className="record-date">{sub.paymentDate}</span>
                        </div>
                        <span className={`status-pill ${getStatusClass(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>

                      <div className="record-body">
                        <div className="record-amount-strip">
                          <span className="amt-label">Amount Paid</span>
                          <span className="amt-val">₹{sub.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="record-info-grid">
                          <div><strong>Method:</strong> {sub.paymentMethod}</div>
                          <div><strong>UTR / Ref:</strong> {sub.transactionId || 'N/A'}</div>
                          <div><strong>Submitted:</strong> {new Date(sub.submittedAt).toLocaleDateString()}</div>
                          <div>
                            <strong>Covered Months:</strong>{' '}
                            {sub.feeAllocations?.map(a => a.feeMonth).join(', ')}
                          </div>
                        </div>

                        {sub.status === 'REJECTED' && sub.rejectionReason && (
                          <div className="rejection-box">
                            <AlertTriangle size={16} />
                            <span><strong>Rejection Reason:</strong> {sub.rejectionReason}</span>
                          </div>
                        )}
                      </div>

                      <div className="record-footer">
                        {sub.proofImage ? (
                          <button
                            onClick={() => setViewProofModal(sub)}
                            className="view-proof-btn"
                          >
                            <Eye size={15} />
                            <span>View Submitted Proof</span>
                          </button>
                        ) : (
                          <span className="no-proof-txt">No image attached</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: ATTENDANCE */}
          {currentTab === 'attendance' && (
            <div className="student-attendance-view">
              <div className="attendance-controls-row">
                <div>
                  <h2>Training Attendance</h2>
                  <p>Read-only record of training sessions attended at your registered branch</p>
                </div>

                <div className="month-picker-wrap">
                  <Calendar size={16} />
                  <input
                    type="month"
                    value={selectedAttMonth}
                    onChange={(e) => setSelectedAttMonth(e.target.value)}
                    className="month-input"
                  />
                </div>
              </div>

              {/* Attendance Summary Strip */}
              <div className="attendance-stat-strip">
                <div className="att-box">
                  <span className="att-label">Attendance Rate</span>
                  <span className="att-val green">{attendanceData.percentage || 100}%</span>
                </div>
                <div className="att-box">
                  <span className="att-label">Present Sessions</span>
                  <span className="att-val green">{attendanceData.presentCount || 0}</span>
                </div>
                <div className="att-box">
                  <span className="att-label">Absent Sessions</span>
                  <span className="att-val red">{attendanceData.absentCount || 0}</span>
                </div>
                <div className="att-box">
                  <span className="att-label">Total Scheduled</span>
                  <span className="att-val">{attendanceData.totalClasses || 0}</span>
                </div>
              </div>

              {/* Monthly Calendar Day View */}
              <div className="student-card att-calendar-card">
                <div className="calendar-header-legend">
                  <h3>Training Calendar: {formatMonthName(selectedAttMonth)}</h3>
                  <div className="legend-items">
                    <span className="legend-item"><span className="legend-dot green"></span> Present</span>
                    <span className="legend-item"><span className="legend-dot red"></span> Absent</span>
                    <span className="legend-item"><span className="legend-dot gray"></span> Non-Class Day</span>
                  </div>
                </div>

                <div className="att-days-grid">
                  {attendanceData.days?.length === 0 ? (
                    <div className="empty-calendar-td">No attendance logs found for this calendar month.</div>
                  ) : (
                    attendanceData.days?.map((d) => (
                      <div
                        key={d.date}
                        className={`calendar-day-box ${d.status === 'present' ? 'day-present' : d.status === 'absent' ? 'day-absent' : 'day-none'}`}
                      >
                        <div className="day-number">{parseInt(d.date.slice(-2), 10)}</div>
                        <div className="day-status-label">
                          {d.status === 'present' ? 'Present' : d.status === 'absent' ? 'Absent' : '—'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {currentTab === 'notifications' && (
            <div className="student-notifications-view">
              <div className="notifications-header-row">
                <div>
                  <h2>Notifications & Alerts</h2>
                  <p>Official academy announcements, payment approval confirmations, and fee reminders</p>
                </div>
                {unreadNotifsCount > 0 && (
                  <span className="unread-pill">{unreadNotifsCount} Unread</span>
                )}
              </div>

              <div className="notifications-list-container">
                {notifications.length === 0 ? (
                  <div className="empty-card">
                    <Bell size={40} />
                    <p>No notifications available.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`notif-card ${n.isRead ? 'read' : 'unread'}`}
                      onClick={() => !n.isRead && handleMarkNotifRead(n._id)}
                    >
                      <div className="notif-icon-col">
                        <div className={`notif-type-icon ${n.type || 'general'}`}>
                          <Bell size={18} />
                        </div>
                      </div>
                      <div className="notif-body-col">
                        <div className="notif-card-header">
                          <h4>{n.title}</h4>
                          <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="notif-message-text">{n.message}</p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkNotifRead(n._id);
                          }}
                          className="mark-read-action"
                          title="Mark as Read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {currentTab === 'profile' && (
            <div className="student-profile-view">
              <div className="profile-top-card">
                <div className="profile-photo-col">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} className="profile-large-photo" />
                  ) : (
                    <div className="profile-photo-placeholder">
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                  <div className="profile-belt-badge" style={{ backgroundColor: getBeltColor(student.belt) }}>
                    {student.belt || 'White'} Belt
                  </div>
                </div>

                <div className="profile-header-info">
                  <h2>{student.name}</h2>
                  <p className="student-id-tag">Student ID: #{student.id}</p>
                  <div className="profile-badges-row">
                    <span className="p-pill">{student.branch} Branch</span>
                    <span className="p-pill">
                      {String(student.batchName || student.batch || 'General').toLowerCase().includes('batch')
                        ? (student.batchName || student.batch)
                        : `${student.batchName || student.batch} Batch`}
                    </span>
                    <span className="p-pill status-active">Status: Active</span>
                  </div>
                </div>
              </div>

              <div className="profile-modern-container">
                {/* Section 1: Martial Arts & Academy Details */}
                <div className="profile-modern-card">
                  <div className="profile-section-header">
                    <div className="section-icon-badge martial">
                      <Award size={20} />
                    </div>
                    <div>
                      <h3>Martial Arts & Training</h3>
                      <p>Academy membership, rank and active batch allocation</p>
                    </div>
                  </div>

                  <div className="details-tiles-list">
                    {/* Belt Rank */}
                    <div className="modern-detail-tile">
                      <div className="tile-icon-wrap" style={{ background: `${getBeltColor(student?.belt)}22`, color: getBeltColor(student?.belt), border: `1px solid ${getBeltColor(student?.belt)}44` }}>
                        <Award size={18} />
                      </div>
                      <div className="tile-info">
                        <span className="tile-label">Belt Rank</span>
                        <div className="tile-value-row">
                          <span className="tile-value">{student?.belt || 'White'} Belt</span>
                          <span className="tile-rank-pill" style={{ borderColor: getBeltColor(student?.belt), color: getBeltColor(student?.belt) }}>
                            Verified Rank
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Academy Branch */}
                    <div className="modern-detail-tile">
                      <div className="tile-icon-wrap branch">
                        <MapPin size={18} />
                      </div>
                      <div className="tile-info">
                        <span className="tile-label">Branch</span>
                        <span className="tile-value">{student?.branch || 'Main Branch'}</span>
                      </div>
                    </div>

                    {/* Training Batch */}
                    <div className="modern-detail-tile">
                      <div className="tile-icon-wrap batch">
                        <Clock size={18} />
                      </div>
                      <div className="tile-info">
                        <span className="tile-label">Batch</span>
                        <span className="tile-value">{student?.batchName || student?.batch || 'General Training'}</span>
                      </div>
                    </div>

                    {/* Join / Admission Date */}
                    <div className="modern-detail-tile">
                      <div className="tile-icon-wrap join">
                        <CalendarCheck size={18} />
                      </div>
                      <div className="tile-info">
                        <span className="tile-label">Admission Date</span>
                        <span className="tile-value">{formatDisplayDate(student?.joinDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal & Contact Information */}
                <div className="profile-modern-card">
                  <div className="profile-section-header">
                    <div className="section-icon-badge personal">
                      <User size={20} />
                    </div>
                    <div>
                      <h3>Personal & Contact Info</h3>
                      <p>Registered identification and verified guardian details</p>
                    </div>
                  </div>

                  <div className="details-tiles-list">
                    {/* Full Name */}
                    <div className="modern-detail-tile">
                      <div className="tile-icon-wrap user">
                        <User size={18} />
                      </div>
                      <div className="tile-info">
                        <span className="tile-label">Full Name</span>
                        <span className="tile-value">{student?.name || 'Student'}</span>
                      </div>
                    </div>

                    {/* Registered Mobile / Login ID */}
                    <div className="modern-detail-tile">
                      <div className="tile-icon-wrap mobile">
                        <Smartphone size={18} />
                      </div>
                      <div className="tile-info">
                        <div className="tile-label-row">
                          <span className="tile-label">Mobile (Login ID)</span>
                        </div>
                        <span className="tile-value">+91 {student?.mobileNumber || student?.phone || 'N/A'}</span>
                      </div>
                      {(student?.mobileNumber || student?.phone) && (
                        <button
                          type="button"
                          className="tile-copy-btn"
                          onClick={() => handleCopy(student?.mobileNumber || student?.phone, 'mobile')}
                          title="Copy Mobile Number"
                        >
                          {copiedField === 'mobile' ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>

                    {/* Parent / Guardian Phone */}
                    <div className="modern-detail-tile">
                      <div className="tile-icon-wrap parent">
                        <Users size={18} />
                      </div>
                      <div className="tile-info">
                        <span className="tile-label">Guardian Phone</span>
                        <span className="tile-value">{student?.parentPhone ? `+91 ${student.parentPhone}` : 'Not Provided'}</span>
                      </div>
                      {student?.parentPhone && (
                        <button
                          type="button"
                          className="tile-copy-btn"
                          onClick={() => handleCopy(student.parentPhone, 'parent')}
                          title="Copy Parent Number"
                        >
                          {copiedField === 'parent' ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="modern-detail-tile">
                      <div className="tile-icon-wrap dob">
                        <Calendar size={18} />
                      </div>
                      <div className="tile-info">
                        <span className="tile-label">Date of Birth</span>
                        <span className="tile-value">{formatDisplayDate(student?.dob)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Record Trust Banner */}
                <div className="modern-verified-banner">
                  <div className="verified-shield-glow">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="verified-banner-content">
                    <h4>Verified Academy Record</h4>
                    <p>
                      Critical registration information (Branch, Batch, Belt Rank, and Official Fee Records) is authenticated and protected by Master Fit Academy. For updates or corrections, please contact your branch administrator.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="student-bottom-nav">
        <button
          className={`b-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>
        <button
          className={`b-nav-item ${currentTab === 'fees' ? 'active' : ''}`}
          onClick={() => setCurrentTab('fees')}
        >
          <CreditCard size={20} />
          <span>Fees</span>
          {feeData.summary?.pendingMonthsCount > 0 && <span className="b-dot"></span>}
        </button>
        <button
          className={`b-nav-item ${currentTab === 'payments' ? 'active' : ''}`}
          onClick={() => setCurrentTab('payments')}
        >
          <History size={20} />
          <span>History</span>
        </button>
        <button
          className={`b-nav-item ${currentTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setCurrentTab('attendance')}
        >
          <CalendarCheck size={20} />
          <span>Attend</span>
        </button>
        <button
          className={`b-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Multi-Month Fee Pay & Proof Upload Modal */}
      {isPayModalOpen && (
        <div className="student-modal-overlay" onClick={() => setIsPayModalOpen(false)}>
          <div className="student-modal-card pay-modal" onClick={(e) => e.stopPropagation()}>
            <div className="student-modal-header">
              <div className="student-icon-badge primary">
                <CreditCard size={24} />
              </div>
              <h2>Submit Fee Payment</h2>
              <p>Select the pending fee months to cover and upload your payment transaction proof.</p>
            </div>

            {payErrorMsg && (
              <div className="student-alert error">
                <AlertCircle size={18} />
                <span>{payErrorMsg}</span>
              </div>
            )}
            {paySuccessMsg && (
              <div className="student-alert success">
                <CheckCircle2 size={18} />
                <span>{paySuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="student-pay-form">
              {/* Month Selection Checklist */}
              <div className="pay-section">
                <label className="section-heading">1. Select Fee Month(s) to Pay:</label>
                <div className="month-checkbox-grid">
                  {feeData.feeRecords?.filter(r => r.status === 'PENDING' || r.status === 'REJECTED').length === 0 ? (
                    <div className="no-pending-txt">You have no pending monthly dues!</div>
                  ) : (
                    feeData.feeRecords?.filter(r => r.status === 'PENDING' || r.status === 'REJECTED').map(m => (
                      <label
                        key={m.feeMonth}
                        className={`month-check-pill ${selectedMonthsForPay.includes(m.feeMonth) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMonthsForPay.includes(m.feeMonth)}
                          onChange={() => toggleSelectMonth(m.feeMonth)}
                        />
                        <div className="pill-content">
                          <span className="p-month">{formatMonthName(m.feeMonth)}</span>
                          <span className="p-amt">₹{m.amount?.toLocaleString('en-IN')}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {/* Live Amount Total Banner */}
                <div className="pay-total-banner">
                  <span>Total Payment Amount:</span>
                  <strong className="total-val">
                    ₹{(selectedMonthsForPay.length * (student.monthlyRate || profileData?.student?.monthlyRate || 1000)).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Academy Bank / UPI Payment Instructions */}
              <div className="pay-instructions-card">
                <div className="inst-title">Academy Payment Destination:</div>
                <div className="inst-details">
                  <div><strong>Account Name:</strong> Master Fit Academy</div>
                </div>
                <div className="inst-note">
                  Please complete the payment transfer, take a screenshot of the receipt, and fill in the details below.
                </div>
              </div>

              {/* Form Inputs */}
              <div className="pay-fields-grid">
                <div className="student-input-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    value={payFormData.paymentDate}
                    onChange={(e) => setPayFormData({ ...payFormData, paymentDate: e.target.value })}
                    required
                  />
                </div>

                <div className="student-input-group">
                  <label>Payment Method</label>
                  <select
                    value={payFormData.paymentMethod}
                    onChange={(e) => setPayFormData({ ...payFormData, paymentMethod: e.target.value })}
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                    <option value="Cash">Cash at Academy Office</option>
                    <option value="Card">Debit / Credit Card</option>
                  </select>
                </div>

                <div className="student-input-group full-w">
                  <label>Transaction ID / UTR / Reference Number</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR 481928491823"
                    value={payFormData.transactionId}
                    onChange={(e) => setPayFormData({ ...payFormData, transactionId: e.target.value })}
                  />
                </div>

                <div className="student-input-group full-w">
                  <label>Upload Payment Receipt / Screenshot (JPG / PNG)</label>
                  <div className="file-upload-dropzone">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleProofImageUpload}
                      required
                      id="proof-upload-input"
                    />
                    <label htmlFor="proof-upload-input" className="dropzone-label">
                      <UploadCloud size={28} />
                      <span>{payFormData.proofImage ? 'Change Receipt Screenshot' : 'Click to Upload Receipt Screenshot'}</span>
                      <small>Max file size 5MB (JPG, PNG)</small>
                    </label>
                  </div>
                  {payFormData.proofImage && (
                    <div className="proof-preview-thumbnail">
                      <img src={payFormData.proofImage} alt="Receipt Preview" />
                      <span className="preview-label">Preview Ready</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-buttons-row">
                <button
                  type="button"
                  className="student-btn secondary"
                  onClick={() => setIsPayModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paySubmitting || selectedMonthsForPay.length === 0 || !payFormData.proofImage}
                  className="student-btn primary"
                >
                  {paySubmitting ? 'Submitting Verification...' : 'Submit Payment Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Proof Fullsize Modal */}
      {viewProofModal && (
        <div className="student-modal-overlay" onClick={() => setViewProofModal(null)}>
          <div className="student-modal-card proof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="student-modal-header">
              <h2>Payment Proof Details</h2>
              <p>Submission ID: {viewProofModal.submissionId}</p>
            </div>

            <div className="proof-full-preview">
              <img src={viewProofModal.proofImage} alt="Payment Proof" />
            </div>

            <div className="proof-meta-strip">
              <div><strong>Amount:</strong> ₹{viewProofModal.totalAmount}</div>
              <div><strong>Date:</strong> {viewProofModal.paymentDate}</div>
              <div><strong>Status:</strong> {viewProofModal.status}</div>
              <div><strong>UTR:</strong> {viewProofModal.transactionId || 'N/A'}</div>
            </div>

            <button
              onClick={() => setViewProofModal(null)}
              className="student-btn secondary full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function formatMonthName(ym) {
  if (!ym) return '';
  const [yr, mo] = ym.split('-');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const mIndex = parseInt(mo, 10) - 1;
  return `${months[mIndex]} ${yr}`;
}

function getBeltColor(belt = '') {
  const b = String(belt).toLowerCase();
  if (b.includes('white')) return '#e2e8f0';
  if (b.includes('yellow')) return '#facc15';
  if (b.includes('orange')) return '#fb923c';
  if (b.includes('green')) return '#4ade80';
  if (b.includes('blue')) return '#60a5fa';
  if (b.includes('purple')) return '#c084fc';
  if (b.includes('brown')) return '#a16207';
  if (b.includes('red')) return '#f87171';
  if (b.includes('black')) return '#1e293b';
  return '#facc15';
}

function getStatusClass(status = '') {
  const s = String(status).toUpperCase();
  if (s === 'PAID' || s === 'APPROVED') return 'status-paid';
  if (s === 'PAYMENT UNDER REVIEW') return 'status-review';
  if (s === 'REJECTED') return 'status-rejected';
  return 'status-pending';
}

function getStatusIcon(status = '') {
  const s = String(status).toUpperCase();
  if (s === 'PAID' || s === 'APPROVED') return <CheckCircle2 size={18} className="green-text" />;
  if (s === 'PAYMENT UNDER REVIEW') return <Clock size={18} className="amber-text" />;
  if (s === 'REJECTED') return <XCircle size={18} className="red-text" />;
  return <AlertCircle size={18} className="gray-text" />;
}
