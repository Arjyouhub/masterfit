import { useState, useEffect, useRef } from 'react';
import {
  Users, CalendarDays, Wallet, Bell, Settings, LogOut, UserPlus, AlertTriangle, X,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, MessageCircle, MessageSquare,
  Search, Phone, Trash2, ArrowRight, Activity, MapPin, TrendingUp, Award, Menu,
  Shield, Lock, Unlock, FileDown, FileUp, Database, Terminal, Cpu, HardDrive, Key, History
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './index.css';

// Academy Branches static list fallback
const DEFAULT_BRANCHES = [];

const DEFAULT_BATCH_OPTIONS = [];


const getCookieValue = (name) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return '';
};

const getSessionToken = () => {
  return getCookieValue('umai_session_token');
};

const sortStudentsAlphabetically = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const nameA = String(a && a.name || '').trim().toLowerCase();
    const nameB = String(b && b.name || '').trim().toLowerCase();
    return nameA.localeCompare(nameB, 'en', { sensitivity: 'base', numeric: true });
  });
};

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || /^192\.168\./.test(window.location.hostname) || /^10\./.test(window.location.hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname) || window.location.hostname.endsWith('.local')
    ? `http://${window.location.hostname}:5000/api`
    : 'https://masterfit-dfz7.onrender.com/api'
);

// Global Fetch Interceptor to automatically append Authorization token
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  const token = getSessionToken();

  if (token && typeof url === 'string' && url.startsWith(API_BASE_URL)) {
    if (!options.headers) {
      options.headers = {};
    }
    if (options.headers instanceof Headers) {
      if (!options.headers.has('Authorization')) {
        options.headers.set('Authorization', `Bearer ${token}`);
      }
    } else if (Array.isArray(options.headers)) {
      const hasAuth = options.headers.some(([key]) => key.toLowerCase() === 'authorization');
      if (!hasAuth) {
        options.headers.push(['Authorization', `Bearer ${token}`]);
      }
    } else {
      if (!options.headers['Authorization'] && !options.headers['authorization']) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return originalFetch(url, options);
};


function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Session storage helper functions
  const getSessionUser = () => {
    return getCookieValue('umai_session_user');
  };

  const getSessionToken = () => {
    return getCookieValue('umai_session_token');
  };

  const setSession = (username, token, role = '', branch = '', batch = '') => {
    document.cookie = `umai_session_user=${encodeURIComponent(username)}; path=/; max-age=604800;`;
    document.cookie = `umai_session_token=${encodeURIComponent(token)}; path=/; max-age=604800;`;
    document.cookie = `umai_session_role=${encodeURIComponent(role)}; path=/; max-age=604800;`;
    document.cookie = `umai_session_branch=${encodeURIComponent(branch)}; path=/; max-age=604800;`;
    document.cookie = `umai_session_batch=${encodeURIComponent(batch)}; path=/; max-age=604800;`;
  };

  const clearSession = () => {
    document.cookie = "umai_session_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "umai_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "umai_session_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "umai_session_branch=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "umai_session_batch=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  };

  const [appMode, setAppMode] = useState(() => {
    const hash = window.location.hash;
    const hasSession = getSessionUser();

    if (hasSession) {
      const cleanUser = hasSession.toLowerCase().trim();
      if (cleanUser === 'developer' || cleanUser.startsWith('developer@')) {
        return 'developer';
      }
      return 'admin'; // Always restore admin dashboard if session exists!
    }

    if (hash === '#/superadmin') {
      return 'superadmin-login';
    } else if (hash === '#/login' || hash === '#/branch' || hash === '#/batch') {
      return 'login';
    } else if (hash === '#/admin') {
      return 'login'; // No session? Force login
    }
    return 'website';
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [feeDetailsStudentId, setFeeDetailsStudentId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [coupons, setCoupons] = useState({});
  const [newCouponForm, setNewCouponForm] = useState({ code: '', type: 'percentage', value: '' });
  const [rawCredentials, setRawCredentials] = useState(null);
  const [loadingRawCreds, setLoadingRawCreds] = useState(false);

  // Global Notifications States
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [newNotificationForm, setNewNotificationForm] = useState({ title: '', message: '', type: 'general' });
  const [notificationSuccess, setNotificationSuccess] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [activeAnnouncementPopup, setActiveAnnouncementPopup] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    branch: 'all',
    batch: 'all',
    targetUser: 'all',
    expiryDate: '',
    scheduledAt: '',
    isScheduled: false
  });
  const [devNotifications, setDevNotifications] = useState([]);
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [announcementSuccess, setAnnouncementSuccess] = useState('');
  const [announcementError, setAnnouncementError] = useState('');
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);

  // Rebuilt Developer Panel States
  const [devView, setDevView] = useState('dashboard');
  const [devDashboardStats, setDevDashboardStats] = useState(null);
  const [devUsers, setDevUsers] = useState([]);
  const [devUsersPage, setDevUsersPage] = useState(1);
  const [devUsersTotalPages, setDevUsersTotalPages] = useState(1);
  const [devUsersTotalItems, setDevUsersTotalItems] = useState(0);
  const [devUserSearch, setDevUserSearch] = useState('');
  const [devUserEdit, setDevUserEdit] = useState(null);
  const [devUserEditForm, setDevUserEditForm] = useState({ username: '', email: '', role: '', status: '' });

  const [devSessions, setDevSessions] = useState([]);
  const [devSessionsPage, setDevSessionsPage] = useState(1);
  const [devSessionsTotalPages, setDevSessionsTotalPages] = useState(1);
  const [devSessionsTotalItems, setDevSessionsTotalItems] = useState(0);

  const [devLoginHistory, setDevLoginHistory] = useState([]);
  const [devLoginHistoryPage, setDevLoginHistoryPage] = useState(1);
  const [devLoginHistoryTotalPages, setDevLoginHistoryTotalPages] = useState(1);
  const [devLoginHistoryTotalItems, setDevLoginHistoryTotalItems] = useState(0);

  const [devSecurityLogs, setDevSecurityLogs] = useState([]);
  const [devSecurityLogsPage, setDevSecurityLogsPage] = useState(1);
  const [devSecurityLogsTotalPages, setDevSecurityLogsTotalPages] = useState(1);
  const [devSecurityLogsTotalItems, setDevSecurityLogsTotalItems] = useState(0);

  const [devAppLogs, setDevAppLogs] = useState([]);
  const [devAppLogsPage, setDevAppLogsPage] = useState(1);
  const [devAppLogsTotalPages, setDevAppLogsTotalPages] = useState(1);
  const [devAppLogsTotalItems, setDevAppLogsTotalItems] = useState(0);
  const [devLogsType, setDevLogsType] = useState('all');
  const [devLogsSearch, setDevLogsSearch] = useState('');

  const [devSystemStatus, setDevSystemStatus] = useState(null);
  const [devDatabaseInfo, setDevDatabaseInfo] = useState(null);

  const [devAuditLogs, setDevAuditLogs] = useState([]);
  const [devAuditLogsPage, setDevAuditLogsPage] = useState(1);
  const [devAuditLogsTotalPages, setDevAuditLogsTotalPages] = useState(1);
  const [devAuditLogsTotalItems, setDevAuditLogsTotalItems] = useState(0);
  const [devAuditType, setDevAuditType] = useState('');

  const [devSettings, setDevSettings] = useState({
    maintenanceMode: 'none',
    maintenanceStart: null,
    maintenanceEnd: null,
    systemUpdateNotification: '',
    systemUpdateNotificationId: '',
    sessionTimeoutMinutes: 30,
    minPasswordLength: 6,
    failedLoginThreshold: 5,
    failedLoginBlockTimeMinutes: 15,
    logRetentionLimit: 1000
  });

  const [devSettingsSuccess, setDevSettingsSuccess] = useState('');
  const [devSettingsError, setDevSettingsError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [devActionLoading, setDevActionLoading] = useState(false);
  const [devSessionFeedback, setDevSessionFeedback] = useState(null);
  const [devUserFeedback, setDevUserFeedback] = useState(null);

  // Help Modal & Submission States
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpDescription, setHelpDescription] = useState('');
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  const [helpSubmitFeedback, setHelpSubmitFeedback] = useState(null);
  const [helpModalTab, setHelpModalTab] = useState('new');
  const [userHelpReports, setUserHelpReports] = useState([]);
  const [loadingUserHelpReports, setLoadingUserHelpReports] = useState(false);
  const [isSystemUnderMaintenance, setIsSystemUnderMaintenance] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState('none');
  const [isMaintenanceUpcoming, setIsMaintenanceUpcoming] = useState(false);
  const [maintenanceStart, setMaintenanceStart] = useState(null);
  const [maintenanceEnd, setMaintenanceEnd] = useState(null);
  const [systemAlertMessage, setSystemAlertMessage] = useState('');
  const [unseenResolvedReports, setUnseenResolvedReports] = useState([]);
  const [activeUpdateNotification, setActiveUpdateNotification] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userLoginCount, setUserLoginCount] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [todayClasses, setTodayClasses] = useState([]);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({ className: '', branch: '', batch: '', trainer: '', startTime: '', endTime: '', subject: '' });

  const handleOpenAddClass = () => {
    setClassForm({
      className: '',
      branch: userRole === 'superadmin' || userRole === 'developer' ? 'Kuttiady' : userBranch,
      batch: userRole === 'trainer' ? userBatch : 'batch1',
      trainer: userRole === 'trainer' ? loggedInUser : '',
      startTime: '',
      endTime: '',
      subject: ''
    });
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls) => {
    setEditingClass(cls);
    setClassForm({
      className: cls.className,
      branch: cls.branch,
      batch: cls.batch,
      trainer: cls.trainer,
      startTime: cls.startTime,
      endTime: cls.endTime,
      subject: cls.subject || ''
    });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!classForm.className || !classForm.branch || !classForm.batch || !classForm.trainer || !classForm.startTime || !classForm.endTime) {
      alert("All fields except subject are required.");
      return;
    }

    const method = editingClass ? 'PUT' : 'POST';
    const url = editingClass ? `${API_BASE_URL}/classes/${editingClass._id}` : `${API_BASE_URL}/classes`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classForm)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to save class') });
        }
        return res.json();
      })
      .then(() => {
        alert(editingClass ? "Class updated successfully!" : "Class scheduled successfully!");
        setIsClassModalOpen(false);
        reloadAllAppData();
      })
      .catch(err => alert("Error saving class: " + err.message));
  };

  const handleDeleteClass = (id) => {
    if (!window.confirm("Are you sure you want to delete this scheduled class?")) return;

    fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to delete class') });
        }
        return res.json();
      })
      .then(() => {
        alert("Class deleted successfully!");
        reloadAllAppData();
      })
      .catch(err => alert("Error deleting class: " + err.message));
  };

  // Developer resolving ticket modal states
  const [devResolvingTicketId, setDevResolvingTicketId] = useState(null);
  const [devResolutionReply, setDevResolutionReply] = useState('');

  // Developer Help Report List States
  const [devHelpReports, setDevHelpReports] = useState([]);
  const [devHelpReportsPage, setDevHelpReportsPage] = useState(1);
  const [devHelpReportsTotalPages, setDevHelpReportsTotalPages] = useState(1);
  const [devHelpReportsTotalItems, setDevHelpReportsTotalItems] = useState(0);
  const [devHelpReportsLoading, setDevHelpReportsLoading] = useState(false);



  const [loggedInUser, setLoggedInUser] = useState(() => {
    return getSessionUser() || '';
  });

  const handleSelectStudent = (student) => {
    if (!student) {
      setSelectedStudent(null);
      return;
    }
    setSelectedStudent(student);
    if (student.photo === undefined) {
      fetch(`${API_BASE_URL}/students/${student.id}/photo`)
        .then(res => res.json())
        .then(data => {
          setSelectedStudent(prev => prev && prev.id === student.id ? { ...prev, photo: data.photo } : prev);
          setStudents(prevList => prevList.map(s => s.id === student.id ? { ...s, photo: data.photo } : s));
        })
        .catch(err => console.error('Error fetching student photo:', err));
    }
  };

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [selectedBranchLogin, setSelectedBranchLogin] = useState('Kuttiady');
  const [selectedBatchLogin, setSelectedBatchLogin] = useState('admin');

  // Mobile drawer states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings Form States
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [createAdminPasswordError, setCreateAdminPasswordError] = useState('');
  const [branchPasswordError, setBranchPasswordError] = useState('');
  const [batchPasswordError, setBatchPasswordError] = useState('');
  const [newBranchPasswordError, setNewBranchPasswordError] = useState('');
  const [newBatchPasswordError, setNewBatchPasswordError] = useState('');
  const [adminForm, setAdminForm] = useState({ account: 'admin', newUsername: '', newPassword: '', confirmPassword: '' });
  const [createAdminForm, setCreateAdminForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [branchForm, setBranchForm] = useState({ branch: 'kuttiady', newUsername: '', newPassword: '', confirmPassword: '' });
  const [batchForm, setBatchForm] = useState({ branch: 'kuttiady', batch: 'batch1', newUsername: '', newPassword: '', confirmPassword: '' });

  const [adminCredentials, setAdminCredentials] = useState({});
  const [mappingSubTab, setMappingSubTab] = useState('credentials');
  const [batchesBranchFilter, setBatchesBranchFilter] = useState('All');
  const [rawCredentialsError, setRawCredentialsError] = useState('');
  const [editingCredential, setEditingCredential] = useState(null); // { type, key, oldUsername, username, password, displayName }
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [editingBranchName, setEditingBranchName] = useState('');
  const [isEditBranchModalOpen, setIsEditBranchModalOpen] = useState(false);
  const [newBranchNameField, setNewBranchNameField] = useState('');
  const [editingBatchObj, setEditingBatchObj] = useState(null);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [newBatchNameField, setNewBatchNameField] = useState('');
  const [newBatchScheduleField, setNewBatchScheduleField] = useState('');
  const [credentialModalError, setCredentialModalError] = useState('');
  const [credentialModalSuccess, setCredentialModalSuccess] = useState('');
  const [userRole, setUserRole] = useState(() => getCookieValue('umai_session_role') || '');
  const [userBranch, setUserBranch] = useState(() => getCookieValue('umai_session_branch') || '');
  const [userBatch, setUserBatch] = useState(() => getCookieValue('umai_session_batch') || '');
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [customBranches, setCustomBranches] = useState([]);
  const [customBatches, setCustomBatches] = useState([]);
  const [batchOptions, setBatchOptions] = useState(DEFAULT_BATCH_OPTIONS);
  const [newBranchForm, setNewBranchForm] = useState({ name: '', username: '', password: '', confirmPassword: '' });
  const [newBatchForm, setNewBatchForm] = useState({ name: '', schedule: '', branch: 'kuttiady', username: '', password: '', confirmPassword: '' });
  const [activeSessions, setActiveSessions] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [selectedUserDetailLoading, setSelectedUserDetailLoading] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '', confirmPassword: '', role: 'branchadmin', branch: 'Kuttiady', batch: 'batch1', fullName: '', phone: '', employeeId: '' });
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('All');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Fee rate configuration states
  const [monthlyFeeRate, setMonthlyFeeRate] = useState(600);
  const [admissionFeeRate, setAdmissionFeeRate] = useState(1500);

  const updateFeeRatesInDB = (monthlyRate, admissionRate) => {
    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthlyFeeRate: monthlyRate,
        admissionFeeRate: admissionRate
      })
    })
      .then(res => res.json())
      .catch(err => console.error("Error updating fee rates in DB:", err));
  };

  // Fee Customization Modal States
  const [isFeeEditModalOpen, setIsFeeEditModalOpen] = useState(false);
  const [feeEditingStudent, setFeeEditingStudent] = useState(null);
  const [customRateInput, setCustomRateInput] = useState('');
  const [customStartMonth, setCustomStartMonth] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [admissionCouponInput, setAdmissionCouponInput] = useState('');
  const [admissionCouponMessage, setAdmissionCouponMessage] = useState('');
  const [customAdmissionInput, setCustomAdmissionInput] = useState('');

  // Super Admin Forgot Password (OTP) States
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');


  const getSessionDetails = (username) => {
    if (!username) return { role: 'Unknown', branch: 'Unknown', batchName: 'Unknown' };

    const cleanUsername = username.toLowerCase().trim();

    // Check if user exists in the loaded adminsList
    const match = adminsList.find(a => a.username.toLowerCase().trim() === cleanUsername);
    if (match) {
      let roleText = 'Trainer';
      if (match.role === 'superadmin') roleText = 'Super Admin';
      else if (match.role === 'developer') roleText = 'Developer';
      else if (match.role === 'branchadmin') roleText = 'Branch Admin';

      const branchText = match.branch ? match.branch.charAt(0).toUpperCase() + match.branch.slice(1) : 'All Branches';
      let batchText = 'All Batches (Admin)';
      if (match.batch) {
        const customBatchObj = customBatches.find(cb => cb.id === match.batch);
        batchText = customBatchObj ? customBatchObj.name : match.batch.toUpperCase();
        if (match.batch.startsWith('batch')) {
          const batchNumStr = match.batch.replace('batch', '');
          if (batchNumStr && !isNaN(batchNumStr)) {
            batchText = `Batch ${batchNumStr}`;
          }
        }
      }

      return {
        role: roleText,
        branch: branchText,
        batchName: batchText
      };
    }

    if (cleanUsername === 'developer') {
      return {
        role: 'Developer',
        branch: 'All Branches',
        batchName: 'All Batches (Admin)'
      };
    }

    // Super Admin check
    if (!cleanUsername.includes('@')) {
      return {
        role: 'Super Admin',
        branch: 'All Branches',
        batchName: 'All Batches (Admin)'
      };
    }

    const [userPart, branchPart] = cleanUsername.split('@');

    // Format branch name (capitalize first letter)
    const branchName = branchPart.charAt(0).toUpperCase() + branchPart.slice(1);

    if (userPart === 'admin') {
      return {
        role: 'Branch Admin',
        branch: branchName,
        batchName: 'All Batches (Admin)'
      };
    }

    // Check if it's a trainer
    // Find batch in batchOptions
    const batchObj = batchOptions.find(b => b.id.toLowerCase() === userPart);
    const batchNameText = batchObj ? batchObj.name : userPart.charAt(0).toUpperCase() + userPart.slice(1);

    return {
      role: 'Trainer',
      branch: branchName,
      batchName: batchNameText
    };
  };

  const parseClientDetails = (userAgent, deviceName) => {
    if (!userAgent) {
      if (deviceName) return deviceName;
      return 'Unknown Client';
    }
    const ua = userAgent;

    // Detect browser
    let browser = 'Unknown Browser';
    if (ua.includes('Firefox/')) {
      browser = 'Firefox';
    } else if (ua.includes('Chrome/') && !ua.includes('Chromium/') && !ua.includes('Edg/')) {
      browser = 'Chrome';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
      browser = 'Safari';
    } else if (ua.includes('Edg/')) {
      browser = 'Edge';
    } else if (ua.includes('PostmanRuntime')) {
      browser = 'Postman';
    } else {
      const match = ua.match(/(Opera|Chrome|Safari|Firefox|MSIE|Trident)\/?\s*(\d+)/i);
      if (match) browser = match[1];
    }

    if (deviceName) {
      return `${deviceName} (${browser})`;
    }

    // 1. Detect platform/OS
    let os = 'Unknown OS';
    let deviceModel = '';

    if (ua.includes('Windows NT')) {
      os = 'Windows';
    } else if (ua.includes('Macintosh') && !ua.includes('iPhone') && !ua.includes('iPad')) {
      os = 'macOS';
    } else if (ua.includes('Linux') && !ua.includes('Android')) {
      os = 'Linux';
    } else if (ua.includes('Android')) {
      os = 'Android';
      const parts = ua.match(/\(([^)]+)\)/);
      if (parts && parts[1]) {
        const details = parts[1].split(';');
        let modelCandidate = '';
        for (let i = 0; i < details.length; i++) {
          const detail = details[i].trim();
          if (
            detail.toLowerCase() !== 'linux' &&
            !detail.toLowerCase().includes('android') &&
            !detail.match(/^[a-z]{2}$/i) &&
            !detail.match(/^[a-z]{2}[-_][a-z]{2}$/i) &&
            detail.toLowerCase() !== 'wv' &&
            detail.toLowerCase() !== 'u' &&
            detail.toLowerCase() !== 'mobile'
          ) {
            if (detail.length > modelCandidate.length) {
              modelCandidate = detail;
            }
          }
        }
        if (modelCandidate) {
          deviceModel = modelCandidate.replace(/Build\/\w+/, '').trim();
        }
      }
    } else if (ua.includes('iPhone')) {
      os = 'iPhone';
    } else if (ua.includes('iPad')) {
      os = 'iPad';
    }

    if (deviceModel) {
      return `${deviceModel} (${browser})`;
    }
    return `${os} (${browser})`;
  };

  const isAdminUser = (user) => {
    return userRole === 'superadmin' || userRole === 'developer';
  };

  const isBranchAdmin = (user) => {
    return userRole === 'branchadmin';
  };

  const isUserLoggedIn = (username) => {
    if (!username) return false;
    const cleanUser = username.toLowerCase().trim();
    return activeSessions.some(session => session.username.toLowerCase().trim() === cleanUser);
  };

  const sortBranchesAlphabetically = (branchesList) => {
    if (!Array.isArray(branchesList)) return [];
    return [...branchesList].sort((a, b) => {
      const aStr = String(a).toLowerCase();
      const bStr = String(b).toLowerCase();
      return aStr.localeCompare(bStr, undefined, { sensitivity: 'base' });
    });
  };

  const sortBatchesAlphabetically = (batchesList) => {
    if (!Array.isArray(batchesList)) return [];
    return [...batchesList].sort((a, b) => {
      const aName = (a.name || '').toLowerCase().replace(/\s+/g, '');
      const bName = (b.name || '').toLowerCase().replace(/\s+/g, '');
      return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  const getLoggedInUserBranch = () => {
    if (!loggedInUser) return 'All';
    if (isAdminUser(loggedInUser)) return 'All';
    return userBranch || 'All';
  };

  const getFilteredBatchOptions = (branchOverride, requireCredentials = true) => {
    let targetBranch = 'All';
    if (branchOverride) {
      targetBranch = branchOverride;
    } else if (loggedInUser) {
      if (isAdminUser(loggedInUser)) {
        targetBranch = branchFilter;
      } else {
        targetBranch = getLoggedInUserBranch();
      }
    } else {
      targetBranch = selectedBranchLogin || 'All';
    }

    const branchKey = targetBranch.toLowerCase();
    if (branchKey === 'all') {
      const seenIds = new Set();
      const seenNames = new Set();
      return batchOptions.filter(opt => {
        const idKey = opt.id.toLowerCase();
        const nameKey = `${opt.name.toLowerCase().replace(/\s+/g, '')}_${opt.schedule.toLowerCase()}`;
        if (seenIds.has(idKey) || seenNames.has(nameKey)) return false;
        seenIds.add(idKey);
        seenNames.add(nameKey);
        return true;
      });
    }

    // Filter by branch
    const filtered = batchOptions.filter(opt => {
      // 1. Check branch match
      let branchMatches = false;
      if (opt.branch) {
        if (opt.branch.toLowerCase() === 'all') {
          branchMatches = true;
        } else {
          branchMatches = opt.branch.toLowerCase() === branchKey;
        }
      } else {
        branchMatches = true;
      }
      if (!branchMatches) return false;

      // 2. Check credentials if required and logged in
      if (requireCredentials && loggedInUser) {
        return batchCredentials[`${branchKey}_${opt.id}`] !== undefined;
      }
      return true;
    });

    // Deduplicate by id and by normalized name + schedule
    const seenIds = new Set();
    const seenNames = new Set();
    return filtered.filter(opt => {
      const idKey = opt.id.toLowerCase();
      const nameKey = `${opt.name.toLowerCase().replace(/\s+/g, '')}_${opt.schedule.toLowerCase()}`;
      if (seenIds.has(idKey) || seenNames.has(nameKey)) return false;
      seenIds.add(idKey);
      seenNames.add(nameKey);
      return true;
    });
  };

  const isBatchAdminUser = (user) => {
    return userRole === 'trainer' || userRole === 'coordinator';
  };

  const getBatchNameFromSchedule = (schedule) => {
    if (!schedule) return '';
    const opt = batchOptions.find(b => b.schedule.toLowerCase() === schedule.toLowerCase());
    return opt ? opt.name : schedule;
  };

  const hasSettingsAccess = (user) => {
    return isAdminUser(user) || isBranchAdmin(user);
  };

  const resolveCouponCode = (code) => {
    if (!code) return null;
    const uppercaseCode = code.toUpperCase().trim();

    // Check custom coupons loaded in state
    if (coupons && coupons[uppercaseCode] !== undefined) {
      const c = coupons[uppercaseCode];
      if (typeof c === 'number') {
        return { type: 'percentage', value: c };
      }
      return { type: c.type || 'percentage', value: c.value || 0 };
    }

    // Hardcoded default coupons
    if (uppercaseCode === 'FIT10' || uppercaseCode === 'WELCOME10') {
      return { type: 'percentage', value: 10 };
    }
    if (uppercaseCode === 'FIT20') {
      return { type: 'percentage', value: 20 };
    }
    if (uppercaseCode === 'FIT50') {
      return { type: 'percentage', value: 50 };
    }
    if (uppercaseCode === 'FREE') {
      return { type: 'percentage', value: 100 };
    }

    return null;
  };

  const getStudentDiscount = (s, rateToUse) => {
    const coupon = resolveCouponCode(s.appliedCoupon);
    if (coupon) {
      if (coupon.type === 'percentage') {
        return Math.round(rateToUse * coupon.value / 100);
      }
      return coupon.value;
    }
    // Legacy fallback
    const type = s.couponType || 'percentage';
    const val = s.couponValue !== undefined ? s.couponValue : (s.discountPercentage || 0);
    if (type === 'percentage') {
      return Math.round(rateToUse * val / 100);
    }
    return val;
  };

  const [branchCredentials, setBranchCredentials] = useState({});

  const [batchCredentials, setBatchCredentials] = useState({});

  const [attendanceTab, setAttendanceTab] = useState('monthly'); // 'monthly' or 'year2026'
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState(null);

  // Persistent State
  const [students, setStudents] = useState([]);

  const [attendanceRecords, setAttendanceRecords] = useState({});

  const reloadAllAppData = () => {
    const token = getSessionToken();
    if (!token) {
      // Not logged in: only fetch public branches and batches for the login page
      fetch(`${API_BASE_URL}/public/branches`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setCustomBranches(data || []);
          const branchNames = (data || []).map(b => b.name);
          const uniqueBranches = Array.from(new Set([
            ...DEFAULT_BRANCHES,
            ...branchNames
          ]));
          setBranches(sortBranchesAlphabetically(uniqueBranches));
        })
        .catch(err => console.error('Error fetching public branches:', err));

      fetch(`${API_BASE_URL}/public/batches`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setCustomBatches(data || []);
          const uniqueBatches = [
            ...DEFAULT_BATCH_OPTIONS.map(b => ({ ...b, branch: 'all' })),
            ...(data || []).map(b => ({ id: b.code, name: b.name, schedule: b.schedule, branch: b.branch }))
          ];
          setBatchOptions(sortBatchesAlphabetically(uniqueBatches));
        })
        .catch(err => console.error('Error fetching public batches:', err));
        
      return;
    }

    // 1. Fetch Students
    fetch(`${API_BASE_URL}/students`)
      .then(res => {
        if (!res.ok) throw new Error('API server down');
        return res.json();
      })
      .then(data => {
        setStudents(sortStudentsAlphabetically(data));
      })
      .catch(err => console.error('Error fetching students:', err));

    // 2. Fetch Attendance
    fetch(`${API_BASE_URL}/attendance`)
      .then(res => {
        if (!res.ok) throw new Error('API server down');
        return res.json();
      })
      .then(data => {
        setAttendanceRecords(data || {});
      })
      .catch(err => console.error('Error fetching attendance:', err));

    // 3. Fetch Credentials
    fetch(`${API_BASE_URL}/credentials`)
      .then(res => {
        if (!res.ok) throw new Error('API server down');
        return res.json();
      })
      .then(data => {
        if (data) {
          setAdminCredentials(data.adminCredentials || {});
          setBranchCredentials(data.branchCredentials || {});
          setBatchCredentials(data.batchCredentials || {});
          setMonthlyFeeRate(data.monthlyFeeRate !== undefined ? data.monthlyFeeRate : 600);
          setAdmissionFeeRate(data.admissionFeeRate !== undefined ? data.admissionFeeRate : 1500);
          setCoupons(data.coupons || {});
        }
      })
      .catch(err => console.error('Error fetching credentials:', err));

    // 3.1 Fetch Branches from MongoDB
    fetch(`${API_BASE_URL}/branches`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setCustomBranches(data || []);
        const branchNames = (data || []).map(b => b.name);
        const uniqueBranches = Array.from(new Set([
          ...DEFAULT_BRANCHES,
          ...branchNames
        ]));
        setBranches(sortBranchesAlphabetically(uniqueBranches));
      })
      .catch(err => console.error('Error fetching branches:', err));

    // 3.2 Fetch Batches from MongoDB
    fetch(`${API_BASE_URL}/batches`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setCustomBatches(data || []);
        const uniqueBatches = [
          ...DEFAULT_BATCH_OPTIONS.map(b => ({ ...b, branch: 'all' })),
          ...(data || []).map(b => ({ id: b.code, name: b.name, schedule: b.schedule, branch: b.branch }))
        ];
        setBatchOptions(sortBatchesAlphabetically(uniqueBatches));
      })
      .catch(err => console.error('Error fetching batches:', err));

    // 3.3 Fetch Scheduled Classes
    fetch(`${API_BASE_URL}/classes`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setTodayClasses(data || []);
      })
      .catch(err => console.error('Error fetching classes:', err));

    // 3.4 Fetch Dashboard Scoped Statistics
    setLoadingStats(true);
    fetch(`${API_BASE_URL}/dashboard/stats`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setDashboardStats(data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        setLoadingStats(false);
      });

    // 4. Fetch Admins list (MongoDB-backed admin accounts)
    const sessionToken = getSessionToken();
    if (sessionToken) {
      fetch(`${API_BASE_URL}/admins`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch admin accounts');
        })
        .then(data => {
          setAdminsList(data || []);
        });
    }
    // 5. Fetch Global Announcements
    checkUnreadAnnouncement();

    // 6. Fetch System Settings (starting billing month)
    fetch(`${API_BASE_URL}/system-settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setStartingBillingMonth(data.startingBillingMonth || '');
        }
      })
      .catch(err => console.error('Error fetching system settings:', err));
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if (!newAdminForm.username || !newAdminForm.password || !newAdminForm.role) {
      alert("Username, password, and role are required.");
      return;
    }
    if (newAdminForm.password !== newAdminForm.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    fetch(`${API_BASE_URL}/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdminForm)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to create admin account') });
        }
        return res.json();
      })
      .then(data => {
        alert(`Admin user "${data.username}" created successfully.`);
        setNewAdminForm({ username: '', password: '', confirmPassword: '', role: 'branchadmin', branch: 'Kuttiady', batch: 'batch1', fullName: '', phone: '', employeeId: '' });
        setIsAdminModalOpen(false);
        reloadAllAppData();
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleUpdateAdmin = (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    if (editingAdmin.password && editingAdmin.password !== editingAdmin.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    fetch(`${API_BASE_URL}/admins/${editingAdmin._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingAdmin)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to update admin account') });
        }
        return res.json();
      })
      .then(data => {
        alert(`Admin user "${data.username}" updated successfully.`);
        setEditingAdmin(null);
        reloadAllAppData();
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleDeleteAdmin = (id, username) => {
    const choice = window.prompt(
      `Type "SOFT" to soft-delete the user "${username}" (disables login but keeps audit logs),\n` +
      `Type "PERMANENT" to permanently delete the user account from the database,\n` +
      `Or click Cancel.`
    );
    if (!choice) return;
    const cleanChoice = choice.toUpperCase().trim();
    if (cleanChoice !== 'SOFT' && cleanChoice !== 'PERMANENT') {
      alert("Invalid choice. Action cancelled.");
      return;
    }

    const permanent = cleanChoice === 'PERMANENT';
    const url = permanent
      ? `${API_BASE_URL}/admins/${id}?permanent=true`
      : `${API_BASE_URL}/admins/${id}`;

    fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getSessionToken()}`
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to delete admin account') });
        }
        return res.json();
      })
      .then(() => {
        alert(permanent ? "Admin user account permanently deleted successfully." : "Admin user account soft-deleted successfully.");
        reloadAllAppData();
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleToggleAdminLock = (id, currentLocked) => {
    fetch(`${API_BASE_URL}/admins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLocked: !currentLocked })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to lock/unlock user') });
        }
        return res.json();
      })
      .then(() => {
        reloadAllAppData();
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleToggleAdminStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    fetch(`${API_BASE_URL}/admins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to update status') });
        }
        return res.json();
      })
      .then(() => {
        reloadAllAppData();
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleFetchUserDetail = (username) => {
    setSelectedUserDetailLoading(true);
    // Find the user ID from adminsList
    const adminUser = adminsList.find(a => a.username.toLowerCase().trim() === username.toLowerCase().trim());
    const userId = adminUser ? adminUser._id : null;
    if (!userId) {
      alert("Could not load details: User ID not found.");
      setSelectedUserDetailLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/admins/${userId}/details`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch detailed diagnostic logs");
        return res.json();
      })
      .then(data => {
        setSelectedUserDetail(data);
        setSelectedUserDetailLoading(false);
      })
      .catch(err => {
        alert("Error: " + err.message);
        setSelectedUserDetailLoading(false);
      });
  };

  // Sync state with backend on mount
  useEffect(() => {
    reloadAllAppData();
  }, []);


  // Verify session validity on mount
  useEffect(() => {
    const sessionToken = getSessionToken();
    if (sessionToken) {
      fetch(`${API_BASE_URL}/session/verify?token=${sessionToken}`)
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            throw new Error('Session invalid');
          }
          if (!res.ok) {
            throw new Error('Transient server error');
          }
          return res.json();
        })
        .then(data => {
          if (data && data.success) {
            setLoggedInUser(data.username);
            setAppMode('admin');
            // Ensure localStorage/cookies are in sync
            setSession(data.username, sessionToken, data.role, data.branch, data.batch);
            setUserRole(data.role || '');
            setUserBranch(data.branch || '');
            setUserBatch(data.batch || '');
            setUserLoginCount(data.loginCount);
          } else {
            throw new Error('Session invalid');
          }
        })
        .catch(err => {
          if (err.message === 'Session invalid') {
            clearSession();
            setLoggedInUser('');
            setAppMode('login');
          } else {
            console.warn('Session verification failed on mount due to network or server error:', err);
          }
        });
    }
  }, []);

  // Synchronize branchFilter and form defaults with current loggedInUser branch
  useEffect(() => {
    if (loggedInUser) {
      if (isAdminUser(loggedInUser)) {
        setBranchFilter('Kuttiady');
      } else {
        const resolvedBranch = getLoggedInUserBranch();
        setBranchFilter(resolvedBranch);
        setBatchForm(prev => ({ ...prev, branch: resolvedBranch.toLowerCase() }));
        setNewBatchForm(prev => ({ ...prev, branch: resolvedBranch.toLowerCase() }));
      }
    }
  }, [loggedInUser, branches]);

  // Synchronize batchFilter for batch coordinator on mount/login
  useEffect(() => {
    if (loggedInUser) {
      if (isBatchAdminUser(loggedInUser)) {
        const activeBatch = batchOptions.find(b => b.id.toLowerCase() === userBatch.toLowerCase());
        if (activeBatch) {
          setBatchFilter(activeBatch.schedule);
        } else {
          setBatchFilter('All');
        }
      } else {
        setBatchFilter('All');
      }
    }
  }, [loggedInUser, userBatch, batchOptions]);

  // Verify session validity periodically in the background (every 10 seconds)
  useEffect(() => {
    if (loggedInUser) {
      if (isBranchAdmin(loggedInUser)) {
        const branchVal = getLoggedInUserBranch();
        setNewAdminForm(prev => ({
          ...prev,
          role: 'trainer',
          branch: branchVal,
          batch: 'batch1'
        }));
      } else {
        setNewAdminForm(prev => ({
          ...prev,
          role: 'branchadmin',
          branch: 'Kuttiady',
          batch: 'batch1'
        }));
      }
    }
  }, [loggedInUser, isAdminModalOpen]);

  // Verify session validity periodically in the background (every 10 seconds)
  useEffect(() => {
    if (!loggedInUser) return;

    const interval = setInterval(() => {
      const sessionToken = getSessionToken();
      if (sessionToken) {
        fetch(`${API_BASE_URL}/session/verify?token=${sessionToken}`)
          .then(res => {
            if (res.status === 401 || res.status === 403) {
              throw new Error('Session invalid');
            }
            if (!res.ok) {
              throw new Error('Transient server error');
            }
            return res.json();
          })
          .then(data => {
            if (!data || !data.success) {
              throw new Error('Session invalid');
            }
          })
          .catch(err => {
            if (err.message === 'Session invalid') {
              // Log out immediately
              clearSession();
              setLoggedInUser('');
              setAppMode('login');
              alert('Your session has been terminated by the administrator.');
            } else {
              console.warn('Periodic session verification failed due to network or server error:', err);
            }
          });
      } else {
        // No session token
        clearSession();
        setLoggedInUser('');
        setAppMode('login');
      }
    }, 10000); // 10 seconds check interval

    return () => clearInterval(interval);
  }, [loggedInUser]);

  // Fetch active sessions when settings page or credentials list is loaded
  useEffect(() => {
    if ((currentView === 'settings' || currentView === 'credentials-list') && (isAdminUser(loggedInUser) || isBranchAdmin(loggedInUser))) {
      fetch(`${API_BASE_URL}/sessions`)
        .then(res => res.json())
        .then(data => setActiveSessions(data || []))
        .catch(err => console.error('Error fetching sessions:', err));
    }
  }, [currentView, loggedInUser]);

  // Fetch raw credentials and admin accounts list when credentials-list page is loaded
  useEffect(() => {
    if (currentView === 'credentials-list') {
      const isSuper = isAdminUser(loggedInUser);
      const isBranchAdm = isBranchAdmin(loggedInUser);
      if (isSuper || isBranchAdm) {
        // Fetch all admins to retrieve lock/unlock status mapping
        fetch(`${API_BASE_URL}/admins`)
          .then(res => res.ok ? res.json() : [])
          .then(data => setAdminsList(data || []))
          .catch(err => console.error('Error fetching admin accounts list:', err));

        if (isSuper) {
          setLoadingRawCreds(true);
          setRawCredentialsError('');
          fetch(`${API_BASE_URL}/credentials/raw`)
            .then(res => {
              if (!res.ok) {
                return res.json().then(data => { throw new Error(data.error || 'Failed to load system accounts.') });
              }
              return res.json();
            })
            .then(data => {
              setRawCredentials(data);
              setLoadingRawCreds(false);
            })
            .catch(err => {
              console.error('Error fetching raw credentials:', err);
              setRawCredentialsError(err.message);
              setLoadingRawCreds(false);
            });
        }
      }
    }
  }, [currentView, loggedInUser]);

  // Default mapping tab for non-superadmin users
  useEffect(() => {
    if (currentView === 'credentials-list') {
      const isSuper = isAdminUser(loggedInUser);
      if (!isSuper) {
        setMappingSubTab('batches');
      } else {
        setMappingSubTab('credentials');
      }
    }
  }, [currentView, loggedInUser]);

  const checkUnseenHelpReplies = () => {
    const token = getSessionToken();
    if (!token) return;
    fetch(`${API_BASE_URL}/help-reports/unseen-resolved`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.reports && data.reports.length > 0) {
          setUnseenResolvedReports(data.reports);
        }
      })
      .catch(err => console.error("Error checking unseen help reports:", err));
  };

  const acknowledgeReportSeen = (reportId) => {
    const token = getSessionToken();
    if (!token) return;
    fetch(`${API_BASE_URL}/help-reports/${reportId}/seen`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUnseenResolvedReports(prev => prev.filter(r => r._id !== reportId));
        }
      })
      .catch(err => console.error("Error acknowledging report:", err));
  };

  const dismissUpdateNotification = () => {
    if (activeUpdateNotification) {
      document.cookie = `dismissed_update_id=${encodeURIComponent(activeUpdateNotification.id)}; path=/; max-age=31536000;`;
      setActiveUpdateNotification(null);
    }
  };

  const toDatetimeLocal = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const formatMaintenanceTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Developer Panel API Integrations
  const getDevHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getSessionToken()}`
    };
  };

  const loadNotifications = () => {
    const token = getSessionToken();
    if (!token) return;
    fetch(`${API_BASE_URL}/notifications`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          const currentUserClean = getSessionUser() ? getSessionUser().toLowerCase().trim() : '';
          const unreadCount = data.filter(n => !n.readBy || !n.readBy.includes(currentUserClean)).length;
          setUnreadNotificationsCount(unreadCount);

          if (data.length > 0) {
            setLatestAnnouncement(data[0]);
          } else {
            setLatestAnnouncement(null);
          }
        }
      })
      .catch(err => console.error("Error loading notifications:", err));
  };

  const loadDevNotifications = () => {
    const token = getSessionToken();
    if (!token) return;
    fetch(`${API_BASE_URL}/notifications?all=true`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDevNotifications(data);
        }
      })
      .catch(err => console.error("Error loading developer notifications:", err));
  };

  const checkUnreadAnnouncement = (user = loggedInUser) => {
    if (!user) return;
    const token = getSessionToken();
    if (!token) return;

    fetch(`${API_BASE_URL}/notifications`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0];
          const userClean = user.toLowerCase().trim();
          const isRead = latest.readBy && latest.readBy.includes(userClean);

          if (!isRead) {
            setActiveAnnouncementPopup(latest);
          } else {
            setActiveAnnouncementPopup(null);
          }

          setNotifications(data);
          const unreadCount = data.filter(n => !n.readBy || !n.readBy.includes(userClean)).length;
          setUnreadNotificationsCount(unreadCount);
        } else {
          setActiveAnnouncementPopup(null);
        }
      })
      .catch(err => console.error("Error checking announcements:", err));
  };

  const handleSaveAnnouncement = (e) => {
    if (e) e.preventDefault();
    setAnnouncementSuccess('');
    setAnnouncementError('');

    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      setAnnouncementError('Announcement title and message are required.');
      return;
    }

    setDevActionLoading(true);
    const token = getSessionToken();
    const isEdit = !!editingNotificationId;
    const url = isEdit
      ? `${API_BASE_URL}/notifications/${editingNotificationId}`
      : `${API_BASE_URL}/notifications`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: announcementForm.title.trim(),
        message: announcementForm.message.trim(),
        type: announcementForm.type || 'general',
        priority: announcementForm.priority || 'medium',
        branch: 'all',
        batch: 'all',
        targetUser: announcementForm.targetUser || 'all',
        expiryDate: announcementForm.expiryDate ? new Date(announcementForm.expiryDate).toISOString() : null,
        scheduledAt: announcementForm.scheduledAt ? new Date(announcementForm.scheduledAt).toISOString() : null,
        isScheduled: !!announcementForm.isScheduled
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.error || 'Failed to save announcement');
          });
        }
        return res.json();
      })
      .then(data => {
        setAnnouncementSuccess(isEdit ? 'Announcement updated successfully!' : 'Announcement published successfully!');
        setAnnouncementForm({
          title: '',
          message: '',
          type: 'general',
          priority: 'medium',
          branch: 'all',
          batch: 'all',
          targetUser: 'all',
          expiryDate: '',
          scheduledAt: '',
          isScheduled: false
        });
        setEditingNotificationId(null);
        loadNotifications();
        loadDevNotifications();
      })
      .catch(err => {
        setAnnouncementError(err.message);
      })
      .finally(() => setDevActionLoading(false));
  };

  const handleDeleteNotification = (id) => {
    if (!window.confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
      return;
    }
    setAnnouncementSuccess('');
    setAnnouncementError('');
    setDevActionLoading(true);
    const token = getSessionToken();
    fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete notification');
        setAnnouncementSuccess('Notification deleted successfully!');
        loadNotifications();
        loadDevNotifications();
      })
      .catch(err => {
        setAnnouncementError(err.message);
      })
      .finally(() => setDevActionLoading(false));
  };

  const handleStartEditAnnouncement = (n) => {
    setEditingNotificationId(n._id);
    setAnnouncementForm({
      title: n.title || '',
      message: n.message || '',
      type: n.type || 'general',
      priority: n.priority || 'medium',
      branch: n.branch || 'all',
      batch: n.batch || 'all',
      targetUser: n.targetUser || 'all',
      expiryDate: n.expiryDate ? new Date(n.expiryDate).toISOString().substring(0, 16) : '',
      scheduledAt: n.scheduledAt ? new Date(n.scheduledAt).toISOString().substring(0, 16) : '',
      isScheduled: !!n.isScheduled
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkAsRead = (id) => {
    const token = getSessionToken();
    fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to mark read');
        loadNotifications();
      })
      .catch(err => console.error(err));
  };

  const handleMarkAsUnread = (id) => {
    const token = getSessionToken();
    fetch(`${API_BASE_URL}/notifications/${id}/unread`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to mark unread');
        loadNotifications();
      })
      .catch(err => console.error(err));
  };

  const handleCreateNotification = (e) => {
    e.preventDefault();
    setNotificationSuccess('');
    setNotificationError('');

    if (!newNotificationForm.title.trim() || !newNotificationForm.message.trim()) {
      setNotificationError('Title and message are required.');
      return;
    }

    const token = getSessionToken();
    fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newNotificationForm)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.error || 'Failed to create notification');
          });
        }
        return res.json();
      })
      .then(data => {
        setNotificationSuccess('Global notification sent successfully!');
        setNewNotificationForm({ title: '', message: '', type: 'general' });
        loadNotifications();
      })
      .catch(err => {
        setNotificationError(err.message);
      });
  };



  const loadDevDashboardStats = () => {
    fetch(`${API_BASE_URL}/developer/dashboard-stats`, { headers: getDevHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Access Denied');
        return res.json();
      })
      .then(data => setDevDashboardStats(data))
      .catch(err => console.error("Error loading developer dashboard stats:", err));
  };

  const loadDevUsers = (page = devUsersPage, search = devUserSearch) => {
    fetch(`${API_BASE_URL}/developer/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => {
        setDevUsers(data.users || []);
        setDevUsersTotalPages(data.pagination.totalPages || 1);
        setDevUsersPage(data.pagination.page || 1);
        setDevUsersTotalItems(data.pagination.totalItems || 0);
      })
      .catch(err => console.error("Error loading users:", err));
  };

  const loadDevSessions = (page = devSessionsPage) => {
    fetch(`${API_BASE_URL}/developer/sessions?page=${page}&limit=10`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => {
        setDevSessions(data.sessions || []);
        setDevSessionsTotalPages(data.pagination.totalPages || 1);
        setDevSessionsPage(data.pagination.page || 1);
        setDevSessionsTotalItems(data.pagination.totalItems || 0);
      })
      .catch(err => console.error("Error loading sessions:", err));
  };

  const loadDevLoginHistory = (page = devLoginHistoryPage) => {
    fetch(`${API_BASE_URL}/developer/login-history?page=${page}&limit=10`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => {
        setDevLoginHistory(data.history || []);
        setDevLoginHistoryTotalPages(data.pagination.totalPages || 1);
        setDevLoginHistoryPage(data.pagination.page || 1);
        setDevLoginHistoryTotalItems(data.pagination.totalItems || 0);
      })
      .catch(err => console.error("Error loading login history:", err));
  };

  const loadDevSecurityLogs = (page = devSecurityLogsPage) => {
    fetch(`${API_BASE_URL}/developer/security-logs?page=${page}&limit=10`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => {
        setDevSecurityLogs(data.logs || []);
        setDevSecurityLogsTotalPages(data.pagination.totalPages || 1);
        setDevSecurityLogsPage(data.pagination.page || 1);
        setDevSecurityLogsTotalItems(data.pagination.totalItems || 0);
      })
      .catch(err => console.error("Error loading security logs:", err));
  };

  const loadDevAppLogs = (page = devAppLogsPage, type = devLogsType, search = devLogsSearch) => {
    fetch(`${API_BASE_URL}/developer/app-logs?page=${page}&limit=20&type=${type}&search=${encodeURIComponent(search)}`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => {
        setDevAppLogs(data.logs || []);
        setDevAppLogsTotalPages(data.pagination.totalPages || 1);
        setDevAppLogsPage(data.pagination.page || 1);
        setDevAppLogsTotalItems(data.pagination.totalItems || 0);
      })
      .catch(err => console.error("Error loading app logs:", err));
  };

  const loadDevSystemStatus = () => {
    fetch(`${API_BASE_URL}/developer/system-status`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => setDevSystemStatus(data))
      .catch(err => console.error("Error loading system status:", err));
  };

  const loadDevDatabaseInfo = () => {
    fetch(`${API_BASE_URL}/developer/database`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => setDevDatabaseInfo(data))
      .catch(err => console.error("Error loading database stats:", err));
  };

  const handleDeleteLoginHistory = (id) => {
    if (!window.confirm("Are you sure you want to delete this login history entry?")) return;
    fetch(`${API_BASE_URL}/developer/login-history/${id}`, {
      method: 'DELETE',
      headers: getDevHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete entry");
        loadDevLoginHistory(devLoginHistoryPage);
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleClearAllLoginHistory = () => {
    if (!window.confirm("WARNING: Are you sure you want to clear ALL login history entries? This cannot be undone.")) return;
    fetch(`${API_BASE_URL}/developer/login-history`, {
      method: 'DELETE',
      headers: getDevHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to clear history");
        setDevLoginHistoryPage(1);
        loadDevLoginHistory(1);
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleDeleteAuditLog = (id) => {
    if (!window.confirm("Are you sure you want to delete this security/audit log entry?")) return;
    fetch(`${API_BASE_URL}/developer/security-logs/${id}`, {
      method: 'DELETE',
      headers: getDevHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete entry");
        loadDevAuditLogs(devAuditLogsPage, devAuditType);
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleClearAllAuditLogs = () => {
    if (!window.confirm("WARNING: Are you sure you want to clear ALL security and audit logs? This cannot be undone.")) return;
    fetch(`${API_BASE_URL}/developer/security-logs`, {
      method: 'DELETE',
      headers: getDevHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to clear logs");
        setDevAuditLogsPage(1);
        loadDevAuditLogs(1, devAuditType);
      })
      .catch(err => alert("Error: " + err.message));
  };

  const loadDevAuditLogs = (page = devAuditLogsPage, type = devAuditType) => {
    fetch(`${API_BASE_URL}/developer/audit?page=${page}&limit=10&eventType=${type}`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => {
        setDevAuditLogs(data.logs || []);
        setDevAuditLogsTotalPages(data.pagination.totalPages || 1);
        setDevAuditLogsPage(data.pagination.page || 1);
        setDevAuditLogsTotalItems(data.pagination.totalItems || 0);
      })
      .catch(err => console.error("Error loading audit logs:", err));
  };

  const [lockedUsers, setLockedUsers] = useState([]);

  const loadLockedUsers = () => {
    fetch(`${API_BASE_URL}/developer/locked-users`, { headers: getDevHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load locked accounts');
        return res.json();
      })
      .then(data => {
        setLockedUsers(data || []);
      })
      .catch(err => console.error("Error loading locked accounts:", err));
  };

  const unlockUserAccount = (userId) => {
    fetch(`${API_BASE_URL}/developer/users/${userId}/lock`, {
      method: 'PUT',
      headers: getDevHeaders(),
      body: JSON.stringify({ isLocked: false })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to unlock account');
        return res.json();
      })
      .then(() => {
        setGlobalSuccess("Account unlocked successfully.");
        loadLockedUsers();
      })
      .catch(err => {
        console.error("Error unlocking account:", err);
        setGlobalError(`Failed to unlock account: ${err.message}`);
      });
  };

  const loadDevSettings = () => {
    fetch(`${API_BASE_URL}/developer/settings`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => setDevSettings(data))
      .catch(err => console.error("Error loading dev settings:", err));
    loadDevNotifications();
    loadLockedUsers();
    loadDevSystemStatus();
  };

  const loadDevHelpReports = (page = devHelpReportsPage) => {
    setDevHelpReportsLoading(true);
    fetch(`${API_BASE_URL}/developer/help-reports?page=${page}&limit=10`, { headers: getDevHeaders() })
      .then(res => res.json())
      .then(data => {
        setDevHelpReports(data.reports || []);
        setDevHelpReportsTotalPages(data.pagination.totalPages || 1);
        setDevHelpReportsPage(data.pagination.page || 1);
        setDevHelpReportsTotalItems(data.pagination.totalItems || 0);
      })
      .catch(err => console.error("Error loading help reports:", err))
      .finally(() => setDevHelpReportsLoading(false));
  };

  const handleUpdateHelpStatus = (id, status, developerReply = '') => {
    fetch(`${API_BASE_URL}/developer/help-reports/${id}/status`, {
      method: 'PUT',
      headers: getDevHeaders(),
      body: JSON.stringify({ status, developerReply })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadDevHelpReports(devHelpReportsPage);
        } else {
          alert(data.error || 'Failed to update status');
        }
      })
      .catch(err => console.error("Error updating status:", err));
  };

  const handleDeleteHelpReport = (id) => {
    if (!window.confirm("Are you sure you want to delete this help report?")) return;
    fetch(`${API_BASE_URL}/developer/help-reports/${id}`, {
      method: 'DELETE',
      headers: getDevHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadDevHelpReports(devHelpReportsPage);
        } else {
          alert(data.error || 'Failed to delete report');
        }
      })
      .catch(err => console.error("Error deleting report:", err));
  };

  const loadUserHelpReports = () => {
    setLoadingUserHelpReports(true);
    fetch(`${API_BASE_URL}/help-reports`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUserHelpReports(data);
        }
      })
      .catch(err => console.error("Error loading user help reports:", err))
      .finally(() => setLoadingUserHelpReports(false));
  };

  const handleSubmitHelp = async (e) => {
    e.preventDefault();
    if (!helpDescription.trim()) {
      setHelpSubmitFeedback({ type: 'error', message: 'Please describe your issue.' });
      return;
    }

    setIsSubmittingHelp(true);
    setHelpSubmitFeedback(null);

    let devName = '';
    if (navigator.userAgentData) {
      try {
        const uaData = await navigator.userAgentData.getHighEntropyValues(['model']);
        if (uaData && uaData.model) {
          devName = uaData.model;
        }
      } catch (err) {
        console.error('Failed to get high entropy device data:', err);
      }
    }

    if (!devName) {
      if (navigator.platform) {
        devName = navigator.platform;
      } else {
        devName = 'Web Client';
      }
    }

    fetch(`${API_BASE_URL}/help-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        issueDescription: helpDescription,
        deviceName: devName,
        userAgent: navigator.userAgent
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setHelpSubmitFeedback({ type: 'success', message: 'Your support ticket has been submitted successfully.' });
          setHelpDescription('');
          setTimeout(() => {
            setIsHelpModalOpen(false);
            setHelpSubmitFeedback(null);
          }, 3000);
        } else {
          setHelpSubmitFeedback({ type: 'error', message: data.error || 'Failed to submit help ticket.' });
        }
      })
      .catch((err) => {
        console.error('Help submission error:', err);
        setHelpSubmitFeedback({ type: 'error', message: 'Network error. Please try again.' });
      })
      .finally(() => {
        setIsSubmittingHelp(false);
      });
  };

  // Form actions
  const handleDevSettingsSubmit = (e) => {
    e.preventDefault();
    setDevSettingsSuccess('');
    setDevSettingsError('');
    setDevActionLoading(true);

    fetch(`${API_BASE_URL}/developer/settings`, {
      method: 'POST',
      headers: getDevHeaders(),
      body: JSON.stringify(devSettings)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update system settings');
        }
        setDevSettingsSuccess('System settings updated successfully in database.');
        setDevSettings(data.settings);
      })
      .catch(err => {
        console.error(err);
        setDevSettingsError(err.message);
      })
      .finally(() => setDevActionLoading(false));
  };

  const handleClearBroadcastMessage = () => {
    if (!window.confirm("Are you sure you want to delete and stop the current System Alert Broadcast? This will immediately remove it for all users.")) {
      return;
    }
    const updated = { ...devSettings, systemAlertMessage: '' };
    setDevActionLoading(true);
    fetch(`${API_BASE_URL}/developer/settings`, {
      method: 'POST',
      headers: getDevHeaders(),
      body: JSON.stringify(updated)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update system settings');
        setDevSettings(data.settings);
        setSystemAlertMessage('');
        setDevSettingsSuccess('System alert broadcast has been deleted and stopped.');
      })
      .catch(err => setDevSettingsError(err.message))
      .finally(() => setDevActionLoading(false));
  };

  const handleClearUpdateNotification = () => {
    if (!window.confirm("Are you sure you want to delete and clear the current System Update Notification?")) {
      return;
    }
    const updated = { ...devSettings, systemUpdateNotification: '' };
    setDevActionLoading(true);
    fetch(`${API_BASE_URL}/developer/settings`, {
      method: 'POST',
      headers: getDevHeaders(),
      body: JSON.stringify(updated)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update system settings');
        setDevSettings(data.settings);
        setDevSettingsSuccess('System update notification has been deleted.');
      })
      .catch(err => setDevSettingsError(err.message))
      .finally(() => setDevActionLoading(false));
  };

  const handleDevUserSave = (e) => {
    e.preventDefault();
    setDevUserFeedback(null);
    setDevActionLoading(true);

    fetch(`${API_BASE_URL}/developer/users/${devUserEdit._id}`, {
      method: 'PUT',
      headers: getDevHeaders(),
      body: JSON.stringify(devUserEditForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to edit user.');
        }
        setDevUserFeedback({ type: 'success', message: 'User updated successfully.' });
        setDevUserEdit(null);
        loadDevUsers(devUsersPage, devUserSearch);
      })
      .catch(err => {
        console.error(err);
        setDevUserFeedback({ type: 'error', message: err.message });
      })
      .finally(() => setDevActionLoading(false));
  };

  const handleDevUserSoftDelete = (id) => {
    const choice = window.prompt(
      `Type "SOFT" to soft-delete this user account (disables login but keeps logs),\n` +
      `Type "PERMANENT" to permanently delete this user account from the database,\n` +
      `Or click Cancel.`
    );
    if (!choice) return;
    const cleanChoice = choice.toUpperCase().trim();
    if (cleanChoice !== 'SOFT' && cleanChoice !== 'PERMANENT') {
      alert("Invalid choice. Action cancelled.");
      return;
    }

    const permanent = cleanChoice === 'PERMANENT';
    setDevUserFeedback(null);
    setDevActionLoading(true);

    const url = permanent
      ? `${API_BASE_URL}/developer/users/${id}?permanent=true`
      : `${API_BASE_URL}/developer/users/${id}`;

    fetch(url, {
      method: 'DELETE',
      headers: getDevHeaders()
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to delete user.');
        }
        setDevUserFeedback({ type: 'success', message: permanent ? 'User permanently deleted successfully.' : 'User soft-deleted successfully.' });
        loadDevUsers(devUsersPage, devUserSearch);
      })
      .catch(err => {
        console.error(err);
        setDevUserFeedback({ type: 'error', message: err.message });
      })
      .finally(() => setDevActionLoading(false));
  };

  const handleDevUserLockToggle = (userId, currentLockState) => {
    setDevActionLoading(true);
    fetch(`${API_BASE_URL}/developer/users/${userId}/lock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getDevHeaders() },
      body: JSON.stringify({ isLocked: !currentLockState })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setDevUserFeedback({ type: 'success', message: `Account ${!currentLockState ? 'locked' : 'unlocked'} successfully.` });
        loadDevUsers(devUsersPage, devUserSearch);
        if (selectedUserDetail && selectedUserDetail.user._id === userId) {
          handleViewUserDetail(userId);
        }
      })
      .catch(err => setDevUserFeedback({ type: 'error', message: err.message }))
      .finally(() => setDevActionLoading(false));
  };

  const handleDevUserStatusToggle = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    setDevActionLoading(true);
    fetch(`${API_BASE_URL}/developer/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getDevHeaders() },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setDevUserFeedback({ type: 'success', message: `User status set to ${nextStatus} successfully.` });
        loadDevUsers(devUsersPage, devUserSearch);
        if (selectedUserDetail && selectedUserDetail.user._id === userId) {
          handleViewUserDetail(userId);
        }
      })
      .catch(err => setDevUserFeedback({ type: 'error', message: err.message }))
      .finally(() => setDevActionLoading(false));
  };

  const handleDevUserResetPassword = (userId, newPassword) => {
    if (!newPassword || newPassword.trim().length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setDevActionLoading(true);
    fetch(`${API_BASE_URL}/developer/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getDevHeaders() },
      body: JSON.stringify({ newPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        alert("Password reset successfully!");
        setDevUserFeedback({ type: 'success', message: 'User password reset successfully.' });
        if (selectedUserDetail && selectedUserDetail.user._id === userId) {
          handleViewUserDetail(userId);
        }
      })
      .catch(err => alert("Failed to reset password: " + err.message))
      .finally(() => setDevActionLoading(false));
  };

  const handleViewUserDetail = (userId) => {
    setSelectedUserDetailLoading(true);
    fetch(`${API_BASE_URL}/developer/users/${userId}/details`, { headers: getDevHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load user details');
        return res.json();
      })
      .then(data => {
        setSelectedUserDetail(data);
        setSelectedUserDetailLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSelectedUserDetailLoading(false);
        alert(err.message);
      });
  };

  const handleDevLogoutSession = (token) => {
    if (!window.confirm("Are you sure you want to terminate this session?")) return;
    setDevActionLoading(true);
    setDevSessionFeedback(null);

    fetch(`${API_BASE_URL}/developer/sessions/${token}`, {
      method: 'DELETE',
      headers: getDevHeaders()
    })
      .then(async res => {
        if (res.ok) {
          const currentToken = getSessionToken();
          if (token === currentToken) {
            clearSession();
            setLoggedInUser('');
            setAppMode('login');
          } else {
            setDevSessionFeedback({ type: 'success', message: 'Session terminated successfully.' });
            loadDevSessions(devSessionsPage);
          }
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to terminate session.');
        }
      })
      .catch(err => {
        console.error("Error logging out session:", err);
        setDevSessionFeedback({ type: 'error', message: err.message });
      })
      .finally(() => setDevActionLoading(false));
  };

  const handleDevLogoutAllSessions = () => {
    if (!window.confirm("Are you sure you want to terminate all other sessions? This will force-logout all users on all devices (except your current session).")) return;
    setDevActionLoading(true);
    setDevSessionFeedback(null);

    fetch(`${API_BASE_URL}/developer/sessions`, {
      method: 'DELETE',
      headers: getDevHeaders()
    })
      .then(async res => {
        const data = await res.json();
        if (res.ok) {
          setDevSessionFeedback({ type: 'success', message: `Successfully terminated ${data.deletedCount} sessions.` });
          loadDevSessions(devSessionsPage);
        } else {
          throw new Error(data.error || 'Failed to terminate sessions.');
        }
      })
      .catch(err => {
        console.error("Error logging out all sessions:", err);
        setDevSessionFeedback({ type: 'error', message: err.message });
      })
      .finally(() => setDevActionLoading(false));
  };

  // Trigger loading functions based on view
  useEffect(() => {
    if (appMode !== 'developer') return;

    if (devView === 'dashboard') {
      loadDevDashboardStats();
    } else if (devView === 'users') {
      loadDevUsers(devUsersPage, devUserSearch);
    } else if (devView === 'sessions') {
      loadDevSessions(devSessionsPage);
      loadDevLoginHistory(devLoginHistoryPage);
    } else if (devView === 'security') {
      loadDevSecurityLogs(devSecurityLogsPage);
    } else if (devView === 'logs') {
      loadDevAppLogs(devAppLogsPage, devLogsType, devLogsSearch);
    } else if (devView === 'system') {
      loadDevSystemStatus();
    } else if (devView === 'database') {
      loadDevDatabaseInfo();
    } else if (devView === 'audit') {
      loadDevAuditLogs(devAuditLogsPage, devAuditType);
    } else if (devView === 'settings') {
      loadDevSettings();
    } else if (devView === 'help-reports') {
      loadDevHelpReports(devHelpReportsPage);
    }
  }, [appMode, devView, devUsersPage, devSessionsPage, devLoginHistoryPage, devSecurityLogsPage, devAppLogsPage, devLogsType, devLogsSearch, devAuditLogsPage, devAuditType, devHelpReportsPage]);

  // Real-time system status polling for developer diagnostics
  useEffect(() => {
    if (appMode !== 'developer' || devView !== 'settings') return;

    // Load immediately on tab mount
    loadDevSystemStatus();

    // Poll every 5 seconds for real-time diagnostics updates
    const interval = setInterval(() => {
      loadDevSystemStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [appMode, devView]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Poll system maintenance status and fetch user help tickets when modal is open
  useEffect(() => {
    const checkMaintenance = () => {
      fetch(`${API_BASE_URL}/system/maintenance`)
        .then(res => res.json())
        .then(data => {
          setIsSystemUnderMaintenance(!!data.isMaintenanceActive);
          setMaintenanceMode(data.maintenanceMode || 'none');
          setIsMaintenanceUpcoming(!!data.isMaintenanceUpcoming);
          setMaintenanceStart(data.maintenanceStart || null);
          setMaintenanceEnd(data.maintenanceEnd || null);
          setSystemAlertMessage(data.systemAlertMessage || '');

        })
        .catch(err => console.error("Error checking maintenance status:", err));

      if (loggedInUser) {
        checkUnseenHelpReplies();
        checkUnreadAnnouncement(loggedInUser);
      }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isHelpModalOpen && loggedInUser) {
      loadUserHelpReports();
    }
  }, [isHelpModalOpen, loggedInUser]);

  useEffect(() => {
    if (loggedInUser && userLoginCount === 1 && !sessionStorage.getItem('welcome_dismissed')) {
      setShowWelcomeModal(true);
    }
  }, [loggedInUser, userLoginCount]);

  useEffect(() => {
    if (loggedInUser) {
      checkUnreadAnnouncement(loggedInUser);
    }
  }, [loggedInUser]);

  const handleUpdateBranchPassword = (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setBranchPasswordError('');

    const br = branchForm.branch;
    const pass = branchForm.newPassword;
    const user = branchForm.newUsername.trim() || branchCredentials[br]?.username || `admin@${br}`;

    if (pass !== branchForm.confirmPassword) {
      setBranchPasswordError('Passwords do not match');
      return;
    }

    const updatedBranchCreds = {
      ...branchCredentials,
      [br]: { username: user, password: pass }
    };

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchCredentials: updatedBranchCreds })
    })
      .then(res => res.json())
      .then(data => {
        setBranchCredentials(data.branchCredentials || {});
        setSettingsSuccess(`Branch Inspector credentials for "${br.toUpperCase()}" updated successfully!`);
        setBranchForm({ branch: br, newUsername: '', newPassword: '', confirmPassword: '' });
      })
      .catch(err => {
        setSettingsError('Error updating credentials: ' + err.message);
      });
  };

  const handleUpdateBatchPassword = (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setBatchPasswordError('');

    const br = batchForm.branch;
    const bt = batchForm.batch;
    const key = `${br}_${bt}`;
    const pass = batchForm.newPassword;
    const defaultUser = `${bt}@${br}`;
    const user = batchForm.newUsername.trim() || batchCredentials[key]?.username || defaultUser;

    if (pass !== batchForm.confirmPassword) {
      setBatchPasswordError('Passwords do not match');
      return;
    }

    const updatedBatchCreds = {
      ...batchCredentials,
      [key]: { username: user, password: pass }
    };

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchCredentials: updatedBatchCreds })
    })
      .then(res => res.json())
      .then(data => {
        setBatchCredentials(data.batchCredentials || {});
        setSettingsSuccess(`Trainer credentials for "${br.toUpperCase()} - ${bt.toUpperCase()}" updated successfully!`);
        setBatchForm({ branch: br, batch: bt, newUsername: '', newPassword: '', confirmPassword: '' });
      })
      .catch(err => {
        setSettingsError('Error updating credentials: ' + err.message);
      });
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    const newBrClean = newBranchForm.name.trim();
    const pass = newBranchForm.password;

    if (!newBrClean || !pass) {
      setSettingsError('Branch name and password are required');
      return;
    }

    if (pass !== newBranchForm.confirmPassword) {
      setNewBranchPasswordError('Passwords do not match');
      return;
    }

    const newBrLower = newBrClean.toLowerCase();
    if (branches.some(b => b.toLowerCase() === newBrLower)) {
      setSettingsError('Branch already exists!');
      return;
    }

    const defaultUser = `admin@${newBrLower}`;

    const updatedCustomBranches = [...customBranches, newBrClean];
    const updatedBranchCreds = {
      ...branchCredentials,
      [newBrLower]: { username: defaultUser, password: pass }
    };

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBranches: updatedCustomBranches,
        branchCredentials: updatedBranchCreds
      })
    })
      .then(res => res.json())
      .then(data => {
        setCustomBranches(data.customBranches || []);
        setBranchCredentials(data.branchCredentials || {});
        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBranches: data.customBranches || [],
            branchCredentials: data.branchCredentials || {}
          }));
        }

        const dbBranches = Object.keys(data.branchCredentials || {}).map(b => b.charAt(0).toUpperCase() + b.slice(1));
        const uniqueBranches = Array.from(new Set([
          ...DEFAULT_BRANCHES,
          ...dbBranches,
          ...(data.customBranches || []).map(b => b.charAt(0).toUpperCase() + b.slice(1))
        ]));
        setBranches(uniqueBranches);
        setNewBranchForm({ name: '', username: '', password: '', confirmPassword: '' });
        setSettingsSuccess(`Branch "${newBrClean}" created and credentials configured successfully!`);
      })
      .catch(err => {
        setSettingsError('Error adding branch: ' + err.message);
      });
  };

  const handleDeleteCustomBranch = (branchToDelete) => {
    if (!window.confirm(`Are you sure you want to delete the branch "${branchToDelete}"?`)) {
      return;
    }

    const branchKey = branchToDelete.toLowerCase().trim();
    const updatedCustomBranches = customBranches.filter(b => b.toLowerCase().trim() !== branchKey);

    // Also delete from branchCredentials map
    const updatedBranchCreds = { ...branchCredentials };
    delete updatedBranchCreds[branchKey];

    // Also clean up associated batch credentials
    const updatedBatchCreds = { ...batchCredentials };
    for (const key of Object.keys(updatedBatchCreds)) {
      if (key.startsWith(`${branchKey}_`)) {
        delete updatedBatchCreds[key];
      }
    }

    // Optimistically update
    setCustomBranches(updatedCustomBranches);
    setBranchCredentials(updatedBranchCreds);
    setBatchCredentials(updatedBatchCreds);

    const dbBranches = Object.keys(updatedBranchCreds).map(b => b.charAt(0).toUpperCase() + b.slice(1));
    const uniqueBranches = Array.from(new Set([
      ...DEFAULT_BRANCHES,
      ...dbBranches,
      ...updatedCustomBranches.map(b => b.charAt(0).toUpperCase() + b.slice(1))
    ]));
    setBranches(uniqueBranches);

    // Delete from DB Branch collection
    const matchedBranchObj = Array.isArray(customBranches) && customBranches.find(b => {
      if (typeof b === 'string') return b.toLowerCase().trim() === branchKey;
      if (b && typeof b === 'object') return b.name?.toLowerCase().trim() === branchKey || b.code?.toLowerCase().trim() === branchKey;
      return false;
    });
    if (matchedBranchObj && typeof matchedBranchObj === 'object' && matchedBranchObj._id) {
      fetch(`${API_BASE_URL}/branches/${matchedBranchObj._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error("Error deleting branch from DB:", err));
    }

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBranches: updatedCustomBranches,
        branchCredentials: updatedBranchCreds,
        batchCredentials: updatedBatchCreds
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete branch on server');
        return res.json();
      })
      .then(data => {
        setCustomBranches(data.customBranches || []);
        setBranchCredentials(data.branchCredentials || {});
        setBatchCredentials(data.batchCredentials || {});
        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBranches: data.customBranches || [],
            branchCredentials: data.branchCredentials || {},
            batchCredentials: data.batchCredentials || {}
          }));
        }

        const dbBranches = Object.keys(data.branchCredentials || {}).map(b => b.charAt(0).toUpperCase() + b.slice(1));
        const uniqueBranches = Array.from(new Set([
          ...DEFAULT_BRANCHES,
          ...dbBranches,
          ...(data.customBranches || []).map(b => b.charAt(0).toUpperCase() + b.slice(1))
        ]));
        setBranches(uniqueBranches);
        setSettingsSuccess(`Branch "${branchToDelete}" deleted successfully!`);
      })
      .catch(err => {
        setSettingsError('Error deleting branch: ' + err.message);
        reloadAllAppData();
      });
  };

  const handleEditCustomBranch = (oldName, newName) => {
    const oldBrClean = oldName.trim();
    const newBrClean = newName.trim();
    if (!newBrClean) {
      alert('Branch name cannot be empty.');
      return;
    }
    const oldBrLower = oldBrClean.toLowerCase();
    const newBrLower = newBrClean.toLowerCase();

    if (customBranches.some(b => {
      if (typeof b === 'string') return b.toLowerCase().trim() === newBrLower && b.toLowerCase().trim() !== oldBrLower;
      if (b && typeof b === 'object') return (b.name?.toLowerCase().trim() === newBrLower || b.code?.toLowerCase().trim() === newBrLower) && b.code?.toLowerCase().trim() !== oldBrLower;
      return false;
    })) {
      alert('Branch name already exists!');
      return;
    }

    const updatedCustomBranches = customBranches.map(b => {
      if (typeof b === 'string') return b.toLowerCase() === oldBrLower ? newBrClean : b;
      if (b && typeof b === 'object') return b.name?.toLowerCase() === oldBrLower || b.code?.toLowerCase() === oldBrLower ? newBrClean : b.name;
      return b;
    });

    // Update name in DB Branch collection
    const matchedBranchObj = Array.isArray(customBranches) && customBranches.find(b => {
      if (typeof b === 'string') return b.toLowerCase().trim() === oldBrLower;
      if (b && typeof b === 'object') return b.name?.toLowerCase().trim() === oldBrLower || b.code?.toLowerCase().trim() === oldBrLower;
      return false;
    });
    if (matchedBranchObj && typeof matchedBranchObj === 'object' && matchedBranchObj._id) {
      fetch(`${API_BASE_URL}/branches/${matchedBranchObj._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrClean, code: newBrLower })
      }).catch(err => console.error("Error renaming branch in DB:", err));
    }

    const updatedBranchCreds = { ...branchCredentials };
    if (updatedBranchCreds[oldBrLower]) {
      const creds = updatedBranchCreds[oldBrLower];
      const newUsername = creds.username.toLowerCase() === `admin@${oldBrLower}`
        ? `admin@${newBrLower}`
        : creds.username;
      updatedBranchCreds[newBrLower] = {
        username: newUsername,
        password: creds.password
      };
      delete updatedBranchCreds[oldBrLower];
    }

    const updatedBatchCreds = { ...batchCredentials };
    for (const key of Object.keys(updatedBatchCreds)) {
      if (key.startsWith(`${oldBrLower}_`)) {
        const parts = key.split('_');
        const batchId = parts.slice(1).join('_');
        const newKey = `${newBrLower}_${batchId}`;
        const creds = updatedBatchCreds[key];

        const newUsername = creds.username.toLowerCase() === `${batchId}@${oldBrLower}`
          ? `${batchId}@${newBrLower}`
          : creds.username;

        updatedBatchCreds[newKey] = {
          username: newUsername,
          password: creds.password
        };
        delete updatedBatchCreds[key];
      }
    }

    setCustomBranches(updatedCustomBranches);
    setBranchCredentials(updatedBranchCreds);
    setBatchCredentials(updatedBatchCreds);

    const dbBranches = Object.keys(updatedBranchCreds).map(b => b.charAt(0).toUpperCase() + b.slice(1));
    const uniqueBranches = Array.from(new Set([
      ...DEFAULT_BRANCHES,
      ...dbBranches,
      ...updatedCustomBranches.map(b => b.charAt(0).toUpperCase() + b.slice(1))
    ]));
    setBranches(uniqueBranches);

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBranches: updatedCustomBranches,
        branchCredentials: updatedBranchCreds,
        batchCredentials: updatedBatchCreds
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update branch on server');
        return res.json();
      })
      .then(data => {
        setCustomBranches(data.customBranches || []);
        setBranchCredentials(data.branchCredentials || {});
        setBatchCredentials(data.batchCredentials || {});

        const dbBranches = Object.keys(data.branchCredentials || {}).map(b => b.charAt(0).toUpperCase() + b.slice(1));
        const uniqueBranches = Array.from(new Set([
          ...DEFAULT_BRANCHES,
          ...dbBranches,
          ...(data.customBranches || []).map(b => b.charAt(0).toUpperCase() + b.slice(1))
        ]));
        setBranches(uniqueBranches);

        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBranches: data.customBranches || [],
            branchCredentials: data.branchCredentials || {},
            batchCredentials: data.batchCredentials || {}
          }));
        }
        setSettingsSuccess(`Branch "${oldBrClean}" renamed to "${newBrClean}" successfully!`);
      })
      .catch(err => {
        setSettingsError('Error renaming branch: ' + err.message);
        reloadAllAppData();
      });
  };

  const handleAddBatch = (e) => {
    e.preventDefault();
    const name = newBatchForm.name.trim();
    const schedule = newBatchForm.schedule.trim();
    const br = newBatchForm.branch.toLowerCase();
    const pass = newBatchForm.password;

    if (!name || !schedule || !pass) {
      setSettingsError('Batch name, schedule pattern, and password are required');
      return;
    }

    if (pass !== newBatchForm.confirmPassword) {
      setNewBatchPasswordError('Passwords do not match');
      return;
    }

    if (batchOptions.some(b => b.name.toLowerCase() === name.toLowerCase() || b.schedule.toLowerCase() === schedule.toLowerCase())) {
      setSettingsError('A batch with this name or schedule already exists!');
      return;
    }

    const id = 'batch_' + Date.now();
    const newBatchObj = { id, name, schedule };

    const key = `${br}_${id}`;
    const defaultUser = `${id}@${br}`;

    const updatedCustomBatches = [...customBatches, newBatchObj];
    const updatedBatchCreds = {
      ...batchCredentials,
      [key]: { username: defaultUser, password: pass }
    };

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBatches: updatedCustomBatches,
        batchCredentials: updatedBatchCreds
      })
    })
      .then(res => res.json())
      .then(data => {
        setCustomBatches(data.customBatches || []);
        reloadAllAppData();
        setBatchCredentials(data.batchCredentials || {});
        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBatches: data.customBatches || [],
            batchCredentials: data.batchCredentials || {}
          }));
        }
        setNewBatchForm({ name: '', schedule: '', branch: 'kuttiady', username: '', password: '', confirmPassword: '' });
        setSettingsSuccess(`Batch "${name}" added and credentials configured successfully!`);
      })
      .catch(err => {
        setSettingsError('Error adding batch: ' + err.message);
      });
  };

  const handleDeleteCustomBatch = (batchIdToDelete, batchName) => {
    if (!window.confirm(`Are you sure you want to delete the batch "${batchName}"?`)) {
      return;
    }

    const updatedCustomBatches = customBatches.filter(b => b.id !== batchIdToDelete);

    // Also delete from batchCredentials map
    const updatedBatchCreds = { ...batchCredentials };
    for (const key of Object.keys(updatedBatchCreds)) {
      if (key.endsWith(`_${batchIdToDelete}`) || key === batchIdToDelete) {
        delete updatedBatchCreds[key];
      }
    }

    // Optimistically update
    setCustomBatches(updatedCustomBatches);
    setBatchOptions(sortBatchesAlphabetically([...DEFAULT_BATCH_OPTIONS, ...updatedCustomBatches]));
    setBatchCredentials(updatedBatchCreds);

    // Delete from DB Batch collection
    const matchedBatchObj = Array.isArray(customBatches) && customBatches.find(b => {
      if (b && typeof b === 'object') {
        const bId = String(b.id || b.code || b._id).toLowerCase();
        const targetId = String(batchIdToDelete).toLowerCase();
        return bId === targetId || b._id === batchIdToDelete;
      }
      return false;
    });
    if (matchedBatchObj && typeof matchedBatchObj === 'object' && matchedBatchObj._id) {
      fetch(`${API_BASE_URL}/batches/${matchedBatchObj._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error("Error deleting batch from DB:", err));
    }

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBatches: updatedCustomBatches,
        batchCredentials: updatedBatchCreds
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete batch on server');
        return res.json();
      })
      .then(data => {
        setCustomBatches(data.customBatches || []);
        reloadAllAppData();
        setBatchCredentials(data.batchCredentials || {});
        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBatches: data.customBatches || [],
            batchCredentials: data.batchCredentials || {}
          }));
        }
        setSettingsSuccess(`Batch "${batchName}" deleted successfully!`);
      })
      .catch(err => {
        setSettingsError('Error deleting batch: ' + err.message);
        reloadAllAppData();
      });
  };

  const handleEditCustomBatch = (batchId, newName, newSchedule) => {
    const nameClean = newName.trim();
    const scheduleClean = newSchedule.trim();

    if (!nameClean || !scheduleClean) {
      alert('Batch name and schedule pattern are required.');
      return;
    }

    if (batchOptions.some(b => b.id !== batchId && (b.name.toLowerCase() === nameClean.toLowerCase() && b.schedule.toLowerCase() === scheduleClean.toLowerCase()))) {
      alert('A batch with this name and schedule already exists!');
      return;
    }

    const updatedCustomBatches = customBatches.map(b => b.id === batchId ? { ...b, name: nameClean, schedule: scheduleClean } : b);

    setCustomBatches(updatedCustomBatches);
    setBatchOptions(sortBatchesAlphabetically([...DEFAULT_BATCH_OPTIONS, ...updatedCustomBatches]));

    // Update name & schedule in DB Batch collection
    const matchedBatchObj = Array.isArray(customBatches) && customBatches.find(b => {
      if (b && typeof b === 'object') {
        const bId = String(b.id || b.code || b._id).toLowerCase();
        const targetId = String(batchId).toLowerCase();
        return bId === targetId || b._id === batchId;
      }
      return false;
    });
    if (matchedBatchObj && typeof matchedBatchObj === 'object' && matchedBatchObj._id) {
      fetch(`${API_BASE_URL}/batches/${matchedBatchObj._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameClean, schedule: scheduleClean })
      }).catch(err => console.error("Error updating batch in DB:", err));
    }

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBatches: updatedCustomBatches
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update batch on server');
        return res.json();
      })
      .then(data => {
        setCustomBatches(data.customBatches || []);
        reloadAllAppData();

        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBatches: data.customBatches || []
          }));
        }
        setSettingsSuccess(`Batch renamed to "${nameClean}" successfully!`);
      })
      .catch(err => {
        setSettingsError('Error renaming batch: ' + err.message);
        reloadAllAppData();
      });
  };


  // Prevent body scroll in admin mode to avoid double scrollbars
  useEffect(() => {
    if (appMode === 'admin' || appMode === 'developer') {
      document.body.classList.add('admin-body');
      document.documentElement.classList.add('admin-html');
    } else {
      document.body.classList.remove('admin-body');
      document.documentElement.classList.remove('admin-html');
    }
    return () => {
      document.body.classList.remove('admin-body');
      document.documentElement.classList.remove('admin-html');
    };
  }, [appMode]);

  // Hash-based routing to support separate page navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const hasSession = getSessionUser();
      const isDevSession = hasSession && (hasSession.toLowerCase() === 'developer' || hasSession.toLowerCase().startsWith('developer@'));

      if (hash.startsWith('#/developer')) {
        if (isDevSession) {
          setAppMode('developer');
          const subview = hash.split('/')[2] || 'dashboard';
          setDevView(subview);
        } else {
          // If a session exists but it's not developer, go to admin dashboard
          if (hasSession) {
            window.location.hash = '#/admin';
          } else {
            window.location.hash = '#/login';
          }
        }
      } else if (hash === '#/superadmin') {
        if (hasSession) {
          if (isDevSession) {
            window.location.hash = '#/developer/dashboard';
          } else {
            window.location.hash = '#/admin';
          }
        } else {
          setAppMode('superadmin-login');
        }
      } else if (hash === '#/login' || hash === '#/branch' || hash === '#/batch') {
        if (hasSession) {
          if (isDevSession) {
            window.location.hash = '#/developer/dashboard';
          } else {
            window.location.hash = '#/admin';
          }
        } else {
          setAppMode('login');
        }
      } else if (hash === '#/admin') {
        if (hasSession) {
          if (isDevSession) {
            window.location.hash = '#/developer/dashboard';
          } else {
            setAppMode('admin');
          }
        } else {
          setAppMode('login');
        }
      } else if (hash === '' || hash === '#/' || hash === '#/home') {
        setAppMode('website');
      }
      setIsMobileMenuOpen(false);
      setIsSidebarOpen(false);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on initial load
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close sidebar on view changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentView, devView]);

  // Sync state changes back to URL hash
  useEffect(() => {
    const currentHash = window.location.hash;
    if (appMode === 'website') {
      if (currentHash !== '' && currentHash !== '#/' && currentHash !== '#/home') {
        window.location.hash = '#/';
      }
    } else if (appMode === 'login' && currentHash !== '#/login') {
      window.location.hash = '#/login';
    } else if (appMode === 'superadmin-login' && currentHash !== '#/superadmin') {
      window.location.hash = '#/superadmin';
    } else if (appMode === 'admin' && currentHash !== '#/admin') {
      window.location.hash = '#/admin';
    } else if (appMode === 'developer') {
      const targetHash = `#/developer/${devView}`;
      if (currentHash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  }, [appMode, devView]);

  // Clear settings alerts when view or mappingSubTab changes
  useEffect(() => {
    setSettingsError('');
    setSettingsSuccess('');
  }, [currentView, mappingSubTab]);

  // Helper functions to get current local date/month (avoiding UTC timezone shift issues)
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLocalMonthString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getDynamicMetrics = () => {
    const activeBranch = branchFilter;
    const activeBatch = batchFilter;

    // Filter active students
    const filteredStudents = students.filter(s => {
      if (s.status === 'Inactive' || s.status === 'SoftDeleted') return false;

      const matchesBranch = activeBranch === 'All' ||
        (s.branch && s.branch.toLowerCase().trim() === activeBranch.toLowerCase().trim());

      const matchesBatch = activeBatch === 'All' ||
        (s.schedule && s.schedule.toLowerCase().trim() === activeBatch.toLowerCase().trim());

      return matchesBranch && matchesBatch;
    });

    const totalStudentsCount = filteredStudents.length;

    // Filter attendance records
    const todayStr = getLocalDateString();
    const todayRecs = attendanceRecords[todayStr] || {};
    let presentToday = 0;
    let absentToday = 0;

    filteredStudents.forEach(student => {
      const statusData = todayRecs[student.id];
      if (statusData) {
        let statusStr = '';
        if (typeof statusData === 'object' && statusData !== null) {
          statusStr = statusData.status || '';
        } else {
          statusStr = String(statusData);
        }
        const statusLower = statusStr.toLowerCase();
        if (statusLower === 'present') {
          presentToday++;
        } else if (statusLower === 'absent') {
          absentToday++;
        }
      }
    });

    const attendancePercentage = (presentToday + absentToday) > 0
      ? Math.round((presentToday / (presentToday + absentToday)) * 100)
      : 0;

    // Filter classes today
    const filteredClasses = todayClasses.filter(c => {
      const matchesBranch = activeBranch === 'All' ||
        (c.branch && c.branch.toLowerCase().trim() === activeBranch.toLowerCase().trim());

      let matchesBatch = false;
      if (activeBatch === 'All') {
        matchesBatch = true;
      } else {
        const batchOpt = batchOptions.find(opt => opt.id.toLowerCase() === c.batch.toLowerCase());
        if (batchOpt && batchOpt.schedule.toLowerCase().trim() === activeBatch.toLowerCase().trim()) {
          matchesBatch = true;
        }
      }

      return matchesBranch && matchesBatch;
    });

    // Sort classes chronologically by startTime
    const sortedClasses = [...filteredClasses].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Fee calculations
    let feeCollection = 0;
    let pendingFees = 0;

    filteredStudents.forEach(student => {
      // Admission fee
      const rateAdmission = student.customAdmissionRate !== undefined && student.customAdmissionRate !== null
        ? student.customAdmissionRate
        : admissionFeeRate;
      const admissionCoupon = resolveCouponCode(student.appliedAdmissionCoupon);
      let admissionDiscountAmount = 0;
      if (admissionCoupon) {
        if (admissionCoupon.type === 'percentage') {
          admissionDiscountAmount = Math.round(rateAdmission * admissionCoupon.value / 100);
        } else {
          admissionDiscountAmount = admissionCoupon.value;
        }
      }
      const finalAdmissionRate = Math.max(0, rateAdmission - admissionDiscountAmount);

      if (student.admissionPaid) {
        feeCollection += finalAdmissionRate;
      } else {
        pendingFees += finalAdmissionRate;
      }

      // Monthly fees
      const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
      let joinMonthStr = student.joinDate ? student.joinDate.slice(0, 7) : currentMonthStr;

      if (startingBillingMonth && startingBillingMonth > joinMonthStr) {
        joinMonthStr = startingBillingMonth;
      }

      const rateToUse = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null
        ? student.customMonthlyRate
        : monthlyFeeRate;
      const discountAmount = getStudentDiscount(student, rateToUse);
      const finalRate = Math.max(0, rateToUse - discountAmount);

      let [joinYear, joinMonth] = joinMonthStr.split('-').map(Number);
      let [currYear, currMonth] = currentMonthStr.split('-').map(Number);

      if (joinYear && joinMonth && currYear && currMonth) {
        let tempYear = joinYear;
        let tempMonth = joinMonth;

        while (tempYear < currYear || (tempYear === currYear && tempMonth <= currMonth)) {
          const monthStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}`;
          const isPaid = student.paidMonths && student.paidMonths[monthStr];

          if (isPaid) {
            feeCollection += finalRate;
          } else {
            pendingFees += finalRate;
          }

          tempMonth++;
          if (tempMonth > 12) {
            tempMonth = 1;
            tempYear++;
          }
        }
      }
    });

    return {
      totalStudents: totalStudentsCount,
      presentToday,
      absentToday,
      attendancePercentage,
      feeCollection: Math.round(feeCollection),
      pendingFees: Math.round(pendingFees),
      filteredClasses: sortedClasses
    };
  };

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date()); // Default to current month/year
  const [feeMonth, setFeeMonth] = useState(getLocalMonthString()); // "YYYY-MM"

  // Profile modal dues calculation month limit
  const [profileFeeMonth, setProfileFeeMonth] = useState(getLocalMonthString());
  const [profileAttendanceMonth, setProfileAttendanceMonth] = useState(getLocalMonthString());
  const [startingBillingMonth, setStartingBillingMonth] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [selectedCalendarDetail, setSelectedCalendarDetail] = useState(null);

  useEffect(() => {
    if (selectedStudent) {
      setProfileFeeMonth(feeMonth);
      setProfileAttendanceMonth(feeMonth);
    }
  }, [selectedStudent, feeMonth]);

  // Attendance Marking State
  const [markingDate, setMarkingDate] = useState(getLocalDateString());
  const [attendanceBatchFilter, setAttendanceBatchFilter] = useState('All');

  // Fee Filter State
  const [feeBatchFilter, setFeeBatchFilter] = useState('All');

  // Roster Filter State
  const [branchFilter, setBranchFilter] = useState('Kuttiady');
  const [batchFilter, setBatchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  // Form State
  const [newStudent, setNewStudent] = useState({
    name: '', age: '', dob: '', phone: '', parentPhone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: '', photo: null
  });

  const compressImage = (base64Str, maxWidth = 150, maxHeight = 150, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        compressImage(reader.result).then(compressedDataUrl => {
          setNewStudent({ ...newStudent, photo: compressedDataUrl });
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  const searchedStudents = sortStudentsAlphabetically(students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery);

    let activeBranch = 'All';
    if (isAdminUser(loggedInUser)) {
      activeBranch = branchFilter;
    } else {
      activeBranch = getLoggedInUserBranch();
    }

    const matchesBranch = activeBranch === 'All' ||
      (s.branch && activeBranch && s.branch.toLowerCase().trim() === activeBranch.toLowerCase().trim());

    // Filter by student status: Active, Inactive, or All
    const matchesStatus = statusFilter === 'All'
      ? true
      : (s.status || 'Active') === statusFilter;

    // Filter by global batch schedule
    const matchesBatch = batchFilter === 'All' ||
      (s.schedule && batchFilter && s.schedule.toLowerCase().trim() === batchFilter.toLowerCase().trim());

    if (userRole === 'trainer' || userRole === 'coordinator') {
      const activeBatch = batchOptions.find(b => b.id.toLowerCase() === userBatch.toLowerCase());
      if (activeBatch) {
        return matchesSearch && matchesBranch && matchesStatus && matchesBatch && s.schedule === activeBatch.schedule;
      }
    }

    return matchesSearch && matchesBranch && matchesStatus && matchesBatch;
  }));

  const getBeltColorClass = (belt) => {
    switch (belt.toLowerCase()) {
      case 'white': return 'badge-white';
      case 'yellow': return 'badge-yellow';
      case 'orange': return 'badge-orange';
      case 'green': return 'badge-green';
      case 'blue': return 'badge-blue';
      case 'purple': return 'badge-purple';
      case 'brown': return 'badge-brown';
      case 'red': return 'badge-red';
      case 'black': return 'badge-black';
      default: return 'badge-white';
    }
  };

  const handleDeleteStudent = (id) => {
    setStudentToDelete(id);
  };

  const confirmDelete = (permanent = false) => {
    if (studentToDelete !== null) {
      if (permanent) {
        setStudents(students.filter(s => s.id !== studentToDelete));
      } else {
        setStudents(students.map(s => s.id === studentToDelete ? { ...s, status: 'SoftDeleted' } : s));
      }
      setSelectedStudent(null);

      const url = permanent
        ? `${API_BASE_URL}/students/${studentToDelete}?permanent=true`
        : `${API_BASE_URL}/students/${studentToDelete}`;

      fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getSessionToken()}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete on server');
          if (typeof loadStudents === 'function') loadStudents();
        })
        .catch(err => console.error("Error deleting student:", err));

      setStudentToDelete(null);
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();

    const phoneClean = newStudent.phone.trim();
    if (!/^\d{10}$/.test(phoneClean)) {
      setGlobalError("Student mobile number must be exactly 10 digits.");
      return;
    }

    const parentPhoneClean = newStudent.parentPhone ? newStudent.parentPhone.trim() : '';
    if (!/^\d{10}$/.test(parentPhoneClean)) {
      setGlobalError("Parent mobile number must be exactly 10 digits.");
      return;
    }

    if (!newStudent.dob) {
      setGlobalError("Date of Birth (DOB) is required.");
      return;
    }

    let defaultBranch = getLoggedInUserBranch();
    if (defaultBranch === 'All') {
      defaultBranch = branches[0] || 'Kuttiady';
    }

    let studentBatch = newStudent.batch;
    let studentSchedule = newStudent.schedule;

    if (userRole === 'trainer' || userRole === 'coordinator') {
      const activeBatch = batchOptions.find(b => b.id.toLowerCase() === userBatch.toLowerCase());
      if (activeBatch) {
        studentBatch = activeBatch.name;
        studentSchedule = activeBatch.schedule;
      }
    }

    const resolvedBranch = (userRole === 'trainer' || userRole === 'coordinator' || userRole === 'branchadmin')
      ? defaultBranch
      : ((isAdminUser(loggedInUser) || appMode === 'superadmin-login') ? newStudent.branch : (appMode === 'login' ? selectedBranchLogin : defaultBranch));

    const student = {
      ...newStudent,
      phone: phoneClean,
      parentPhone: parentPhoneClean,
      branch: resolvedBranch,
      batch: studentBatch,
      schedule: studentSchedule,
      status: "Active",
      admissionPaid: false,
      paidMonths: {},
      performanceScore: 50
    };

    const isPublicRegistration = !loggedInUser || appMode === 'login';
    const targetUrl = isPublicRegistration
      ? `${API_BASE_URL}/public/students`
      : `${API_BASE_URL}/students`;

    fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.error || 'Failed to save student data on the server');
          });
        }
        return res.json();
      })
      .then(savedStudent => {
        setStudents(prev => sortStudentsAlphabetically([...prev, savedStudent]));
        setIsAddModalOpen(false);
        setNewStudent({ name: '', age: '', dob: '', phone: '', parentPhone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: defaultBranch === 'All' ? (branches[0] || 'Kuttiady') : defaultBranch, photo: null });

        setGlobalSuccess("Student added successfully.");
        reloadAllAppData();
      })
      .catch(err => {
        console.error("Error creating student:", err);
        setGlobalError(`Failed to save student: ${err.message}`);
      });
  };

  const formatMonthName = (monthStr) => {
    if (!monthStr) return '';
    const parts = monthStr.split('-');
    if (parts.length !== 2) return monthStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[monthIdx] || parts[1]} '${year.slice(2)}`;
  };

  const calculateStudentFees = (student, targetMonth = null) => {
    if (!student) return { monthlyDue: 0, admissionDue: 0, totalDue: 0, unpaidMonths: [], paidMonthsList: [] };

    // 1. Admission Due
    const rateAdmission = student.customAdmissionRate !== undefined && student.customAdmissionRate !== null
      ? student.customAdmissionRate
      : admissionFeeRate;
    const admissionCoupon = resolveCouponCode(student.appliedAdmissionCoupon);
    let admissionDiscountAmount = 0;
    if (admissionCoupon) {
      if (admissionCoupon.type === 'percentage') {
        admissionDiscountAmount = Math.round(rateAdmission * admissionCoupon.value / 100);
      } else {
        admissionDiscountAmount = admissionCoupon.value;
      }
    }
    const finalAdmissionRate = Math.max(0, rateAdmission - admissionDiscountAmount);
    const admissionDue = student.admissionPaid ? 0 : finalAdmissionRate;

    // 2. Monthly Fees Due
    let joinDateObj;
    try {
      joinDateObj = new Date(student.joinDate);
      if (isNaN(joinDateObj.getTime())) {
        joinDateObj = new Date();
      }
    } catch (e) {
      joinDateObj = new Date();
    }

    const currentMonthStr = targetMonth || new Date().toISOString().slice(0, 7); // YYYY-MM
    let joinMonthStr = student.joinDate ? student.joinDate.slice(0, 7) : currentMonthStr; // YYYY-MM

    // Respect starting billing month (use later of joinMonthStr or startingBillingMonth)
    if (startingBillingMonth && startingBillingMonth > joinMonthStr) {
      joinMonthStr = startingBillingMonth;
    }

    const unpaidMonths = [];
    const paidMonthsList = [];

    // Loop through months from joinMonthStr to currentMonthStr
    let [joinYear, joinMonth] = joinMonthStr.split('-').map(Number);
    let [currYear, currMonth] = currentMonthStr.split('-').map(Number);

    if (joinYear && joinMonth && currYear && currMonth) {
      let tempYear = joinYear;
      let tempMonth = joinMonth;

      while (tempYear < currYear || (tempYear === currYear && tempMonth <= currMonth)) {
        const monthStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}`;
        const isPaid = student.paidMonths && student.paidMonths[monthStr];

        if (isPaid) {
          paidMonthsList.push(monthStr);
        } else {
          unpaidMonths.push(monthStr);
        }

        tempMonth++;
        if (tempMonth > 12) {
          tempMonth = 1;
          tempYear++;
        }
      }
    }

    const rateToUse = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null
      ? student.customMonthlyRate
      : monthlyFeeRate;
    const discountAmount = getStudentDiscount(student, rateToUse);
    const finalRate = Math.max(0, rateToUse - discountAmount);

    const monthlyDue = unpaidMonths.length * finalRate;
    const totalDue = admissionDue + monthlyDue;

    return {
      admissionDue,
      monthlyDue,
      totalDue,
      unpaidMonths,
      paidMonthsList
    };
  };

  const markFeePaid = (id, feeType) => {
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        let updated = { ...s };
        if (feeType === 'currentMonthPaid') {
          updated.paidMonths = { ...(s.paidMonths || {}), [feeMonth]: true };
        } else if (feeType === 'admissionPaid') {
          updated.admissionPaid = feeMonth;
        } else {
          updated[feeType] = true;
        }
        updatedStudent = updated;
        return updated;
      }
      return s;
    });

    setStudents(updatedStudentsList);
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(updatedStudent);
    }

    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error updating fee status:", err));
    }
  };

  const unmarkFeePaid = (id, feeType) => {
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        let updated = { ...s };
        if (feeType === 'currentMonthPaid') {
          const newPaidMonths = { ...s.paidMonths };
          delete newPaidMonths[feeMonth];
          updated.paidMonths = newPaidMonths;
        } else if (feeType === 'admissionPaid') {
          updated.admissionPaid = false;
        } else {
          updated[feeType] = false;
        }
        updatedStudent = updated;
        return updated;
      }
      return s;
    });

    setStudents(updatedStudentsList);
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(updatedStudent);
    }

    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error updating fee status:", err));
    }
  };

  const markFeePaidCustomMonth = (id, targetMonth) => {
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        let updated = { ...s };
        updated.paidMonths = { ...(s.paidMonths || {}), [targetMonth]: true };
        updatedStudent = updated;
        return updated;
      }
      return s;
    });

    setStudents(updatedStudentsList);
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(updatedStudent);
    }

    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error updating fee status:", err));
    }
  };

  const unmarkFeePaidCustomMonth = (id, targetMonth) => {
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        let updated = { ...s };
        const newPaidMonths = { ...s.paidMonths };
        delete newPaidMonths[targetMonth];
        updated.paidMonths = newPaidMonths;
        updatedStudent = updated;
        return updated;
      }
      return s;
    });

    setStudents(updatedStudentsList);
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(updatedStudent);
    }

    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error updating fee status:", err));
    }
  };

  const markAllFeesPaid = (id) => {
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        const fees = calculateStudentFees(s);
        const newPaidMonths = { ...(s.paidMonths || {}) };
        fees.unpaidMonths.forEach(m => {
          newPaidMonths[m] = true;
        });
        let updated = { ...s, paidMonths: newPaidMonths };
        updatedStudent = updated;
        return updated;
      }
      return s;
    });

    setStudents(updatedStudentsList);
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(updatedStudent);
    }

    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error updating fee status:", err));
    }
  };

  const markAllFeesUnpaid = (id) => {
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        let updated = { ...s, paidMonths: {} }; // Clear all paid months
        updatedStudent = updated;
        return updated;
      }
      return s;
    });

    setStudents(updatedStudentsList);
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(updatedStudent);
    }

    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error updating fee status:", err));
    }
  };

  const handleCouponBlur = (student, field, newCode) => {
    const code = newCode.trim().toUpperCase();

    // Validate the coupon code if one is entered
    if (code) {
      const resolved = resolveCouponCode(code);
      if (!resolved) {
        alert(`❌ Invalid coupon code: "${code}"`);
        return;
      }
    }

    let updated = { ...student };
    if (field === 'appliedCoupon') {
      updated.appliedCoupon = code;
      if (code) {
        const resolved = resolveCouponCode(code);
        updated.couponType = resolved.type;
        updated.couponValue = resolved.value;
        updated.discountPercentage = resolved.type === 'percentage' ? resolved.value : 0;
      } else {
        updated.couponType = 'percentage';
        updated.couponValue = 0;
        updated.discountPercentage = 0;
      }
    } else if (field === 'appliedAdmissionCoupon') {
      updated.appliedAdmissionCoupon = code;
    }

    // Update frontend state
    const updatedStudentsList = students.map(s => s.id === student.id ? updated : s);
    setStudents(updatedStudentsList);
    if (selectedStudent && selectedStudent.id === student.id) {
      setSelectedStudent(updated);
    }

    // Save to database
    fetch(`${API_BASE_URL}/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
      .then(res => res.json())
      .catch(err => console.error("Error updating coupon from table:", err));
  };

  const markAttendance = (studentId, status) => {
    const newDateRecords = {
      ...(attendanceRecords[markingDate] || {})
    };

    if (status === 'none') {
      delete newDateRecords[studentId];
    } else {
      newDateRecords[studentId] = status;
    }

    setAttendanceRecords(prev => ({
      ...prev,
      [markingDate]: newDateRecords
    }));

    fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: markingDate, records: newDateRecords })
    })
      .then(res => res.json())
      .catch(err => console.error("Error marking attendance:", err));
  };

  // --- Rebuilt Developer Panel Views ---
  const renderDevDashboard = () => {
    if (!devDashboardStats) {
      return <div style={{ color: '#8e8e93', padding: '2rem' }}>Loading dashboard diagnostics...</div>;
    }
    const { users, database, system, recentActivity, securityAlerts } = devDashboardStats;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Quick Stats Grid */}
        <div className="dev-grid">
          <div className="dev-card">
            <div className="dev-card-title"><Users size={16} color="#5e5ce6" /> Total Users</div>
            <div className="dev-stat-val">{users?.total || 0}</div>
            <div className="dev-stat-lbl">Registered Accounts</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title"><Activity size={16} color="#30d158" /> Active Sessions</div>
            <div className="dev-stat-val">{users?.sessions || 0}</div>
            <div className="dev-stat-lbl">{users?.active || 0} Online Users</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title"><Database size={16} color="#bf5af2" /> Database Status</div>
            <div className="dev-stat-val" style={{ color: database?.status === 'Connected' ? '#30d158' : '#ff453a' }}>
              {database?.status || 'Unknown'}
            </div>
            <div className="dev-stat-lbl">{database?.studentsCount || 0} Students enrolled</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title"><Cpu size={16} color="#0a84ff" /> Process Memory</div>
            <div className="dev-stat-val">{system?.memoryUsage || 'N/A'}</div>
            <div className="dev-stat-lbl">Heap memory used</div>
          </div>
        </div>

        {/* System & Database health details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Recent Audits */}
          <div className="dev-card">
            <div className="dev-card-header">
              <h4 className="dev-card-title"><History size={16} color="#ff9f0a" /> Recent Operations & Audits</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map(act => (
                  <div key={act._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{act.username || 'System'}</span>
                      <span style={{ color: '#8e8e93' }}>{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#d1d1d6' }}>
                      <span className="dev-badge dev-badge-gray" style={{ marginRight: '6px', fontSize: '0.65rem', padding: '2px 4px' }}>{act.eventType}</span>
                      {act.description}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#8e8e93', fontSize: '0.8rem' }}>No recent admin actions.</div>
              )}
            </div>
          </div>

          {/* Security alerts */}
          <div className="dev-card">
            <div className="dev-card-header">
              <h4 className="dev-card-title"><AlertTriangle size={16} color="#ff453a" /> Intrusion alerts & Failed Logins</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {securityAlerts && securityAlerts.length > 0 ? (
                securityAlerts.map(alert => (
                  <div key={alert._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: '#ff453a' }}>{alert.username || 'Unknown'}</span>
                      <span style={{ color: '#8e8e93' }}>{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#ff9f0a' }}>
                      <span className="dev-badge dev-badge-red" style={{ marginRight: '6px', fontSize: '0.65rem', padding: '2px 4px' }}>{alert.eventType}</span>
                      {alert.description} (IP: {alert.ipAddress})
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#8e8e93', fontSize: '0.8rem' }}>No security warnings detected.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDevUsers = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* User search */}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
            <input
              type="text"
              className="dev-input"
              placeholder="Search user accounts..."
              style={{ paddingLeft: '32px' }}
              value={devUserSearch}
              onChange={(e) => {
                setDevUserSearch(e.target.value);
                setDevUsersPage(1);
                loadDevUsers(1, e.target.value);
              }}
            />
          </div>
          <div style={{ color: '#8e8e93', fontSize: '0.85rem' }}>
            Found <strong>{devUsersTotalItems}</strong> registered user accounts
          </div>
        </div>

        {devUserFeedback && (
          <div className={`dev-banner dev-banner-${devUserFeedback.type}`}>
            {devUserFeedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {devUserFeedback.message}
          </div>
        )}

        <div className="dev-table-container">
          <table className="dev-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devUsers.length > 0 ? (
                devUsers.map(u => (
                  <tr key={u._id}>
                    <td
                      style={{ fontWeight: 600, color: '#30d158', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handleViewUserDetail(u._id)}
                      title="Click to view detailed user profile & audits"
                    >
                      {u.username}
                    </td>
                    <td>{u.email || 'N/A'}</td>
                    <td>
                      <span className={`dev-badge ${u.role === 'developer' ? 'dev-badge-blue' :
                        u.role === 'superadmin' ? 'dev-badge-yellow' :
                          u.role === 'branchadmin' ? 'dev-badge-green' : 'dev-badge-gray'
                        }`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`dev-badge ${u.status === 'Active' ? 'dev-badge-green' : 'dev-badge-red'}`}>{u.status || 'Active'}</span>
                      {u.isLocked && <span className="dev-badge dev-badge-red" style={{ marginLeft: '4px' }}>Locked</span>}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="dev-btn dev-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#30d158', color: '#000', border: 'none' }}
                          onClick={() => handleViewUserDetail(u._id)}
                        >
                          Details
                        </button>
                        <button
                          className="dev-btn dev-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => {
                            setDevUserEdit(u);
                            setDevUserEditForm({
                              username: u.username,
                              email: u.email || '',
                              role: u.role,
                              status: u.status || 'Active'
                            });
                          }}
                        >
                          Modify
                        </button>
                        {u.username !== 'developer' && u.username !== 'admin' && (
                          <button
                            className="dev-btn dev-btn-danger"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleDevUserSoftDelete(u._id)}
                          >
                            Soft Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#8e8e93', padding: '2rem' }}>No user accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {devUsersTotalPages > 1 && (
            <div className="dev-pagination">
              <span className="dev-pagination-info">Page {devUsersPage} of {devUsersTotalPages}</span>
              <div className="dev-pagination-btns">
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devUsersPage === 1}
                  onClick={() => {
                    const prev = devUsersPage - 1;
                    setDevUsersPage(prev);
                    loadDevUsers(prev, devUserSearch);
                  }}
                >
                  Previous
                </button>
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devUsersPage === devUsersTotalPages}
                  onClick={() => {
                    const next = devUsersPage + 1;
                    setDevUsersPage(next);
                    loadDevUsers(next, devUserSearch);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit User Modal Overlay */}
        {devUserEdit && (
          <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <div className="modal-content" style={{ maxWidth: '400px', background: '#0b0b14', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="panel-header">
                <h3 className="panel-title">Modify User Settings</h3>
                <button className="btn-icon" onClick={() => setDevUserEdit(null)}><X size={20} /></button>
              </div>
              <form onSubmit={handleDevUserSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Username</label>
                  <input
                    type="text"
                    className="dev-input"
                    value={devUserEditForm.username}
                    onChange={(e) => setDevUserEditForm({ ...devUserEditForm, username: e.target.value })}
                    required
                    disabled={devUserEdit.username === 'developer' || devUserEdit.username === 'admin'}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="dev-input"
                    value={devUserEditForm.email}
                    onChange={(e) => setDevUserEditForm({ ...devUserEditForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>User Role</label>
                  <select
                    className="dev-input"
                    value={devUserEditForm.role}
                    onChange={(e) => setDevUserEditForm({ ...devUserEditForm, role: e.target.value })}
                    disabled={devUserEdit.username === 'developer'}
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="developer">Developer</option>
                    <option value="branchadmin">Branch Admin</option>
                    <option value="trainer">Trainer</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Account Status</label>
                  <select
                    className="dev-input"
                    value={devUserEditForm.status}
                    onChange={(e) => setDevUserEditForm({ ...devUserEditForm, status: e.target.value })}
                    disabled={devUserEdit.username === 'developer'}
                  >
                    <option value="Active">Active / Enabled</option>
                    <option value="Disabled">Disabled</option>
                    <option value="SoftDeleted">Soft Deleted</option>
                  </select>
                </div>
                <div className="modal-actions" style={{ marginTop: '1rem' }}>
                  <button type="button" className="dev-btn dev-btn-secondary" onClick={() => setDevUserEdit(null)}>Cancel</button>
                  <button type="submit" className="dev-btn dev-btn-primary" disabled={devActionLoading}>
                    {devActionLoading ? 'Saving...' : 'Apply Modifications'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUserDetailModal = () => {
    if (!selectedUserDetail) return null;
    const { user, loginHistory, devices, ips, securityLogs, student, attendanceSummary, feeSummary } = selectedUserDetail;

    return (
      <div className="modal-overlay" style={{ zIndex: 1100 }}>
        <div className="modal-content" style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', background: '#0b0b14', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem', backgroundColor: '#30d158', color: '#000', fontWeight: 'bold' }}>
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 className="panel-title" style={{ fontSize: '1.2rem', margin: 0, color: '#fff' }}>{user.fullName || user.username}</h3>
                <span style={{ color: '#8e8e93', fontSize: '0.8rem' }}>Role: <span style={{ color: '#30d158' }}>{user.role}</span> | Status: <span style={{ color: user.status === 'Active' ? '#30d158' : '#ff453a' }}>{user.status}</span></span>
              </div>
            </div>
            <button className="btn-icon" onClick={() => setSelectedUserDetail(null)}><X size={24} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem', textAlign: 'left' }}>
            {/* Quick Actions / Controls */}
            <div className="dev-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security & Account Control Operations</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  className={`dev-btn ${user.status === 'Active' ? 'dev-btn-danger' : 'dev-btn-primary'}`}
                  style={{ fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer' }}
                  onClick={() => handleDevUserStatusToggle(user._id, user.status)}
                >
                  {user.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                </button>
                <button
                  className={`dev-btn ${user.isLocked ? 'dev-btn-primary' : 'dev-btn-danger'}`}
                  style={{ fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer' }}
                  onClick={() => handleDevUserLockToggle(user._id, user.isLocked)}
                >
                  {user.isLocked ? 'Unlock Account' : 'Lock Account'}
                </button>
                <button
                  className="dev-btn dev-btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer' }}
                  onClick={() => {
                    const newPass = prompt("Enter new password for this user:");
                    if (newPass) handleDevUserResetPassword(user._id, newPass);
                  }}
                >
                  Force Password Reset
                </button>
              </div>
            </div>

            {/* Grid of Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* Personal Info */}
              <div className="dev-card" style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Full Name: <strong style={{ color: '#fff', float: 'right' }}>{user.fullName || 'N/A'}</strong></div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Username: <strong style={{ color: '#fff', float: 'right' }}>{user.username}</strong></div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Email: <strong style={{ color: '#fff', float: 'right' }}>{user.email || 'N/A'}</strong></div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Phone: <strong style={{ color: '#fff', float: 'right' }}>{user.phone || 'N/A'}</strong></div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Employee/Admission ID: <strong style={{ color: '#fff', float: 'right' }}>{user.employeeId || 'N/A'}</strong></div>
                  <div>Password Changed At: <strong style={{ color: '#fff', float: 'right' }}>{user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}</strong></div>
                </div>
              </div>

              {/* Branch / Batch Info */}
              <div className="dev-card" style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch & Batch Mapping</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Branch Name: <strong style={{ color: '#fff', float: 'right' }}>{user.branch || 'N/A'}</strong></div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Batch Code: <strong style={{ color: '#fff', float: 'right' }}>{user.batch || 'N/A'}</strong></div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Account Created: <strong style={{ color: '#fff', float: 'right' }}>{new Date(user.createdAt).toLocaleDateString()}</strong></div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Account Locked: <strong style={{ color: user.isLocked ? '#ff453a' : '#30d158', float: 'right' }}>{user.isLocked ? 'Yes' : 'No'}</strong></div>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Login Count: <strong style={{ color: '#fff', float: 'right' }}>{user.loginCount || 0}</strong></div>
                  <div>Failed Attempts: <strong style={{ color: '#fff', float: 'right' }}>{user.failedAttempts || 0}</strong></div>
                </div>
              </div>

              {/* Student Summary (if applicable) */}
              {student && (
                <div className="dev-card" style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Profile Summary</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Belt Level: <strong style={{ color: '#fff', float: 'right' }}>{student.belt}</strong></div>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Admission Number: <strong style={{ color: '#fff', float: 'right' }}>{student.admissionNo}</strong></div>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Attendance: <strong style={{ float: 'right' }}><span style={{ color: '#30d158' }}>{attendanceSummary.present}P</span> / <span style={{ color: '#ff453a' }}>{attendanceSummary.absent}A</span> ({attendanceSummary.total} Total)</strong></div>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Fees Paid: <strong style={{ color: '#30d158', float: 'right' }}>₹{feeSummary.totalPaid}</strong></div>
                    <div>Total Payments: <strong style={{ color: '#fff', float: 'right' }}>{feeSummary.payments.length}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Login Device History */}
            <div className="dev-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Device Details History</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table className="dev-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Device Name</th>
                      <th>Device Type</th>
                      <th>Operating System</th>
                      <th>Browser</th>
                      <th>Resolution</th>
                      <th>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.length > 0 ? devices.map((d, idx) => (
                      <tr key={idx}>
                        <td style={{ color: '#fff', fontWeight: 600 }}>{d.deviceName}</td>
                        <td>{d.deviceType}</td>
                        <td>{d.osName} {d.osVersion}</td>
                        <td>{d.browserName} {d.browserVersion}</td>
                        <td>{d.screenResolution}</td>
                        <td>{new Date(d.lastUsed).toLocaleString()}</td>
                      </tr>
                    )) : <tr><td colSpan="6" style={{ textAlign: 'center', color: '#8e8e93', padding: '1rem' }}>No device records.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Login IP History */}
            <div className="dev-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client IP Address History</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table className="dev-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>IP Address</th>
                      <th>Login Hits</th>
                      <th>Last Login Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ips.length > 0 ? ips.map((ipObj, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'monospace', color: '#30d158', fontWeight: 600 }}>{ipObj.ip || 'Unknown'}</td>
                        <td>{ipObj.count} session(s)</td>
                        <td>{new Date(ipObj.lastUsed).toLocaleString()}</td>
                      </tr>
                    )) : <tr><td colSpan="3" style={{ textAlign: 'center', color: '#8e8e93', padding: '1rem' }}>No IP address logs.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Login Activity Logs */}
            <div className="dev-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Session Logs</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="dev-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>IP Address</th>
                      <th>Login Time</th>
                      <th>Logout Time</th>
                      <th>Session Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.length > 0 ? loginHistory.map((h, idx) => {
                      const durationStr = h.sessionDuration
                        ? `${Math.floor(h.sessionDuration / 60)}m ${h.sessionDuration % 60}s`
                        : (h.status === 'Success' && !h.logoutAt) ? 'Active Session' : 'N/A';
                      return (
                        <tr key={idx}>
                          <td>
                            <span className={`dev-badge ${h.status === 'Success' ? 'dev-badge-green' : 'dev-badge-red'}`}>
                              {h.status}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace' }}>{h.ipAddress}</td>
                          <td>{new Date(h.createdAt).toLocaleString()}</td>
                          <td>{h.logoutAt ? new Date(h.logoutAt).toLocaleString() : (h.status === 'Success' ? 'Online' : 'N/A')}</td>
                          <td>{durationStr}</td>
                        </tr>
                      );
                    }) : <tr><td colSpan="5" style={{ textAlign: 'center', color: '#8e8e93', padding: '1rem' }}>No login activity history.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Security Logs */}
            <div className="dev-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Security Logs</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table className="dev-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Description</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.length > 0 ? securityLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`dev-badge ${log.eventType === 'FailedLogin' ? 'dev-badge-red' : 'dev-badge-yellow'}`}>
                            {log.eventType}
                          </span>
                        </td>
                        <td>{log.description}</td>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    )) : <tr><td colSpan="3" style={{ textAlign: 'center', color: '#8e8e93', padding: '1rem' }}>No security events logged.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDevSessions = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: '#fff', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>Active User Sessions</h4>
          <button
            className="dev-btn dev-btn-danger"
            onClick={handleDevLogoutAllSessions}
            disabled={devActionLoading || devSessions.length <= 1}
          >
            Force Logout All Other Sessions
          </button>
        </div>

        {devSessionFeedback && (
          <div className={`dev-banner dev-banner-${devSessionFeedback.type}`}>
            {devSessionFeedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {devSessionFeedback.message}
          </div>
        )}

        <div className="dev-table-container">
          <table className="dev-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Device/Client Details</th>
                <th>IP Address</th>
                <th>Login Date & Time</th>
                <th>Active Token</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {devSessions.map(s => {
                const currentToken = getSessionToken();
                const isCurrent = s.token === currentToken;
                return (
                  <tr key={s._id} style={isCurrent ? { background: 'rgba(94, 92, 230, 0.05)' } : {}}>
                    <td style={{ fontWeight: 600, color: isCurrent ? '#5e5ce6' : '#fff' }}>
                      {s.username} {isCurrent && <span style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8 }}>(You)</span>}
                    </td>
                    <td>{parseClientDetails(s.userAgent, s.deviceName)}</td>
                    <td>{s.ipAddress}</td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', opacity: 0.6 }}>
                      {s.token ? s.token.substring(0, 12) + '...' : 'N/A'}
                    </td>
                    <td>
                      <button
                        className="dev-btn dev-btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        disabled={devActionLoading}
                        onClick={() => handleDevLogoutSession(s.token)}
                      >
                        {isCurrent ? 'Log Out' : 'Revoke'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {devSessionsTotalPages > 1 && (
            <div className="dev-pagination">
              <span className="dev-pagination-info">Page {devSessionsPage} of {devSessionsTotalPages}</span>
              <div className="dev-pagination-btns">
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devSessionsPage === 1}
                  onClick={() => {
                    const prev = devSessionsPage - 1;
                    setDevSessionsPage(prev);
                    loadDevSessions(prev);
                  }}
                >
                  Previous
                </button>
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devSessionsPage === devSessionsTotalPages}
                  onClick={() => {
                    const next = devSessionsPage + 1;
                    setDevSessionsPage(next);
                    loadDevSessions(next);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Login History */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: '#fff', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>Device Login History</h4>
            {devLoginHistory.length > 0 && (
              <button
                type="button"
                className="dev-btn dev-btn-secondary"
                style={{ padding: '4px 12px', fontSize: '0.75rem', color: '#ff453a', background: 'rgba(255, 69, 58, 0.08)', border: '1px solid rgba(255, 69, 58, 0.15)', cursor: 'pointer' }}
                onClick={handleClearAllLoginHistory}
              >
                Clear All History
              </button>
            )}
          </div>
          <div className="dev-table-container">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Device / Client</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devLoginHistory.length > 0 ? (
                  devLoginHistory.map(h => (
                    <tr key={h._id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{h.username}</td>
                      <td>{parseClientDetails(h.userAgent, h.deviceName)}</td>
                      <td>{h.ipAddress}</td>
                      <td>
                        <span className={`dev-badge ${h.status === 'Success' ? 'dev-badge-green' : 'dev-badge-red'}`}>{h.status}</span>
                      </td>
                      <td>{new Date(h.createdAt).toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="dev-btn dev-btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '0.7rem', color: '#ff453a', background: 'rgba(255, 69, 58, 0.05)', border: '1px solid rgba(255, 69, 58, 0.1)', cursor: 'pointer' }}
                          onClick={() => handleDeleteLoginHistory(h._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#8e8e93', padding: '2rem' }}>No login attempts catalogued.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {devLoginHistoryTotalPages > 1 && (
              <div className="dev-pagination">
                <span className="dev-pagination-info">Page {devLoginHistoryPage} of {devLoginHistoryTotalPages}</span>
                <div className="dev-pagination-btns">
                  <button
                    className="dev-btn dev-btn-secondary"
                    disabled={devLoginHistoryPage === 1}
                    onClick={() => {
                      const prev = devLoginHistoryPage - 1;
                      setDevLoginHistoryPage(prev);
                      loadDevLoginHistory(prev);
                    }}
                  >
                    Previous
                  </button>
                  <button
                    className="dev-btn dev-btn-secondary"
                    disabled={devLoginHistoryPage === devLoginHistoryTotalPages}
                    onClick={() => {
                      const next = devLoginHistoryPage + 1;
                      setDevLoginHistoryPage(next);
                      loadDevLoginHistory(next);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDevSecurity = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ margin: 0, color: '#fff', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>Security Audit & Intrusion Log</h4>
        <div className="dev-table-container">
          <table className="dev-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Operator</th>
                <th>Event Description</th>
                <th>IP Address</th>
                <th>Client Agent</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {devSecurityLogs.length > 0 ? (
                devSecurityLogs.map(l => (
                  <tr key={l._id}>
                    <td>
                      <span className={`dev-badge ${l.eventType === 'FailedLogin' ? 'dev-badge-red' :
                        l.eventType === 'RoleChange' ? 'dev-badge-yellow' :
                          l.eventType === 'SystemConfigUpdate' ? 'dev-badge-blue' : 'dev-badge-gray'
                        }`}>{l.eventType}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{l.username || 'System'}</td>
                    <td>{l.description}</td>
                    <td>{l.ipAddress}</td>
                    <td style={{ fontSize: '0.75rem', opacity: 0.7 }} title={l.userAgent}>
                      {parseClientDetails(l.userAgent, null)}
                    </td>
                    <td>{new Date(l.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#8e8e93', padding: '2rem' }}>No security events logged.</td>
                </tr>
              )}
            </tbody>
          </table>

          {devSecurityLogsTotalPages > 1 && (
            <div className="dev-pagination">
              <span className="dev-pagination-info">Page {devSecurityLogsPage} of {devSecurityLogsTotalPages}</span>
              <div className="dev-pagination-btns">
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devSecurityLogsPage === 1}
                  onClick={() => {
                    const prev = devSecurityLogsPage - 1;
                    setDevSecurityLogsPage(prev);
                    loadDevSecurityLogs(prev);
                  }}
                >
                  Previous
                </button>
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devSecurityLogsPage === devSecurityLogsTotalPages}
                  onClick={() => {
                    const next = devSecurityLogsPage + 1;
                    setDevSecurityLogsPage(next);
                    loadDevSecurityLogs(next);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDevLogs = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#8e8e93' }}>Level:</span>
            <select
              className="dev-input"
              style={{ width: '130px', padding: '0.35rem 0.55rem' }}
              value={devLogsType}
              onChange={(e) => {
                setDevLogsType(e.target.value);
                setDevAppLogsPage(1);
                loadDevAppLogs(1, e.target.value, devLogsSearch);
              }}
            >
              <option value="all">All Logs</option>
              <option value="info">Info Logs</option>
              <option value="warn">Warn Logs</option>
              <option value="error">Error Logs</option>
              <option value="auth">Auth Logs</option>
              <option value="api">API Logs</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#8e8e93', marginLeft: '10px' }}>Search:</span>
            <input
              type="text"
              className="dev-input"
              placeholder="Search console logs..."
              style={{ width: '250px', padding: '0.35rem 0.55rem' }}
              value={devLogsSearch}
              onChange={(e) => {
                setDevLogsSearch(e.target.value);
                setDevAppLogsPage(1);
                loadDevAppLogs(1, devLogsType, e.target.value);
              }}
            />
          </div>
          <div style={{ color: '#8e8e93', fontSize: '0.85rem' }}>
            Terminal Buffer Size: <strong>{devAppLogsTotalItems}</strong> records
          </div>
        </div>

        {/* Retro style terminal panel */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#8e8e93' }}>console-feed@masterfit: ~</span>
          </div>
          <div className="terminal-body">
            {devAppLogs.length > 0 ? (
              devAppLogs.map((log, idx) => (
                <div key={idx} className="terminal-row">
                  <span className="terminal-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`terminal-badge ${log.type || 'info'}`}>{log.type || 'info'}</span>
                  <span className={`terminal-msg ${log.type || 'info'}`}>{log.message}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#8e8e93', fontStyle: 'italic', textAlign: 'center', marginTop: '4rem' }}>
                -- Log stream is empty. Try triggering API endpoints to log events. --
              </div>
            )}
          </div>

          {devAppLogsTotalPages > 1 && (
            <div className="dev-pagination" style={{ background: '#020205', borderColor: 'rgba(255,255,255,0.05)' }}>
              <span className="dev-pagination-info">Page {devAppLogsPage} of {devAppLogsTotalPages}</span>
              <div className="dev-pagination-btns">
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devAppLogsPage === 1}
                  onClick={() => {
                    const prev = devAppLogsPage - 1;
                    setDevAppLogsPage(prev);
                    loadDevAppLogs(prev, devLogsType, devLogsSearch);
                  }}
                >
                  Previous
                </button>
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devAppLogsPage === devAppLogsTotalPages}
                  onClick={() => {
                    const next = devAppLogsPage + 1;
                    setDevAppLogsPage(next);
                    loadDevAppLogs(next, devLogsType, devLogsSearch);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDevSystem = () => {
    if (!devSystemStatus) {
      return <div style={{ color: '#8e8e93', padding: '2rem' }}>Acquiring system resource statuses...</div>;
    }
    const { databaseStatus, activeUsers, totalSessions, os: systemOs, process: systemProcess } = devSystemStatus;

    // Calculate OS load percentages (load avg)
    const load1 = systemOs?.cpuUsage && systemOs.cpuUsage[0] ? Math.round(systemOs.cpuUsage[0] * 100) : 12;
    const load5 = systemOs?.cpuUsage && systemOs.cpuUsage[1] ? Math.round(systemOs.cpuUsage[1] * 100) : 8;

    // Parse memory sizes in MB
    const rssVal = parseInt(systemProcess?.memoryUsage?.rss) || 0;
    const heapUsedVal = parseInt(systemProcess?.memoryUsage?.heapUsed) || 0;
    const heapTotalVal = parseInt(systemProcess?.memoryUsage?.heapTotal) || 0;

    // Dynamic calculations against 512 MB limits
    const rssPercent = Math.min(100, Math.max(0, Math.round((rssVal / 512) * 100)));
    const heapPercent = heapTotalVal > 0 ? Math.min(100, Math.max(0, Math.round((heapUsedVal / heapTotalVal) * 100))) : 0;
    
    const containerTotalMem = 512;
    const containerFreeMem = Math.max(0, containerTotalMem - rssVal);
    const containerUsedPercent = Math.min(100, Math.max(0, Math.round((rssVal / containerTotalMem) * 100)));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h4 style={{ margin: 0, color: '#fff', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>System Diagnostics & Host Performance</h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Node Process Metrics */}
          <div className="dev-card">
            <div className="dev-card-header">
              <h4 className="dev-card-title"><Cpu size={16} color="#bf5af2" /> Node.js Server Process</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#8e8e93' }}>Process Runtime Uptime</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                  {Math.floor(systemProcess?.uptime / 3600)}h {Math.floor((systemProcess?.uptime % 3600) / 60)}m {Math.floor(systemProcess?.uptime % 60)}s
                </div>
              </div>

              <div className="dev-progress-container">
                <div className="dev-progress-lbl">
                  <span>RSS Memory Allocation</span>
                  <span>{systemProcess?.memoryUsage?.rss} / 512 MB Limit</span>
                </div>
                <div className="dev-progress-bar">
                  <div className="dev-progress-fill fill-purple" style={{ width: `${rssPercent}%` }}></div>
                </div>
              </div>

              <div className="dev-progress-container">
                <div className="dev-progress-lbl">
                  <span>Heap Used / Heap Total</span>
                  <span>{systemProcess?.memoryUsage?.heapUsed} / {systemProcess?.memoryUsage?.heapTotal}</span>
                </div>
                <div className="dev-progress-bar">
                  <div className="dev-progress-fill fill-purple" style={{ width: `${heapPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* OS Environment Metrics */}
          <div className="dev-card">
            <div className="dev-card-header">
              <h4 className="dev-card-title"><HardDrive size={16} color="#0a84ff" /> Operating System & Host VM</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#8e8e93' }}>Platform OS</span>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '4px' }}>{systemOs?.platform} ({systemOs?.release})</div>
                </div>
                <div>
                  <span style={{ color: '#8e8e93' }}>Host System Uptime</span>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '4px' }}>
                    {Math.floor(systemOs?.uptime / 86400)}d {Math.floor((systemOs?.uptime % 86400) / 3600)}h
                  </div>
                </div>
              </div>

              <div className="dev-progress-container">
                <div className="dev-progress-lbl">
                  <span>CPU Load Average (1m / 5m)</span>
                  <span>{load1}% / {load5}%</span>
                </div>
                <div className="dev-progress-bar">
                  <div className="dev-progress-fill fill-blue" style={{ width: `${Math.max(5, load1)}%` }}></div>
                </div>
              </div>

              <div className="dev-progress-container">
                <div className="dev-progress-lbl">
                  <span>Free Memory / Total Memory</span>
                  <span>{containerFreeMem} MB Free of {containerTotalMem} MB</span>
                </div>
                <div className="dev-progress-bar">
                  <div className="dev-progress-fill fill-blue" style={{ width: `${containerUsedPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDevDatabase = () => {
    if (!devDatabaseInfo) {
      return <div style={{ color: '#8e8e93', padding: '2rem' }}>Retrieving collection sizes and raw MongoDB stats...</div>;
    }
    const { databaseName, dataSize, storageSize, collectionsCount, objectsCount, pingLatencyMs, collections } = devDatabaseInfo;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Core Stats */}
        <div className="dev-grid">
          <div className="dev-card">
            <div className="dev-card-title">Database Name</div>
            <div className="dev-stat-val" style={{ fontSize: '1.75rem' }}>{databaseName}</div>
            <div className="dev-stat-lbl">MongoDB Database</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title">Total Size / Storage</div>
            <div className="dev-stat-val" style={{ fontSize: '1.75rem' }}>{storageSize} / 512 MB</div>
            <div className="dev-stat-lbl">Storage utilization (Data: {dataSize})</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title">Record Objects Count</div>
            <div className="dev-stat-val" style={{ fontSize: '1.75rem' }}>{objectsCount} docs</div>
            <div className="dev-stat-lbl">In {collectionsCount} collections</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title">Ping Response Latency</div>
            <div className="dev-stat-val" style={{ fontSize: '1.75rem', color: pingLatencyMs > 100 ? '#ff9f0a' : '#30d158' }}>{pingLatencyMs} ms</div>
            <div className="dev-stat-lbl">Ping response latency</div>
          </div>
        </div>

        {/* Collections detailed list */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>Collection Statistics & Index Mappings</h4>
          <div className="dev-table-container">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Collection Name</th>
                  <th>Document Count</th>
                  <th>Data Size</th>
                  <th>Storage Size</th>
                  <th>Index Count</th>
                  <th>Mapped Indexes</th>
                </tr>
              </thead>
              <tbody>
                {collections && collections.map(col => (
                  <tr key={col.name}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{col.name}</td>
                    <td>{col.count}</td>
                    <td>{col.size}</td>
                    <td>{col.storageSize}</td>
                    <td>{col.indexCount}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                        {col.indexes && col.indexes.map(idx => (
                          <div key={idx.name} style={{ background: 'rgba(255,255,255,0.02)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.04)', display: 'inline-block', width: 'fit-content' }}>
                            <span style={{ fontWeight: 600, color: '#bf5af2' }}>{idx.name}</span>
                            {idx.unique && <span style={{ marginLeft: '4px', color: '#ff9f0a', fontWeight: 'bold' }}>(unique)</span>}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDevAudit = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Toolbar filter */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#8e8e93' }}>Filter Event:</span>
          <select
            className="dev-input"
            style={{ width: '200px', padding: '0.35rem 0.55rem' }}
            value={devAuditType}
            onChange={(e) => {
              setDevAuditType(e.target.value);
              setDevAuditLogsPage(1);
              loadDevAuditLogs(1, e.target.value);
            }}
          >
            <option value="">All Events (No logins)</option>
            <option value="DeveloperAudit">Developer audits</option>
            <option value="SystemConfigUpdate">System configs</option>
            <option value="RoleChange">Role changes</option>
            <option value="UserStatusUpdate">Account updates</option>
            <option value="SessionTermination">Session expiries</option>
          </select>
          <div style={{ flex: 1 }}></div>
          <div style={{ color: '#8e8e93', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Catalogued Events: <strong>{devAuditLogsTotalItems}</strong> records</span>
            {devAuditLogs.length > 0 && (
              <button
                type="button"
                className="dev-btn dev-btn-secondary"
                style={{ padding: '4px 12px', fontSize: '0.75rem', color: '#ff453a', background: 'rgba(255, 69, 58, 0.08)', border: '1px solid rgba(255, 69, 58, 0.15)', cursor: 'pointer' }}
                onClick={handleClearAllAuditLogs}
              >
                Clear All Audit Logs
              </button>
            )}
          </div>
        </div>

        <div className="dev-table-container">
          <table className="dev-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Operator User</th>
                <th>Operation Details</th>
                <th>IP Address</th>
                <th>Date & Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devAuditLogs.length > 0 ? (
                devAuditLogs.map(l => (
                  <tr key={l._id}>
                    <td>
                      <span className={`dev-badge ${l.eventType === 'DeveloperAudit' ? 'dev-badge-purple' :
                        l.eventType === 'SystemConfigUpdate' ? 'dev-badge-blue' :
                          l.eventType === 'RoleChange' ? 'dev-badge-yellow' : 'dev-badge-gray'
                        }`}>{l.eventType}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{l.username || 'System'}</td>
                    <td>{l.description}</td>
                    <td>{l.ipAddress}</td>
                    <td>{new Date(l.createdAt).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="dev-btn dev-btn-secondary"
                        style={{ padding: '2px 8px', fontSize: '0.7rem', color: '#ff453a', background: 'rgba(255, 69, 58, 0.05)', border: '1px solid rgba(255, 69, 58, 0.1)', cursor: 'pointer' }}
                        onClick={() => handleDeleteAuditLog(l._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#8e8e93', padding: '2rem' }}>No audit trail actions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>

          {devAuditLogsTotalPages > 1 && (
            <div className="dev-pagination">
              <span className="dev-pagination-info">Page {devAuditLogsPage} of {devAuditLogsTotalPages}</span>
              <div className="dev-pagination-btns">
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devAuditLogsPage === 1}
                  onClick={() => {
                    const prev = devAuditLogsPage - 1;
                    setDevAuditLogsPage(prev);
                    loadDevAuditLogs(prev, devAuditType);
                  }}
                >
                  Previous
                </button>
                <button
                  className="dev-btn dev-btn-secondary"
                  disabled={devAuditLogsPage === devAuditLogsTotalPages}
                  onClick={() => {
                    const next = devAuditLogsPage + 1;
                    setDevAuditLogsPage(next);
                    loadDevAuditLogs(next, devAuditType);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDevSettings = () => {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h4 style={{ margin: 0, color: '#fff', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
          System Control & Configuration Center
        </h4>



        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* LEFT COLUMN: System Config Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Announcement Management Section */}
            <div className="dev-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="dev-card-header">
                <h4 className="dev-card-title">
                  <Bell size={16} color="#5e5ce6" /> {editingNotificationId ? 'Edit Announcement' : 'Announcement Management'}
                </h4>
                {editingNotificationId && (
                  <button
                    type="button"
                    className="dev-btn dev-btn-secondary"
                    style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'rgba(255, 69, 58, 0.1)', cursor: 'pointer', border: '1px solid rgba(255, 69, 58, 0.2)' }}
                    onClick={() => {
                      setEditingNotificationId(null);
                      setAnnouncementForm({
                        title: '',
                        message: '',
                        type: 'general',
                        priority: 'medium',
                        branch: 'all',
                        batch: 'all',
                        targetUser: 'all',
                        expiryDate: '',
                        scheduledAt: '',
                        isScheduled: false
                      });
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {announcementSuccess && (
                <div className="dev-banner dev-banner-success" style={{ margin: '0.5rem 0' }}>
                  <span>{announcementSuccess}</span>
                </div>
              )}
              {announcementError && (
                <div className="dev-banner dev-banner-error" style={{ margin: '0.5rem 0' }}>
                  <span>{announcementError}</span>
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem' }}>Announcement Title</label>
                <input
                  type="text"
                  className="dev-input"
                  placeholder="e.g. Scheduled System Upgrade"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem' }}>Announcement Message</label>
                <textarea
                  className="dev-input"
                  style={{ minHeight: '85px', resize: 'vertical' }}
                  placeholder="Enter details of the update, system status, or announcement..."
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem' }}>Notification Type</label>
                  <select
                    className="dev-input"
                    value={announcementForm.type || 'general'}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="update">Update</option>
                    <option value="warning">Warning</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem' }}>Priority Level</label>
                  <select
                    className="dev-input"
                    value={announcementForm.priority || 'medium'}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>



              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem' }}>Target Specific Username</label>
                  <input
                    type="text"
                    className="dev-input"
                    placeholder="all or username"
                    value={announcementForm.targetUser || 'all'}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, targetUser: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem' }}>Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    className="dev-input"
                    value={announcementForm.expiryDate || ''}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!announcementForm.isScheduled}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, isScheduled: e.target.checked })}
                  />
                  <span>Schedule this announcement for later release</span>
                </label>

                {announcementForm.isScheduled && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem' }}>Release Date & Time</label>
                    <input
                      type="datetime-local"
                      className="dev-input"
                      value={announcementForm.scheduledAt || ''}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, scheduledAt: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                className="dev-btn dev-btn-primary"
                onClick={handleSaveAnnouncement}
                disabled={devActionLoading}
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                {devActionLoading ? 'Saving...' : (editingNotificationId ? 'Save Changes' : 'Publish Announcement')}
              </button>
            </div>

            {/* System Diagnostic Information */}
            <div className="dev-card">
              <div className="dev-card-header">
                <h4 className="dev-card-title">
                  <Cpu size={16} color="#bf5af2" /> System Diagnostics & Health Status
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ color: '#8e8e93', display: 'block', fontSize: '0.75rem' }}>Database Connection</span>
                    <strong style={{ color: devSystemStatus?.databaseStatus === 'Connected' ? '#30d158' : '#ff453a' }}>
                      {devSystemStatus?.databaseStatus === 'Connected' ? 'Connected & Active' : 'Disconnected'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#8e8e93', display: 'block', fontSize: '0.75rem' }}>System API Uptime</span>
                    <strong style={{ color: '#fff' }}>
                      {devSystemStatus?.process?.uptime ? `${Math.floor(devSystemStatus.process.uptime / 3600)}h ${Math.floor((devSystemStatus.process.uptime % 3600) / 60)}m` : 'N/A'}
                    </strong>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: '#8e8e93' }}>MongoDB Storage Space</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{devSystemStatus?.dbStorageSize || '0.00 MB'} / 512 MB Limit</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(1, (parseFloat(devSystemStatus?.dbStorageSize || '0') / 512) * 100))}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ff9f0a, #ffc700)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: '#8e8e93' }}>Render Server Memory (RAM)</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{devSystemStatus?.process?.memoryUsage?.rss || '0 MB'} / 512 MB Limit</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(1, (parseFloat(devSystemStatus?.process?.memoryUsage?.rss || '0') / 512) * 100))}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0a84ff, #64d2ff)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <span style={{ color: '#8e8e93', display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Server OS Platform / CPU Load</span>
                  <span style={{ color: '#fff', fontSize: '0.8rem' }}>
                    {devSystemStatus?.os?.platform || 'Linux'} ({devSystemStatus?.os?.release || 'Generic'}) • Load avg: {devSystemStatus?.os?.cpuUsage ? devSystemStatus.os.cpuUsage.map(l => l.toFixed(2)).join(', ') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Maintenance & Other Configurations */}
          <form onSubmit={handleDevSettingsSubmit} className="dev-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="dev-card-header" style={{ marginBottom: '0.5rem' }}>
              <h4 className="dev-card-title">
                <Settings size={16} color="#0a84ff" /> System Maintenance & Security
              </h4>
            </div>

            {/* Maintenance Mode Option */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>System Maintenance Scope Lockout</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  className="dev-input"
                  value={devSettings.maintenanceMode || 'none'}
                  onChange={(e) => setDevSettings({ ...devSettings, maintenanceMode: e.target.value })}
                  style={{
                    flex: 1,
                    borderColor:
                      devSettings.maintenanceMode === 'none' ? '#30d158' :
                        devSettings.maintenanceMode === 'all' ? '#ff453a' : '#ff9f0a',
                    color:
                      devSettings.maintenanceMode === 'none' ? '#30d158' :
                        devSettings.maintenanceMode === 'all' ? '#ff453a' : '#ff9f0a',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="none" style={{ color: '#fff', background: '#1c1c2e' }}>All Logins Open</option>
                  <option value="batch" style={{ color: '#fff', background: '#1c1c2e' }}>Batch Login Only</option>
                  <option value="branch" style={{ color: '#fff', background: '#1c1c2e' }}>Branch Login Only</option>
                  <option value="admin" style={{ color: '#fff', background: '#1c1c2e' }}>Admin Login Only</option>
                  <option value="all" style={{ color: '#fff', background: '#1c1c2e' }}>All Logins Except Developer</option>
                </select>
                <span className="badge" style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  background:
                    devSettings.maintenanceMode === 'none' ? 'rgba(48, 209, 88, 0.15)' :
                      devSettings.maintenanceMode === 'all' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 159, 10, 0.15)',
                  color:
                    devSettings.maintenanceMode === 'none' ? '#30d158' :
                      devSettings.maintenanceMode === 'all' ? '#ff453a' : '#ff9f0a',
                  border: `1px solid ${devSettings.maintenanceMode === 'none' ? 'rgba(48, 209, 88, 0.3)' :
                      devSettings.maintenanceMode === 'all' ? 'rgba(255, 69, 58, 0.3)' : 'rgba(255, 159, 10, 0.3)'
                    }`,
                  transition: 'all 0.3s ease'
                }}>
                  {devSettings.maintenanceMode === 'none' ? 'Fully Open' : 'System Locked'}
                </span>
              </div>
            </div>

            {/* Maintenance Start Time */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Maintenance Start Date & Time</label>
              <span style={{ fontSize: '0.725rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '6px' }}>
                Warning banners will show on landing/login pages prior to this schedule.
              </span>
              <input
                type="datetime-local"
                className="dev-input"
                value={toDatetimeLocal(devSettings.maintenanceStart)}
                onChange={(e) => setDevSettings({ ...devSettings, maintenanceStart: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </div>

            {/* Maintenance End Time */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Maintenance End Date & Time</label>
              <span style={{ fontSize: '0.725rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '6px' }}>
                Portal access will unlock automatically after this schedule.
              </span>
              <input
                type="datetime-local"
                className="dev-input"
                value={toDatetimeLocal(devSettings.maintenanceEnd)}
                onChange={(e) => setDevSettings({ ...devSettings, maintenanceEnd: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </div>







            {/* Session Timeout */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Auto-logout Inactivity Session Timeout (Minutes)</label>
              <input
                type="number"
                className="dev-input"
                value={devSettings.sessionTimeoutMinutes || ''}
                onChange={(e) => setDevSettings({ ...devSettings, sessionTimeoutMinutes: parseInt(e.target.value, 10) || 0 })}
                required
                min="1"
              />
            </div>

            {/* Minimum Password Length */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Minimum Password Character Limit</label>
              <input
                type="number"
                className="dev-input"
                value={devSettings.minPasswordLength || ''}
                onChange={(e) => setDevSettings({ ...devSettings, minPasswordLength: parseInt(e.target.value, 10) || 0 })}
                required
                min="4"
                max="32"
              />
            </div>

            {/* Failed Login Threshold */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Failed Login Attempt Lockout Threshold</label>
              <input
                type="number"
                className="dev-input"
                value={devSettings.failedLoginThreshold || ''}
                onChange={(e) => setDevSettings({ ...devSettings, failedLoginThreshold: parseInt(e.target.value, 10) || 0 })}
                required
                min="1"
              />
            </div>

            {/* Failed Login Block Duration */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Intruder Lockout Duration (Minutes)</label>
              <input
                type="number"
                className="dev-input"
                value={devSettings.failedLoginBlockTimeMinutes || ''}
                onChange={(e) => setDevSettings({ ...devSettings, failedLoginBlockTimeMinutes: parseInt(e.target.value, 10) || 0 })}
                required
                min="1"
              />
            </div>

            {/* Log Retention Limit */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Maximum Application Logs Buffer limit</label>
              <input
                type="number"
                className="dev-input"
                value={devSettings.logRetentionLimit || ''}
                onChange={(e) => setDevSettings({ ...devSettings, logRetentionLimit: parseInt(e.target.value, 10) || 0 })}
                required
                min="10"
                max="10000"
              />
            </div>

            <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1rem', textAlign: 'right' }}>
              <button type="submit" className="dev-btn dev-btn-primary" disabled={devActionLoading} style={{ width: '100%', justifyContent: 'center' }}>
                {devActionLoading ? 'Applying...' : 'Apply All System Configurations'}
              </button>
            </div>
          </form>

        </div>

        {/* Published Announcements Center */}
        <div className="dev-card" style={{ width: '100%', marginTop: '1rem' }}>
          <div className="dev-card-header">
            <h4 className="dev-card-title">
              <Bell size={16} color="#bf5af2" /> Published Announcements Center
            </h4>
          </div>

          {devNotifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8e8e93', fontSize: '0.9rem' }}>
              No announcements published yet.
            </div>
          ) : (
            <div className="dev-table-container" style={{ marginTop: '0.5rem' }}>
              <table className="dev-table">
                <thead>
                  <tr>
                    <th>Title & Sender</th>
                    <th>Type / Priority</th>
                    <th>Target Scope</th>
                    <th>Timing / Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devNotifications.map(n => {
                    const isExpired = n.expiryDate && new Date(n.expiryDate) < new Date();
                    const isFuture = n.isScheduled && n.scheduledAt && new Date(n.scheduledAt) > new Date();
                    let timingText = 'Sent Immediately';
                    let timingColor = '#30d158';
                    if (isFuture) {
                      timingText = `Scheduled: ${new Date(n.scheduledAt).toLocaleString()}`;
                      timingColor = '#ff9f0a';
                    } else if (n.scheduledAt) {
                      timingText = `Released: ${new Date(n.scheduledAt).toLocaleString()}`;
                      timingColor = '#30d158';
                    }
                    return (
                      <tr key={n._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#8e8e93' }}>By: {n.sender} • {new Date(n.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td>
                          <span className="badge" style={{
                            marginRight: '6px',
                            background: n.type === 'warning' || n.type === 'maintenance' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(10, 132, 255, 0.15)',
                            color: n.type === 'warning' || n.type === 'maintenance' ? '#ff453a' : '#0a84ff',
                            fontSize: '0.7rem'
                          }}>
                            {n.type}
                          </span>
                          <span className="badge" style={{
                            background: n.priority === 'high' ? 'rgba(255, 69, 58, 0.15)' : n.priority === 'medium' ? 'rgba(255, 159, 10, 0.15)' : 'rgba(48, 209, 88, 0.15)',
                            color: n.priority === 'high' ? '#ff453a' : n.priority === 'medium' ? '#ff9f0a' : '#30d158',
                            fontSize: '0.7rem'
                          }}>
                            {n.priority}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#d1d1d6' }}>
                          <div>Branch: <strong>{n.branch}</strong></div>
                          <div>Batch: <strong>{n.batch}</strong></div>
                          {n.targetUser && n.targetUser !== 'all' && (
                            <div>User: <strong style={{ color: '#bf5af2' }}>{n.targetUser}</strong></div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <div style={{ color: timingColor }}>{timingText}</div>
                          {n.expiryDate && (
                            <div style={{ color: isExpired ? '#ff453a' : '#8e8e93', marginTop: '2px' }}>
                              {isExpired ? 'Expired' : `Expires: ${new Date(n.expiryDate).toLocaleString()}`}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="dev-btn dev-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                              onClick={() => handleStartEditAnnouncement(n)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="dev-btn dev-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ff453a', background: 'rgba(255, 69, 58, 0.08)', border: '1px solid rgba(255, 69, 58, 0.15)', cursor: 'pointer' }}
                              onClick={() => handleDeleteNotification(n._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Locked Accounts Center */}
        <div className="dev-card" style={{ width: '100%', marginTop: '1rem' }}>
          <div className="dev-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            <h4 className="dev-card-title">
              <Lock size={16} color="#ff453a" /> Brute-Force Locked Accounts
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#8e8e93' }}>Locked out after excessive failed login attempts</span>
          </div>

          {lockedUsers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8e8e93', fontSize: '0.9rem' }}>
              No accounts are currently locked. System secure.
            </div>
          ) : (
            <div className="dev-table-container">
              <table className="dev-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Role</th>
                    <th>Mobile Number</th>
                    <th>Failed Attempts</th>
                    <th>Lock Status</th>
                    <th>Lock Date & Time</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lockedUsers.map(u => {
                    const isTempLocked = u.lockUntil && new Date(u.lockUntil) > new Date();
                    const lockStatusText = u.isLocked 
                      ? "Permanently Locked" 
                      : (isTempLocked ? `Temporarily Blocked` : "Active");
                    
                    return (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{u.username}</td>
                        <td>
                          <span className="dev-badge dev-badge-gray" style={{ textTransform: 'capitalize' }}>{u.role}</span>
                        </td>
                        <td>{u.phone || 'N/A'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: u.failedAttempts >= 10 ? '#ff453a' : '#ff9f0a' }}>
                          {u.failedAttempts}
                        </td>
                        <td>
                          <span className={`dev-badge ${u.isLocked ? 'dev-badge-purple' : (isTempLocked ? 'dev-badge-yellow' : 'dev-badge-blue')}`}>
                            {lockStatusText}
                          </span>
                        </td>
                        <td>{u.lockedAt ? new Date(u.lockedAt).toLocaleString() : (u.updatedAt ? new Date(u.updatedAt).toLocaleString() : 'N/A')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="dev-btn dev-btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'linear-gradient(135deg, #30d158, #28a745)', border: 'none', cursor: 'pointer' }}
                            onClick={() => {
                              if (confirm(`Are you sure you want to unlock user account "${u.username}"?`)) {
                                unlockUserAccount(u._id);
                              }
                            }}
                          >
                            <Unlock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Unlock Account
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    );
  };

  const renderDevHelpReports = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ margin: 0, color: '#fff', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>Help Reports & Support Tickets</h4>

        {devHelpReportsLoading ? (
          <div style={{ textAlign: 'center', color: '#8e8e93', padding: '3rem' }}>Loading support tickets...</div>
        ) : (
          <div className="dev-table-container">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Branch / Batch</th>
                  <th>Issue / Description</th>
                  <th>Device / Client</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devHelpReports.length > 0 ? (
                  devHelpReports.map(r => (
                    <tr key={r._id}>
                      <td>
                        <span className={`dev-badge ${r.status === 'Resolved' ? 'dev-badge-green' : 'dev-badge-red'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>
                        <div>{r.username}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 400 }}>{r.role}</div>
                      </td>
                      <td>
                        <div>{r.branch || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{r.batch || 'N/A'}</div>
                      </td>
                      <td style={{ maxWidth: '300px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                        <div>{r.issueDescription}</div>
                        {r.developerReply && (
                          <div style={{ fontSize: '0.8rem', color: '#51CF66', marginTop: '6px', background: 'rgba(81, 207, 102, 0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                            <strong>Reply: </strong>{r.developerReply}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.75rem', opacity: 0.7 }} title={r.userAgent}>
                        {parseClientDetails(r.userAgent, r.deviceName)}
                      </td>
                      <td>{r.ipAddress}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {r.status !== 'Resolved' ? (
                            <button
                              className="dev-btn dev-btn-primary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => { setDevResolvingTicketId(r._id); setDevResolutionReply(''); }}
                            >
                              Resolve
                            </button>
                          ) : (
                            <button
                              className="dev-btn dev-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleUpdateHelpStatus(r._id, 'Pending')}
                            >
                              Reopen
                            </button>
                          )}
                          <button
                            className="dev-btn dev-btn-danger"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleDeleteHelpReport(r._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: '#8e8e93', padding: '2rem' }}>No support tickets or help reports found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {devHelpReportsTotalPages > 1 && (
              <div className="dev-pagination">
                <span className="dev-pagination-info">Page {devHelpReportsPage} of {devHelpReportsTotalPages} (Total: {devHelpReportsTotalItems})</span>
                <div className="dev-pagination-btns">
                  <button
                    className="dev-btn dev-btn-secondary"
                    disabled={devHelpReportsPage === 1}
                    onClick={() => {
                      const prev = devHelpReportsPage - 1;
                      setDevHelpReportsPage(prev);
                      loadDevHelpReports(prev);
                    }}
                  >
                    Prev
                  </button>
                  <button
                    className="dev-btn dev-btn-secondary"
                    disabled={devHelpReportsPage === devHelpReportsTotalPages}
                    onClick={() => {
                      const next = devHelpReportsPage + 1;
                      setDevHelpReportsPage(next);
                      loadDevHelpReports(next);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDeveloperPanel = () => {
    return (
      <div className="dashboard-container developer-panel">

        {/* Developer Sidebar */}
        <aside className="dev-sidebar">
          <div className="dev-sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="dev-sidebar-logo">
              <Shield size={20} color="#5e5ce6" /> <span>MASTER</span><span>FIT</span><span>•</span><span>DEV</span>
            </div>
            <button
              className="dev-mobile-logout-btn"
              title="Console Logout"
              onClick={() => {
                const token = getSessionToken();
                if (token) {
                  fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                  }).catch(err => console.error(err));
                }
                clearSession();
                setLoggedInUser('');
                setAppMode('superadmin-login');
              }}
            >
              <LogOut size={20} />
            </button>
          </div>
          <nav className="dev-nav">
            <a className={`dev-nav-item ${devView === 'dashboard' ? 'active' : ''}`} onClick={() => setDevView('dashboard')}>
              <Cpu className="dev-nav-icon" /> <span>Dev Dashboard</span>
            </a>
            <a className={`dev-nav-item ${devView === 'users' ? 'active' : ''}`} onClick={() => setDevView('users')}>
              <Users className="dev-nav-icon" /> <span>User Accounts</span>
            </a>
            <a className={`dev-nav-item ${devView === 'sessions' ? 'active' : ''}`} onClick={() => setDevView('sessions')}>
              <Key className="dev-nav-icon" /> <span>Sessions & Devices</span>
            </a>
            <a className={`dev-nav-item ${devView === 'security' ? 'active' : ''}`} onClick={() => setDevView('security')}>
              <AlertTriangle className="dev-nav-icon" /> <span>Security Events</span>
            </a>
            <a className={`dev-nav-item ${devView === 'logs' ? 'active' : ''}`} onClick={() => setDevView('logs')}>
              <Terminal className="dev-nav-icon" /> <span>Console Logs</span>
            </a>
            <a className={`dev-nav-item ${devView === 'system' ? 'active' : ''}`} onClick={() => setDevView('system')}>
              <HardDrive className="dev-nav-icon" /> <span>System Monitoring</span>
            </a>
            <a className={`dev-nav-item ${devView === 'database' ? 'active' : ''}`} onClick={() => setDevView('database')}>
              <Database className="dev-nav-icon" /> <span>Database Catalog</span>
            </a>
            <a className={`dev-nav-item ${devView === 'audit' ? 'active' : ''}`} onClick={() => setDevView('audit')}>
              <History className="dev-nav-icon" /> <span>Audit Trail</span>
            </a>
            <a className={`dev-nav-item ${devView === 'settings' ? 'active' : ''}`} onClick={() => setDevView('settings')}>
              <Settings className="dev-nav-icon" /> <span>System Settings</span>
            </a>
            <a className={`dev-nav-item ${devView === 'help-reports' ? 'active' : ''}`} onClick={() => setDevView('help-reports')}>
              <MessageCircle className="dev-nav-icon" /> <span>Help Reports</span>
            </a>
          </nav>
          <div className="dev-sidebar-footer">
            <a className="dev-nav-item" style={{ padding: '0.75rem 0', color: '#ff453a' }} onClick={() => {
              const token = getSessionToken();
              if (token) {
                fetch(`${API_BASE_URL}/logout`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token })
                }).catch(err => console.error(err));
              }
              clearSession();
              setLoggedInUser('');
              setAppMode('superadmin-login');
            }}>
              <LogOut className="dev-nav-icon" style={{ color: '#ff453a' }} /> <span>Console Logout</span>
            </a>
          </div>
        </aside>

        {/* Developer Main Area */}
        <main className="dev-main">
          {isSystemUnderMaintenance && (
            <div className="maintenance-alert-banner-static" style={{ margin: '1.25rem 1.5rem 0 1.5rem', background: 'linear-gradient(90deg, #5e5ce6, #bf5af2)', animation: 'none' }}>
              <AlertTriangle size={18} className="pulse-icon" />
              <span>System Alert: Maintenance mode is active. Restricted to developers only.</span>
            </div>
          )}
          {isMaintenanceUpcoming && (
            <div className="maintenance-alert-banner-static" style={{ margin: '1.25rem 1.5rem 0 1.5rem', background: 'linear-gradient(90deg, #ff9f0a, #ffc700)', color: '#000', animation: 'none' }}>
              <AlertTriangle size={18} className="pulse-icon" />
              <span>Upcoming Maintenance: Portal login will be restricted from {formatMaintenanceTime(maintenanceStart)} to {formatMaintenanceTime(maintenanceEnd)}.</span>
            </div>
          )}

          {/* Header */}
          <header className="dev-header">
            <h1 className="dev-header-title">
              {devView === 'dashboard' && 'Developer Control Dashboard'}
              {devView === 'users' && 'User Accounts Administrator'}
              {devView === 'sessions' && 'Active Session & Device Manager'}
              {devView === 'security' && 'Security Center Operations'}
              {devView === 'logs' && 'In-Memory Application Logs'}
              {devView === 'system' && 'Performance & Resource Monitoring'}
              {devView === 'database' && 'MongoDB Collection Catalog'}
              {devView === 'audit' && 'System Operations Audit Trail'}
              {devView === 'settings' && 'System Configuration Settings'}
              {devView === 'help-reports' && 'Support Tickets & Help Reports'}
            </h1>
            <div className="dev-user-pill">
              <span style={{ color: '#8e8e93' }}>Role: Developer</span>
              <div className="dev-user-avatar">D</div>
              <span style={{ fontWeight: 600 }}>{loggedInUser}</span>
            </div>
          </header>

          {/* Body */}
          <div className="dev-body">
            {devView === 'dashboard' && renderDevDashboard()}
            {devView === 'users' && renderDevUsers()}
            {devView === 'sessions' && renderDevSessions()}
            {devView === 'security' && renderDevSecurity()}
            {devView === 'logs' && renderDevLogs()}
            {devView === 'system' && renderDevSystem()}
            {devView === 'database' && renderDevDatabase()}
            {devView === 'audit' && renderDevAudit()}
            {devView === 'settings' && renderDevSettings()}
            {devView === 'help-reports' && renderDevHelpReports()}
          </div>
          {renderUserDetailModal()}
          {devResolvingTicketId && (
            <div className="modal-overlay" style={{ zIndex: 1300 }}>
              <div className="modal-content help-modal" style={{ maxWidth: '450px' }}>
                <div className="panel-header" style={{ marginBottom: '1rem' }}>
                  <h2 className="panel-title" style={{ fontSize: '1.05rem' }}>Resolve Support Ticket</h2>
                  <button className="btn-icon" onClick={() => setDevResolvingTicketId(null)}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateHelpStatus(devResolvingTicketId, 'Resolved', devResolutionReply);
                  setDevResolvingTicketId(null);
                  setDevResolutionReply('');
                }}>
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#fff' }}>Resolution Message / Response for User</label>
                    <textarea
                      className="dev-input"
                      style={{ minHeight: '100px', resize: 'vertical' }}
                      required
                      placeholder="Explain what was fixed, or provide details of the resolution..."
                      value={devResolutionReply}
                      onChange={(e) => setDevResolutionReply(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="modal-actions" style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="dev-btn dev-btn-secondary"
                      onClick={() => setDevResolvingTicketId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="dev-btn dev-btn-primary"
                    >
                      Confirm Resolve
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

  // --- Public Website View ---
  const renderPublic = () => (
    <div className={`public-layout ${isMaintenanceUpcoming ? 'has-maintenance-banner' : ''}`}>
      {isMaintenanceUpcoming && (
        <div className="maintenance-alert-banner" style={{ zIndex: 1200, top: '0px' }}>
          <AlertTriangle size={18} className="pulse-icon" />
          <span>Upcoming Maintenance: Portal login will be restricted from {formatMaintenanceTime(maintenanceStart)} to {formatMaintenanceTime(maintenanceEnd)}.</span>
        </div>
      )}
      <nav className={`public-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => { window.scrollTo(0, 0); setIsMobileMenuOpen(false); }}>
          <span className="brand-accent">MASTER</span> FIT
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="#disciplines" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Disciplines</a>
          <a href="#instructors" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Instructors</a>
          <a href="#gallery" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Gallery</a>
          <a href="#contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline-primary" onClick={() => { setAppMode('login'); setIsMobileMenuOpen(false); }}>
              Login
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80" alt="Martial Arts" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-subtitle">Master Your Mind & Body</span>
          <h1 className="hero-title">MASTER FIT <span>Academy</span></h1>
          <p className="hero-desc">
            Train with elite instructors in a premium facility. Master Kung Fu, Karate, and Wushu, and embark on your journey from white to black belt.
          </p>
          <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
            Start Your Journey <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <section id="disciplines" className="section" style={{ background: '#050505' }}>
        <div className="section-header">
          <span className="section-subtitle">Our Specializations</span>
          <h2 className="section-title">Training Programs</h2>
        </div>
        <div className="disciplines-grid">
          <div className="discipline-card">
            <img src="/kungfu.png" alt="Kung Fu" className="discipline-img" />
            <div className="discipline-overlay"></div>
            <div className="discipline-info">
              <h3 className="discipline-title">Kung Fu</h3>
              <p className="discipline-desc">
                Develop exceptional agility, focus, and traditional forms. Master the flow of energy and strike with precision.
              </p>
            </div>
          </div>
          <div className="discipline-card">
            <img src="/karate.png" alt="Karate" className="discipline-img" />
            <div className="discipline-overlay"></div>
            <div className="discipline-info">
              <h3 className="discipline-title">Karate</h3>
              <p className="discipline-desc">
                Build self-discipline, speed, and raw power. Learn effective striking techniques, blocks, and core defensive patterns.
              </p>
            </div>
          </div>
          <div className="discipline-card">
            <img src="/wushu.png" alt="Wushu" className="discipline-img" />
            <div className="discipline-overlay"></div>
            <div className="discipline-info">
              <h3 className="discipline-title">Wushu</h3>
              <p className="discipline-desc">
                Combine acrobatics and martial arts. Learn high-flying jumps, fluid weapon routines, and dynamic performance elements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="instructors" className="section">
        <div className="section-header">
          <span className="section-subtitle">Learn from the best</span>
          <h2 className="section-title">Our Instructors</h2>
        </div>
        <div className="instructor-grid">
          <div className="instructor-card glass-panel">
            <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80" alt="Sensei" className="instructor-img" />
            <div className="instructor-info">
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Master Wei</h3>
              <p style={{ color: 'var(--color-primary)', margin: 0, fontWeight: 600 }}>8th Dan Black Belt</p>
            </div>
          </div>
          <div className="instructor-card glass-panel">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80" alt="Instructor" className="instructor-img" />
            <div className="instructor-info">
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Sarah Chen</h3>
              <p style={{ color: 'var(--color-primary)', margin: 0, fontWeight: 600 }}>5th Dan Black Belt</p>
            </div>
          </div>
          <div className="instructor-card glass-panel">
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80" alt="Coach" className="instructor-img" />
            <div className="instructor-info">
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Marcus Silva</h3>
              <p style={{ color: 'var(--color-primary)', margin: 0, fontWeight: 600 }}>Head Coach</p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="section" style={{ background: '#050505' }}>
        <div className="section-header">
          <span className="section-subtitle">Action Shots</span>
          <h2 className="section-title">Training Gallery</h2>
        </div>
        <div className="gallery-grid">
          <div className="gallery-item"><img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80" alt="Gallery 1" /></div>
          <div className="gallery-item"><img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80" alt="Gallery 2" /></div>
          <div className="gallery-item"><img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80" alt="Gallery 3" /></div>
          <div className="gallery-item"><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80" alt="Gallery 4" /></div>
        </div>
      </section>

      <section id="contact" className="section">
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }} className="glass-panel panel">
          <h2 className="section-title" style={{ fontSize: '2rem' }}>Ready to Start?</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Fill out the form below to schedule your free trial class.</p>
          <div className="grid-2-col" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" placeholder="Your Name" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" className="form-control" placeholder="Your Phone Number" />
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Send Registration Request</button>

          <div className="contact-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><Phone size={18} color="var(--color-primary)" /> 555-0199</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><MapPin size={18} color="var(--color-primary)" /> 123 Dojo Street</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>IG</span> @masterfit_academy</div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderYearCalendar = () => {
    const year = new Date().getFullYear();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return (
      <div className="year-calendar-container panel">
        <div className="panel-header" style={{ marginBottom: '2rem' }}>
          <h3 className="panel-title">{year} Full Year Calendar</h3>
          <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>Year: {year}</span>
        </div>
        <div className="year-calendar-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {monthNames.map((monthName, m) => {
            const firstDay = new Date(year, m, 1).getDay();
            const daysInMonth = new Date(year, m + 1, 0).getDate();

            const monthDays = [];
            // Empty slots for padding
            for (let i = 0; i < firstDay; i++) {
              monthDays.push(<div key={`empty-${m}-${i}`} className="mini-day empty" style={{ width: '32px', height: '32px' }}></div>);
            }

            // Days of the month
            for (let d = 1; d <= daysInMonth; d++) {
              const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayRecord = attendanceRecords[dateStr];

              let presentCount = 0;
              let totalMarked = 0;

              if (dayRecord) {
                Object.values(dayRecord).forEach(status => {
                  totalMarked++;
                  if (status === 'present') presentCount++;
                });
              }

              let cellStyle = {
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              };

              if (totalMarked > 0) {
                const ratio = presentCount / (students.length || 1);
                if (ratio >= 0.7) {
                  cellStyle.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                  cellStyle.borderColor = '#4CAF50';
                  cellStyle.color = '#4CAF50';
                } else {
                  cellStyle.backgroundColor = 'rgba(255, 152, 0, 0.2)';
                  cellStyle.borderColor = '#FF9800';
                  cellStyle.color = '#FF9800';
                }
              }

              if (dateStr === markingDate) {
                cellStyle.borderColor = 'var(--color-primary)';
                cellStyle.boxShadow = '0 0 8px rgba(229, 9, 20, 0.4)';
              }

              monthDays.push(
                <div
                  key={`day-${m}-${d}`}
                  className="mini-day"
                  style={cellStyle}
                  onClick={() => {
                    setMarkingDate(dateStr);
                    setCurrentDate(new Date(year, m, 1));
                    setAttendanceTab('monthly');
                  }}
                  title={totalMarked > 0 ? `Attendance: ${presentCount} present` : `No attendance marked`}
                >
                  {d}
                </div>
              );
            }

            return (
              <div key={monthName} className="mini-month-panel" style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', color: 'var(--color-text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', textAlign: 'left' }}>{monthName}</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  marginBottom: '4px'
                }}>
                  <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px'
                }}>
                  {monthDays}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Admin Dashboard View ---
  const renderAttendance = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayRecord = attendanceRecords[dateStr];

      let presentCount = 0;
      let absentCount = 0;
      let totalMarked = 0;

      if (dayRecord) {
        Object.values(dayRecord).forEach(status => {
          totalMarked++;
          const statusLower = String(status).toLowerCase();
          if (statusLower === 'present') presentCount++;
          else if (statusLower === 'absent') absentCount++;
        });
      }

      days.push(
        <div key={i} className={`calendar-day ${dateStr === markingDate ? 'today' : ''}`} onClick={() => setMarkingDate(dateStr)} style={{ cursor: 'pointer' }}>
          <div className="day-number">{i}</div>
          <div className="day-content">
            {totalMarked > 0 && (
              <div className="attendance-indicator" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="text-success" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle size={12} /> {presentCount}
                </span>
                <span className="text-danger" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <XCircle size={12} /> {absentCount}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="attendance-view">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className={`btn-primary ${attendanceTab === 'monthly' ? '' : 'btn-secondary'}`}
            style={attendanceTab === 'monthly' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
            onClick={() => setAttendanceTab('monthly')}
          >
            Monthly Dashboard
          </button>
          <button
            className={`btn-primary ${attendanceTab === 'year2026' ? '' : 'btn-secondary'}`}
            style={attendanceTab === 'year2026' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
            onClick={() => setAttendanceTab('year2026')}
          >
            {new Date().getFullYear()} Full Calendar
          </button>
        </div>

        {attendanceTab === 'monthly' ? (
          <>
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <h3 className="panel-title">Daily Attendance</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  {/* Branch Filter Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Branch:</span>
                    <select
                      className="form-control"
                      style={{ padding: '0.4rem 2rem 0.4rem 0.75rem', width: '160px', height: '36px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                      disabled={!isAdminUser(loggedInUser)}
                    >
                      {isAdminUser(loggedInUser) ? (
                        <>
                          {branches.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                          <option value="All">All Branches</option>
                        </>
                      ) : (
                        <option value={branchFilter}>{branchFilter}</option>
                      )}
                    </select>
                  </div>

                  {/* Batch Filter Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Batch:</span>
                    <select
                      className="form-control"
                      style={{ padding: '0.4rem 2rem 0.4rem 0.75rem', width: '160px', height: '36px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      disabled={isBatchAdminUser(loggedInUser)}
                    >
                      <option value="All">All Batches</option>
                      {getFilteredBatchOptions().map(opt => (
                        <option key={opt.id} value={opt.schedule}>{opt.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Date:</span>
                    <input
                      type="date"
                      className="form-control"
                      style={{ width: 'auto', padding: '0.4rem 0.75rem', height: '36px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                      value={markingDate}
                      onChange={(e) => setMarkingDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="filter-row" style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem' }}>Time:</span>
                <button className={`btn-small ${attendanceBatchFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('All')}>All</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Morning' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Morning')}>Morning</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Evening' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Evening')}>Evening</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Night' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Night')}>Night</button>
              </div>

              <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
                <table className="data-table responsive-table-cards">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Batch Info</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedStudents.filter(s => {
                      const isInactive = (s.status || 'Active') === 'Inactive';
                      if (isInactive) return false;
                      const matchBatch = attendanceBatchFilter === 'All' || s.batch === attendanceBatchFilter;
                      const matchSchedule = batchFilter === 'All' || s.schedule === batchFilter;
                      return matchBatch && matchSchedule;
                    }).map(student => {
                      const status = attendanceRecords[markingDate]?.[student.id];
                      return (
                        <tr key={student.id}>
                          <td
                            data-label="Student"
                            style={{ fontWeight: 500, color: '#E50914', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => handleSelectStudent(student)}
                          >
                            {student.name}
                          </td>
                          <td data-label="Batch Info"><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{getBatchNameFromSchedule(student.schedule)} • {student.batch}</span></td>
                          <td data-label="Status">
                            {status === 'present' && <span className="badge badge-green">Present</span>}
                            {status === 'absent' && <span className="badge badge-red">Absent</span>}
                            {!status && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Pending</span>}
                          </td>
                          <td data-label="Action">
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className={`btn-small ${status === 'present' ? 'btn-primary' : ''}`}
                                style={status === 'present' ? { backgroundColor: '#4CAF50', borderColor: '#4CAF50' } : {}}
                                onClick={() => markAttendance(student.id, status === 'present' ? 'none' : 'present')}
                              >
                                <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Present
                              </button>
                              <button
                                className={`btn-small ${status === 'absent' ? 'btn-primary' : ''}`}
                                style={status === 'absent' ? { backgroundColor: '#F44336', borderColor: '#F44336' } : {}}
                                onClick={() => markAttendance(student.id, status === 'absent' ? 'none' : 'absent')}
                              >
                                <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="calendar-container panel">
              <div className="calendar-header">
                <button className="btn-icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                  <ChevronLeft size={24} />
                </button>
                <h2 className="calendar-title" style={{ fontFamily: 'var(--font-heading)' }}>{monthNames[month]} {year}</h2>
                <button className="btn-icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                  <ChevronRight size={24} />
                </button>
              </div>
              <div className="calendar-grid-header">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div className="calendar-grid">
                {days}
              </div>
            </div>
          </>
        ) : (
          renderYearCalendar()
        )}
      </div>
    );
  };

  const renderFees = () => {
    const isPaid = (student) => student.paidMonths && student.paidMonths[feeMonth];

    const baseFeeStudents = searchedStudents.filter(s => (s.status || 'Active') !== 'Inactive');

    const filteredFeeStudents = baseFeeStudents.filter(s => {
      const matchBatch = feeBatchFilter === 'All' || s.batch === feeBatchFilter;
      const matchSchedule = batchFilter === 'All' || s.schedule === batchFilter;
      return matchBatch && matchSchedule;
    });

    const totalUnpaid = filteredFeeStudents.filter(s => !isPaid(s)).length;
    const totalPaid = filteredFeeStudents.filter(s => isPaid(s)).length;

    const monthlyCollected = filteredFeeStudents
      .filter(s => isPaid(s))
      .reduce((sum, s) => {
        const rateToUse = s.customMonthlyRate !== undefined && s.customMonthlyRate !== null
          ? s.customMonthlyRate
          : monthlyFeeRate;
        const discountAmount = getStudentDiscount(s, rateToUse);
        const finalRate = Math.max(0, rateToUse - discountAmount);
        return sum + finalRate;
      }, 0);
    const admissionCollected = filteredFeeStudents
      .filter(s => s.admissionPaid === feeMonth)
      .reduce((sum, s) => {
        const rateAdmission = s.customAdmissionRate !== undefined && s.customAdmissionRate !== null
          ? s.customAdmissionRate
          : admissionFeeRate;
        const admissionCoupon = resolveCouponCode(s.appliedAdmissionCoupon);
        let admissionDiscountAmount = 0;
        if (admissionCoupon) {
          if (admissionCoupon.type === 'percentage') {
            admissionDiscountAmount = Math.round(rateAdmission * admissionCoupon.value / 100);
          } else {
            admissionDiscountAmount = admissionCoupon.value;
          }
        }
        const finalAdmissionRate = Math.max(0, rateAdmission - admissionDiscountAmount);
        return sum + finalAdmissionRate;
      }, 0);
    const totalCollected = monthlyCollected + admissionCollected;

    return (
      <div className="fees-container">
        {/* Month Selector Header */}
        <div className="panel panel-header-flex" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="panel-title" style={{ margin: 0 }}>Fee Management</h2>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => {
              const defaultBranch = getLoggedInUserBranch();
              setNewStudent(prev => ({ ...prev, branch: defaultBranch }));
              setIsAddModalOpen(true);
            }}>
              <UserPlus size={14} /> Add Student
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Select Month:</span>
            <input
              type="month"
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              value={feeMonth}
              onChange={(e) => setFeeMonth(e.target.value)}
            />
          </div>
        </div>

        {/* Global Fee Rates Config */}
        {isAdminUser(loggedInUser) && (
          <div className="panel" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-light)', fontFamily: 'var(--font-heading)' }}>Configure Fee Amounts</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Set global admission and monthly rates</p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Admission Fee Rate Control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Admission Fee:</span>
                <strong style={{ fontSize: '1rem', color: '#FFD700', minWidth: '60px', textAlign: 'center' }}>₹{admissionFeeRate}</strong>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    type="button"
                    className="btn-small"
                    style={{ padding: '0.25rem 0.5rem', minWidth: '30px' }}
                    onClick={() => {
                      const newRate = Math.max(0, admissionFeeRate - 100);
                      setAdmissionFeeRate(newRate);
                      updateFeeRatesInDB(monthlyFeeRate, newRate);
                    }}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    className="btn-small"
                    style={{ padding: '0.25rem 0.5rem', minWidth: '30px' }}
                    onClick={() => {
                      const newRate = admissionFeeRate + 100;
                      setAdmissionFeeRate(newRate);
                      updateFeeRatesInDB(monthlyFeeRate, newRate);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Monthly Fee Rate Control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Monthly Fee:</span>
                <strong style={{ fontSize: '1rem', color: '#4CAF50', minWidth: '60px', textAlign: 'center' }}>₹{monthlyFeeRate}</strong>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    type="button"
                    className="btn-small"
                    style={{ padding: '0.25rem 0.5rem', minWidth: '30px' }}
                    onClick={() => {
                      const newRate = Math.max(0, monthlyFeeRate - 100);
                      setMonthlyFeeRate(newRate);
                      updateFeeRatesInDB(newRate, admissionFeeRate);
                    }}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    className="btn-small"
                    style={{ padding: '0.25rem 0.5rem', minWidth: '30px' }}
                    onClick={() => {
                      const newRate = monthlyFeeRate + 100;
                      setMonthlyFeeRate(newRate);
                      updateFeeRatesInDB(newRate, admissionFeeRate);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unified Fee Student List Panel */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Fee Details ({formatMonthName(feeMonth)})</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span className="badge badge-green">{totalPaid} Paid Monthly</span>
              <span className="badge badge-orange">{totalUnpaid} Pending Monthly</span>
            </div>
          </div>

          <div className="filter-row" style={{ marginBottom: (!userRole || (userRole !== 'trainer' && userRole !== 'coordinator')) ? '0.75rem' : '1.5rem', marginTop: '1.25rem', paddingBottom: '0.25rem' }}>
            <span style={{ color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem' }}>Time:</span>
            <button className={`btn-small ${feeBatchFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('All')}>All</button>
            <button className={`btn-small ${feeBatchFilter === 'Morning' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Morning')}>Morning</button>
            <button className={`btn-small ${feeBatchFilter === 'Evening' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Evening')}>Evening</button>
            <button className={`btn-small ${feeBatchFilter === 'Night' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Night')}>Night</button>
          </div>



          <div className="stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="stat-card" style={{ borderLeft: '4px solid #E50914', padding: '1.5rem' }}>
              <div className="stat-details">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Monthly Fees Collected</h3>
                <p className="stat-value" style={{ fontSize: '1.5rem', color: '#E50914' }}>₹{monthlyCollected}</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #FFD700', padding: '1.5rem' }}>
              <div className="stat-details">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Admission Fees Collected</h3>
                <p className="stat-value" style={{ fontSize: '1.5rem', color: '#FFD700' }}>₹{admissionCollected}</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #4CAF50', padding: '1.5rem' }}>
              <div className="stat-details">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Collected</h3>
                <p className="stat-value" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>₹{totalCollected}</p>
              </div>
            </div>
          </div>

          {filteredFeeStudents.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table responsive-table-cards">
                <thead>
                  <tr>
                    <th>Student</th>
                    {isAdminUser(loggedInUser) && <th>Branch</th>}
                    <th>Batch Time</th>
                    <th style={{ textAlign: 'center' }}>Admission (₹{admissionFeeRate})</th>
                    <th style={{ textAlign: 'center' }}>Admission Coupon</th>
                    <th style={{ textAlign: 'center' }}>Monthly ({formatMonthName(feeMonth)})</th>
                    <th style={{ textAlign: 'center' }}>Monthly Coupon</th>
                    <th style={{ textAlign: 'center' }}>Fee Details</th>
                    <th style={{ textAlign: 'center' }}>Outstanding Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeStudents.map(student => {
                    const feeDetails = calculateStudentFees(student, feeMonth);
                    return (
                      <tr key={student.id}>
                        <td data-label="Student">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{ fontWeight: 500, color: '#E50914', cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={() => handleSelectStudent(student)}
                            >
                              {student.name}
                            </div>
                            <button
                              onClick={() => {
                                setFeeEditingStudent(student);
                                setCustomRateInput(student.customMonthlyRate !== undefined && student.customMonthlyRate !== null ? student.customMonthlyRate : '');
                                setCustomAdmissionInput(student.customAdmissionRate !== undefined && student.customAdmissionRate !== null ? student.customAdmissionRate : '');
                                setCustomStartMonth(student.joinDate ? student.joinDate.slice(0, 7) : new Date().toISOString().slice(0, 7));
                                setCouponInput(student.appliedCoupon || '');
                                setAdmissionCouponInput(student.appliedAdmissionCoupon || '');
                                let activeMsg = '';
                                if (student.appliedCoupon) {
                                  const resolved = resolveCouponCode(student.appliedCoupon);
                                  if (resolved) {
                                    const display = resolved.type === 'amount' ? `₹${resolved.value}` : `${resolved.value}%`;
                                    activeMsg = `Active: ${student.appliedCoupon} (${display} Off)`;
                                  } else {
                                    const type = student.couponType || 'percentage';
                                    const val = student.couponValue !== undefined ? student.couponValue : (student.discountPercentage || 0);
                                    const display = type === 'amount' ? `₹${val}` : `${val}%`;
                                    activeMsg = `Active: ${student.appliedCoupon} (${display} Off)`;
                                  }
                                }
                                setCouponMessage(activeMsg);

                                let activeAdmMsg = '';
                                if (student.appliedAdmissionCoupon) {
                                  const resolved = resolveCouponCode(student.appliedAdmissionCoupon);
                                  if (resolved) {
                                    const display = resolved.type === 'amount' ? `₹${resolved.value}` : `${resolved.value}%`;
                                    activeAdmMsg = `Active: ${student.appliedAdmissionCoupon} (${display} Off)`;
                                  }
                                }
                                setAdmissionCouponMessage(activeAdmMsg);
                                setIsFeeEditModalOpen(true);
                              }}
                              className="btn-icon"
                              style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'color 0.15s ease' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#FFD700'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                              title="Customize Fees & Coupon"
                            >
                              <Settings size={13} />
                            </button>
                          </div>
                        </td>
                        {isAdminUser(loggedInUser) && (
                          <td data-label="Branch">
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{student.branch}</span>
                          </td>
                        )}
                        <td data-label="Batch Time"><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{getBatchNameFromSchedule(student.schedule)} • {student.batch}</span></td>
                        <td data-label="Admission" style={{ textAlign: 'center' }}>
                          <select
                            value={student.admissionPaid ? "paid" : "pending"}
                            onChange={(e) => {
                              if (e.target.value === 'paid') {
                                markFeePaid(student.id, 'admissionPaid');
                              } else {
                                unmarkFeePaid(student.id, 'admissionPaid');
                              }
                            }}
                            className="form-control"
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.8rem',
                              width: '95px',
                              background: student.admissionPaid ? 'rgba(76, 175, 80, 0.12)' : 'rgba(229, 9, 20, 0.12)',
                              color: student.admissionPaid ? '#51CF66' : '#FF6B6B',
                              border: `1px solid ${student.admissionPaid ? 'rgba(76, 175, 80, 0.3)' : 'rgba(229, 9, 20, 0.3)'}`,
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              textAlign: 'center',
                              outline: 'none'
                            }}
                          >
                            <option value="paid" style={{ background: '#181818', color: '#51CF66' }}>Paid</option>
                            <option value="pending" style={{ background: '#181818', color: '#FF6B6B' }}>Pending</option>
                          </select>
                        </td>
                        <td data-label="Admission Coupon" style={{ textAlign: 'center' }}>
                          <input
                            type="text"
                            defaultValue={student.appliedAdmissionCoupon || ''}
                            key={student.id + '_adm_' + (student.appliedAdmissionCoupon || '')}
                            placeholder="Code"
                            className="form-control"
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.8rem',
                              width: '90px',
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '20px',
                              color: 'white',
                              outline: 'none'
                            }}
                            onBlur={(e) => {
                              if (e.target.value !== (student.appliedAdmissionCoupon || '')) {
                                handleCouponBlur(student, 'appliedAdmissionCoupon', e.target.value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                          />
                        </td>
                        <td data-label="Monthly Fee" style={{ textAlign: 'center' }}>
                          <select
                            value={isPaid(student) ? "paid" : "pending"}
                            onChange={(e) => {
                              if (e.target.value === 'paid') {
                                markFeePaid(student.id, 'currentMonthPaid');
                              } else {
                                unmarkFeePaid(student.id, 'currentMonthPaid');
                              }
                            }}
                            className="form-control"
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.8rem',
                              width: '95px',
                              background: isPaid(student) ? 'rgba(76, 175, 80, 0.12)' : 'rgba(229, 9, 20, 0.12)',
                              color: isPaid(student) ? '#51CF66' : '#FF6B6B',
                              border: `1px solid ${isPaid(student) ? 'rgba(76, 175, 80, 0.3)' : 'rgba(229, 9, 20, 0.3)'}`,
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              textAlign: 'center',
                              outline: 'none'
                            }}
                          >
                            <option value="paid" style={{ background: '#181818', color: '#51CF66' }}>Paid</option>
                            <option value="pending" style={{ background: '#181818', color: '#FF6B6B' }}>Pending</option>
                          </select>
                        </td>
                        <td data-label="Monthly Coupon" style={{ textAlign: 'center' }}>
                          <input
                            type="text"
                            defaultValue={student.appliedCoupon || ''}
                            key={student.id + '_mly_' + (student.appliedCoupon || '')}
                            placeholder="Code"
                            className="form-control"
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.8rem',
                              width: '90px',
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '20px',
                              color: 'white',
                              outline: 'none'
                            }}
                            onBlur={(e) => {
                              if (e.target.value !== (student.appliedCoupon || '')) {
                                handleCouponBlur(student, 'appliedCoupon', e.target.value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                          />
                        </td>
                        <td data-label="Fee Details" style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-block' }}>
                            {feeDetails.unpaidMonths.length === 0 && feeDetails.paidMonthsList.length === 0 ? (
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No record</span>
                            ) : (
                              <button
                                className="btn-small"
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.8rem',
                                  background: feeDetails.unpaidMonths.length > 0 ? 'rgba(229, 9, 20, 0.12)' : 'rgba(76, 175, 80, 0.12)',
                                  color: feeDetails.unpaidMonths.length > 0 ? '#FF6B6B' : '#51CF66',
                                  border: `1px solid ${feeDetails.unpaidMonths.length > 0 ? 'rgba(229, 9, 20, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
                                  borderRadius: '20px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  transition: 'all 0.15s ease'
                                }}
                                onClick={() => {
                                  setFeeDetailsStudentId(student.id);
                                  setCurrentView('student-fees');
                                }}
                              >
                                {feeDetails.unpaidMonths.length > 0
                                  ? `Pending (${feeDetails.unpaidMonths.length}m)`
                                  : 'All Paid ✓'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td data-label="Outstanding Dues" style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                            {feeDetails.totalDue > 0 ? (
                              <>
                                <span style={{
                                  fontWeight: 600,
                                  color: '#FF6B6B',
                                  fontSize: '0.85rem',
                                  background: 'rgba(229, 9, 20, 0.12)',
                                  padding: '3px 9px',
                                  borderRadius: '20px',
                                  border: '1px solid rgba(229, 9, 20, 0.25)',
                                  display: 'inline-block'
                                }}>
                                  ₹{feeDetails.totalDue}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                  Adm: ₹{feeDetails.admissionDue} | Mly: ₹{feeDetails.monthlyDue}
                                </span>
                              </>
                            ) : (
                              <>
                                <span style={{
                                  fontWeight: 600,
                                  color: '#51CF66',
                                  fontSize: '0.85rem',
                                  background: 'rgba(76, 175, 80, 0.12)',
                                  padding: '3px 9px',
                                  borderRadius: '20px',
                                  border: '1px solid rgba(76, 175, 80, 0.25)',
                                  display: 'inline-block'
                                }}>
                                  ₹0
                                </span>
                                <span style={{ fontSize: '0.68rem', color: 'rgba(76, 175, 80, 0.7)', marginTop: '4px' }}>
                                  Settled
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              No students found for this month and selection filters.
            </div>
          )}
        </div>
      </div>
    );
  };

  const getMonthsList = (student) => {
    if (!student) return [];

    const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const joinMonthStr = student.joinDate ? student.joinDate.slice(0, 7) : currentMonthStr;

    const list = [];
    let [joinYear, joinMonth] = joinMonthStr.split('-').map(Number);
    let [currYear, currMonth] = currentMonthStr.split('-').map(Number);

    if (joinYear && joinMonth && currYear && currMonth) {
      let tempYear = joinYear;
      let tempMonth = joinMonth;

      while (tempYear < currYear || (tempYear === currYear && tempMonth <= currMonth)) {
        const monthStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}`;
        const isPaid = student.paidMonths && student.paidMonths[monthStr];
        list.push({
          monthStr,
          isPaid: !!isPaid
        });

        tempMonth++;
        if (tempMonth > 12) {
          tempMonth = 1;
          tempYear++;
        }
      }
    }
    return list;
  };

  const renderStudentFees = () => {
    const student = students.find(s => s.id === feeDetailsStudentId);
    if (!student) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Student not found.</p>
          <button className="btn-primary" onClick={() => setCurrentView('fees')}>Back to Fees</button>
        </div>
      );
    }

    const months = getMonthsList(student);
    const unpaidCount = months.filter(m => !m.isPaid).length;
    const paidCount = months.filter(m => m.isPaid).length;

    const rateToUse = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null
      ? student.customMonthlyRate
      : monthlyFeeRate;
    const discountAmount = getStudentDiscount(student, rateToUse);
    const finalRate = Math.max(0, rateToUse - discountAmount);

    return (
      <div className="fees-details-view animate-fade-in">
        {/* Back Button and Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px' }}
            onClick={() => setCurrentView('fees')}
          >
            <ChevronLeft size={16} /> Back to Fees
          </button>
          <h2 className="panel-title" style={{ margin: 0 }}>Fee History & Details</h2>
        </div>

        {/* Student Details Card */}
        <div className="panel" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#E50914', fontFamily: 'var(--font-heading)' }}>{student.name}</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Branch: <strong>{student.branch}</strong> • Batch: <strong>{getBatchNameFromSchedule(student.schedule)} • {student.batch}</strong>
            </p>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Joined: <strong>{student.joinDate}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Monthly Rate</span>
              <strong style={{ fontSize: '1.2rem', color: '#4CAF50' }}>₹{finalRate}</strong>
              {student.customMonthlyRate && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>(Customized)</span>}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Status Summary</span>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <span className="badge badge-green" style={{ padding: '2px 8px' }}>{paidCount} Paid</span>
                <span className="badge badge-red" style={{ padding: '2px 8px' }}>{unpaidCount} Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Months Roster Grid */}
        <div className="panel">
          <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 className="panel-title" style={{ margin: 0 }}>Month-by-Month Fees</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Click any button below to toggle the payment status. Changes are saved immediately.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {unpaidCount > 0 && (
                <button
                  className="btn-primary"
                  style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '20px',
                    background: '#4CAF50',
                    borderColor: '#4CAF50',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                  }}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to mark all ${unpaidCount} pending months as paid?`)) {
                      markAllFeesPaid(student.id);
                    }
                  }}
                >
                  <CheckCircle size={14} /> Mark All Paid
                </button>
              )}
              {paidCount > 0 && (
                <button
                  className="btn-secondary"
                  style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '20px',
                    background: 'rgba(229, 9, 20, 0.15)',
                    borderColor: 'rgba(229, 9, 20, 0.3)',
                    color: '#FF6B6B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(229, 9, 20, 0.1)'
                  }}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to mark all ${paidCount} paid months as unpaid?`)) {
                      markAllFeesUnpaid(student.id);
                    }
                  }}
                >
                  <XCircle size={14} /> Mark All Unpaid
                </button>
              )}
            </div>
          </div>

          {months.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              No month history found (Check student join date).
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1.25rem'
            }}>
              {months.map(({ monthStr, isPaid }) => {
                return (
                  <div
                    key={monthStr}
                    style={{
                      background: isPaid ? 'rgba(76, 175, 80, 0.04)' : 'rgba(229, 9, 20, 0.04)',
                      border: `1px solid ${isPaid ? 'rgba(76, 175, 80, 0.2)' : 'rgba(229, 9, 20, 0.2)'}`,
                      borderRadius: '12px',
                      padding: '1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      boxShadow: isPaid ? 'none' : '0 4px 12px rgba(229, 9, 20, 0.05)'
                    }}
                  >
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                      {formatMonthName(monthStr)}
                    </div>
                    <div>
                      {isPaid ? (
                        <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '20px' }}>Paid ✓</span>
                      ) : (
                        <span className="badge badge-red" style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '20px' }}>Pending</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (isPaid) {
                          unmarkFeePaidCustomMonth(student.id, monthStr);
                        } else {
                          markFeePaidCustomMonth(student.id, monthStr);
                        }
                      }}
                      className="btn-small"
                      style={{
                        width: '100%',
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        background: isPaid ? 'rgba(255,255,255,0.05)' : '#4CAF50',
                        color: isPaid ? '#FF8787' : 'white',
                        border: isPaid ? '1px solid rgba(255,255,255,0.1)' : '1px solid #4CAF50',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'center'
                      }}
                    >
                      {isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPerformance = () => (
    <div className="performance-view">
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
          <h3 className="panel-title">Academy Performance</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Award className="stat-icon" /></div>
            <div className="stat-details">
              <h3>Next Grading Event</h3>
              <p className="stat-value text-blue" style={{ color: '#FFD700' }}>June 15</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Activity className="stat-icon" /></div>
            <div className="stat-details">
              <h3>Avg Academy Attendance</h3>
              <p className="stat-value" style={{ color: '#4CAF50' }}>88%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Student Tracking</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table responsive-table-cards">
            <thead>
              <tr>
                <th>Name</th>
                <th>Belt Level</th>
                <th>Batch</th>
                <th>Skill Score</th>
                <th>Progress to Next Belt</th>
                <th>Contact / Operations</th>
              </tr>
            </thead>
            <tbody>
              {searchedStudents.map(student => (
                <tr key={student.id}>
                  <td data-label="Name" onClick={() => handleSelectStudent(student)} style={{ fontWeight: 500, color: '#E50914', cursor: 'pointer', textDecoration: 'underline' }}>{student.name}</td>
                  <td data-label="Belt Level"><span className={`badge ${getBeltColorClass(student.belt)}`}>{student.belt}</span></td>
                  <td data-label="Batch"><span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{getBatchNameFromSchedule(student.schedule)} • {student.batch}</span></td>
                  <td data-label="Skill Score"><span style={{ fontWeight: 'bold', color: student.performanceScore > 80 ? '#4CAF50' : '#FF9800' }}>{student.performanceScore}/100</span></td>
                  <td data-label="Progress to Next Belt" style={{ width: '30%' }}>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${student.performanceScore}%` }}></div>
                    </div>
                  </td>
                  <td data-label="Contact / Operations">
                    <div className="actions-flex-container">
                      <a href={`tel:${student.phone}`} className="btn-icon" style={{ color: '#2196F3' }} title="Call Student">
                        <Phone size={18} />
                      </a>
                      <a href={`https://wa.me/${student.phone}`} target="_blank" rel="noreferrer" className="btn-icon" style={{ color: '#25D366' }} title="WhatsApp Student">
                        <MessageCircle size={18} />
                      </a>
                      <a href={`sms:${student.phone}`} className="btn-icon" style={{ color: '#FF9800' }} title="SMS Message Student">
                        <MessageSquare size={18} />
                      </a>
                      <button className="btn-icon" onClick={() => handleDeleteStudent(student.id)} style={{ color: '#F44336' }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReminders = () => {
    const currentSystemMonth = new Date().toISOString().slice(0, 7);
    const unpaidStudents = searchedStudents.filter(s => {
      const fees = calculateStudentFees(s, currentSystemMonth);
      return fees.totalDue > 0;
    });
    return (
      <div className="reminders-container">
        <div className="panel" style={{ marginBottom: '2rem', background: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <AlertTriangle size={32} color="var(--color-primary)" />
            <div>
              <h2 style={{ margin: 0, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>Monthly Fee Due!</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)' }}>Auto alerts triggered: 30 days since last payment. Notify students below.</p>
            </div>
          </div>
          <button className="btn-primary w-full-mobile" onClick={() => alert('Automated reminders triggered!')}>
            <Bell size={18} /> Send All Reminders Now
          </button>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Pending Action ({unpaidStudents.length})</h3>
          </div>
          {unpaidStudents.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table responsive-table-cards">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Phone</th>
                    <th>Due Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidStudents.map(student => {
                    const fees = calculateStudentFees(student, currentSystemMonth);
                    const brName = student.branch.toUpperCase();
                    let msg = `Hi ${student.name}, this is a reminder from MASTER FIT Academy (${brName}). You have pending dues: `;
                    const items = [];
                    if (fees.admissionDue > 0) items.push(`Admission Fee (₹${fees.admissionDue})`);
                    if (fees.unpaidMonths.length > 0) items.push(`Monthly Fees for ${fees.unpaidMonths.join(', ')} (₹${fees.monthlyDue})`);
                    msg += items.join(' and ') + `. Total outstanding: ₹${fees.totalDue}. Please clear it as soon as possible. Thank you!`;
                    const encodedMsg = encodeURIComponent(msg);

                    return (
                      <tr key={student.id}>
                        <td data-label="Student Name" onClick={() => handleSelectStudent(student)} style={{ cursor: 'pointer', color: '#E50914', textDecoration: 'underline' }}>{student.name}</td>
                        <td data-label="Phone">{student.phone}</td>
                        <td data-label="Due Amount">
                          <span className="badge badge-red">₹{fees.totalDue}</span>
                          <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {fees.admissionDue > 0 ? 'Admission' : ''}
                            {fees.admissionDue > 0 && fees.unpaidMonths.length > 0 ? ' + ' : ''}
                            {fees.unpaidMonths.length > 0 ? `${fees.unpaidMonths.length}m monthly` : ''}
                          </span>
                        </td>
                        <td data-label="Action">
                          <div className="actions-flex-container">
                            <a href={`https://wa.me/${student.phone}?text=${encodedMsg}`} target="_blank" rel="noreferrer" className="btn-small" style={{ background: '#25D366', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                              <MessageCircle size={14} /> WhatsApp
                            </a>
                            <a href={`tel:${student.phone}`} className="btn-icon" style={{ color: '#2196F3' }} title="Call Student">
                              <Phone size={18} />
                            </a>
                            <a href={`sms:${student.phone}`} className="btn-icon" style={{ color: '#FF9800' }} title="SMS Message Student">
                              <MessageSquare size={18} />
                            </a>
                            <button className="btn-icon" onClick={() => handleDeleteStudent(student.id)} style={{ color: '#F44336' }} title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
              <CheckCircle size={48} style={{ color: '#4CAF50', marginBottom: '1rem' }} />
              <p>All clear! No pending payments.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSaveCredentialEdit = async (e) => {
    e.preventDefault();
    if (!editingCredential) return;

    setCredentialModalError('');
    setCredentialModalSuccess('');

    const { type, key, oldUsername, username: formUsername, password: formPassword } = editingCredential;
    const cleanUsername = formUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setCredentialModalError('Username cannot be empty');
      return;
    }

    const payload = {};

    if (type === 'admin') {
      const updatedAdmins = { ...rawCredentials.adminCredentials };
      if (cleanUsername !== oldUsername) {
        delete updatedAdmins[oldUsername];
      }
      updatedAdmins[cleanUsername] = formPassword;
      payload.adminCredentials = updatedAdmins;
    } else if (type === 'branch') {
      const updatedBranches = { ...rawCredentials.branchCredentials };
      updatedBranches[key] = {
        username: cleanUsername,
        password: formPassword
      };
      payload.branchCredentials = updatedBranches;
    } else if (type === 'batch') {
      const updatedBatches = { ...rawCredentials.batchCredentials };
      updatedBatches[key] = {
        username: cleanUsername,
        password: formPassword
      };
      payload.batchCredentials = updatedBatches;

      // Update custom batch name if changed
      const parts = key.split('_');
      const batchId = parts[1] || '';
      const customBatchObj = customBatches.find(cb => cb.id === batchId || cb.id === `batch_${batchId}`);
      if (customBatchObj && editingCredential.batchName !== undefined) {
        const newBatchName = editingCredential.batchName.trim();
        if (!newBatchName) {
          setCredentialModalError('Batch name cannot be empty');
          return;
        }
        const updatedCustomBatches = customBatches.map(b =>
          (b.id === batchId || b.id === `batch_${batchId}`) ? { ...b, name: newBatchName } : b
        );
        payload.customBatches = updatedCustomBatches;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update credentials');
      }

      setRawCredentials(data);
      if (data.adminCredentials) setAdminCredentials(data.adminCredentials);
      if (data.branchCredentials) setBranchCredentials(data.branchCredentials);
      if (data.batchCredentials) setBatchCredentials(data.batchCredentials);

      reloadAllAppData();

      if (oldUsername.toLowerCase() === loggedInUser.toLowerCase()) {
        setLoggedInUser(cleanUsername);
      }

      setCredentialModalSuccess('Credentials updated successfully!');
      setTimeout(() => {
        setIsCredentialModalOpen(false);
        setEditingCredential(null);
        setCredentialModalSuccess('');
      }, 1000);
    } catch (err) {
      setCredentialModalError(err.message);
    }
  };

  const renderEditCredentialModal = () => {
    if (!isCredentialModalOpen || !editingCredential) return null;

    return (
      <div className="modal-overlay" style={{ zIndex: 1200 }}>
        <div className="modal-content" style={{ maxWidth: '500px', width: '90%', background: '#0b0b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '2rem' }}>
          <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Lock size={20} color="var(--color-primary)" />
              Edit Credentials / Reset Password
            </h3>
            <button className="btn-icon" onClick={() => { setIsCredentialModalOpen(false); setEditingCredential(null); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={24} /></button>
          </div>

          <form onSubmit={handleSaveCredentialEdit}>
            {credentialModalError && (
              <div style={{ color: '#ff453a', background: 'rgba(255,69,58,0.1)', padding: '10px 14px', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {credentialModalError}
              </div>
            )}
            {credentialModalSuccess && (
              <div style={{ color: '#30d158', background: 'rgba(48,209,88,0.1)', padding: '10px 14px', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {credentialModalSuccess}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account Type</label>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                {editingCredential.displayName}
              </div>
            </div>

            {/* Account Status / Unblock Option */}
            {(() => {
              const matchedAdmin = adminsList.find(a => a.username.toLowerCase().trim() === editingCredential.oldUsername.toLowerCase().trim())
                || adminsList.find(a => a.username.toLowerCase().trim() === editingCredential.username.toLowerCase().trim());
              if (!matchedAdmin) return null;
              const isLocked = matchedAdmin.isLocked;
              return (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{
                      backgroundColor: isLocked ? 'rgba(255, 69, 58, 0.15)' : 'rgba(48, 209, 88, 0.15)',
                      color: isLocked ? '#ff453a' : '#30d158',
                      border: isLocked ? '1px solid rgba(255, 69, 58, 0.3)' : '1px solid rgba(48, 209, 88, 0.3)',
                      padding: '6px 12px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isLocked ? '🔒 Account Locked' : '🔓 Active / Unlocked'}
                    </span>
                    {isLocked && (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          backgroundColor: '#30d158',
                          borderColor: '#30d158',
                          color: '#000',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          handleToggleAdminLock(matchedAdmin._id, true);
                          alert("Account unblocked successfully!");
                        }}
                      >
                        Unblock Account
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Batch Name Edit Option (only for Trainer accounts linked to a custom batch) */}
            {editingCredential.type === 'batch' && (() => {
              const parts = editingCredential.key.split('_');
              const batchId = parts[1] || '';
              const customBatchObj = customBatches.find(cb => cb.id === batchId || cb.id === `batch_${batchId}`);
              if (!customBatchObj) return null;
              return (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Batch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '100%' }}
                    required
                    value={editingCredential.batchName !== undefined ? editingCredential.batchName : customBatchObj.name}
                    onChange={(e) => setEditingCredential({ ...editingCredential, batchName: e.target.value })}
                  />
                </div>
              );
            })()}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Username</label>
              <input
                type="text"
                className="form-control"
                style={{ width: '100%' }}
                required
                value={editingCredential.username}
                onChange={(e) => setEditingCredential({ ...editingCredential, username: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Password</label>
              <input
                type="password"
                className="form-control"
                style={{ width: '100%' }}
                required
                placeholder="Enter new password"
                value={editingCredential.password}
                onChange={(e) => setEditingCredential({ ...editingCredential, password: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                Change password or leave as `••••••` to keep current password unchanged.
              </span>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setIsCredentialModalOpen(false); setEditingCredential(null); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditBranchModal = () => {
    if (!isEditBranchModalOpen) return null;
    return (
      <div className="modal-overlay" style={{ zIndex: 1200 }}>
        <div className="modal-content" style={{ maxWidth: '450px', width: '90%', background: '#0b0b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '2rem' }}>
          <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>Rename Branch</h3>
            <button className="btn-icon" onClick={() => { setIsEditBranchModalOpen(false); setEditingBranchName(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const newName = newBranchNameField.trim();
            if (newName && newName !== editingBranchName) {
              handleEditCustomBranch(editingBranchName, newName);
              setIsEditBranchModalOpen(false);
              setEditingBranchName('');
            } else {
              setIsEditBranchModalOpen(false);
            }
          }}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Branch Name</label>
              <input
                type="text"
                className="form-control"
                style={{ width: '100%' }}
                required
                value={newBranchNameField}
                onChange={(e) => setNewBranchNameField(e.target.value)}
              />
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => { setIsEditBranchModalOpen(false); setEditingBranchName(''); }}>Cancel</button>
              <button type="submit" className="btn-primary">Save Name</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditBatchModal = () => {
    if (!isEditBatchModalOpen || !editingBatchObj) return null;
    return (
      <div className="modal-overlay" style={{ zIndex: 1200 }}>
        <div className="modal-content" style={{ maxWidth: '450px', width: '90%', background: '#0b0b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '2rem' }}>
          <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>Edit Batch Details</h3>
            <button className="btn-icon" onClick={() => { setIsEditBatchModalOpen(false); setEditingBatchObj(null); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const newName = newBatchNameField.trim();
            const newSchedule = newBatchScheduleField.trim();
            if (newName && newSchedule) {
              handleEditCustomBatch(editingBatchObj.id, newName, newSchedule);
              setIsEditBatchModalOpen(false);
              setEditingBatchObj(null);
            } else {
              alert("Both name and schedule pattern are required.");
            }
          }}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Batch Name</label>
              <input
                type="text"
                className="form-control"
                style={{ width: '100%' }}
                required
                value={newBatchNameField}
                onChange={(e) => setNewBatchNameField(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Schedule Pattern (e.g. Mon-Fri)</label>
              <input
                type="text"
                className="form-control"
                style={{ width: '100%' }}
                required
                value={newBatchScheduleField}
                onChange={(e) => setNewBatchScheduleField(e.target.value)}
              />
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => { setIsEditBatchModalOpen(false); setEditingBatchObj(null); }}>Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCredentialsList = () => {
    const isSuper = isAdminUser(loggedInUser);
    const isBranchAdm = isBranchAdmin(loggedInUser);
    const hasAccess = isSuper || isBranchAdm;

    if (!hasAccess) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Only administrators can access branch & batch mapping.</p>
        </div>
      );
    }

    return (
      <div className="credentials-view" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Consolidated Sub-tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
          {isSuper && (
            <button
              className={`btn-primary ${mappingSubTab === 'credentials' ? '' : 'btn-secondary'}`}
              style={mappingSubTab === 'credentials' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
              onClick={() => setMappingSubTab('credentials')}
            >
              System Credentials
            </button>
          )}
          {isSuper && (
            <button
              className={`btn-primary ${mappingSubTab === 'branches' ? '' : 'btn-secondary'}`}
              style={mappingSubTab === 'branches' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
              onClick={() => setMappingSubTab('branches')}
            >
              Branches Setup
            </button>
          )}
          <button
            className={`btn-primary ${mappingSubTab === 'batches' ? '' : 'btn-secondary'}`}
            style={mappingSubTab === 'batches' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
            onClick={() => setMappingSubTab('batches')}
          >
            Batches Setup
          </button>
        </div>

        {settingsError && (
          <div style={{ color: '#ff453a', background: 'rgba(255,69,58,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,69,58,0.2)', fontWeight: 500 }}>
            {settingsError}
          </div>
        )}
        {settingsSuccess && (
          <div style={{ color: '#30d158', background: 'rgba(48,209,88,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(48,209,88,0.2)', fontWeight: 500 }}>
            {settingsSuccess}
          </div>
        )}

        {/* Tab Contents */}
        {mappingSubTab === 'credentials' && isSuper && (
          <>
            {/* Notice alert */}
            <div className="panel" style={{ borderLeft: '4px solid var(--color-primary)', background: 'rgba(229, 9, 20, 0.05)' }}>
              <h4 style={{ margin: 0, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="var(--color-primary)" />
                System Accounts Monitor
              </h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
                This page shows all configured system accounts, their associated roles, and whether they are currently logged in.
                To edit credentials, please click the "Edit" button next to any user account below.
              </p>
            </div>

            {rawCredentialsError && (
              <div style={{ color: '#ff453a', background: 'rgba(255,69,58,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,69,58,0.2)', fontWeight: 500 }}>
                Error: {rawCredentialsError}
              </div>
            )}

            {loadingRawCreds ? (
              <div className="panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading system accounts...</p>
              </div>
            ) : !rawCredentials ? (
              <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>No accounts data found or failed to load.</p>
              </div>
            ) : (
              <>
                {/* Superadmin Accounts Panel */}
                <div className="panel">
                  <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                    <h3 className="panel-title">Super Admin Accounts</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table responsive-table-cards">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Position / Role</th>
                          <th>Lock Status</th>
                          <th>Session Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(rawCredentials.adminCredentials || {}).map((username) => {
                          const userObj = adminsList.find(a => a.username.toLowerCase().trim() === username.toLowerCase().trim());
                          const isLocked = userObj ? userObj.isLocked : false;
                          return (
                            <tr key={username}>
                              <td data-label="Username" style={{ fontWeight: 600, color: 'white' }}>{username}</td>
                              <td data-label="Position / Role"><span className="badge badge-green">Superadmin</span></td>
                              <td data-label="Lock Status">
                                {userObj ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAdminLock(userObj._id, isLocked)}
                                    className="btn-small"
                                    style={{
                                      backgroundColor: isLocked ? 'rgba(255, 69, 58, 0.15)' : 'rgba(48, 209, 88, 0.15)',
                                      borderColor: isLocked ? '#ff453a' : '#30d158',
                                      color: isLocked ? '#ff453a' : '#30d158',
                                      fontWeight: 'bold',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      cursor: 'pointer',
                                      borderRadius: '4px',
                                      padding: '2px 8px'
                                    }}
                                  >
                                    {isLocked ? '🔒 Locked (Unblock)' : '🔓 Unlocked (Lock)'}
                                  </button>
                                ) : (
                                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>-</span>
                                )}
                              </td>
                              <td data-label="Session Status">
                                {activeSessions.some(session => session.username.toLowerCase().trim() === username.toLowerCase().trim()) ? (
                                  <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    🟢 Logged In
                                  </span>
                                ) : (
                                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    ⚪ Offline
                                  </span>
                                )}
                              </td>
                              <td data-label="Actions">
                                <button
                                  type="button"
                                  className="btn-small"
                                  style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                                  onClick={() => {
                                    setEditingCredential({
                                      type: 'admin',
                                      key: username,
                                      oldUsername: username,
                                      username: username,
                                      password: '••••••',
                                      displayName: `Super Admin Account (${username})`
                                    });
                                    setIsCredentialModalOpen(true);
                                  }}
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Branch Inspector Accounts Panel */}
                <div className="panel">
                  <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                    <h3 className="panel-title">Branch Inspector Accounts</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table responsive-table-cards">
                      <thead>
                        <tr>
                          <th>Branch Name</th>
                          <th>Username</th>
                          <th>Position / Role</th>
                          <th>Lock Status</th>
                          <th>Session Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(rawCredentials.branchCredentials || {}).length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem' }}>No branch inspectors configured.</td>
                          </tr>
                        ) : (
                          Object.entries(rawCredentials.branchCredentials || {}).map(([branchKey, info]) => {
                            const userObj = adminsList.find(a => a.username.toLowerCase().trim() === info.username.toLowerCase().trim());
                            const isLocked = userObj ? userObj.isLocked : false;
                            return (
                              <tr key={branchKey}>
                                <td data-label="Branch Name" style={{ fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>{branchKey}</td>
                                <td data-label="Username" style={{ color: 'var(--color-text-light)' }}>{info.username}</td>
                                <td data-label="Position / Role"><span className="badge" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.3)' }}>Branch Admin</span></td>
                                <td data-label="Lock Status">
                                  {userObj ? (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleAdminLock(userObj._id, isLocked)}
                                      className="btn-small"
                                      style={{
                                        backgroundColor: isLocked ? 'rgba(255, 69, 58, 0.15)' : 'rgba(48, 209, 88, 0.15)',
                                        borderColor: isLocked ? '#ff453a' : '#30d158',
                                        color: isLocked ? '#ff453a' : '#30d158',
                                        fontWeight: 'bold',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        padding: '2px 8px'
                                      }}
                                    >
                                      {isLocked ? '🔒 Locked (Unblock)' : '🔓 Unlocked (Lock)'}
                                    </button>
                                  ) : (
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>-</span>
                                  )}
                                </td>
                                <td data-label="Session Status">
                                  {activeSessions.some(session => session.username.toLowerCase().trim() === info.username.toLowerCase().trim()) ? (
                                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      🟢 Logged In
                                    </span>
                                  ) : (
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      ⚪ Offline
                                    </span>
                                  )}
                                </td>
                                <td data-label="Actions">
                                  <button
                                    type="button"
                                    className="btn-small"
                                    style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                                    onClick={() => {
                                      setEditingCredential({
                                        type: 'branch',
                                        key: branchKey,
                                        oldUsername: info.username,
                                        username: info.username,
                                        password: '••••••',
                                        displayName: `Branch Inspector (${branchKey})`
                                      });
                                      setIsCredentialModalOpen(true);
                                    }}
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Trainer Accounts Panel */}
                <div className="panel">
                  <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                    <h3 className="panel-title">Trainer Accounts</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table responsive-table-cards">
                      <thead>
                        <tr>
                          <th>Batch Name</th>
                          <th>Username</th>
                          <th>Position / Role</th>
                          <th>Lock Status</th>
                          <th>Session Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(rawCredentials.batchCredentials || {}).length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem' }}>No trainers configured.</td>
                          </tr>
                        ) : (
                          Object.entries(rawCredentials.batchCredentials || {}).map(([batchKey, info]) => {
                            const parts = batchKey.split('_');
                            const branchName = parts[0];
                            const batchId = parts[1] || '';

                            let batchNameText = batchId.toUpperCase();
                            if (batchId.startsWith('batch')) {
                              const batchNumStr = batchId.replace('batch', '');
                              if (batchNumStr && !isNaN(batchNumStr)) {
                                batchNameText = `Batch ${batchNumStr}`;
                              }
                            }
                            const customBatchObj = customBatches.find(cb => cb.id === batchId || cb.id === `batch_${batchId}`);
                            if (customBatchObj) {
                              batchNameText = customBatchObj.name;
                            }

                            const userObj = adminsList.find(a => a.username.toLowerCase().trim() === info.username.toLowerCase().trim());
                            const isLocked = userObj ? userObj.isLocked : false;

                            return (
                              <tr key={batchKey}>
                                <td data-label="Batch" style={{ fontWeight: 600, color: 'white' }}>
                                  <span style={{ textTransform: 'capitalize' }}>{branchName}</span> - {batchNameText}
                                </td>
                                <td data-label="Username" style={{ color: 'var(--color-text-light)' }}>{info.username}</td>
                                <td data-label="Position / Role"><span className="badge" style={{ background: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6', border: '1px solid rgba(155, 89, 182, 0.3)' }}>Coach / Trainer</span></td>
                                <td data-label="Lock Status">
                                  {userObj ? (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleAdminLock(userObj._id, isLocked)}
                                      className="btn-small"
                                      style={{
                                        backgroundColor: isLocked ? 'rgba(255, 69, 58, 0.15)' : 'rgba(48, 209, 88, 0.15)',
                                        borderColor: isLocked ? '#ff453a' : '#30d158',
                                        color: isLocked ? '#ff453a' : '#30d158',
                                        fontWeight: 'bold',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        padding: '2px 8px'
                                      }}
                                    >
                                      {isLocked ? '🔒 Locked (Unblock)' : '🔓 Unlocked (Lock)'}
                                    </button>
                                  ) : (
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>-</span>
                                  )}
                                </td>
                                <td data-label="Session Status">
                                  {activeSessions.some(session => session.username.toLowerCase().trim() === info.username.toLowerCase().trim()) ? (
                                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      🟢 Logged In
                                    </span>
                                  ) : (
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      ⚪ Offline
                                    </span>
                                  )}
                                </td>
                                <td data-label="Actions">
                                  <button
                                    type="button"
                                    className="btn-small"
                                    style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                                    onClick={() => {
                                      setEditingCredential({
                                        type: 'batch',
                                        key: batchKey,
                                        oldUsername: info.username,
                                        username: info.username,
                                        password: '••••••',
                                        displayName: `Trainer (${branchName} - ${batchNameText})`
                                      });
                                      setIsCredentialModalOpen(true);
                                    }}
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {mappingSubTab === 'branches' && isSuper && renderBranchesPage()}
        {mappingSubTab === 'batches' && renderBatchesPage()}
      </div>
    );
  };

  const exportAdminsToCSV = (filteredAdmins) => {
    const headers = [
      "Username", "Full Name", "Email", "Phone", "Employee ID",
      "Role", "Branch", "Batch", "Status", "Lockout Status",
      "Login Count", "Last Login", "Last Logout"
    ];

    const rows = filteredAdmins.map(a => [
      a.username,
      a.fullName || "",
      a.email || "",
      a.phone || "",
      a.employeeId || "",
      a.role,
      a.branch || "",
      a.batch || "",
      a.status,
      a.isLocked ? "Locked" : "Unlocked",
      a.loginCount || 0,
      a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "Never",
      a.lastLogoutAt ? new Date(a.lastLogoutAt).toLocaleString() : "Never"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admins_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderBranchesPage = () => {
    const isSuper = isAdminUser(loggedInUser);
    if (!isSuper) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Only super administrators can manage branches.</p>
        </div>
      );
    }

    return (
      <div className="branches-view-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Stat Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><MapPin className="stat-icon" /></div>
            <div className="stat-details">
              <h3>Total Mapped Branches</h3>
              <p className="stat-value">{branches.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(52, 152, 219, 0.1)' }}><Users className="stat-icon" style={{ color: '#3498db' }} /></div>
            <div className="stat-details">
              <h3>System Default</h3>
              <p className="stat-value" style={{ color: '#3498db' }}>{DEFAULT_BRANCHES.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(48, 209, 88, 0.1)' }}><CheckCircle className="stat-icon" style={{ color: '#30d158' }} /></div>
            <div className="stat-details">
              <h3>Custom Configured</h3>
              <p className="stat-value" style={{ color: '#30d158' }}>{customBranches.length}</p>
            </div>
          </div>
        </div>

        {/* Branch Configurations and Credentials Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
          {/* Create Branch Card */}
          <div className="panel" style={{ height: '100%', marginBottom: 0 }}>
            <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} color="var(--color-primary)" /> Configure New Branch Mappings</h3>
            </div>
            <form onSubmit={handleAddBranch}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Branch Name (e.g. Kallachi)</label>
                  <input
                    type="text"
                    placeholder="Enter branch name"
                    className="form-control"
                    value={newBranchForm.name}
                    onChange={(e) => setNewBranchForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Inspector Username (Will default to admin@name)</label>
                  <input
                    type="text"
                    placeholder="admin@name"
                    className="form-control"
                    value={newBranchForm.name ? `admin@${newBranchForm.name.toLowerCase().trim()}` : ''}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Admin Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-control"
                    value={newBranchForm.password}
                    onChange={(e) => setNewBranchForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-control"
                    value={newBranchForm.confirmPassword || ''}
                    onChange={(e) => setNewBranchForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  {newBranchPasswordError && <span style={{ color: '#ff453a', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{newBranchPasswordError}</span>}
                </div>
              </div>
              <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Create Mapped Branch & Inspector Credentials</button>
            </form>
          </div>

          {/* Manage Branch Credentials Panel */}
          <div className="panel" style={{ height: '100%', marginBottom: 0 }}>
            <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={20} color="var(--color-primary)" /> Manage Branch Credentials</h3>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Current Username: <strong style={{ color: 'var(--color-text-light)' }}>{branchCredentials[branchForm.branch]?.username || `admin@${branchForm.branch}`}</strong>
            </div>
            <form onSubmit={handleUpdateBranchPassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Select Branch</label>
                  <select className="form-control" value={branchForm.branch} onChange={(e) => setBranchForm({ branch: e.target.value, newUsername: '', newPassword: '', confirmPassword: '' })}>
                    {branches.map(br => (
                      <option key={br} value={br.toLowerCase()}>{br}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>New Username (Optional)</label>
                  <input type="text" className="form-control" placeholder="Enter new username" value={branchForm.newUsername} onChange={(e) => setBranchForm({ ...branchForm, newUsername: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" className="form-control" placeholder="Enter new password" required value={branchForm.newPassword} onChange={(e) => { setBranchForm({ ...branchForm, newPassword: e.target.value }); setBranchPasswordError(''); }} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" className="form-control" placeholder="Confirm new password" required value={branchForm.confirmPassword} onChange={(e) => { setBranchForm({ ...branchForm, confirmPassword: e.target.value }); setBranchPasswordError(''); }} />
                  {branchPasswordError && (
                    <div style={{ color: '#E50914', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{branchPasswordError}</div>
                  )}
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Save Branch Credentials</button>
            </form>
          </div>
        </div>

        {/* Branches Grid / List */}
        <div className="panel">
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="panel-title">Active Academy Branches</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table responsive-table-cards">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Branch Code / Key</th>
                  <th>Credentials Account</th>
                  <th>Students Roster</th>
                  <th>Staff / Inspectors</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => {
                  const bKey = b.toLowerCase();
                  const isDefault = DEFAULT_BRANCHES.includes(b);
                  const cred = branchCredentials[bKey];
                  const studentCount = students.filter(s => s.branch && s.branch.toLowerCase() === bKey).length;
                  const adminCount = adminsList.filter(a => a.branch && a.branch.toLowerCase() === bKey).length;

                  return (
                    <tr key={b}>
                      <td data-label="Branch Name" style={{ fontWeight: 600, color: 'white' }}>{b}</td>
                      <td data-label="Branch Code" style={{ fontFamily: 'monospace' }}>{bKey}</td>
                      <td data-label="Credentials Account">
                        {cred ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: 'var(--color-primary)' }}>{cred.username}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Password: {cred.password}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>No Default Inspector Set</span>
                        )}
                      </td>
                      <td data-label="Students Roster"><span className="badge badge-green">{studentCount} Students</span></td>
                      <td data-label="Staff / Inspectors"><span className="badge" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db' }}>{adminCount} Admin / Inspector(s)</span></td>
                      <td data-label="Type">
                        {isDefault ? (
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>System Default</span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(48, 209, 88, 0.15)', color: '#30d158' }}>Custom Config</span>
                        )}
                      </td>
                      <td data-label="Actions">
                        {!isDefault ? (
                          <div className="actions-flex-container">
                            <button
                              type="button"
                              className="btn-small"
                              style={{
                                backgroundColor: '#3498db',
                                borderColor: '#3498db',
                                color: '#fff',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setEditingBranchName(b);
                                setNewBranchNameField(b);
                                setIsEditBranchModalOpen(true);
                              }}
                            >
                              Rename
                            </button>
                            <button
                              type="button"
                              className="btn-small"
                              style={{
                                backgroundColor: 'var(--color-primary)',
                                borderColor: 'var(--color-primary)',
                                color: '#fff',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleDeleteCustomBranch(b)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };

  const renderBatchesPage = () => {
    const isSuper = isAdminUser(loggedInUser);
    const isBranchAdm = isBranchAdmin(loggedInUser);
    const hasAccess = isSuper || isBranchAdm;
    if (!hasAccess) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Only administrators can manage batches.</p>
        </div>
      );
    }

    return (
      <div className="batches-view-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Stat Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><CalendarDays className="stat-icon" /></div>
            <div className="stat-details">
              <h3>Total Configured Batches</h3>
              <p className="stat-value">{batchOptions.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(52, 152, 219, 0.1)' }}><Users className="stat-icon" style={{ color: '#3498db' }} /></div>
            <div className="stat-details">
              <h3>System Default</h3>
              <p className="stat-value" style={{ color: '#3498db' }}>{DEFAULT_BATCH_OPTIONS.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(48, 209, 88, 0.1)' }}><CheckCircle className="stat-icon" style={{ color: '#30d158' }} /></div>
            <div className="stat-details">
              <h3>Custom Configured</h3>
              <p className="stat-value" style={{ color: '#30d158' }}>{customBatches.length}</p>
            </div>
          </div>
        </div>

        {/* Batch Configuration and Credentials Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
          {/* Add Batch Card */}
          <div className="panel" style={{ height: '100%', marginBottom: 0 }}>
            <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CalendarDays size={20} color="var(--color-primary)" /> Configure New Batch Settings</h3>
            </div>
            <form onSubmit={handleAddBatch}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Batch Name (e.g. Batch 4)</label>
                  <input
                    type="text"
                    placeholder="Enter batch name"
                    className="form-control"
                    value={newBatchForm.name}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Schedule Pattern (e.g. Mon-Fri or Sun-Wed)</label>
                  <input
                    type="text"
                    placeholder="Schedule Pattern"
                    className="form-control"
                    value={newBatchForm.schedule}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, schedule: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Assigned Branch</label>
                  <select
                    className="form-control"
                    value={newBatchForm.branch}
                    disabled={!isSuper}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, branch: e.target.value }))}
                  >
                    {isSuper ? (
                      branches.map(b => (
                        <option key={b} value={b.toLowerCase()}>{b}</option>
                      ))
                    ) : (
                      <option value={getLoggedInUserBranch().toLowerCase()}>{getLoggedInUserBranch()}</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Trainer Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-control"
                    value={newBatchForm.password}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-control"
                    value={newBatchForm.confirmPassword || ''}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  {newBatchPasswordError && <span style={{ color: '#ff453a', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{newBatchPasswordError}</span>}
                </div>
              </div>
              <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Create Configured Batch & Mapped Trainer Account</button>
            </form>
          </div>

          {/* Manage Batch Credentials Panel */}
          <div className="panel" style={{ height: '100%', marginBottom: 0 }}>
            <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={20} color="var(--color-primary)" /> Manage Batch Credentials</h3>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Current Username: <strong style={{ color: 'var(--color-text-light)' }}>{batchCredentials[`${batchForm.branch}_${batchForm.batch}`]?.username || `${batchForm.batch}@${batchForm.branch}`}</strong>
            </div>
            <form onSubmit={handleUpdateBatchPassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Select Branch</label>
                  <select
                    className="form-control"
                    value={batchForm.branch}
                    disabled={!isSuper}
                    onChange={(e) => setBatchForm({ ...batchForm, branch: e.target.value, newUsername: '', newPassword: '', confirmPassword: '' })}
                  >
                    {isSuper ? (
                      branches.map(br => (
                        <option key={br} value={br.toLowerCase()}>{br}</option>
                      ))
                    ) : (
                      <option value={getLoggedInUserBranch().toLowerCase()}>{getLoggedInUserBranch()}</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Batch</label>
                  <select className="form-control" value={batchForm.batch} onChange={(e) => setBatchForm({ ...batchForm, batch: e.target.value, newUsername: '', newPassword: '', confirmPassword: '' })}>
                    {getFilteredBatchOptions(batchForm.branch, false).map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>New Username (Optional)</label>
                  <input type="text" className="form-control" placeholder="Enter new username" value={batchForm.newUsername} onChange={(e) => setBatchForm({ ...batchForm, newUsername: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" className="form-control" placeholder="Enter new password" required value={batchForm.newPassword} onChange={(e) => { setBatchForm({ ...batchForm, newPassword: e.target.value }); setBatchPasswordError(''); }} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" className="form-control" placeholder="Confirm new password" required value={batchForm.confirmPassword} onChange={(e) => { setBatchForm({ ...batchForm, confirmPassword: e.target.value }); setBatchPasswordError(''); }} />
                  {branchPasswordError && (
                    <div style={{ color: '#E50914', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{branchPasswordError}</div>
                  )}
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Save Batch Credentials</button>
            </form>
          </div>
        </div>

        {/* Batches List Table */}
        <div className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
            <h3 className="panel-title">Active Academy Batches</h3>
            {isSuper && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Filter Branch:</span>
                <select
                  className="form-control"
                  style={{ width: '160px', height: '36px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer', borderRadius: '6px', padding: '0 0.5rem' }}
                  value={batchesBranchFilter}
                  onChange={(e) => setBatchesBranchFilter(e.target.value)}
                >
                  <option value="All">All Branches</option>
                  {branches.map(br => (
                    <option key={br} value={br}>{br}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="table-responsive">
            <table className="data-table responsive-table-cards">
              <thead>
                <tr>
                  <th>Batch Name</th>
                  <th>Schedule Pattern</th>
                  <th>Mapped Trainer Accounts</th>
                  <th>Students Active</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredBatchOptions(isSuper ? batchesBranchFilter : undefined, false).map((b) => {
                  const isDefault = DEFAULT_BATCH_OPTIONS.some(opt => opt.id === b.id);
                  const studentCount = students.filter(s => s.batch === b.id || s.schedule === b.schedule).length;
                  const selectedBranchKey = isSuper ? batchesBranchFilter.toLowerCase() : getLoggedInUserBranch().toLowerCase();

                  // Collect mapped credentials across branches
                  const matchedCreds = [];
                  for (const [key, val] of Object.entries(batchCredentials)) {
                    if (key.endsWith(`_${b.id}`) || key === b.id) {
                      const branchPart = key.includes('_') ? key.split('_')[0] : 'Kuttiady';
                      if (selectedBranchKey !== 'all' && branchPart.toLowerCase() !== selectedBranchKey) {
                        continue;
                      }
                      matchedCreds.push({ branch: branchPart.toUpperCase(), user: val.username, pass: val.password });
                    }
                  }

                  return (
                    <tr key={b.id}>
                      <td data-label="Batch Name" style={{ fontWeight: 600, color: 'white' }}>{b.name}</td>
                      <td data-label="Schedule Pattern" style={{ color: 'var(--color-primary)' }}>{b.schedule}</td>
                      <td data-label="Mapped Trainer Accounts">
                        {matchedCreds.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {matchedCreds.map((cred, idx) => (
                              <div key={idx} style={{ fontSize: '0.8rem', borderBottom: idx < matchedCreds.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', paddingBottom: '2px' }}>
                                <span style={{ color: '#3498db', fontWeight: 500 }}>{cred.branch}</span>: {cred.user} <span style={{ color: 'var(--color-text-muted)' }}>(Pass: {cred.pass})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>No Trainer Creds configured</span>
                        )}
                      </td>
                      <td data-label="Students Active"><span className="badge badge-green">{studentCount} Students</span></td>
                      <td data-label="Type">
                        {isDefault ? (
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>System Default</span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(48, 209, 88, 0.15)', color: '#30d158' }}>Custom Config</span>
                        )}
                      </td>
                      <td data-label="Actions">
                        {!isDefault ? (
                          <div className="actions-flex-container">
                            <button
                              type="button"
                              className="btn-small"
                              style={{
                                backgroundColor: '#3498db',
                                borderColor: '#3498db',
                                color: '#fff',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setEditingBatchObj(b);
                                setNewBatchNameField(b.name);
                                setNewBatchScheduleField(b.schedule);
                                setIsEditBatchModalOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-small"
                              style={{
                                backgroundColor: 'var(--color-primary)',
                                borderColor: 'var(--color-primary)',
                                color: '#fff',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleDeleteCustomBatch(b.id, b.name)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };

  const renderAdminsPage = () => {
    const isSuper = isAdminUser(loggedInUser);
    const isBranchAdm = isBranchAdmin(loggedInUser);
    const hasAccess = isSuper || isBranchAdm;
    if (!hasAccess) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Only administrators can access admin user management.</p>
        </div>
      );
    }

    const scopedAdmins = adminsList.filter(admin => {
      if (isBranchAdm) {
        const branchKey = getLoggedInUserBranch().toLowerCase();
        return admin.branch && admin.branch.toLowerCase().trim() === branchKey && (admin.role === 'trainer' || admin.role === 'coordinator');
      }
      return true;
    });

    // Filter logic
    const filteredAdmins = scopedAdmins.filter(admin => {
      // Search
      const searchMatch =
        admin.username.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        (admin.fullName && admin.fullName.toLowerCase().includes(adminSearchQuery.toLowerCase())) ||
        (admin.employeeId && admin.employeeId.toLowerCase().includes(adminSearchQuery.toLowerCase())) ||
        (admin.email && admin.email.toLowerCase().includes(adminSearchQuery.toLowerCase())) ||
        (admin.phone && admin.phone.toLowerCase().includes(adminSearchQuery.toLowerCase()));

      // Role filter
      const roleMatch = isBranchAdm ? true : (adminRoleFilter === 'All' || admin.role === adminRoleFilter);

      // Status filter
      let statusMatch = true;
      if (adminStatusFilter === 'Active') statusMatch = admin.status === 'Active';
      else if (adminStatusFilter === 'Inactive') statusMatch = admin.status === 'Inactive';
      else if (adminStatusFilter === 'Locked') statusMatch = admin.isLocked;
      else if (adminStatusFilter === 'Online') statusMatch = isUserLoggedIn(admin.username);
      else if (adminStatusFilter === 'Offline') statusMatch = !isUserLoggedIn(admin.username);
      else if (adminStatusFilter === 'Failed Logins') statusMatch = admin.failedAttempts > 0;

      return searchMatch && roleMatch && statusMatch;
    });

    // Counts
    const totalAdmins = scopedAdmins.length;
    const onlineCount = scopedAdmins.filter(a => isUserLoggedIn(a.username)).length;
    const lockedCount = scopedAdmins.filter(a => a.isLocked).length;
    const inactiveCount = scopedAdmins.filter(a => a.status === 'Inactive').length;

    return (
      <div className="admins-view-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Stat Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Shield className="stat-icon" /></div>
            <div className="stat-details">
              <h3>Admin Accounts</h3>
              <p className="stat-value">{totalAdmins}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(48, 209, 88, 0.1)' }}><Activity className="stat-icon" style={{ color: '#30d158' }} /></div>
            <div className="stat-details">
              <h3>Currently Online</h3>
              <p className="stat-value" style={{ color: '#30d158' }}>{onlineCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 69, 58, 0.1)' }}><Lock className="stat-icon" style={{ color: '#ff453a' }} /></div>
            <div className="stat-details">
              <h3>Locked Accounts</h3>
              <p className="stat-value" style={{ color: '#ff453a' }}>{lockedCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 159, 10, 0.1)' }}><AlertTriangle className="stat-icon" style={{ color: '#ff9f0a' }} /></div>
            <div className="stat-details">
              <h3>Inactive Status</h3>
              <p className="stat-value" style={{ color: '#ff9f0a' }}>{inactiveCount}</p>
            </div>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search admin users..."
                  className="form-control"
                  style={{ paddingLeft: '38px', width: '100%', height: '38px' }}
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="form-control"
                style={{ width: '160px', height: '38px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                value={adminRoleFilter}
                onChange={(e) => setAdminRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="superadmin">Super Admins</option>
                <option value="branchadmin">Branch Admins</option>
                <option value="trainer">Trainers</option>
              </select>
              <select
                className="form-control"
                style={{ width: '160px', height: '38px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                value={adminStatusFilter}
                onChange={(e) => setAdminStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Status</option>
                <option value="Inactive">Inactive Status</option>
                <option value="Locked">Locked Accounts</option>
                <option value="Online">Online Users</option>
                <option value="Offline">Offline Users</option>
                <option value="Failed Logins">Failed Logins Exist</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-outline-primary"
                style={{ height: '38px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => exportAdminsToCSV(filteredAdmins)}
              >
                <FileDown size={16} /> Export CSV
              </button>
              <button
                className="btn-primary"
                style={{ height: '38px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsAdminModalOpen(true)}
              >
                <UserPlus size={16} /> Create User Account
              </button>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="panel">
          <div className="table-responsive">
            <table className="data-table responsive-table-cards">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Role / Code</th>
                  <th>Employee ID / Branch</th>
                  <th>Session Status</th>
                  <th>Account Lock</th>
                  <th>Last Session Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length > 0 ? filteredAdmins.map((admin) => {
                  const online = isUserLoggedIn(admin.username);
                  return (
                    <tr key={admin._id}>
                      <td data-label="Full Name">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem', backgroundColor: online ? '#30d158' : 'rgba(255,255,255,0.08)', color: online ? '#000' : '#8e8e93', fontWeight: 'bold' }}>
                            {admin.fullName ? admin.fullName.charAt(0).toUpperCase() : admin.username.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span
                              style={{ fontWeight: 600, color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}
                              onClick={() => handleFetchUserDetail(admin.username)}
                            >
                              {admin.fullName || admin.username}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{admin.username}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role / Code">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className={`badge ${admin.role === 'superadmin' ? 'badge-green' : admin.role === 'branchadmin' ? 'badge-blue' : 'badge-yellow'}`}>
                            {admin.role === 'superadmin' ? 'Super Admin' : admin.role === 'branchadmin' ? 'Branch Admin' : (admin.role === 'trainer' || admin.role === 'coordinator' ? 'Trainer' : admin.role)}
                          </span>
                          {admin.batch && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Batch: {admin.batch}</span>}
                        </div>
                      </td>
                      <td data-label="Employee ID / Branch">
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ color: '#fff', fontSize: '0.85rem' }}>{admin.branch || 'Global'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {admin.employeeId || 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Session Status">
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className={`badge ${admin.status === 'Active' ? 'badge-green' : 'badge-red'}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                            onClick={() => handleToggleAdminStatus(admin._id, admin.status)}
                            title="Click to toggle active status"
                          >
                            {admin.status}
                          </button>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {online ? '🟢 Online' : '⚪ Offline'}
                          </span>
                        </div>
                      </td>
                      <td data-label="Account Lock">
                        <button
                          className={`badge ${admin.isLocked ? 'badge-red' : 'badge-green'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => handleToggleAdminLock(admin._id, admin.isLocked)}
                          title="Click to toggle lockout"
                        >
                          {admin.isLocked ? 'Locked' : 'Unlocked'}
                        </button>
                      </td>
                      <td data-label="Last Session Activity">
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--color-text-light)' }}>
                            In: {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'N/A'}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            Out: {admin.lastLogoutAt ? new Date(admin.lastLogoutAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td data-label="Actions">
                        <div className="actions-flex-container">
                          <button
                            className="btn-outline-primary btn-small"
                            onClick={() => setEditingAdmin(admin)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-danger btn-small"
                            onClick={() => handleDeleteAdmin(admin._id, admin.username)}
                            disabled={admin.username.toLowerCase().trim() === loggedInUser.toLowerCase().trim()}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No admin users match the search filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Admin */}
        {isAdminModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div className="panel-header">
                <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={20} color="var(--color-primary)" /> Create Admin Account
                </h2>
                <button className="btn-icon" onClick={() => setIsAdminModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateAdmin} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                <div className="form-group">
                  <label>Username / User ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. admin@perambra or trainer_name"
                    value={newAdminForm.username}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter user's full name"
                    value={newAdminForm.fullName || ''}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="email@example.com"
                      value={newAdminForm.email || ''}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Phone number"
                      value={newAdminForm.phone || ''}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Employee ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Emp ID"
                      value={newAdminForm.employeeId || ''}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>System Role</label>
                    <select
                      className="form-control"
                      value={newAdminForm.role}
                      disabled={isBranchAdm}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, role: e.target.value }))}
                    >
                      {isSuper ? (
                        <>
                          <option value="superadmin">Super Admin</option>
                          <option value="branchadmin">Branch Admin</option>
                          <option value="trainer">Trainer</option>
                        </>
                      ) : (
                        <option value="trainer">Trainer</option>
                      )}
                    </select>
                  </div>
                </div>

                {newAdminForm.role !== 'superadmin' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label>Assigned Branch</label>
                      <select
                        className="form-control"
                        value={newAdminForm.branch}
                        disabled={isBranchAdm}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, branch: e.target.value }))}
                      >
                        {isSuper ? (
                          branches.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))
                        ) : (
                          <option value={getLoggedInUserBranch()}>{getLoggedInUserBranch()}</option>
                        )}
                      </select>
                    </div>
                    {(newAdminForm.role === 'trainer' || newAdminForm.role === 'coordinator') && (
                      <div className="form-group">
                        <label>Assigned Batch</label>
                        <select
                          className="form-control"
                          value={newAdminForm.batch}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, batch: e.target.value }))}
                        >
                          {getFilteredBatchOptions(newAdminForm.branch).map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm Password"
                      value={newAdminForm.confirmPassword}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                  <button className="btn-primary" type="submit">Create Account</button>
                  <button className="btn-secondary" type="button" onClick={() => setIsAdminModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Admin */}
        {editingAdmin && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div className="panel-header">
                <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} color="var(--color-primary)" /> Edit Admin Profile: {editingAdmin.username}
                </h2>
                <button className="btn-icon" onClick={() => setEditingAdmin(null)}><X size={24} /></button>
              </div>
              <form onSubmit={handleUpdateAdmin} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter user's full name"
                    value={editingAdmin.fullName || ''}
                    onChange={(e) => setEditingAdmin(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="email@example.com"
                      value={editingAdmin.email || ''}
                      onChange={(e) => setEditingAdmin(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Phone number"
                      value={editingAdmin.phone || ''}
                      onChange={(e) => setEditingAdmin(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Employee ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Emp ID"
                      value={editingAdmin.employeeId || ''}
                      onChange={(e) => setEditingAdmin(prev => ({ ...prev, employeeId: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>System Role</label>
                    <select
                      className="form-control"
                      value={editingAdmin.role}
                      disabled={isBranchAdm}
                      onChange={(e) => setEditingAdmin(prev => ({ ...prev, role: e.target.value }))}
                    >
                      {isSuper ? (
                        <>
                          <option value="superadmin">Super Admin</option>
                          <option value="branchadmin">Branch Admin</option>
                          <option value="trainer">Trainer</option>
                        </>
                      ) : (
                        <option value="trainer">Trainer</option>
                      )}
                    </select>
                  </div>
                </div>

                {editingAdmin.role !== 'superadmin' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label>Assigned Branch</label>
                      <select
                        className="form-control"
                        value={editingAdmin.branch || ''}
                        disabled={isBranchAdm}
                        onChange={(e) => setEditingAdmin(prev => ({ ...prev, branch: e.target.value }))}
                      >
                        {isSuper ? (
                          branches.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))
                        ) : (
                          <option value={getLoggedInUserBranch()}>{getLoggedInUserBranch()}</option>
                        )}
                      </select>
                    </div>
                    {(editingAdmin.role === 'trainer' || editingAdmin.role === 'coordinator') && (
                      <div className="form-group">
                        <label>Assigned Batch</label>
                        <select
                          className="form-control"
                          value={editingAdmin.batch || ''}
                          onChange={(e) => setEditingAdmin(prev => ({ ...prev, batch: e.target.value }))}
                        >
                          {getFilteredBatchOptions(editingAdmin.branch).map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#ff9f0a' }}>Force Reset Password (Optional)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Leave blank to keep current"
                        value={editingAdmin.password || ''}
                        onChange={(e) => setEditingAdmin(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm Password"
                        value={editingAdmin.confirmPassword || ''}
                        onChange={(e) => setEditingAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                  <button className="btn-primary" type="submit">Save Changes</button>
                  <button className="btn-secondary" type="button" onClick={() => setEditingAdmin(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  };

  const renderSettings = () => {
    const isSuper = isAdminUser(loggedInUser);
    const isBranchAdm = isBranchAdmin(loggedInUser);
    const hasAccess = isSuper || isBranchAdm;

    if (!hasAccess) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Only administrators can view or modify settings.</p>
        </div>
      );
    }



    const handleForceLogoutSession = (tokenToTerminate) => {
      const currentToken = getSessionToken();
      if (tokenToTerminate === currentToken) {
        setSettingsError('You cannot terminate your own active session from here. Use the standard logout button instead.');
        return;
      }
      if (!window.confirm('Are you sure you want to terminate this user session? The user will be immediately logged out.')) {
        return;
      }

      fetch(`${API_BASE_URL}/sessions/${tokenToTerminate}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSettingsSuccess('Session terminated successfully!');
            // Refresh list
            fetch(`${API_BASE_URL}/sessions`)
              .then(res => res.json())
              .then(data => setActiveSessions(data || []))
              .catch(err => console.error(err));
          } else {
            throw new Error('Failed to terminate session');
          }
        })
        .catch(err => {
          setSettingsError('Error terminating session: ' + err.message);
        });
    };

    const handleLogoutAllSessions = () => {
      const currentToken = getSessionToken();

      if (window.confirm("Do you want to terminate all OTHER active sessions? (You will remain logged in)")) {
        setSettingsError('');
        setSettingsSuccess('');
        fetch(`${API_BASE_URL}/sessions?except=${currentToken}`, {
          method: 'DELETE'
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSettingsSuccess(`Successfully terminated ${data.deletedCount || 0} other session(s)!`);
              fetch(`${API_BASE_URL}/sessions`)
                .then(res => res.json())
                .then(data => setActiveSessions(data || []))
                .catch(err => console.error(err));
            } else {
              throw new Error(data.error || 'Failed to terminate other sessions');
            }
          })
          .catch(err => {
            setSettingsError('Error terminating sessions: ' + err.message);
          });
      } else if (window.confirm("Do you want to terminate ALL active sessions (including this one)? You will be logged out immediately.")) {
        setSettingsError('');
        setSettingsSuccess('');
        fetch(`${API_BASE_URL}/sessions`, {
          method: 'DELETE'
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSettingsSuccess('All sessions terminated. Logging you out...');
              setTimeout(() => {
                const isAdm = isAdminUser(loggedInUser);
                const token = getSessionToken();
                if (token) {
                  fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                  }).catch(err => console.error(err));
                }
                clearSession();
                setLoggedInUser('');
                if (isAdm) {
                  setAppMode('superadmin-login');
                } else {
                  setAppMode('login');
                }
              }, 1500);
            } else {
              throw new Error(data.error || 'Failed to terminate all sessions');
            }
          })
          .catch(err => {
            setSettingsError('Error terminating all sessions: ' + err.message);
          });
      }
    };

    const handleCreateCoupon = (e) => {
      e.preventDefault();
      setSettingsError('');
      setSettingsSuccess('');

      const code = newCouponForm.code.toUpperCase().trim();
      const type = newCouponForm.type || 'percentage';
      const value = parseInt(newCouponForm.value, 10);

      if (!code) {
        setSettingsError('Please provide a valid coupon code.');
        return;
      }
      if (isNaN(value) || value < 1) {
        setSettingsError('Please provide a valid discount value (minimum 1).');
        return;
      }
      if (type === 'percentage' && value > 100) {
        setSettingsError('Percentage discount cannot exceed 100%.');
        return;
      }

      const updatedCoupons = {
        ...coupons,
        [code]: { type, value }
      };

      fetch(`${API_BASE_URL}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupons: updatedCoupons })
      })
        .then(res => res.json())
        .then(data => {
          setCoupons(data.coupons || {});
          setNewCouponForm({ code: '', type: 'percentage', value: '' });
          setSettingsSuccess(`Coupon "${code}" (${type === 'percentage' ? `${value}%` : `₹${value}`} off) created successfully!`);
        })
        .catch(err => {
          setSettingsError('Error creating coupon: ' + err.message);
        });
    };

    const handleDeleteCoupon = (codeToDelete) => {
      setSettingsError('');
      setSettingsSuccess('');

      if (!window.confirm(`Are you sure you want to delete the coupon "${codeToDelete}"?`)) {
        return;
      }

      const originalCoupons = { ...coupons };
      const updatedCoupons = { ...coupons };
      delete updatedCoupons[codeToDelete];

      // Optimistically update the UI
      setCoupons(updatedCoupons);

      fetch(`${API_BASE_URL}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupons: updatedCoupons })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete coupon on server');
          return res.json();
        })
        .then(data => {
          setCoupons(data.coupons || {});
          setSettingsSuccess(`Coupon "${codeToDelete}" deleted successfully!`);
        })
        .catch(err => {
          // Revert to original if failed
          setCoupons(originalCoupons);
          setSettingsError('Error deleting coupon: ' + err.message);
        });
    };


    const handleSettingsUpdateAdmin = (e) => {
      e.preventDefault();
      setSettingsError('');
      setSettingsSuccess('');
      setAdminPasswordError('');

      const acc = adminForm.account;
      const user = adminForm.newUsername.toLowerCase().trim() || acc;
      const pass = adminForm.newPassword;

      if (pass !== adminForm.confirmPassword) {
        setAdminPasswordError('Passwords do not match');
        return;
      }

      const matchedUser = adminsList.find(u => u.username.toLowerCase().trim() === acc.toLowerCase().trim());
      if (!matchedUser) {
        setSettingsError(`Admin account "${acc}" not found in system database.`);
        return;
      }

      const updatePayload = {
        username: user,
        password: pass || undefined
      };

      fetch(`${API_BASE_URL}/admins/${matchedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      })
        .then(res => {
          if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to update credentials on server') });
          return res.json();
        })
        .then(data => {
          setSettingsSuccess(`Admin account "${user}" credentials updated successfully!`);
          setAdminForm({ account: 'admin', newUsername: '', newPassword: '', confirmPassword: '' });
          reloadAllAppData();
        })
        .catch(err => {
          setSettingsError('Error updating credentials: ' + err.message);
        });
    };

    const handleSettingsCreateAdmin = (e) => {
      e.preventDefault();
      setSettingsError('');
      setSettingsSuccess('');
      setCreateAdminPasswordError('');

      const user = createAdminForm.username.toLowerCase().trim();
      const pass = createAdminForm.password;

      if (!user) {
        setSettingsError('Username is required');
        return;
      }

      if (adminsList.some(a => a.username.toLowerCase().trim() === user)) {
        setSettingsError('Username already exists');
        return;
      }

      if (pass !== createAdminForm.confirmPassword) {
        setCreateAdminPasswordError('Passwords do not match');
        return;
      }

      fetch(`${API_BASE_URL}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user,
          password: pass,
          role: 'superadmin'
        })
      })
        .then(res => {
          if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to create account on server') });
          return res.json();
        })
        .then(data => {
          setSettingsSuccess(`New Admin account "${user}" created successfully!`);
          setCreateAdminForm({ username: '', password: '', confirmPassword: '' });
          reloadAllAppData();
        })
        .catch(err => {
          setSettingsError('Error creating admin account: ' + err.message);
        });
    };

    const handleDeleteAdminAccount = (accountToDelete) => {
      if (accountToDelete.toLowerCase().trim() === loggedInUser.toLowerCase().trim()) {
        setSettingsError('You cannot delete the account you are currently logged in with.');
        return;
      }
      if (!window.confirm(`Are you sure you want to delete the admin account "${accountToDelete}"?`)) {
        return;
      }

      const matchedUser = adminsList.find(u => u.username.toLowerCase().trim() === accountToDelete.toLowerCase().trim());
      if (!matchedUser) {
        setSettingsError(`Admin account "${accountToDelete}" not found in system database.`);
        return;
      }

      fetch(`${API_BASE_URL}/admins/${matchedUser._id}?permanent=true`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to delete account on server') });
          return res.json();
        })
        .then(data => {
          setSettingsSuccess(`Admin account "${accountToDelete}" deleted successfully!`);
          setAdminForm({ account: 'admin', newUsername: '', newPassword: '', confirmPassword: '' });
          reloadAllAppData();
        })
        .catch(err => {
          setSettingsError('Error deleting admin account: ' + err.message);
        });
    };

    const handleUpdateBranchPassword = (e) => {
      e.preventDefault();
      setSettingsError('');
      setSettingsSuccess('');
      setBranchPasswordError('');

      const br = branchForm.branch;
      const pass = branchForm.newPassword;
      const user = branchForm.newUsername.trim() || branchCredentials[br]?.username || `admin@${br}`;

      if (pass !== branchForm.confirmPassword) {
        setBranchPasswordError('Passwords do not match');
        return;
      }

      const updatedBranchCreds = {
        ...branchCredentials,
        [br]: { username: user, password: pass }
      };

      fetch(`${API_BASE_URL}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchCredentials: updatedBranchCreds })
      })
        .then(res => res.json())
        .then(data => {
          setBranchCredentials(data.branchCredentials || {});
          setSettingsSuccess(`Branch Inspector credentials for "${br.toUpperCase()}" updated successfully!`);
          setBranchForm({ branch: br, newUsername: '', newPassword: '', confirmPassword: '' });
        })
        .catch(err => {
          setSettingsError('Error updating credentials: ' + err.message);
        });
    };

    const handleUpdateBatchPassword = (e) => {
      e.preventDefault();
      setSettingsError('');
      setSettingsSuccess('');
      setBatchPasswordError('');

      const br = batchForm.branch;
      const bt = batchForm.batch;
      const key = `${br}_${bt}`;
      const pass = batchForm.newPassword;
      const defaultUser = `${bt}@${br}`;
      const user = batchForm.newUsername.trim() || batchCredentials[key]?.username || defaultUser;

      if (pass !== batchForm.confirmPassword) {
        setBatchPasswordError('Passwords do not match');
        return;
      }

      const updatedBatchCreds = {
        ...batchCredentials,
        [key]: { username: user, password: pass }
      };

      fetch(`${API_BASE_URL}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchCredentials: updatedBatchCreds })
      })
        .then(res => res.json())
        .then(data => {
          setBatchCredentials(data.batchCredentials || {});
          setSettingsSuccess(`Trainer credentials for "${br.toUpperCase()} - ${bt.toUpperCase()}" updated successfully!`);
          setBatchForm({ branch: br, batch: bt, newUsername: '', newPassword: '', confirmPassword: '' });
        })
        .catch(err => {
          setSettingsError('Error updating credentials: ' + err.message);
        });
    };

    return (
      <div className="settings-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {settingsError && <div style={{ color: '#E50914', marginBottom: '1.5rem', background: 'rgba(229, 9, 20, 0.1)', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.3)', fontWeight: 500 }}>{settingsError}</div>}
        {settingsSuccess && <div style={{ color: '#4CAF50', marginBottom: '1.5rem', background: 'rgba(76, 175, 80, 0.1)', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(76, 175, 80, 0.3)', fontWeight: 500 }}>{settingsSuccess}</div>}

        {isSuper && (
          <>

            {/* Billing Month Configuration */}
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="panel-title">Starting Billing Month Configuration</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                setSettingsError('');
                setSettingsSuccess('');
                fetch(`${API_BASE_URL}/system-settings`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ startingBillingMonth })
                })
                  .then(res => {
                    if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to update system settings') });
                    return res.json();
                  })
                  .then(data => {
                    setSettingsSuccess('Starting billing month updated successfully!');
                    setStartingBillingMonth(data.startingBillingMonth || '');
                    reloadAllAppData();
                  })
                  .catch(err => {
                    setSettingsError('Error updating system settings: ' + err.message);
                  });
              }}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Starting Billing Month</label>
                  <input
                    type="month"
                    className="form-control"
                    value={startingBillingMonth}
                    onChange={(e) => setStartingBillingMonth(e.target.value)}
                    required
                  />
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Student monthly fees and dues will only be calculated from this month onwards (or their joining date, whichever is later).
                  </p>
                </div>
                <button type="submit" className="btn-primary">Save Configuration</button>
              </form>
            </div>

            {/* Admin Accounts Settings */}
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="panel-title">Update Admin Accounts</h3>
              </div>
              <form onSubmit={handleSettingsUpdateAdmin}>
                <div className="grid-2-col" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Select Admin Account</label>
                    <select className="form-control" value={adminForm.account} onChange={(e) => setAdminForm({ ...adminForm, account: e.target.value, newUsername: e.target.value })}>
                      {Object.keys(adminCredentials).map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>New Username (Optional)</label>
                    <input type="text" className="form-control" placeholder="Enter new username" value={adminForm.newUsername} onChange={(e) => setAdminForm({ ...adminForm, newUsername: e.target.value })} />
                  </div>
                </div>
                <div className="grid-2-col" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" className="form-control" placeholder="Enter new password" required value={adminForm.newPassword} onChange={(e) => { setAdminForm({ ...adminForm, newPassword: e.target.value }); setAdminPasswordError(''); }} />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" className="form-control" placeholder="Confirm new password" required value={adminForm.confirmPassword} onChange={(e) => { setAdminForm({ ...adminForm, confirmPassword: e.target.value }); setAdminPasswordError(''); }} />
                    {adminPasswordError && (
                      <div style={{ color: '#E50914', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{adminPasswordError}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn-primary">Update Admin Account</button>
                  {adminForm.account.toLowerCase().trim() !== loggedInUser.toLowerCase().trim() && (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ backgroundColor: '#F44336', borderColor: '#F44336' }}
                      onClick={() => handleDeleteAdminAccount(adminForm.account)}
                    >
                      Delete Selected Account
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Create New Admin Account */}
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="panel-title">Create New Admin Account</h3>
              </div>
              <form onSubmit={handleSettingsCreateAdmin}>
                <div className="grid-2-col" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Admin Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter username"
                      required
                      value={createAdminForm.username}
                      onChange={(e) => setCreateAdminForm({ ...createAdminForm, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Admin Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter password"
                      required
                      value={createAdminForm.password}
                      onChange={(e) => { setCreateAdminForm({ ...createAdminForm, password: e.target.value }); setCreateAdminPasswordError(''); }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm password"
                    required
                    value={createAdminForm.confirmPassword}
                    onChange={(e) => { setCreateAdminForm({ ...createAdminForm, confirmPassword: e.target.value }); setCreateAdminPasswordError(''); }}
                  />
                  {createAdminPasswordError && (
                    <div style={{ color: '#E50914', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{createAdminPasswordError}</div>
                  )}
                </div>
                <button type="submit" className="btn-primary">Create Admin Account</button>
              </form>
            </div>

            {/* Admin Accounts List & Management */}
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="panel-title">Admin User Accounts List</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table responsive-table-cards">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(adminCredentials).map(acc => (
                      <tr key={acc}>
                        <td data-label="Username" style={{ fontWeight: 500, color: 'var(--color-text-light)' }}>{acc}</td>
                        <td data-label="Status">
                          {acc === 'admin' ? (
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Default Superadmin</span>
                          ) : acc === loggedInUser ? (
                            <span className="badge badge-green">Logged In</span>
                          ) : (
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Admin</span>
                          )}
                        </td>
                        <td data-label="Action">
                          {acc.toLowerCase().trim() !== loggedInUser.toLowerCase().trim() && acc.toLowerCase().trim() !== 'admin' ? (
                            <button
                              type="button"
                              className="btn-small"
                              style={{ backgroundColor: '#F44336', borderColor: '#F44336' }}
                              onClick={() => handleDeleteAdminAccount(acc)}
                            >
                              Delete Account
                            </button>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Non-deletable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manage Active Sessions */}
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="panel-title">Manage Active Sessions</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-small btn-secondary"
                    onClick={() => {
                      fetch(`${API_BASE_URL}/sessions`)
                        .then(res => res.json())
                        .then(data => {
                          setActiveSessions(data || []);
                          setSettingsSuccess('Sessions list refreshed!');
                        })
                        .catch(err => setSettingsError('Error refreshing sessions: ' + err.message));
                    }}
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    className="btn-small"
                    style={{ backgroundColor: '#F44336', borderColor: '#F44336', color: 'white' }}
                    onClick={handleLogoutAllSessions}
                  >
                    Logout All
                  </button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table responsive-table-cards">
                  <thead>
                    <tr>
                      <th>User / Role</th>
                      <th>Branch</th>
                      <th>Login Time</th>
                      <th>IP Address</th>
                      <th>Client Details</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSessions.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                          No active sessions found.
                        </td>
                      </tr>
                    ) : (
                      activeSessions.map(session => {
                        const isCurrent = session.token === getSessionToken();
                        const loginDateFormatted = new Date(session.loginTime).toLocaleString();
                        const clientDetails = parseClientDetails(session.userAgent, session.deviceName);
                        const details = getSessionDetails(session.username);

                        return (
                          <tr key={session.token}>
                            <td data-label="User / Role" style={{ fontWeight: 500, color: 'var(--color-text-light)' }}>
                              <div style={{ fontWeight: 600 }}>{session.username}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>{details.role}</div>
                            </td>
                            <td data-label="Branch" style={{ color: 'var(--color-text-light)' }}>
                              {details.branch}
                            </td>
                            <td data-label="Login Time" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                              {loginDateFormatted}
                            </td>
                            <td data-label="IP Address" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                              {session.ipAddress || 'Unknown'}
                            </td>
                            <td data-label="Client Details" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }} title={session.userAgent}>
                              {clientDetails}
                            </td>
                            <td data-label="Action">
                              {isCurrent ? (
                                <span className="badge badge-green">Current Session</span>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-small"
                                  style={{ backgroundColor: '#F44336', borderColor: '#F44336' }}
                                  onClick={() => handleForceLogoutSession(session.token)}
                                >
                                  Force Logout
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Manage Coupons Panel */}
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="panel-title">Manage Coupons</h3>
          </div>
          <form onSubmit={handleCreateCoupon} style={{ marginBottom: '2rem' }}>
            <div className="grid-2-col" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Coupon Code (e.g., FIT25)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter code"
                  required
                  value={newCouponForm.code || ''}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase().trim() })}
                />
              </div>
              <div className="grid-2-col" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    className="form-control"
                    value={newCouponForm.type || 'percentage'}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{newCouponForm.type === 'amount' ? 'Discount Amount (₹)' : 'Discount Percentage (1-100)'}</label>
                  <input
                    type="number"
                    min="1"
                    max={newCouponForm.type === 'percentage' ? 100 : undefined}
                    className="form-control"
                    placeholder={newCouponForm.type === 'amount' ? "e.g. 200" : "e.g. 25"}
                    required
                    value={newCouponForm.value || ''}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, value: parseInt(e.target.value, 10) || '' })}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary">Create Coupon</button>
          </form>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Active Coupons List</label>
          {Object.keys(coupons).length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No custom coupons created yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table responsive-table-cards">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(coupons).map(([code, couponData]) => {
                    const coupon = typeof couponData === 'number' ? { type: 'percentage', value: couponData } : couponData;
                    const displayValue = coupon.type === 'amount' ? `₹${coupon.value}` : `${coupon.value}%`;
                    return (
                      <tr key={code}>
                        <td data-label="Coupon Code" style={{ fontWeight: 500, color: 'var(--color-text-light)' }}>{code}</td>
                        <td data-label="Discount"><span className="badge badge-green">{displayValue} Off</span></td>
                        <td data-label="Action">
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn-small"
                              style={{ backgroundColor: '#F44336', borderColor: '#F44336', color: 'white', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', borderRadius: '4px' }}
                              onClick={() => handleDeleteCoupon(code)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Admin Login View ---
  const renderLogin = () => {
    return (
      <div className={`login-layout ${isMaintenanceUpcoming ? 'has-maintenance-banner' : ''}`} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflowY: 'auto', padding: '1rem 0.5rem' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,5,0.85)' }}></div>
        {isMaintenanceUpcoming && (
          <div className="maintenance-alert-banner" style={{ zIndex: 100, top: '0px' }}>
            <AlertTriangle size={18} className="pulse-icon" />
            <span>Upcoming Maintenance: Portal login will be restricted from {formatMaintenanceTime(maintenanceStart)} to {formatMaintenanceTime(maintenanceEnd)}.</span>
          </div>
        )}
        <div className="login-grid-overlay"></div>
        <div className="login-bg-glows">
          <div className="login-glow-1"></div>
          <div className="login-glow-2"></div>
          <div className="login-glow-3"></div>
        </div>
        <div className={`glass-panel login-card-animated ${isLoggingIn ? 'submitting' : ''}`} style={{ zIndex: 1, padding: '1.5rem 2rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 className="brand animate-item-1" style={{ justifyContent: 'center', marginBottom: '0.25rem', fontSize: '1.8rem' }}>
            <span className="brand-accent">MASTER</span> FIT Login
          </h2>
          <p className="animate-item-2" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Branch & Batch Portal</p>
          {isForgotPassword ? (
            <>
              <p className="animate-item-3" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>If you forgot your password, please contact the administrator via WhatsApp.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(() => {
                  const batchName = selectedBatchLogin === 'admin'
                    ? 'Branch Admin (All Batches)'
                    : (batchOptions.find(b => b.id === selectedBatchLogin)?.name || selectedBatchLogin);
                  const msgText = `Hi, I need to reset my password for the MASTER FIT dashboard. Branch: ${selectedBranchLogin}, Batch: ${batchName}.`;
                  return (
                    <a
                      href={`https://wa.me/919567964340?text=${encodeURIComponent(msgText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary animate-item-4"
                      style={{ width: '100%', justifyContent: 'center', background: '#25D366', color: 'white', textDecoration: 'none' }}
                    >
                      <MessageCircle size={18} style={{ marginRight: '8px' }} /> Contact via WhatsApp
                    </a>
                  );
                })()}
                <button type="button" className="btn-outline-primary animate-item-5" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} onClick={() => setIsForgotPassword(false)}>Back to Login</button>
              </div>
            </>
          ) : (
            <>
              {loginError && <div style={{ color: '#E50914', marginBottom: '1rem', background: 'rgba(229, 9, 20, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.3)' }} className="animate-item-3">{loginError}</div>}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsLoggingIn(true);
                const branchKey = selectedBranchLogin.toLowerCase();
                const batchKey = selectedBatchLogin;
                const enteredUser = loginData.username.toLowerCase().trim();
                const enteredPassword = loginData.password;

                let devName = '';
                if (navigator.userAgentData) {
                  try {
                    const uaData = await navigator.userAgentData.getHighEntropyValues(['model']);
                    if (uaData && uaData.model) {
                      devName = uaData.model;
                    }
                  } catch (err) {
                    console.error('Failed to get high entropy device data:', err);
                  }
                }

                fetch(`${API_BASE_URL}/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    loginType: 'trainer',
                    username: enteredUser,
                    password: enteredPassword,
                    branch: branchKey,
                    batch: batchKey,
                    deviceName: devName
                  })
                })
                  .then(res => {
                    if (!res.ok) {
                      return res.json().then(errData => {
                        throw new Error(errData.error || 'Invalid username or password for selected branch and batch');
                      });
                    }
                    return res.json();
                  })
                  .then(data => {
                    setIsLoggingIn(false);
                    if (data.success) {
                      setLoginError('');
                      setLoggedInUser(data.username);
                      setSession(data.username, data.token, data.role, data.branch, data.batch);
                      setUserRole(data.role || '');
                      setUserBranch(data.branch || '');
                      setUserBatch(data.batch || '');
                      setUserLoginCount(data.loginCount);
                      const matchingBranch = branches.find(b => b.toLowerCase() === branchKey);
                      setBranchFilter(matchingBranch || 'All');
                      setLoginData({ username: '', password: '' });
                      setAppMode('admin');
                    } else {
                      setLoginError(data.error || 'Invalid username or password for selected branch and batch');
                    }
                  })
                  .catch(err => {
                    setIsLoggingIn(false);
                    const isNetworkError = err.message && (err.message.includes('Failed to fetch') || err.message.includes('fetch'));
                    setLoginError(isNetworkError ? 'Connection error: The database server may be spinning up. Please wait 1 minute and try again.' : err.message);
                  });
              }}>
                <div className="form-group animate-item-3" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
                  <label style={{ marginBottom: '0.25rem', fontSize: '0.85rem' }}>Select Branch</label>
                  <select
                    className="form-control form-control-animated"
                    value={selectedBranchLogin}
                    disabled={isLoggingIn}
                    onChange={(e) => setSelectedBranchLogin(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer', height: '38px', padding: '0.5rem' }}
                  >
                    {branches.map(b => (
                      <option key={b} value={b} style={{ background: '#1a1a1a', color: '#ffffff' }}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group animate-item-4" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
                  <label style={{ marginBottom: '0.25rem', fontSize: '0.85rem' }}>Select Batch</label>
                  <select
                    className="form-control form-control-animated"
                    value={selectedBatchLogin}
                    disabled={isLoggingIn}
                    onChange={(e) => setSelectedBatchLogin(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer', height: '38px', padding: '0.5rem' }}
                  >
                    <option value="admin" style={{ background: '#1a1a1a', color: '#ffffff' }}>Branch Admin (All Batches)</option>
                    {getFilteredBatchOptions(selectedBranchLogin).map(opt => (
                      <option key={opt.id} value={opt.id} style={{ background: '#1a1a1a', color: '#ffffff' }}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group animate-item-5" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
                  <label style={{ marginBottom: '0.25rem', fontSize: '0.85rem' }}>Username</label>
                  <input type="text" className="form-control form-control-animated" placeholder="Enter username" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} disabled={isLoggingIn} required style={{ height: '38px' }} />
                </div>
                <div className="form-group animate-item-6" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ margin: 0, fontSize: '0.85rem' }}>Password</label>
                    <a href="#" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); if (!isLoggingIn) { setIsForgotPassword(true); setLoginError(''); } }}>Forgot Password?</a>
                  </div>
                  <input type="password" className="form-control form-control-animated" placeholder="Enter password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} disabled={isLoggingIn} required style={{ height: '38px' }} />
                </div>
                <button type="submit" className="btn-primary animate-item-7" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', height: '38px' }} disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <div className="btn-loading-spinner">
                      <span className="spinner-dots">
                        <span className="spinner-dot"></span>
                        <span className="spinner-dot"></span>
                        <span className="spinner-dot"></span>
                      </span>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Login to Dashboard"
                  )}
                </button>
              </form>
              <button type="button" className="btn-secondary animate-item-7" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px', height: '38px' }} disabled={isLoggingIn} onClick={() => {
                setNewStudent({ name: '', age: '', dob: '', phone: '', parentPhone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: selectedBranchLogin, photo: null });
                setIsAddModalOpen(true);
              }}>
                <UserPlus size={16} /> Enroll New Student
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }} className="animate-item-7">
                <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent', padding: '4px 0', fontSize: '0.9rem' }} disabled={isLoggingIn} onClick={() => { setLoginError(''); setAppMode('superadmin-login'); }}>
                  Switch to Admin Login
                </button>
                <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent', padding: '4px 0', fontSize: '0.9rem' }} disabled={isLoggingIn} onClick={() => { setLoginError(''); setAppMode('website'); }}>
                  Back to Website
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // --- Admin Login View ---
  const renderSuperAdminLogin = () => (
    <div className={`login-layout ${isMaintenanceUpcoming ? 'has-maintenance-banner' : ''}`} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflowY: 'auto', padding: '1rem 0.5rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,5,0.85)' }}></div>
      {isMaintenanceUpcoming && (
        <div className="maintenance-alert-banner" style={{ zIndex: 100, top: '0px' }}>
          <AlertTriangle size={18} className="pulse-icon" />
          <span>Upcoming Maintenance: Portal login will be restricted from {formatMaintenanceTime(maintenanceStart)} to {formatMaintenanceTime(maintenanceEnd)}.</span>
        </div>
      )}
      <div className="login-grid-overlay"></div>
      <div className="login-bg-glows">
        <div className="login-glow-1"></div>
        <div className="login-glow-2"></div>
        <div className="login-glow-3"></div>
      </div>
      <div className={`glass-panel login-card-animated ${isLoggingIn ? 'submitting' : ''}`} style={{ zIndex: 1, padding: '1.5rem 2rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 className="brand animate-item-1" style={{ justifyContent: 'center', marginBottom: '0.25rem', fontSize: '1.8rem' }}>
          <span className="brand-accent">MASTER</span> FIT Admin
        </h2>
        <p className="animate-item-2" style={{ color: 'var(--color-secondary)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Portal</p>
        {isForgotPassword ? (
          <div style={{ textAlign: 'left' }}>
            {loginError && <div style={{ color: '#E50914', marginBottom: '1rem', background: 'rgba(229, 9, 20, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.3)' }} className="animate-item-3">{loginError}</div>}

            {forgotStep === 1 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                setLoginError('');
                setIsLoggingIn(true);
                fetch(`${API_BASE_URL}/superadmin/forgot-password/send-otp`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: forgotUsername, phone: forgotPhone })
                })
                  .then(res => {
                    if (!res.ok) {
                      return res.json().then(errData => {
                        throw new Error(errData.error || 'Failed to send OTP');
                      });
                    }
                    return res.json();
                  })
                  .then(data => {
                    setIsLoggingIn(false);
                    if (data.success) {
                      if (data.debugOtp) {
                        alert(`[TEST MODE] OTP is ${data.debugOtp}\n(For real SMS/WhatsApp, configure FAST2SMS_API_KEY or CALLMEBOT_API_KEY in backend .env)`);
                      } else {
                        alert(data.message || 'OTP sent successfully!');
                      }
                      setForgotStep(2);
                    } else {
                      setLoginError(data.error || 'Failed to send OTP');
                    }
                  })
                  .catch(err => {
                    setIsLoggingIn(false);
                    setLoginError(err.message);
                  });
              }}>
                <p className="animate-item-3" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                  Enter your admin username and registered phone number to receive a 6-digit OTP code.
                </p>
                <div className="form-group animate-item-4">
                  <label>Admin Username</label>
                  <input
                    type="text"
                    className="form-control form-control-animated"
                    placeholder="e.g. admin"
                    value={forgotUsername}
                    disabled={isLoggingIn}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group animate-item-5">
                  <label>Registered Phone Number</label>
                  <input
                    type="tel"
                    className="form-control form-control-animated"
                    placeholder="Enter registered phone number"
                    value={forgotPhone}
                    disabled={isLoggingIn}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary animate-item-6" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <div className="btn-loading-spinner">
                      <span className="spinner-dots">
                        <span className="spinner-dot"></span>
                        <span className="spinner-dot"></span>
                        <span className="spinner-dot"></span>
                      </span>
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    "Send OTP Code"
                  )}
                </button>
                <button
                  type="button"
                  className="btn-outline-primary animate-item-7"
                  style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent', marginTop: '0.75rem' }}
                  disabled={isLoggingIn}
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotStep(1);
                    setLoginError('');
                    setForgotUsername('');
                    setForgotPhone('');
                  }}
                >
                  Back to Login
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                setLoginError('');
                setIsLoggingIn(true);
                fetch(`${API_BASE_URL}/superadmin/forgot-password/verify-otp`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: forgotUsername, otp: forgotOtp })
                })
                  .then(res => {
                    if (!res.ok) {
                      return res.json().then(errData => {
                        throw new Error(errData.error || 'Invalid OTP code');
                      });
                    }
                    return res.json();
                  })
                  .then(data => {
                    setIsLoggingIn(false);
                    if (data.success) {
                      setForgotStep(3);
                    } else {
                      setLoginError(data.error || 'Invalid OTP code');
                    }
                  })
                  .catch(err => {
                    setIsLoggingIn(false);
                    setLoginError(err.message);
                  });
              }}>
                <p className="animate-item-3" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                  Enter the 6-digit OTP code sent to {forgotPhone}.
                </p>

                <div className="form-group animate-item-4">
                  <label>6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength="6"
                    className="form-control form-control-animated"
                    placeholder="Enter 6-digit code"
                    value={forgotOtp}
                    disabled={isLoggingIn}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                  />
                </div>
                <button type="submit" className="btn-primary animate-item-5" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <div className="btn-loading-spinner">
                      <span className="spinner-dots">
                        <span className="spinner-dot"></span>
                        <span className="spinner-dot"></span>
                        <span className="spinner-dot"></span>
                      </span>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify OTP Code"
                  )}
                </button>
                <button
                  type="button"
                  className="btn-outline-primary animate-item-6"
                  style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent', marginTop: '0.75rem' }}
                  disabled={isLoggingIn}
                  onClick={() => {
                    setForgotStep(1);
                    setLoginError('');
                    setForgotOtp('');
                  }}
                >
                  Back to Step 1
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                setLoginError('');

                if (forgotNewPassword !== forgotConfirmPassword) {
                  setLoginError('Passwords do not match');
                  return;
                }

                setIsLoggingIn(true);
                fetch(`${API_BASE_URL}/superadmin/forgot-password/reset`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: forgotUsername,
                    otp: forgotOtp,
                    newPassword: forgotNewPassword
                  })
                })
                  .then(res => {
                    if (!res.ok) {
                      return res.json().then(errData => {
                        throw new Error(errData.error || 'Failed to reset password');
                      });
                    }
                    return res.json();
                  })
                  .then(data => {
                    setIsLoggingIn(false);
                    if (data.success) {
                      alert('Password reset successfully! You can now log in with your new password.');
                      setIsForgotPassword(false);
                      setForgotStep(1);
                      setLoginError('');
                      setForgotUsername('');
                      setForgotPhone('');
                      setForgotOtp('');
                      setForgotNewPassword('');
                      setForgotConfirmPassword('');
                    } else {
                      setLoginError(data.error || 'Failed to reset password');
                    }
                  })
                  .catch(err => {
                    setIsLoggingIn(false);
                    setLoginError(err.message);
                  });
              }}>
                <p className="animate-item-3" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                  Enter your new secure password.
                </p>
                <div className="form-group animate-item-4">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-animated"
                    placeholder="Enter new password"
                    value={forgotNewPassword}
                    disabled={isLoggingIn}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group animate-item-5">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control form-control-animated"
                    placeholder="Confirm new password"
                    value={forgotConfirmPassword}
                    disabled={isLoggingIn}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary animate-item-6" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <div className="btn-loading-spinner">
                      <span className="spinner-dots">
                        <span className="spinner-dot"></span>
                        <span className="spinner-dot"></span>
                        <span className="spinner-dot"></span>
                      </span>
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
                <button
                  type="button"
                  className="btn-outline-primary animate-item-7"
                  style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent', marginTop: '0.75rem' }}
                  disabled={isLoggingIn}
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotStep(1);
                    setLoginError('');
                    setForgotUsername('');
                    setForgotPhone('');
                    setForgotOtp('');
                    setForgotNewPassword('');
                    setForgotConfirmPassword('');
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {loginError && <div style={{ color: '#E50914', marginBottom: '1rem', background: 'rgba(229, 9, 20, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.3)' }} className="animate-item-3">{loginError}</div>}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsLoggingIn(true);
              const usernameLower = loginData.username.toLowerCase().trim();
              const enteredPassword = loginData.password;

              let devName = '';
              if (navigator.userAgentData) {
                try {
                  const uaData = await navigator.userAgentData.getHighEntropyValues(['model']);
                  if (uaData && uaData.model) {
                    devName = uaData.model;
                  }
                } catch (err) {
                  console.error('Failed to get high entropy device data:', err);
                }
              }

              fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  loginType: 'superadmin',
                  username: usernameLower,
                  password: enteredPassword,
                  deviceName: devName
                })
              })
                .then(res => {
                  if (!res.ok) {
                    return res.json().then(errData => {
                      throw new Error(errData.error || 'Invalid admin username or password');
                    });
                  }
                  return res.json();
                })
                .then(data => {
                  setIsLoggingIn(false);
                  if (data.success) {
                    setLoginError('');
                    setLoggedInUser(data.username);
                    setSession(data.username, data.token, data.role, data.branch, data.batch);
                    setUserRole(data.role || '');
                    setUserBranch(data.branch || '');
                    setUserBatch(data.batch || '');
                    setUserLoginCount(data.loginCount);
                    setBranchFilter('All');
                    setLoginData({ username: '', password: '' });
                    setAppMode('admin');
                  } else {
                    setLoginError(data.error || 'Invalid admin username or password');
                  }
                })
                .catch(err => {
                  setIsLoggingIn(false);
                  const isNetworkError = err.message && (err.message.includes('Failed to fetch') || err.message.includes('fetch'));
                  setLoginError(isNetworkError ? 'Connection error: The database server may be spinning up. Please wait 1 minute and try again.' : err.message);
                });
            }}>
              <div className="form-group animate-item-3" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
                <label style={{ marginBottom: '0.25rem', fontSize: '0.85rem' }}>Admin Username</label>
                <input type="text" className="form-control form-control-animated" placeholder="Enter admin username" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} disabled={isLoggingIn} required style={{ height: '38px' }} />
              </div>
              <div className="form-group animate-item-4" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label style={{ margin: 0, fontSize: '0.85rem' }}>Password</label>
                  <a href="#" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); if (!isLoggingIn) { setIsForgotPassword(true); setLoginError(''); } }}>Forgot Password?</a>
                </div>
                <input type="password" className="form-control form-control-animated" placeholder="Enter password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} disabled={isLoggingIn} required style={{ height: '38px' }} />
              </div>
              <button type="submit" className="btn-primary animate-item-5" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', height: '38px' }} disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <div className="btn-loading-spinner">
                    <span className="spinner-dots">
                      <span className="spinner-dot"></span>
                      <span className="spinner-dot"></span>
                      <span className="spinner-dot"></span>
                    </span>
                    <span>Accessing Dashboard...</span>
                  </div>
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }} className="animate-item-6">
              <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent', padding: '4px 0', fontSize: '0.9rem' }} disabled={isLoggingIn} onClick={() => { setLoginError(''); setAppMode('login'); }}>
                Switch to Trainer Login
              </button>
              <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent', padding: '4px 0', fontSize: '0.9rem' }} disabled={isLoggingIn} onClick={() => { setLoginError(''); setAppMode('website'); }}>
                Back to Website
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const isMaintenanceBlocked = () => {
    if (!loggedInUser) {
      return false;
    }
    if (isSystemUnderMaintenance) {
      if (userRole === 'developer') {
        return false;
      }
      if (maintenanceMode === 'all') return true;
      if (maintenanceMode === 'admin' && userRole === 'superadmin') return true;
      if (maintenanceMode === 'branch' && userRole === 'branchadmin') return true;
      if (maintenanceMode === 'batch' && (userRole === 'trainer' || userRole === 'coordinator')) return true;
    }
    return false;
  };

  const renderMaintenancePage = () => {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #1c1c2e 0%, #0d0d15 100%)',
        color: '#fff',
        fontFamily: 'Outfit, sans-serif',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          maxWidth: '500px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            background: 'rgba(94, 92, 230, 0.15)',
            border: '2px solid #5e5ce6',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5e5ce6'
          }}>
            <AlertTriangle size={40} className="pulse-icon" />
          </div>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'linear-gradient(90deg, #5e5ce6, #bf5af2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Outfit, sans-serif'
          }}>
            System Maintenance
          </h1>

          <p style={{
            color: '#a2a2b5',
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            Masterfit Complete System Update is in progress. The application portal is temporarily locked for maintenance.
          </p>

          {maintenanceEnd && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: '#fff',
              marginTop: '0.5rem'
            }}>
              Expected back online: <strong style={{ color: '#bf5af2' }}>{formatMaintenanceTime(maintenanceEnd)}</strong>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '1rem',
            width: '100%',
            marginTop: '1rem'
          }}>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                justifyContent: 'center'
              }}
            >
              Check Again
            </button>
            <button
              onClick={() => {
                sessionStorage.clear();
                clearSession();
                setLoggedInUser(null);
                setUserRole('');
                setAppMode('login');
              }}
              className="btn-secondary"
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#ff453a',
                border: '1px solid rgba(255, 69, 58, 0.2)',
                background: 'rgba(255, 69, 58, 0.05)'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isMaintenanceBlocked()) {
    return renderMaintenancePage();
  }

  if (appMode === 'website') {
    return renderPublic();
  }

  if (appMode === 'login') {
    return renderLogin();
  }

  if (appMode === 'superadmin-login') {
    return renderSuperAdminLogin();
  }

  if (appMode === 'developer') {
    return renderDeveloperPanel();
  }



  // --- Main Admin Dashboard Template ---
  const metrics = getDynamicMetrics();
  return (
    <div className="dashboard-container">
      {/* Sidebar drawer backdrop for mobile */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="brand" style={{ cursor: 'pointer' }} onClick={() => setAppMode('website')}>
            <span className="brand-accent">MASTER</span> FIT Admin
          </h2>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="nav-menu">
          <a className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <Users className="nav-icon" /> <span>Dashboard</span>
          </a>
          <a className={`nav-item ${currentView === 'attendance' ? 'active' : ''}`} onClick={() => setCurrentView('attendance')}>
            <CalendarDays className="nav-icon" /> <span>Attendance</span>
          </a>
          <a className={`nav-item ${currentView === 'fees' ? 'active' : ''}`} onClick={() => setCurrentView('fees')}>
            <Wallet className="nav-icon" /> <span>Fees</span>
          </a>
          <a className={`nav-item ${currentView === 'reminders' ? 'active' : ''}`} onClick={() => setCurrentView('reminders')}>
            <Bell className="nav-icon" /> <span>Reminders</span>
          </a>
          <a className={`nav-item ${currentView === 'performance' ? 'active' : ''}`} onClick={() => setCurrentView('performance')}>
            <TrendingUp className="nav-icon" /> <span>Performance</span>
          </a>
          <div style={{ flex: 1 }}></div>
          {(isAdminUser(loggedInUser) || isBranchAdmin(loggedInUser)) && (
            <a className={`nav-item ${currentView === 'credentials-list' ? 'active' : ''}`} onClick={() => setCurrentView('credentials-list')}>
              <Lock className="nav-icon" /> <span>Branch & Batch Mapping</span>
            </a>
          )}
          {hasSettingsAccess(loggedInUser) && (
            <a className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
              <Settings className="nav-icon" /> <span>Settings</span>
            </a>
          )}
          <a className="nav-item" onClick={() => {
            const isAdm = isAdminUser(loggedInUser);
            const token = getSessionToken();
            if (token) {
              fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
              }).catch(err => console.error(err));
            }
            clearSession();
            setLoggedInUser('');
            if (isAdm) {
              setAppMode('superadmin-login');
            } else {
              setAppMode('login');
            }
          }}>
            <LogOut className="nav-icon" /> <span>Logout</span>
          </a>
        </nav>
      </aside>
 
      <main className="main-content">
        {isSystemUnderMaintenance && (
          <div className="maintenance-alert-banner-static">
            <AlertTriangle size={18} className="pulse-icon" />
            <span>System Alert: The application is currently under maintenance. Regular actions are locked.</span>
          </div>
        )}
        {isMaintenanceUpcoming && (
          <div className="maintenance-alert-banner-static" style={{ background: 'linear-gradient(90deg, #ff9f0a, #ffc700)', color: '#000', marginBottom: '1rem' }}>
            <AlertTriangle size={18} className="pulse-icon" />
            <span><strong>Upcoming Maintenance Notice:</strong> Portal login will be restricted from {formatMaintenanceTime(maintenanceStart)} to {formatMaintenanceTime(maintenanceEnd)}. Please save your work beforehand.</span>
          </div>
        )}
 
        <header className="header">
          <div className="header-main-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="mobile-menu-btn" style={{ padding: 0 }} onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <h1 className="page-title">
                {currentView === 'dashboard' && 'Dashboard'}
                {currentView === 'attendance' && 'Attendance Tracking'}
                {currentView === 'fees' && 'Fee Management'}
                {currentView === 'reminders' && 'Alerts & Reminders'}
                {currentView === 'performance' && 'Student Performance'}
                {currentView === 'settings' && 'Account Settings'}
                {currentView === 'credentials-list' && 'Branch & Batch Mapping'}
              </h1>
            </div>

            <div className="user-profile-mobile">
              <div className="avatar" title={`${loggedInUser} Panel`}>{loggedInUser.charAt(0).toUpperCase()}</div>
            </div>
          </div>

          <div className="header-actions">
            {/* Branch Filter Selector */}
            <div style={{ position: 'relative' }}>
              <select
                className="form-control"
                style={{ padding: '0.5rem 0.75rem', paddingRight: '1.75rem', width: '135px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: '0.85rem' }}
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                disabled={!isAdminUser(loggedInUser)}
              >
                {isAdminUser(loggedInUser) ? (
                  <>
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="All">All Branches</option>
                  </>
                ) : (
                  <option value={branchFilter}>{branchFilter}</option>
                )}
              </select>
            </div>

            {/* Batch Filter Selector */}
            {(currentView === 'dashboard' || currentView === 'attendance' || currentView === 'fees' || currentView === 'performance') && (
              <div style={{ position: 'relative' }}>
                <select
                  className="form-control"
                  style={{ padding: '0.5rem 0.75rem', paddingRight: '1.75rem', width: '135px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: '0.85rem' }}
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  disabled={isBatchAdminUser(loggedInUser)}
                >
                  <option value="All">All Batches</option>
                  {getFilteredBatchOptions().map(opt => (
                    <option key={opt.id} value={opt.schedule}>{opt.name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Status Filter Selector */}
            {(currentView === 'dashboard' || currentView === 'performance') && (
              <div style={{ position: 'relative' }}>
                <select
                  className="form-control"
                  style={{ padding: '0.5rem 0.75rem', paddingRight: '1.75rem', width: '120px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: '0.85rem' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                  <option value="All">All Students</option>
                </select>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search students..."
                className="form-control"
                style={{ paddingLeft: '32px', width: '180px', height: '38px', paddingTop: 0, paddingBottom: 0, fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="header-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
            {/* Notification Bell Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              >
                <Bell size={18} className={unreadNotificationsCount > 0 ? "shake-icon" : ""} />
                {unreadNotificationsCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ff453a',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: '50%',
                    padding: '2px 6px',
                    lineHeight: 1,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                  }}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '320px',
                  background: 'rgba(15, 15, 25, 0.98)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '400px'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>Announcements</span>
                    {unreadNotificationsCount > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#8e8e93' }}>{unreadNotificationsCount} unread</span>
                    )}
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8e8e93', fontSize: '0.8rem' }}>
                        No announcements at the moment.
                      </div>
                    ) : (
                      notifications.map(n => {
                        const currentUserClean = getSessionUser() ? getSessionUser().toLowerCase().trim() : '';
                        const isRead = n.readBy && n.readBy.includes(currentUserClean);
                        return (
                          <div
                            key={n._id}
                            style={{
                              padding: '10px 16px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                              background: isRead ? 'transparent' : 'rgba(94, 92, 230, 0.05)',
                              transition: 'background 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{
                                fontWeight: isRead ? 500 : 700,
                                fontSize: '0.825rem',
                                color: isRead ? '#e2e2ee' : '#fff'
                              }}>
                                {n.title}
                              </span>
                              <span className="badge" style={{
                                background: n.priority === 'high' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: n.priority === 'high' ? '#ff453a' : '#8e8e93',
                                fontSize: '0.6rem',
                                padding: '1px 4px'
                              }}>
                                {n.priority}
                              </span>
                            </div>
                            <p style={{
                              margin: 0,
                              fontSize: '0.75rem',
                              color: '#a2a2b5',
                              lineHeight: '1.4',
                              whiteSpace: 'pre-wrap',
                              textAlign: 'left'
                            }}>
                              {n.message}
                            </p>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '6px',
                              fontSize: '0.65rem',
                              color: '#8e8e93'
                            }}>
                              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                              <button
                                type="button"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: isRead ? '#8e8e93' : '#5e5ce6',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  padding: '2px 0'
                                }}
                                onClick={() => {
                                  if (isRead) {
                                    handleMarkAsUnread(n._id);
                                  } else {
                                    handleMarkAsRead(n._id);
                                  }
                                }}
                              >
                                {isRead ? 'Mark Unread' : 'Mark Read'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile">
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {loggedInUser} Panel
              </span>
              <div className="avatar">{loggedInUser.charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {currentView === 'dashboard' && (
            <>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
                <div className="stat-card">
                  <div className="stat-icon-wrapper"><Users className="stat-icon" /></div>
                  <div className="stat-details">
                    <h3>Active Students</h3>
                    <p className="stat-value">{metrics.totalStudents}</p>
                  </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('attendance')}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(76, 175, 80, 0.1)' }}><Activity className="stat-icon" style={{ color: '#4CAF50' }} /></div>
                  <div className="stat-details">
                    <h3>Today's Attendance</h3>
                    <p className="stat-value" style={{ color: '#4CAF50' }}>
                      {metrics.presentToday} P / {metrics.absentToday} A
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Attendance Rate: {metrics.attendancePercentage}%
                    </span>
                  </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('reminders')}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <Wallet className="stat-icon" style={{ color: '#FFD700' }} />
                  </div>
                  <div className="stat-details">
                    <h3>Fee Collection</h3>
                    <p className="stat-value" style={{ color: '#FFD700' }}>
                      ₹{metrics.feeCollection} / ₹{metrics.pendingFees}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Pending: ₹{metrics.pendingFees}
                    </span>
                  </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => {
                  const classesEl = document.getElementById('today-classes-panel');
                  if (classesEl) classesEl.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(156, 39, 176, 0.1)' }}>
                    <CalendarDays className="stat-icon" style={{ color: '#9C27B0' }} />
                  </div>
                  <div className="stat-details">
                    <h3>Live Classes Today</h3>
                    <p className="stat-value" style={{ color: '#9C27B0' }}>
                      {metrics.filteredClasses.length} {metrics.filteredClasses.length === 1 ? 'Class' : 'Classes'}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', display: 'inline-block' }}>
                      {metrics.filteredClasses.length > 0 ? `Next: ${metrics.filteredClasses[0].className} (${metrics.filteredClasses[0].startTime})` : 'No classes scheduled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3 className="panel-title">Student Details</h3>
                  <button className="btn-primary" onClick={() => {
                    const defaultBranch = getLoggedInUserBranch();
                    const initialBranch = (defaultBranch === 'All' || !defaultBranch) ? (branches[0] || 'Kuttiady') : defaultBranch;
                    const firstBatch = getFilteredBatchOptions(initialBranch)[0];
                    setNewStudent({
                      name: '',
                      age: '',
                      dob: '',
                      phone: '',
                      parentPhone: '',
                      belt: 'White',
                      joinDate: new Date().toISOString().split('T')[0],
                      branch: initialBranch,
                      schedule: firstBatch ? firstBatch.schedule : 'Mon-Thu',
                      batch: firstBatch ? firstBatch.name : 'Morning',
                      photo: null
                    });
                    setIsAddModalOpen(true);
                  }}>
                    <UserPlus size={16} /> Add Student
                  </button>
                </div>
                {searchedStudents.length > 0 ? (
                  <div className="table-responsive">
                    <table className="data-table responsive-table-cards">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Batch Schedule</th>
                          <th>Belt Level</th>
                          <th>Phone</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchedStudents.map(student => (
                          <tr key={student.id}>
                            <td data-label="Name">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleSelectStudent(student)}>
                                {student.photo ? (
                                  <img src={student.photo} alt="" style={{ width: '30px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '30px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'white', textDecoration: 'none' }}>
                                    {student.name.charAt(0)}
                                  </div>
                                )}
                                <span style={{
                                  fontWeight: 500,
                                  color: student.status === 'Inactive' ? 'var(--color-text-muted)' : '#E50914',
                                  textDecoration: 'underline'
                                }}>
                                  {student.name}
                                </span>
                                {student.status === 'Inactive' && (
                                  <span className="badge" style={{ background: 'rgba(244, 67, 54, 0.15)', color: '#F44336', border: '1px solid rgba(244, 67, 54, 0.3)', marginLeft: '8px' }}>
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </td>
                            <td data-label="Batch Schedule">
                              <span className="badge" style={{ background: 'rgba(229, 9, 20, 0.15)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)', marginRight: '8px' }}>{student.branch}</span>
                              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{getBatchNameFromSchedule(student.schedule)} • {student.batch}</span>
                            </td>
                            <td data-label="Belt Level"><span className={`badge ${getBeltColorClass(student.belt)}`}>{student.belt}</span></td>
                            <td data-label="Phone" style={{ color: 'var(--color-text-muted)' }}>{student.phone}</td>
                            <td data-label="Actions">
                              <div className="actions-flex-container">
                                <button className="btn-icon" onClick={() => handleDeleteStudent(student.id)} style={{ color: '#F44336' }} title="Delete">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No students found.</div>
                )}
              </div>

              {/* Scheduled Classes Panel */}
              <div id="today-classes-panel" className="panel" style={{ marginTop: '2rem' }}>
                <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarDays size={20} color="var(--color-primary)" /> Today's Scheduled Classes
                  </h3>
                  <button className="btn-primary btn-small" onClick={handleOpenAddClass}>
                    + Schedule Class
                  </button>
                </div>
                {todayClasses.length > 0 ? (
                  <div className="table-responsive">
                    <table className="data-table responsive-table-cards">
                      <thead>
                        <tr>
                          <th>Class Name</th>
                          <th>Branch / Batch</th>
                          <th>Time</th>
                          <th>Trainer</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayClasses.map(cls => (
                          <tr key={cls._id}>
                            <td data-label="Class Name" style={{ fontWeight: 600, color: 'white' }}>
                              {cls.className}
                              {cls.subject && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Subj: {cls.subject}</span>}
                            </td>
                            <td data-label="Branch / Batch">
                              <span className="badge" style={{ background: 'rgba(229, 9, 20, 0.15)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)', marginRight: '6px' }}>{cls.branch}</span>
                              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{cls.batch}</span>
                            </td>
                            <td data-label="Time" style={{ fontFamily: 'monospace', color: 'var(--color-text-light)' }}>
                              {cls.startTime} - {cls.endTime}
                            </td>
                            <td data-label="Trainer" style={{ color: 'var(--color-text-muted)' }}>
                              {cls.trainer}
                            </td>
                            <td data-label="Actions">
                              <div className="actions-flex-container">
                                <button className="btn-icon" onClick={() => handleOpenEditClass(cls)} style={{ color: '#2196F3' }} title="Edit">
                                  <Settings size={16} />
                                </button>
                                <button className="btn-icon" onClick={() => handleDeleteClass(cls._id)} style={{ color: '#F44336' }} title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No classes scheduled for today.</div>
                )}
              </div>
            </>
          )}

          {currentView === 'attendance' && renderAttendance()}
          {currentView === 'fees' && renderFees()}
          {currentView === 'student-fees' && renderStudentFees()}
          {currentView === 'reminders' && renderReminders()}
          {currentView === 'performance' && renderPerformance()}
          {currentView === 'settings' && renderSettings()}
          {currentView === 'credentials-list' && renderCredentialsList()}
        </div>
      </main>

      {/* Profile Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h2 className="panel-title">{isEditingStudent ? "Edit Student Profile" : "Student Profile"}</h2>
              <button className="btn-icon" onClick={() => {
                setSelectedStudent(null);
                setIsEditingStudent(false);
                setEditingStudentData(null);
              }}><X size={24} /></button>
            </div>

            {isEditingStudent ? (
               <form onSubmit={(e) => {
                 e.preventDefault();

                 const phoneClean = editingStudentData.phone.trim();
                 if (!/^\d{10}$/.test(phoneClean)) {
                   setGlobalError("Mobile number must be exactly 10 digits.");
                   return;
                 }

                 const updatedStudent = { ...editingStudentData, phone: phoneClean };
                 setStudents(sortStudentsAlphabetically(students.map(s => s.id === updatedStudent.id ? updatedStudent : s)));
                 setSelectedStudent(updatedStudent);
                 setIsEditingStudent(false);

                 fetch(`${API_BASE_URL}/students/${updatedStudent.id}`, {
                   method: 'PUT',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify(updatedStudent)
                 })
                   .then(res => {
                     if (!res.ok) {
                       return res.json().then(errData => {
                         throw new Error(errData.error || 'Failed to update student profile');
                       });
                     }
                     return res.json();
                   })
                   .then(() => {
                     setGlobalSuccess("Student profile updated successfully.");
                     reloadAllAppData();
                   })
                   .catch(err => {
                     console.error("Error updating student profile:", err);
                     setGlobalError(`Failed to update student: ${err.message}`);
                     reloadAllAppData();
                   });

                 setEditingStudentData(null);
               }}>
                <div style={{ padding: '1rem 0' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingStudentData.name}
                      onChange={(e) => setEditingStudentData({ ...editingStudentData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editingStudentData.age}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth (DOB)</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editingStudentData.dob || ''}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, dob: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Student Mobile Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editingStudentData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setEditingStudentData({ ...editingStudentData, phone: val });
                          }
                        }}
                        required
                        maxLength="10"
                        pattern="\d{10}"
                        title="Please enter exactly 10 digits"
                      />
                    </div>
                    <div className="form-group">
                      <label>Parent Mobile Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editingStudentData.parentPhone || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setEditingStudentData({ ...editingStudentData, parentPhone: val });
                          }
                        }}
                        required
                        maxLength="10"
                        pattern="\d{10}"
                        title="Please enter exactly 10 digits"
                      />
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Batch Selection Dropdown</label>
                      <select
                        className="form-control"
                        value={batchOptions.find(b => b.name === editingStudentData.batch && b.schedule === editingStudentData.schedule)?.id || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const correspondingOpt = batchOptions.find(b => b.id === selectedId);
                          if (correspondingOpt) {
                            setEditingStudentData({
                              ...editingStudentData,
                              schedule: correspondingOpt.schedule,
                              batch: correspondingOpt.name
                            });
                          }
                        }}
                      >
                        {getFilteredBatchOptions(editingStudentData.branch).map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name} ({opt.schedule})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Time Slot</label>
                      <select
                        className="form-control"
                        value={editingStudentData.batch}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, batch: e.target.value })}
                      >
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Branch</label>
                      <select
                        className="form-control"
                        value={editingStudentData.branch}
                        onChange={(e) => {
                          const selectedBr = e.target.value;
                          const firstBatch = getFilteredBatchOptions(selectedBr)[0];
                          setEditingStudentData({
                            ...editingStudentData,
                            branch: selectedBr,
                            schedule: firstBatch ? firstBatch.schedule : editingStudentData.schedule,
                            batch: firstBatch ? firstBatch.name : editingStudentData.batch
                          });
                        }}
                        disabled={!isAdminUser(loggedInUser)}
                      >
                        {isAdminUser(loggedInUser) ? (
                          branches.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))
                        ) : (
                          <option value={editingStudentData.branch}>{editingStudentData.branch}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Belt Level</label>
                      <select
                        className="form-control"
                        value={editingStudentData.belt}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, belt: e.target.value })}
                      >
                        <option value="White">White Belt</option>
                        <option value="Yellow">Yellow Belt</option>
                        <option value="Orange">Orange Belt</option>
                        <option value="Green">Green Belt</option>
                        <option value="Blue">Blue Belt</option>
                        <option value="Purple">Purple Belt</option>
                        <option value="Brown">Brown Belt</option>
                        <option value="Red">Red Belt</option>
                        <option value="Black">Black Belt</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2-col" style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>Coupon Code (Optional)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter coupon code (e.g. FIT20)"
                          value={editingStudentData.appliedCoupon || ''}
                          onChange={(e) => {
                            const code = e.target.value.toUpperCase().trim();
                            const coupon = resolveCouponCode(code);
                            setEditingStudentData({
                              ...editingStudentData,
                              appliedCoupon: code,
                              couponType: coupon ? coupon.type : 'percentage',
                              couponValue: coupon ? coupon.value : 0,
                              discountPercentage: (coupon && coupon.type === 'percentage') ? coupon.value : 0
                            });
                          }}
                        />
                        {editingStudentData.appliedCoupon && (() => {
                          const coupon = resolveCouponCode(editingStudentData.appliedCoupon);
                          if (coupon) {
                            const display = coupon.type === 'amount' ? `₹${coupon.value}` : `${coupon.value}%`;
                            return (
                              <div style={{ alignSelf: 'center', whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#51CF66', fontWeight: 600 }}>
                                ✓ {display}
                              </div>
                            );
                          } else {
                            return (
                              <div style={{ alignSelf: 'center', whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#FF6B6B', fontWeight: 600 }}>
                                ❌
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Student Status</label>
                      <select
                        className="form-control"
                        value={editingStudentData.status || 'Active'}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => {
                    setIsEditingStudent(false);
                    setEditingStudentData(null);
                  }}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ padding: '1rem 0' }}>
                  <div className="profile-header-top">
                    <div className="profile-info-left">
                      {selectedStudent.photo ? (
                        <img src={selectedStudent.photo} alt={selectedStudent.name} style={{ width: '90px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
                      ) : (
                        <div style={{ width: '90px', height: '120px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                          {selectedStudent.name.charAt(0)}
                        </div>
                      )}
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedStudent.name}</h3>
                    </div>
                    <span className={`badge ${getBeltColorClass(selectedStudent.belt)}`}>{selectedStudent.belt}</span>
                  </div>

                  <div className="grid-2-col" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', gap: '1rem' }}>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Age</span><div style={{ fontWeight: 600 }}>{selectedStudent.age} Years</div></div>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Date of Birth (DOB)</span><div style={{ fontWeight: 600 }}>{selectedStudent.dob || 'N/A'}</div></div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Student Phone</span>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedStudent.phone}
                        <a href={`tel:${selectedStudent.phone}`} style={{ color: '#2196F3', display: 'flex' }} title="Call"><Phone size={14} /></a>
                        <a href={`https://wa.me/${selectedStudent.phone}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', display: 'flex' }} title="WhatsApp"><MessageCircle size={14} /></a>
                        <a href={`sms:${selectedStudent.phone}`} style={{ color: '#FF9800', display: 'flex' }} title="SMS Message"><MessageSquare size={14} /></a>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Parent Phone</span>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedStudent.parentPhone || 'N/A'}
                        {selectedStudent.parentPhone && (
                          <>
                            <a href={`tel:${selectedStudent.parentPhone}`} style={{ color: '#2196F3', display: 'flex' }} title="Call"><Phone size={14} /></a>
                            <a href={`https://wa.me/${selectedStudent.parentPhone}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', display: 'flex' }} title="WhatsApp"><MessageCircle size={14} /></a>
                            <a href={`sms:${selectedStudent.parentPhone}`} style={{ color: '#FF9800', display: 'flex' }} title="SMS Message"><MessageSquare size={14} /></a>
                          </>
                        )}
                      </div>
                    </div>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Join Date</span><div style={{ fontWeight: 600 }}>{selectedStudent.joinDate}</div></div>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Status</span><div style={{ fontWeight: 600, color: selectedStudent.status === 'Inactive' ? '#F44336' : '#4CAF50' }}>{selectedStudent.status || 'Active'}</div></div>
                  </div>

                  <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Academy Details</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: 'var(--color-primary)', color: 'white' }}>{selectedStudent.branch} Branch</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{getBatchNameFromSchedule(selectedStudent.schedule)}</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{selectedStudent.batch} Batch</span>
                    </div>
                  </div>

                  {/* Monthly Attendance Summary */}
                  <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                      <h4 style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Attendance</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Month:</span>
                        <input
                          type="month"
                          className="form-control"
                          style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.85rem', height: '30px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                          value={profileAttendanceMonth}
                          onChange={(e) => setProfileAttendanceMonth(e.target.value)}
                        />
                      </div>
                    </div>
                    {(() => {
                      let present = 0;
                      let absent = 0;
                      Object.keys(attendanceRecords).forEach(dateStr => {
                        if (dateStr.startsWith(profileAttendanceMonth)) {
                          const status = attendanceRecords[dateStr]?.[selectedStudent.id];
                          let statusStr = '';
                          if (typeof status === 'object' && status !== null) {
                            statusStr = status.status || '';
                          } else {
                            statusStr = String(status || '');
                          }
                          const statusLower = statusStr.toLowerCase();
                          if (statusLower === 'present') present++;
                          else if (statusLower === 'absent') absent++;
                        }
                      });
                      const totalMarked = present + absent;
                      const attendanceRate = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '100px', background: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76, 175, 80, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                              <span style={{ color: '#4CAF50', display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Total Present</span>
                              <strong style={{ fontSize: '1.2rem', color: '#4CAF50' }}>{present} Days</strong>
                            </div>
                            <div style={{ flex: 1, minWidth: '100px', background: 'rgba(244, 67, 54, 0.08)', border: '1px solid rgba(244, 67, 54, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                              <span style={{ color: '#F44336', display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Total Absent</span>
                              <strong style={{ fontSize: '1.2rem', color: '#F44336' }}>{absent} Days</strong>
                            </div>
                            <div style={{ flex: 1, minWidth: '100px', background: 'rgba(94, 92, 230, 0.08)', border: '1px solid rgba(94, 92, 230, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                              <span style={{ color: '#5e5ce6', display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Attendance Rate</span>
                              <strong style={{ fontSize: '1.2rem', color: '#5e5ce6' }}>{attendanceRate}%</strong>
                            </div>
                          </div>

                          {/* Calendar view */}
                          {(() => {
                            const [year, month] = profileAttendanceMonth.split('-').map(Number);
                            if (!year || !month) return null;
                            const daysInMonth = new Date(year, month, 0).getDate();
                            const firstDayIndex = new Date(year, month - 1, 1).getDay();
                            
                            return (
                              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                    <div key={d}>{d}</div>
                                  ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                                    <div key={`empty-${idx}`} style={{ aspectRatio: '1', borderRadius: '6px', background: 'transparent' }}></div>
                                  ))}
                                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                                    const dayNum = idx + 1;
                                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                    const record = attendanceRecords[dateStr]?.[selectedStudent.id];
                                    let status = '';
                                    if (record) {
                                      status = (typeof record === 'object') ? (record.status || '') : String(record);
                                    }
                                    
                                    const statusLower = status.toLowerCase();
                                    let cellBg = 'rgba(255, 255, 255, 0.03)';
                                    let cellBorder = '1px solid rgba(255, 255, 255, 0.05)';
                                    let cellColor = 'var(--color-text-light)';
                                    
                                    if (statusLower === 'present') {
                                      cellBg = 'rgba(76, 175, 80, 0.15)';
                                      cellBorder = '1px solid rgba(76, 175, 80, 0.4)';
                                      cellColor = '#4CAF50';
                                    } else if (statusLower === 'absent') {
                                      cellBg = 'rgba(244, 67, 54, 0.15)';
                                      cellBorder = '1px solid rgba(244, 67, 54, 0.4)';
                                      cellColor = '#F44336';
                                    } else if (statusLower === 'holiday') {
                                      cellBg = 'rgba(33, 150, 243, 0.15)';
                                      cellBorder = '1px solid rgba(33, 150, 243, 0.4)';
                                      cellColor = '#2196F3';
                                    } else if (statusLower === 'leave') {
                                      cellBg = 'rgba(255, 152, 0, 0.15)';
                                      cellBorder = '1px solid rgba(255, 152, 0, 0.4)';
                                      cellColor = '#FF9800';
                                    }
                                    
                                    return (
                                      <button
                                        key={`day-${dayNum}`}
                                        type="button"
                                        onClick={() => {
                                          let detail = { date: dateStr, status: 'No Record', checkIn: 'N/A', checkOut: 'N/A', remarks: 'N/A' };
                                          if (record) {
                                            if (typeof record === 'object') {
                                              detail = {
                                                date: dateStr,
                                                status: record.status || 'No Record',
                                                checkIn: record.checkIn || 'N/A',
                                                checkOut: record.checkOut || 'N/A',
                                                remarks: record.remarks || 'N/A'
                                              };
                                            } else {
                                              detail = {
                                                date: dateStr,
                                                status: String(record),
                                                checkIn: 'N/A',
                                                checkOut: 'N/A',
                                                remarks: 'N/A'
                                              };
                                            }
                                          }
                                          setSelectedCalendarDate(dateStr);
                                          setSelectedCalendarDetail(detail);
                                        }}
                                        style={{
                                          aspectRatio: '1',
                                          borderRadius: '6px',
                                          background: cellBg,
                                          border: cellBorder,
                                          color: cellColor,
                                          fontWeight: 600,
                                          fontSize: '0.8rem',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          position: 'relative'
                                        }}
                                        className="calendar-day-btn"
                                        title={`${dateStr} - ${status || 'No Record'}`}
                                      >
                                        {dayNum}
                                      </button>
                                    );
                                  })}
                                </div>
                                
                                {selectedCalendarDate && selectedCalendarDetail && (
                                  <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.85rem', borderRadius: '10px', position: 'relative' }}>
                                    <button 
                                      type="button"
                                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                                      onClick={() => { setSelectedCalendarDate(null); setSelectedCalendarDetail(null); }}
                                    >
                                      <X size={16} />
                                    </button>
                                    <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-secondary)' }}>Attendance: {selectedCalendarDetail.date}</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                      <div>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Status: </span>
                                        <strong style={{ color: 
                                          selectedCalendarDetail.status.toLowerCase() === 'present' ? '#4CAF50' :
                                          selectedCalendarDetail.status.toLowerCase() === 'absent' ? '#F44336' :
                                          selectedCalendarDetail.status.toLowerCase() === 'holiday' ? '#2196F3' :
                                          selectedCalendarDetail.status.toLowerCase() === 'leave' ? '#FF9800' : 'white'
                                        }}>
                                          {selectedCalendarDetail.status.charAt(0).toUpperCase() + selectedCalendarDetail.status.slice(1)}
                                        </strong>
                                      </div>
                                      <div>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Check-in: </span>
                                        <span style={{ fontWeight: 600 }}>{selectedCalendarDetail.checkIn}</span>
                                      </div>
                                      <div>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Check-out: </span>
                                        <span style={{ fontWeight: 600 }}>{selectedCalendarDetail.checkOut}</span>
                                      </div>
                                      <div style={{ gridColumn: 'span 2' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Remarks: </span>
                                        <span style={{ fontStyle: 'italic' }}>{selectedCalendarDetail.remarks}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>

                  {(() => {
                    const feeDetails = calculateStudentFees(selectedStudent, profileFeeMonth);
                    return (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                          <h4 style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Financial Summary</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Calculate up to:</span>
                            <input
                              type="month"
                              className="form-control"
                              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.85rem', height: '30px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                              value={profileFeeMonth}
                              onChange={(e) => setProfileFeeMonth(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                          <span>Admission Fee (₹{admissionFeeRate}):</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {selectedStudent.admissionPaid ? (
                              <>
                                <span className="badge badge-green">Paid ({selectedStudent.admissionPaid})</span>
                                <button className="btn-small btn-secondary" style={{ padding: '2px 6px', fontSize: '0.75rem' }} onClick={() => unmarkFeePaid(selectedStudent.id, 'admissionPaid')}>Undo</button>
                              </>
                            ) : (
                              <>
                                <span className="badge badge-red">Pending (₹{admissionFeeRate})</span>
                                <button className="btn-small btn-primary" style={{ padding: '2px 6px', fontSize: '0.75rem' }} onClick={() => markFeePaid(selectedStudent.id, 'admissionPaid')}>Pay</button>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span>Outstanding Monthly Fees:</span>
                          <span style={{ fontWeight: 600, color: feeDetails.monthlyDue > 0 ? '#E50914' : '#4CAF50' }}>₹{feeDetails.monthlyDue}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                          <span>Total Dues:</span>
                          <span style={{ fontSize: '1.2rem', color: feeDetails.totalDue > 0 ? '#E50914' : '#4CAF50' }}>₹{feeDetails.totalDue}</span>
                        </div>

                        {/* Unpaid Months List */}
                        {feeDetails.unpaidMonths.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>UNPAID MONTHS ({feeDetails.unpaidMonths.length})</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {feeDetails.unpaidMonths.map(m => (
                                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                  <span style={{ color: 'white' }}>{m}</span>
                                  <button style={{ border: 'none', background: 'var(--color-primary)', color: 'white', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }} onClick={() => markFeePaidCustomMonth(selectedStudent.id, m)}>Pay</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Paid Months List */}
                        {feeDetails.paidMonthsList.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PAID MONTHS ({feeDetails.paidMonthsList.length})</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {feeDetails.paidMonthsList.map(m => (
                                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                  <span style={{ color: 'white' }}>{m}</span>
                                  <button style={{ border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => unmarkFeePaidCustomMonth(selectedStudent.id, m)}>Undo</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="modal-actions">
                  {loggedInUser && (
                    <button className="btn-primary" onClick={() => {
                      setEditingStudentData(selectedStudent);
                      setIsEditingStudent(true);
                    }}>Edit Student</button>
                  )}
                  <button className="btn-secondary" onClick={() => setSelectedStudent(null)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Fee Customization Modal */}
      {isFeeEditModalOpen && feeEditingStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="panel-header">
              <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} color="var(--color-primary)" /> Customize Fees: {feeEditingStudent.name}
              </h2>
              <button className="btn-icon" onClick={() => setIsFeeEditModalOpen(false)}><X size={24} /></button>
            </div>

            <div style={{ padding: '1rem 0' }}>
              {/* Billing Start Month */}
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Billing Start Month (Join Month)</label>
                <input
                  type="month"
                  className="form-control"
                  value={customStartMonth}
                  onChange={(e) => setCustomStartMonth(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Custom Fee Rate Override */}
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Custom Monthly Rate (₹) [Leave blank to use default ₹{monthlyFeeRate}]</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={`Default: ₹${monthlyFeeRate}`}
                  value={customRateInput}
                  onChange={(e) => setCustomRateInput(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Custom Admission Rate Override */}
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Custom Admission Rate (₹) [Leave blank to use default ₹{admissionFeeRate}]</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={`Default: ₹${admissionFeeRate}`}
                  value={customAdmissionInput}
                  onChange={(e) => setCustomAdmissionInput(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Monthly Coupon Section */}
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Apply Monthly Coupon Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter monthly coupon (e.g. FIT20)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0 1rem', fontSize: '0.85rem', height: '38px' }}
                    onClick={() => {
                      const code = couponInput.trim().toUpperCase();
                      if (!code) {
                        setCouponMessage('Coupon cleared (0% Discount)');
                        setFeeEditingStudent(prev => ({
                          ...prev,
                          appliedCoupon: '',
                          couponType: 'percentage',
                          couponValue: 0,
                          discountPercentage: 0
                        }));
                        return;
                      }

                      const coupon = resolveCouponCode(code);
                      if (!coupon) {
                        setCouponMessage('❌ Invalid Coupon Code');
                        return;
                      }

                      const display = coupon.type === 'amount' ? `₹${coupon.value}` : `${coupon.value}%`;
                      setCouponMessage(`✓ Coupon Applied! ${display} Discount`);
                      setFeeEditingStudent(prev => ({
                        ...prev,
                        appliedCoupon: code,
                        couponType: coupon.type,
                        couponValue: coupon.value,
                        discountPercentage: coupon.type === 'percentage' ? coupon.value : 0
                      }));
                    }}
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <div style={{
                    marginTop: '6px',
                    fontSize: '0.8rem',
                    color: couponMessage.includes('❌') ? '#FF6B6B' : '#51CF66',
                    fontWeight: 500
                  }}>
                    {couponMessage}
                  </div>
                )}
              </div>

              {/* Admission Coupon Section */}
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Apply Admission Coupon Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter admission coupon (e.g. FIT20)"
                    value={admissionCouponInput}
                    onChange={(e) => setAdmissionCouponInput(e.target.value.toUpperCase())}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0 1rem', fontSize: '0.85rem', height: '38px' }}
                    onClick={() => {
                      const code = admissionCouponInput.trim().toUpperCase();
                      if (!code) {
                        setAdmissionCouponMessage('Admission Coupon cleared');
                        setFeeEditingStudent(prev => ({
                          ...prev,
                          appliedAdmissionCoupon: ''
                        }));
                        return;
                      }

                      const coupon = resolveCouponCode(code);
                      if (!coupon) {
                        setAdmissionCouponMessage('❌ Invalid Coupon Code');
                        return;
                      }

                      const display = coupon.type === 'amount' ? `₹${coupon.value}` : `${coupon.value}%`;
                      setAdmissionCouponMessage(`✓ Admission Coupon Applied! ${display} Discount`);
                      setFeeEditingStudent(prev => ({
                        ...prev,
                        appliedAdmissionCoupon: code
                      }));
                    }}
                  >
                    Apply
                  </button>
                </div>
                {admissionCouponMessage && (
                  <div style={{
                    marginTop: '6px',
                    fontSize: '0.8rem',
                    color: admissionCouponMessage.includes('❌') ? '#FF6B6B' : '#51CF66',
                    fontWeight: 500
                  }}>
                    {admissionCouponMessage}
                  </div>
                )}
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '4px' }}>
                  <strong>Available Coupons:</strong> FIT10 (10% off), FIT20 (20% off), FIT50 (50% off), FREE (100% off)
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => setIsFeeEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const code = couponInput.trim().toUpperCase();
                  let couponType = 'percentage';
                  let couponValue = 0;
                  let discountPercentage = 0;
                  let appliedCoupon = '';

                  if (code) {
                    const resolved = resolveCouponCode(code);
                    if (!resolved) {
                      setCouponMessage('❌ Invalid Coupon Code');
                      return;
                    }
                    appliedCoupon = code;
                    couponType = resolved.type;
                    couponValue = resolved.value;
                    discountPercentage = resolved.type === 'percentage' ? resolved.value : 0;
                  }

                  const admCode = admissionCouponInput.trim().toUpperCase();
                  if (admCode) {
                    const resolved = resolveCouponCode(admCode);
                    if (!resolved) {
                      setAdmissionCouponMessage('❌ Invalid Admission Coupon Code');
                      return;
                    }
                  }

                  const rate = customRateInput === '' ? null : parseInt(customRateInput, 10);
                  const admissionRateOverride = customAdmissionInput === '' ? null : parseInt(customAdmissionInput, 10);
                  const updatedStudent = {
                    ...feeEditingStudent,
                    joinDate: `${customStartMonth}-01`,
                    customMonthlyRate: rate,
                    customAdmissionRate: admissionRateOverride,
                    appliedCoupon,
                    couponType,
                    couponValue,
                    discountPercentage,
                    appliedAdmissionCoupon: admCode
                  };

                  setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
                  if (selectedStudent && selectedStudent.id === updatedStudent.id) {
                    setSelectedStudent(updatedStudent);
                  }

                  fetch(`${API_BASE_URL}/students/${updatedStudent.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedStudent)
                  })
                    .then(res => res.json())
                    .then(() => {
                      setIsFeeEditModalOpen(false);
                      setFeeEditingStudent(null);
                    })
                    .catch(err => console.error("Error saving fee customizations:", err));
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h2 className="panel-title">{editingClass ? "Edit Scheduled Class" : "Schedule New Class"}</h2>
              <button className="btn-icon" onClick={() => setIsClassModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveClass}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Class Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={classForm.className}
                  onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                  placeholder="e.g. Morning Advanced Class"
                />
              </div>
              <div className="grid-2-col" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Branch</label>
                  <select
                    className="form-control"
                    value={classForm.branch}
                    disabled={userRole !== 'superadmin' && userRole !== 'developer'}
                    onChange={(e) => setClassForm({ ...classForm, branch: e.target.value })}
                  >
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch</label>
                  <select
                    className="form-control"
                    value={classForm.batch}
                    disabled={userRole === 'trainer'}
                    onChange={(e) => setClassForm({ ...classForm, batch: e.target.value })}
                  >
                    {getFilteredBatchOptions(classForm.branch).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid-2-col" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Start Time (HH:MM)</label>
                  <input
                    type="time"
                    className="form-control"
                    required
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time (HH:MM)</label>
                  <input
                    type="time"
                    className="form-control"
                    required
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Trainer Username / Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={classForm.trainer}
                  disabled={userRole === 'trainer'}
                  onChange={(e) => setClassForm({ ...classForm, trainer: e.target.value })}
                  placeholder="Enter trainer username"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Subject / Topic (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={classForm.subject}
                  onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                  placeholder="e.g. Sparring Techniques"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-primary" type="submit">
                  {editingClass ? "Update Class" : "Schedule Class"}
                </button>
                <button className="btn-secondary" type="button" onClick={() => setIsClassModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h2 className="panel-title">Enroll Student</h2>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label>Student Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {newStudent.photo ? (
                    <img src={newStudent.photo} alt="Preview" style={{ width: '60px', height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '60px', height: '80px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserPlus size={24} color="rgba(255,255,255,0.3)" />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="form-control" onChange={handlePhotoUpload} style={{ paddingTop: '0.5rem' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" required value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="Enter name" />
              </div>
              <div className="grid-2-col">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" className="form-control" required value={newStudent.age} onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })} placeholder="21" />
                </div>
                <div className="form-group">
                  <label>Date of Birth (DOB)</label>
                  <input type="date" className="form-control" required value={newStudent.dob} onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })} />
                </div>
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label>Student Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    value={newStudent.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) {
                        setNewStudent({ ...newStudent, phone: val });
                      }
                    }}
                    placeholder="Student number"
                    maxLength="10"
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                  />
                </div>
                <div className="form-group">
                  <label>Parent Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    value={newStudent.parentPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) {
                        setNewStudent({ ...newStudent, parentPhone: val });
                      }
                    }}
                    placeholder="Parent number"
                    maxLength="10"
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                  />
                </div>
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label>Batch Selection Dropdown</label>
                  <select
                    className="form-control"
                    value={batchOptions.find(b => b.name === newStudent.batch && b.schedule === newStudent.schedule)?.id || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const correspondingOpt = batchOptions.find(b => b.id === selectedId);
                      if (correspondingOpt) {
                        setNewStudent({
                          ...newStudent,
                          schedule: correspondingOpt.schedule,
                          batch: correspondingOpt.name
                        });
                      }
                    }}
                  >
                    {getFilteredBatchOptions(newStudent.branch).map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name} ({opt.schedule})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <select className="form-control" value={newStudent.batch} onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>
              <div className="grid-2-col">
                <div className="form-group">
                  <label>Branch</label>
                  <select
                    className="form-control"
                    value={newStudent.branch}
                    onChange={(e) => {
                      const selectedBr = e.target.value;
                      const firstBatch = getFilteredBatchOptions(selectedBr)[0];
                      setNewStudent({
                        ...newStudent,
                        branch: selectedBr,
                        schedule: firstBatch ? firstBatch.schedule : 'Mon-Thu',
                        batch: firstBatch ? firstBatch.name : 'Morning'
                      });
                    }}
                    disabled={
                      (!isAdminUser(loggedInUser) && appMode !== 'superadmin-login') ||
                      appMode === 'login'
                    }
                  >
                    {((isAdminUser(loggedInUser) || appMode === 'superadmin-login') && appMode !== 'login') ? (
                      branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))
                    ) : (
                      <option value={
                        appMode === 'login'
                          ? selectedBranchLogin
                          : getLoggedInUserBranch()
                      }>
                        {
                          appMode === 'login'
                            ? selectedBranchLogin
                            : getLoggedInUserBranch()
                        }
                      </option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Belt</label>
                  <select className="form-control" value={newStudent.belt} onChange={(e) => setNewStudent({ ...newStudent, belt: e.target.value })}>
                    <option value="White">White Belt</option>
                    <option value="Yellow">Yellow Belt</option>
                    <option value="Orange">Orange Belt</option>
                    <option value="Green">Green Belt</option>
                    <option value="Blue">Blue Belt</option>
                    <option value="Purple">Purple Belt</option>
                    <option value="Brown">Brown Belt</option>
                    <option value="Black">Black Belt</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input type="date" className="form-control" required value={newStudent.joinDate} onChange={(e) => setNewStudent({ ...newStudent, joinDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Coupon Code (Optional)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter coupon code (e.g. FIT20)"
                    value={newStudent.appliedCoupon || ''}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase().trim();
                      const coupon = resolveCouponCode(code);
                      setNewStudent({
                        ...newStudent,
                        appliedCoupon: code,
                        couponType: coupon ? coupon.type : 'percentage',
                        couponValue: coupon ? coupon.value : 0,
                        discountPercentage: (coupon && coupon.type === 'percentage') ? coupon.value : 0
                      });
                    }}
                  />
                  {newStudent.appliedCoupon && (() => {
                    const coupon = resolveCouponCode(newStudent.appliedCoupon);
                    if (coupon) {
                      const display = coupon.type === 'amount' ? `₹${coupon.value}` : `${coupon.value}%`;
                      return (
                        <div style={{ alignSelf: 'center', whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#51CF66', fontWeight: 600 }}>
                          ✓ {display} Off
                        </div>
                      );
                    } else {
                      return (
                        <div style={{ alignSelf: 'center', whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#FF6B6B', fontWeight: 600 }}>
                          ❌ Invalid
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Complete Enrollment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {studentToDelete !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(229, 9, 20, 0.1)', color: '#E50914', marginBottom: '1rem' }}>
                <AlertTriangle size={32} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>Delete Student?</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
                Choose **Soft Delete** to disable the student and hide them from normal view (keeping their logs), or **Permanent Delete** to erase their record entirely.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => confirmDelete(false)}>Soft Delete</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#ff453a' }} onClick={() => confirmDelete(true)}>Permanent Delete</button>
              </div>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} onClick={() => setStudentToDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {renderEditCredentialModal()}
      {renderEditBranchModal()}
      {renderEditBatchModal()}
      {renderUserDetailModal()}

      {/* Floating Help Button */}
      {loggedInUser && (
        <button
          onClick={() => {
            setIsHelpModalOpen(true);
            setHelpSubmitFeedback(null);
          }}
          className="help-float-btn"
          title="Report an Issue / Get Help"
        >
          <MessageCircle size={20} />
          <span>Help</span>
        </button>
      )}

      {/* Help/Support Ticket Submission Modal */}
      {isHelpModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content help-modal">
            <div className="panel-header" style={{ marginBottom: '1rem' }}>
              <h2 className="panel-title">Report an Issue / Support</h2>
              <button className="btn-icon" onClick={() => { setIsHelpModalOpen(false); setHelpModalTab('new'); }}>
                <X size={24} />
              </button>
            </div>

            {/* Sub Tabs inside Help Modal */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: helpModalTab === 'new' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: '4px 0',
                  borderBottom: helpModalTab === 'new' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
                onClick={() => setHelpModalTab('new')}
              >
                New Report
              </button>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: helpModalTab === 'history' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: '4px 0',
                  borderBottom: helpModalTab === 'history' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
                onClick={() => {
                  setHelpModalTab('history');
                  loadUserHelpReports();
                }}
              >
                My Tickets ({userHelpReports.length})
              </button>
            </div>

            {helpModalTab === 'new' ? (
              <form onSubmit={handleSubmitHelp}>
                <div className="form-group">
                  <label>Issue Description</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    required
                    placeholder="Please describe the issue you are experiencing, or any help you need in detail..."
                    value={helpDescription}
                    onChange={(e) => setHelpDescription(e.target.value)}
                    disabled={isSubmittingHelp}
                  ></textarea>
                </div>

                {helpSubmitFeedback && (
                  <div className={`feedback-alert ${helpSubmitFeedback.type}`}>
                    {helpSubmitFeedback.type === 'success' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                    <span>{helpSubmitFeedback.message}</span>
                  </div>
                )}

                <div className="modal-actions" style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setIsHelpModalOpen(false); setHelpModalTab('new'); }}
                    disabled={isSubmittingHelp}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmittingHelp}
                  >
                    {isSubmittingHelp ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {loadingUserHelpReports ? (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Loading tickets...</div>
                ) : userHelpReports.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {userHelpReports.map(ticket => (
                      <div
                        key={ticket._id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {new Date(ticket.createdAt).toLocaleString()}
                          </span>
                          <span
                            className={`badge ${ticket.status === 'Resolved' ? 'badge-green' : 'badge-red'}`}
                            style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#fff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {ticket.issueDescription}
                        </div>
                        {ticket.deviceName && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Device: {ticket.deviceName}
                          </div>
                        )}
                        {ticket.developerReply && (
                          <div style={{
                            background: 'rgba(81, 207, 102, 0.08)',
                            borderLeft: '3px solid #51CF66',
                            padding: '8px 12px',
                            marginTop: '8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            color: '#d1d1d6'
                          }}>
                            <span style={{ fontWeight: 600, color: '#51CF66', display: 'block', marginBottom: '2px' }}>Developer Reply:</span>
                            {ticket.developerReply}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                    You have not submitted any help tickets yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unread Global Announcement Login Popup Modal */}
      {activeAnnouncementPopup && (
        <div className="modal-overlay" style={{ zIndex: 12000 }}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: '2.25rem 2rem', background: 'rgba(10, 10, 20, 0.95)', border: '1px solid rgba(94, 92, 230, 0.25)', borderRadius: '16px', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(25px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
              <Bell size={24} color="#ff9f0a" className="shake-icon" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                New System Announcement
              </h2>
            </div>

            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '600', margin: '0 0 0.85rem 0' }}>
              {activeAnnouncementPopup.title}
            </h3>

            <p style={{ color: '#d1d1d6', fontSize: '0.9rem', lineHeight: '1.55', margin: '0 0 1.5rem 0', whiteSpace: 'pre-wrap' }}>
              {activeAnnouncementPopup.message}
            </p>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.725rem', color: '#8e8e93', display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
              <span>Published by: <strong style={{ color: '#e2e2ee' }}>{activeAnnouncementPopup.sender}</strong></span>
              <span>
                {new Date(activeAnnouncementPopup.createdAt).toLocaleDateString()} at {new Date(activeAnnouncementPopup.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                style={{ padding: '0.55rem 1.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
                onClick={() => {
                  handleMarkAsRead(activeAnnouncementPopup._id);
                  setActiveAnnouncementPopup(null);
                }}
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Notification Modal for First Time Logins */}
      {showWelcomeModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-secondary)' }}>
              <Award size={48} className="pulse-icon" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: '#fff' }}>Welcome to MASTER FIT Portal!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              We are excited to have you on board. Here is a quick overview of your tools:
            </p>
            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Track branch and batch student attendance in real time.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Submit help requests using the floating <strong>Help</strong> bubble.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Get replies directly from developers for any issues reported.</span>
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
              onClick={() => {
                sessionStorage.setItem('welcome_dismissed', 'true');
                setShowWelcomeModal(false);
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}



      {/* Help Resolved Support Notifications Modal */}
      {unseenResolvedReports.length > 0 && (
        <div className="modal-overlay" style={{ zIndex: 1998 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '550px', padding: '2rem', border: '1px solid rgba(81, 207, 102, 0.3)', background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#51CF66' }}>
              <CheckCircle size={32} className="pulse-icon" />
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', fontSize: '1.4rem', color: '#fff' }}>Support Ticket Resolved</h2>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              A developer has reviewed and resolved your reported support ticket:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {unseenResolvedReports.map(report => (
                <div key={report._id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: '6px' }}>
                    " {report.issueDescription} "
                  </div>
                  <div style={{ background: 'rgba(81, 207, 102, 0.08)', borderLeft: '3px solid #51CF66', padding: '8px 12px', borderRadius: '4px', fontSize: '0.85rem', color: '#fff' }}>
                    <span style={{ fontWeight: 600, color: '#51CF66', display: 'block', marginBottom: '2px' }}>Resolution Reply:</span>
                    {report.developerReply}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginTop: '8px', fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(81, 207, 102, 0.15)', border: '1px solid rgba(81, 207, 102, 0.3)', color: '#51CF66', cursor: 'pointer' }}
                    onClick={() => acknowledgeReportSeen(report._id)}
                  >
                    Mark as Read
                  </button>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Please review and mark each ticket resolution response as read.
            </div>
          </div>
        </div>
      )}

      {/* Global & Settings Feedback Popup Modal */}
      {(devSettingsSuccess || devSettingsError || globalSuccess || globalError) && (
        <div className="modal-overlay" style={{ zIndex: 12000 }}>
          <div className="modal-content glass-panel" style={{
            maxWidth: '400px',
            padding: '2.25rem 2rem',
            textAlign: 'center',
            border: `1px solid ${(devSettingsSuccess || globalSuccess) ? 'rgba(48, 209, 88, 0.35)' : 'rgba(255, 69, 58, 0.35)'}`,
            background: 'rgba(5, 5, 10, 0.96)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75)',
            borderRadius: '16px',
            backdropFilter: 'blur(25px)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              color: (devSettingsSuccess || globalSuccess) ? '#30d158' : '#ff453a'
            }}>
              {(devSettingsSuccess || globalSuccess) ? <CheckCircle size={48} className="pulse-icon" /> : <AlertTriangle size={48} className="pulse-icon" />}
            </div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: '1.35rem',
              marginBottom: '0.85rem',
              color: '#fff',
              letterSpacing: '0.5px'
            }}>
              {(devSettingsSuccess || globalSuccess) ? 'Success' : 'Notice / Error'}
            </h2>
            <p style={{
              color: '#a2a2b5',
              fontSize: '0.925rem',
              lineHeight: '1.6',
              marginBottom: '1.75rem'
            }}>
              {devSettingsSuccess || devSettingsError || globalSuccess || globalError}
            </p>
            <button
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                background: (devSettingsSuccess || globalSuccess) ? 'linear-gradient(135deg, #30d158, #28a745)' : 'linear-gradient(135deg, #ff453a, #dc3545)',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
              onClick={() => {
                setDevSettingsSuccess('');
                setDevSettingsError('');
                setGlobalSuccess('');
                setGlobalError('');
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
