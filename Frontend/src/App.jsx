import { useState, useEffect, useRef } from 'react';
import {
  Users, CalendarDays, Calendar, Layers, Wallet, Bell, Settings, LogOut, UserPlus, AlertTriangle, AlertCircle, X,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, MessageCircle, MessageSquare,
  Search, Phone, Trash2, ArrowRight, Activity, MapPin, TrendingUp, Award, Menu,
  Shield, Lock, Unlock, FileDown, FileUp, Database, Terminal, Cpu, HardDrive, Key, History,
  Eye, EyeOff, Star, Megaphone, Send
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './index.css';
import gallery1Img from './assets/gallery1.jpg';
import gallery2Img from './assets/gallery2.jpg';
import gallery3Img from './assets/gallery3.jpg';
import gallery4Img from './assets/gallery4.jpg';

// Academy Branches list (dynamically loaded from MongoDB database)
const DEFAULT_BRANCHES = [];

const BRANCHES_DATA = [
  {
    id: 'kuttiady',
    name: 'Kuttiady',
    tag: 'Head Office',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Main Town Center, Kuttiady, Kozhikode, Kerala',
    timings: 'Morning: 06:00 AM - 09:00 AM | Evening: 04:30 PM - 09:00 PM',
    disciplines: ['Kung Fu', 'Karate', 'Wushu', 'MMA', 'Boxing', 'Kickboxing', 'Taekwondo', 'Fitness'],
    isHeadOffice: true
  },
  {
    id: 'perambra',
    name: 'Perambra',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Near Town Centre, Perambra, Kozhikode, Kerala',
    timings: 'Morning: 06:30 AM - 08:30 AM | Evening: 05:00 PM - 08:30 PM',
    disciplines: ['Karate', 'Kickboxing', 'Kung Fu', 'Boxing', 'Fitness Training']
  },
  {
    id: 'kallachi',
    name: 'Kallachi',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Nadapuram Road, Kallachi, Kozhikode, Kerala',
    timings: 'Morning: 06:00 AM - 08:30 AM | Evening: 04:30 PM - 08:30 PM',
    disciplines: ['Wushu', 'Karate', 'MMA', 'Kickboxing', 'Judo']
  },
  {
    id: 'orkatteri',
    name: 'Orkkatteri',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Orkkatteri Town, Vadakara, Kozhikode, Kerala',
    timings: 'Morning: 06:30 AM - 08:30 AM | Evening: 05:00 PM - 08:30 PM',
    disciplines: ['Kung Fu', 'Karate', 'Boxing', 'Wrestling', 'Fitness']
  },
  {
    id: 'paarakadav',
    name: 'Parakkadavu',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Parakkadavu Junction, Kozhikode Route',
    timings: 'Morning: 06:00 AM - 08:00 AM | Evening: 04:30 PM - 08:00 PM',
    disciplines: ['Karate', 'Wushu', 'Kickboxing', 'Sports Martial Arts']
  },
  {
    id: 'chembra',
    name: 'Chembra',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Chembra Town, Kozhikode District, Kerala',
    timings: 'Morning: 06:30 AM - 08:30 AM | Evening: 05:00 PM - 08:30 PM',
    disciplines: ['Kung Fu', 'Karate', 'MMA', 'Fitness Training']
  },
  {
    id: 'kallikandi',
    name: 'Kallikkandy',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Kallikkandy Town, Kannur District, Kerala',
    timings: 'Morning: 06:00 AM - 08:30 AM | Evening: 04:30 PM - 08:30 PM',
    disciplines: ['Wushu', 'Karate', 'Boxing', 'Kickboxing', 'Judo']
  },
  {
    id: 'devargovil',
    name: 'Devarcovil',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Devarcovil Center, Kozhikode, Kerala',
    timings: 'Morning: 06:30 AM - 08:30 AM | Evening: 05:00 PM - 08:30 PM',
    disciplines: ['Karate', 'Kung Fu', 'Taekwondo', 'Fitness Training']
  },
  {
    id: 'thuvakunne',
    name: 'Thuvakkunnu',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Thuvakkunnu Town, Kannur / Kozhikode Border, Kerala',
    timings: 'Morning: 06:00 AM - 08:00 AM | Evening: 04:30 PM - 08:00 PM',
    disciplines: ['MMA', 'Boxing', 'Kickboxing', 'Wrestling', 'Sports Martial Arts']
  },
  {
    id: 'elankode',
    name: 'Elankode',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Elankode Junction, Kozhikode, Kerala',
    timings: 'Morning: 06:30 AM - 08:30 AM | Evening: 05:00 PM - 08:30 PM',
    disciplines: ['Karate', 'Wushu', 'Judo', 'Fitness Training']
  },
  {
    id: 'perigathur',
    name: 'Peringathur',
    tag: 'Branch',
    phone: '9995422610',
    whatsapp: '919567964340',
    address: 'Peringathur Town, Kannur / Thalassery Region, Kerala',
    timings: 'Morning: 06:00 AM - 08:30 AM | Evening: 04:30 PM - 08:30 PM',
    disciplines: ['Kung Fu', 'Karate', 'Boxing', 'MMA', 'Taekwondo']
  }
];

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
    const pA = a && a.isPriority ? 1 : 0;
    const pB = b && b.isPriority ? 1 : 0;
    if (pA !== pB) {
      return pB - pA; // priority first
    }
    const nameA = String(a && a.name || '').trim().toLowerCase();
    const nameB = String(b && b.name || '').trim().toLowerCase();
    return nameA.localeCompare(nameB, 'en', { sensitivity: 'base', numeric: true });
  });
};

const formatSelectedDays = (days) => {
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const checked = allDays.filter(d => days[d]);

  if (checked.length === 0) return '';
  if (checked.length === 7) return 'Daily';

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weekends = ['Sat', 'Sun'];

  const isWeekdays = weekdays.every(d => days[d]) && !days.Sat && !days.Sun;
  if (isWeekdays) return 'Weekdays';

  const isWeekends = weekends.every(d => days[d]) && weekdays.every(d => !days[d]);
  if (isWeekends) return 'Weekends';

  // Detect contiguous range circular-aware
  const doubleDays = [...allDays, ...allDays];
  const checkedSet = new Set(checked);
  let bestRange = null;

  for (let start = 0; start < 7; start++) {
    let len = 0;
    while (len < 7 && checkedSet.has(doubleDays[start + len])) {
      len++;
    }
    if (len === checked.length && len > 1) {
      const rangeStart = doubleDays[start];
      const rangeEnd = doubleDays[start + len - 1];
      bestRange = `${rangeStart} - ${rangeEnd}`;
      break;
    }
  }

  if (bestRange) return bestRange;

  return checked.join(', ');
};

const parseScheduleToDays = (schedule) => {
  const defaults = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };
  if (!schedule) return defaults;

  const cleanSched = schedule.toLowerCase().replace(/\s+/g, '');
  if (cleanSched === 'daily') {
    return { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true };
  }
  if (cleanSched === 'weekday' || cleanSched === 'weekdays') {
    return { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false };
  }
  if (cleanSched === 'weekend' || cleanSched === 'weekends') {
    return { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: true, Sun: true };
  }

  const dayNamesShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (cleanSched.includes('-')) {
    const parts = cleanSched.split('-');
    if (parts.length === 2) {
      const startIdx = dayNamesShort.indexOf(parts[0].substring(0, 3));
      const endIdx = dayNamesShort.indexOf(parts[1].substring(0, 3));
      if (startIdx !== -1 && endIdx !== -1) {
        const res = { ...defaults };
        let curr = startIdx;
        while (true) {
          res[dayKeys[curr]] = true;
          if (curr === endIdx) break;
          curr = (curr + 1) % 7;
        }
        return res;
      }
    }
  }

  const items = cleanSched.split(',');
  const res = { ...defaults };
  let foundAny = false;
  for (const item of items) {
    const trimmed = item.trim().substring(0, 3);
    const dayIdx = dayNamesShort.indexOf(trimmed);
    if (dayIdx !== -1) {
      res[dayKeys[dayIdx]] = true;
      foundAny = true;
    }
  }

  if (foundAny) return res;
  return defaults;
};

const getCleanStudentName = (student) => {
  if (!student) return 'Student';
  let rawName = student.studentName || student.name || student.fullName || student.student_name || '';
  if (!rawName || typeof rawName !== 'string') return `Student #${student.id || student.admissionNumber || ''}`;
  rawName = rawName.trim();

  // If contains replacement character or corrupted bytes
  if (rawName.includes('') || /\uFFFD/.test(rawName) || rawName.includes('%r') || rawName.includes('')) {
    return `Student #${student.id || student.admissionNumber || ''}`;
  }
  // If rawName is encrypted hex hash (32 hex chars : hex chars)
  if (rawName.includes(':') && rawName.split(':').length === 2 && /^[0-9a-fA-F]{32}:[0-9a-fA-F]+$/.test(rawName)) {
    return `Student #${student.id || student.admissionNumber || ''}`;
  }

  // Strip invalid control characters while preserving Malayalam/Unicode characters
  const cleanName = rawName.replace(/[\x00-\x1F\x7F]/g, '').trim();
  if (!cleanName) {
    return `Student #${student.id || student.admissionNumber || ''}`;
  }

  return cleanName;
};

const schedulesMatch = (s1, s2) => {
  if (!s1 || !s2) return false;
  const d1 = parseScheduleToDays(s1);
  const d2 = parseScheduleToDays(s2);
  const keys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return keys.every(k => d1[k] === d2[k]);
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


const ART_OPTIONS = ['Karate', 'Kickboxing', 'Kung Fu', 'MMA', 'Muay Thai', 'Taekwondo', 'Yoga', 'Kalaripayattu'];

const renderHighlightedName = (nameStr, queryStr) => {
  const name = nameStr || '';
  const query = (queryStr || '').trim();
  if (!query) {
    return <span className="student-name-highlight">{name}</span>;
  }
  const idx = name.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return <span className="student-name-highlight">{name}</span>;
  }
  const before = name.substring(0, idx);
  const match = name.substring(idx, idx + query.length);
  const after = name.substring(idx + query.length);

  return (
    <span className="student-name-highlight">
      {before}
      <mark className="search-highlight">{match}</mark>
      {after}
    </span>
  );
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
    // Handle path-based routing (e.g. /developer/login) by redirecting to hash routing
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      const cleanPath = window.location.pathname;
      if (cleanPath.startsWith('/developer') || cleanPath === '/superadmin' || cleanPath === '/login' || cleanPath === '/admin') {
        window.location.replace('/#' + cleanPath + window.location.search);
        return 'website';
      }
    }

    const hash = window.location.hash;
    const hasSession = getSessionUser();

    if (hasSession) {
      const cleanUser = hasSession.toLowerCase().trim();
      if (cleanUser === 'developer' || cleanUser.startsWith('developer@')) {
        return 'developer';
      }
      return 'admin'; // Always restore admin dashboard if session exists!
    }

    if (hash === '#/developer/login') {
      return 'developer-login';
    } else if (hash === '#/superadmin') {
      return 'superadmin-login';
    } else if (hash === '#/login' || hash === '#/branch' || hash === '#/batch') {
      return 'login';
    } else if (hash === '#/admin') {
      return 'login'; // No session? Force login
    } else if (hash === '#/about' || hash === '#about') {
      return 'about';
    } else if (hash === '#/branches' || hash === '#branches') {
      return 'branches';
    }
    return 'website';
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [feeDetailsStudentId, setFeeDetailsStudentId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
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
  const [remindersTab, setRemindersTab] = useState('broadcast');

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
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceDismissed, setMaintenanceDismissed] = useState(false);
  const [lockPerformancePage, setLockPerformancePage] = useState(false);
  const [lockBranchBatchMappingPage, setLockBranchBatchMappingPage] = useState(false);
  const [lockFeesPage, setLockFeesPage] = useState(false);
  const [lockDashboardPage, setLockDashboardPage] = useState(false);
  const [lockAttendancePage, setLockAttendancePage] = useState(false);
  const [lockRemindersPage, setLockRemindersPage] = useState(false);
  const [lockGradingPage, setLockGradingPage] = useState(false);
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
  const [classFormDays, setClassFormDays] = useState({ Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false });

  // Grading Management Module States
  const [gradingStudents, setGradingStudents] = useState([]);
  const [loadingGrading, setLoadingGrading] = useState(false);
  const [gradingFilterBranch, setGradingFilterBranch] = useState('All');
  const [gradingFilterBatch, setGradingFilterBatch] = useState('All');
  const [gradingFilterBelt, setGradingFilterBelt] = useState('All');
  const [gradingFilterEligibility, setGradingFilterEligibility] = useState('All');
  const [gradingFilterTrainerApproval, setGradingFilterTrainerApproval] = useState('All');
  const [gradingFilterResult, setGradingFilterResult] = useState('All');
  const [gradingFilterStartDate, setGradingFilterStartDate] = useState('');
  const [gradingFilterEndDate, setGradingFilterEndDate] = useState('');
  const [allowBranchAdminChangeBelt, setAllowBranchAdminChangeBelt] = useState(false);
  const [gradingActionLoading, setGradingActionLoading] = useState(false);
  const [gradingError, setGradingError] = useState('');
  const [gradingSuccess, setGradingSuccess] = useState('');

  // Grading Date Announcement States
  const [isGradingAnnouncementModalOpen, setIsGradingAnnouncementModalOpen] = useState(false);
  const [gradingAnnouncementForm, setGradingAnnouncementForm] = useState({
    gradingDate: new Date().toISOString().split('T')[0],
    branch: 'all',
    title: '📢 Upcoming Belt Grading Examination',
    message: 'Please review and approve all eligible students for the upcoming belt grading exam.',
    priority: 'high'
  });
  const [submittingGradingAnnouncement, setSubmittingGradingAnnouncement] = useState(false);
  const [readDetailsModalNotification, setReadDetailsModalNotification] = useState(null);

  // Modals for Grading
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedGradeStudent, setSelectedGradeStudent] = useState(null);
  const [gradeResult, setGradeResult] = useState('Pass');
  const [gradeLetter, setGradeLetter] = useState('A');
  const [gradeDate, setGradeDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetBelt, setTargetBelt] = useState('');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);

  const [isEditGradingModalOpen, setIsEditGradingModalOpen] = useState(false);
  const [selectedEditGradingStudent, setSelectedEditGradingStudent] = useState(null);
  const [editGradingForm, setEditGradingForm] = useState({ joinDate: '', lastGradingDate: '', belt: '' });

  // Trainer Approval & Belt Suggestion Modal
  const [isTrainerApprovalModalOpen, setIsTrainerApprovalModalOpen] = useState(false);
  const [selectedTrainerApprovalStudent, setSelectedTrainerApprovalStudent] = useState(null);
  const [trainerSuggestedBeltInput, setTrainerSuggestedBeltInput] = useState('');
  const [trainerGradingNotesInput, setTrainerGradingNotesInput] = useState('');

  const [classFormSlotType, setClassFormSlotType] = useState('Morning');

  // Financial Performance / Profit Filters States
  const [perfFilterBranch, setPerfFilterBranch] = useState('All');
  const [perfFilterBatch, setPerfFilterBatch] = useState('All');
  const [perfActiveTab, setPerfActiveTab] = useState('students');

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
    setClassFormDays({ Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false });
    setClassFormSlotType('Morning');
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
    setClassFormDays(parseScheduleToDays(cls.schedule || ''));
    setClassFormSlotType(cls.slotType || 'Morning');
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!classForm.className || !classForm.branch || !classForm.batch || !classForm.trainer) {
      setGlobalError("All fields except subject are required.");
      return;
    }

    const method = editingClass ? 'PUT' : 'POST';
    const url = editingClass ? `${API_BASE_URL}/classes/${editingClass._id}` : `${API_BASE_URL}/classes`;

    const payload = {
      ...classForm,
      schedule: formatSelectedDays(classFormDays),
      slotType: classFormSlotType
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to save class') });
        }
        return res.json();
      })
      .then(() => {
        setGlobalSuccess(editingClass ? "Class updated successfully!" : "Class scheduled successfully!");
        setIsClassModalOpen(false);
        reloadAllAppData();
      })
      .catch(err => setGlobalError("Error saving class: " + err.message));
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
        setGlobalSuccess("Class deleted successfully!");
        reloadAllAppData();
      })
      .catch(err => setGlobalError("Error deleting class: " + err.message));
  };

  const handleCancelClass = (cls) => {
    const reason = prompt("Enter cancellation reason (optional):");
    if (reason === null) return; // User cancelled prompt

    fetch(`${API_BASE_URL}/classes/${cls._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...cls,
        status: 'cancelled',
        cancellationReason: reason,
        date: cls.date || new Date().toLocaleDateString('en-CA')
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to cancel class') });
        }
        return res.json();
      })
      .then(() => {
        setGlobalSuccess("Class marked as cancelled!");
        reloadAllAppData();
      })
      .catch(err => setGlobalError("Error cancelling class: " + err.message));
  };

  const handleRestoreClass = (cls) => {
    if (!confirm("Are you sure you want to restore this class?")) return;

    fetch(`${API_BASE_URL}/classes/${cls._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...cls,
        status: 'scheduled',
        cancellationReason: '',
        date: cls.date || new Date().toLocaleDateString('en-CA')
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to restore class') });
        }
        return res.json();
      })
      .then(() => {
        setGlobalSuccess("Class successfully restored!");
        reloadAllAppData();
      })
      .catch(err => setGlobalError("Error restoring class: " + err.message));
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

  // Roster Filter State
  const [branchFilter, setBranchFilter] = useState('Kuttiady');
  const [batchFilter, setBatchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

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
  const [newBatchStartTimeField, setNewBatchStartTimeField] = useState('09:00');
  const [newBatchEndTimeField, setNewBatchEndTimeField] = useState('10:30');
  const [editBatchSlotType, setEditBatchSlotType] = useState('Morning');
  const [editBatchStatusField, setEditBatchStatusField] = useState('Active');
  const [credentialModalError, setCredentialModalError] = useState('');
  const [credentialModalSuccess, setCredentialModalSuccess] = useState('');
  const [editBatchModalError, setEditBatchModalError] = useState('');
  const [editBatchModalSuccess, setEditBatchModalSuccess] = useState('');
  const [editBatchSaving, setEditBatchSaving] = useState(false);
  const [userRole, setUserRole] = useState(() => getCookieValue('umai_session_role') || '');
  const [userBranch, setUserBranch] = useState(() => getCookieValue('umai_session_branch') || '');
  const [userBatch, setUserBatch] = useState(() => getCookieValue('umai_session_batch') || '');
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [customBranches, setCustomBranches] = useState([]);
  const [customBatches, setCustomBatches] = useState([]);
  const [modalBatches, setModalBatches] = useState([]);
  const [batchOptions, setBatchOptions] = useState(DEFAULT_BATCH_OPTIONS);
  const [newBranchForm, setNewBranchForm] = useState({ name: '', username: '', password: '', confirmPassword: '' });
  const [showNewBranchPassword, setShowNewBranchPassword] = useState(false);
  const [showNewBranchConfirmPassword, setShowNewBranchConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSuperadminLoginPassword, setShowSuperadminLoginPassword] = useState(false);
  const [showNewBatchPassword, setShowNewBatchPassword] = useState(false);
  const [showNewBatchConfirmPassword, setShowNewBatchConfirmPassword] = useState(false);
  const [showManageBatchPassword, setShowManageBatchPassword] = useState(false);
  const [showManageBatchConfirmPassword, setShowManageBatchConfirmPassword] = useState(false);
  const [showManageBranchPassword, setShowManageBranchPassword] = useState(false);
  const [showManageBranchConfirmPassword, setShowManageBranchConfirmPassword] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState({ name: '', schedule: '', branch: 'kuttiady', username: '', password: '', confirmPassword: '', startTime: '09:00', endTime: '10:30', slotType: 'Morning', status: 'Active' });
  const [newBatchDays, setNewBatchDays] = useState({ Mon: true, Tue: true, Wed: true, Thu: true, Fri: false, Sat: false, Sun: false });
  const [editBatchDays, setEditBatchDays] = useState({ Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false });
  const [activeSessions, setActiveSessions] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [selectedUserDetailLoading, setSelectedUserDetailLoading] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '', confirmPassword: '', role: 'branchadmin', branch: 'Kuttiady', batch: 'batch1', schedule: 'Mon-Thu', status: 'Active', fullName: '', phone: '', employeeId: '' });
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('All');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Trainer Registration & Approval States
  const [loginTab, setLoginTab] = useState('login');
  const [trainerRegForm, setTrainerRegForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    preferredBranch: '',
    preferredBatch: ''
  });
  const [trainerRegError, setTrainerRegError] = useState('');
  const [trainerRegSuccess, setTrainerRegSuccess] = useState('');
  const [isSubmittingTrainerReg, setIsSubmittingTrainerReg] = useState(false);

  // Trainer Approvals & Batch Allocation Page States
  const [pendingTrainers, setPendingTrainers] = useState([]);
  const [loadingPendingTrainers, setLoadingPendingTrainers] = useState(false);
  const [approvalBranchSelections, setApprovalBranchSelections] = useState({});
  const [approvalBatchSelections, setApprovalBatchSelections] = useState({});
  const [activeTrainerBranchSelections, setActiveTrainerBranchSelections] = useState({});
  const [activeTrainerBatchSelections, setActiveTrainerBatchSelections] = useState({});
  const [trainerApprovalSuccess, setTrainerApprovalSuccess] = useState('');
  const [trainerApprovalError, setTrainerApprovalError] = useState('');
  const [selectedTrainerForAllocation, setSelectedTrainerForAllocation] = useState(null);
  const [selectedPendingTrainerForApproval, setSelectedPendingTrainerForApproval] = useState(null);
  const [trainerToDeleteConfirm, setTrainerToDeleteConfirm] = useState(null);
  const [deletingTrainerLoading, setDeletingTrainerLoading] = useState(false);

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
    const seen = new Map();
    branchesList.forEach(b => {
      if (!b) return;
      const clean = String(b).trim();
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
        seen.set(key, formatted);
      }
    });
    return Array.from(seen.values()).sort((a, b) => {
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
  };

  const sortBatchesAlphabetically = (batchesList) => {
    if (!Array.isArray(batchesList)) return [];
    const seen = new Map();
    batchesList.forEach(b => {
      if (!b) return;
      const branchKey = String(b.branch || '').trim().toLowerCase();
      const nameKey = String(b.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const schedKey = String(b.schedule || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const comboKey = `${branchKey}_${nameKey}_${schedKey}`;
      if (!seen.has(comboKey)) {
        seen.set(comboKey, b);
      }
    });
    return Array.from(seen.values()).sort((a, b) => {
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

  const getFilteredBatchOptions = (branchOverride, requireCredentials = false) => {
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

    const branchKey = String(targetBranch || 'All').toLowerCase().trim();

    let filtered = batchOptions;
    if (branchKey !== 'all') {
      filtered = batchOptions.filter(opt => {
        let branchMatches = false;
        if (opt.branch) {
          const optBranch = String(opt.branch).toLowerCase().trim();
          branchMatches = optBranch === 'all' || optBranch === branchKey;
        } else {
          branchMatches = true;
        }
        if (!branchMatches) return false;

        if (requireCredentials && loggedInUser) {
          return batchCredentials[`${branchKey}_${opt.id}`] !== undefined;
        }
        return true;
      });
    }

    const seenCombos = new Set();
    const res = filtered.filter(opt => {
      const bKey = String(opt.branch || '').toLowerCase().trim();
      const idKey = String(opt.id || opt.code || '').toLowerCase().trim();
      const normName = String(opt.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const normSched = String(opt.schedule || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const comboKey = `${bKey}_${normName}_${normSched}`;
      const idCombo = `${bKey}_${idKey}`;

      if (seenCombos.has(comboKey) || (idKey && seenCombos.has(idCombo))) return false;
      seenCombos.add(comboKey);
      if (idKey) seenCombos.add(idCombo);
      return true;
    });

    return sortBatchesAlphabetically(res);
  };

  const isBatchAdminUser = (user) => {
    return userRole === 'trainer' || userRole === 'coordinator';
  };

  const getBatchNameFromSchedule = (schedule, studentBranch = '') => {
    if (!schedule) return '';
    const cleanBranch = String(studentBranch || '').toLowerCase().trim();
    if (cleanBranch) {
      const opt = batchOptions.find(b =>
        b.schedule.toLowerCase() === schedule.toLowerCase() &&
        (b.branch && b.branch.toLowerCase().trim() === cleanBranch)
      );
      if (opt) return opt.name;
    }
    const opt = batchOptions.find(b => b.schedule.toLowerCase() === schedule.toLowerCase());
    return opt ? opt.name : schedule;
  };

  const getBatchNameFromCode = (batchCode, branchName = '') => {
    if (!batchCode) return '';
    const cleanCode = batchCode.toLowerCase().trim();
    const cleanBranch = String(branchName || '').toLowerCase().trim();
    if (cleanBranch) {
      const opt = batchOptions.find(b =>
        (String(b.id).toLowerCase() === cleanCode || String(b.code || '').toLowerCase() === cleanCode) &&
        (b.branch && b.branch.toLowerCase().trim() === cleanBranch)
      );
      if (opt) return opt.name;
    }
    const opt = batchOptions.find(b => String(b.id).toLowerCase() === cleanCode || String(b.code || '').toLowerCase() === cleanCode);
    return opt ? opt.name : batchCode;
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

  const getAppliedCouponForMonth = (student, monthStr) => {
    if (!student || !student.appliedCoupons || student.appliedCoupons.length === 0) return null;
    const [year, month] = monthStr.split('-').map(Number);
    return student.appliedCoupons.find(c => c.appliedMonth === month && c.appliedYear === year);
  };

  const getStudentDiscountForMonth = (s, rateToUse, monthStr) => {
    const matchedCoupon = getAppliedCouponForMonth(s, monthStr);
    if (matchedCoupon) {
      if (matchedCoupon.discountType === 'percentage') {
        return Math.round(rateToUse * matchedCoupon.discountValue / 100);
      }
      return matchedCoupon.discountValue;
    }
    return 0;
  };

  const getFeeInfoForMonth = (student, monthStr) => {
    const rateToUse = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null
      ? student.customMonthlyRate
      : monthlyFeeRate;

    const matchedCoupon = getAppliedCouponForMonth(student, monthStr);
    let finalRate = rateToUse;
    if (matchedCoupon) {
      if (matchedCoupon.discountType === 'percentage') {
        const discount = Math.round(rateToUse * matchedCoupon.discountValue / 100);
        finalRate = Math.max(0, rateToUse - discount);
      } else {
        finalRate = Math.max(0, rateToUse - matchedCoupon.discountValue);
      }
    }
    return {
      originalRate: rateToUse,
      finalRate,
      coupon: matchedCoupon
    };
  };

  const [branchCredentials, setBranchCredentials] = useState({});

  const [batchCredentials, setBatchCredentials] = useState({});

  const [attendanceTab, setAttendanceTab] = useState('monthly'); // 'monthly' or 'year2026'
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState(null);

  // Persistent State
  const [trainersList, setTrainersList] = useState([]);
  const [students, setStudents] = useState([]);

  const [attendanceRecords, setAttendanceRecords] = useState({});

  const reloadAllAppData = () => {
    const token = getSessionToken();
    if (!token) {
      // Not logged in: fetch public branches and public batches for the login page
      fetch(`${API_BASE_URL}/public/branches`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setCustomBranches(data || []);
          const branchNames = (data || []).map(b => typeof b === 'string' ? b : b.name).filter(Boolean);
          setBranches(sortBranchesAlphabetically(branchNames));
        })
        .catch(err => console.error('Error fetching public branches:', err));

      fetch(`${API_BASE_URL}/public/batches`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          const uniqueBatches = [
            ...DEFAULT_BATCH_OPTIONS.map(b => ({ ...b, branch: 'all' })),
            ...(data || []).map(b => ({
              id: b.code || b.id || b._id,
              name: b.name,
              schedule: b.schedule,
              branch: b.branch,
              startTime: b.startTime || '09:00',
              endTime: b.endTime || '10:30',
              slotType: b.slotType || 'Morning',
              status: b.status || 'Active',
              _id: b._id,
              trainer: b.trainer || ''
            }))
          ];
          setBatchOptions(sortBatchesAlphabetically(uniqueBatches));
        })
        .catch(err => console.error('Error fetching public batches:', err));

      fetch(`${API_BASE_URL}/public/trainers`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setTrainersList(data || []))
        .catch(err => console.error('Error fetching public trainers:', err));

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
          setCustomBatches(data.customBatches || []);
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
        const branchNames = (data || []).map(b => typeof b === 'string' ? b : b.name).filter(Boolean);
        const sorted = sortBranchesAlphabetically(branchNames);
        setBranches(sorted);
        setBranchFilter(prev => {
          const match = sorted.find(b => b.toLowerCase() === prev.toLowerCase());
          return match || prev;
        });
      })
      .catch(err => console.error('Error fetching branches:', err));

    // 3.2 Fetch Batches from MongoDB
    fetch(`${API_BASE_URL}/batches`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const uniqueBatches = [
          ...DEFAULT_BATCH_OPTIONS.map(b => ({ ...b, branch: 'all' })),
          ...(data || []).map(b => ({
            id: b.code || b.id || b._id,
            name: b.name,
            schedule: b.schedule,
            branch: b.branch,
            startTime: b.startTime || '09:00',
            endTime: b.endTime || '10:30',
            slotType: b.slotType || 'Morning',
            status: b.status || 'Active',
            _id: b._id,
            trainer: b.trainer || ''
          }))
        ];
        setBatchOptions(sortBatchesAlphabetically(uniqueBatches));
      })
      .catch(err => console.error('Error fetching batches:', err));

    // Fetch Trainers
    fetch(`${API_BASE_URL}/public/trainers`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setTrainersList(data || []))
      .catch(err => console.error('Error fetching trainers:', err));

    // 3.3 Fetch Scheduled Classes
    const todayStr = new Date().toLocaleDateString('en-CA');
    fetch(`${API_BASE_URL}/classes?date=${todayStr}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setTodayClasses(data || []);
      })
      .catch(err => console.error('Error fetching classes:', err));

    // 3.4 Fetch Dashboard Scoped Statistics
    setLoadingStats(true);
    const branchParam = branchFilter ? encodeURIComponent(branchFilter) : '';
    const batchParam = batchFilter ? encodeURIComponent(batchFilter) : '';
    fetch(`${API_BASE_URL}/dashboard/stats?branch=${branchParam}&batch=${batchParam}`)
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
          setAllowBranchAdminChangeBelt(!!data.allowBranchAdminChangeBelt);
        }
      })
      .catch(err => console.error('Error fetching system settings:', err));

    const activeRole = getCookieValue('umai_session_role') || userRole;
    if (activeRole === 'superadmin' || activeRole === 'developer' || activeRole === 'branchadmin' || activeRole === 'trainer') {
      fetchGradingStudents();
    }
  };

  const fetchGradingStudents = () => {
    setLoadingGrading(true);
    setGradingError('');
    const activeRole = getCookieValue('umai_session_role') || userRole;
    const activeBranch = getCookieValue('umai_session_branch') || userBranch;
    const activeBatch = getCookieValue('umai_session_batch') || userBatch;

    let branchParam = 'All';
    let batchParam = 'All';

    if (activeRole === 'superadmin' || activeRole === 'developer') {
      branchParam = gradingFilterBranch || 'All';
      batchParam = gradingFilterBatch || 'All';
    } else if (activeRole === 'branchadmin') {
      branchParam = activeBranch || 'All';
      batchParam = gradingFilterBatch || 'All';
    } else if (activeRole === 'trainer') {
      branchParam = activeBranch || 'All';
      batchParam = (gradingFilterBatch && gradingFilterBatch !== 'All') ? gradingFilterBatch : (activeBatch || 'All');
    }

    fetch(`${API_BASE_URL}/grading/students?branch=${encodeURIComponent(branchParam)}&batch=${encodeURIComponent(batchParam)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch student grading details.');
        return res.json();
      })
      .then(data => {
        setGradingStudents(sortStudentsAlphabetically(data));
      })
      .catch(err => {
        console.error('Error fetching grading students:', err);
        setGradingError(err.message);
      })
      .finally(() => setLoadingGrading(false));
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
        setNewAdminForm({ username: '', password: '', confirmPassword: '', role: 'branchadmin', branch: 'Kuttiady', batch: 'batch1', schedule: 'Mon-Thu', status: 'Active', fullName: '', phone: '', employeeId: '' });
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

  const handleConfirmDeleteTrainer = (trainer) => {
    if (!trainer) return;
    setDeletingTrainerLoading(true);

    fetch(`${API_BASE_URL}/admins/${trainer._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getSessionToken()}`
      }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to remove trainer account');
        setGlobalSuccess(`Trainer login access for @${trainer.username} has been disabled. All historical class & attendance details remain 100% saved in database.`);
        setTrainerToDeleteConfirm(null);
        setSelectedTrainerForAllocation(null);
        reloadAllAppData();
      })
      .catch(err => {
        alert('Error removing trainer: ' + err.message);
      })
      .finally(() => {
        setDeletingTrainerLoading(false);
      });
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

  // Sync state with backend when login state changes
  useEffect(() => {
    reloadAllAppData();
  }, [loggedInUser]);

  // Fetch dashboard stats whenever filters change
  useEffect(() => {
    const token = getSessionToken();
    if (!token) return; // Only if logged in

    setLoadingStats(true);
    const branchParam = branchFilter ? encodeURIComponent(branchFilter) : '';
    const batchParam = batchFilter ? encodeURIComponent(batchFilter) : '';

    fetch(`${API_BASE_URL}/dashboard/stats?branch=${branchParam}&batch=${batchParam}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setDashboardStats(data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        setLoadingStats(false);
      });
  }, [branchFilter, batchFilter, loggedInUser]);

  // Fetch students list dynamically whenever branch or batch filters change
  useEffect(() => {
    const token = getSessionToken();
    if (!token) return;

    const branchParam = branchFilter ? encodeURIComponent(branchFilter) : '';
    const batchParam = batchFilter ? encodeURIComponent(batchFilter) : '';

    fetch(`${API_BASE_URL}/students?branchId=${branchParam}&batchId=${batchParam}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setStudents(sortStudentsAlphabetically(data));
      })
      .catch(err => console.error('Error fetching students:', err));
  }, [branchFilter, batchFilter, loggedInUser]);

  // Fetch grading students dynamically when branch/batch filter changes or grading view is opened
  useEffect(() => {
    const token = getSessionToken();
    if (!token) return;

    const activeRole = getCookieValue('umai_session_role') || userRole;
    if (currentView === 'grading' && (activeRole === 'superadmin' || activeRole === 'developer' || activeRole === 'branchadmin' || activeRole === 'trainer')) {
      fetchGradingStudents();
    }
  }, [gradingFilterBranch, gradingFilterBatch, currentView, loggedInUser]);

  // Dynamic branches & batches loading for Login & Trainer Registration from MongoDB
  useEffect(() => {
    const token = getSessionToken();
    if (token) return; // Only run when logged out (on login / registration page)

    // 1. Fetch active database branches
    fetch(`${API_BASE_URL}/public/branches`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBranches(data);
        }
      })
      .catch(err => console.warn('Public branches fetch warning:', err));

    // 2. Fetch active database batches
    fetch(`${API_BASE_URL}/public/batches`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBatchOptions(sortBatchesAlphabetically(data));
        }
      })
      .catch(err => console.warn('Public batches fetch warning:', err));
  }, [loggedInUser, appMode]);



  // Synchronize default branch for login page when branches list is loaded/updated
  useEffect(() => {
    const token = getSessionToken();
    if (token) return; // Only when logged out

    if (Array.isArray(branches) && branches.length > 0) {
      const currentLoginBr = String(selectedBranchLogin || '');
      const matched = branches.find(b => typeof b === 'string' && b.toLowerCase() === currentLoginBr.toLowerCase());
      if (matched) {
        if (selectedBranchLogin !== matched) {
          setSelectedBranchLogin(matched);
        }
      } else if (branches[0]) {
        setSelectedBranchLogin(branches[0]);
      }
    }
  }, [branches, selectedBranchLogin]);

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
            if (data.role === 'developer') {
              setAppMode('developer');
            } else {
              setAppMode('admin');
            }
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
        const matching = (branches || []).find(b => typeof b === 'string' && b.toLowerCase() === 'kuttiady');
        setBranchFilter(matching || 'Kuttiady');
      } else {
        const resolvedBranch = getLoggedInUserBranch();
        const matching = (branches || []).find(b => typeof b === 'string' && b.toLowerCase() === String(resolvedBranch || '').toLowerCase());
        setBranchFilter(matching || resolvedBranch || 'Kuttiady');
        setBatchForm(prev => ({ ...prev, branch: String(resolvedBranch || 'kuttiady').toLowerCase() }));
        setNewBatchForm(prev => ({ ...prev, branch: String(resolvedBranch || 'kuttiady').toLowerCase() }));
      }
    }
  }, [loggedInUser, branches]);

  // Synchronize batchFilter for batch coordinator on mount/login
  useEffect(() => {
    if (loggedInUser) {
      if (isBatchAdminUser(loggedInUser)) {
        const activeBatch = (batchOptions || []).find(b => b && b.id && String(b.id).toLowerCase() === String(userBatch || '').toLowerCase());
        if (activeBatch) {
          setBatchFilter(activeBatch.id);
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
    if ((currentView === 'settings' || currentView === 'credentials-list' || currentView === 'trainer-approvals') && (isAdminUser(loggedInUser) || isBranchAdmin(loggedInUser))) {
      fetch(`${API_BASE_URL}/sessions`)
        .then(res => res.json())
        .then(data => setActiveSessions(data || []))
        .catch(err => console.error('Error fetching sessions:', err));
    }
  }, [currentView, loggedInUser]);

  const loadPendingTrainers = () => {
    const token = getSessionToken();
    if (!token) return;
    setLoadingPendingTrainers(true);
    fetch(`${API_BASE_URL}/admin/pending-trainers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setPendingTrainers(data || []);
        setLoadingPendingTrainers(false);
      })
      .catch(err => {
        console.error('Error fetching pending trainers:', err);
        setLoadingPendingTrainers(false);
      });
  };

  useEffect(() => {
    if ((currentView === 'trainer-approvals' || currentView === 'credentials-list') && (isAdminUser(loggedInUser) || isBranchAdmin(loggedInUser))) {
      loadPendingTrainers();
      fetch(`${API_BASE_URL}/admins`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setAdminsList(data || []))
        .catch(err => console.error('Error fetching admin accounts list:', err));
    }
  }, [currentView, loggedInUser]);

  const handleApproveTrainer = (trainerId) => {
    const token = getSessionToken();
    if (!token) return;
    setTrainerApprovalError('');
    setTrainerApprovalSuccess('');

    const targetTrainer = pendingTrainers.find(t => t._id === trainerId);
    const branch = approvalBranchSelections[trainerId] || (targetTrainer ? targetTrainer.branch : '') || (branches[0] || 'Kuttiady');
    const batch = approvalBatchSelections[trainerId] || (targetTrainer ? targetTrainer.batch : '') || 'batch1';

    fetch(`${API_BASE_URL}/admin/approve-trainer/${trainerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ branch, batch })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to approve trainer account'); });
        }
        return res.json();
      })
      .then(data => {
        setTrainerApprovalSuccess(data.message || 'Trainer approved successfully!');
        loadPendingTrainers();
        reloadAllAppData();
      })
      .catch(err => {
        setTrainerApprovalError(err.message);
      });
  };

  const handleRejectTrainer = (trainerId) => {
    if (!window.confirm("Are you sure you want to reject this trainer registration request?")) return;
    const token = getSessionToken();
    if (!token) return;
    setTrainerApprovalError('');
    setTrainerApprovalSuccess('');

    fetch(`${API_BASE_URL}/admin/reject-trainer/${trainerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to reject trainer account'); });
        }
        return res.json();
      })
      .then(data => {
        setTrainerApprovalSuccess(data.message || 'Trainer registration rejected.');
        loadPendingTrainers();
        reloadAllAppData();
      })
      .catch(err => {
        setTrainerApprovalError(err.message);
      });
  };

  const handleReallocateBatch = (userId, currentBranch, currentBatch) => {
    const token = getSessionToken();
    if (!token) return;
    setTrainerApprovalError('');
    setTrainerApprovalSuccess('');

    const branch = activeTrainerBranchSelections[userId] || currentBranch;
    const batch = activeTrainerBatchSelections[userId] || currentBatch;

    fetch(`${API_BASE_URL}/admin/allocate-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, branch, batch })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to reallocate batch'); });
        }
        return res.json();
      })
      .then(data => {
        setTrainerApprovalSuccess(data.message || 'Batch reallocated successfully!');
        reloadAllAppData();
      })
      .catch(err => {
        setTrainerApprovalError(err.message);
      });
  };

  const handleTrainerRegistration = (e) => {
    e.preventDefault();
    setTrainerRegError('');
    setTrainerRegSuccess('');

    if (trainerRegForm.password !== trainerRegForm.confirmPassword) {
      setTrainerRegError('Passwords do not match.');
      return;
    }

    setIsSubmittingTrainerReg(true);
    fetch(`${API_BASE_URL}/public/register/trainer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: trainerRegForm.username,
        email: trainerRegForm.email,
        password: trainerRegForm.password,
        fullName: trainerRegForm.fullName,
        phone: trainerRegForm.phone,
        preferredBranch: trainerRegForm.preferredBranch,
        preferredBatch: trainerRegForm.preferredBatch
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to submit trainer registration'); });
        }
        return res.json();
      })
      .then(data => {
        setIsSubmittingTrainerReg(false);
        setTrainerRegSuccess(data.message || 'Registration submitted successfully! Your account is pending Super Admin approval.');
        setTrainerRegForm({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          phone: '',
          preferredBranch: branches[0] || 'Kuttiady',
          preferredBatch: ''
        });
      })
      .catch(err => {
        setIsSubmittingTrainerReg(false);
        setTrainerRegError(err.message);
      });
  };

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

  // Default mapping tab
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
        branch: announcementForm.branch || 'all',
        batch: announcementForm.batch || 'all',
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
          setLockPerformancePage(!!data.lockPerformancePage);
          setLockBranchBatchMappingPage(!!data.lockBranchBatchMappingPage);
          setLockFeesPage(!!data.lockFeesPage);
          setLockDashboardPage(!!data.lockDashboardPage);
          setLockAttendancePage(!!data.lockAttendancePage);
          setLockRemindersPage(!!data.lockRemindersPage);
          setLockGradingPage(!!data.lockGradingPage);

          // Check if current user is affected by maintenance
          let isBlocked = false;
          if (loggedInUser && userRole !== 'developer') {
            const mode = data.maintenanceMode || 'none';
            if (mode === 'all') {
              isBlocked = true;
            } else {
              const isAd = userRole === 'superadmin';
              const isBr = userRole === 'branchadmin';
              const isTr = userRole === 'trainer' || userRole === 'coordinator';

              if (mode === 'admin' && isAd) isBlocked = true;
              if (mode === 'branch' && isBr) isBlocked = true;
              if (mode === 'batch' && isTr) isBlocked = true;

              if (mode === 'branch-batch' && (isBr || isTr)) isBlocked = true;
              if (mode === 'batch-admin' && (isTr || isAd)) isBlocked = true;
              if (mode === 'admin-branch' && (isAd || isBr)) isBlocked = true;
            }
          }

          if (data.isMaintenanceActive && isBlocked) {
            setShowMaintenanceModal(prev => prev || true);
          } else {
            setShowMaintenanceModal(false);
            setMaintenanceDismissed(false);
          }
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
  }, [loggedInUser, userRole]);

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
        setSettingsSuccess(`Branch Trainer credentials for "${br.toUpperCase()}" updated successfully!`);
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

    const username = newBranchForm.username.trim() || `admin@${newBrLower}`;

    const existingBranchNames = customBranches.map(b => typeof b === 'string' ? b : b.name);
    const updatedCustomBranches = [...existingBranchNames, newBrClean];
    const updatedBranchCreds = {
      ...branchCredentials,
      [newBrLower]: { username, password: pass }
    };

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBranches: updatedCustomBranches,
        branchCredentials: updatedBranchCreds
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to add branch on server') });
        }
        return res.json();
      })
      .then(data => {
        setBranchCredentials(data.branchCredentials || {});
        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBranches: data.customBranches || [],
            branchCredentials: data.branchCredentials || {}
          }));
        }
        reloadAllAppData();
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
    const existingBranchNames = customBranches.map(b => typeof b === 'string' ? b : b.name);
    const updatedCustomBranches = existingBranchNames.filter(b => b.toLowerCase().trim() !== branchKey);

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
    setCustomBranches(customBranches.filter(b => (typeof b === 'string' ? b.toLowerCase().trim() : b.name?.toLowerCase().trim()) !== branchKey));
    setBranchCredentials(updatedBranchCreds);
    setBatchCredentials(updatedBatchCreds);

    setBranches(sortBranchesAlphabetically(updatedCustomBranches));

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
        reloadAllAppData();
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
      const name = typeof b === 'string' ? b : b.name;
      return name.toLowerCase().trim() === oldBrLower ? newBrClean : name;
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

    setCustomBranches(customBranches.map(b => {
      if (typeof b === 'string') return b.toLowerCase() === oldBrLower ? newBrClean : b;
      if (b && typeof b === 'object') return (b.name?.toLowerCase() === oldBrLower || b.code?.toLowerCase() === oldBrLower) ? { ...b, name: newBrClean, code: newBrLower } : b;
      return b;
    }));
    setBranchCredentials(updatedBranchCreds);
    setBatchCredentials(updatedBatchCreds);

    setBranches(sortBranchesAlphabetically(updatedCustomBranches));

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
        reloadAllAppData();
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
    const schedule = formatSelectedDays(newBatchDays);
    const br = newBatchForm.branch.toLowerCase();
    const trainerUser = newBatchForm.username.trim();
    const pass = newBatchForm.password;

    if (!name || !schedule) {
      setSettingsError('Batch name and at least one schedule day are required.');
      return;
    }
    if (!trainerUser || !pass) {
      setSettingsError('Trainer username and password are required.');
      return;
    }

    if (pass !== newBatchForm.confirmPassword) {
      setNewBatchPasswordError('Passwords do not match');
      return;
    }

    const targetBranch = newBatchForm.branch.toLowerCase().trim();
    if (batchOptions.some(b => b.name.toLowerCase() === name.toLowerCase() && b.branch && b.branch.toLowerCase().trim() === targetBranch)) {
      setSettingsError(`A batch named "${name}" already exists in the selected branch!`);
      return;
    }

    const id = 'batch_' + Date.now();
    const status = newBatchForm.status || 'Active';
    const newBatchObj = {
      id,
      name,
      schedule,
      branch: newBatchForm.branch,
      startTime: newBatchForm.startTime || '09:00',
      endTime: newBatchForm.endTime || '10:30',
      slotType: newBatchForm.slotType || 'Morning',
      status
    };

    const key = `${br}_${id}`;

    const existingBatchesMapped = customBatches.map(b => ({
      id: b.id || b.code || b._id,
      name: b.name || b.batchName || '',
      schedule: b.schedule || 'Mon-Thu',
      branch: b.branch || '',
      startTime: b.startTime || '09:00',
      endTime: b.endTime || '10:30',
      slotType: b.slotType || 'Morning',
      status: b.status || 'Active'
    }));

    const updatedCustomBatches = [...existingBatchesMapped, newBatchObj];
    const updatedBatchCreds = {
      ...batchCredentials,
      [key]: { username: trainerUser, password: pass }
    };

    fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBatches: updatedCustomBatches,
        batchCredentials: updatedBatchCreds
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to add batch on server') });
        }
        return res.json();
      })
      .then(data => {
        setCustomBatches(data.customBatches || []);
        setBatchCredentials(data.batchCredentials || {});
        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBatches: data.customBatches || [],
            batchCredentials: data.batchCredentials || {}
          }));
        }
        reloadAllAppData();
        setNewBatchForm({ name: '', schedule: '', branch: 'kuttiady', username: '', password: '', confirmPassword: '', startTime: '09:00', endTime: '10:30', slotType: 'Morning', status: 'Active' });
        setNewBatchDays({ Mon: true, Tue: true, Wed: true, Thu: true, Fri: false, Sat: false, Sun: false });
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

    const existingBatchesMapped = customBatches.map(b => ({
      id: b.id || b.code || b._id,
      name: b.name || b.batchName || '',
      schedule: b.schedule || 'Mon-Thu',
      branch: b.branch || '',
      startTime: b.startTime || '09:00',
      endTime: b.endTime || '10:30',
      slotType: b.slotType || 'Morning',
      status: b.status || 'Active'
    }));

    const updatedCustomBatches = existingBatchesMapped.filter(b => b.id !== batchIdToDelete);

    // Also delete from batchCredentials map
    const updatedBatchCreds = { ...batchCredentials };
    for (const key of Object.keys(updatedBatchCreds)) {
      if (key.endsWith(`_${batchIdToDelete}`) || key === batchIdToDelete) {
        delete updatedBatchCreds[key];
      }
    }

    // Optimistically update
    setCustomBatches(updatedCustomBatches);
    const uniqueBatches = [
      ...DEFAULT_BATCH_OPTIONS.map(b => ({ ...b, branch: 'all' })),
      ...updatedCustomBatches.map(b => ({ id: b.code || b.id || b._id, name: b.name, schedule: b.schedule, branch: b.branch, slotType: b.slotType || 'Morning', status: b.status || 'Active' }))
    ];
    setBatchOptions(sortBatchesAlphabetically(uniqueBatches));
    setBatchCredentials(updatedBatchCreds);

    // Delete from DB Batch collection
    const matchedBatchObj = Array.isArray(batchOptions) && batchOptions.find(b => {
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

  const handleEditCustomBatch = (batchId, newName, newSchedule, newStartTime, newEndTime, newSlotType, newStatus) => {
    const nameClean = newName.trim();
    const scheduleClean = newSchedule.trim();
    const startTimeClean = (newStartTime || '').trim();
    const endTimeClean = (newEndTime || '').trim();
    const slotTypeClean = (newSlotType || 'Morning').trim();
    const statusClean = newStatus || 'Active';

    if (!nameClean || !scheduleClean) {
      setEditBatchModalError('Batch name and schedule are required.');
      return;
    }

    if (batchOptions.some(b => {
      const bId = b.id || b.code || b._id;
      const bSchedule = b.schedule || '';
      return bId !== batchId && (b.name.toLowerCase() === nameClean.toLowerCase() && bSchedule.toLowerCase() === scheduleClean.toLowerCase() && (b.slotType || 'Morning') === slotTypeClean);
    })) {
      setEditBatchModalError('A batch with this name, schedule, and slot already exists!');
      return;
    }

    setEditBatchSaving(true);
    setEditBatchModalError('');
    setEditBatchModalSuccess('');

    const existingBatchesMapped = customBatches.map(b => ({
      id: b.id || b.code || b._id,
      name: b.name || b.batchName || '',
      schedule: b.schedule || 'Mon-Thu',
      branch: b.branch || '',
      startTime: b.startTime || '09:00',
      endTime: b.endTime || '10:30',
      slotType: b.slotType || 'Morning',
      status: b.status || 'Active'
    }));

    const updatedCustomBatches = existingBatchesMapped.map(b => {
      return b.id === batchId
        ? { ...b, name: nameClean, schedule: scheduleClean, startTime: startTimeClean, endTime: endTimeClean, slotType: slotTypeClean, status: statusClean }
        : b;
    });

    // Update name, schedule, timings & slotType in DB Batch collection
    const matchedBatchObj = Array.isArray(batchOptions) && batchOptions.find(b => {
      if (b && typeof b === 'object') {
        const bId = String(b.id || b.code || b._id).toLowerCase();
        const targetId = String(batchId).toLowerCase();
        return bId === targetId || b._id === batchId;
      }
      return false;
    });

    const updateDBPromise = matchedBatchObj && matchedBatchObj._id
      ? fetch(`${API_BASE_URL}/batches/${matchedBatchObj._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameClean, schedule: scheduleClean, startTime: startTimeClean, endTime: endTimeClean, slotType: slotTypeClean, status: statusClean })
      }).then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to update batch details in database') });
        }
        return res.json();
      })
      : Promise.resolve();

    const updateCredsPromise = fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customBatches: updatedCustomBatches
      })
    }).then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || 'Failed to update batches list on server') });
      }
      return res.json();
    });

    Promise.all([updateDBPromise, updateCredsPromise])
      .then(([dbData, credsData]) => {
        setCustomBatches(credsData.customBatches || []);

        const uniqueBatches = [
          ...DEFAULT_BATCH_OPTIONS.map(b => ({ ...b, branch: 'all' })),
          ...(credsData.customBatches || []).map(b => ({ id: b.code || b.id || b._id, name: b.name, schedule: b.schedule, branch: b.branch, slotType: b.slotType || 'Morning', status: b.status || 'Active' }))
        ];
        setBatchOptions(sortBatchesAlphabetically(uniqueBatches));
        reloadAllAppData();

        if (rawCredentials) {
          setRawCredentials(prev => ({
            ...prev,
            customBatches: credsData.customBatches || []
          }));
        }

        setEditBatchModalSuccess(`Batch "${nameClean}" updated successfully!`);
        setEditBatchSaving(false);

        // Auto-close modal after 1.5s
        setTimeout(() => {
          setIsEditBatchModalOpen(false);
          setEditingBatchObj(null);
          setEditBatchModalSuccess('');
        }, 1500);
      })
      .catch(err => {
        console.error('Error updating batch:', err);
        setEditBatchModalError(err.message || 'Error updating batch settings.');
        setEditBatchSaving(false);
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

      if (hash === '#/developer/login') {
        if (hasSession) {
          if (isDevSession) {
            window.location.hash = '#/developer/dashboard';
          } else {
            window.location.hash = '#/admin';
          }
        } else {
          setAppMode('developer-login');
        }
      } else if (hash.startsWith('#/developer')) {
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

      const matchesBatch = activeBatch === 'All' || (() => {
        const selectedBatchObj = batchOptions.find(b => b.id.toLowerCase() === activeBatch.toLowerCase());
        if (!selectedBatchObj) return false;
        const studentBatchLower = (s.batch || '').toLowerCase().trim();
        const targetIdLower = selectedBatchObj.id.toLowerCase().trim();
        const targetNameLower = selectedBatchObj.name.toLowerCase().trim();
        if (studentBatchLower === targetIdLower) return true;
        if (studentBatchLower === targetNameLower) return true;
        if (studentBatchLower && (studentBatchLower.startsWith('batch') || studentBatchLower.startsWith('batch_'))) {
          return false;
        }
        return schedulesMatch(s.schedule, selectedBatchObj.schedule);
      })();

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
    const sortedClasses = [...filteredClasses].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

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

      let [joinYear, joinMonth] = joinMonthStr.split('-').map(Number);
      let [currYear, currMonth] = currentMonthStr.split('-').map(Number);

      if (joinYear && joinMonth && currYear && currMonth) {
        let tempYear = joinYear;
        let tempMonth = joinMonth;

        while (tempYear < currYear || (tempYear === currYear && tempMonth <= currMonth)) {
          const monthStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}`;
          const isPaid = student.paidMonths && student.paidMonths[monthStr];

          const discountAmount = getStudentDiscountForMonth(student, rateToUse, monthStr);
          const finalRate = Math.max(0, rateToUse - discountAmount);

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

    // Calculate fee collection strictly by actual paymentDate received in current month
    const currentMonthStr = getLocalMonthString();
    let paymentDateCollection = 0;
    if (revenueSummaryData && revenueSummaryData.targetMonth === currentMonthStr && revenueSummaryData.totalCollected > 0) {
      paymentDateCollection = revenueSummaryData.totalCollected;
    } else if (feePaymentsList && feePaymentsList.length > 0) {
      paymentDateCollection = feePaymentsList
        .filter(p => {
          if (p.revenueMonth !== currentMonthStr) return false;
          if (activeBranch !== 'All' && p.branch && p.branch.toLowerCase().trim() !== activeBranch.toLowerCase().trim()) return false;
          if (activeBatch !== 'All' && p.batch && p.batch.toLowerCase().trim() !== activeBatch.toLowerCase().trim()) return false;
          return true;
        })
        .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    }

    const finalCollection = paymentDateCollection > 0 ? paymentDateCollection : Math.round(feeCollection);

    return {
      totalStudents: totalStudentsCount,
      presentToday,
      absentToday,
      attendancePercentage,
      feeCollection: finalCollection,
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
  const [paymentMonth, setPaymentMonth] = useState(getLocalMonthString());
  const [feeStatusFilter, setFeeStatusFilter] = useState('All');
  const [feeMethodFilter, setFeeMethodFilter] = useState('All');
  const [feePaymentsList, setFeePaymentsList] = useState([]);
  const [revenueSummaryData, setRevenueSummaryData] = useState({
    totalCollected: 0,
    monthlyFeeCollected: 0,
    admissionFeeCollected: 0,
    dailyBreakdown: {},
    methodBreakdown: {},
    branchBreakdown: {}
  });

  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    studentId: '',
    studentName: '',
    branch: '',
    batch: '',
    feeType: 'monthly',
    feeMonth: getLocalMonthString(),
    amountDue: 600,
    amountPaid: 600,
    paymentDate: getLocalDateString(),
    paymentMethod: 'Cash',
    transactionRef: '',
    notes: ''
  });

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const fetchRevenueAndPayments = () => {
    const token = getSessionToken();
    if (!token) return;

    const targetBranch = branchFilter !== 'All' ? branchFilter : '';
    const targetBatch = batchFilter !== 'All' ? batchFilter : '';

    fetch(`${API_BASE_URL}/revenue/summary?month=${paymentMonth}&feeMonth=${feeMonth}&branch=${encodeURIComponent(targetBranch)}&batch=${encodeURIComponent(targetBatch)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setRevenueSummaryData(data);
        }
      })
      .catch(err => console.error("Error loading revenue summary:", err));

    fetch(`${API_BASE_URL}/payments?branch=${encodeURIComponent(targetBranch)}&batch=${encodeURIComponent(targetBatch)}&limit=1000`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.payments) {
          setFeePaymentsList(data.payments);
        }
      })
      .catch(err => console.error("Error loading payments:", err));
  };

  useEffect(() => {
    fetchRevenueAndPayments();
  }, [paymentMonth, feeMonth, branchFilter, batchFilter, loggedInUser]);

  // Form State
  const [newStudent, setNewStudent] = useState({
    name: '', age: '', dob: '', phone: '', parentPhone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: '', photo: null, isPriority: false, trainer: '', art: ''
  });

  // Unified dynamic batch loading by branchId for creation & edit modals/forms
  useEffect(() => {
    const token = getSessionToken();
    if (!token) return; // Only for logged-in users

    let activeFormBranch = '';
    if (isAddModalOpen && newStudent) {
      activeFormBranch = newStudent.branch;
    } else if (isEditingStudent && editingStudentData) {
      activeFormBranch = editingStudentData.branch;
    } else if (isAdminModalOpen && newAdminForm) {
      activeFormBranch = newAdminForm.branch;
    } else if (editingAdmin) {
      activeFormBranch = editingAdmin.branch;
    } else if (currentView === 'credentials-list' && mappingSubTab === 'batches') {
      activeFormBranch = batchForm.branch;
    }

    if (!activeFormBranch) {
      setModalBatches([]);
      return;
    }

    const branchObj = customBranches.find(
      b => b.name.toLowerCase() === activeFormBranch.toLowerCase()
    );

    if (branchObj) {
      fetch(`${API_BASE_URL}/batches?branchId=${branchObj._id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          const list = data || [];
          setModalBatches(sortBatchesAlphabetically(list));
          if (list.length > 0) {
            const firstBatch = list[0];
            // Auto default the open form's batch and schedule
            if (isAddModalOpen) {
              setNewStudent(prev => {
                if (prev.branch === activeFormBranch && !list.some(b => b.code === prev.batch)) {
                  return { ...prev, batch: firstBatch.code, schedule: firstBatch.schedule };
                }
                return prev;
              });
            } else if (isEditingStudent) {
              setEditingStudentData(prev => {
                if (prev && prev.branch === activeFormBranch && !list.some(b => b.code === prev.batch)) {
                  return { ...prev, batch: firstBatch.code, schedule: firstBatch.schedule };
                }
                return prev;
              });
            } else if (isAdminModalOpen) {
              setNewAdminForm(prev => {
                if (prev.branch === activeFormBranch && !list.some(b => b.code === prev.batch)) {
                  return { ...prev, batch: firstBatch.code };
                }
                return prev;
              });
            } else if (editingAdmin) {
              setEditingAdmin(prev => {
                if (prev && prev.branch === activeFormBranch && !list.some(b => b.code === prev.batch)) {
                  return { ...prev, batch: firstBatch.code };
                }
                return prev;
              });
            } else if (currentView === 'credentials-list' && mappingSubTab === 'batches') {
              setBatchForm(prev => {
                if (prev.branch === activeFormBranch.toLowerCase() && !list.some(b => b.code === prev.batch)) {
                  return { ...prev, batch: firstBatch.code };
                }
                return prev;
              });
            }
          }
        })
        .catch(err => console.error('Error fetching batches for form branch:', err));
    } else {
      setModalBatches([]);
    }
  }, [
    isAddModalOpen, newStudent?.branch,
    isEditingStudent, editingStudentData?.branch,
    isAdminModalOpen, newAdminForm?.branch,
    editingAdmin?.branch,
    currentView, mappingSubTab, batchForm?.branch,
    customBranches, loggedInUser
  ]);

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

    // Filter by global batch (code check with fallback to schedule for legacy)
    const matchesBatch = batchFilter === 'All' || (() => {
      const selectedBatchObj = batchOptions.find(b => b.id.toLowerCase() === batchFilter.toLowerCase());
      if (!selectedBatchObj) return false;
      const studentBatchLower = (s.batch || '').toLowerCase().trim();
      const targetIdLower = selectedBatchObj.id.toLowerCase().trim();
      const targetNameLower = selectedBatchObj.name.toLowerCase().trim();
      if (studentBatchLower === targetIdLower) return true;
      if (studentBatchLower === targetNameLower) return true;
      if (studentBatchLower && (studentBatchLower.startsWith('batch') || studentBatchLower.startsWith('batch_'))) {
        return false;
      }
      return schedulesMatch(s.schedule, selectedBatchObj.schedule);
    })();

    if (userRole === 'trainer' || userRole === 'coordinator') {
      const activeBatch = batchOptions.find(b => b.id.toLowerCase() === userBatch.toLowerCase());
      if (activeBatch) {
        const studentMatchesTrainerBatch = (s.batch && s.batch.toLowerCase() === userBatch.toLowerCase()) ||
          (s.schedule && schedulesMatch(s.schedule, activeBatch.schedule) && !(s.batch && s.batch.toLowerCase().startsWith('batch')));
        return matchesSearch && matchesBranch && matchesStatus && matchesBatch && studentMatchesTrainerBatch;
      }
    }

    return matchesSearch && matchesBranch && matchesStatus && matchesBatch;
  }));

  const getBeltColorClass = (belt) => {
    const b = String(belt || '').toLowerCase().trim();
    if (b.includes('brown')) return 'badge-brown';
    switch (b) {
      case 'white': case 'white belt': return 'badge-white';
      case 'yellow': case 'yellow belt': case 'level 1': return 'badge-yellow';
      case 'orange': case 'orange belt': case 'level 2': return 'badge-orange';
      case 'green': case 'green belt': case 'level 3': return 'badge-green';
      case 'blue': case 'blue belt': case 'level 4': return 'badge-blue';
      case 'purple': case 'purple belt': case 'level 5': return 'badge-purple';
      case 'red': case 'red belt': case 'coach c': return 'badge-red';
      case 'brown': case 'brown belt': case 'brown 1': case 'brown 2': case 'brown 3': case 'brown 4': case 'brown 1 belt': case 'brown 2 belt': case 'brown 3 belt': case 'brown 4 belt': return 'badge-brown';
      case 'coach b': return 'badge-blue';
      case 'coach a': return 'badge-gold';
      case 'black': case 'black belt': case 'pro level': return 'badge-black';
      default:
        if (b.includes('white')) return 'badge-white';
        if (b.includes('yellow')) return 'badge-yellow';
        if (b.includes('orange')) return 'badge-orange';
        if (b.includes('green')) return 'badge-green';
        if (b.includes('blue')) return 'badge-blue';
        if (b.includes('purple')) return 'badge-purple';
        if (b.includes('red')) return 'badge-red';
        if (b.includes('black')) return 'badge-black';
        return 'badge-white';
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
        studentBatch = activeBatch.id;
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
        setNewStudent({ name: '', age: '', dob: '', phone: '', parentPhone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: defaultBranch === 'All' ? (branches[0] || 'Kuttiady') : defaultBranch, photo: null, isPriority: false, trainer: '', art: '' });

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

    let monthlyDue = 0;
    unpaidMonths.forEach(m => {
      const discountAmount = getStudentDiscountForMonth(student, rateToUse, m);
      const finalRate = Math.max(0, rateToUse - discountAmount);
      monthlyDue += finalRate;
    });
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
    const student = students.find(s => s.id === id);
    let dueAmount = monthlyFeeRate;
    if (student) {
      if (feeType === 'admissionPaid') {
        const rateAdmission = student.customAdmissionRate !== undefined && student.customAdmissionRate !== null
          ? student.customAdmissionRate
          : admissionFeeRate;
        const admissionCoupon = resolveCouponCode(student.appliedAdmissionCoupon);
        let admissionDiscountAmount = 0;
        if (admissionCoupon) {
          admissionDiscountAmount = admissionCoupon.type === 'percentage'
            ? Math.round(rateAdmission * admissionCoupon.value / 100)
            : admissionCoupon.value;
        }
        dueAmount = Math.max(0, rateAdmission - admissionDiscountAmount);
      } else {
        const rateMonthly = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null
          ? student.customMonthlyRate
          : monthlyFeeRate;
        const discountAmount = getStudentDiscountForMonth(student, rateMonthly, feeMonth);
        dueAmount = Math.max(0, rateMonthly - discountAmount);
      }
    }

    // Call payment record API
    const token = getSessionToken();
    fetch(`${API_BASE_URL}/payments/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        studentId: id,
        feeType: feeType === 'admissionPaid' ? 'admission' : 'monthly',
        feeMonth: feeMonth,
        amountDue: dueAmount,
        amountPaid: dueAmount,
        paymentDate: getLocalDateString(),
        paymentMethod: 'Cash'
      })
    })
      .then(res => res.json())
      .then(() => fetchRevenueAndPayments())
      .catch(err => console.error("Error recording fee payment:", err));

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
  };

  const unmarkFeePaid = (id, feeType) => {
    const token = getSessionToken();

    // 1. Immediately remove from local feePaymentsList
    setFeePaymentsList(prev => prev.filter(p => {
      if (p.studentId !== id) return true;
      if (feeType === 'admissionPaid' && p.feeType === 'admission') return false;
      if (feeType === 'currentMonthPaid' && p.feeType === 'monthly' && p.feeMonth === feeMonth) return false;
      return true;
    }));

    // 2. Immediately update student in state
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        let updated = { ...s };
        if (feeType === 'currentMonthPaid') {
          const rawPaid = s.paidMonths instanceof Map ? Object.fromEntries(s.paidMonths) : (s.paidMonths || {});
          const newPaidMonths = { ...rawPaid };
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

    // 3. Cancel payment on backend
    fetch(`${API_BASE_URL}/payments/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        studentId: id,
        feeType: feeType === 'admissionPaid' ? 'admission' : 'monthly',
        ...(feeType === 'currentMonthPaid' ? { feeMonth } : {})
      })
    })
      .then(res => res.json())
      .then(() => fetchRevenueAndPayments())
      .catch(err => console.error("Error cancelling fee payment:", err));

    // 4. Update student document directly in MongoDB via PUT /api/students/:id
    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error saving updated student status:", err));
    }
  };

  const markFeePaidCustomMonth = (id, targetMonth) => {
    const student = students.find(s => s.id === id);
    let dueAmount = monthlyFeeRate;
    if (student) {
      const rateMonthly = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null
        ? student.customMonthlyRate
        : monthlyFeeRate;
      const discountAmount = getStudentDiscountForMonth(student, rateMonthly, targetMonth);
      dueAmount = Math.max(0, rateMonthly - discountAmount);
    }

    const token = getSessionToken();
    fetch(`${API_BASE_URL}/payments/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        studentId: id,
        feeType: 'monthly',
        feeMonth: targetMonth,
        amountDue: dueAmount,
        amountPaid: dueAmount,
        paymentDate: getLocalDateString(),
        paymentMethod: 'Cash'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.payment) {
          setFeePaymentsList(prev => [data.payment, ...prev.filter(p => !(p.studentId === id && p.feeMonth === targetMonth && p.feeType === 'monthly'))]);
        }
        fetchRevenueAndPayments();
      })
      .catch(err => console.error("Error recording custom fee payment:", err));

    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        let updated = { ...s };
        const rawPaid = s.paidMonths instanceof Map ? Object.fromEntries(s.paidMonths) : (s.paidMonths || {});
        updated.paidMonths = { ...rawPaid, [targetMonth]: true };
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
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error updating student status:", err));
    }
  };

  const unmarkFeePaidCustomMonth = (id, targetMonth) => {
    const token = getSessionToken();

    // 1. Immediately remove from local fee payments list
    setFeePaymentsList(prev => prev.filter(p => !(p.studentId === id && p.feeMonth === targetMonth && p.feeType === 'monthly')));

    // 2. Immediately update student paidMonths in local state
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        let updated = { ...s };
        const rawPaid = s.paidMonths instanceof Map ? Object.fromEntries(s.paidMonths) : (s.paidMonths || {});
        const newPaidMonths = { ...rawPaid };
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

    // 3. Call backend /api/payments/cancel (unsets paidMonths in DB and deletes payment records)
    fetch(`${API_BASE_URL}/payments/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        studentId: id,
        feeType: 'monthly',
        feeMonth: targetMonth
      })
    })
      .then(res => res.json())
      .then(() => fetchRevenueAndPayments())
      .catch(err => console.error("Error cancelling custom fee payment:", err));

    // 4. Update student document directly via PUT /api/students/:id with auth token
    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .catch(err => console.error("Error saving updated student paidMonths:", err));
    }
  };

  const openRecordPaymentModal = (student, targetMonth = feeMonth, feeType = 'monthly') => {
    let dueAmount = 600;
    if (student) {
      if (feeType === 'admission') {
        const rateAdmission = student.customAdmissionRate !== undefined && student.customAdmissionRate !== null
          ? student.customAdmissionRate
          : admissionFeeRate;
        const admissionCoupon = resolveCouponCode(student.appliedAdmissionCoupon);
        let admissionDiscountAmount = 0;
        if (admissionCoupon) {
          admissionDiscountAmount = admissionCoupon.type === 'percentage'
            ? Math.round(rateAdmission * admissionCoupon.value / 100)
            : admissionCoupon.value;
        }
        dueAmount = Math.max(0, rateAdmission - admissionDiscountAmount);
      } else {
        const rateMonthly = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null
          ? student.customMonthlyRate
          : monthlyFeeRate;
        const discountAmount = getStudentDiscountForMonth(student, rateMonthly, targetMonth);
        dueAmount = Math.max(0, rateMonthly - discountAmount);
      }
    }

    setPaymentFormData({
      studentId: student ? student.id : '',
      studentName: student ? (student.studentName || student.name) : '',
      branch: student ? student.branch : '',
      batch: student ? student.batch : '',
      feeType,
      feeMonth: targetMonth,
      amountDue: dueAmount,
      amountPaid: dueAmount,
      paymentDate: getLocalDateString(),
      paymentMethod: 'Cash',
      transactionRef: '',
      notes: ''
    });
    setIsRecordPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    const token = getSessionToken();
    fetch(`${API_BASE_URL}/payments/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(paymentFormData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(`Error recording payment: ${data.error}`);
          return;
        }
        setIsRecordPaymentModalOpen(false);
        setActiveReceipt(data.payment);
        setIsReceiptModalOpen(true);

        // Update student local state
        const targetId = Number(paymentFormData.studentId);
        const updatedList = students.map(s => {
          if (s.id === targetId) {
            const updated = { ...s };
            if (paymentFormData.feeType === 'monthly') {
              updated.paidMonths = { ...(s.paidMonths || {}), [paymentFormData.feeMonth]: true };
            } else if (paymentFormData.feeType === 'admission') {
              updated.admissionPaid = paymentFormData.paymentDate.slice(0, 7);
            }
            return updated;
          }
          return s;
        });
        setStudents(updatedList);
        fetchRevenueAndPayments();
      })
      .catch(err => {
        console.error("Error submitting payment:", err);
        alert("Network error recording payment.");
      });
  };

  const markAllFeesPaid = (id) => {
    const token = getSessionToken();
    let updatedStudent = null;
    const updatedStudentsList = students.map(s => {
      if (s.id === id) {
        const fees = calculateStudentFees(s);
        const rawPaid = s.paidMonths instanceof Map ? Object.fromEntries(s.paidMonths) : (s.paidMonths || {});
        const newPaidMonths = { ...rawPaid };
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
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedStudent)
      })
        .then(res => res.json())
        .then(() => fetchRevenueAndPayments())
        .catch(err => console.error("Error updating fee status:", err));
    }
  };

  const markAllFeesUnpaid = (id) => {
    const token = getSessionToken();

    // 1. Immediately remove from local feePaymentsList
    setFeePaymentsList(prev => prev.filter(p => !(p.studentId === id && p.feeType === 'monthly')));

    // 2. Immediately clear student paidMonths in state
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

    // 3. Cancel all monthly payments in backend
    fetch(`${API_BASE_URL}/payments/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        studentId: id,
        feeType: 'monthly'
      })
    })
      .then(res => res.json())
      .then(() => fetchRevenueAndPayments())
      .catch(err => console.error("Error cancelling all payments:", err));

    // 4. Update student document via PUT /api/students/:id with auth token
    if (updatedStudent) {
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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

  const handleCouponBlurForMonth = (student, monthStr, newCode) => {
    const code = newCode.trim().toUpperCase();

    // Validate the coupon code if one is entered
    let resolved = null;
    if (code) {
      resolved = resolveCouponCode(code);
      if (!resolved) {
        alert(`❌ Invalid coupon code: "${code}"`);
        return;
      }
    }

    const [year, month] = monthStr.split('-').map(Number);
    let updatedCoupons = student.appliedCoupons ? [...student.appliedCoupons] : [];
    const index = updatedCoupons.findIndex(c => c.appliedMonth === month && c.appliedYear === year);

    if (code) {
      const newCoupon = {
        couponId: code,
        couponCode: code,
        discountType: resolved.type,
        discountValue: resolved.value,
        appliedMonth: month,
        appliedYear: year,
        appliedAt: new Date().toISOString()
      };
      if (index > -1) {
        updatedCoupons[index] = newCoupon;
      } else {
        updatedCoupons.push(newCoupon);
      }
    } else {
      if (index > -1) {
        updatedCoupons.splice(index, 1);
      }
    }

    let updated = { ...student, appliedCoupons: updatedCoupons };

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
      .catch(err => console.error("Error updating month coupon from table:", err));
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
            <div className="dev-card-title"><Users size={16} color="var(--color-primary)" /> Total Users</div>
            <div className="dev-stat-val">{users?.total || 0}</div>
            <div className="dev-stat-lbl">Registered Accounts</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title"><Activity size={16} color="var(--status-success)" /> Active Sessions</div>
            <div className="dev-stat-val">{users?.sessions || 0}</div>
            <div className="dev-stat-lbl">{users?.active || 0} Online Users</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title"><Database size={16} color="var(--color-secondary)" /> Database Status</div>
            <div className="dev-stat-val" style={{ color: database?.status === 'Connected' ? 'var(--status-success)' : 'var(--status-danger)' }}>
              {database?.status || 'Unknown'}
            </div>
            <div className="dev-stat-lbl">{database?.studentsCount || 0} Students enrolled</div>
          </div>
          <div className="dev-card">
            <div className="dev-card-title"><Cpu size={16} color="var(--color-secondary)" /> Process Memory</div>
            <div className="dev-stat-val">{system?.memoryUsage || 'N/A'}</div>
            <div className="dev-stat-lbl">Heap memory used</div>
          </div>
        </div>

        {/* System & Database health details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Recent Audits */}
          <div className="dev-card">
            <div className="dev-card-header">
              <h4 className="dev-card-title"><History size={16} color="var(--color-secondary)" /> Recent Operations & Audits</h4>
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
              <h4 className="dev-card-title"><AlertTriangle size={16} color="var(--status-danger)" /> Intrusion alerts & Failed Logins</h4>
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
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Present Grad: <strong style={{ color: '#fff', float: 'right' }}>{student.belt}</strong></div>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>Admission Number: <strong style={{ color: '#fff', float: 'right' }}>{student.admissionNumber || student.admissionNo || student.id}</strong></div>
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
                    <td style={{ fontWeight: 600, color: isCurrent ? 'var(--color-primary)' : '#fff' }}>
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
                  <Bell size={16} color="var(--color-primary)" /> {editingNotificationId ? 'Edit Announcement' : 'Announcement Management'}
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
                  <option value="none" style={{ color: '#fff', background: '#1c1c2e' }}>No Portals Locked (Fully Open)</option>
                  <option value="batch" style={{ color: '#fff', background: '#1c1c2e' }}>Lock Trainer / Batch Portal</option>
                  <option value="branch" style={{ color: '#fff', background: '#1c1c2e' }}>Lock Branch Admin Portal</option>
                  <option value="admin" style={{ color: '#fff', background: '#1c1c2e' }}>Lock Super Admin Portal</option>
                  <option value="branch-batch" style={{ color: '#fff', background: '#1c1c2e' }}>Lock Branch Admin & Trainer Portals</option>
                  <option value="batch-admin" style={{ color: '#fff', background: '#1c1c2e' }}>Lock Trainer & Super Admin Portals</option>
                  <option value="admin-branch" style={{ color: '#fff', background: '#1c1c2e' }}>Lock Super Admin & Branch Admin Portals</option>
                  <option value="all" style={{ color: '#fff', background: '#1c1c2e' }}>Lock All Portals (Developer Only Bypass)</option>
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

            {/* Logged-In Page Lockout Options */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Individual Feature Lockouts (Logged-in Pages)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={!!devSettings.lockDashboardPage}
                    onChange={(e) => setDevSettings({ ...devSettings, lockDashboardPage: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Lock Dashboard Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={!!devSettings.lockAttendancePage}
                    onChange={(e) => setDevSettings({ ...devSettings, lockAttendancePage: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Lock Attendance Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={!!devSettings.lockFeesPage}
                    onChange={(e) => setDevSettings({ ...devSettings, lockFeesPage: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Lock Fees Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={!!devSettings.lockRemindersPage}
                    onChange={(e) => setDevSettings({ ...devSettings, lockRemindersPage: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Lock Reminders Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={!!devSettings.lockPerformancePage}
                    onChange={(e) => setDevSettings({ ...devSettings, lockPerformancePage: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Lock Student Performance Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={!!devSettings.lockGradingPage}
                    onChange={(e) => setDevSettings({ ...devSettings, lockGradingPage: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Lock Grading Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={!!devSettings.lockBranchBatchMappingPage}
                    onChange={(e) => setDevSettings({ ...devSettings, lockBranchBatchMappingPage: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Lock Branch & Batch Mapping Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={!!devSettings.allowBranchAdminChangeBelt}
                    onChange={(e) => setDevSettings({ ...devSettings, allowBranchAdminChangeBelt: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Allow Branch Admin to manually change Present Grad
                </label>
              </div>
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
              <Shield size={20} color="var(--color-primary)" /> <span>MASTER</span><span className="brand-accent">FIT</span><span>•</span><span>DEV</span>
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
                setAppMode('developer-login');
                window.location.hash = '#/developer/login';
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
              setAppMode('developer-login');
              window.location.hash = '#/developer/login';
            }}>
              <LogOut className="dev-nav-icon" style={{ color: '#ff453a' }} /> <span>Console Logout</span>
            </a>
          </div>
        </aside>

        {/* Developer Main Area */}
        <main className="dev-main">
          {isSystemUnderMaintenance && (
            <div className="maintenance-alert-banner-static" style={{ margin: '1.25rem 1.5rem 0 1.5rem', background: 'linear-gradient(90deg, var(--color-primary), #c10712)', animation: 'none' }}>
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
          <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('about'); setIsMobileMenuOpen(false); window.scrollTo(0, 0); }}>About Us</a>
          <a href="#branches" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('branches'); setIsMobileMenuOpen(false); window.scrollTo(0, 0); }}>Branches</a>
          <a href="#disciplines" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Disciplines</a>
          <a href="#instructors" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>TEAM MASTERFIT</a>
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
        <img src="/hero-banner.jpeg" alt="Master Fit Academy - Grab Your Better Version" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-subtitle">GRAB YOUR BETTER VERSION</span>
          <h1 className="hero-title">MASTER FIT <span>Academy</span></h1>
          <div className="hero-desc">
            <p style={{ marginBottom: '0.85rem' }}>
              At Master Fit Academy, we are dedicated to building stronger bodies, sharper minds, and confident individuals. We provide professional training in Wushu, Boxing, Karate, Kung Fu, Wrestling, Kickboxing, Judo, MMA, Taekwondo, Fitness Training, and Sports Martial Arts.
            </p>
            <p style={{ marginBottom: '0.85rem' }}>
              Our comprehensive training programs are designed for students of different ages, abilities, and fitness levels. We combine traditional martial arts values with modern training techniques to develop complete physical and mental fitness. Through discipline, determination, and focused training, we help every student discover and develop their true potential.
            </p>
            <p style={{ marginBottom: '0.85rem' }}>
              Our programs encourage students to achieve excellence not only in sports but also in their education, personal development, and competitive performance. Martial arts and sports achievements can help eligible students gain sports-related benefits and grace marks in accordance with applicable rules and institutional policies. We also prepare and guide students to develop the fitness, discipline, skills, and confidence that can support them in pursuing eligible government and career opportunities.
            </p>
            <p style={{ marginBottom: '1.25rem', color: '#fff', fontWeight: 500 }}>
              At Master Fit Academy, we don't just teach martial arts—we build confidence, character, discipline, and champions for life. Join Master Fit Academy and take the first step toward a stronger, healthier, more confident, and successful future.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }} onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
              Start Your Journey <ArrowRight size={20} />
            </button>
            <button className="btn-outline-primary" style={{ padding: '1rem 1.75rem', fontSize: '1.05rem', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => { setAppMode('about'); window.scrollTo(0, 0); }}>
              About Academy
            </button>
            <button className="btn-outline-primary" style={{ padding: '1rem 1.75rem', fontSize: '1.05rem', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => { setAppMode('branches'); window.scrollTo(0, 0); }}>
              <MapPin size={18} style={{ marginRight: '6px' }} /> Our Branches
            </button>
          </div>
        </div>
      </section>

      <section id="disciplines" className="section" style={{ background: '#050505' }}>
        <div className="section-header">
          <span className="section-subtitle">Our Specializations</span>
          <h2 className="section-title">Training Programs</h2>
        </div>
        <div className="disciplines-grid">
          {[
            {
              title: 'Kung Fu',
              desc: 'Develop exceptional agility, focus, and traditional forms. Master the flow of energy and strike with precision.',
              img: '/kungfu.png'
            },
            {
              title: 'Karate',
              desc: 'Build self-discipline, speed, and raw power. Learn effective striking techniques, blocks, and core defensive patterns.',
              img: '/karate.png'
            },
            {
              title: 'Wushu',
              desc: 'Combine acrobatics and martial arts. Learn high-flying jumps, fluid weapon routines, and dynamic performance elements.',
              img: '/wushu.png'
            },
            {
              title: 'MMA',
              desc: 'Full-spectrum mixed martial arts integrating striking, clinch control, takedowns, and comprehensive ground defense.',
              img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'
            },
            {
              title: 'Kickboxing',
              desc: 'High-energy striking fusing explosive kicks, rapid punch combinations, and relentless cardiovascular conditioning.',
              img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800'
            },
            {
              title: 'Boxing',
              desc: 'Master the sweet science: precision punching mechanics, head movement, agile footwork, and counter-strike defense.',
              img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800'
            },
            {
              title: 'Judo',
              desc: 'Master powerful throws, foot sweeps, leverage control, and breakfall techniques for maximum efficiency and defense.',
              img: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800'
            },
            {
              title: 'Wrestling',
              desc: 'Build supreme physical strength, explosive takedowns, control holds, pinning mastery, and unstoppable endurance.',
              img: '/wrestling.jpg'
            },
            {
              title: 'Taekwondo',
              desc: 'Fast-paced Olympic-style high kicking, dynamic jumping spinning kicks, agile footwork, and precise sparring tactics.',
              img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
            },
            {
              title: 'Fitness Training',
              desc: 'Functional strength conditioning, high-intensity endurance, athletic agility drills, and total body transformation.',
              img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
            },
            {
              title: 'Sports Martial Arts',
              desc: 'Tournament competition coaching, national/state championship preparation, and sports grace marks eligibility guidance.',
              img: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?auto=format&fit=crop&q=80&w=800'
            }
          ].map((item, idx) => (
            <div key={idx} className="discipline-card">
              <img
                src={item.img}
                alt={item.title}
                className="discipline-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="discipline-overlay"></div>
              <div className="discipline-info">
                <h3 className="discipline-title">{item.title}</h3>
                <p className="discipline-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="instructors" className="section">
        <div className="section-header">
          <span className="section-subtitle">TEAM MASTERFIT</span>
          <h2 className="section-title">TEAM MASTERFIT</h2>
        </div>
        <div className="instructor-grid">
          {/* Sensei */}
          <div className="instructor-card glass-panel">
            <span className="instructor-role-tag">Sensei</span>
            <img src="/navas-kc.jpg" alt="Sensei MR NAVAS KC" className="instructor-img" style={{ objectPosition: 'center 12%' }} />
            <div className="instructor-info">
              <h3>MR NAVAS KC</h3>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Founder & Chief Sensei</p>
            </div>
          </div>

          {/* Advocate / Legal Advisor */}
          <div className="instructor-card glass-panel">
            <span className="instructor-role-tag">Advocate</span>
            <img src="/rashed-kavil.jpg" alt="ADV RASHED KAVIL" className="instructor-img" style={{ objectPosition: 'center 15%' }} />
            <div className="instructor-info">
              <h3>ADV RASHED KAVIL</h3>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Legal Advisor & Chief Patron</p>
            </div>
          </div>

          {/* Coach 1 */}
          <div className="instructor-card glass-panel">
            <span className="instructor-role-tag">Coach</span>
            <img src="/vindas.jpg" alt="Coach Vindas" className="instructor-img" style={{ objectPosition: 'center 15%' }} />
            <div className="instructor-info">
              <h3>Vindas</h3>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Head Coach</p>
            </div>
          </div>

          {/* Coach 2 */}
          <div className="instructor-card glass-panel">
            <span className="instructor-role-tag">Coach</span>
            <img src="/munaib.jpg" alt="Coach Munaib" className="instructor-img" style={{ objectPosition: 'center 12%' }} />
            <div className="instructor-info">
              <h3>Munaib</h3>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Striking & Fitness Coach</p>
            </div>
          </div>

          {/* Coach 3 */}
          <div className="instructor-card glass-panel">
            <span className="instructor-role-tag">Coach</span>
            <img src="/hisham.jpg" alt="Coach Hisham" className="instructor-img" style={{ objectPosition: 'center 10%' }} />
            <div className="instructor-info">
              <h3>Hisham</h3>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>MMA & Conditioning Coach</p>
            </div>
          </div>

          {/* Coach 4 */}
          <div className="instructor-card glass-panel">
            <span className="instructor-role-tag">Coach</span>
            <img src="https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80" alt="Coach Elena Rostova" className="instructor-img" />
            <div className="instructor-info">
              <h3>Elena Rostova</h3>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Taekwondo & Fitness Coach</p>
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
          <div className="gallery-item"><img src={gallery1Img} alt="Gallery 1" /></div>
          <div className="gallery-item"><img src={gallery2Img} alt="Gallery 2" /></div>
          <div className="gallery-item"><img src={gallery3Img} alt="Gallery 3" /></div>
          <div className="gallery-item"><img src={gallery4Img} alt="Gallery 4" /></div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><Phone size={18} color="var(--color-primary)" /> 9995422610</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><MapPin size={18} color="var(--color-primary)" /> KUTTIADY HEAD OFFICE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>IG</span> <a href="https://www.instagram.com/master_fit__?igsh=ZTZta2dsMjJpeXR3" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>@master_fit__</a></div>
          </div>
        </div>
      </section>
    </div>
  );

  // --- Dedicated About Us Page View ---
  const renderAboutPage = () => (
    <div className={`about-page-layout ${isMaintenanceUpcoming ? 'has-maintenance-banner' : ''}`}>
      {isMaintenanceUpcoming && (
        <div className="maintenance-alert-banner" style={{ zIndex: 1200, top: '0px' }}>
          <AlertTriangle size={18} className="pulse-icon" />
          <span>Upcoming Maintenance: Portal login will be restricted from {formatMaintenanceTime(maintenanceStart)} to {formatMaintenanceTime(maintenanceEnd)}.</span>
        </div>
      )}
      <nav className={`public-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => { setAppMode('website'); window.scrollTo(0, 0); setIsMobileMenuOpen(false); }}>
          <span className="brand-accent">MASTER</span> FIT
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="/" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); window.scrollTo(0, 0); setIsMobileMenuOpen(false); }}>Home</a>
          <a href="#about" className="nav-link active" style={{ color: 'var(--color-primary)' }} onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); }}>About Us</a>
          <a href="#branches" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('branches'); setIsMobileMenuOpen(false); window.scrollTo(0, 0); }}>Branches</a>
          <a href="/#disciplines" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('disciplines')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Disciplines</a>
          <a href="/#instructors" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('instructors')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>TEAM MASTERFIT</a>
          <a href="/#gallery" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Gallery</a>
          <a href="/#contact" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Contact</a>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline-primary" onClick={() => { setAppMode('login'); setIsMobileMenuOpen(false); }}>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* About Hero */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <div className="about-badge">
            <Shield size={16} /> MASTER FIT ACADEMY
          </div>
          <h1 className="about-hero-title">
            About <span>Master Fit</span> Academy
          </h1>
          <p className="about-hero-subtitle">
            Dedicated to building stronger bodies, sharper minds, and confident individuals through world-class martial arts instruction, character development, and champion-level sports conditioning.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '0.85rem 1.8rem' }} onClick={() => { setAppMode('website'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
              Join Our Academy <ArrowRight size={18} />
            </button>
            <button className="btn-outline-primary" style={{ padding: '0.85rem 1.8rem', background: 'rgba(255,255,255,0.06)' }} onClick={() => { setAppMode('website'); window.scrollTo(0, 0); }}>
              Back to Home
            </button>
          </div>
        </div>
      </section>

      {/* Key Stats Bar */}
      <div className="about-stats-container">
        <div className="about-stats-grid">
          <div className="about-stat-card">
            <div className="about-stat-icon"><Award size={22} /></div>
            <div className="about-stat-number">11+ Arts</div>
            <div className="about-stat-label">Combat Disciplines</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-icon"><Users size={22} /></div>
            <div className="about-stat-number">5000+</div>
            <div className="about-stat-label">Students Trained</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-icon"><Shield size={22} /></div>
            <div className="about-stat-number">100%</div>
            <div className="about-stat-label">Certified Masters</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-icon"><Star size={22} /></div>
            <div className="about-stat-number">Grace Marks</div>
            <div className="about-stat-label">& Career Guidance</div>
          </div>
        </div>
      </div>

      {/* Comprehensive Story Section */}
      <section className="about-story-section">
        <div className="about-story-text">
          <span className="section-subtitle" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Our Heritage & Philosophy</span>
          <h2>Empowering Champions For Life</h2>
          <p>
            At Master Fit Academy, we are dedicated to building stronger bodies, sharper minds, and confident individuals. We provide professional training in Wushu, Boxing, Karate, Kung Fu, Wrestling, Kickboxing, Judo, MMA, Taekwondo, Fitness Training, and Sports Martial Arts.
          </p>
          <p>
            Our comprehensive training programs are designed for students of different ages, abilities, and fitness levels. We combine traditional martial arts values with modern training techniques to develop complete physical and mental fitness.
          </p>
          <p>
            Through discipline, determination, and focused training, we help every student discover and develop their true potential. Our programs encourage students to achieve excellence not only in sports but also in their education, personal development, and competitive performance.
          </p>
          <p style={{ color: '#fff', fontWeight: 600 }}>
            At Master Fit Academy, we don't just teach martial arts—we build confidence, character, discipline, and champions for life.
          </p>
        </div>

        <div className="about-feature-box">
          <h3 style={{ margin: '0 0 1.5rem 0', fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff' }}>
            Why Choose Master Fit?
          </h3>
          <div className="about-feature-item">
            <div className="about-feature-icon"><CheckCircle size={18} /></div>
            <div>
              <h4>Authentic Martial Arts Mastery</h4>
              <p>Certified black belt instructors preserving the highest technical standards of traditional forms and practical self-defense.</p>
            </div>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon"><CheckCircle size={18} /></div>
            <div>
              <h4>Multi-Discipline Training Facility</h4>
              <p>Specialized training areas with high-grade mats, punching bags, agility equipment, and protective sparring gear.</p>
            </div>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon"><CheckCircle size={18} /></div>
            <div>
              <h4>Anti-Bullying & Character Growth</h4>
              <p>Instilling unshakable self-confidence, emotional poise, respect for peers, and situational awareness.</p>
            </div>
          </div>
          <div className="about-feature-item">
            <div className="about-feature-icon"><CheckCircle size={18} /></div>
            <div>
              <h4>Tournament & Championship Coaching</h4>
              <p>Structured pathway from white belt to black belt, with dedicated coaching for district, state, and national tournaments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="about-values-section">
        <div className="section-header" style={{ marginBottom: '3rem' }}>
          <span className="section-subtitle">Our Guiding Principles</span>
          <h2 className="section-title">Mission, Vision & Core Values</h2>
        </div>
        <div className="about-values-grid">
          <div className="about-value-card">
            <div className="about-value-header">
              <div style={{ color: '#E50914' }}><Activity size={24} /></div>
              <h3 className="about-value-title">Our Mission</h3>
            </div>
            <p className="about-value-desc">
              To cultivate mental resilience, physical strength, and unshakeable confidence in students of all ages through disciplined, scientifically-backed martial arts instruction and character mentorship.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-value-header">
              <div style={{ color: '#FFD700' }}><TrendingUp size={24} /></div>
              <h3 className="about-value-title">Our Vision</h3>
            </div>
            <p className="about-value-desc">
              To be the gold standard of martial arts and fitness academies in Kerala, producing state and national champions while empowering every individual to lead a healthier, disciplined, and purposeful life.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-value-header">
              <div style={{ color: '#E50914' }}><Shield size={24} /></div>
              <h3 className="about-value-title">Our Values</h3>
            </div>
            <p className="about-value-desc">
              <strong>Respect:</strong> Honor for masters, peers, and opponents.<br />
              <strong>Discipline:</strong> Consistency in mind and body.<br />
              <strong>Perseverance:</strong> Overcoming challenges on and off the mat.<br />
              <strong>Integrity:</strong> Upholding moral excellence always.
            </p>
          </div>
        </div>
      </section>

      {/* Sports Grace Marks & Career Opportunities Banner */}
      <div className="about-grace-banner">
        <div className="about-grace-inner">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#FFD700', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '1px' }}>
              <Award size={18} /> Academic & Government Career Pathways
            </div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#fff' }}>
              Sports Grace Marks & Career Guidance
            </h3>
            <p style={{ color: '#b5b5b5', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
              Martial arts and sports achievements can help eligible students gain sports-related benefits and grace marks in accordance with applicable rules and institutional policies.
            </p>
            <p style={{ color: '#b5b5b5', lineHeight: '1.6', margin: 0 }}>
              We also prepare and guide students to develop the fitness, discipline, skills, and confidence that can support them in pursuing eligible government and career opportunities.
            </p>
          </div>
          <div style={{ background: 'rgba(5,5,5,0.7)', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.1rem' }}>How We Guide Our Athletes</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#a0a0a0', lineHeight: '1.8', fontSize: '0.92rem' }}>
              <li>Guidance for official state & national tournament certifications.</li>
              <li>Support for academic grace mark application processes.</li>
              <li>Physical fitness training tailored for police & defense services.</li>
              <li>Lifelong leadership & sportsmanship credentials.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Category Levels Grid */}
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <span className="section-subtitle">Programs For Everyone</span>
        <h2 className="section-title">Age Groups & Training Levels</h2>
      </div>
      <div className="about-levels-grid">
        <div className="about-level-card">
          <span className="about-level-badge">Ages 4 - 12</span>
          <h3 className="about-level-title">Kids & Juniors</h3>
          <p className="about-level-desc">Foundational coordination, agility drills, anti-bullying awareness, discipline, and fun martial arts movements.</p>
        </div>
        <div className="about-level-card">
          <span className="about-level-badge">Ages 13 - 19</span>
          <h3 className="about-level-title">Teens & Youth</h3>
          <p className="about-level-desc">Advanced combat arts, belt rank gradings, stamina building, tournament preparation, and academic sports guidance.</p>
        </div>
        <div className="about-level-card">
          <span className="about-level-badge">All Ages</span>
          <h3 className="about-level-title">Adults & Fitness</h3>
          <p className="about-level-desc">MMA, Kickboxing, functional conditioning, stress relief, self-defense, weight loss, and core strength.</p>
        </div>
        <div className="about-level-card">
          <span className="about-level-badge">Selection Basis</span>
          <h3 className="about-level-title">Elite Championship Squad</h3>
          <p className="about-level-desc">Intensive tournament sparring, weapon katas, and national coaching for gold-medal aspirations.</p>
        </div>
      </div>

      {/* Call to Action Banner */}
      <section style={{ maxWidth: '900px', margin: '0 auto 5rem auto', padding: '0 2rem' }}>
        <div className="glass-panel panel" style={{ textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(10,10,10,0.98))', border: '1px solid rgba(229,9,20,0.35)', borderRadius: '20px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', textTransform: 'uppercase', margin: '0 0 1rem 0', color: '#fff' }}>
            Ready to Begin Your Transformation?
          </h2>
          <p style={{ color: '#aaa', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            Join Master Fit Academy and take the first step toward a stronger, healthier, more confident, and successful future.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }} onClick={() => { setAppMode('website'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
              Schedule Free Trial Class <ArrowRight size={18} />
            </button>
            <button className="btn-outline-primary" style={{ padding: '0.9rem 1.8rem', fontSize: '1.05rem' }} onClick={() => { setAppMode('branches'); window.scrollTo(0, 0); }}>
              <MapPin size={18} style={{ marginRight: '6px' }} /> View All Branches
            </button>
            <button className="btn-outline-primary" style={{ padding: '0.9rem 1.8rem', fontSize: '1.05rem' }} onClick={() => { setAppMode('website'); window.scrollTo(0, 0); }}>
              Explore Disciplines
            </button>
          </div>
          <div className="contact-info" style={{ marginTop: '2.5rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><Phone size={18} color="var(--color-primary)" /> 9995422610</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><MapPin size={18} color="var(--color-primary)" /> KUTTIADY HEAD OFFICE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>IG</span> <a href="https://www.instagram.com/master_fit__?igsh=ZTZta2dsMjJpeXR3" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>@master_fit__</a></div>
          </div>
        </div>
      </section>
    </div>
  );

  // --- Dedicated Branches Page View ---
  const renderPublicBranchesPage = () => {
    const filteredBranches = BRANCHES_DATA.filter((b) => {
      const q = (branchSearchQuery || '').toLowerCase().trim();
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.disciplines.some((d) => d.toLowerCase().includes(q))
      );
    });

    return (
      <div className={`branches-page-layout ${isMaintenanceUpcoming ? 'has-maintenance-banner' : ''}`}>
        {isMaintenanceUpcoming && (
          <div className="maintenance-alert-banner" style={{ zIndex: 1200, top: '0px' }}>
            <AlertTriangle size={18} className="pulse-icon" />
            <span>Upcoming Maintenance: Portal login will be restricted from {formatMaintenanceTime(maintenanceStart)} to {formatMaintenanceTime(maintenanceEnd)}.</span>
          </div>
        )}
        <nav className={`public-nav ${scrolled ? 'scrolled' : ''}`}>
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => { setAppMode('website'); window.scrollTo(0, 0); setIsMobileMenuOpen(false); }}>
            <span className="brand-accent">MASTER</span> FIT
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <a href="/" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); window.scrollTo(0, 0); setIsMobileMenuOpen(false); }}>Home</a>
            <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('about'); setIsMobileMenuOpen(false); window.scrollTo(0, 0); }}>About Us</a>
            <a href="#branches" className="nav-link active" style={{ color: 'var(--color-primary)' }} onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); }}>Branches</a>
            <a href="/#disciplines" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('disciplines')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Disciplines</a>
            <a href="/#instructors" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('instructors')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>TEAM MASTERFIT</a>
            <a href="/#gallery" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Gallery</a>
            <a href="/#contact" className="nav-link" onClick={(e) => { e.preventDefault(); setAppMode('website'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Contact</a>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-outline-primary" onClick={() => { setAppMode('login'); setIsMobileMenuOpen(false); }}>
                Login
              </button>
            </div>
          </div>
        </nav>

        {/* Branches Hero */}
        <section className="branches-hero-section">
          <div className="branches-hero-content">
            <div className="about-badge" style={{ background: 'rgba(255, 215, 0, 0.15)', borderColor: 'rgba(255, 215, 0, 0.4)', color: '#FFD700' }}>
              <MapPin size={16} /> 11 LOCATIONS ACROSS KERALA
            </div>
            <h1 className="about-hero-title">
              Our <span>Academy Branches</span>
            </h1>
            <p className="about-hero-subtitle">
              Locate your nearest Master Fit Academy center across Kozhikode and Kannur. Contact our branch coordinators directly to schedule your trial class and check batch timings.
            </p>

            <div className="branches-search-wrapper">
              <Search className="branches-search-icon" size={20} />
              <input
                type="text"
                className="branches-search-input"
                placeholder="Search by branch name, location, or art (e.g. Kuttiady, Perambra, MMA)..."
                value={branchSearchQuery}
                onChange={(e) => setBranchSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Branches Listing */}
        <section className="branches-container">
          <div className="branches-grid">
            {filteredBranches.map((branch) => {
              const waMessage = encodeURIComponent(`Hi Master Fit Academy, I would like to inquire about training classes and batch timings at the ${branch.name} branch.`);
              return (
                <div key={branch.id} className={`branch-card ${branch.isHeadOffice ? 'is-head-office' : ''}`}>
                  <div>
                    <div className="branch-card-header">
                      <div className="branch-title-wrap">
                        <div className="branch-pin-icon">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h3 className="branch-name">{branch.name}</h3>
                          <span style={{ fontSize: '0.78rem', color: '#888' }}>Kerala</span>
                        </div>
                      </div>
                      <span className={`branch-tag ${branch.isHeadOffice ? 'tag-head-office' : 'tag-branch'}`}>
                        {branch.tag}
                      </span>
                    </div>

                    <div className="branch-info-list">
                      <div className="branch-info-row">
                        <Phone size={17} />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Phone</div>
                          <a href={`tel:${branch.phone}`} className="branch-phone-number">{branch.phone}</a>
                        </div>
                      </div>

                      <div className="branch-info-row">
                        <MapPin size={17} />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address / Landmark</div>
                          <span>{branch.address}</span>
                        </div>
                      </div>

                      <div className="branch-info-row">
                        <Activity size={17} />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Batches</div>
                          <span>{branch.timings}</span>
                        </div>
                      </div>
                    </div>

                    <div className="branch-disciplines-section">
                      <div className="branch-disciplines-label">Offered Disciplines</div>
                      <div className="branch-chips-wrap">
                        {branch.disciplines.map((d, i) => (
                          <span key={i} className="branch-chip">{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="branch-card-actions">
                    <a href={`tel:${branch.phone}`} className="branch-btn-call">
                      <Phone size={16} /> Call Now
                    </a>
                    <a
                      href={`https://wa.me/${branch.whatsapp}?text=${waMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="branch-btn-wa"
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBranches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
              <MapPin size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No branches matching "{branchSearchQuery}"</h3>
              <p>Try searching for Kuttiady, Perambra, Kallachi, or another location name.</p>
              <button className="btn-outline-primary" style={{ marginTop: '1rem' }} onClick={() => setBranchSearchQuery('')}>Clear Search</button>
            </div>
          )}

          <div style={{ marginTop: '4.5rem', textAlign: 'center' }}>
            <div className="glass-panel panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 2rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', color: '#fff', marginBottom: '0.75rem' }}>
                Can't find your location or have a custom batch request?
              </h3>
              <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Contact our Kuttiady Head Office directly. We provide centralized admissions, batch transfers, and trial class bookings for all branches across Kerala.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="tel:9995422610" className="btn-primary" style={{ padding: '0.85rem 1.8rem' }}>
                  <Phone size={18} /> Call Head Office (9995422610)
                </a>
                <button className="btn-outline-primary" style={{ padding: '0.85rem 1.8rem' }} onClick={() => { setAppMode('website'); window.scrollTo(0, 0); }}>
                  Back to Main Home
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

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
              const dayNamesShortList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayOfWeekShort = dayNamesShortList[new Date(year, m, d).getDay()];

              // Check if scheduled batch day
              let isBatchDay = true;
              if (batchFilter !== 'All') {
                const selectedBatchObj = batchOptions.find(b => b.id.toLowerCase() === batchFilter.toLowerCase());
                if (selectedBatchObj) {
                  const bDays = parseScheduleToDays(selectedBatchObj.schedule);
                  isBatchDay = !!bDays[dayOfWeekShort];
                }
              } else {
                const relevantStudents = searchedStudents.filter(s => (s.status || 'Active') !== 'Inactive' && (branchFilter === 'All' || s.branch === branchFilter));
                if (relevantStudents.length > 0) {
                  isBatchDay = relevantStudents.some(s => {
                    const sched = s.schedule || batchOptions.find(b => b.id.toLowerCase() === (s.batch || '').toLowerCase())?.schedule;
                    return sched ? !!parseScheduleToDays(sched)[dayOfWeekShort] : false;
                  });
                }
              }

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
                background: !isBatchDay ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)',
                transition: 'all 0.2s ease',
                border: !isBatchDay ? '1px dashed rgba(255, 255, 255, 0.08)' : '1px solid transparent',
                color: !isBatchDay ? '#636366' : '#ffffff',
                opacity: !isBatchDay ? 0.4 : 1
              };

              if (totalMarked > 0) {
                const ratio = presentCount / (students.length || 1);
                if (ratio >= 0.7) {
                  cellStyle.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                  cellStyle.borderColor = '#4CAF50';
                  cellStyle.color = '#4CAF50';
                  cellStyle.opacity = 1;
                } else {
                  cellStyle.backgroundColor = 'rgba(255, 152, 0, 0.2)';
                  cellStyle.borderColor = '#FF9800';
                  cellStyle.color = '#FF9800';
                  cellStyle.opacity = 1;
                }
              } else if (isBatchDay) {
                cellStyle.borderColor = 'rgba(56, 189, 248, 0.25)';
                cellStyle.color = '#38bdf8';
              }

              if (dateStr === markingDate) {
                cellStyle.borderColor = 'var(--color-primary)';
                cellStyle.boxShadow = '0 0 8px rgba(229, 9, 20, 0.4)';
                cellStyle.opacity = 1;
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
                  title={totalMarked > 0 ? `Attendance: ${presentCount} present` : (!isBatchDay ? `No batch scheduled (Off Day)` : `Class Day - click to mark`)}
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

    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Helper to determine if a day of the week has scheduled batch/class
    const isDayBatchScheduled = (dayOfWeekShortName) => {
      // 1. If specific batch is selected
      if (batchFilter !== 'All') {
        const selectedBatchObj = batchOptions.find(b => (b.id || b.code || '').toLowerCase() === batchFilter.toLowerCase());
        if (selectedBatchObj) {
          const bDays = parseScheduleToDays(selectedBatchObj.schedule);
          return !!bDays[dayOfWeekShortName];
        }
      }

      // 2. Filter active batches for current branch
      const activeBatches = batchOptions.filter(b =>
        (branchFilter === 'All' || !b.branch || b.branch.toLowerCase().trim() === branchFilter.toLowerCase().trim()) &&
        (b.status || 'Active') === 'Active'
      );

      if (activeBatches.length > 0) {
        return activeBatches.some(b => {
          const bDays = parseScheduleToDays(b.schedule);
          return !!bDays[dayOfWeekShortName];
        });
      }

      // 3. Fallback to student schedules if batches list is loading
      const relevantStudents = searchedStudents.filter(s => (s.status || 'Active') !== 'Inactive' && (branchFilter === 'All' || s.branch === branchFilter));
      if (relevantStudents.length > 0) {
        return relevantStudents.some(s => {
          const sched = s.schedule || batchOptions.find(b => (b.id || b.code || '').toLowerCase() === (s.batch || '').toLowerCase())?.schedule;
          return sched ? !!parseScheduleToDays(sched)[dayOfWeekShortName] : false;
        });
      }

      // 4. Default: Sunday is off day, Mon-Sat are potential batch days
      return dayOfWeekShortName !== 'Sun';
    };

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayRecord = attendanceRecords[dateStr];
      const dayOfWeekShort = dayNamesShort[new Date(year, month, i).getDay()];
      const isClassDay = isDayBatchScheduled(dayOfWeekShort);

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
        <div
          key={i}
          className={`calendar-day ${dateStr === markingDate ? 'today' : ''}`}
          onClick={() => {
            setMarkingDate(dateStr);
            setTimeout(() => {
              const el = document.getElementById('daily-attendance-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          style={{
            cursor: 'pointer',
            opacity: isClassDay ? 1 : 0.45,
            background: dateStr === markingDate
              ? 'rgba(229, 9, 20, 0.18)'
              : (!isClassDay ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.04)'),
            border: dateStr === markingDate
              ? '1px solid var(--color-primary)'
              : (!isClassDay ? '1px dashed rgba(255, 255, 255, 0.08)' : '1px solid var(--glass-border)')
          }}
        >
          <div className="day-number" style={{ color: !isClassDay ? '#636366' : '#fff' }}>{i}</div>
          <div className="day-content">
            {totalMarked > 0 ? (
              <div className="attendance-indicator" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="text-success" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', color: '#4CAF50' }}>
                  <CheckCircle size={11} /> {presentCount}
                </span>
                <span className="text-danger" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', color: '#ff453a' }}>
                  <XCircle size={11} /> {absentCount}
                </span>
              </div>
            ) : isClassDay ? (
              <span style={{ fontSize: '0.65rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 5px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'inline-block', marginTop: '2px', fontWeight: 600 }}>
                Class Day
              </span>
            ) : (
              <span style={{ fontSize: '0.65rem', color: '#8e8e93', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 5px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'inline-block', marginTop: '2px' }}>
                No Batches
              </span>
            )}
          </div>
        </div>
      );
    }

    let markingDayOfWeekShort = 'Mon';
    let markingDayOfWeekFull = 'Monday';

    if (markingDate) {
      const [mY, mM, mD] = markingDate.split('-').map(Number);
      const dObj = new Date(mY, mM - 1, mD);
      if (!isNaN(dObj.getTime())) {
        markingDayOfWeekShort = dayNamesShort[dObj.getDay()];
        markingDayOfWeekFull = dayNamesFull[dObj.getDay()];
      }
    }

    const filteredAttendanceStudents = searchedStudents.filter(s => {
      const isInactive = (s.status || 'Active') === 'Inactive';
      if (isInactive) return false;

      // 1. Day of Week filter: Only show students whose batch/schedule runs on this day of the week
      const studentSched = s.schedule || (() => {
        const bObj = batchOptions.find(b =>
          (b.id && String(b.id).toLowerCase() === String(s.batch || '').toLowerCase()) ||
          (b.code && String(b.code).toLowerCase() === String(s.batch || '').toLowerCase()) ||
          (b.name && String(b.name).toLowerCase() === String(s.batch || '').toLowerCase())
        );
        return bObj ? bObj.schedule : '';
      })();

      if (studentSched) {
        const activeDaysMap = parseScheduleToDays(studentSched);
        if (activeDaysMap && Object.values(activeDaysMap).some(Boolean) && !activeDaysMap[markingDayOfWeekShort]) {
          return false; // Does not have class on this day
        }
      }

      // 2. Time Slot Filter (All, Morning, Evening, Night)
      const matchBatchSlot = attendanceBatchFilter === 'All' ||
        (s.batch && String(s.batch).toLowerCase() === attendanceBatchFilter.toLowerCase()) ||
        (() => {
          const batchObj = batchOptions.find(b =>
            (b.id && String(b.id).toLowerCase() === String(s.batch || '').toLowerCase()) ||
            (b.code && String(b.code).toLowerCase() === String(s.batch || '').toLowerCase()) ||
            (b.name && String(b.name).toLowerCase() === String(s.batch || '').toLowerCase())
          );
          return batchObj && batchObj.slotType && batchObj.slotType.toLowerCase() === attendanceBatchFilter.toLowerCase();
        })();

      // 3. Branch filter (case-insensitive & fallback)
      const matchBranch = branchFilter === 'All' ||
        !s.branch ||
        !branchFilter ||
        String(s.branch).toLowerCase().trim() === String(branchFilter).toLowerCase().trim() ||
        String(s.branch).toLowerCase().includes(String(branchFilter).toLowerCase().trim()) ||
        String(branchFilter).toLowerCase().includes(String(s.branch).toLowerCase().trim());

      // 4. Batch filter dropdown (matching id, code, or name)
      const matchBatchSchedule = batchFilter === 'All' || (() => {
        if (!s.batch || !batchFilter) return true;
        const studentBatchLower = String(s.batch).toLowerCase().trim();
        const selectedIdLower = String(batchFilter).toLowerCase().trim();
        if (studentBatchLower === selectedIdLower) return true;

        const selectedBatchObj = batchOptions.find(b =>
          (b.id && String(b.id).toLowerCase() === selectedIdLower) ||
          (b.code && String(b.code).toLowerCase() === selectedIdLower) ||
          (b.name && String(b.name).toLowerCase() === selectedIdLower)
        );
        if (selectedBatchObj) {
          if (
            (selectedBatchObj.id && String(selectedBatchObj.id).toLowerCase() === studentBatchLower) ||
            (selectedBatchObj.code && String(selectedBatchObj.code).toLowerCase() === studentBatchLower) ||
            (selectedBatchObj.name && String(selectedBatchObj.name).toLowerCase() === studentBatchLower)
          ) {
            return true;
          }
          return schedulesMatch(s.schedule, selectedBatchObj.schedule);
        }
        return true;
      })();

      return matchBatchSlot && matchBranch && matchBatchSchedule;
    });

    let dailyPresentCount = 0;
    let dailyAbsentCount = 0;
    filteredAttendanceStudents.forEach(s => {
      const st = attendanceRecords[markingDate]?.[s.id];
      if (st === 'present') dailyPresentCount++;
      else if (st === 'absent') dailyAbsentCount++;
    });

    return (
      <div className="attendance-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Sub-view switcher segmented pill bar */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <button
            type="button"
            onClick={() => setAttendanceTab('monthly')}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: attendanceTab === 'monthly' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
              color: attendanceTab === 'monthly' ? '#fff' : '#8e8e93',
              boxShadow: attendanceTab === 'monthly' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <CalendarDays size={14} /> Daily & Monthly
          </button>
          <button
            type="button"
            onClick={() => setAttendanceTab('year2026')}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: attendanceTab === 'year2026' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
              color: attendanceTab === 'year2026' ? '#fff' : '#8e8e93',
              boxShadow: attendanceTab === 'year2026' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={14} /> {new Date().getFullYear()} Full Year Calendar
          </button>
        </div>

        {attendanceTab === 'monthly' ? (
          <>
            {/* Daily Attendance Controller Card */}
            <div id="daily-attendance-section" className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 className="panel-title" style={{ fontSize: '0.95rem', margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Daily Attendance
                  </h3>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px' }}>
                    📅 {markingDayOfWeekFull}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.75rem', padding: '3px 8px' }}>
                    👥 {filteredAttendanceStudents.length} Students
                  </span>
                  <span className="badge" style={{ background: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.25)', fontSize: '0.75rem', padding: '3px 8px' }}>
                    ✓ {dailyPresentCount} Present
                  </span>
                  <span className="badge" style={{ background: 'rgba(244, 67, 54, 0.15)', color: '#ff453a', border: '1px solid rgba(244, 67, 54, 0.25)', fontSize: '0.75rem', padding: '3px 8px' }}>
                    ✕ {dailyAbsentCount} Absent
                  </span>
                </div>
              </div>

              {/* Filters Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
                {/* Branch Selector */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Branch</label>
                  <select
                    className="form-control"
                    style={{ width: '100%', height: '40px', borderRadius: '8px', fontSize: '0.88rem', padding: '0 10px' }}
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

                {/* Batch Selector */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Batch</label>
                  <select
                    className="form-control"
                    style={{ width: '100%', height: '40px', borderRadius: '8px', fontSize: '0.88rem', padding: '0 10px' }}
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    disabled={isBatchAdminUser(loggedInUser)}
                  >
                    <option value="All">All Batches</option>
                    {getFilteredBatchOptions().map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date Input */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: '100%', height: '40px', borderRadius: '8px', fontSize: '0.88rem', padding: '0 10px' }}
                    value={markingDate}
                    onChange={(e) => setMarkingDate(e.target.value)}
                  />
                </div>

                {/* Search Input */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search student..."
                      className="form-control search-input-box"
                      style={{ width: '100%', height: '40px', borderRadius: '8px', fontSize: '0.88rem' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Time Slot Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>Slot:</span>
                <button
                  type="button"
                  className={`quick-chip ${attendanceBatchFilter === 'All' ? 'active' : ''}`}
                  style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                  onClick={() => setAttendanceBatchFilter('All')}
                >
                  All Slots
                </button>
                <button
                  type="button"
                  className={`quick-chip ${attendanceBatchFilter === 'Morning' ? 'active' : ''}`}
                  style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                  onClick={() => setAttendanceBatchFilter('Morning')}
                >
                  🌅 Morning
                </button>
                <button
                  type="button"
                  className={`quick-chip ${attendanceBatchFilter === 'Evening' ? 'active' : ''}`}
                  style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                  onClick={() => setAttendanceBatchFilter('Evening')}
                >
                  🌇 Evening
                </button>
                <button
                  type="button"
                  className={`quick-chip ${attendanceBatchFilter === 'Night' ? 'active' : ''}`}
                  style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                  onClick={() => setAttendanceBatchFilter('Night')}
                >
                  🌙 Night
                </button>
              </div>
            </div>

            {/* Student Attendance List / Cards */}
            <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden', padding: 0 }}>
              {filteredAttendanceStudents.length > 0 ? (
                <div className="premium-table-container" style={{ border: 'none', background: 'transparent' }}>
                  <table className="premium-table responsive-table-cards">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Batch Schedule</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Mark Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendanceStudents.map(student => {
                        const status = attendanceRecords[markingDate]?.[student.id];
                        const initials = (student.studentName || student.name || 'S').split(' ').map(n => n[0]).slice(0, 2).join('');

                        return (
                          <tr key={student.id}>
                            <td data-label="Student" style={{ fontWeight: 700, color: '#fff' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="student-avatar-badge">{initials}</div>
                                <button
                                  type="button"
                                  onClick={() => handleSelectStudent(student)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    fontWeight: 700,
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit',
                                    textAlign: 'left',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {renderHighlightedName(student.studentName || student.name, searchQuery)}
                                  {student.isPriority && (
                                    <Star size={13} fill="#FFD700" color="#FFD700" title="Priority Student" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td data-label="Batch Info">
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className="badge" style={{ background: 'rgba(229, 9, 20, 0.15)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)', fontSize: '0.72rem', padding: '2px 6px' }}>
                                  {student.branch}
                                </span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.72rem', padding: '2px 6px' }}>
                                  {getBatchNameFromSchedule(student.schedule, student.branch)} • {student.schedule}
                                </span>
                              </div>
                            </td>
                            <td data-label="Status">
                              {status === 'present' && <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>Present</span>}
                              {status === 'absent' && <span className="badge badge-red" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>Absent</span>}
                              {!status && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Pending</span>}
                            </td>
                            <td data-label="Action">
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className={`btn-small ${status === 'present' ? 'btn-primary' : ''}`}
                                  style={{
                                    backgroundColor: status === 'present' ? '#4CAF50' : 'rgba(76, 175, 80, 0.12)',
                                    borderColor: status === 'present' ? '#4CAF50' : 'rgba(76, 175, 80, 0.3)',
                                    color: status === 'present' ? '#fff' : '#4CAF50',
                                    fontWeight: 600,
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: status === 'present' ? '0 2px 8px rgba(76, 175, 80, 0.35)' : 'none'
                                  }}
                                  onClick={() => markAttendance(student.id, status === 'present' ? 'none' : 'present')}
                                >
                                  <CheckCircle size={13} /> Present
                                </button>
                                <button
                                  type="button"
                                  className={`btn-small ${status === 'absent' ? 'btn-primary' : ''}`}
                                  style={{
                                    backgroundColor: status === 'absent' ? '#F44336' : 'rgba(244, 67, 54, 0.12)',
                                    borderColor: status === 'absent' ? '#F44336' : 'rgba(244, 67, 54, 0.3)',
                                    color: status === 'absent' ? '#fff' : '#ff453a',
                                    fontWeight: 600,
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: status === 'absent' ? '0 2px 8px rgba(244, 67, 54, 0.35)' : 'none'
                                  }}
                                  onClick={() => markAttendance(student.id, status === 'absent' ? 'none' : 'absent')}
                                >
                                  <XCircle size={13} /> Absent
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
                <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--color-text-muted)' }}>
                  <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>No Students Found</div>
                  <p style={{ fontSize: '0.8rem', margin: 0, marginTop: '4px' }}>No student records match the selected attendance filters.</p>
                </div>
              )}
            </div>

            {/* Monthly Calendar View */}
            <div className="calendar-container panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1.25rem' }}>
              <div className="calendar-header" style={{ marginBottom: '0.75rem' }}>
                <button className="btn-icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                  <ChevronLeft size={22} />
                </button>
                <h2 className="calendar-title" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#fff', margin: 0 }}>{monthNames[month]} {year}</h2>
                <button className="btn-icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                  <ChevronRight size={22} />
                </button>
              </div>

              {/* Calendar Legend */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50' }}></span> Present
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff453a' }}></span> Absent
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }}></span> Class Day
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#636366', border: '1px dashed rgba(255,255,255,0.2)' }}></span> No Batch (Off Day)
                </span>
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
      const matchBatch = feeBatchFilter === 'All' ||
        s.batch === feeBatchFilter ||
        (() => {
          const batchObj = batchOptions.find(b => b.id.toLowerCase() === (s.batch || '').toLowerCase());
          return batchObj && batchObj.slotType && batchObj.slotType.toLowerCase() === feeBatchFilter.toLowerCase();
        })();
      const matchSchedule = batchFilter === 'All' || (() => {
        const selectedBatchObj = batchOptions.find(b => b.id.toLowerCase() === batchFilter.toLowerCase());
        if (!selectedBatchObj) return false;
        const studentBatchLower = (s.batch || '').toLowerCase().trim();
        const targetIdLower = selectedBatchObj.id.toLowerCase().trim();
        const targetNameLower = selectedBatchObj.name.toLowerCase().trim();
        if (studentBatchLower === targetIdLower) return true;
        if (studentBatchLower === targetNameLower) return true;
        if (studentBatchLower && (studentBatchLower.startsWith('batch') || studentBatchLower.startsWith('batch_'))) {
          return false;
        }
        return schedulesMatch(s.schedule, selectedBatchObj.schedule);
      })();

      // Status filter
      let matchStatus = true;
      if (feeStatusFilter !== 'All') {
        const paidStatus = isPaid(s);
        const pRec = feePaymentsList.find(p => p.studentId === s.id && p.feeMonth === feeMonth && p.feeType === 'monthly');
        const effectiveStatus = pRec ? pRec.status : (paidStatus ? 'Paid' : 'Pending');
        matchStatus = effectiveStatus.toLowerCase() === feeStatusFilter.toLowerCase();
      }

      // Method filter
      let matchMethod = true;
      if (feeMethodFilter !== 'All') {
        const pRec = feePaymentsList.find(p => p.studentId === s.id && p.feeMonth === feeMonth && p.feeType === 'monthly');
        matchMethod = pRec && pRec.paymentMethod && pRec.paymentMethod.toLowerCase() === feeMethodFilter.toLowerCase();
      }

      return matchBatch && matchSchedule && matchStatus && matchMethod;
    });

    const totalUnpaid = filteredFeeStudents.filter(s => !isPaid(s)).length;
    const totalPaid = filteredFeeStudents.filter(s => isPaid(s)).length;

    // Revenue strictly based on paymentDate (revenueMonth === paymentMonth)
    let paymentMonthRevenue = 0;
    let paymentMonthMonthly = 0; // Strictly feeMonth === feeMonth (selected due month)
    let paymentMonthAdmission = 0;
    let paymentCount = 0;

    if (revenueSummaryData && revenueSummaryData.targetMonth === paymentMonth && revenueSummaryData.activeFeeMonth === feeMonth && revenueSummaryData.totalCollected > 0) {
      paymentMonthRevenue = revenueSummaryData.totalCollected;
      paymentMonthMonthly = revenueSummaryData.monthlyFeeCollected;
      paymentMonthAdmission = revenueSummaryData.admissionFeeCollected;
      paymentCount = revenueSummaryData.paymentCount || 0;
    } else {
      const targetPayments = feePaymentsList.filter(p => {
        if (p.revenueMonth !== paymentMonth) return false;
        if (branchFilter !== 'All' && p.branch && p.branch.toLowerCase().trim() !== branchFilter.toLowerCase().trim()) return false;
        if (batchFilter !== 'All' && p.batch && p.batch.toLowerCase().trim() !== batchFilter.toLowerCase().trim()) return false;
        return true;
      });
      // All money physically received in this paymentMonth (including past dues like August paid in Sep)
      paymentMonthRevenue = targetPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
      // ONLY monthly fees for the selected fee month (e.g. September fee paid in Sep):
      paymentMonthMonthly = targetPayments.filter(p => p.feeType === 'monthly' && p.feeMonth === feeMonth).reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
      paymentMonthAdmission = targetPayments.filter(p => p.feeType === 'admission').reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
      paymentCount = targetPayments.length;
    }

    // Direct fallback: If no revenue records returned from server yet, calculate from students marked paid for feeMonth
    if (paymentMonthMonthly === 0 && totalPaid > 0) {
      const paidMonthlySum = filteredFeeStudents.filter(s => isPaid(s)).reduce((sum, s) => {
        const rateToUse = s.customMonthlyRate !== undefined && s.customMonthlyRate !== null ? s.customMonthlyRate : monthlyFeeRate;
        const discountAmount = getStudentDiscountForMonth(s, rateToUse, feeMonth);
        return sum + Math.max(0, rateToUse - discountAmount);
      }, 0);
      if (paidMonthlySum > 0) {
        paymentMonthMonthly = paidMonthlySum;
        if (paymentMonthRevenue === 0) {
          paymentMonthRevenue = paidMonthlySum;
          paymentCount = totalPaid;
        }
      }
    }

    return (
      <div className="fees-container">
        {/* Month Selectors Header */}
        <div className="panel fees-header-panel">
          <div className="fees-title-group">
            <h2 className="panel-title" style={{ margin: 0 }}>Fee & Revenue Management</h2>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => {
              const defaultBranch = getLoggedInUserBranch();
              setNewStudent(prev => ({ ...prev, branch: defaultBranch }));
              setIsAddModalOpen(true);
            }}>
              <UserPlus size={14} /> Add Student
            </button>
          </div>

          <div className="fees-month-selectors">
            {/* Revenue / Collection Month */}
            <div className="fees-month-box revenue-month-box">
              <span className="fees-month-label">💰 Revenue Month:</span>
              <input
                type="month"
                className="form-control fees-month-input"
                value={paymentMonth}
                onChange={(e) => setPaymentMonth(e.target.value)}
              />
            </div>

            {/* Fee Due Month */}
            <div className="fees-month-box due-month-box">
              <span className="fees-month-label">📅 Fee Due Month:</span>
              <input
                type="month"
                className="form-control fees-month-input"
                value={feeMonth}
                onChange={(e) => setFeeMonth(e.target.value)}
              />
            </div>
          </div>
        </div>


        {/* Global Fee Rates Config */}
        {isAdminUser(loggedInUser) && (
          <div className="panel fees-rates-panel">
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-text-light)', fontFamily: 'var(--font-heading)' }}>Standard Fee Rates</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Set global admission and monthly rates</p>
            </div>
            <div className="fees-rates-controls">
              <div className="fee-rate-item">
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Admission:</span>
                <strong style={{ fontSize: '0.95rem', color: '#FFD700', minWidth: '55px', textAlign: 'center' }}>₹{admissionFeeRate}</strong>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" className="btn-small btn-rate-step" onClick={() => {
                    const newRate = Math.max(0, admissionFeeRate - 100);
                    setAdmissionFeeRate(newRate);
                    updateFeeRatesInDB(monthlyFeeRate, newRate);
                  }}>-</button>
                  <button type="button" className="btn-small btn-rate-step" onClick={() => {
                    const newRate = admissionFeeRate + 100;
                    setAdmissionFeeRate(newRate);
                    updateFeeRatesInDB(monthlyFeeRate, newRate);
                  }}>+</button>
                </div>
              </div>

              <div className="fee-rate-item">
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Monthly:</span>
                <strong style={{ fontSize: '0.95rem', color: '#4CAF50', minWidth: '55px', textAlign: 'center' }}>₹{monthlyFeeRate}</strong>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" className="btn-small btn-rate-step" onClick={() => {
                    const newRate = Math.max(0, monthlyFeeRate - 100);
                    setMonthlyFeeRate(newRate);
                    updateFeeRatesInDB(newRate, admissionFeeRate);
                  }}>-</button>
                  <button type="button" className="btn-small btn-rate-step" onClick={() => {
                    const newRate = monthlyFeeRate + 100;
                    setMonthlyFeeRate(newRate);
                    updateFeeRatesInDB(newRate, admissionFeeRate);
                  }}>+</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Cards based on Payment Date */}
        <div className="stats-grid fees-stats-grid">
          <div className="stat-card" style={{ borderLeft: '4px solid #38bdf8' }}>
            <div className="stat-details">
              <h3 style={{ color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
                Revenue Received in {formatMonthName(paymentMonth)}
              </h3>
              <p className="stat-value" style={{ color: '#fff', margin: 0 }}>₹{paymentMonthRevenue.toLocaleString()}</p>
              <span className="stat-subtext" style={{ color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Strictly based on payment date
              </span>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #4CAF50' }}>
            <div className="stat-details">
              <h3 style={{ color: '#4CAF50', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Monthly Fees Collected</h3>
              <p className="stat-value" style={{ color: '#4CAF50', margin: 0 }}>₹{paymentMonthMonthly.toLocaleString()}</p>
              <span className="stat-subtext" style={{ color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                For {formatMonthName(feeMonth)}
              </span>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #FFD700' }}>
            <div className="stat-details">
              <h3 style={{ color: '#FFD700', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Admission Fees Collected</h3>
              <p className="stat-value" style={{ color: '#FFD700', margin: 0 }}>₹{paymentMonthAdmission.toLocaleString()}</p>
              <span className="stat-subtext" style={{ color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Received in {formatMonthName(paymentMonth)}
              </span>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #c084fc' }}>
            <div className="stat-details">
              <h3 style={{ color: '#c084fc', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>Total Payments Received</h3>
              <p className="stat-value" style={{ color: '#fff', margin: 0 }}>{paymentCount}</p>
              <span className="stat-subtext" style={{ color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Receipt transactions
              </span>
            </div>
          </div>
        </div>

        {/* Student Fee Roster Panel */}
        <div className="panel">
          <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 className="panel-title">Student Fee Status ({formatMonthName(feeMonth)})</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Showing students and dues for the due month: <strong>{formatMonthName(feeMonth)}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="badge badge-green">{totalPaid} Paid</span>
              <span className="badge badge-orange">{totalUnpaid} Pending</span>
            </div>
          </div>

          {/* Filter Row */}
          <div className="fees-filters-row">
            <div className="fees-filter-group-time">
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginRight: '4px' }}>Time:</span>
              <button className={`btn-small ${feeBatchFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('All')}>All</button>
              <button className={`btn-small ${feeBatchFilter === 'Morning' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Morning')}>Morning</button>
              <button className={`btn-small ${feeBatchFilter === 'Evening' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Evening')}>Evening</button>
              <button className={`btn-small ${feeBatchFilter === 'Night' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Night')}>Night</button>
            </div>

            <div className="fees-filter-dropdowns">
              <div className="fees-filter-select-wrapper">
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Status:</span>
                <select className="form-control" value={feeStatusFilter} onChange={e => setFeeStatusFilter(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="fees-filter-select-wrapper">
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Method:</span>
                <select className="form-control" value={feeMethodFilter} onChange={e => setFeeMethodFilter(e.target.value)}>
                  <option value="All">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
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
                    <th style={{ textAlign: 'center' }}>Monthly Due</th>
                    <th style={{ textAlign: 'center' }}>Payment Status</th>
                    <th style={{ textAlign: 'center' }}>Payment Date / Receipt</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeStudents.map(student => {
                    const feeDetails = calculateStudentFees(student, feeMonth);
                    const pRec = feePaymentsList.find(p => p.studentId === student.id && p.feeMonth === feeMonth && p.feeType === 'monthly');
                    const paid = isPaid(student);

                    return (
                      <tr key={student.id}>
                        <td data-label="Student">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{ fontWeight: 700, color: '#E50914', cursor: 'pointer', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleSelectStudent(student)}
                            >
                              {student.studentName || student.name}
                              {student.isPriority && (
                                <Star size={14} fill="#FFD700" color="#FFD700" style={{ display: 'inline-block', verticalAlign: 'middle' }} title="Priority Student" />
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setFeeEditingStudent(student);
                                setCustomRateInput(student.customMonthlyRate !== undefined && student.customMonthlyRate !== null ? student.customMonthlyRate : '');
                                setCustomAdmissionInput(student.customAdmissionRate !== undefined && student.customAdmissionRate !== null ? student.customAdmissionRate : '');
                                setCustomStartMonth(student.joinDate ? student.joinDate.slice(0, 7) : new Date().toISOString().slice(0, 7));
                                const couponForMonth = getAppliedCouponForMonth(student, feeMonth);
                                setCouponInput(couponForMonth ? couponForMonth.couponCode : '');
                                setAdmissionCouponInput(student.appliedAdmissionCoupon || '');
                                let activeMsg = '';
                                if (couponForMonth) {
                                  const display = couponForMonth.discountType === 'amount' ? `₹${couponForMonth.discountValue}` : `${couponForMonth.discountValue}%`;
                                  activeMsg = `Active for ${formatMonthName(feeMonth)}: ${couponForMonth.couponCode} (${display} Off)`;
                                }
                                setCouponMessage(activeMsg);
                                setIsFeeEditModalOpen(true);
                              }}
                              className="btn-icon btn-fee-student-settings"
                              title="Customize Rates & Coupon"
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
                        <td data-label="Batch Time">
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            {getBatchNameFromSchedule(student.schedule, student.branch)} • {student.schedule}
                          </span>
                        </td>
                        <td data-label="Monthly Due" style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                            ₹{(() => {
                              const rateToUse = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null ? student.customMonthlyRate : monthlyFeeRate;
                              const discountAmount = getStudentDiscountForMonth(student, rateToUse, feeMonth);
                              return Math.max(0, rateToUse - discountAmount);
                            })()}
                          </span>
                        </td>
                        <td data-label="Payment Status" style={{ textAlign: 'center' }}>
                          {pRec && pRec.status === 'Partial' ? (
                            <span className="badge badge-orange" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                              Partial (Paid: ₹{pRec.amountPaid})
                            </span>
                          ) : (paid || (pRec && pRec.status === 'Paid') ? (
                            <span className="badge badge-green" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                              Paid ✓
                            </span>
                          ) : (
                            <span className="badge badge-red" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                              Pending
                            </span>
                          ))}
                        </td>
                        <td data-label="Payment Date / Receipt" style={{ textAlign: 'center' }}>
                          {pRec ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                                📅 {pRec.paymentDate}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                Mode: {pRec.paymentMethod || 'Cash'}
                              </span>
                              {pRec.receiptNumber && (
                                <button
                                  className="btn-small btn-receipt-badge"
                                  onClick={() => {
                                    setActiveReceipt(pRec);
                                    setIsReceiptModalOpen(true);
                                  }}
                                >
                                  Receipt #{pRec.receiptNumber.slice(-5)}
                                </button>
                              )}
                            </div>
                          ) : (
                            paid ? (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Recorded</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#ff6b6b' }}>Not Paid</span>
                            )
                          )}
                        </td>
                        <td data-label="Actions" style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {paid ? (
                              <button
                                className="btn-secondary btn-card-action"
                                style={{ color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.06)' }}
                                onClick={() => unmarkFeePaidCustomMonth(student.id, feeMonth)}
                              >
                                Mark Unpaid
                              </button>
                            ) : (
                              <button
                                className="btn-primary btn-card-action"
                                style={{ background: '#4CAF50', borderColor: '#4CAF50' }}
                                onClick={() => openRecordPaymentModal(student, feeMonth, 'monthly')}
                              >
                                + Pay / Record
                              </button>
                            )}
                            <button
                              className="btn-secondary btn-card-action"
                              onClick={() => {
                                setFeeDetailsStudentId(student.id);
                                setCurrentView('student-fees');
                              }}
                            >
                              History
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
        const rawPaid = student.paidMonths && (student.paidMonths instanceof Map ? student.paidMonths.get(monthStr) : student.paidMonths[monthStr]);
        list.push({
          monthStr,
          isPaid: !!rawPaid
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
    const unpaidCount = months.filter(m => {
      const pRec = feePaymentsList.find(p => p.studentId === student.id && p.feeMonth === m.monthStr && p.feeType === 'monthly');
      return !(m.isPaid || (pRec && pRec.status === 'Paid'));
    }).length;
    const paidCount = months.length - unpaidCount;

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
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#E50914', fontFamily: 'var(--font-heading)' }}>{student.studentName || student.name}</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Branch: <strong>{student.branch}</strong> • Batch: <strong>{getBatchNameFromSchedule(student.schedule, student.branch)} • {student.schedule}</strong>
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
            <div className="student-fees-header-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {unpaidCount > 0 && (
                <button
                  className="btn-primary btn-bulk-paid"
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
                  className="btn-secondary btn-bulk-unpaid"
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
            <div className="student-fees-grid">
              {months.map(({ monthStr, isPaid }) => {
                const pRec = feePaymentsList.find(p => p.studentId === student.id && p.feeMonth === monthStr && p.feeType === 'monthly');
                const monthIsPaid = Boolean(isPaid || (pRec && pRec.status === 'Paid'));
                const isPartial = !monthIsPaid && pRec && pRec.status === 'Partial';

                return (
                  <div
                    key={monthStr}
                    style={{
                      background: monthIsPaid ? 'rgba(76, 175, 80, 0.04)' : 'rgba(229, 9, 20, 0.04)',
                      border: `1px solid ${monthIsPaid ? 'rgba(76, 175, 80, 0.2)' : 'rgba(229, 9, 20, 0.2)'}`,
                      borderRadius: '12px',
                      padding: '1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      boxShadow: monthIsPaid ? 'none' : '0 4px 12px rgba(229, 9, 20, 0.05)'
                    }}
                  >
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                      {formatMonthName(monthStr)}
                    </div>
                    {(() => {
                      const info = getFeeInfoForMonth(student, monthStr);
                      return (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                          Rate: <strong>₹{info.finalRate}</strong>
                          {info.coupon && (
                            <div style={{ fontSize: '0.75rem', color: '#51CF66', marginTop: '2px', fontWeight: 600 }}>
                              Coupon: {info.coupon.couponCode}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div>
                      {monthIsPaid ? (
                        <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '20px' }}>Paid ✓</span>
                      ) : isPartial ? (
                        <span className="badge badge-orange" style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '20px' }}>Partial (₹{pRec.amountPaid})</span>
                      ) : (
                        <span className="badge badge-red" style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '20px' }}>Pending</span>
                      )}
                    </div>
                    {pRec && (
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8', textAlign: 'center' }}>
                        <div>📅 Paid: <strong>{pRec.paymentDate}</strong></div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem' }}>Mode: {pRec.paymentMethod || 'Cash'}</div>
                        {pRec.receiptNumber && (
                          <button
                            type="button"
                            className="btn-small btn-receipt-badge"
                            onClick={() => {
                              setActiveReceipt(pRec);
                              setIsReceiptModalOpen(true);
                            }}
                          >
                            Receipt #{pRec.receiptNumber.slice(-5)}
                          </button>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                      <button
                        onClick={() => {
                          if (monthIsPaid) {
                            unmarkFeePaidCustomMonth(student.id, monthStr);
                          } else {
                            openRecordPaymentModal(student, monthStr, 'monthly');
                          }
                        }}
                        className="btn-small card-month-action-btn"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          background: monthIsPaid ? 'rgba(255,255,255,0.05)' : '#4CAF50',
                          color: monthIsPaid ? '#FF8787' : 'white',
                          border: monthIsPaid ? '1px solid rgba(255,255,255,0.1)' : '1px solid #4CAF50',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'center'
                        }}
                      >
                        {monthIsPaid ? 'Mark Unpaid' : '+ Record Pay'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Grading Module Actions and Handlers
  const getNextBelt = (currentBelt) => {
    const belts = [
      'White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Red',
      'Brown 1', 'Brown 2', 'Brown 3', 'Brown 4', 'Black'
    ];
    const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Pro Level'];

    const curr = String(currentBelt || '').toLowerCase().trim();
    const cleanCurr = curr.replace(/\s*belt$/i, '').trim();

    // Legacy fallback if student currently has 'Brown' or 'Brown Belt'
    if (cleanCurr === 'brown') return 'Brown 1';

    const beltIdx = belts.findIndex(b => b.toLowerCase() === curr || b.toLowerCase() === cleanCurr);
    if (beltIdx !== -1) return beltIdx < belts.length - 1 ? belts[beltIdx + 1] : 'None';

    const levelIdx = levels.findIndex(l => l.toLowerCase() === curr || l.toLowerCase() === cleanCurr);
    if (levelIdx !== -1) return levelIdx < levels.length - 1 ? levels[levelIdx + 1] : 'None';

    return 'None';
  };

  // Helper for batch options in grading view based on logged-in user role
  const getGradingBatchOptions = () => {
    if (userRole === 'trainer') {
      const allowed = (userBatch || '').split(',').map(b => b.trim()).filter(Boolean);
      if (allowed.length === 0) return [];
      return allowed.map(b => {
        const found = batchOptions.find(opt => (opt.id || opt.code || '').toLowerCase() === b.toLowerCase());
        return {
          id: b,
          name: found ? found.name : getBatchNameFromCode(b, userBranch)
        };
      });
    } else if (userRole === 'branchadmin') {
      return getFilteredBatchOptions(userBranch);
    } else {
      return getFilteredBatchOptions(isAdminUser(loggedInUser) ? gradingFilterBranch : undefined);
    }
  };

  const getFilteredGradingStudents = () => {
    if (!Array.isArray(gradingStudents)) return [];
    const isTrainer = userRole === 'trainer';
    const isBranchAdm = userRole === 'branchadmin';
    const activeBranchLower = (userBranch || '').toLowerCase().trim();
    const allowedTrainerBatches = (userBatch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
    const safeBatchOptions = Array.isArray(batchOptions) ? batchOptions : [];

    return gradingStudents.filter(student => {
      if (!student) return false;

      // Role-based client protection: restrict to trainer's branch & batch
      if (isTrainer) {
        if (activeBranchLower && (student.branch || '').toLowerCase().trim() !== activeBranchLower) {
          return false;
        }
        if (allowedTrainerBatches.length > 0) {
          const studentBatchLower = (student.batch || '').toLowerCase().trim();
          if (!allowedTrainerBatches.includes(studentBatchLower)) {
            const batchNameMatch = allowedTrainerBatches.some(b => {
              const opt = safeBatchOptions.find(o => o && (o.id || o.code || '').toLowerCase() === b);
              return (opt && opt.name && opt.name.toLowerCase().trim() === studentBatchLower) ||
                (opt && schedulesMatch(opt.schedule, student.schedule));
            });
            if (!batchNameMatch) return false;
          }
        }
      } else if (isBranchAdm) {
        if (activeBranchLower && (student.branch || '').toLowerCase().trim() !== activeBranchLower) {
          return false;
        }
      } else if (isAdminUser(loggedInUser)) {
        if (gradingFilterBranch !== 'All') {
          if ((student.branch || '').toLowerCase().trim() !== gradingFilterBranch.toLowerCase().trim()) {
            return false;
          }
        }
      }

      const query = (searchQuery || '').toLowerCase().trim();
      const studentNameStr = String(student.name || student.studentName || '').toLowerCase();
      const matchesSearch = !query ||
        studentNameStr.includes(query) ||
        String(student.id || '').includes(query) ||
        String(student.admissionNumber || '').includes(query);

      let matchesBatch = true;
      if (gradingFilterBatch !== 'All') {
        const studentBatchLower = (student.batch || '').toLowerCase().trim();
        const filterBatchLower = gradingFilterBatch.toLowerCase().trim();
        matchesBatch = studentBatchLower === filterBatchLower;
        if (!matchesBatch) {
          const opt = safeBatchOptions.find(o => o && (o.id || o.code || '').toLowerCase() === filterBatchLower);
          if (opt) {
            matchesBatch = (opt.name && opt.name.toLowerCase().trim() === studentBatchLower) ||
              schedulesMatch(opt.schedule, student.schedule);
          }
        }
      }

      let matchesBelt = true;
      if (gradingFilterBelt !== 'All') {
        matchesBelt = (student.belt || '').toLowerCase() === gradingFilterBelt.toLowerCase();
      }

      let matchesEligibility = true;
      if (gradingFilterEligibility !== 'All') {
        matchesEligibility = student.eligibilityStatus === gradingFilterEligibility;
      }

      let matchesResult = true;
      if (gradingFilterResult !== 'All') {
        if (gradingFilterResult === 'No History') {
          matchesResult = !student.lastGradingResult || student.lastGradingResult === 'N/A';
        } else {
          matchesResult = student.lastGradingResult === gradingFilterResult;
        }
      }

      // In Admin page (Super Admin, Branch Admin, Developer): ONLY show trainer-approved students!
      if (!isTrainer) {
        if (!student.trainerApprovedForGrading) {
          return false;
        }
      }

      let matchesTrainerApproval = true;
      if (isTrainer) {
        if (gradingFilterTrainerApproval === 'Approved') {
          matchesTrainerApproval = !!student.trainerApprovedForGrading;
        } else if (gradingFilterTrainerApproval === 'Pending') {
          matchesTrainerApproval = !student.trainerApprovedForGrading;
        }
      }

      return matchesSearch && matchesBatch && matchesBelt && matchesEligibility && matchesResult && matchesTrainerApproval;
    });
  };

  const openTrainerApprovalModal = (student) => {
    setSelectedTrainerApprovalStudent(student);
    const naturalNext = student.nextBelt && student.nextBelt !== 'None' ? student.nextBelt : getNextBelt(student.belt);
    setTrainerSuggestedBeltInput(student.trainerSuggestedBelt || (naturalNext !== 'None' ? naturalNext : (student.belt || 'Yellow Belt')));
    setTrainerGradingNotesInput(student.trainerGradingNotes || '');
    setIsTrainerApprovalModalOpen(true);
  };

  const handleToggleTrainerApproval = (student, approvedStatus, suggestedBelt = '', notes = '') => {
    setGradingError('');
    setGradingSuccess('');

    const targetId = String(student.id || student._id || '');

    // Instant optimistic update (0ms UI lag)
    const optimisticUpdate = {
      trainerApprovedForGrading: approvedStatus,
      trainerApprovedAt: approvedStatus ? new Date().toISOString() : '',
      trainerSuggestedBelt: approvedStatus ? suggestedBelt : '',
      trainerGradingNotes: approvedStatus ? notes : ''
    };
    setGradingStudents(prev => prev.map(s => (String(s.id || s._id) === targetId) ? { ...s, ...optimisticUpdate } : s));
    setStudents(prev => prev.map(s => (String(s.id || s._id) === targetId) ? { ...s, ...optimisticUpdate } : s));

    fetch(`${API_BASE_URL}/students/${encodeURIComponent(targetId)}/trainer-approval`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approved: approvedStatus,
        suggestedBelt: approvedStatus ? suggestedBelt : '',
        notes: approvedStatus ? notes : ''
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update trainer approval status');
        const resId = String(data.id || data._id || targetId);
        setGradingStudents(prev => prev.map(s => (String(s.id || s._id) === resId) ? { ...s, ...data } : s));
        setStudents(prev => prev.map(s => (String(s.id || s._id) === resId) ? { ...s, ...data } : s));
        setGradingSuccess(approvedStatus
          ? `Approved test for ${data.name}${suggestedBelt ? ` (Suggested: ${suggestedBelt})` : ''}.`
          : `Revoked test approval for ${data.name}.`
        );
        setTimeout(() => setGradingSuccess(''), 3500);
      })
      .catch(err => {
        console.error(err);
        setGradingError(err.message);
      });
  };

  const handleToggleEligibility = (student) => {
    setGradingActionLoading(true);
    setGradingError('');
    setGradingSuccess('');

    fetch(`${API_BASE_URL}/students/${student.id}/toggle-eligibility`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to toggle eligibility status');
        setGradingStudents(prev => prev.map(s => s.id === data.id ? data : s));
        setGradingSuccess(`Updated eligibility for ${data.name} to ${data.eligibilityStatus}.`);
        setTimeout(() => setGradingSuccess(''), 3500);
      })
      .catch(err => {
        console.error(err);
        setGradingError(err.message);
      })
      .finally(() => setGradingActionLoading(false));
  };

  const handleRevokeGradingHistory = (student, historyIdOrIndex) => {
    if (!window.confirm(`Are you sure you want to revoke this grading attempt for ${student.name}? Student belt rank will revert.`)) {
      return;
    }
    setGradingActionLoading(true);
    setGradingError('');
    setGradingSuccess('');

    fetch(`${API_BASE_URL}/students/${student.id}/grading-history/${historyIdOrIndex}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to revoke grading attempt');
        setGradingStudents(prev => prev.map(s => s.id === data.id ? data : s));
        setSelectedHistoryStudent(data);
        setGradingSuccess(`Revoked grading entry. Student belt updated to ${data.belt}.`);
        setTimeout(() => setGradingSuccess(''), 3500);
      })
      .catch(err => {
        console.error(err);
        setGradingError(err.message);
      })
      .finally(() => setGradingActionLoading(false));
  };

  const handlePublishGradingAnnouncement = (e) => {
    e.preventDefault();
    if (!gradingAnnouncementForm.title.trim()) {
      alert('Please enter an announcement title.');
      return;
    }
    setSubmittingGradingAnnouncement(true);
    setGradingError('');
    setGradingSuccess('');
    const token = getSessionToken();

    const datePrefix = gradingAnnouncementForm.gradingDate ? `📅 Date: ${gradingAnnouncementForm.gradingDate}\n\n` : '';
    const payload = {
      title: gradingAnnouncementForm.title.trim(),
      message: `${datePrefix}${gradingAnnouncementForm.message.trim()}`,
      type: 'grading',
      priority: gradingAnnouncementForm.priority || 'high',
      branch: gradingAnnouncementForm.branch || 'all',
      targetUser: 'all'
    };

    fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to publish announcement');
        setGlobalSuccess(`Announcement "${data.title || 'Notification'}" published successfully! All Users notified.`);
        setIsGradingAnnouncementModalOpen(false);
        loadNotifications();
        reloadAllAppData();
      })
      .catch(err => {
        console.error('Error publishing announcement:', err);
        setGradingError(err.message);
        alert(`Error publishing announcement: ${err.message}`);
      })
      .finally(() => setSubmittingGradingAnnouncement(false));
  };

  const handleSubmitGrade = (e) => {
    e.preventDefault();
    if (!selectedGradeStudent) return;
    setGradingActionLoading(true);
    setGradingError('');
    setGradingSuccess('');

    const naturalNext = getNextBelt(selectedGradeStudent.belt);
    let resolvedTargetBelt = targetBelt;
    if (gradeResult === 'Pass') {
      if (!resolvedTargetBelt || resolvedTargetBelt === selectedGradeStudent.belt) {
        resolvedTargetBelt = naturalNext !== 'None' ? naturalNext : selectedGradeStudent.belt;
      }
    }

    const studentIdentifier = selectedGradeStudent.id || selectedGradeStudent._id;

    fetch(`${API_BASE_URL}/students/${studentIdentifier}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: gradeResult,
        gradeLetter: gradeResult === 'Pass' ? gradeLetter : '',
        gradingDate: gradeDate,
        targetBelt: gradeResult === 'Pass' ? resolvedTargetBelt : ''
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit grade');
        const targetId = String(data.id || data._id);
        setGradingStudents(prev => prev.map(s => String(s.id || s._id) === targetId ? data : s));
        setStudents(prev => prev.map(s => String(s.id || s._id) === targetId ? { ...s, ...data } : s));
        setIsGradeModalOpen(false);
        setGlobalSuccess(`Grading result submitted successfully for ${data.name}!`);
        if (typeof fetchGradingStudents === 'function') fetchGradingStudents();
        reloadAllAppData();
      })
      .catch(err => {
        console.error(err);
        setGradingError(err.message);
      })
      .finally(() => setGradingActionLoading(false));
  };

  const handleSubmitEditGrading = (e) => {
    e.preventDefault();
    if (!selectedEditGradingStudent) return;
    setGradingActionLoading(true);
    setGradingError('');
    setGradingSuccess('');

    const studentIdentifier = selectedEditGradingStudent.id || selectedEditGradingStudent._id;

    fetch(`${API_BASE_URL}/students/${studentIdentifier}/grading-info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editGradingForm)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update grading info');
        const targetId = String(data.id || data._id);
        setGradingStudents(prev => prev.map(s => String(s.id || s._id) === targetId ? data : s));
        setStudents(prev => prev.map(s => String(s.id || s._id) === targetId ? { ...s, ...data } : s));
        setIsEditGradingModalOpen(false);
        setGlobalSuccess(`Grading details updated successfully for ${data.name}!`);
        if (typeof fetchGradingStudents === 'function') fetchGradingStudents();
        reloadAllAppData();
      })
      .catch(err => {
        console.error(err);
        setGradingError(err.message);
      })
      .finally(() => setGradingActionLoading(false));
  };

  const renderAnnouncements = () => {
    const isCanPublish = userRole === 'developer' || userRole === 'superadmin' || userRole === 'admin' || userRole === 'branchadmin';
    const rawList = notifications && notifications.length > 0 ? notifications : devNotifications;
    const activeAnnouncementsList = (rawList || []).filter(n =>
      n && n.type !== 'TrainerRegistration' && n.targetUser !== 'superadmin' && !String(n.title || '').includes('Trainer Registration')
    );

    const trainerOptions = Array.from(new Set(
      (adminsList || [])
        .filter(a => (a.role === 'trainer' || a.role === 'coordinator') && a.status === 'Active')
        .map(a => a.fullName || a.username)
        .filter(Boolean)
    ));

    return (
      <div className="announcements-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Banner Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Megaphone size={24} color="#FFD700" />
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', fontWeight: 700 }}>
                Broadcast & Announcements Center
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '0.85rem' }}>
              Send instant broadcast notices to trainers, branch admins, or specific branches. Alerts appear automatically upon user login.
            </p>
          </div>
        </div>

        {/* Send Broadcast Announcement Form */}
        {isCanPublish && (
          <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(229, 9, 20, 0.35)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'Outfit, sans-serif', color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color="var(--color-primary)" /> Send New Broadcast Announcement
            </h3>

            {/* Quick Template Chips */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>QUICK TEMPLATES:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: '🥋 Belt Grading Exam', title: 'Upcoming Belt Grading Examination', type: 'exam', msg: 'All eligible students and branch trainers are requested to prepare the registration and grading roster for the upcoming examination session.' },
                  { label: '💼 Staff Meeting', title: 'Monthly Staff & Trainer Meeting', type: 'general', msg: 'All branch managers and instructors are requested to attend the upcoming monthly coordination meeting.' },
                  { label: '⚠️ Urgent Maintenance', title: 'System Notice: Scheduled Update', type: 'warning', msg: 'Please ensure all attendance entries for the current week are marked and verified before the upcoming maintenance.' }
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAnnouncementForm({
                        ...announcementForm,
                        title: tpl.title,
                        message: tpl.msg,
                        type: tpl.type
                      });
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--color-text-light)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* Title */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Notice Title <span style={{ color: '#E50914' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Special Batch Timings / Exam Details"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Target Audience */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Target Audience
                </label>
                <select
                  className="form-control"
                  value={announcementForm.targetUser || 'all'}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, targetUser: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="all">🌐 All Users (Trainers & Branch Admins)</option>
                  <option value="trainers">🥋 All Trainers Only</option>
                  <option value="branches">🏢 All Branch Admins Only</option>
                  {trainerOptions && trainerOptions.length > 0 && trainerOptions.map(t => (
                    <option key={t} value={t}>👤 Trainer: {t}</option>
                  ))}
                </select>
              </div>

              {/* Branch Scope */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Target Branch
                </label>
                <select
                  className="form-control"
                  value={announcementForm.branch || 'all'}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, branch: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="all">🏢 All Branches</option>
                  {branches && branches.map(b => (
                    <option key={b} value={b}>📍 {b} Branch</option>
                  ))}
                </select>
              </div>

              {/* Notice Category */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Notice Category
                </label>
                <select
                  className="form-control"
                  value={announcementForm.type || 'general'}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="general">📢 General Announcement</option>
                  <option value="exam">🥋 Belt Grading / Exam</option>
                  <option value="warning">⚠️ Urgent Notice / Instruction</option>
                  <option value="update">🚀 Academy Update</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Priority & Display Style
                </label>
                <select
                  className="form-control"
                  value={announcementForm.priority || 'medium'}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="low">🟢 Normal (Notification List)</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High / Urgent (Instant Popup on Login!)</option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                Notice Message / Description <span style={{ color: '#E50914' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Enter the full announcement details..."
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                style={{ width: '100%', height: 'auto', minHeight: '90px', padding: '10px 14px', lineHeight: '1.5' }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {editingNotificationId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingNotificationId(null);
                    setAnnouncementForm({ title: '', message: '', type: 'general', priority: 'medium', branch: 'all', batch: 'all', targetUser: 'all', expiryDate: '', scheduledAt: '', isScheduled: false });
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveAnnouncement}
                disabled={devActionLoading}
                style={{ padding: '0.7rem 1.5rem', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} />
                {devActionLoading ? 'Publishing...' : (editingNotificationId ? 'Update Notice' : 'Broadcast Notice Now')}
              </button>
            </div>
          </div>
        )}

        {/* Active & Published Announcements History */}
        <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#fff' }}>Published Broadcasts History</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total {activeAnnouncementsList.length} Active Broadcasts</span>
            </div>
            <button className="btn-small btn-secondary" onClick={loadNotifications}>
              🔄 Refresh
            </button>
          </div>

          {activeAnnouncementsList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '1.25rem' }}>
              {activeAnnouncementsList.map((n) => {
                const priorityColor = n.priority === 'high' ? '#E50914' : n.priority === 'medium' ? '#FFD700' : '#4CAF50';
                const targetDisplay = n.targetUser === 'all' ? '🌐 All Users' : n.targetUser === 'trainers' ? '🥋 All Trainers' : n.targetUser === 'branches' ? '🏢 All Branch Admins' : `👤 ${n.targetUser}`;
                const branchDisplay = n.branch && n.branch !== 'all' ? `📍 ${n.branch}` : '🏢 All Branches';

                return (
                  <div
                    key={n._id}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderRadius: '14px',
                      background: '#151926',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderLeft: `4px solid ${priorityColor}`,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '12px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#fff' }}>{n.title}</span>
                        <span className="badge" style={{ background: `${priorityColor}22`, color: priorityColor, border: `1px solid ${priorityColor}44`, fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px' }}>
                          {n.priority === 'high' ? '🔴 Urgent Popup' : n.priority === 'medium' ? '🟡 Medium' : '🟢 Normal'}
                        </span>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-light)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px' }}>
                          {targetDisplay}
                        </span>
                        <span className="badge" style={{ background: 'rgba(229, 9, 20, 0.12)', color: '#FFD700', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px' }}>
                          {branchDisplay}
                        </span>
                      </div>

                      <div style={{
                        background: '#0d0f19',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        margin: '6px 0 10px 0'
                      }}>
                        <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.85rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                          {n.message}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                        <span>Sender: <strong style={{ color: '#fff' }}>{n.sender || 'Admin'}</strong></span>
                        <span>•</span>
                        <span>Sent: {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'N/A'}</span>
                        {n.readBy && (
                          <>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => setReadDetailsModalNotification(n)}
                              style={{
                                background: 'rgba(74, 222, 128, 0.12)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                color: '#4ade80',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s ease'
                              }}
                              title="Click to view full list of trainers and branch admins who read this notice"
                            >
                              <Eye size={13} /> ✓ Read by {n.readBy.length} {n.readBy.length === 1 ? 'user' : 'users'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isCanPublish && n._id && (
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: '#38bdf8', padding: '6px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px' }}
                          title="Edit Notice"
                          onClick={() => handleStartEditAnnouncement(n)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: '#F44336', padding: '6px', background: 'rgba(244, 67, 54, 0.1)', borderRadius: '6px' }}
                          title="Delete Notice"
                          onClick={() => handleDeleteNotification(n._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
              <Megaphone size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>No Active Announcements</div>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Use the form above to publish system announcements.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGrading = () => {
    try {
      const isSuper = isAdminUser(loggedInUser);
      const isTrainer = userRole === 'trainer';
      const isBranchAdm = userRole === 'branchadmin';
      const filtered = getFilteredGradingStudents();

      // Stats calculations
      const totalCount = filtered.length;
      const eligibleCount = filtered.filter(s => s.eligibilityStatus === 'Eligible').length;
      const passedCount = filtered.filter(s => s.lastGradingResult === 'Pass').length;
      const failedCount = filtered.filter(s => s.lastGradingResult === 'Fail').length;

      const beltCounts = {
        White: 0,
        Yellow: 0,
        Orange: 0,
        Green: 0,
        Blue: 0,
        Purple: 0,
        Red: 0,
        Brown: 0,
        'Brown 1': 0,
        'Brown 2': 0,
        'Brown 3': 0,
        'Brown 4': 0,
        Black: 0
      };
      filtered.forEach(s => {
        const b = (s.belt || 'White').trim();
        const clean = b.replace(/\s*belt$/i, '').trim();
        const matchedKey = Object.keys(beltCounts).find(k => k.toLowerCase() === b.toLowerCase() || k.toLowerCase() === clean.toLowerCase());
        if (matchedKey) {
          beltCounts[matchedKey]++;
        }
      });

      const batchListOptions = getGradingBatchOptions();

      return (
        <div className="grading-view-container">
          {gradingError && <div style={{ color: '#E50914', background: 'rgba(229, 9, 20, 0.1)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(229, 9, 20, 0.3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} /> {gradingError}</div>}
          {gradingSuccess && <div style={{ color: '#4CAF50', background: 'rgba(76, 175, 80, 0.1)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(76, 175, 80, 0.3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> {gradingSuccess}</div>}

          {/* Clean Compact Top Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div>
              {isTrainer && (
                <span className="grading-scope-pill trainer">
                  <Activity size={13} /> {userBranch} • {userBatch ? getBatchNameFromCode(userBatch, userBranch) : 'Assigned Batch'}
                </span>
              )}
              {isBranchAdm && (
                <span className="grading-scope-pill branchadmin">
                  <MapPin size={13} /> Branch: {userBranch}
                </span>
              )}
              {isSuper && (
                <span className="grading-scope-pill admin">
                  <Shield size={13} /> Super Admin View
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn-secondary"
                onClick={fetchGradingStudents}
                disabled={loadingGrading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.95rem', fontSize: '0.8rem', borderRadius: '8px' }}
              >
                <History size={14} className={loadingGrading ? 'spin-icon' : ''} />
                {loadingGrading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Dashboard Stats Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <div className="stat-card glow-card-blue" style={{ background: 'linear-gradient(145deg, rgba(20, 24, 38, 0.7) 0%, rgba(15, 17, 26, 0.8) 100%)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.12)', width: '38px', height: '38px', borderRadius: '8px' }}>
                <Users className="stat-icon" style={{ color: '#38bdf8' }} size={18} />
              </div>
              <div className="stat-details">
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Total Students</h3>
                <p className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#fff' }}>{totalCount}</p>
              </div>
            </div>

            <div className="stat-card glow-card-green" style={{ background: 'linear-gradient(145deg, rgba(16, 32, 24, 0.7) 0%, rgba(12, 22, 18, 0.8) 100%)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', width: '38px', height: '38px', borderRadius: '8px' }}>
                <CheckCircle className="stat-icon" style={{ color: '#4ade80' }} size={18} />
              </div>
              <div className="stat-details">
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: '#86efac', fontSize: '0.72rem', fontWeight: 600 }}>Ready for Test</h3>
                <p className="stat-value" style={{ color: '#4ade80', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem' }}>{eligibleCount}</p>
              </div>
            </div>

            <div className="stat-card glow-card-blue" style={{ background: 'linear-gradient(145deg, rgba(18, 28, 45, 0.7) 0%, rgba(13, 19, 32, 0.8) 100%)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', width: '38px', height: '38px', borderRadius: '8px' }}>
                <Award className="stat-icon" style={{ color: '#60a5fa' }} size={18} />
              </div>
              <div className="stat-details">
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: '#93c5fd', fontSize: '0.72rem', fontWeight: 600 }}>Passed</h3>
                <p className="stat-value" style={{ color: '#60a5fa', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem' }}>{passedCount}</p>
              </div>
            </div>

            <div className="stat-card glow-card-red" style={{ background: 'linear-gradient(145deg, rgba(38, 16, 20, 0.7) 0%, rgba(24, 12, 14, 0.8) 100%)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', width: '38px', height: '38px', borderRadius: '8px' }}>
                <XCircle className="stat-icon" style={{ color: '#fb7185' }} size={18} />
              </div>
              <div className="stat-details">
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fda4af', fontSize: '0.72rem', fontWeight: 600 }}>Failed / Retest</h3>
                <p className="stat-value" style={{ color: '#fb7185', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem' }}>{failedCount}</p>
              </div>
            </div>
          </div>

          {/* Belt Distribution Bar */}
          <div className="belt-distribution-strip" style={{ padding: '0.75rem 1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginRight: '6px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-block' }}>
              Belts:
            </span>
            {/* Desktop/Tablet Horizontal Button List */}
            <div className="belt-pill-list-desktop">
              {Object.entries(beltCounts).map(([beltName, count]) => {
                const isSelected = gradingFilterBelt === beltName;
                return (
                  <button
                    key={beltName}
                    type="button"
                    className={`belt-pill-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setGradingFilterBelt(isSelected ? 'All' : beltName)}
                    title={`Filter by ${beltName} belt`}
                    style={{ padding: '0.25rem 0.65rem' }}
                  >
                    <span className={`badge ${getBeltColorClass(beltName)}`} style={{ padding: '2px 6px', fontSize: '0.7rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {beltName}
                    </span>
                    <span className="belt-count" style={{ fontSize: '0.7rem' }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Select Dropdown (No Side-Scrolling) */}
            <div className="belt-select-mobile-wrapper">
              <select
                className="form-control belt-select-mobile"
                value={gradingFilterBelt}
                onChange={(e) => setGradingFilterBelt(e.target.value)}
              >
                <option value="All">All Belts ({totalCount})</option>
                {Object.entries(beltCounts).map(([beltName, count]) => (
                  <option key={beltName} value={beltName}>
                    {beltName} Belt ({count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Streamlined Clean Filters Panel */}
          <div className="filters-wrapper-card" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
            {/* Quick Filter Chips */}
            <div className="grading-quick-chips" style={{ marginBottom: '0.85rem', paddingBottom: '0.65rem' }}>
              <button
                type="button"
                className={`quick-chip ${gradingFilterEligibility === 'All' && gradingFilterTrainerApproval === 'All' && gradingFilterBelt === 'All' ? 'active' : ''}`}
                onClick={() => {
                  setGradingFilterEligibility('All');
                  setGradingFilterTrainerApproval('All');
                  setGradingFilterBelt('All');
                }}
              >
                All Candidates ({Array.isArray(gradingStudents) ? gradingStudents.length : totalCount})
              </button>
              <button
                type="button"
                className={`quick-chip ${gradingFilterEligibility === 'Eligible' ? 'active-eligible' : ''}`}
                onClick={() => setGradingFilterEligibility(gradingFilterEligibility === 'Eligible' ? 'All' : 'Eligible')}
              >
                ⚡ Ready for Test ({Array.isArray(gradingStudents) ? gradingStudents.filter(s => s.eligibilityStatus === 'Eligible').length : eligibleCount})
              </button>
              <button
                type="button"
                className={`quick-chip ${gradingFilterTrainerApproval === 'Approved' ? 'active-eligible' : ''}`}
                onClick={() => setGradingFilterTrainerApproval(gradingFilterTrainerApproval === 'Approved' ? 'All' : 'Approved')}
              >
                ✓ Trainer Approved ({Array.isArray(gradingStudents) ? gradingStudents.filter(s => !!s.trainerApprovedForGrading).length : 0})
              </button>
              <button
                type="button"
                className={`quick-chip ${gradingFilterTrainerApproval === 'Pending' ? 'active-fail' : ''}`}
                onClick={() => setGradingFilterTrainerApproval(gradingFilterTrainerApproval === 'Pending' ? 'All' : 'Pending')}
              >
                ⏳ Pending Approval ({Array.isArray(gradingStudents) ? gradingStudents.filter(s => !s.trainerApprovedForGrading).length : 0})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Input */}
              <div style={{ minWidth: '220px', flex: '1 1 240px' }}>
                <input
                  type="text"
                  placeholder="Search student..."
                  className="form-control"
                  style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Branch (Superadmin only) */}
              {isSuper && (
                <div style={{ minWidth: '140px', flex: '1 1 140px' }}>
                  <select className="form-control" style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }} value={gradingFilterBranch} onChange={(e) => setGradingFilterBranch(e.target.value)}>
                    <option value="All">All Branches</option>
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Batch Filter */}
              <div style={{ minWidth: '140px', flex: '1 1 140px' }}>
                <select className="form-control" style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }} value={gradingFilterBatch} onChange={(e) => setGradingFilterBatch(e.target.value)}>
                  <option value="All">{isTrainer ? 'All My Batches' : 'All Batches'}</option>
                  {batchListOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              {/* Belt Rank / Level */}
              <div style={{ minWidth: '150px', flex: '1 1 150px' }}>
                <select className="form-control" style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }} value={gradingFilterBelt} onChange={(e) => setGradingFilterBelt(e.target.value)}>
                  <option value="All">All Belts & Levels</option>
                  <optgroup label="🥋 Traditional Belts">
                    {['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Red', 'Brown', 'Brown 1', 'Brown 2', 'Brown 3', 'Brown 4', 'Black'].map(b => (
                      <option key={b} value={b}>{b} Belt</option>
                    ))}
                  </optgroup>
                  <optgroup label="🥊 Kickboxing / Boxing Levels">
                    {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Pro Level'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Reset Button */}
              <button
                className="btn-secondary"
                style={{ padding: '0 1rem', fontSize: '0.8rem', height: '38px', borderRadius: '8px', whiteSpace: 'nowrap' }}
                onClick={() => {
                  setGradingFilterBranch('All');
                  setGradingFilterBatch('All');
                  setGradingFilterBelt('All');
                  setGradingFilterEligibility('All');
                  setGradingFilterTrainerApproval('All');
                  setGradingFilterResult('All');
                  setSearchQuery('');
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Clean Student Table */}
          <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden', padding: 0 }}>
            {loadingGrading ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                <History size={28} className="spin-icon" style={{ marginBottom: '0.75rem', opacity: 0.7 }} />
                <div>Loading students...</div>
              </div>
            ) : filtered.length > 0 ? (
              <div className="premium-table-container" style={{ border: 'none', background: 'transparent' }}>
                <table className="premium-table responsive-table-cards">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Batch</th>
                      <th>Present Belt / Level</th>
                      {isTrainer && <th>Trainer Status & Suggestion</th>}
                      {!isTrainer && <th>Trainer Suggested Belt</th>}
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(student => {
                      const initials = (student.name || 'S').split(' ').map(n => n[0]).slice(0, 2).join('');

                      return (
                        <tr key={student.id}>
                          <td data-label="Student" style={{ fontWeight: 700, color: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="student-avatar-badge">{initials}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {renderHighlightedName(student.name, searchQuery)}
                                {student.isPriority && (
                                  <Star size={13} fill="#FFD700" color="#FFD700" title="Priority Student" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td data-label="Batch">
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}>
                              {getBatchNameFromCode(student.batch, student.branch)}
                            </span>
                          </td>
                          <td data-label="Present Belt / Level">
                            <span className={`badge ${getBeltColorClass(student.belt)}`} style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', fontWeight: 600 }}>
                              {student.belt}
                            </span>
                          </td>
                          {isTrainer && (
                            <td data-label="Trainer Status">
                              {student.trainerApprovedForGrading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', width: 'fit-content' }}>
                                    ✓ Approved for Test
                                  </span>
                                  {student.trainerSuggestedBelt && (
                                    <span style={{ fontSize: '0.73rem', color: '#38bdf8', fontWeight: 600 }}>
                                      Suggested: {student.trainerSuggestedBelt}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="badge badge-gray" style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}>
                                  Pending Approval
                                </span>
                              )}
                            </td>
                          )}
                          {!isTrainer && (
                            <td data-label="Trainer Suggested Belt">
                              {student.trainerSuggestedBelt ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span className={`badge ${getBeltColorClass(student.trainerSuggestedBelt)}`} style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
                                    🥋 {student.trainerSuggestedBelt}
                                  </span>
                                  {student.trainerGradingNotes && (
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={student.trainerGradingNotes}>
                                      "{student.trainerGradingNotes}"
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                  {student.nextBelt && student.nextBelt !== 'None' ? student.nextBelt : 'Standard Next'}
                                </span>
                              )}
                            </td>
                          )}
                          <td data-label="Actions" style={{ whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', justifyContent: 'center', gap: '6px', alignItems: 'center', flexWrap: 'nowrap' }}>
                              {isTrainer && (
                                student.trainerApprovedForGrading ? (
                                  <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                                    <button
                                      className="action-btn-pill"
                                      style={{
                                        padding: '5px 10px',
                                        fontSize: '0.75rem',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        border: '1px solid rgba(56, 189, 248, 0.4)',
                                        background: 'rgba(56, 189, 248, 0.15)',
                                        color: '#38bdf8',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onClick={() => openTrainerApprovalModal(student)}
                                      disabled={gradingActionLoading}
                                      title="Change suggested belt or remarks"
                                    >
                                      ✏️ Edit Belt
                                    </button>
                                    <button
                                      className="action-btn-pill"
                                      style={{
                                        padding: '5px 8px',
                                        fontSize: '0.75rem',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        background: 'rgba(239, 68, 68, 0.12)',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onClick={() => handleToggleTrainerApproval(student, false)}
                                      disabled={gradingActionLoading}
                                      title="Revoke test approval"
                                    >
                                      Revoke
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="action-btn-pill"
                                    style={{
                                      padding: '5px 12px',
                                      fontSize: '0.75rem',
                                      borderRadius: '8px',
                                      fontWeight: 600,
                                      border: '1px solid transparent',
                                      background: 'var(--status-success)',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap'
                                    }}
                                    onClick={() => openTrainerApprovalModal(student)}
                                    disabled={gradingActionLoading}
                                  >
                                    ✓ Approve for Test
                                  </button>
                                )
                              )}

                              <button
                                className="btn-secondary action-btn-pill"
                                style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                                onClick={() => {
                                  setSelectedHistoryStudent(student);
                                  setIsHistoryModalOpen(true);
                                }}
                              >
                                History
                              </button>

                              {!isTrainer && (
                                <button
                                  className="btn-primary action-btn-pill"
                                  style={{ background: 'var(--color-primary)', padding: '5px 12px', fontSize: '0.75rem', borderRadius: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}
                                  onClick={() => {
                                    setSelectedGradeStudent(student);
                                    setGradeResult('Pass');
                                    setGradeLetter('A');
                                    setGradeDate(new Date().toISOString().split('T')[0]);
                                    const naturalNext = getNextBelt(student.belt);
                                    const initialBelt = (student.trainerSuggestedBelt && student.trainerSuggestedBelt !== student.belt)
                                      ? student.trainerSuggestedBelt
                                      : (naturalNext !== 'None' ? naturalNext : (student.belt || 'Yellow'));
                                    setTargetBelt(initialBelt);
                                    setIsGradeModalOpen(true);
                                  }}
                                >
                                  Grade
                                </button>
                              )}

                              <button
                                className="btn-icon"
                                title="Edit Student Record / Belt"
                                style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', width: '30px', height: '30px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                onClick={() => {
                                  setSelectedEditGradingStudent(student);
                                  setEditGradingForm({
                                    joinDate: student.joinDate,
                                    lastGradingDate: student.lastGradingDate || 'N/A',
                                    belt: student.belt,
                                    eligibilityOverride: student.eligibilityOverride || ''
                                  });
                                  setIsEditGradingModalOpen(true);
                                }}
                              >
                                <Settings size={14} />
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
              <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--color-text-muted)' }}>
                <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>No Students Found</div>
                <p style={{ fontSize: '0.8rem', margin: 0, marginTop: '4px' }}>
                  {isTrainer
                    ? 'No students found in your assigned batch with the selected filters.'
                    : 'No students match the current filter criteria.'}
                </p>
              </div>
            )}
          </div>

          {/* Modal: View Grading History */}
          {isHistoryModalOpen && selectedHistoryStudent && (
            <div className="modal-overlay" style={{ zIndex: 1000 }}>
              <div className="modal-content" style={{ maxWidth: '840px', width: '92%', background: 'var(--color-bg-surface, #12141d)', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="panel-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0 }}>
                    <Award size={20} style={{ color: '#38bdf8' }} />
                    Grading History: {selectedHistoryStudent.name}
                  </h3>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setIsHistoryModalOpen(false);
                      setSelectedHistoryStudent(null);
                    }}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#fff' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.85rem', color: 'var(--color-text-main)', alignItems: 'center' }}>
                  <div>Branch: <strong style={{ color: '#fff' }}>{selectedHistoryStudent.branch}</strong></div>
                  <div>Batch: <strong style={{ color: '#fff' }}>{getBatchNameFromCode(selectedHistoryStudent.batch, selectedHistoryStudent.branch)}</strong></div>
                  <div>Current Belt: <span className={`badge ${getBeltColorClass(selectedHistoryStudent.belt)}`} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{selectedHistoryStudent.belt}</span></div>
                </div>

                {selectedHistoryStudent.gradingHistory && selectedHistoryStudent.gradingHistory.length > 0 ? (
                  <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <table className="attendance-table" style={{ fontSize: '0.85rem', width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', color: '#cbd5e1' }}>Date</th>
                          <th style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', color: '#cbd5e1' }}>Belt Before</th>
                          <th style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', color: '#cbd5e1' }}>Result</th>
                          <th style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', color: '#cbd5e1' }}>Belt After</th>
                          <th style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', color: '#cbd5e1' }}>Examiner</th>
                          <th style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', color: '#cbd5e1' }}>Recorded At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...selectedHistoryStudent.gradingHistory].reverse().map((attempt, index) => (
                          <tr key={attempt._id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td data-label="Date" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, color: '#fff' }}>
                              {attempt.gradingDate}
                            </td>
                            <td data-label="Belt Before" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                              <span className={`badge ${getBeltColorClass(attempt.beltBefore)}`} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{attempt.beltBefore}</span>
                            </td>
                            <td data-label="Result" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                              {attempt.result === 'Pass' ? (
                                <span className="badge badge-green" style={{ background: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.3)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  Pass ({attempt.gradeLetter ? `Grade ${attempt.gradeLetter}` : 'Grade A'})
                                </span>
                              ) : (
                                <span className="badge badge-red" style={{ background: 'rgba(229, 9, 20, 0.15)', color: '#ff453a', border: '1px solid rgba(229, 9, 20, 0.3)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>Fail</span>
                              )}
                            </td>
                            <td data-label="Belt After" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                              <span className={`badge ${getBeltColorClass(attempt.beltAfter)}`} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{attempt.beltAfter}</span>
                            </td>
                            <td data-label="Examiner" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', color: '#fff', fontWeight: 500 }}>
                              {attempt.updatedBy}
                            </td>
                            <td data-label="Recorded At" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              {new Date(attempt.createdAt || attempt.date).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                    <Award size={30} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                    <div>No grading attempts recorded yet.</div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button
                    className="btn-secondary"
                    style={{ borderRadius: '8px', padding: '0.5rem 1.25rem' }}
                    onClick={() => {
                      setIsHistoryModalOpen(false);
                      setSelectedHistoryStudent(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Trainer Approval & Belt Suggestion */}
          {isTrainerApprovalModalOpen && selectedTrainerApprovalStudent && (
            <div className="modal-overlay" style={{ zIndex: 1000 }}>
              <div className="modal-content" style={{ maxWidth: '480px', background: 'var(--color-bg-surface, #12141d)', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="panel-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <h3 className="panel-title" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Award size={20} style={{ color: '#10b981' }} />
                    {selectedTrainerApprovalStudent.trainerApprovedForGrading ? 'Update Belt Suggestion' : 'Approve for Belt Grading'}
                  </h3>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setIsTrainerApprovalModalOpen(false);
                      setSelectedTrainerApprovalStudent(null);
                    }}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#fff' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleToggleTrainerApproval(
                    selectedTrainerApprovalStudent,
                    true,
                    trainerSuggestedBeltInput,
                    trainerGradingNotesInput
                  );
                  setIsTrainerApprovalModalOpen(false);
                  setSelectedTrainerApprovalStudent(null);
                }}>
                  {/* Candidate Summary Card */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', padding: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Student:</span>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{selectedTrainerApprovalStudent.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Branch & Batch:</span>
                      <span style={{ color: '#e0e0e0', fontSize: '0.85rem' }}>
                        {selectedTrainerApprovalStudent.branch} • {getBatchNameFromCode(selectedTrainerApprovalStudent.batch, selectedTrainerApprovalStudent.branch)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Current Belt:</span>
                      <span className={`badge ${getBeltColorClass(selectedTrainerApprovalStudent.belt)}`} style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                        {selectedTrainerApprovalStudent.belt}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Standard Next Belt:</span>
                      <span className={`badge ${getBeltColorClass(selectedTrainerApprovalStudent.nextBelt || 'Yellow Belt')}`} style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                        ➔ {selectedTrainerApprovalStudent.nextBelt && selectedTrainerApprovalStudent.nextBelt !== 'None' ? selectedTrainerApprovalStudent.nextBelt : 'Standard Next'}
                      </span>
                    </div>
                  </div>

                  {/* Suggest Belt Select */}
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>
                      Suggested Belt / Level for Test *
                    </label>
                    <select
                      className="form-control"
                      style={{ height: '42px', borderRadius: '10px', fontSize: '0.88rem', width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                      value={trainerSuggestedBeltInput}
                      onChange={(e) => setTrainerSuggestedBeltInput(e.target.value)}
                      required
                    >
                      <option value="">-- Select Belt to Suggest --</option>
                      <optgroup label="🥋 Traditional Belts">
                        {[
                          'White Belt', 'Yellow Belt', 'Orange Belt', 'Green Belt', 'Blue Belt', 'Purple Belt', 'Red Belt',
                          'Brown 1', 'Brown 2', 'Brown 3', 'Brown 4', 'Brown Belt', 'Black Belt',
                          'White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Red', 'Brown', 'Black'
                        ].map(b => (
                          <option key={b} value={b} style={{ background: '#12141d', color: '#fff' }}>{b}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🥊 Kickboxing / Boxing Levels">
                        {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Pro Level'].map(b => (
                          <option key={b} value={b} style={{ background: '#12141d', color: '#fff' }}>{b}</option>
                        ))}
                      </optgroup>
                    </select>
                    <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '5px' }}>
                      💡 Recommend the candidate's target belt for the grading panel to review.
                    </div>
                  </div>

                  {/* Optional Trainer Remarks */}
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>
                      Trainer Notes / Remarks (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      style={{ borderRadius: '10px', fontSize: '0.85rem', width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)', minHeight: '70px', padding: '8px 12px', resize: 'vertical' }}
                      placeholder="e.g. Excellent kata performance, highly disciplined"
                      value={trainerGradingNotesInput}
                      onChange={(e) => setTrainerGradingNotesInput(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={() => {
                        setIsTrainerApprovalModalOpen(false);
                        setSelectedTrainerApprovalStudent(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={gradingActionLoading}
                      style={{ background: '#10b981', borderColor: '#10b981', borderRadius: '10px', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {selectedTrainerApprovalStudent.trainerApprovedForGrading ? 'Update Suggestion' : '✓ Confirm & Approve'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Conduct Grade Test */}
          {isGradeModalOpen && selectedGradeStudent && (
            <div className="modal-overlay" style={{ zIndex: 1000 }}>
              <div className="modal-content" style={{ maxWidth: '520px', background: 'var(--color-bg-surface, #12141d)', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="panel-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <h3 className="panel-title" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Award size={20} style={{ color: 'var(--color-accent-primary, #e50914)' }} />
                    Belt Grade Test
                  </h3>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setIsGradeModalOpen(false);
                      setSelectedGradeStudent(null);
                    }}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#fff' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitGrade}>
                  {/* Student Info Card */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', padding: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Candidate:</span>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{selectedGradeStudent.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Branch & Batch:</span>
                      <span style={{ color: '#e0e0e0', fontSize: '0.85rem' }}>{selectedGradeStudent.branch} • {getBatchNameFromCode(selectedGradeStudent.batch, selectedGradeStudent.branch)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Current Belt:</span>
                      <span className={`badge ${getBeltColorClass(selectedGradeStudent.belt)}`} style={{ padding: '3px 8px', fontSize: '0.75rem' }}>{selectedGradeStudent.belt}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: selectedGradeStudent.trainerSuggestedBelt ? '8px' : 0 }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Promotion Target:</span>
                      {selectedGradeStudent.nextBelt !== 'None' ? (
                        <span className={`badge ${getBeltColorClass(selectedGradeStudent.nextBelt)}`} style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
                          ➔ {selectedGradeStudent.nextBelt}
                        </span>
                      ) : (
                        <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Max Belt Rank Reached</strong>
                      )}
                    </div>
                    {selectedGradeStudent.trainerSuggestedBelt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '6px 10px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                        <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600 }}>🥋 Trainer Suggested:</span>
                        <span className={`badge ${getBeltColorClass(selectedGradeStudent.trainerSuggestedBelt)}`} style={{ padding: '3px 8px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {selectedGradeStudent.trainerSuggestedBelt}
                        </span>
                      </div>
                    )}
                    {selectedGradeStudent.trainerGradingNotes && (
                      <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '5px 8px', borderRadius: '6px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'normal' }}>Trainer Remarks: </span>
                        "{selectedGradeStudent.trainerGradingNotes}"
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>Test Date</label>
                    <input
                      type="date"
                      className="form-control"
                      style={{ height: '40px', borderRadius: '10px', fontSize: '0.85rem' }}
                      value={gradeDate}
                      onChange={(e) => setGradeDate(e.target.value)}
                      required
                    />
                  </div>

                  {gradeResult === 'Pass' && (
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>
                        Target Belt / Level to Assign *
                      </label>
                      <select
                        className="form-control"
                        style={{ height: '42px', borderRadius: '10px', fontSize: '0.88rem', width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                        value={targetBelt}
                        onChange={(e) => setTargetBelt(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Target Belt / Level --</option>
                        <optgroup label="🥋 Traditional Belts">
                          {['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Red', 'Brown 1', 'Brown 2', 'Brown 3', 'Brown 4', 'Black'].map(b => (
                            <option key={b} value={b} style={{ background: '#12141d', color: '#fff' }}>{b} Belt</option>
                          ))}
                        </optgroup>
                        <optgroup label="🥊 Kickboxing / Boxing Levels">
                          {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Pro Level'].map(b => (
                            <option key={b} value={b} style={{ background: '#12141d', color: '#fff' }}>{b}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>Test Result</label>
                    <div className="grade-result-options-grid">
                      <div
                        className={`grade-result-card ${gradeResult === 'Pass' ? 'selected-pass' : ''}`}
                        onClick={() => {
                          setGradeResult('Pass');
                          const naturalNext = getNextBelt(selectedGradeStudent.belt);
                          const initialBelt = (selectedGradeStudent.trainerSuggestedBelt && selectedGradeStudent.trainerSuggestedBelt !== selectedGradeStudent.belt)
                            ? selectedGradeStudent.trainerSuggestedBelt
                            : (naturalNext !== 'None' ? naturalNext : (selectedGradeStudent.belt || 'Yellow'));
                          setTargetBelt(initialBelt);
                        }}
                      >
                        <CheckCircle size={24} style={{ color: '#4ade80' }} />
                        <h4 className="grade-result-title">Pass</h4>
                        <p className="grade-result-desc">
                          Promotes student to <strong>{targetBelt || (getNextBelt(selectedGradeStudent.belt) !== 'None' ? getNextBelt(selectedGradeStudent.belt) : 'Next Level')}</strong>
                        </p>
                      </div>

                      <div
                        className={`grade-result-card ${gradeResult === 'Fail' ? 'selected-fail' : ''}`}
                        onClick={() => {
                          setGradeResult('Fail');
                          setTargetBelt(selectedGradeStudent.belt);
                        }}
                      >
                        <XCircle size={24} style={{ color: '#f87171' }} />
                        <h4 className="grade-result-title">Fail</h4>
                        <p className="grade-result-desc">
                          Retains current <strong>{selectedGradeStudent.belt}</strong> belt level
                        </p>
                      </div>
                    </div>
                  </div>

                  {gradeResult === 'Pass' && (
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '8px' }}>
                        Awarded Grade Level *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[
                          { letter: 'A', label: 'Grade A', desc: 'Outstanding', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)' },
                          { letter: 'B', label: 'Grade B', desc: 'Merit / Good', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
                          { letter: 'C', label: 'Grade C', desc: 'Satisfactory', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' }
                        ].map(g => {
                          const isSelected = gradeLetter === g.letter;
                          return (
                            <div
                              key={g.letter}
                              style={{
                                padding: '0.75rem 0.5rem',
                                borderRadius: '10px',
                                border: isSelected ? `2px solid ${g.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                                background: isSelected ? g.bg : 'rgba(255, 255, 255, 0.03)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? `0 0 12px ${g.bg}` : 'none'
                              }}
                              onClick={() => setGradeLetter(g.letter)}
                            >
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: g.color, fontFamily: 'Outfit, sans-serif' }}>
                                {g.label}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                {g.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.6rem 1.25rem', borderRadius: '10px' }}
                      onClick={() => {
                        setIsGradeModalOpen(false);
                        setSelectedGradeStudent(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={gradingActionLoading}
                      style={{ background: 'var(--color-accent-primary, #e50914)', padding: '0.6rem 1.5rem', borderRadius: '10px', fontWeight: 600 }}
                    >
                      {gradingActionLoading ? 'Saving...' : 'Submit Grade Result'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Grading Info Override */}
          {isEditGradingModalOpen && selectedEditGradingStudent && (
            <div className="modal-overlay" style={{ zIndex: 1000 }}>
              <div className="modal-content" style={{ maxWidth: '500px', background: 'var(--color-bg-surface, #12141d)', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="panel-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <h3 className="panel-title" style={{ fontSize: '1.1rem', margin: 0 }}>Edit Student Grading Info</h3>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setIsEditGradingModalOpen(false);
                      setSelectedEditGradingStudent(null);
                    }}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#fff' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitEditGrading}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div>Student: <strong style={{ color: '#fff' }}>{selectedEditGradingStudent.name}</strong> (ID: #{selectedEditGradingStudent.id})</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      🥋 Last Grading Date: <strong style={{ color: '#e2e8f0' }}>{selectedEditGradingStudent.lastGradingDate || 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                      Present Grade / Level
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        style={{ height: '40px', borderRadius: '10px', flex: 1, fontSize: '0.9rem' }}
                        value={editGradingForm.belt || ''}
                        onChange={(e) => setEditGradingForm({ ...editGradingForm, belt: e.target.value })}
                        placeholder="Type or select belt/level (e.g. Orange Belt)"
                        list="grading-belt-options-list"
                        required
                      />
                      <select
                        className="form-control"
                        style={{ height: '40px', borderRadius: '10px', width: 'auto', maxWidth: '160px', fontSize: '0.85rem' }}
                        value={editGradingForm.belt || ''}
                        onChange={(e) => setEditGradingForm({ ...editGradingForm, belt: e.target.value })}
                      >
                        <option value="">-- Quick Select --</option>
                        <optgroup label="🥋 Traditional Belts">
                          {[
                            'White Belt', 'Yellow Belt', 'Orange Belt', 'Green Belt', 'Blue Belt', 'Purple Belt', 'Red Belt',
                            'Brown Belt', 'Brown 1 Belt', 'Brown 2 Belt', 'Brown 3 Belt', 'Brown 4 Belt', 'Black Belt',
                            'White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Red',
                            'Brown', 'Brown 1', 'Brown 2', 'Brown 3', 'Brown 4', 'Black'
                          ].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </optgroup>
                        <optgroup label="🥊 Kickboxing / Boxing Levels">
                          {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Pro Level'].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <datalist id="grading-belt-options-list">
                      {[
                        'White Belt', 'Yellow Belt', 'Orange Belt', 'Green Belt', 'Blue Belt', 'Purple Belt', 'Red Belt',
                        'Brown Belt', 'Brown 1 Belt', 'Brown 2 Belt', 'Brown 3 Belt', 'Brown 4 Belt', 'Black Belt',
                        'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Pro Level'
                      ].map(b => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                    <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                      Type any custom grade/level or choose from the quick selection dropdown.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ borderRadius: '10px', padding: '0.6rem 1.25rem' }}
                      onClick={() => {
                        setIsEditGradingModalOpen(false);
                        setSelectedEditGradingStudent(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={gradingActionLoading}
                      style={{ borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: 600 }}
                    >
                      {gradingActionLoading ? 'Saving...' : 'Save Override'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    } catch (err) {
      console.error("Error rendering Grading view:", err);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ff453a', background: 'rgba(229, 9, 20, 0.1)', borderRadius: '14px', border: '1px solid rgba(229, 9, 20, 0.3)', margin: '1rem' }}>
          <AlertTriangle size={32} style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ color: '#fff', margin: '0.5rem 0' }}>Grading View</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{err.message}</p>
          <button className="btn-primary" onClick={fetchGradingStudents} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: '8px' }}>
            Reload Grading Data
          </button>
        </div>
      );
    }
  };

  const renderPerformance = () => {
    // Helper to calculate financial metrics for a student
    const getStudentFeeStats = (student) => {
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

      let collectedAdmission = 0;
      let pendingAdmission = 0;

      if (student.admissionPaid) {
        collectedAdmission = finalAdmissionRate;
      } else {
        pendingAdmission = finalAdmissionRate;
      }

      // Monthly fees
      const currentMonthStr = getLocalMonthString(); // YYYY-MM
      let joinMonthStr = student.joinDate ? student.joinDate.slice(0, 7) : currentMonthStr;

      if (startingBillingMonth && startingBillingMonth > joinMonthStr) {
        joinMonthStr = startingBillingMonth;
      }

      const rateToUse = student.customMonthlyRate !== undefined && student.customMonthlyRate !== null
        ? student.customMonthlyRate
        : monthlyFeeRate;

      let collectedMonthly = 0;
      let pendingMonthly = 0;
      let paidCount = 0;
      let pendingCount = 0;

      let [joinYear, joinMonth] = joinMonthStr.split('-').map(Number);
      let [currYear, currMonth] = currentMonthStr.split('-').map(Number);

      if (joinYear && joinMonth && currYear && currMonth) {
        let tempYear = joinYear;
        let tempMonth = joinMonth;

        while (tempYear < currYear || (tempYear === currYear && tempMonth <= currMonth)) {
          const monthStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}`;
          const isPaid = student.paidMonths && student.paidMonths[monthStr];

          const discountAmount = getStudentDiscountForMonth(student, rateToUse, monthStr);
          const finalRate = Math.max(0, rateToUse - discountAmount);

          if (isPaid) {
            collectedMonthly += finalRate;
            paidCount++;
          } else {
            pendingMonthly += finalRate;
            pendingCount++;
          }

          tempMonth++;
          if (tempMonth > 12) {
            tempMonth = 1;
            tempYear++;
          }
        }
      }

      return {
        collectedAdmission,
        pendingAdmission,
        collectedMonthly,
        pendingMonthly,
        totalCollected: collectedAdmission + collectedMonthly,
        totalPending: pendingAdmission + pendingMonthly,
        expected: collectedAdmission + collectedMonthly + pendingAdmission + pendingMonthly,
        paidCount,
        pendingCount
      };
    };

    // Filter students based on Performance tab branch/batch and search input
    const getFilteredStudentsForPerf = (branchVal, batchVal, searchVal) => {
      return students.filter(s => {
        if (s.status === 'Inactive' || s.status === 'SoftDeleted') return false;

        // 1. Branch filter
        let matchesBranch = true;
        if (branchVal !== 'All') {
          matchesBranch = s.branch && s.branch.toLowerCase().trim() === branchVal.toLowerCase().trim();
        }

        // 2. Batch filter
        let matchesBatch = true;
        if (batchVal !== 'All') {
          const selectedBatchObj = batchOptions.find(b => b.id.toLowerCase() === batchVal.toLowerCase());
          if (selectedBatchObj) {
            const studentBatchLower = (s.batch || '').toLowerCase().trim();
            const targetIdLower = selectedBatchObj.id.toLowerCase().trim();
            const targetNameLower = selectedBatchObj.name.toLowerCase().trim();
            if (studentBatchLower === targetIdLower || studentBatchLower === targetNameLower) {
              matchesBatch = true;
            } else if (studentBatchLower && (studentBatchLower.startsWith('batch') || studentBatchLower.startsWith('batch_'))) {
              matchesBatch = false;
            } else {
              matchesBatch = schedulesMatch(s.schedule, selectedBatchObj.schedule);
            }
          } else {
            matchesBatch = false;
          }
        }

        // 3. Search query
        let matchesSearch = true;
        if (searchVal) {
          matchesSearch = s.name && s.name.toLowerCase().includes(searchVal.toLowerCase().trim());
        }

        return matchesBranch && matchesBatch && matchesSearch;
      });
    };

    const activeRole = getCookieValue('umai_session_role') || userRole;
    const isSuper = activeRole === 'superadmin' || activeRole === 'developer';
    const activeBranch = isSuper ? perfFilterBranch : userBranch;
    const activeBatch = perfFilterBatch;

    const filtered = getFilteredStudentsForPerf(activeBranch, activeBatch, searchQuery);

    // Calculate overall stats for filtered students
    let overallCollected = 0;
    let overallPending = 0;
    let overallExpected = 0;

    filtered.forEach(s => {
      const stats = getStudentFeeStats(s);
      overallCollected += stats.totalCollected;
      overallPending += stats.totalPending;
      overallExpected += stats.expected;
    });

    const overallCollectionRate = overallExpected > 0 ? Math.round((overallCollected / overallExpected) * 100) : 0;

    // Calculate Branch-wise summary (only if superadmin and viewing 'All')
    const branchSummaries = [];
    if (isSuper && activeBranch === 'All') {
      branches.forEach(bName => {
        const branchStudents = getFilteredStudentsForPerf(bName, 'All', '');
        let bCollected = 0;
        let bPending = 0;
        let bExpected = 0;
        branchStudents.forEach(s => {
          const stats = getStudentFeeStats(s);
          bCollected += stats.totalCollected;
          bPending += stats.totalPending;
          bExpected += stats.expected;
        });
        branchSummaries.push({
          name: bName,
          studentsCount: branchStudents.length,
          collected: bCollected,
          pending: bPending,
          expected: bExpected,
          rate: bExpected > 0 ? Math.round((bCollected / bExpected) * 100) : 0
        });
      });
    }

    // Calculate Batch-wise summary
    const batchSummaries = [];
    const filteredBatchOpts = getFilteredBatchOptions(isSuper ? activeBranch : undefined);
    filteredBatchOpts.forEach(batchOpt => {
      const batchStudents = getFilteredStudentsForPerf(activeBranch, batchOpt.id, '');
      let batCollected = 0;
      let batPending = 0;
      let batExpected = 0;
      batchStudents.forEach(s => {
        const stats = getStudentFeeStats(s);
        batCollected += stats.totalCollected;
        batPending += stats.totalPending;
        batExpected += stats.expected;
      });
      batchSummaries.push({
        id: batchOpt.id,
        name: batchOpt.name,
        studentsCount: batchStudents.length,
        collected: batCollected,
        pending: batPending,
        expected: batExpected,
        rate: batExpected > 0 ? Math.round((batCollected / batExpected) * 100) : 0
      });
    });

    return (
      <div className="performance-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Dashboard Financial Stats Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
          <div className="stat-card glow-card-green" style={{ background: 'linear-gradient(145deg, rgba(16, 32, 24, 0.7) 0%, rgba(12, 22, 18, 0.8) 100%)', border: '1px solid rgba(76, 175, 80, 0.25)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(76, 175, 80, 0.15)', width: '38px', height: '38px', borderRadius: '8px' }}>
              <Wallet className="stat-icon" style={{ color: '#4CAF50' }} size={18} />
            </div>
            <div className="stat-details">
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: '#86efac', fontSize: '0.72rem', fontWeight: 600 }}>Collected Profit</h3>
              <p className="stat-value" style={{ color: '#4CAF50', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem' }}>₹{overallCollected.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card glow-card-red" style={{ background: 'linear-gradient(145deg, rgba(38, 16, 20, 0.7) 0%, rgba(24, 12, 14, 0.8) 100%)', border: '1px solid rgba(229, 9, 20, 0.25)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(229, 9, 20, 0.15)', width: '38px', height: '38px', borderRadius: '8px' }}>
              <AlertTriangle className="stat-icon" style={{ color: '#ff453a' }} size={18} />
            </div>
            <div className="stat-details">
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fda4af', fontSize: '0.72rem', fontWeight: 600 }}>Pending Fees</h3>
              <p className="stat-value" style={{ color: '#ff453a', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem' }}>₹{overallPending.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card glow-card-blue" style={{ background: 'linear-gradient(145deg, rgba(18, 28, 45, 0.7) 0%, rgba(13, 19, 32, 0.8) 100%)', border: '1px solid rgba(54, 162, 235, 0.25)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(54, 162, 235, 0.15)', width: '38px', height: '38px', borderRadius: '8px' }}>
              <Activity className="stat-icon" style={{ color: '#36A2EB' }} size={18} />
            </div>
            <div className="stat-details">
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: '#93c5fd', fontSize: '0.72rem', fontWeight: 600 }}>Expected Revenue</h3>
              <p className="stat-value" style={{ color: '#36A2EB', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem' }}>₹{overallExpected.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card glow-card-yellow" style={{ background: 'linear-gradient(145deg, rgba(38, 32, 14, 0.7) 0%, rgba(24, 20, 10, 0.8) 100%)', border: '1px solid rgba(255, 199, 0, 0.25)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 199, 0, 0.15)', width: '38px', height: '38px', borderRadius: '8px' }}>
              <TrendingUp className="stat-icon" style={{ color: '#ffc700' }} size={18} />
            </div>
            <div className="stat-details">
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fde047', fontSize: '0.72rem', fontWeight: 600 }}>Collection Rate</h3>
              <p className="stat-value" style={{ color: '#ffc700', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.6rem' }}>{overallCollectionRate}%</p>
            </div>
          </div>
        </div>

        {/* Modern Filters Bar with View Switcher */}
        <div className="filters-wrapper-card" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
          {/* Sub-view switcher segmented pill bar */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '1rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            <button
              type="button"
              onClick={() => setPerfActiveTab('students')}
              style={{
                flex: 1,
                minWidth: '110px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: perfActiveTab === 'students' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                color: perfActiveTab === 'students' ? '#fff' : '#8e8e93',
                boxShadow: perfActiveTab === 'students' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Users size={14} /> Students <span style={{ opacity: 0.85, fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>{filtered.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setPerfActiveTab('batches')}
              style={{
                flex: 1,
                minWidth: '110px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: perfActiveTab === 'batches' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                color: perfActiveTab === 'batches' ? '#fff' : '#8e8e93',
                boxShadow: perfActiveTab === 'batches' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Calendar size={14} /> Batches <span style={{ opacity: 0.85, fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>{batchSummaries.length}</span>
            </button>

            {isSuper && activeBranch === 'All' && (
              <button
                type="button"
                onClick={() => setPerfActiveTab('branches')}
                style={{
                  flex: 1,
                  minWidth: '110px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: perfActiveTab === 'branches' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                  color: perfActiveTab === 'branches' ? '#fff' : '#8e8e93',
                  boxShadow: perfActiveTab === 'branches' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Layers size={14} /> Branches <span style={{ opacity: 0.85, fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>{branchSummaries.length}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ minWidth: '220px', flex: '1 1 240px' }}>
              <input
                type="text"
                placeholder="Search student..."
                className="form-control"
                style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Branch (Superadmin only) */}
            {isSuper ? (
              <div style={{ minWidth: '140px', flex: '1 1 140px' }}>
                <select
                  className="form-control"
                  style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }}
                  value={perfFilterBranch}
                  onChange={(e) => {
                    setPerfFilterBranch(e.target.value);
                    setPerfFilterBatch('All');
                  }}
                >
                  <option value="All">All Branches</option>
                  {branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ minWidth: '140px', flex: '1 1 140px' }}>
                <input type="text" className="form-control" style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }} value={userBranch} disabled />
              </div>
            )}

            {/* Batch Filter */}
            <div style={{ minWidth: '140px', flex: '1 1 140px' }}>
              <select
                className="form-control"
                style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }}
                value={perfFilterBatch}
                onChange={(e) => setPerfFilterBatch(e.target.value)}
              >
                <option value="All">All Batches</option>
                {getFilteredBatchOptions(isSuper ? perfFilterBranch : undefined).map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button
              className="btn-secondary"
              style={{ padding: '0 1rem', fontSize: '0.8rem', height: '38px', borderRadius: '8px', whiteSpace: 'nowrap' }}
              onClick={() => {
                if (isSuper) setPerfFilterBranch('All');
                setPerfFilterBatch('All');
                setSearchQuery('');
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Tab 1: Detailed Student-wise Breakdown */}
        {perfActiveTab === 'students' && (
          <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden', padding: 0 }}>
            {filtered.length > 0 ? (
              <div className="premium-table-container" style={{ border: 'none', background: 'transparent' }}>
                <table className="premium-table responsive-table-cards">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Batch</th>
                      <th>Admission</th>
                      <th>Monthly Status</th>
                      <th>Paid (Profit)</th>
                      <th>Pending</th>
                      <th>Collection</th>
                      <th style={{ textAlign: 'center' }}>Contact Outreach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(student => {
                      const initials = (student.studentName || student.name || 'S').split(' ').map(n => n[0]).slice(0, 2).join('');
                      const stats = getStudentFeeStats(student);
                      const rate = stats.expected > 0 ? Math.round((stats.totalCollected / stats.expected) * 100) : 0;

                      return (
                        <tr key={student.id}>
                          <td data-label="Student" style={{ fontWeight: 700, color: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="student-avatar-badge">{initials}</div>
                              <button
                                type="button"
                                onClick={() => handleSelectStudent(student)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  fontWeight: 700,
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  fontSize: 'inherit',
                                  textAlign: 'left',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {student.studentName || student.name}
                                {student.isPriority && (
                                  <Star size={13} fill="#FFD700" color="#FFD700" title="Priority Student" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td data-label="Batch">
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}>
                              {getBatchNameFromSchedule(student.schedule, student.branch)}
                            </span>
                          </td>
                          <td data-label="Admission">
                            {student.admissionPaid ? (
                              <span className="badge-outline-green" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>Paid</span>
                            ) : (
                              <span className="badge-outline-red" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>Pending (₹{stats.pendingAdmission})</span>
                            )}
                          </td>
                          <td data-label="Monthly Status" style={{ fontSize: '0.8rem' }}>
                            <span style={{ color: '#4CAF50', fontWeight: 600 }}>{stats.paidCount} Paid</span> • <span style={{ color: '#ff453a', fontWeight: 600 }}>{stats.pendingCount} Due</span>
                          </td>
                          <td data-label="Paid (Profit)" style={{ fontWeight: 700, color: '#4CAF50' }}>
                            ₹{stats.totalCollected.toLocaleString()}
                          </td>
                          <td data-label="Pending" style={{ fontWeight: 700, color: stats.totalPending > 0 ? '#ff453a' : 'var(--color-text-muted)' }}>
                            ₹{stats.totalPending.toLocaleString()}
                          </td>
                          <td data-label="Collection" style={{ width: '15%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div className="progress-container" style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                                <div className="progress-bar" style={{ width: `${rate}%`, background: rate >= 80 ? '#4CAF50' : rate >= 50 ? '#36A2EB' : '#ff453a', height: '100%', borderRadius: '4px' }}></div>
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{rate}%</span>
                            </div>
                          </td>
                          <td data-label="Contact Outreach">
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
                              <a href={`tel:${student.phone}`} style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }} title="Call Student">
                                <Phone size={13} />
                              </a>
                              <a href={`https://wa.me/${student.phone}`} target="_blank" rel="noreferrer" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.25)', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }} title="WhatsApp Student">
                                <MessageCircle size={13} />
                              </a>
                              <a href={`sms:${student.phone}`} style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.25)', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }} title="SMS Student">
                                <MessageSquare size={13} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--color-text-muted)' }}>
                <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>No Students Found</div>
                <p style={{ fontSize: '0.8rem', margin: 0, marginTop: '4px' }}>No student records match the selected performance filter.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Batch Summary Breakdown */}
        {perfActiveTab === 'batches' && (
          <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden', padding: 0 }}>
            <div className="premium-table-container" style={{ border: 'none', background: 'transparent' }}>
              <table className="premium-table responsive-table-cards">
                <thead>
                  <tr>
                    <th>Batch Name</th>
                    <th>Students</th>
                    <th>Fee Collected</th>
                    <th>Pending Due</th>
                    <th>Expected Revenue</th>
                    <th>Collection Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {batchSummaries.map(batSummary => (
                    <tr key={batSummary.id}>
                      <td style={{ fontWeight: 600, color: '#fff' }} data-label="Batch Name">{batSummary.name}</td>
                      <td data-label="Students">
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.75rem', padding: '3px 8px' }}>
                          {batSummary.studentsCount} Students
                        </span>
                      </td>
                      <td style={{ color: '#4CAF50', fontWeight: 700 }} data-label="Fee Collected">₹{batSummary.collected.toLocaleString()}</td>
                      <td style={{ color: '#ff453a', fontWeight: 700 }} data-label="Pending Due">₹{batSummary.pending.toLocaleString()}</td>
                      <td style={{ color: '#38bdf8', fontWeight: 600 }} data-label="Expected Revenue">₹{batSummary.expected.toLocaleString()}</td>
                      <td style={{ width: '22%' }} data-label="Collection Progress">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-container" style={{ flex: 1, height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                            <div className="progress-bar" style={{ width: `${batSummary.rate}%`, background: batSummary.rate >= 80 ? '#4CAF50' : batSummary.rate >= 50 ? '#38bdf8' : '#ff453a', height: '100%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', minWidth: '35px' }}>{batSummary.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Branch Summary Breakdown (Super Admin) */}
        {perfActiveTab === 'branches' && isSuper && activeBranch === 'All' && (
          <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden', padding: 0 }}>
            <div className="premium-table-container" style={{ border: 'none', background: 'transparent' }}>
              <table className="premium-table responsive-table-cards">
                <thead>
                  <tr>
                    <th>Branch Name</th>
                    <th>Students</th>
                    <th>Fee Collected</th>
                    <th>Pending Due</th>
                    <th>Expected Revenue</th>
                    <th>Collection Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {branchSummaries.map(bSummary => (
                    <tr key={bSummary.name}>
                      <td style={{ fontWeight: 600, color: '#fff' }} data-label="Branch Name">{bSummary.name}</td>
                      <td data-label="Students">
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.75rem', padding: '3px 8px' }}>
                          {bSummary.studentsCount} Students
                        </span>
                      </td>
                      <td style={{ color: '#4CAF50', fontWeight: 700 }} data-label="Fee Collected">₹{bSummary.collected.toLocaleString()}</td>
                      <td style={{ color: '#ff453a', fontWeight: 700 }} data-label="Pending Due">₹{bSummary.pending.toLocaleString()}</td>
                      <td style={{ color: '#38bdf8', fontWeight: 600 }} data-label="Expected Revenue">₹{bSummary.expected.toLocaleString()}</td>
                      <td style={{ width: '22%' }} data-label="Collection Progress">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-container" style={{ flex: 1, height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                            <div className="progress-bar" style={{ width: `${bSummary.rate}%`, background: bSummary.rate >= 80 ? '#4CAF50' : bSummary.rate >= 50 ? '#38bdf8' : '#ff453a', height: '100%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', minWidth: '35px' }}>{bSummary.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReminders = () => {
    const currentSystemMonth = new Date().toISOString().slice(0, 7);
    const unpaidStudents = searchedStudents.filter(s => {
      const isInactive = (s.status || 'Active') === 'Inactive';
      if (isInactive) return false;
      const matchBranch = branchFilter === 'All' || !s.branch || String(s.branch).toLowerCase().trim() === String(branchFilter).toLowerCase().trim();
      const matchBatch = batchFilter === 'All' || !s.batch || String(s.batch).toLowerCase().trim() === String(batchFilter).toLowerCase().trim();

      const fees = calculateStudentFees(s, currentSystemMonth);
      return matchBranch && matchBatch && fees.totalDue > 0;
    });

    const sendReminderMessage = (student) => {
      const pFee = student.pendingFees !== undefined ? Number(student.pendingFees) : 600;
      const text = encodeURIComponent(`Hello ${student.studentName || student.name}, this is a gentle reminder from MasterFit Academy regarding your pending fee balance of ₹${pFee}. Please clear it at your earliest convenience.`);
      const phone = student.phone || student.parentPhone;
      if (phone) {
        window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
      } else {
        alert(`No phone number available for ${student.studentName || student.name}`);
      }
    };

    return (
      <div className="reminders-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header Banner */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(10, 10, 15, 0.9))', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={24} color="#FFD700" /> Fee Alerts & Student Reminders
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Track student fee due alerts and send WhatsApp / SMS reminders directly to parents & students.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="stat-card" style={{ padding: '0.75rem 1.25rem', minWidth: '130px', background: 'rgba(255, 215, 0, 0.08)', border: '1px solid rgba(255, 215, 0, 0.2)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#FFD700', fontWeight: 700, textTransform: 'uppercase' }}>Pending Dues</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>{unpaidStudents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Dues List */}
        <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem', color: '#fff' }}>
              <Wallet size={18} color="#FFD700" /> Pending Dues List ({unpaidStudents.length})
            </h3>
          </div>

          <div className="premium-table-container" style={{ border: 'none', background: 'transparent' }}>
            <table className="premium-table responsive-table-cards">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Branch / Batch</th>
                  <th>Contact Info</th>
                  <th>Pending Amount</th>
                  <th style={{ textAlign: 'center' }}>Send Reminder</th>
                </tr>
              </thead>
              <tbody>
                {unpaidStudents.length > 0 ? unpaidStudents.map(student => {
                  const pFee = student.pendingFees !== undefined ? Number(student.pendingFees) : 600;
                  return (
                    <tr key={student.id}>
                      <td data-label="Student Name">
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                            {student.studentName || student.name}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            Belt: {student.belt || 'White'}
                          </span>
                        </div>
                      </td>
                      <td data-label="Branch / Batch">
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="badge badge-blue" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                            📍 {student.branch || 'Kuttiady'}
                          </span>
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                            🥋 {getBatchNameFromCode(student.batch, student.branch)}
                          </span>
                        </div>
                      </td>
                      <td data-label="Contact Info">
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          <span>📞 Student: {student.phone || 'N/A'}</span>
                          <span>👨 Parent: {student.parentPhone || 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Pending Amount">
                        <span className="badge badge-gold" style={{ fontSize: '0.88rem', fontWeight: 800, padding: '4px 10px' }}>
                          ₹{pFee}
                        </span>
                      </td>
                      <td data-label="Send Reminder" style={{ textAlign: 'center' }}>
                        <button
                          className="btn-primary btn-small"
                          style={{ padding: '6px 14px', fontWeight: 700, whiteSpace: 'nowrap', background: '#25D366', borderColor: '#25D366', color: '#fff' }}
                          onClick={() => sendReminderMessage(student)}
                        >
                          💬 Send WhatsApp Alert
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2.5rem' }}>
                      <CheckCircle size={32} style={{ color: '#30d158', marginBottom: '8px', opacity: 0.8 }} />
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>No Pending Fee Reminders</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>All active students in selected branch/batch have cleared their fees.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
        const existingBatchesMapped = customBatches.map(b => ({
          id: b.id || b.code || b._id,
          name: b.name || b.batchName || '',
          schedule: b.schedule || 'Mon-Thu',
          branch: b.branch || '',
          startTime: b.startTime || '09:00',
          endTime: b.endTime || '10:30',
          slotType: b.slotType || 'Morning',
          status: b.status || 'Active'
        }));
        const updatedCustomBatches = existingBatchesMapped.map(b =>
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

      setIsCredentialModalOpen(false);
      setEditingCredential(null);
      setCredentialModalSuccess('');
      setGlobalSuccess('Credentials updated successfully!');
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
            <button className="btn-icon" onClick={() => { if (!editBatchSaving) { setIsEditBatchModalOpen(false); setEditingBatchObj(null); } }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }} disabled={editBatchSaving}><X size={24} /></button>
          </div>

          {editBatchModalError && (
            <div style={{ color: '#ff453a', background: 'rgba(255,69,58,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,69,58,0.2)', fontWeight: 500, marginBottom: '1.5rem' }}>
              {editBatchModalError}
            </div>
          )}
          {editBatchModalSuccess && (
            <div style={{ color: '#30d158', background: 'rgba(48,209,88,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(48,209,88,0.2)', fontWeight: 500, marginBottom: '1.5rem' }}>
              {editBatchModalSuccess}
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            const newName = newBatchNameField.trim();
            const newSchedule = formatSelectedDays(editBatchDays);
            const newSlot = editBatchSlotType;
            if (newName && newSchedule) {
              handleEditCustomBatch(editingBatchObj.id, newName, newSchedule, newSlot, '', newSlot, editBatchStatusField);
            } else {
              setEditBatchModalError("Name and at least one schedule day are required.");
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
                disabled={editBatchSaving}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Schedule Days (select one or more)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', color: editBatchDays[day] ? 'white' : 'var(--color-text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={editBatchDays[day]}
                      onChange={(e) => setEditBatchDays(prev => ({ ...prev, [day]: e.target.checked }))}
                      style={{ accentColor: 'var(--color-primary)' }}
                      disabled={editBatchSaving}
                    />
                    {day}
                  </label>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Formatted schedule: <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{formatSelectedDays(editBatchDays) || 'None selected'}</span>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Timing Category (Slot)</label>
              <select
                className="form-control"
                style={{ width: '100%' }}
                value={editBatchSlotType}
                onChange={(e) => setEditBatchSlotType(e.target.value)}
                required
                disabled={editBatchSaving}
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Status</label>
              <select
                className="form-control"
                style={{ width: '100%' }}
                value={editBatchStatusField || 'Active'}
                onChange={(e) => setEditBatchStatusField(e.target.value)}
                required
                disabled={editBatchSaving}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => { setIsEditBatchModalOpen(false); setEditingBatchObj(null); }} disabled={editBatchSaving}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={editBatchSaving}>
                {editBatchSaving ? 'Saving...' : 'Save Changes'}
              </button>
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

    const effectiveSubTab = (!isSuper && (mappingSubTab === 'credentials' || mappingSubTab === 'branches')) ? 'batches' : mappingSubTab;

    return (
      <div className="credentials-view" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Consolidated Sub-tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
          {isSuper && (
            <button
              className={`btn-primary ${effectiveSubTab === 'credentials' ? '' : 'btn-secondary'}`}
              style={effectiveSubTab === 'credentials' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
              onClick={() => setMappingSubTab('credentials')}
            >
              User Accounts
            </button>
          )}
          {isSuper && (
            <button
              className={`btn-primary ${effectiveSubTab === 'branches' ? '' : 'btn-secondary'}`}
              style={effectiveSubTab === 'branches' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
              onClick={() => setMappingSubTab('branches')}
            >
              Branches Setup
            </button>
          )}
          <button
            className={`btn-primary ${effectiveSubTab === 'batches' ? '' : 'btn-secondary'}`}
            style={effectiveSubTab === 'batches' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
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
        {effectiveSubTab === 'credentials' && isSuper && renderAdminsPage()}

        {effectiveSubTab === 'branches' && isSuper && renderBranchesPage()}
        {effectiveSubTab === 'batches' && renderBatchesPage()}
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
              <h3>Total Active Academy Branches</h3>
              <p className="stat-value">{branches.length}</p>
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
                    onChange={(e) => {
                      const nameVal = e.target.value;
                      setNewBranchForm(prev => ({
                        ...prev,
                        name: nameVal,
                        username: nameVal ? `admin@${nameVal.toLowerCase().trim().replace(/\s+/g, '')}` : ''
                      }));
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trainer Username (Will default to admin@name)</label>
                  <input
                    type="text"
                    placeholder="admin@name"
                    className="form-control"
                    value={newBranchForm.username}
                    onChange={(e) => setNewBranchForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Admin Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewBranchPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-control"
                      style={{ paddingRight: '2.5rem' }}
                      value={newBranchForm.password}
                      onChange={(e) => setNewBranchForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowNewBranchPassword(prev => !prev)}
                    >
                      {showNewBranchPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewBranchConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-control"
                      style={{ paddingRight: '2.5rem' }}
                      value={newBranchForm.confirmPassword || ''}
                      onChange={(e) => setNewBranchForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowNewBranchConfirmPassword(prev => !prev)}
                    >
                      {showNewBranchConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newBranchPasswordError && <span style={{ color: '#ff453a', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{newBranchPasswordError}</span>}
                </div>
              </div>
              <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Create Mapped Branch & Trainer Credentials</button>
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
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showManageBranchPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter new password"
                      style={{ paddingRight: '2.5rem' }}
                      required
                      value={branchForm.newPassword}
                      onChange={(e) => { setBranchForm({ ...branchForm, newPassword: e.target.value }); setBranchPasswordError(''); }}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowManageBranchPassword(prev => !prev)}
                    >
                      {showManageBranchPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showManageBranchConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm new password"
                      style={{ paddingRight: '2.5rem' }}
                      required
                      value={branchForm.confirmPassword}
                      onChange={(e) => { setBranchForm({ ...branchForm, confirmPassword: e.target.value }); setBranchPasswordError(''); }}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowManageBranchConfirmPassword(prev => !prev)}
                    >
                      {showManageBranchConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                  <th>Total Students</th>
                  <th>Staff / Trainers</th>
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
                          <span style={{ color: 'var(--color-text-muted)' }}>No Default Trainer Set</span>
                        )}
                      </td>
                      <td data-label="Total Students"><span className="badge badge-green">{studentCount} Students</span></td>
                      <td data-label="Staff / Trainers"><span className="badge" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db' }}>{adminCount} Admin / Trainer(s)</span></td>
                      <td data-label="Type">
                        <span className="badge" style={{ background: 'rgba(48, 209, 88, 0.15)', color: '#30d158' }}>Active Branch</span>
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
              <h3>Total Active Academy Batches</h3>
              <p className="stat-value">{batchOptions.length}</p>
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Schedule Days (select one or more)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', color: newBatchDays[day] ? 'white' : 'var(--color-text-muted)' }}>
                        <input
                          type="checkbox"
                          checked={newBatchDays[day]}
                          onChange={(e) => setNewBatchDays(prev => ({ ...prev, [day]: e.target.checked }))}
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Formatted schedule: <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{formatSelectedDays(newBatchDays) || 'None selected'}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Timing Category (Slot)</label>
                  <select
                    className="form-control"
                    value={newBatchForm.slotType || 'Morning'}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, slotType: e.target.value }))}
                    required
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
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
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={newBatchForm.status || 'Active'}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, status: e.target.value }))}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trainer Username</label>
                  <input
                    type="text"
                    placeholder="Enter trainer username"
                    className="form-control"
                    value={newBatchForm.username}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trainer Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewBatchPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-control"
                      style={{ paddingRight: '2.5rem' }}
                      value={newBatchForm.password}
                      onChange={(e) => setNewBatchForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowNewBatchPassword(prev => !prev)}
                    >
                      {showNewBatchPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewBatchConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-control"
                      style={{ paddingRight: '2.5rem' }}
                      value={newBatchForm.confirmPassword || ''}
                      onChange={(e) => setNewBatchForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowNewBatchConfirmPassword(prev => !prev)}
                    >
                      {showNewBatchConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                    {modalBatches.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.name} ({opt.schedule})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>New Username (Optional)</label>
                  <input type="text" className="form-control" placeholder="Enter new username" value={batchForm.newUsername} onChange={(e) => setBatchForm({ ...batchForm, newUsername: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showManageBatchPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter new password"
                      style={{ paddingRight: '2.5rem' }}
                      required
                      value={batchForm.newPassword}
                      onChange={(e) => { setBatchForm({ ...batchForm, newPassword: e.target.value }); setBatchPasswordError(''); }}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowManageBatchPassword(prev => !prev)}
                    >
                      {showManageBatchPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showManageBatchConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm new password"
                      style={{ paddingRight: '2.5rem' }}
                      required
                      value={batchForm.confirmPassword}
                      onChange={(e) => { setBatchForm({ ...batchForm, confirmPassword: e.target.value }); setBatchPasswordError(''); }}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowManageBatchConfirmPassword(prev => !prev)}
                    >
                      {showManageBatchConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                  <th>Schedule</th>
                  <th>Branch Name</th>
                  <th>Student Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredBatchOptions(isSuper ? batchesBranchFilter : undefined, false).map((b) => {
                  const isDefault = DEFAULT_BATCH_OPTIONS.some(opt => opt.id === b.id);
                  const studentCount = students.filter(s =>
                    s.batch === b.id ||
                    (schedulesMatch(s.schedule, b.schedule) && !(s.batch && s.batch.toLowerCase().startsWith('batch')))
                  ).length;
                  const dispBranch = branches.find(br => br.toLowerCase() === b.branch.toLowerCase()) ||
                    (b.branch ? b.branch.charAt(0).toUpperCase() + b.branch.slice(1).toLowerCase() : 'Global');

                  return (
                    <tr key={b.id}>
                      <td data-label="Batch Name" style={{ fontWeight: 600, color: 'white' }}>{b.name}</td>
                      <td data-label="Schedule" style={{ color: 'var(--color-primary)' }}>{b.schedule}</td>
                      <td data-label="Branch Name" style={{ color: 'white' }}>{dispBranch}</td>
                      <td data-label="Student Count"><span className="badge badge-green">{studentCount} Students</span></td>
                      <td data-label="Status">
                        <span className={`badge ${b.status === 'Inactive' ? 'badge-red' : 'badge-green'}`}>
                          {b.status || 'Active'}
                        </span>
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
                                setEditBatchDays(parseScheduleToDays(b.schedule));
                                setNewBatchStartTimeField(b.startTime || '09:00');
                                setNewBatchEndTimeField(b.endTime || '10:30');
                                setEditBatchSlotType(b.slotType || 'Morning');
                                setEditBatchStatusField(b.status || 'Active');
                                setIsEditBatchModalOpen(true);
                                setEditBatchModalError('');
                                setEditBatchModalSuccess('');
                                setEditBatchSaving(false);
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
      // Branch and Batch filter scoping
      if (branchFilter && branchFilter !== 'All') {
        const branchKey = branchFilter.toLowerCase().trim();
        if (admin.branch && admin.branch.toLowerCase().trim() !== branchKey) return false;
      }
      if (batchFilter && batchFilter !== 'All') {
        const batchKey = batchFilter.toLowerCase().trim();
        if (admin.batch && admin.batch.toLowerCase().trim() !== batchKey) return false;
      }

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
                style={{ width: '160px', height: '38px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
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
                style={{ width: '160px', height: '38px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
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
                  <th>Branch / Batch / Schedule</th>
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
                      <td data-label="Branch / Batch / Schedule">
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{admin.branch || 'Global'}</span>
                          {(admin.role === 'trainer' || admin.role === 'coordinator') && admin.batch && (
                            (() => {
                              const batchObj = batchOptions.find(b => b.id.toLowerCase() === admin.batch.toLowerCase());
                              const batchDisp = batchObj ? `${batchObj.name} (${batchObj.schedule})` : admin.batch;
                              return <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '500', marginTop: '2px' }}>{batchDisp}</span>;
                            })()
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>ID: {admin.employeeId || 'N/A'}</span>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Assigned Branch</label>
                    <select
                      className="form-control"
                      value={newAdminForm.branch}
                      disabled={isBranchAdm}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, branch: e.target.value }))}
                      required
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
                  <div className="form-group">
                    <label>Assigned Batch</label>
                    <select
                      className="form-control"
                      value={newAdminForm.batch}
                      onChange={(e) => {
                        const selectedBatchVal = e.target.value;
                        const matched = modalBatches.find(b => b.code === selectedBatchVal);
                        setNewAdminForm(prev => ({
                          ...prev,
                          batch: selectedBatchVal,
                          schedule: matched ? matched.schedule : ''
                        }));
                      }}
                      required
                    >
                      {modalBatches.map(opt => (
                        <option key={opt.code} value={opt.code}>{opt.name} ({opt.schedule})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Batch Schedule</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAdminForm.schedule || ''}
                      readOnly
                      disabled
                      placeholder="Auto-derived from batch"
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Status</label>
                    <select
                      className="form-control"
                      value={newAdminForm.status || 'Active'}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, status: e.target.value }))}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Assigned Branch</label>
                    <select
                      className="form-control"
                      value={editingAdmin.branch || ''}
                      disabled={isBranchAdm}
                      onChange={(e) => setEditingAdmin(prev => ({ ...prev, branch: e.target.value }))}
                      required
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
                  <div className="form-group">
                    <label>Assigned Batch</label>
                    <select
                      className="form-control"
                      value={editingAdmin.batch || ''}
                      onChange={(e) => {
                        const selectedBatchVal = e.target.value;
                        const matched = modalBatches.find(b => b.code === selectedBatchVal);
                        setEditingAdmin(prev => ({
                          ...prev,
                          batch: selectedBatchVal,
                          schedule: matched ? matched.schedule : ''
                        }));
                      }}
                      required
                    >
                      {modalBatches.map(opt => (
                        <option key={opt.code} value={opt.code}>{opt.name} ({opt.schedule})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Batch Schedule</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingAdmin.schedule || ''}
                      readOnly
                      disabled
                      placeholder="Auto-derived from batch"
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Status</label>
                    <select
                      className="form-control"
                      value={editingAdmin.status || 'Active'}
                      onChange={(e) => setEditingAdmin(prev => ({ ...prev, status: e.target.value }))}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                      <option value="SoftDeleted">Soft Deleted</option>
                    </select>
                  </div>
                </div>

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


  const renderTrainerApprovals = () => {
    const isSuper = isAdminUser(loggedInUser);
    const isBranchAdm = isBranchAdmin(loggedInUser);
    const hasAccess = isSuper || isBranchAdm;

    if (!hasAccess) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Only administrators can access Trainer Approvals & Batch Allocation.</p>
        </div>
      );
    }

    const activeTrainers = (adminsList || []).filter(a => (a.role === 'trainer' || a.role === 'coordinator') && a.status === 'Active');

    const resolveBatchDisplayNames = (rawBatch) => {
      if (!rawBatch) return 'Unassigned';
      const parts = String(rawBatch).split(',').map(p => p.trim()).filter(Boolean);
      const names = parts.map(pt => {
        const ptLower = pt.toLowerCase();
        const opt = (batchOptions || []).find(b =>
          (b.id && String(b.id).toLowerCase() === ptLower) ||
          (b.code && String(b.code).toLowerCase() === ptLower) ||
          (b.name && String(b.name).toLowerCase() === ptLower)
        );
        if (opt) {
          return opt.schedule ? `${opt.name} (${opt.schedule})` : opt.name;
        }
        if (ptLower.startsWith('batch_')) {
          return 'Batch ' + pt.slice(6, 12);
        }
        if (ptLower.startsWith('batch')) {
          return 'Batch ' + pt.slice(5);
        }
        return pt;
      });
      return names.join(', ') || 'Unassigned';
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Banner Alert Feedback */}
        {trainerApprovalSuccess && (
          <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(48, 209, 88, 0.15)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30d158', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{trainerApprovalSuccess}</span>
          </div>
        )}
        {trainerApprovalError && (
          <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(255, 69, 58, 0.15)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#ff453a', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{trainerApprovalError}</span>
          </div>
        )}

        {/* Header Summary */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(10, 10, 15, 0.9))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={24} color="#FFD700" /> Trainer Approvals & Batch Allocation
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Approve new trainer registrations and allocate branches & batches.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="stat-card" style={{ padding: '0.75rem 1.25rem', minWidth: '130px', background: 'rgba(255, 215, 0, 0.08)', border: '1px solid rgba(255, 215, 0, 0.2)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#FFD700', fontWeight: 700, textTransform: 'uppercase' }}>Pending Requests</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>{pendingTrainers.length}</p>
              </div>
              <div className="stat-card" style={{ padding: '0.75rem 1.25rem', minWidth: '130px', background: 'rgba(48, 209, 88, 0.08)', border: '1px solid rgba(48, 209, 88, 0.2)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#30d158', fontWeight: 700, textTransform: 'uppercase' }}>Active Trainers</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>{activeTrainers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: PENDING TRAINER APPROVALS */}
        <div className="panel" style={{ borderRadius: '14px' }}>
          <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem' }}>
              <Bell size={18} color="#FFD700" /> Pending Account Registrations ({pendingTrainers.length})
            </h3>
            <button className="btn-outline-primary btn-small" onClick={loadPendingTrainers} disabled={loadingPendingTrainers}>
              {loadingPendingTrainers ? 'Refreshing...' : '🔄 Refresh List'}
            </button>
          </div>

          {loadingPendingTrainers ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading pending trainer registrations...</div>
          ) : pendingTrainers.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <CheckCircle size={32} style={{ color: '#30d158', marginBottom: '8px', opacity: 0.8 }} />
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>No Pending Registrations</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>All submitted trainer account requests have been reviewed.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table responsive-table-cards">
                <thead>
                  <tr>
                    <th>Trainer Details</th>
                    <th>Email & Contact</th>
                    <th>Requested Branch</th>
                    <th style={{ textAlign: 'center' }}>Approval & Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTrainers.map(trainer => {
                    return (
                      <tr key={trainer._id}>
                        <td data-label="Trainer Details">
                          <button
                            type="button"
                            onClick={() => setSelectedPendingTrainerForApproval(trainer)}
                            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', textDecoration: 'underline' }}>
                                {trainer.fullName || trainer.username}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#FFD700', fontWeight: 600 }}>
                                @{trainer.username}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                Registered: {new Date(trainer.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </button>
                        </td>
                        <td data-label="Email & Contact">
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', fontSize: '0.82rem' }}>
                            <span style={{ color: '#e2e8f0' }}>📧 {trainer.email || 'N/A'}</span>
                            <span style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>📞 {trainer.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="Requested Branch">
                          <span className="badge badge-gold" style={{ width: 'fit-content', padding: '4px 10px', fontSize: '0.75rem' }}>
                            📍 {trainer.branch || 'None Selected'}
                          </span>
                        </td>
                        <td data-label="Approval & Allocation">
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              className="btn-primary btn-small"
                              style={{ background: '#30d158', borderColor: '#30d158', padding: '6px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}
                              onClick={() => setSelectedPendingTrainerForApproval(trainer)}
                            >
                              🛡️ Review & Approve
                            </button>
                            <button
                              className="btn-danger btn-small"
                              style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}
                              onClick={() => handleRejectTrainer(trainer._id)}
                            >
                              ✕ Reject
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

        {/* DEDICATED PENDING TRAINER APPROVAL MODAL */}
        {selectedPendingTrainerForApproval && (() => {
          const trainer = selectedPendingTrainerForApproval;
          const cleanRequestedBranch = String(trainer.branch || '').split(',')[0].trim();
          const selBranch = approvalBranchSelections[trainer._id] || (cleanRequestedBranch && branches.includes(cleanRequestedBranch) ? cleanRequestedBranch : (branches[0] || 'Kuttiady'));
          const availableBatches = getFilteredBatchOptions(selBranch);
          const selBatch = approvalBatchSelections[trainer._id] || trainer.batch || (availableBatches[0] ? availableBatches[0].id : 'batch1');

          return (
            <div className="modal-overlay" style={{ zIndex: 1100 }}>
              <div className="modal-content" style={{ maxWidth: '520px', width: '95%', background: '#0e0f17', border: '1px solid var(--glass-border-gold)', borderRadius: '16px', padding: '1.75rem' }}>
                <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={18} color="#FFD700" /> Review Trainer Registration Request
                  </h3>
                  <button className="btn-icon" onClick={() => setSelectedPendingTrainerForApproval(null)}><X size={20} /></button>
                </div>

                {/* Trainer Info Card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
                    <div className="avatar" style={{ width: '44px', height: '44px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #FFD700, #b89600)', color: '#000', fontWeight: 'bold' }}>
                      {(trainer.fullName || trainer.username).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{trainer.fullName || trainer.username}</div>
                      <div style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 600 }}>@{trainer.username}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>📧 Email: <strong style={{ color: '#fff' }}>{trainer.email || 'N/A'}</strong></div>
                    <div>📞 Phone: <strong style={{ color: '#fff' }}>{trainer.phone || 'N/A'}</strong></div>
                    <div>🏢 Requested Branch: <strong style={{ color: '#FFD700' }}>{trainer.branch || 'None Selected'}</strong></div>
                    <div>📅 Date: <strong style={{ color: '#fff' }}>{new Date(trainer.createdAt).toLocaleDateString()}</strong></div>
                  </div>
                </div>

                {/* Allocation Controls Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>Allocate Branch *</label>
                    <select
                      className="form-control"
                      style={{ width: '100%', height: '40px', background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}
                      value={selBranch}
                      onChange={(e) => {
                        const newBr = e.target.value;
                        setApprovalBranchSelections(prev => ({ ...prev, [trainer._id]: newBr }));
                        const bOpts = getFilteredBatchOptions(newBr);
                        if (bOpts[0]) {
                          setApprovalBatchSelections(prev => ({ ...prev, [trainer._id]: bOpts[0].id }));
                        }
                      }}
                    >
                      {branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>Allocate Batch *</label>
                    <select
                      className="form-control"
                      style={{ width: '100%', height: '40px', background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}
                      value={selBatch}
                      onChange={(e) => {
                        const newBt = e.target.value;
                        setApprovalBatchSelections(prev => ({ ...prev, [trainer._id]: newBt }));
                      }}
                    >
                      {availableBatches.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name} ({opt.schedule})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-danger btn-small"
                      style={{ padding: '8px 14px' }}
                      onClick={() => {
                        handleRejectTrainer(trainer._id);
                        setSelectedPendingTrainerForApproval(null);
                      }}
                    >
                      ✕ Reject Request
                    </button>
                    <button
                      type="button"
                      className="btn-primary btn-small"
                      style={{ background: '#30d158', borderColor: '#30d158', padding: '8px 16px', fontWeight: 700 }}
                      onClick={() => {
                        handleApproveTrainer(trainer._id);
                        setSelectedPendingTrainerForApproval(null);
                      }}
                    >
                      ✓ Approve & Allocate Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SECTION 2: ACTIVE TRAINERS & BATCH ALLOCATION MATRIX */}
        <div className="panel" style={{ borderRadius: '14px' }}>
          <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem' }}>
              <Users size={18} color="var(--color-primary)" /> Active Trainers Batch Allocation ({activeTrainers.length})
            </h3>
          </div>

          <div className="table-responsive">
            <table className="data-table responsive-table-cards">
              <thead>
                <tr>
                  <th>Trainer Name / Username</th>
                  <th>Contact Info</th>
                  <th>Assigned Branch</th>
                  <th>Assigned Batch</th>
                  <th style={{ textAlign: 'center' }}>Allocation & Profile</th>
                </tr>
              </thead>
              <tbody>
                {activeTrainers.length > 0 ? activeTrainers.map(tr => {
                  const currBr = tr.branch || 'Kuttiady';
                  const currBt = tr.batch || 'batch1';

                  return (
                    <tr key={tr._id}>
                      <td data-label="Trainer Name / Username">
                        <button
                          type="button"
                          onClick={() => setSelectedTrainerForAllocation(tr)}
                          style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', textDecoration: 'underline' }}>
                              {tr.fullName || tr.username}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)' }}>
                              @{tr.username}
                            </span>
                          </div>
                        </button>
                      </td>
                      <td data-label="Contact Info">
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          <span>{tr.email || 'No email'}</span>
                          <span>{tr.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td data-label="Assigned Branch">
                        <span className="badge badge-blue" style={{ fontSize: '0.75rem', padding: '4px 10px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }} title={currBr}>
                          {Array.from(new Set(String(currBr).split(',').map(s => s.trim()))).join(', ')}
                        </span>
                      </td>
                      <td data-label="Assigned Batch">
                        <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '4px 10px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }} title={resolveBatchDisplayNames(currBt)}>
                          {resolveBatchDisplayNames(currBt)}
                        </span>
                      </td>
                      <td data-label="Allocation & Profile" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="btn-primary btn-small"
                            style={{ padding: '6px 14px', fontWeight: 600, whiteSpace: 'nowrap', background: 'rgba(229, 9, 20, 0.2)', border: '1px solid rgba(229, 9, 20, 0.4)', color: '#fff' }}
                            onClick={() => setSelectedTrainerForAllocation(tr)}
                          >
                            ⚙️ Edit Allocation
                          </button>
                          <button
                            type="button"
                            className="btn-secondary btn-small"
                            style={{
                              padding: '6px 10px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              color: '#ef4444',
                              cursor: 'pointer'
                            }}
                            title="Delete Trainer Account"
                            onClick={() => setTrainerToDeleteConfirm(tr)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                      No active trainers currently found in system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DEDICATED TRAINER PROFILE & ALLOCATION MODAL */}
        {selectedTrainerForAllocation && (() => {
          const tr = selectedTrainerForAllocation;
          const currBr = tr.branch || 'Kuttiady';
          const currBt = tr.batch || 'batch1';
          const cleanBr = String(currBr || '').split(',')[0].trim();
          const selBr = activeTrainerBranchSelections[tr._id] || (cleanBr && branches.includes(cleanBr) ? cleanBr : (branches[0] || 'Kuttiady'));
          const availableBatches = getFilteredBatchOptions(selBr);
          const selBt = activeTrainerBatchSelections[tr._id] || (currBr === selBr ? currBt : (availableBatches[0] ? availableBatches[0].id : 'batch1'));

          return (
            <div className="modal-overlay" style={{ zIndex: 1100 }}>
              <div className="modal-content" style={{ maxWidth: '520px', width: '95%', background: '#0e0f17', border: '1px solid var(--glass-border-red)', borderRadius: '16px', padding: '1.75rem' }}>
                <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="var(--color-primary)" /> Trainer Allocation Details
                  </h3>
                  <button className="btn-icon" onClick={() => setSelectedTrainerForAllocation(null)}><X size={20} /></button>
                </div>

                {/* Trainer Profile Card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
                    <div className="avatar" style={{ width: '44px', height: '44px', fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--color-primary), #900)' }}>
                      {(tr.fullName || tr.username).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{tr.fullName || tr.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>@{tr.username}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>📧 Email: <strong style={{ color: '#fff' }}>{tr.email || 'N/A'}</strong></div>
                    <div>📞 Phone: <strong style={{ color: '#fff' }}>{tr.phone || 'N/A'}</strong></div>
                  </div>
                </div>

                {/* Current Allocation Card */}
                <div style={{ background: 'rgba(229, 9, 20, 0.08)', border: '1px solid rgba(229, 9, 20, 0.25)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Current Active Allocation</span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="badge badge-blue" style={{ padding: '4px 10px' }}>📍 Branch: {currBr}</span>
                    <span className="badge badge-purple" style={{ padding: '4px 10px' }}>
                      🥋 Batch: {resolveBatchDisplayNames(currBt)}
                    </span>
                  </div>
                </div>

                {/* Edit Allocation Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>Re-allocate Branch</label>
                    <select
                      className="form-control"
                      style={{ width: '100%', height: '40px', background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}
                      value={selBr}
                      onChange={(e) => {
                        const newBr = e.target.value;
                        setActiveTrainerBranchSelections(prev => ({ ...prev, [tr._id]: newBr }));
                        const bOpts = getFilteredBatchOptions(newBr);
                        if (bOpts[0]) {
                          setActiveTrainerBatchSelections(prev => ({ ...prev, [tr._id]: bOpts[0].id }));
                        }
                      }}
                    >
                      {branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>Re-allocate Batch</label>
                    <select
                      className="form-control"
                      style={{ width: '100%', height: '40px', background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}
                      value={selBt}
                      onChange={(e) => {
                        const newBt = e.target.value;
                        setActiveTrainerBatchSelections(prev => ({ ...prev, [tr._id]: newBt }));
                      }}
                    >
                      {availableBatches.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name} ({opt.schedule})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={() => setTrainerToDeleteConfirm(tr)}
                    >
                      <Trash2 size={15} /> Delete Account
                    </button>
                    <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                      <button type="button" className="btn-secondary" onClick={() => setSelectedTrainerForAllocation(null)}>Cancel</button>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ fontWeight: 700 }}
                        onClick={() => {
                          handleReallocateBatch(tr._id, currBr, currBt);
                          setSelectedTrainerForAllocation(null);
                        }}
                      >
                        ✓ Save Allocation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODERN TRAINER DELETE CONFIRMATION MODAL */}
        {trainerToDeleteConfirm && (
          <div className="modal-overlay" style={{ zIndex: 12000 }} onClick={() => setTrainerToDeleteConfirm(null)}>
            <div
              className="modal-content"
              style={{
                maxWidth: '500px',
                width: '92%',
                background: 'linear-gradient(145deg, #181c2b 0%, #0d0f18 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 24px 60px rgba(0,0,0,0.95), 0 0 0 1px rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(20px)',
                boxSizing: 'border-box'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Icon & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={24} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                    Remove Trainer Access
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⚠️ Disable Login Access
                  </span>
                </div>
              </div>

              {/* Trainer Profile Summary */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div className="avatar" style={{ width: '42px', height: '42px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #e50914, #7f1d1d)', flexShrink: 0 }}>
                  {(trainerToDeleteConfirm.fullName || trainerToDeleteConfirm.username).charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trainerToDeleteConfirm.fullName || trainerToDeleteConfirm.username}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                    @{trainerToDeleteConfirm.username}
                  </div>
                </div>
                <span className="badge badge-red" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                  {trainerToDeleteConfirm.branch || 'Trainer'}
                </span>
              </div>

              {/* Database Data Preservation Assurance Card */}
              <div style={{
                background: '#0d101a',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🔒</span>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#4ade80' }}>
                      Historical Class & Attendance Data Preserved
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.45', marginTop: '2px' }}>
                      All past class details and student attendance entries taken by this trainer will remain <strong>100% saved in the database</strong>.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '1.1rem' }}>🚫</span>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ef4444' }}>
                      Trainer Login Disabled
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.45', marginTop: '2px' }}>
                      Login credentials will be revoked immediately and active sessions logged out.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem' }}
                  onClick={() => setTrainerToDeleteConfirm(null)}
                  disabled={deletingTrainerLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)',
                    border: 'none',
                    padding: '0.65rem 1.4rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 16px rgba(229, 9, 20, 0.4)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  disabled={deletingTrainerLoading}
                  onClick={() => handleConfirmDeleteTrainer(trainerToDeleteConfirm)}
                >
                  {deletingTrainerLoading ? 'Disabling Access...' : '✓ Confirm & Disable Login'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSectionMaintenance = (sectionName) => (
    <div className="glass-panel text-center" style={{ padding: '3rem', margin: '2rem auto', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(255, 159, 10, 0.2)' }}>
      <div style={{ background: 'rgba(255, 159, 10, 0.1)', padding: '1rem', borderRadius: '50%' }}>
        <AlertTriangle size={48} color="#ff9f0a" className="pulse-icon" />
      </div>
      <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>Section Under Maintenance</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
        The <strong>{sectionName}</strong> is temporarily disabled for maintenance. The developers are working to update this section. Please try again later.
      </p>
      {maintenanceEnd && (
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
          Expected back online: <strong style={{ color: '#ff9f0a' }}>{formatMaintenanceTime(maintenanceEnd)}</strong>
        </span>
      )}
    </div>
  );

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
          setSettingsSuccess(`Branch Trainer credentials for "${br.toUpperCase()}" updated successfully!`);
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

    const handleToggleAllowBranchAdminChangeBelt = (val) => {
      setSettingsError('');
      setSettingsSuccess('');
      fetch(`${API_BASE_URL}/system-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowBranchAdminChangeBelt: val })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update system setting');
          return res.json();
        })
        .then(data => {
          setAllowBranchAdminChangeBelt(!!data.allowBranchAdminChangeBelt);
          setSettingsSuccess('Grading system settings updated successfully!');
        })
        .catch(err => {
          setSettingsError('Error updating setting: ' + err.message);
        });
    };

    return (
      <div className="settings-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {settingsError && <div style={{ color: '#E50914', marginBottom: '1.5rem', background: 'rgba(229, 9, 20, 0.1)', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.3)', fontWeight: 500 }}>{settingsError}</div>}
        {settingsSuccess && <div style={{ color: '#4CAF50', marginBottom: '1.5rem', background: 'rgba(76, 175, 80, 0.1)', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(76, 175, 80, 0.3)', fontWeight: 500 }}>{settingsSuccess}</div>}

        {isSuper && (
          <>
            {/* Grading System Settings */}
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header" style={{ marginBottom: '1rem' }}>
                <h3 className="panel-title">Grading System Settings</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                  <input
                    type="checkbox"
                    checked={allowBranchAdminChangeBelt}
                    onChange={(e) => handleToggleAllowBranchAdminChangeBelt(e.target.checked)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <span>Allow Branch Admins to manually change student Present Grad level and Join Date</span>
                </label>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  By default, Branch Admins can only change a student's grade level by conducting grading tests (marking Pass). When this option is enabled, Branch Admins can also manually override the Present Grad level and Join Date inside the Student Grading Edit form.
                </p>
              </div>
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
        <div className={`glass-panel login-card-animated ${isLoggingIn ? 'submitting' : ''}`} style={{
          zIndex: 1,
          padding: '2rem 2.25rem',
          width: '100%',
          maxWidth: '460px',
          textAlign: 'center',
          background: 'rgba(10, 10, 18, 0.92)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(229, 9, 20, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(229, 9, 20, 0.12)'
        }}>
          <h2 className="brand animate-item-1" style={{ justifyContent: 'center', marginBottom: '0.2rem', fontSize: '1.95rem', letterSpacing: '0.5px' }}>
            <span className="brand-accent">MASTER</span> FIT
          </h2>
          <p className="animate-item-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginBottom: '1.25rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Academy Branch & Batch Portal
          </p>

          {!isForgotPassword && (
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '5px',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: loginTab === 'login' ? 'linear-gradient(135deg, #E50914, #B20710)' : 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: loginTab === 'login' ? '0 4px 14px rgba(229, 9, 20, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={() => { setLoginTab('login'); setTrainerRegError(''); setTrainerRegSuccess(''); setLoginError(''); }}
              >
                <Lock size={14} /> Sign In
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: loginTab === 'register' ? 'linear-gradient(135deg, #E50914, #B20710)' : 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: loginTab === 'register' ? '0 4px 14px rgba(229, 9, 20, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={() => { setLoginTab('register'); setTrainerRegError(''); setTrainerRegSuccess(''); setLoginError(''); }}
              >
                <UserPlus size={14} /> Trainer Sign Up
              </button>
            </div>
          )}

          {isForgotPassword ? (
            <>
              <p className="animate-item-3" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>If you forgot your password, please contact the administrator via WhatsApp.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(() => {
                  const batchObj = batchOptions.find(b => b.id === selectedBatchLogin);
                  const batchName = selectedBatchLogin === 'admin'
                    ? 'Branch Admin (All Batches)'
                    : (batchObj ? `${batchObj.name} (${batchObj.schedule})` : selectedBatchLogin);
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
          ) : loginTab === 'register' ? (
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.2rem', textAlign: 'center' }}>Trainer Sign Up</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginBottom: '1rem', textAlign: 'center' }}>
                Register your account. Super Admin approval required before login.
              </p>

              {trainerRegSuccess && (
                <div style={{ color: '#30d158', marginBottom: '1rem', background: 'rgba(48, 209, 88, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(48, 209, 88, 0.3)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                  ✓ {trainerRegSuccess}
                </div>
              )}
              {trainerRegError && (
                <div style={{ color: '#E50914', marginBottom: '1rem', background: 'rgba(229, 9, 20, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(229, 9, 20, 0.3)', fontSize: '0.82rem' }}>
                  ⚠️ {trainerRegError}
                </div>
              )}

              <form onSubmit={handleTrainerRegistration}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter full name"
                    value={trainerRegForm.fullName}
                    onChange={(e) => setTrainerRegForm({ ...trainerRegForm, fullName: e.target.value })}
                    required
                    style={{ height: '36px' }}
                  />
                </div>

                <div className="grid-2-col" style={{ gap: '8px' }}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Username *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username"
                      value={trainerRegForm.username}
                      onChange={(e) => setTrainerRegForm({ ...trainerRegForm, username: e.target.value.toLowerCase().trim() })}
                      required
                      style={{ height: '36px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Mobile Phone *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10-digit number"
                      maxLength="10"
                      value={trainerRegForm.phone}
                      onChange={(e) => setTrainerRegForm({ ...trainerRegForm, phone: e.target.value.replace(/\D/g, '') })}
                      required
                      style={{ height: '36px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="trainer@example.com"
                    value={trainerRegForm.email}
                    onChange={(e) => setTrainerRegForm({ ...trainerRegForm, email: e.target.value.trim() })}
                    required
                    style={{ height: '36px' }}
                  />
                </div>

                <div className="grid-2-col" style={{ gap: '8px' }}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={trainerRegForm.password}
                      onChange={(e) => setTrainerRegForm({ ...trainerRegForm, password: e.target.value })}
                      required
                      style={{ height: '36px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm password"
                      value={trainerRegForm.confirmPassword}
                      onChange={(e) => setTrainerRegForm({ ...trainerRegForm, confirmPassword: e.target.value })}
                      required
                      style={{ height: '36px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Preferred Branch *</label>
                  <select
                    className="form-control"
                    value={trainerRegForm.preferredBranch || branches[0]}
                    onChange={(e) => setTrainerRegForm({ ...trainerRegForm, preferredBranch: e.target.value, preferredBatch: '' })}
                    style={{ height: '38px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}
                  >
                    {branches.map(b => (
                      <option key={b} value={b} style={{ background: '#1a1a1a', color: '#fff' }}>{b}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', height: '38px', fontWeight: 700 }}
                  disabled={isSubmittingTrainerReg}
                >
                  {isSubmittingTrainerReg ? 'Submitting Registration...' : 'Submit Trainer Registration'}
                </button>
              </form>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn-outline-primary"
                  style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent', fontSize: '0.85rem' }}
                  onClick={() => setLoginTab('login')}
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
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
                    onChange={(e) => {
                      setSelectedBranchLogin(e.target.value);
                      setSelectedBatchLogin('admin');
                    }}
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
                      <option key={opt.id} value={opt.id} style={{ background: '#1a1a1a', color: '#ffffff' }}>{opt.name} ({opt.schedule})</option>
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
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className="form-control form-control-animated"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      disabled={isLoggingIn}
                      required
                      style={{ height: '38px', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      onClick={() => setShowLoginPassword(prev => !prev)}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                setNewStudent({ name: '', age: '', dob: '', phone: '', parentPhone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: selectedBranchLogin, photo: null, trainer: '', art: '' });
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
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSuperadminLoginPassword ? "text" : "password"}
                    className="form-control form-control-animated"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    disabled={isLoggingIn}
                    required
                    style={{ height: '38px', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    onClick={() => setShowSuperadminLoginPassword(prev => !prev)}
                  >
                    {showSuperadminLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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

  const renderDeveloperLogin = () => {
    const handleDevLoginSubmit = (e) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setLoginError('');

      const usernameLower = loginData.username.toLowerCase().trim();
      const enteredPassword = loginData.password;

      let devName = '';
      if (navigator.userAgentData) {
        try {
          navigator.userAgentData.getHighEntropyValues(['model']).then(uaData => {
            if (uaData && uaData.model) devName = uaData.model;
          });
        } catch (err) { }
      }

      fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginType: 'developer',
          username: usernameLower,
          password: enteredPassword,
          deviceName: devName
        })
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(errData => {
              throw new Error(errData.error || 'Invalid developer credentials');
            });
          }
          return res.json();
        })
        .then(data => {
          setIsLoggingIn(false);
          if (data.success && data.role === 'developer') {
            setLoginError('');
            setLoggedInUser(data.username);
            setSession(data.username, data.token, data.role, data.branch, data.batch);
            setUserRole(data.role || '');
            setUserBranch(data.branch || '');
            setUserBatch(data.batch || '');
            setUserLoginCount(data.loginCount);
            setLoginData({ username: '', password: '' });
            window.location.hash = '#/developer/dashboard';
          } else {
            setLoginError('Access denied: You are not authorized as a developer.');
            setIsLoggingIn(false);
          }
        })
        .catch(err => {
          setIsLoggingIn(false);
          setLoginError(err.message || 'Developer login failed');
        });
    };

    return (
      <div className="login-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflowY: 'auto', padding: '1rem 0.5rem' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,10,5,0.92)' }}></div>
        <div className="login-grid-overlay" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,255,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="login-bg-glows">
          <div className="login-glow-1" style={{ background: 'rgba(0, 255, 100, 0.15)' }}></div>
        </div>
        <div className="glass-panel login-card-animated" style={{ zIndex: 1, padding: '1.5rem 2rem', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(0, 255, 100, 0.2)', boxShadow: '0 8px 32px 0 rgba(0, 255, 0, 0.1)' }}>
          <h2 className="brand animate-item-1" style={{ justifyContent: 'center', marginBottom: '0.25rem', fontSize: '1.8rem', color: '#00ff66', fontFamily: 'monospace' }}>
            &lt;DEV_PORTAL&gt;
          </h2>
          <p className="animate-item-2" style={{ color: 'rgba(0, 255, 100, 0.7)', fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace' }}>Restricted System Control</p>

          {loginError && <div style={{ color: '#ff453a', marginBottom: '1rem', background: 'rgba(255, 69, 58, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255, 69, 58, 0.3)', fontSize: '0.85rem' }}>{loginError}</div>}

          <form onSubmit={handleDevLoginSubmit}>
            <div className="form-group animate-item-3" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
              <label style={{ marginBottom: '0.25rem', fontSize: '0.85rem', color: 'rgba(0, 255, 100, 0.8)', fontFamily: 'monospace' }}>Developer Username</label>
              <input type="text" className="form-control" placeholder="developer" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} disabled={isLoggingIn} required style={{ height: '38px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,100,0.3)', color: '#00ff66', fontFamily: 'monospace' }} />
            </div>
            <div className="form-group animate-item-4" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <label style={{ marginBottom: '0.25rem', fontSize: '0.85rem', color: 'rgba(0, 255, 100, 0.8)', fontFamily: 'monospace' }}>System Key (Password)</label>
              <input type="password" className="form-control" placeholder="••••••••" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} disabled={isLoggingIn} required style={{ height: '38px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,100,0.3)', color: '#00ff66', fontFamily: 'monospace' }} />
            </div>
            <button type="submit" className="btn-primary animate-item-5" style={{ width: '100%', justifyContent: 'center', height: '38px', background: '#00ff66', color: '#000', fontWeight: 'bold', border: 'none', fontFamily: 'monospace' }} disabled={isLoggingIn}>
              {isLoggingIn ? "DECRYPTING..." : "ENTER PORTAL"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const isMaintenanceBlocked = () => {
    if (!loggedInUser) {
      return false;
    }
    if (isSystemUnderMaintenance) {
      if (userRole === 'developer') {
        return false;
      }
      const mode = maintenanceMode;
      if (mode === 'all') return true;

      const isAd = userRole === 'superadmin';
      const isBr = userRole === 'branchadmin';
      const isTr = userRole === 'trainer' || userRole === 'coordinator';

      if (mode === 'admin' && isAd) return true;
      if (mode === 'branch' && isBr) return true;
      if (mode === 'batch' && isTr) return true;

      if (mode === 'branch-batch' && (isBr || isTr)) return true;
      if (mode === 'batch-admin' && (isTr || isAd)) return true;
      if (mode === 'admin-branch' && (isAd || isBr)) return true;
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
            background: 'rgba(229, 9, 20, 0.15)',
            border: '2px solid var(--color-primary)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <AlertTriangle size={40} className="pulse-icon" />
          </div>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
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


  if (appMode === 'website') {
    return renderPublic();
  }

  if (appMode === 'about') {
    return renderAboutPage();
  }

  if (appMode === 'branches') {
    return renderPublicBranchesPage();
  }

  if (appMode === 'login') {
    return renderLogin();
  }

  if (appMode === 'superadmin-login') {
    return renderSuperAdminLogin();
  }

  if (appMode === 'developer-login') {
    return renderDeveloperLogin();
  }

  if (appMode === 'developer') {
    return renderDeveloperPanel();
  }





  const metrics = getDynamicMetrics();
  return (
    <div className="dashboard-container">
      {/* Sidebar drawer backdrop for mobile */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="brand" style={{ cursor: 'pointer', fontSize: '1.25rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }} onClick={() => setAppMode('website')}>
            <span className="brand-accent">MASTER</span> FIT <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500, marginLeft: '2px' }}>Admin</span>
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
          {(userRole === 'superadmin' || userRole === 'developer' || userRole === 'branchadmin') && (
            <a className={`nav-item ${currentView === 'performance' ? 'active' : ''}`} onClick={() => setCurrentView('performance')}>
              <TrendingUp className="nav-icon" /> <span>Performance</span>
            </a>
          )}
          {(userRole === 'superadmin' || userRole === 'developer' || userRole === 'branchadmin' || userRole === 'trainer') && (
            <a className={`nav-item ${currentView === 'grading' ? 'active' : ''}`} onClick={() => { setCurrentView('grading'); fetchGradingStudents(); }}>
              <Award className="nav-icon" /> <span>Grading</span>
            </a>
          )}
          {(userRole === 'superadmin' || userRole === 'developer' || userRole === 'branchadmin') && (
            <a
              className={`nav-item ${currentView === 'announcements' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('announcements');
                loadNotifications();
              }}
            >
              <Megaphone className="nav-icon" /> <span>Announcements</span>
              {unreadNotificationsCount > 0 && (
                <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </a>
          )}
          <div style={{ flex: 1 }}></div>
          {(isAdminUser(loggedInUser) || isBranchAdmin(loggedInUser)) && (
            <>
              <a className={`nav-item ${currentView === 'trainer-approvals' ? 'active' : ''}`} onClick={() => { setCurrentView('trainer-approvals'); loadPendingTrainers(); }}>
                <Shield className="nav-icon" /> <span>Trainer Approvals</span>
                {pendingTrainers.length > 0 && (
                  <span className="badge badge-gold" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>
                    {pendingTrainers.length}
                  </span>
                )}
              </a>
              <a className={`nav-item ${currentView === 'credentials-list' ? 'active' : ''}`} onClick={() => setCurrentView('credentials-list')}>
                <Lock className="nav-icon" /> <span>Branch & Batch Mapping</span>
              </a>
            </>
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

        <header className="header" style={{ position: 'relative', zIndex: 10000, overflow: 'visible' }}>
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
                {currentView === 'trainer-approvals' && 'Trainer Approvals & Batch Allocation'}
                {currentView === 'grading' && (userRole === 'trainer' ? 'Student Test Evaluation' : 'Student Belt & Level Test')}
                {currentView === 'announcements' && 'Announcements & Notifications'}
              </h1>
            </div>

            <div className="user-profile-mobile">
              <div className="avatar" title={`${loggedInUser} Panel`}>{loggedInUser.charAt(0).toUpperCase()}</div>
            </div>
          </div>

          {!(currentView === 'grading' || currentView === 'announcements' || currentView === 'settings' || currentView === 'credentials-list' || currentView === 'trainer-approvals' || currentView === 'performance' || currentView === 'attendance') && (
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
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
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
              <div>
                <input
                  type="text"
                  placeholder="Search students..."
                  className="form-control"
                  style={{ width: '180px', height: '38px', paddingTop: 0, paddingBottom: 0, fontSize: '0.85rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="header-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
            {/* Notification Bell Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                style={{
                  background: showNotificationsDropdown ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: showNotificationsDropdown ? '1px solid rgba(229, 9, 20, 0.4)' : '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                title="Notifications & Announcements"
              >
                <Bell size={19} className={unreadNotificationsCount > 0 ? "shake-icon" : ""} color={unreadNotificationsCount > 0 ? "#FFD700" : "#fff"} />
                {unreadNotificationsCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#E50914',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    padding: '2px 6px',
                    lineHeight: 1,
                    boxShadow: '0 2px 8px rgba(229, 9, 20, 0.6)'
                  }}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <>
                  {/* Click Outside Overlay to Close */}
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                    onClick={() => setShowNotificationsDropdown(false)}
                  />

                  {/* Dropdown Container */}
                  <div className="notifications-dropdown-menu">
                    {/* Header */}
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'nowrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={16} color="#E50914" />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>Announcements</span>
                      </div>
                      {unreadNotificationsCount > 0 ? (
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '2px 8px', whiteSpace: 'nowrap' }}>
                          {unreadNotificationsCount} UNREAD
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>All caught up</span>
                      )}
                    </div>

                    {/* Notification List */}
                    <div style={{ overflowY: 'auto', flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          <Bell size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                          <div>No announcements at the moment.</div>
                        </div>
                      ) : (
                        notifications.map(n => {
                          const currentUserClean = getSessionUser() ? getSessionUser().toLowerCase().trim() : '';
                          const isRead = n.readBy && n.readBy.includes(currentUserClean);
                          const cleanTitle = (n.title || '').trim();
                          const hasEmojiPrefix = cleanTitle.startsWith('📢') || cleanTitle.startsWith('📣') || cleanTitle.startsWith('🔔') || cleanTitle.startsWith('⚠️') || cleanTitle.startsWith('🥋') || cleanTitle.startsWith('💼');

                          return (
                            <div
                              key={n._id}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: isRead ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(229, 9, 20, 0.45)',
                                borderLeft: isRead ? '4px solid rgba(255, 255, 255, 0.25)' : '4px solid #E50914',
                                background: isRead
                                  ? '#161927'
                                  : 'linear-gradient(135deg, #24141d 0%, #171b2a 100%)',
                                boxShadow: isRead ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.5)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                boxSizing: 'border-box',
                                width: '100%'
                              }}
                            >
                              {/* Title & Priority Row */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                  {!hasEmojiPrefix && <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>📢</span>}
                                  <span style={{
                                    fontWeight: isRead ? 600 : 700,
                                    fontSize: '0.875rem',
                                    color: isRead ? '#e2e8f0' : '#ffffff',
                                    lineHeight: '1.35',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'anywhere'
                                  }}>
                                    {cleanTitle}
                                  </span>
                                </div>
                                {n.priority && (
                                  <span className="badge" style={{
                                    background: n.priority === 'high' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                                    color: n.priority === 'high' ? '#ef4444' : '#cbd5e1',
                                    border: n.priority === 'high' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                                    fontSize: '0.625rem',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {n.priority}
                                  </span>
                                )}
                              </div>

                              {/* Message Body */}
                              <div style={{
                                background: '#0d0f19',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.06)'
                              }}>
                                <p style={{
                                  margin: 0,
                                  fontSize: '0.78rem',
                                  color: '#cbd5e1',
                                  lineHeight: '1.45',
                                  whiteSpace: 'pre-wrap',
                                  textAlign: 'left',
                                  wordBreak: 'break-word'
                                }}>
                                  {n.message}
                                </p>
                              </div>

                              {/* Footer Details & Read Action */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '2px',
                                fontSize: '0.72rem',
                                color: 'var(--color-text-muted)',
                                flexWrap: 'wrap',
                                gap: '6px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>🗓️ {new Date(n.createdAt).toLocaleDateString()}</span>
                                  {n.sender && (
                                    <>
                                      <span>•</span>
                                      <span>👤 {n.sender}</span>
                                    </>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  style={{
                                    background: isRead ? 'rgba(255, 255, 255, 0.08)' : 'rgba(56, 189, 248, 0.18)',
                                    border: isRead ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(56, 189, 248, 0.4)',
                                    color: isRead ? '#94a3b8' : '#38bdf8',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    whiteSpace: 'nowrap',
                                    marginLeft: 'auto',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isRead) {
                                      handleMarkAsUnread(n._id);
                                    } else {
                                      handleMarkAsRead(n._id);
                                    }
                                  }}
                                >
                                  {isRead ? 'Mark Unread' : '✓ Mark Read'}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
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
            lockDashboardPage && userRole !== 'developer' ? renderSectionMaintenance('Dashboard') : (
              <>
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  {/* Card 1: Active Students */}
                  <div className="stat-card" style={{ borderTop: '3px solid #E50914' }}>
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(229, 9, 20, 0.12)', borderColor: 'rgba(229, 9, 20, 0.25)' }}>
                      <Users className="stat-icon" style={{ color: '#E50914' }} />
                    </div>
                    <div className="stat-details" style={{ minWidth: 0, overflow: 'hidden' }}>
                      <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Active Students</h3>
                      <p className="stat-value" style={{ whiteSpace: 'nowrap' }}>{metrics.totalStudents}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Across enrolled batches
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Today's Attendance */}
                  <div className="stat-card" style={{ cursor: 'pointer', borderTop: '3px solid #4CAF50' }} onClick={() => setCurrentView('attendance')}>
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.25)' }}>
                      <Activity className="stat-icon" style={{ color: '#4CAF50' }} />
                    </div>
                    <div className="stat-details" style={{ minWidth: 0, overflow: 'hidden' }}>
                      <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Today's Attendance</h3>
                      <p className="stat-value" style={{ color: '#4CAF50', whiteSpace: 'nowrap' }}>
                        {metrics.presentToday} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ {metrics.presentToday + metrics.absentToday}</span>
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '1px 5px', whiteSpace: 'nowrap' }}>{metrics.attendancePercentage}% Rate</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{metrics.absentToday} Absent</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Fee Collection */}
                  <div className="stat-card" style={{ cursor: 'pointer', borderTop: '3px solid #FFD700' }} onClick={() => setCurrentView('reminders')}>
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 215, 0, 0.12)', borderColor: 'rgba(255, 215, 0, 0.25)' }}>
                      <Wallet className="stat-icon" style={{ color: '#FFD700' }} />
                    </div>
                    <div className="stat-details" style={{ minWidth: 0, overflow: 'hidden' }}>
                      <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Fee Collection</h3>
                      <p className="stat-value" style={{ color: '#FFD700', whiteSpace: 'nowrap' }}>
                        ₹{metrics.feeCollection}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: metrics.pendingFees > 0 ? '#ff9f0a' : 'var(--color-text-muted)', whiteSpace: 'nowrap', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Pending: ₹{metrics.pendingFees}
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Live Classes */}
                  <div className="stat-card" style={{ cursor: 'pointer', borderTop: '3px solid #9C27B0' }} onClick={() => {
                    const classesEl = document.getElementById('today-classes-panel');
                    if (classesEl) classesEl.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(156, 39, 176, 0.12)', borderColor: 'rgba(156, 39, 176, 0.25)' }}>
                      <CalendarDays className="stat-icon" style={{ color: '#c084fc' }} />
                    </div>
                    <div className="stat-details" style={{ minWidth: 0, overflow: 'hidden' }}>
                      <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Live Classes Today</h3>
                      <p className="stat-value" style={{ color: '#c084fc', whiteSpace: 'nowrap' }}>
                        {metrics.filteredClasses.filter(c => c.status !== 'cancelled').length} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Scheduled</span>
                      </p>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {metrics.filteredClasses.filter(c => c.status !== 'cancelled').length > 0
                          ? `Next: ${metrics.filteredClasses.filter(c => c.status !== 'cancelled')[0].className} (${metrics.filteredClasses.filter(c => c.status !== 'cancelled')[0].startTime})`
                          : 'No active classes remaining'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Student Details Panel */}
                <div className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 className="panel-title" style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#fff' }}>Students List</h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total {searchedStudents.length} Students Listed</span>
                    </div>
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
                        batch: firstBatch ? firstBatch.id : 'Morning',
                        photo: null,
                        trainer: firstBatch ? firstBatch.trainer || '' : '',
                        art: ''
                      });
                      setIsAddModalOpen(true);
                    }}>
                      <UserPlus size={15} /> Add Student
                    </button>
                  </div>

                  {searchedStudents.length > 0 ? (
                    <div className="premium-table-container" style={{ border: 'none', background: 'transparent' }}>
                      <table className="premium-table responsive-table-cards">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Batch Schedule</th>
                            <th>Belt Rank</th>
                            <th>Contact</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchedStudents.map(student => {
                            const initials = (student.studentName || student.name || 'S').split(' ').map(n => n[0]).slice(0, 2).join('');

                            return (
                              <tr key={student.id}>
                                <td data-label="Student">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {student.photo ? (
                                      <img src={student.photo} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.15)' }} />
                                    ) : (
                                      <div className="student-avatar-badge">{initials}</div>
                                    )}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => handleSelectStudent(student)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          padding: 0,
                                          fontWeight: 700,
                                          color: student.status === 'Inactive' ? 'var(--color-text-muted)' : '#ffffff',
                                          cursor: 'pointer',
                                          fontFamily: 'inherit',
                                          fontSize: '0.9rem',
                                          textAlign: 'left',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                      >
                                        {renderHighlightedName(student.studentName || student.name, searchQuery)}
                                        {student.isPriority && (
                                          <Star size={13} fill="#FFD700" color="#FFD700" title="Priority Student" />
                                        )}
                                      </button>
                                      {student.status === 'Inactive' && (
                                        <span className="badge" style={{ background: 'rgba(244, 67, 54, 0.15)', color: '#F44336', border: '1px solid rgba(244, 67, 54, 0.3)', marginLeft: '6px', fontSize: '0.7rem', padding: '1px 5px' }}>
                                          Inactive
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td data-label="Batch Schedule">
                                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span className="badge" style={{ background: 'rgba(229, 9, 20, 0.15)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)', fontSize: '0.72rem', padding: '2px 6px' }}>
                                      {student.branch}
                                    </span>
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.72rem', padding: '2px 6px' }}>
                                      {getBatchNameFromSchedule(student.schedule, student.branch)} • {student.schedule}
                                    </span>
                                  </div>
                                </td>
                                <td data-label="Belt Rank">
                                  <span className={`badge ${getBeltColorClass(student.belt)}`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                                    {student.belt}
                                  </span>
                                </td>
                                <td data-label="Contact" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                  {student.phone || '—'}
                                </td>
                                <td data-label="Actions">
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    <button
                                      type="button"
                                      className="btn-icon"
                                      onClick={() => handleSelectStudent(student)}
                                      style={{ color: '#38bdf8', padding: '6px' }}
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-icon"
                                      onClick={() => handleDeleteStudent(student.id)}
                                      style={{ color: '#F44336', padding: '6px' }}
                                      title="Delete Student"
                                    >
                                      <Trash2 size={16} />
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
                    <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--color-text-muted)' }}>
                      <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>No Students Found</div>
                      <p style={{ fontSize: '0.8rem', margin: 0, marginTop: '4px' }}>No student records match the active criteria.</p>
                    </div>
                  )}
                </div>

                {/* Scheduled Classes Panel */}
                <div id="today-classes-panel" className="panel" style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', padding: 0, marginTop: '2rem' }}>
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#fff' }}>
                      <CalendarDays size={18} color="var(--color-primary)" /> Today's Scheduled Classes
                    </h3>
                    <button className="btn-primary btn-small" onClick={handleOpenAddClass} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                      + Schedule Class
                    </button>
                  </div>
                  {metrics.filteredClasses.length > 0 ? (
                    <div className="premium-table-container" style={{ border: 'none', background: 'transparent' }}>
                      <table className="premium-table responsive-table-cards">
                        <thead>
                          <tr>
                            <th>Class Name</th>
                            <th>Branch / Batch / Slot</th>
                            <th>Trainer</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.filteredClasses.map(cls => (
                            <tr key={cls._id}>
                              <td data-label="Class Name" style={{ fontWeight: 600, color: 'white' }}>
                                {cls.className}
                                {cls.subject && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Subj: {cls.subject}</span>}
                              </td>
                              <td data-label="Branch / Batch / Slot">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    <span className="badge" style={{ background: 'rgba(229, 9, 20, 0.15)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)' }}>{cls.branch}</span>
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{getBatchNameFromCode(cls.batch, cls.branch)}</span>
                                  </div>
                                  {(cls.schedule || cls.slotType) && (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                      {cls.schedule && <span className="badge" style={{ background: 'rgba(54, 162, 235, 0.15)', color: '#36A2EB', border: '1px solid rgba(54, 162, 235, 0.2)', fontSize: '0.75rem' }}>{cls.schedule}</span>}
                                      {cls.slotType && <span className="badge" style={{ background: 'rgba(75, 192, 192, 0.15)', color: '#4BC0C0', border: '1px solid rgba(75, 192, 192, 0.2)', fontSize: '0.75rem' }}>{cls.slotType}</span>}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td data-label="Trainer" style={{ color: 'var(--color-text-muted)' }}>
                                {cls.trainer}
                              </td>
                              <td data-label="Status">
                                {cls.status === 'cancelled' ? (
                                  <span className="badge" style={{ background: 'rgba(229, 9, 20, 0.15)', color: '#ff453a', border: '1px solid rgba(229, 9, 20, 0.3)' }} title={cls.cancellationReason}>
                                    Cancelled {cls.cancellationReason ? `(${cls.cancellationReason})` : ''}
                                  </span>
                                ) : (
                                  <span className="badge badge-green">Scheduled</span>
                                )}
                              </td>
                              <td data-label="Actions">
                                <div className="actions-flex-container">
                                  <button className="btn-icon" onClick={() => handleOpenEditClass(cls)} style={{ color: '#2196F3' }} title="Edit Details">
                                    <Settings size={16} />
                                  </button>
                                  {cls.status === 'cancelled' ? (
                                    <button className="btn-icon" onClick={() => handleRestoreClass(cls)} style={{ color: '#30d158' }} title="Restore Class">
                                      <CheckCircle size={16} />
                                    </button>
                                  ) : (
                                    <button className="btn-icon" onClick={() => handleCancelClass(cls)} style={{ color: '#ff453a' }} title="Cancel Class">
                                      <XCircle size={16} />
                                    </button>
                                  )}
                                  {!cls.isVirtual && (
                                    <button className="btn-icon" onClick={() => handleDeleteClass(cls._id)} style={{ color: '#F44336' }} title="Delete">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
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
            ))}

          {currentView === 'attendance' && (lockAttendancePage && userRole !== 'developer' ? renderSectionMaintenance('Attendance Tracking') : renderAttendance())}
          {currentView === 'fees' && (lockFeesPage && userRole !== 'developer' ? renderSectionMaintenance('Fees Portal') : renderFees())}
          {currentView === 'student-fees' && (lockFeesPage && userRole !== 'developer' ? renderSectionMaintenance('Fees Portal') : renderStudentFees())}
          {currentView === 'reminders' && (lockRemindersPage && userRole !== 'developer' ? renderSectionMaintenance('Alerts & Reminders') : renderReminders())}
          {currentView === 'performance' && (
            (userRole === 'trainer' || userRole === 'coordinator') ? (
              <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Trainers do not have permission to view financial performance details.</p>
              </div>
            ) : (
              lockPerformancePage && userRole !== 'developer' ? renderSectionMaintenance('Performance Portal') : renderPerformance()
            )
          )}
          {currentView === 'settings' && renderSettings()}
          {currentView === 'credentials-list' && (lockBranchBatchMappingPage && userRole !== 'developer' ? renderSectionMaintenance('Branch & Batch Mapping') : renderCredentialsList())}
          {currentView === 'trainer-approvals' && renderTrainerApprovals()}
          {currentView === 'grading' && (lockGradingPage && userRole !== 'developer' ? renderSectionMaintenance('Student Belt Grading') : renderGrading())}
          {currentView === 'announcements' && renderAnnouncements()}
        </div>
      </main>

      {/* Modal: View Read Receipts (Trainers & Branch Admins who read notification) */}
      {readDetailsModalNotification && (
        <div className="modal-overlay" style={{ zIndex: 100005 }} onClick={() => setReadDetailsModalNotification(null)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '560px',
              width: '90%',
              boxSizing: 'border-box',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'linear-gradient(145deg, rgba(22, 26, 40, 0.98) 0%, rgba(15, 17, 26, 0.98) 100%)',
              padding: '1.5rem',
              borderRadius: '20px',
              border: '1px solid rgba(74, 222, 128, 0.35)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={20} color="#4ade80" /> Notice Read Receipts
                </h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                  Announcement: <strong style={{ color: '#fff' }}>"{readDetailsModalNotification.title}"</strong>
                </p>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setReadDetailsModalNotification(null)}
                style={{ color: '#fff', background: 'rgba(255,255,255,0.08)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Read Stats */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Total Staff Read:</span>
              <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '4px 12px', fontWeight: 800 }}>
                {readDetailsModalNotification.readBy ? readDetailsModalNotification.readBy.length : 0} Users
              </span>
            </div>

            {/* Staff List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {readDetailsModalNotification.readBy && readDetailsModalNotification.readBy.length > 0 ? (
                readDetailsModalNotification.readBy.map((username, idx) => {
                  const userDetails = (adminsList || []).find(a =>
                    (a.username || '').toLowerCase().trim() === String(username).toLowerCase().trim() ||
                    (a.fullName || '').toLowerCase().trim() === String(username).toLowerCase().trim()
                  );

                  const displayName = userDetails ? (userDetails.fullName || userDetails.username) : username;
                  const roleRaw = userDetails ? (userDetails.role || '').toLowerCase() : '';
                  const roleTag = roleRaw === 'trainer' ? '🥋 Trainer' : roleRaw === 'branchadmin' ? '🏢 Branch Admin' : roleRaw === 'superadmin' ? '👑 Super Admin' : '👤 Staff Member';
                  const branchTag = userDetails && userDetails.branch ? userDetails.branch : 'All Branches';

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #E50914, #990000)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{displayName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>@{username}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                          {roleTag}
                        </span>
                        <span className="badge badge-blue" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                          📍 {branchTag}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600, marginLeft: '4px' }}>
                          ✓ Read
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No read receipt records found for this announcement.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setReadDetailsModalNotification(null)}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Announce / Post New Announcement */}
      {isGradingAnnouncementModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setIsGradingAnnouncementModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden', background: 'var(--color-bg-surface, #12141d)', padding: '1.75rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div className="panel-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
              <h3 className="panel-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: 700 }}>
                <Megaphone size={22} style={{ color: 'var(--color-primary, #e50914)' }} />
                Post New Broadcast Announcement
              </h3>
              <button
                className="btn-icon"
                onClick={() => setIsGradingAnnouncementModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#fff' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handlePublishGradingAnnouncement}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Target Branch
                  </label>
                  <select
                    className="form-control"
                    style={{ height: '42px', borderRadius: '10px', fontSize: '0.9rem' }}
                    value={gradingAnnouncementForm.branch}
                    onChange={(e) => setGradingAnnouncementForm({ ...gradingAnnouncementForm, branch: e.target.value })}
                  >
                    <option value="all">All Branches</option>
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Grading / Event Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ height: '42px', borderRadius: '10px', fontSize: '0.9rem' }}
                    value={gradingAnnouncementForm.gradingDate}
                    onChange={(e) => setGradingAnnouncementForm({ ...gradingAnnouncementForm, gradingDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Announcement Title *
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ height: '42px', borderRadius: '10px', fontSize: '0.92rem', paddingLeft: '0.85rem' }}
                  required
                  placeholder="e.g. 📢 Upcoming Belt Grading Examination"
                  value={gradingAnnouncementForm.title}
                  onChange={(e) => setGradingAnnouncementForm({ ...gradingAnnouncementForm, title: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Announcement Details & Instructions *
                </label>
                <textarea
                  className="form-control"
                  rows="6"
                  required
                  style={{ minHeight: '150px', borderRadius: '12px', fontSize: '0.9rem', padding: '0.85rem', lineHeight: '1.5' }}
                  placeholder="Enter full announcement details, syllabus requirements, venue, or eligibility criteria..."
                  value={gradingAnnouncementForm.message}
                  onChange={(e) => setGradingAnnouncementForm({ ...gradingAnnouncementForm, message: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ borderRadius: '10px', padding: '0.6rem 1.25rem' }}
                  onClick={() => setIsGradingAnnouncementModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingGradingAnnouncement}
                  style={{ borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: 600, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {submittingGradingAnnouncement ? 'Broadcasting...' : '📢 Submit & Notify All'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <label>Batch</label>
                      <select
                        className="form-control"
                        value={editingStudentData.batch}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const correspondingOpt = modalBatches.find(b => b.code === selectedId);
                          if (correspondingOpt) {
                            setEditingStudentData(prev => ({
                              ...prev,
                              batch: correspondingOpt.code,
                              schedule: correspondingOpt.schedule,
                              trainer: correspondingOpt.trainer || prev.trainer || ''
                            }));
                          }
                        }}
                        required
                      >
                        <option value="" disabled>Select Batch</option>
                        {modalBatches.map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.name} ({opt.schedule})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Batch Schedule</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingStudentData.schedule || ''}
                        readOnly
                        disabled
                        placeholder="Auto-derived from batch"
                      />
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
                          setEditingStudentData(prev => ({
                            ...prev,
                            branch: selectedBr,
                            batch: '',
                            schedule: ''
                          }));
                        }}
                        required
                        disabled={!isAdminUser(loggedInUser)}
                      >
                        <option value="" disabled>Select Branch</option>
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
                      <label>Art (Program)</label>
                      <select
                        className="form-control"
                        value={editingStudentData.art || ''}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, art: e.target.value })}
                      >
                        <option value="">Select Art</option>
                        {ART_OPTIONS.map(art => (
                          <option key={art} value={art}>{art}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Trainer</label>
                      <select
                        className="form-control"
                        value={editingStudentData.trainer || ''}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, trainer: e.target.value })}
                      >
                        <option value="">Select Trainer</option>
                        {(() => {
                          const filtered = (trainersList || []).filter(t =>
                            !editingStudentData.branch ||
                            !t.branch ||
                            (typeof t.branch === 'string' && typeof editingStudentData.branch === 'string' && t.branch.toLowerCase().split(',').map(b => b.trim()).includes(editingStudentData.branch.toLowerCase().trim()))
                          );
                          const listToShow = filtered.length > 0 ? filtered : (trainersList || []);
                          return listToShow.map(t => (
                            <option key={t.username} value={t.username}>
                              {t.username} {t.fullName ? `(${t.fullName})` : ''}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Present Grad</label>
                      <select
                        className="form-control"
                        value={editingStudentData.belt}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, belt: e.target.value })}
                      >
                        <optgroup label="🥋 Traditional Belts">
                          <option value="White">White Belt</option>
                          <option value="Yellow">Yellow Belt</option>
                          <option value="Orange">Orange Belt</option>
                          <option value="Green">Green Belt</option>
                          <option value="Blue">Blue Belt</option>
                          <option value="Purple">Purple Belt</option>
                          <option value="Red">Red Belt</option>
                          <option value="Brown">Brown Belt</option>
                          <option value="Brown 1">Brown 1 Belt</option>
                          <option value="Brown 2">Brown 2 Belt</option>
                          <option value="Brown 3">Brown 3 Belt</option>
                          <option value="Brown 4">Brown 4 Belt</option>
                          <option value="Black">Black Belt</option>
                        </optgroup>
                        <optgroup label="🥊 Kickboxing / Boxing Levels">
                          <option value="Level 1">Level 1</option>
                          <option value="Level 2">Level 2</option>
                          <option value="Level 3">Level 3</option>
                          <option value="Level 4">Level 4</option>
                          <option value="Level 5">Level 5</option>
                          <option value="Pro Level">Pro Level</option>
                        </optgroup>
                        {editingStudentData.belt && !['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Red', 'Brown', 'Brown 1', 'Brown 2', 'Brown 3', 'Brown 4', 'Black', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Pro Level'].includes(editingStudentData.belt) && (
                          <option value={editingStudentData.belt}>{editingStudentData.belt}</option>
                        )}
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
                    {!editingStudentData.admissionPaid && (
                      <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                        <label>Admission Coupon Code (Optional)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter admission coupon (e.g. FIT20)"
                            value={editingStudentData.appliedAdmissionCoupon || ''}
                            onChange={(e) => {
                              const code = e.target.value.toUpperCase().trim();
                              setEditingStudentData({
                                ...editingStudentData,
                                appliedAdmissionCoupon: code
                              });
                            }}
                          />
                          {editingStudentData.appliedAdmissionCoupon && (() => {
                            const coupon = resolveCouponCode(editingStudentData.appliedAdmissionCoupon);
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
                    )}
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
                        <img src={selectedStudent.photo} alt={selectedStudent.studentName || selectedStudent.name} style={{ width: '90px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
                      ) : (
                        <div style={{ width: '90px', height: '120px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                          {(selectedStudent.studentName || selectedStudent.name).charAt(0)}
                        </div>
                      )}
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedStudent.studentName || selectedStudent.name}</h3>
                    </div>
                    <span className={`badge ${getBeltColorClass(selectedStudent.belt)}`}>{selectedStudent.belt}</span>
                  </div>

                  <div className="grid-2-col" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', gap: '1rem' }}>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Admission Number</span><div style={{ fontWeight: 600 }}>{selectedStudent.admissionNumber || selectedStudent.admissionNo || selectedStudent.id}</div></div>
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
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: 'var(--color-primary)', color: 'white' }}>{selectedStudent.branch} Branch</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{getBatchNameFromSchedule(selectedStudent.schedule, selectedStudent.branch)}</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{selectedStudent.schedule} Batch</span>
                      {selectedStudent.trainer && <span className="badge" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db' }}>Trainer: {selectedStudent.trainer}</span>}
                      {selectedStudent.art && <span className="badge" style={{ background: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6' }}>Art: {selectedStudent.art}</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Trainer</span><div style={{ fontWeight: 600 }}>{selectedStudent.trainer || 'N/A'}</div></div>
                      <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Art (Program)</span><div style={{ fontWeight: 600 }}>{selectedStudent.art || 'N/A'}</div></div>
                    </div>
                  </div>

                  {/* Monthly Attendance Summary */}
                  <div style={{ marginBottom: '1.25rem', background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', padding: '1.15rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Monthly Attendance</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Month:</span>
                        <input
                          type="month"
                          className="form-control"
                          style={{ width: 'auto', padding: '0 8px', fontSize: '0.82rem', height: '32px', minHeight: '32px', background: 'rgba(0,0,0,0.4)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                          {/* 3 Summary Badges */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ background: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76, 175, 80, 0.25)', padding: '0.5rem 0.3rem', borderRadius: '8px', textAlign: 'center', minWidth: 0 }}>
                              <span style={{ color: '#4CAF50', display: 'block', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Present</span>
                              <strong style={{ fontSize: '1.2rem', color: '#4CAF50', fontFamily: 'Outfit, sans-serif' }}>{present}</strong>
                              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>Days</span>
                            </div>
                            <div style={{ background: 'rgba(244, 67, 54, 0.08)', border: '1px solid rgba(244, 67, 54, 0.25)', padding: '0.5rem 0.3rem', borderRadius: '8px', textAlign: 'center', minWidth: 0 }}>
                              <span style={{ color: '#F44336', display: 'block', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Absent</span>
                              <strong style={{ fontSize: '1.2rem', color: '#F44336', fontFamily: 'Outfit, sans-serif' }}>{absent}</strong>
                              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>Days</span>
                            </div>
                            <div style={{ background: 'rgba(94, 92, 230, 0.08)', border: '1px solid rgba(94, 92, 230, 0.25)', padding: '0.5rem 0.3rem', borderRadius: '8px', textAlign: 'center', minWidth: 0 }}>
                              <span style={{ color: '#818cf8', display: 'block', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rate</span>
                              <strong style={{ fontSize: '1.2rem', color: '#818cf8', fontFamily: 'Outfit, sans-serif' }}>{attendanceRate}%</strong>
                              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>Score</span>
                            </div>
                          </div>

                          {/* Calendar view */}
                          {(() => {
                            const [year, month] = profileAttendanceMonth.split('-').map(Number);
                            if (!year || !month) return null;
                            const daysInMonth = new Date(year, month, 0).getDate();
                            const firstDayIndex = new Date(year, month - 1, 1).getDay();

                            return (
                              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem', width: '100%', boxSizing: 'border-box' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '3px', textAlign: 'center', fontWeight: 700, fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem', width: '100%', boxSizing: 'border-box' }}>
                                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                    <div key={d} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d}</div>
                                  ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '3px', width: '100%', boxSizing: 'border-box' }}>
                                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                                    <div key={`empty-${idx}`} style={{ aspectRatio: '1', width: '100%', minWidth: 0 }}></div>
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
                                      cellBg = 'rgba(76, 175, 80, 0.18)';
                                      cellBorder = '1px solid rgba(76, 175, 80, 0.5)';
                                      cellColor = '#4CAF50';
                                    } else if (statusLower === 'absent') {
                                      cellBg = 'rgba(244, 67, 54, 0.18)';
                                      cellBorder = '1px solid rgba(244, 67, 54, 0.5)';
                                      cellColor = '#F44336';
                                    } else if (statusLower === 'holiday') {
                                      cellBg = 'rgba(33, 150, 243, 0.18)';
                                      cellBorder = '1px solid rgba(33, 150, 243, 0.5)';
                                      cellColor = '#2196F3';
                                    } else if (statusLower === 'leave') {
                                      cellBg = 'rgba(255, 152, 0, 0.18)';
                                      cellBorder = '1px solid rgba(255, 152, 0, 0.5)';
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
                                          width: '100%',
                                          minWidth: 0,
                                          padding: 0,
                                          margin: 0,
                                          boxSizing: 'border-box',
                                          borderRadius: '5px',
                                          background: cellBg,
                                          border: cellBorder,
                                          color: cellColor,
                                          fontWeight: 700,
                                          fontSize: 'clamp(0.68rem, 2.2vw, 0.82rem)',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          position: 'relative'
                                        }}
                                        title={`${dateStr} - ${status || 'No Record'}`}
                                      >
                                        {dayNum}
                                      </button>
                                    );
                                  })}
                                </div>

                                {selectedCalendarDate && selectedCalendarDetail && (
                                  <div style={{ marginTop: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', position: 'relative' }}>
                                    <button
                                      type="button"
                                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                                      onClick={() => { setSelectedCalendarDate(null); setSelectedCalendarDetail(null); }}
                                    >
                                      <X size={15} />
                                    </button>
                                    <h5 style={{ margin: '0 0 0.4rem 0', fontSize: '0.82rem', color: 'var(--color-secondary)' }}>Attendance: {selectedCalendarDetail.date}</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.78rem' }}>
                                      <div>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Status: </span>
                                        <strong style={{
                                          color:
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
                      <div style={{ background: 'rgba(18, 20, 29, 0.7)', backdropFilter: 'blur(16px)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                          <h4 style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Financial Summary</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Calculate up to:</span>
                            <input
                              type="month"
                              className="form-control"
                              style={{ width: 'auto', padding: '0 8px', fontSize: '0.82rem', height: '32px', minHeight: '32px', background: 'rgba(0,0,0,0.4)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
                              value={profileFeeMonth}
                              onChange={(e) => setProfileFeeMonth(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Admission Fee Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.65rem', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.88rem', color: '#B0B0B0', fontWeight: 500 }}>Admission Fee:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {selectedStudent.admissionPaid ? (
                              <>
                                <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>✓ Paid ({selectedStudent.admissionPaid})</span>
                                <button
                                  type="button"
                                  className="btn-small btn-secondary"
                                  style={{ padding: '3px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap', borderRadius: '6px', cursor: 'pointer', height: '26px' }}
                                  onClick={() => unmarkFeePaid(selectedStudent.id, 'admissionPaid')}
                                >
                                  Undo
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="badge badge-red" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                                  Pending (₹{feeDetails.admissionDue}){selectedStudent.appliedAdmissionCoupon ? ` [${selectedStudent.appliedAdmissionCoupon}]` : ''}
                                </span>
                                <button
                                  type="button"
                                  className="btn-small btn-primary"
                                  style={{ padding: '3px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap', borderRadius: '6px', cursor: 'pointer', height: '26px' }}
                                  onClick={() => markFeePaid(selectedStudent.id, 'admissionPaid')}
                                >
                                  Pay
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Outstanding Monthly Fees */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
                          <span style={{ color: '#B0B0B0' }}>Outstanding Monthly Fees:</span>
                          <span style={{ fontWeight: 700, color: feeDetails.monthlyDue > 0 ? '#ff453a' : '#4CAF50', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>₹{feeDetails.monthlyDue}</span>
                        </div>

                        {/* Total Dues */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                          <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}>Total Dues:</span>
                          <span style={{ fontSize: '1.35rem', color: feeDetails.totalDue > 0 ? '#ff453a' : '#4CAF50', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>₹{feeDetails.totalDue}</span>
                        </div>

                        {/* Unpaid Months Grid */}
                        {feeDetails.unpaidMonths.length > 0 && (
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#ff9f0a', marginBottom: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Unpaid Months ({feeDetails.unpaidMonths.length})
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                              {feeDetails.unpaidMonths.map(m => {
                                const info = getFeeInfoForMonth(selectedStudent, m);
                                return (
                                  <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(244, 67, 54, 0.08)', border: '1px solid rgba(244, 67, 54, 0.25)', padding: '6px 10px', borderRadius: '8px', gap: '6px' }}>
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatMonthName(m)}</div>
                                      <div style={{ color: '#ff453a', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>₹{info.finalRate}</div>
                                    </div>
                                    <button
                                      type="button"
                                      style={{ border: 'none', background: 'linear-gradient(135deg, #E50914, #b91c1c)', color: 'white', borderRadius: '6px', cursor: 'pointer', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(229,9,20,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}
                                      onClick={() => markFeePaidCustomMonth(selectedStudent.id, m)}
                                    >
                                      Pay
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Paid Months Grid */}
                        {feeDetails.paidMonthsList.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#4CAF50', marginBottom: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Paid Months ({feeDetails.paidMonthsList.length})
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                              {feeDetails.paidMonthsList.map(m => {
                                const info = getFeeInfoForMonth(selectedStudent, m);
                                return (
                                  <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76, 175, 80, 0.25)', padding: '6px 10px', borderRadius: '8px', gap: '6px' }}>
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatMonthName(m)}</div>
                                      <div style={{ color: '#4CAF50', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>₹{info.finalRate}</div>
                                    </div>
                                    <button
                                      type="button"
                                      style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#B0B0B0', borderRadius: '6px', cursor: 'pointer', padding: '3px 8px', fontSize: '0.7rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                                      onClick={() => unmarkFeePaidCustomMonth(selectedStudent.id, m)}
                                    >
                                      Undo
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                  <button className="btn-secondary" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }} onClick={() => setSelectedStudent(null)}>Close</button>
                  {loggedInUser && (
                    <button className="btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }} onClick={() => {
                      setEditingStudentData(selectedStudent);
                      setIsEditingStudent(true);
                    }}>Edit Student</button>
                  )}
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
                <Wallet size={20} color="var(--color-primary)" /> Customize Fees & Coupon: {feeEditingStudent.name} (for {formatMonthName(feeMonth)})
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
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Apply Monthly Coupon Code (for {formatMonthName(feeMonth)})</label>
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
                      const [year, month] = feeMonth.split('-').map(Number);
                      let updatedCoupons = feeEditingStudent.appliedCoupons ? [...feeEditingStudent.appliedCoupons] : [];
                      const index = updatedCoupons.findIndex(c => c.appliedMonth === month && c.appliedYear === year);

                      if (!code) {
                        setCouponMessage(`Coupon cleared for ${formatMonthName(feeMonth)} (0% Discount)`);
                        if (index > -1) {
                          updatedCoupons.splice(index, 1);
                        }
                        setFeeEditingStudent(prev => ({
                          ...prev,
                          appliedCoupons: updatedCoupons
                        }));
                        return;
                      }

                      const coupon = resolveCouponCode(code);
                      if (!coupon) {
                        setCouponMessage('❌ Invalid Coupon Code');
                        return;
                      }

                      const display = coupon.type === 'amount' ? `₹${coupon.value}` : `${coupon.value}%`;
                      setCouponMessage(`✓ Coupon Applied for ${formatMonthName(feeMonth)}! ${display} Discount`);

                      const newCoupon = {
                        couponId: code,
                        couponCode: code,
                        discountType: coupon.type,
                        discountValue: coupon.value,
                        appliedMonth: month,
                        appliedYear: year,
                        appliedAt: new Date().toISOString()
                      };

                      if (index > -1) {
                        updatedCoupons[index] = newCoupon;
                      } else {
                        updatedCoupons.push(newCoupon);
                      }

                      setFeeEditingStudent(prev => ({
                        ...prev,
                        appliedCoupons: updatedCoupons
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
                  const [year, month] = feeMonth.split('-').map(Number);
                  let updatedCoupons = feeEditingStudent.appliedCoupons ? [...feeEditingStudent.appliedCoupons] : [];
                  const index = updatedCoupons.findIndex(c => c.appliedMonth === month && c.appliedYear === year);

                  if (code) {
                    const resolved = resolveCouponCode(code);
                    if (!resolved) {
                      setCouponMessage('❌ Invalid Coupon Code');
                      return;
                    }
                    const newCoupon = {
                      couponId: code,
                      couponCode: code,
                      discountType: resolved.type,
                      discountValue: resolved.value,
                      appliedMonth: month,
                      appliedYear: year,
                      appliedAt: new Date().toISOString()
                    };
                    if (index > -1) {
                      updatedCoupons[index] = newCoupon;
                    } else {
                      updatedCoupons.push(newCoupon);
                    }
                  } else {
                    if (index > -1) {
                      updatedCoupons.splice(index, 1);
                    }
                  }

                  const rate = customRateInput === '' ? null : parseInt(customRateInput, 10);
                  const admissionRateOverride = customAdmissionInput === '' ? null : parseInt(customAdmissionInput, 10);
                  const updatedStudent = {
                    ...feeEditingStudent,
                    joinDate: `${customStartMonth}-01`,
                    customMonthlyRate: rate,
                    customAdmissionRate: admissionRateOverride,
                    appliedCoupons: updatedCoupons
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

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Schedule Days (select one or more)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', color: classFormDays[day] ? 'white' : 'var(--color-text-muted)' }}>
                      <input
                        type="checkbox"
                        checked={classFormDays[day]}
                        onChange={(e) => setClassFormDays(prev => ({ ...prev, [day]: e.target.checked }))}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  Formatted schedule: <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{formatSelectedDays(classFormDays) || 'None selected'}</span>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Timing Category (Slot)</label>
                <select
                  className="form-control"
                  style={{ width: '100%' }}
                  value={classFormSlotType}
                  onChange={(e) => setClassFormSlotType(e.target.value)}
                  required
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
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
                  <label>Batch</label>
                  <select
                    className="form-control"
                    value={newStudent.batch}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const correspondingOpt = modalBatches.find(b => b.code === selectedId);
                      if (correspondingOpt) {
                        setNewStudent(prev => ({
                          ...prev,
                          batch: correspondingOpt.code,
                          schedule: correspondingOpt.schedule,
                          trainer: correspondingOpt.trainer || prev.trainer || ''
                        }));
                      }
                    }}
                    required
                  >
                    <option value="" disabled>Select Batch</option>
                    {modalBatches.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.name} ({opt.schedule})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch Schedule</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newStudent.schedule || ''}
                    readOnly
                    disabled
                    placeholder="Auto-derived from batch"
                  />
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
                      setNewStudent(prev => ({
                        ...prev,
                        branch: selectedBr,
                        batch: '',
                        schedule: ''
                      }));
                    }}
                    required
                    disabled={
                      (!isAdminUser(loggedInUser) && appMode !== 'superadmin-login') ||
                      appMode === 'login'
                    }
                  >
                    <option value="" disabled>Select Branch</option>
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
                  <label>Art (Program)</label>
                  <select
                    className="form-control"
                    value={newStudent.art || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, art: e.target.value })}
                  >
                    <option value="">Select Art</option>
                    {ART_OPTIONS.map(art => (
                      <option key={art} value={art}>{art}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid-2-col">
                <div className="form-group">
                  <label>Trainer</label>
                  <select
                    className="form-control"
                    value={newStudent.trainer || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, trainer: e.target.value })}
                  >
                    <option value="">Select Trainer</option>
                    {(() => {
                      const filtered = (trainersList || []).filter(t =>
                        !newStudent.branch ||
                        !t.branch ||
                        (typeof t.branch === 'string' && typeof newStudent.branch === 'string' && t.branch.toLowerCase().split(',').map(b => b.trim()).includes(newStudent.branch.toLowerCase().trim()))
                      );
                      const listToShow = filtered.length > 0 ? filtered : (trainersList || []);
                      return listToShow.map(t => (
                        <option key={t.username} value={t.username}>
                          {t.username} {t.fullName ? `(${t.fullName})` : ''}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
                <div className="form-group">
                  <label>Present Grad</label>
                  <select className="form-control" value={newStudent.belt} onChange={(e) => setNewStudent({ ...newStudent, belt: e.target.value })}>
                    <optgroup label="🥋 Traditional Belts">
                      <option value="White">White Belt</option>
                      <option value="Yellow">Yellow Belt</option>
                      <option value="Orange">Orange Belt</option>
                      <option value="Green">Green Belt</option>
                      <option value="Blue">Blue Belt</option>
                      <option value="Purple">Purple Belt</option>
                      <option value="Red">Red Belt</option>
                      <option value="Brown">Brown Belt</option>
                      <option value="Brown 1">Brown 1 Belt</option>
                      <option value="Brown 2">Brown 2 Belt</option>
                      <option value="Brown 3">Brown 3 Belt</option>
                      <option value="Brown 4">Brown 4 Belt</option>
                      <option value="Black">Black Belt</option>
                    </optgroup>
                    <optgroup label="🥊 Kickboxing / Boxing Levels">
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Level 3">Level 3</option>
                      <option value="Level 4">Level 4</option>
                      <option value="Level 5">Level 5</option>
                      <option value="Pro Level">Pro Level</option>
                    </optgroup>
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
              <div className="form-group">
                <label>Admission Coupon Code (Optional)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter admission coupon (e.g. FIT20)"
                    value={newStudent.appliedAdmissionCoupon || ''}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase().trim();
                      setNewStudent({
                        ...newStudent,
                        appliedAdmissionCoupon: code
                      });
                    }}
                  />
                  {newStudent.appliedAdmissionCoupon && (() => {
                    const coupon = resolveCouponCode(newStudent.appliedAdmissionCoupon);
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

      {/* Maintenance Notification Modal */}
      {showMaintenanceModal && !maintenanceDismissed && (
        <div className="modal-overlay" style={{ zIndex: 15000 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', padding: '2.5rem 2rem', textAlign: 'center', border: '1px solid rgba(255, 69, 58, 0.3)', background: 'rgba(10,5,5,0.96)', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: '#ff453a' }}>
              <AlertTriangle size={48} className="pulse-icon" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: '#fff', fontSize: '1.4rem' }}>
              System Maintenance Active
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              The system is currently undergoing scheduled updates and maintenance. Some features may be restricted or offline. Please save your progress and log out to prevent any data loss.
            </p>
            {maintenanceEnd && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem', color: '#fff', marginBottom: '1.75rem' }}>
                Expected back online: <strong style={{ color: '#ff9f0a' }}>{formatMaintenanceTime(maintenanceEnd)}</strong>
              </div>
            )}
            <div style={{ display: 'flex', width: '100%' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, background: '#ff453a', borderColor: '#ff453a', color: '#fff' }}
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
                  setAppMode('login');
                  setShowMaintenanceModal(false);
                  setMaintenanceDismissed(false);
                }}
              >
                Logout Now
              </button>
            </div>
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

      {/* Modal: Record Fee Payment */}
      {isRecordPaymentModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '520px', padding: '2rem', borderRadius: '16px', background: 'rgba(15, 17, 26, 0.98)', border: '1px solid var(--glass-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} color="#4CAF50" /> Record Fee Payment
              </h3>
              <button className="btn-icon" onClick={() => setIsRecordPaymentModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#E50914' }}>{paymentFormData.studentName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Branch: <strong>{paymentFormData.branch}</strong> • Batch: <strong>{paymentFormData.batch || 'Regular'}</strong>
                </div>
              </div>

              <div className="payment-modal-grid">
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Fee Due Month:</label>
                  <input
                    type="month"
                    className="form-control"
                    value={paymentFormData.feeMonth}
                    onChange={e => setPaymentFormData({ ...paymentFormData, feeMonth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Fee Type:</label>
                  <select
                    className="form-control"
                    value={paymentFormData.feeType}
                    onChange={e => setPaymentFormData({ ...paymentFormData, feeType: e.target.value })}
                  >
                    <option value="monthly">Monthly Fee</option>
                    <option value="admission">Admission Fee</option>
                    <option value="custom">Custom Fee</option>
                  </select>
                </div>
              </div>

              <div className="payment-modal-grid">
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Amount Due (₹):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={paymentFormData.amountDue}
                    onChange={e => setPaymentFormData({ ...paymentFormData, amountDue: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#51CF66', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Amount Paid (₹):</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderColor: '#4CAF50', fontWeight: 700 }}
                    value={paymentFormData.amountPaid}
                    onChange={e => setPaymentFormData({ ...paymentFormData, amountPaid: Number(e.target.value) })}
                    required
                  />
                  {paymentFormData.amountDue > paymentFormData.amountPaid && (
                    <span style={{ fontSize: '0.75rem', color: '#FFD700', marginTop: '2px', display: 'block' }}>
                      Remaining Balance: ₹{paymentFormData.amountDue - paymentFormData.amountPaid} (Partial)
                    </span>
                  )}
                </div>
              </div>

              <div className="payment-modal-grid">
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Actual Payment Date:
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ borderColor: '#38bdf8' }}
                    value={paymentFormData.paymentDate}
                    onChange={e => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                    Revenue counted in: <strong>{paymentFormData.paymentDate.slice(0, 7)}</strong>
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Payment Method:</label>
                  <select
                    className="form-control"
                    value={paymentFormData.paymentMethod}
                    onChange={e => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Reference / Notes (Optional):</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. UPI Ref #, Cheque #, or parent notes"
                  value={paymentFormData.notes}
                  onChange={e => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsRecordPaymentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#4CAF50', borderColor: '#4CAF50' }}>
                  <CheckCircle size={16} /> Save & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Print Receipt */}
      {isReceiptModalOpen && activeReceipt && (
        <div className="modal-overlay" style={{ zIndex: 11500 }}>
          <div className="modal-content glass-panel receipt-modal-content" style={{ maxWidth: '560px', borderRadius: '16px', background: '#0d0e15', border: '1px solid var(--glass-border)', boxShadow: '0 30px 80px rgba(0,0,0,0.9)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid rgba(229,9,20,0.3)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif', color: '#fff', letterSpacing: '1px' }}>
                  <span style={{ color: '#E50914' }}>MASTER</span> FIT ACADEMY
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Official Fee Payment Receipt</span>
              </div>
              <button className="btn-icon" onClick={() => setIsReceiptModalOpen(false)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>Receipt Number:</span>
                <strong style={{ fontSize: '1rem', color: '#FFD700', fontFamily: 'monospace' }}>{activeReceipt.receiptNumber}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>Payment Date:</span>
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{activeReceipt.paymentDate}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Student Name:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#fff' }}>{activeReceipt.studentName}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Branch:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#fff' }}>{activeReceipt.branch}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Batch:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#fff' }}>{activeReceipt.batch || 'Regular'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Fee Description (Fee Month):</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#fff', fontWeight: 600 }}>
                      {activeReceipt.feeType === 'admission' ? 'Admission Fee' : `Monthly Fee (${formatMonthName(activeReceipt.feeMonth)})`}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Payment Mode:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#fff' }}>{activeReceipt.paymentMethod}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Amount Due:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#fff' }}>₹{activeReceipt.amountDue}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px 0', color: '#51CF66', fontWeight: 700, fontSize: '1.05rem' }}>Amount Paid:</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: '#51CF66', fontWeight: 800, fontSize: '1.25rem' }}>
                      ₹{activeReceipt.amountPaid}
                    </td>
                  </tr>
                  {activeReceipt.balance > 0 && (
                    <tr>
                      <td style={{ padding: '8px 0', color: '#FFD700', fontWeight: 600 }}>Remaining Balance:</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: '#FFD700', fontWeight: 700 }}>₹{activeReceipt.balance}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Recorded by: <strong>{activeReceipt.collectedBy || 'Admin'}</strong>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" onClick={() => setIsReceiptModalOpen(false)}>Close</button>
                <button className="btn-primary" onClick={() => window.print()} style={{ background: '#38bdf8', borderColor: '#38bdf8', color: '#000', fontWeight: 700 }}>
                  🖨️ Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
