import { useState, useEffect } from 'react';
import {
  Users, CalendarDays, Wallet, Bell, Settings, LogOut, UserPlus, AlertTriangle, X,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, MessageCircle,
  Search, Phone, Trash2, ArrowRight, Activity, MapPin, TrendingUp, Award, Menu,
  Shield, Lock, Unlock, FileDown, FileUp
} from 'lucide-react';
import './index.css';

// Academy Branches static list fallback
const DEFAULT_BRANCHES = ["Kuttiady", "Perambra", "Orkatteri", "Paarakadav", "Kallachi", "Chambra", "Devargovil"];

const DEFAULT_BATCH_OPTIONS = [
  { id: 'batch1', name: 'Batch 1 (Mon - Thu)', schedule: 'Mon-Thu' },
  { id: 'batch2', name: 'Batch 2 (Tue - Fri)', schedule: 'Tue-Fri' },
  { id: 'batch3', name: 'Batch 3 (Wed - Sat)', schedule: 'Wed-Sat' }
];


const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://masterfit-dfz7.onrender.com/api';


function App() {
  // Bulletproof Cookie Parser
  const getCookieValue = (name) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return '';
  };

  // Session storage helper functions
  const getSessionUser = () => {
    return localStorage.getItem('umai_session_user') || getCookieValue('umai_session_user');
  };

  const getSessionToken = () => {
    return localStorage.getItem('umai_session_token') || getCookieValue('umai_session_token');
  };

  const setSession = (username, token) => {
    try {
      localStorage.setItem('umai_session_user', username);
      localStorage.setItem('umai_session_token', token);
    } catch (e) {
      console.error('Failed to set localStorage session:', e);
    }
    document.cookie = `umai_session_user=${username}; path=/;`;
    document.cookie = `umai_session_token=${token}; path=/;`;
  };

  const clearSession = () => {
    try {
      localStorage.removeItem('umai_session_user');
      localStorage.removeItem('umai_session_token');
    } catch (e) {
      console.error('Failed to clear localStorage session:', e);
    }
    document.cookie = "umai_session_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "umai_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const [appMode, setAppMode] = useState(() => {
    const hash = window.location.hash;
    const hasSession = getSessionUser();

    if (hasSession) {
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
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [customBranches, setCustomBranches] = useState([]);
  const [customBatches, setCustomBatches] = useState([]);
  const [batchOptions, setBatchOptions] = useState(DEFAULT_BATCH_OPTIONS);
  const [newBranchForm, setNewBranchForm] = useState({ name: '', username: '', password: '', confirmPassword: '' });
  const [newBatchForm, setNewBatchForm] = useState({ name: '', schedule: '', branch: 'kuttiady', username: '', password: '', confirmPassword: '' });
  const [activeSessions, setActiveSessions] = useState([]);

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
    
    // Check if it's a batch coordinator
    // Find batch in batchOptions
    const batchObj = batchOptions.find(b => b.id.toLowerCase() === userPart);
    const batchName = batchObj ? batchObj.name : userPart.charAt(0).toUpperCase() + userPart.slice(1);
    
    return {
      role: 'Batch Coordinator',
      branch: branchName,
      batchName: batchName
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
    if (!user) return false;
    const usernameClean = user.toLowerCase().trim();
    if (usernameClean.includes('@')) return false;

    // Fallback while adminCredentials are loading async
    const sessionUser = getSessionUser();
    if (sessionUser && sessionUser.toLowerCase().trim() === usernameClean) {
      return true;
    }
    return Object.keys(adminCredentials).includes(usernameClean);
  };

  const isBranchAdmin = (user) => {
    if (!user) return false;
    const usernameClean = user.toLowerCase().trim();
    return usernameClean.startsWith('admin@');
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
    // 1. Fetch Students
    fetch(`${API_BASE_URL}/students`)
      .then(res => {
        if (!res.ok) throw new Error('API server down');
        return res.json();
      })
      .then(data => {
        setStudents(data || []);
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

          const customBranchesList = data.customBranches || [];
          const customBatchesList = data.customBatches || [];
          setCustomBranches(customBranchesList);
          setCustomBatches(customBatchesList);

          const dbBranches = Object.keys(data.branchCredentials || {}).map(b => b.charAt(0).toUpperCase() + b.slice(1));
          const uniqueBranches = Array.from(new Set([
            ...DEFAULT_BRANCHES,
            ...dbBranches,
            ...customBranchesList.map(b => b.charAt(0).toUpperCase() + b.slice(1))
          ]));
          setBranches(uniqueBranches);

          const uniqueBatches = [
            ...DEFAULT_BATCH_OPTIONS,
            ...customBatchesList
          ];
          setBatchOptions(uniqueBatches);
          setMonthlyFeeRate(data.monthlyFeeRate !== undefined ? data.monthlyFeeRate : 600);
          setAdmissionFeeRate(data.admissionFeeRate !== undefined ? data.admissionFeeRate : 1500);
          setCoupons(data.coupons || {});
        }
      })
      .catch(err => console.error('Error fetching credentials:', err));
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
            setSession(data.username, sessionToken);
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

  // Fetch active sessions when settings page is loaded
  useEffect(() => {
    if (currentView === 'settings' && isAdminUser(loggedInUser)) {
      fetch(`${API_BASE_URL}/sessions`)
        .then(res => res.json())
        .then(data => setActiveSessions(data || []))
        .catch(err => console.error('Error fetching sessions:', err));
    }
  }, [currentView, loggedInUser]);

  // Fetch raw credentials when credentials-list page is loaded
  useEffect(() => {
    if (currentView === 'credentials-list' && isAdminUser(loggedInUser)) {
      setLoadingRawCreds(true);
      fetch(`${API_BASE_URL}/credentials/raw`)
        .then(res => res.json())
        .then(data => {
          setRawCredentials(data);
          setLoadingRawCreds(false);
        })
        .catch(err => {
          console.error('Error fetching raw credentials:', err);
          setLoadingRawCreds(false);
        });
    }
  }, [currentView, loggedInUser]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll in admin mode to avoid double scrollbars
  useEffect(() => {
    if (appMode === 'admin') {
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

      if (hash === '#/superadmin') {
        if (hasSession) {
          window.location.hash = '#/admin';
        } else {
          setAppMode('superadmin-login');
        }
      } else if (hash === '#/login' || hash === '#/branch' || hash === '#/batch') {
        if (hasSession) {
          window.location.hash = '#/admin';
        } else {
          setAppMode('login');
        }
      } else if (hash === '#/admin') {
        setAppMode(hasSession ? 'admin' : 'login');
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
  }, [currentView]);

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
    }
  }, [appMode]);

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

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date()); // Default to current month/year
  const [feeMonth, setFeeMonth] = useState(getLocalMonthString()); // "YYYY-MM"

  // Profile modal dues calculation month limit
  const [profileFeeMonth, setProfileFeeMonth] = useState(getLocalMonthString());

  useEffect(() => {
    if (selectedStudent) {
      setProfileFeeMonth(feeMonth);
    }
  }, [selectedStudent, feeMonth]);

  // Attendance Marking State
  const [markingDate, setMarkingDate] = useState(getLocalDateString());
  const [attendanceBatchFilter, setAttendanceBatchFilter] = useState('All');
  const [attendanceScheduleFilter, setAttendanceScheduleFilter] = useState('All');

  // Fee Filter State
  const [feeBatchFilter, setFeeBatchFilter] = useState('All');
  const [feeScheduleFilter, setFeeScheduleFilter] = useState('All');

  // Roster Filter State
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  // Form State
  const [newStudent, setNewStudent] = useState({
    name: '', age: '', phone: '', belt: 'White', joinDate: getLocalDateString(), batch: 'Morning', schedule: 'Mon-Thu', branch: 'Kuttiady', photo: null, status: 'Active'
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

  const searchedStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery);

    let activeBranch = 'All';
    if (isAdminUser(loggedInUser)) {
      activeBranch = branchFilter;
    } else if (batchOptions.some(b => b.id.toLowerCase() === loggedInUser.toLowerCase())) {
      activeBranch = 'Kuttiady';
    } else if (loggedInUser && loggedInUser.includes('@')) {
      const branchPart = loggedInUser.split('@')[1];
      activeBranch = branches.find(b => b.toLowerCase() === branchPart) || 'All';
    }

    const matchesBranch = activeBranch === 'All' || s.branch === activeBranch;

    // Filter by student status: Active, Inactive, or All
    const matchesStatus = statusFilter === 'All' 
      ? true 
      : (s.status || 'Active') === statusFilter;

    const activeBatch = batchOptions.find(b => loggedInUser && loggedInUser.toLowerCase().startsWith(b.id.toLowerCase()));
    if (activeBatch) {
      return matchesSearch && matchesBranch && matchesStatus && s.schedule === activeBatch.schedule;
    }

    return matchesSearch && matchesBranch && matchesStatus;
  });

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

  const confirmDelete = () => {
    if (studentToDelete !== null) {
      setStudents(students.filter(s => s.id !== studentToDelete));
      setSelectedStudent(null);

      fetch(`${API_BASE_URL}/students/${studentToDelete}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete on server');
        })
        .catch(err => console.error("Error deleting student:", err));

      setStudentToDelete(null);
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    let defaultBranch = 'Kuttiady';
    if (isAdminUser(loggedInUser)) {
      defaultBranch = 'Kuttiady';
    } else if (batchOptions.some(b => b.id.toLowerCase() === loggedInUser.toLowerCase())) {
      defaultBranch = 'Kuttiady';
    } else if (loggedInUser && loggedInUser.includes('@')) {
      const branchPart = loggedInUser.split('@')[1];
      defaultBranch = branches.find(b => b.toLowerCase() === branchPart) || 'Kuttiady';
    }

    const student = {
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
      ...newStudent,
      branch: (loggedInUser && loggedInUser.startsWith('batch'))
        ? defaultBranch
        : ((isAdminUser(loggedInUser) || appMode === 'login' || appMode === 'superadmin-login') ? newStudent.branch : defaultBranch),
      status: "Active",
      admissionPaid: false,
      paidMonths: {},
      performanceScore: 50
    };

    setStudents([...students, student]);
    setIsAddModalOpen(false);

    fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    })
      .then(res => res.json())
      .catch(err => console.error("Error creating student:", err));

    if (appMode === 'login' || appMode === 'superadmin-login') {
      alert(`Enrollment request for ${newStudent.name} submitted successfully!`);
    }

    setNewStudent({ name: '', age: '', phone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: defaultBranch, photo: null });
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
    const joinMonthStr = student.joinDate ? student.joinDate.slice(0, 7) : currentMonthStr; // YYYY-MM

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

  // --- Public Website View ---
  const renderPublic = () => (
    <div className="public-layout">
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
      let totalMarked = 0;

      if (dayRecord) {
        Object.values(dayRecord).forEach(status => {
          totalMarked++;
          if (status === 'present') presentCount++;
        });
      }

      days.push(
        <div key={i} className={`calendar-day ${dateStr === markingDate ? 'today' : ''}`} onClick={() => setMarkingDate(dateStr)} style={{ cursor: 'pointer' }}>
          <div className="day-number">{i}</div>
          <div className="day-content">
            {totalMarked > 0 && (
              <div className="attendance-indicator">
                {presentCount >= (searchedStudents.length * 0.7) ? (
                  <span className="text-success"><CheckCircle size={14} /> {presentCount}</span>
                ) : (
                  <span className="text-warning"><XCircle size={14} /> {presentCount}</span>
                )}
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
              <div className="panel-header">
                <h3 className="panel-title">Daily Attendance</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Date:</span>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                    value={markingDate}
                    onChange={(e) => setMarkingDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-row" style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem' }}>Time:</span>
                <button className={`btn-small ${attendanceBatchFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('All')}>All</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Morning' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Morning')}>Morning</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Evening' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Evening')}>Evening</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Night' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Night')}>Night</button>
              </div>

              {(!loggedInUser || !loggedInUser.startsWith('batch')) && (
                <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem' }}>Batch:</span>
                  <button className={`btn-small ${attendanceScheduleFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('All')}>All Batches</button>
                  {batchOptions.map(opt => (
                    <button
                      key={opt.id}
                      className={`btn-small ${attendanceScheduleFilter === opt.schedule ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setAttendanceScheduleFilter(opt.schedule)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="table-responsive">
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
                      const matchSchedule = attendanceScheduleFilter === 'All' || s.schedule === attendanceScheduleFilter;
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
                          <td data-label="Batch Info"><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{student.schedule} • {student.batch}</span></td>
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
                                onClick={() => markAttendance(student.id, 'present')}
                              >
                                <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Present
                              </button>
                              <button
                                className={`btn-small ${status === 'absent' ? 'btn-primary' : ''}`}
                                style={status === 'absent' ? { backgroundColor: '#F44336', borderColor: '#F44336' } : {}}
                                onClick={() => markAttendance(student.id, 'absent')}
                              >
                                <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Absent
                              </button>
                              <button
                                className="btn-small"
                                style={!status ? { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', color: 'white' } : { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}
                                onClick={() => markAttendance(student.id, 'none')}
                              >
                                <X size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> None
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
      const matchSchedule = feeScheduleFilter === 'All' || s.schedule === feeScheduleFilter;
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
              const defaultBranch = isAdminUser(loggedInUser) ? 'Kuttiady' : (branches.find(b => b.toLowerCase() === (loggedInUser && loggedInUser.split('@')[1])) || 'Kuttiady');
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
            <h3 className="panel-title">Student Fee Roster ({formatMonthName(feeMonth)})</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span className="badge badge-green">{totalPaid} Paid Monthly</span>
              <span className="badge badge-orange">{totalUnpaid} Pending Monthly</span>
            </div>
          </div>

          <div className="filter-row" style={{ marginBottom: (!loggedInUser || !loggedInUser.startsWith('batch')) ? '0.75rem' : '1.5rem', marginTop: '1.25rem', paddingBottom: '0.25rem' }}>
            <span style={{ color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem' }}>Time:</span>
            <button className={`btn-small ${feeBatchFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('All')}>All</button>
            <button className={`btn-small ${feeBatchFilter === 'Morning' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Morning')}>Morning</button>
            <button className={`btn-small ${feeBatchFilter === 'Evening' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Evening')}>Evening</button>
            <button className={`btn-small ${feeBatchFilter === 'Night' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeBatchFilter('Night')}>Night</button>
          </div>

          {(!loggedInUser || !loggedInUser.startsWith('batch')) && (
            <div className="filter-row" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem' }}>Batch:</span>
              <button className={`btn-small ${feeScheduleFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFeeScheduleFilter('All')}>All Batches</button>
              {batchOptions.map(opt => (
                <button
                  key={opt.id}
                  className={`btn-small ${feeScheduleFilter === opt.schedule ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFeeScheduleFilter(opt.schedule)}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          )}

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
                    <th style={{ textAlign: 'center' }}>Other Months</th>
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
                        <td data-label="Batch Time"><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{student.batch}</span></td>
                        <td data-label={`Admission (₹${admissionFeeRate})`} style={{ textAlign: 'center' }}>
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
                        <td data-label={`Monthly (${formatMonthName(feeMonth)})`} style={{ textAlign: 'center' }}>
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
                        <td data-label="Other Months" style={{ textAlign: 'center' }}>
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
                                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '4px', whiteSpace: 'nowrap' }}>
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
              Branch: <strong>{student.branch}</strong> • Batch: <strong>{student.batch}</strong> ({student.schedule})
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
              </tr>
            </thead>
            <tbody>
              {searchedStudents.map(student => (
                <tr key={student.id}>
                  <td data-label="Name" style={{ fontWeight: 500, color: 'var(--color-text-light)' }}>{student.name}</td>
                  <td data-label="Belt Level"><span className={`badge ${getBeltColorClass(student.belt)}`}>{student.belt}</span></td>
                  <td data-label="Batch"><span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{student.schedule}</span></td>
                  <td data-label="Skill Score"><span style={{ fontWeight: 'bold', color: student.performanceScore > 80 ? '#4CAF50' : '#FF9800' }}>{student.performanceScore}/100</span></td>
                  <td data-label="Progress to Next Belt" style={{ width: '30%' }}>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${student.performanceScore}%` }}></div>
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
                          <a href={`https://wa.me/${student.phone}?text=${encodedMsg}`} target="_blank" rel="noreferrer" className="btn-small" style={{ background: '#25D366', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                            <MessageCircle size={14} /> WhatsApp
                          </a>
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

  const renderCredentialsList = () => {
    const isSuper = isAdminUser(loggedInUser);

    if (!isSuper) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Only administrators can view credentials.</p>
        </div>
      );
    }

    if (loadingRawCreds) {
      return (
        <div className="panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading credentials database...</p>
        </div>
      );
    }

    if (!rawCredentials) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No credentials data found or failed to load.</p>
        </div>
      );
    }

    const { adminCredentials = {}, branchCredentials = {}, batchCredentials = {} } = rawCredentials;

    return (
      <div className="credentials-view" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Notice alert */}
        <div className="panel" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)', background: 'rgba(229, 9, 20, 0.05)' }}>
          <h4 style={{ margin: 0, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--color-primary)" />
            Security notice: Encrypted Credentials View
          </h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
            Passwords in the system are securely one-way encrypted using PBKDF2 with unique salts to protect user privacy.
            Hashed passwords are displayed in their raw storage format below. Legacy or plain-text passwords will appear in clear text if any exist.
            To modify any username or password, please go to the <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }} onClick={(e) => { e.preventDefault(); setCurrentView('settings'); }}>Account Settings</a> page.
          </p>
        </div>

        {/* Superadmin Accounts Panel */}
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="panel-title">Super Admin Accounts</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table responsive-table-cards">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Password Hash / Salt String</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(adminCredentials).map(([username, hash]) => (
                  <tr key={username}>
                    <td data-label="Username" style={{ fontWeight: 600, color: 'white' }}>{username}</td>
                    <td data-label="Role"><span className="badge badge-green">Superadmin</span></td>
                    <td data-label="Password Hash" style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--color-text-muted)' }}>
                      {hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branch Coordinator Accounts Panel */}
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="panel-title">Branch Coordinator Accounts</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table responsive-table-cards">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Password Hash / Salt String</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(branchCredentials).length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem' }}>No branch coordinators configured.</td>
                  </tr>
                ) : (
                  Object.entries(branchCredentials).map(([branchKey, info]) => (
                    <tr key={branchKey}>
                      <td data-label="Branch Name" style={{ fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>{branchKey}</td>
                      <td data-label="Username" style={{ color: 'var(--color-text-light)' }}>{info.username}</td>
                      <td data-label="Role"><span className="badge" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.3)' }}>Branch Admin</span></td>
                      <td data-label="Password Hash" style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--color-text-muted)' }}>
                        {info.password}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch Coordinator Accounts Panel */}
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="panel-title">Batch Coordinator / Coach Accounts</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table responsive-table-cards">
              <thead>
                <tr>
                  <th>Batch Identification</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Password Hash / Salt String</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(batchCredentials).length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem' }}>No batch coordinators configured.</td>
                  </tr>
                ) : (
                  Object.entries(batchCredentials).map(([batchKey, info]) => {
                    const parts = batchKey.split('_');
                    const branchName = parts[0];
                    const batchId = parts[1] || '';
                    
                    // Try to resolve human-readable batch name
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

                    return (
                      <tr key={batchKey}>
                        <td data-label="Batch" style={{ fontWeight: 600, color: 'white' }}>
                          <span style={{ textTransform: 'capitalize' }}>{branchName}</span> - {batchNameText}
                        </td>
                        <td data-label="Username" style={{ color: 'var(--color-text-light)' }}>{info.username}</td>
                        <td data-label="Role"><span className="badge" style={{ background: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6', border: '1px solid rgba(155, 89, 182, 0.3)' }}>Coach / Trainer</span></td>
                        <td data-label="Password Hash" style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--color-text-muted)' }}>
                          {info.password}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

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

    const handleAddBranch = (e) => {
      e.preventDefault();
      const newBrClean = newBranchForm.name.trim();
      const user = newBranchForm.username.trim();
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
      const finalUser = user || defaultUser;

      const updatedCustomBranches = [...customBranches, newBrClean];
      const updatedBranchCreds = {
        ...branchCredentials,
        [newBrLower]: { username: finalUser, password: pass }
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
      if (DEFAULT_BRANCHES.includes(branchToDelete)) {
        setSettingsError('Cannot delete default system branches!');
        return;
      }
      if (!window.confirm(`Are you sure you want to delete the branch "${branchToDelete}"?`)) {
        return;
      }

      const branchKey = branchToDelete.toLowerCase().trim();
      const updatedCustomBranches = customBranches.filter(b => b.toLowerCase().trim() !== branchKey);

      // Also delete from branchCredentials map
      const updatedBranchCreds = { ...branchCredentials };
      delete updatedBranchCreds[branchKey];

      // Optimistically update
      setCustomBranches(updatedCustomBranches);
      setBranchCredentials(updatedBranchCreds);
      
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
          branchCredentials: updatedBranchCreds
        })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete branch on server');
          return res.json();
        })
        .then(data => {
          setCustomBranches(data.customBranches || []);
          setBranchCredentials(data.branchCredentials || {});
          
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

    const handleAddBatch = (e) => {
      e.preventDefault();
      const name = newBatchForm.name.trim();
      const schedule = newBatchForm.schedule.trim();
      const br = newBatchForm.branch.toLowerCase();
      const user = newBatchForm.username.trim();
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
      const finalUser = user || defaultUser;

      const updatedCustomBatches = [...customBatches, newBatchObj];
      const updatedBatchCreds = {
        ...batchCredentials,
        [key]: { username: finalUser, password: pass }
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
          setBatchOptions([...DEFAULT_BATCH_OPTIONS, ...(data.customBatches || [])]);
          setBatchCredentials(data.batchCredentials || {});
          setNewBatchForm({ name: '', schedule: '', branch: 'kuttiady', username: '', password: '', confirmPassword: '' });
          setSettingsSuccess(`Batch "${name}" added and credentials configured successfully!`);
        })
        .catch(err => {
          setSettingsError('Error adding batch: ' + err.message);
        });
    };

    const handleDeleteCustomBatch = (batchIdToDelete, batchName) => {
      if (DEFAULT_BATCH_OPTIONS.some(b => b.id === batchIdToDelete)) {
        setSettingsError('Cannot delete default system batches!');
        return;
      }
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
      setBatchOptions([...DEFAULT_BATCH_OPTIONS, ...updatedCustomBatches]);
      setBatchCredentials(updatedBatchCreds);

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
          setBatchOptions([...DEFAULT_BATCH_OPTIONS, ...(data.customBatches || [])]);
          setBatchCredentials(data.batchCredentials || {});
          setSettingsSuccess(`Batch "${batchName}" deleted successfully!`);
        })
        .catch(err => {
          setSettingsError('Error deleting batch: ' + err.message);
          reloadAllAppData();
        });
    };

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


    const handleUpdateAdmin = (e) => {
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

      const updatedAdminCreds = { ...adminCredentials };
      if (user !== acc) {
        delete updatedAdminCreds[acc];
      }
      updatedAdminCreds[user] = pass;

      fetch(`${API_BASE_URL}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCredentials: updatedAdminCreds })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update credentials on server');
          return res.json();
        })
        .then(data => {
          setAdminCredentials(data.adminCredentials || {});
          setSettingsSuccess(`Admin account "${user}" credentials updated successfully!`);
          setAdminForm({ account: 'admin', newUsername: '', newPassword: '', confirmPassword: '' });
        })
        .catch(err => {
          setSettingsError('Error updating credentials: ' + err.message);
        });
    };

    const handleCreateAdmin = (e) => {
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

      if (adminCredentials[user]) {
        setSettingsError('Username already exists');
        return;
      }

      if (pass !== createAdminForm.confirmPassword) {
        setCreateAdminPasswordError('Passwords do not match');
        return;
      }

      const updatedAdminCreds = { ...adminCredentials, [user]: pass };

      fetch(`${API_BASE_URL}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCredentials: updatedAdminCreds })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to create account on server');
          return res.json();
        })
        .then(data => {
          setAdminCredentials(data.adminCredentials || {});
          setSettingsSuccess(`New Admin account "${user}" created successfully!`);
          setCreateAdminForm({ username: '', password: '', confirmPassword: '' });
        })
        .catch(err => {
          setSettingsError('Error creating admin account: ' + err.message);
        });
    };

    const handleDeleteAdminAccount = (accountToDelete) => {
      if (Object.keys(adminCredentials).length <= 1) {
        setSettingsError('You cannot delete the last remaining admin account.');
        return;
      }
      if (accountToDelete.toLowerCase().trim() === loggedInUser.toLowerCase().trim()) {
        setSettingsError('You cannot delete the account you are currently logged in with.');
        return;
      }
      if (!window.confirm(`Are you sure you want to delete the admin account "${accountToDelete}"?`)) {
        return;
      }

      const updatedAdminCreds = { ...adminCredentials };
      delete updatedAdminCreds[accountToDelete];

      fetch(`${API_BASE_URL}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCredentials: updatedAdminCreds })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete account on server');
          return res.json();
        })
        .then(data => {
          setAdminCredentials(data.adminCredentials || {});
          setSettingsSuccess(`Admin account "${accountToDelete}" deleted successfully!`);
          setAdminForm({ account: 'admin', newUsername: '', newPassword: '', confirmPassword: '' });
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
          setSettingsSuccess(`Branch Coordinator credentials for "${br.toUpperCase()}" updated successfully!`);
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
          setSettingsSuccess(`Batch Coordinator credentials for "${br.toUpperCase()} - ${bt.toUpperCase()}" updated successfully!`);
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

            {/* Admin Accounts Settings */}
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="panel-title">Update Admin Accounts</h3>
              </div>
              <form onSubmit={handleUpdateAdmin}>
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
              <form onSubmit={handleCreateAdmin}>
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

        {isSuper && (
          <>
            {/* Coordinator Passwords Management */}
            <div className="grid-2-col" style={{ gap: '2rem' }}>
              {/* Branch Passwords */}
              <div className="panel">
                <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                  <h3 className="panel-title">Manage Branch Credentials</h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Current Username: <strong style={{ color: 'var(--color-text-light)' }}>{branchCredentials[branchForm.branch]?.username || `admin@${branchForm.branch}`}</strong>
                </div>
                <form onSubmit={handleUpdateBranchPassword}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Select Branch</label>
                    <select className="form-control" value={branchForm.branch} onChange={(e) => setBranchForm({ branch: e.target.value, newUsername: '', newPassword: '', confirmPassword: '' })}>
                      {branches.map(br => (
                        <option key={br} value={br.toLowerCase()}>{br}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>New Username (Optional)</label>
                    <input type="text" className="form-control" placeholder="Enter new username" value={branchForm.newUsername} onChange={(e) => setBranchForm({ ...branchForm, newUsername: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>New Password</label>
                    <input type="password" className="form-control" placeholder="Enter new password" required value={branchForm.newPassword} onChange={(e) => { setBranchForm({ ...branchForm, newPassword: e.target.value }); setBranchPasswordError(''); }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Confirm Password</label>
                    <input type="password" className="form-control" placeholder="Confirm new password" required value={branchForm.confirmPassword} onChange={(e) => { setBranchForm({ ...branchForm, confirmPassword: e.target.value }); setBranchPasswordError(''); }} />
                    {branchPasswordError && (
                      <div style={{ color: '#E50914', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{branchPasswordError}</div>
                    )}
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Branch Credentials</button>
                </form>
              </div>

              {/* Batch Passwords */}
              <div className="panel">
                <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                  <h3 className="panel-title">Manage Batch Credentials</h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Current Username: <strong style={{ color: 'var(--color-text-light)' }}>{batchCredentials[`${batchForm.branch}_${batchForm.batch}`]?.username || `${batchForm.batch}@${batchForm.branch}`}</strong>
                </div>
                <form onSubmit={handleUpdateBatchPassword}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Select Branch</label>
                    <select className="form-control" value={batchForm.branch} onChange={(e) => setBatchForm({ ...batchForm, branch: e.target.value, newUsername: '', newPassword: '', confirmPassword: '' })}>
                      {branches.map(br => (
                        <option key={br} value={br.toLowerCase()}>{br}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Select Batch</label>
                    <select className="form-control" value={batchForm.batch} onChange={(e) => setBatchForm({ ...batchForm, batch: e.target.value, newUsername: '', newPassword: '', confirmPassword: '' })}>
                      {batchOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>New Username (Optional)</label>
                    <input type="text" className="form-control" placeholder="Enter new username" value={batchForm.newUsername} onChange={(e) => setBatchForm({ ...batchForm, newUsername: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>New Password</label>
                    <input type="password" className="form-control" placeholder="Enter new password" required value={batchForm.newPassword} onChange={(e) => { setBatchForm({ ...batchForm, newPassword: e.target.value }); setBatchPasswordError(''); }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Confirm Password</label>
                    <input type="password" className="form-control" placeholder="Confirm new password" required value={batchForm.confirmPassword} onChange={(e) => { setBatchForm({ ...batchForm, confirmPassword: e.target.value }); setBatchPasswordError(''); }} />
                    {batchPasswordError && (
                      <div style={{ color: '#E50914', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{batchPasswordError}</div>
                    )}
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Batch Credentials</button>
                </form>
              </div>
            </div>

            {/* Manage Branches & Batches Options */}
            <div className="grid-2-col" style={{ gap: '2rem', marginTop: '2rem' }}>
              {/* Branch List and Add Form */}
              <div className="panel">
                <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                  <h3 className="panel-title">Add & Manage Branches</h3>
                </div>

                <form onSubmit={handleAddBranch} style={{ marginBottom: '2rem' }}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Branch Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Vatakara"
                      value={newBranchForm.name}
                      onChange={(e) => setNewBranchForm({ ...newBranchForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Coordinator Username (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. admin@vatakara (auto-default)"
                      value={newBranchForm.username}
                      onChange={(e) => setNewBranchForm({ ...newBranchForm, username: e.target.value })}
                    />
                  </div>
                  <div className="grid-2-col" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label>Coordinator Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                        value={newBranchForm.password}
                        onChange={(e) => { setNewBranchForm({ ...newBranchForm, password: e.target.value }); setNewBranchPasswordError(''); }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm password"
                        value={newBranchForm.confirmPassword}
                        onChange={(e) => { setNewBranchForm({ ...newBranchForm, confirmPassword: e.target.value }); setNewBranchPasswordError(''); }}
                        required
                      />
                      {newBranchPasswordError && (
                        <div style={{ color: '#E50914', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{newBranchPasswordError}</div>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Branch & Credentials</button>
                </form>

                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Custom Branches List</label>
                {customBranches.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No custom branches added yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table responsive-table-cards">
                      <thead>
                        <tr>
                          <th>Branch Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customBranches.map(br => (
                          <tr key={br}>
                            <td data-label="Branch Name" style={{ color: 'var(--color-text-light)' }}>{br}</td>
                            <td data-label="Action">
                              <button
                                type="button"
                                className="btn-small"
                                style={{ backgroundColor: '#F44336', borderColor: '#F44336' }}
                                onClick={() => handleDeleteCustomBranch(br)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Batch List and Add Form */}
              <div className="panel">
                <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                  <h3 className="panel-title">Add & Manage Batches</h3>
                </div>

                <form onSubmit={handleAddBatch} style={{ marginBottom: '2rem' }}>
                  <div className="grid-2-col" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label>Batch Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Batch 4 (Sat - Sun)"
                        value={newBatchForm.name}
                        onChange={(e) => setNewBatchForm({ ...newBatchForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Schedule Pattern</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Sat-Sun"
                        value={newBatchForm.schedule}
                        onChange={(e) => setNewBatchForm({ ...newBatchForm, schedule: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-2-col" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label>Configure Credentials for Branch</label>
                      <select
                        className="form-control"
                        value={newBatchForm.branch}
                        onChange={(e) => setNewBatchForm({ ...newBatchForm, branch: e.target.value })}
                      >
                        {branches.map(br => (
                          <option key={br} value={br.toLowerCase()}>{br}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Coordinator Username (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. batch_id@branch (auto)"
                        value={newBatchForm.username}
                        onChange={(e) => setNewBatchForm({ ...newBatchForm, username: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2-col" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label>Coordinator Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                        value={newBatchForm.password}
                        onChange={(e) => { setNewBatchForm({ ...newBatchForm, password: e.target.value }); setNewBatchPasswordError(''); }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm password"
                        value={newBatchForm.confirmPassword}
                        onChange={(e) => { setNewBatchForm({ ...newBatchForm, confirmPassword: e.target.value }); setNewBatchPasswordError(''); }}
                        required
                      />
                      {newBatchPasswordError && (
                        <div style={{ color: '#E50914', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{newBatchPasswordError}</div>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Batch & Credentials</button>
                </form>

                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Custom Batches List</label>
                {customBatches.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No custom batches added yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table responsive-table-cards">
                      <thead>
                        <tr>
                          <th>Batch Details</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customBatches.map(bt => (
                          <tr key={bt.id}>
                            <td data-label="Batch Details">
                              <div style={{ color: 'var(--color-text-light)' }}>{bt.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pattern: {bt.schedule}</div>
                            </td>
                            <td data-label="Action">
                              <button
                                type="button"
                                className="btn-small"
                                style={{ backgroundColor: '#F44336', borderColor: '#F44336' }}
                                onClick={() => handleDeleteCustomBatch(bt.id, bt.name)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // --- Admin Login View ---
  const renderLogin = () => {
    return (
      <div className="login-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflowY: 'auto', padding: '2rem 1rem' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,5,0.85)' }}></div>
        <div className="login-grid-overlay"></div>
        <div className="login-bg-glows">
          <div className="login-glow-1"></div>
          <div className="login-glow-2"></div>
          <div className="login-glow-3"></div>
        </div>
        <div className={`glass-panel login-card-animated ${isLoggingIn ? 'submitting' : ''}`} style={{ zIndex: 1, padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 className="brand animate-item-1" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
            <span className="brand-accent">MASTER</span> FIT Login
          </h2>
          <p className="animate-item-2" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Branch & Batch Portal</p>
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
                    loginType: 'coordinator',
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
                      setSession(data.username, data.token);
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
                <div className="form-group animate-item-3" style={{ textAlign: 'left' }}>
                  <label>Select Branch</label>
                  <select
                    className="form-control form-control-animated"
                    value={selectedBranchLogin}
                    disabled={isLoggingIn}
                    onChange={(e) => setSelectedBranchLogin(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                  >
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group animate-item-4" style={{ textAlign: 'left' }}>
                  <label>Select Batch</label>
                  <select
                    className="form-control form-control-animated"
                    value={selectedBatchLogin}
                    disabled={isLoggingIn}
                    onChange={(e) => setSelectedBatchLogin(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                  >
                    <option value="admin">Branch Admin (All Batches)</option>
                    {batchOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group animate-item-5" style={{ textAlign: 'left' }}>
                  <label>Username</label>
                  <input type="text" className="form-control form-control-animated" placeholder="Enter username" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} disabled={isLoggingIn} required />
                </div>
                <div className="form-group animate-item-6" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ margin: 0 }}>Password</label>
                    <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); if (!isLoggingIn) { setIsForgotPassword(true); setLoginError(''); } }}>Forgot Password?</a>
                  </div>
                  <input type="password" className="form-control form-control-animated" placeholder="Enter password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} disabled={isLoggingIn} required />
                </div>
                <button type="submit" className="btn-primary animate-item-7" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isLoggingIn}>
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
              <button type="button" className="btn-secondary animate-item-7" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }} disabled={isLoggingIn} onClick={() => {
                setNewStudent({ name: '', age: '', phone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: selectedBranchLogin, photo: null });
                setIsAddModalOpen(true);
              }}>
                <UserPlus size={16} /> Enroll New Student
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }} className="animate-item-7">
                <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} disabled={isLoggingIn} onClick={() => { setLoginError(''); setAppMode('superadmin-login'); }}>
                  Switch to Admin Login
                </button>
                <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} disabled={isLoggingIn} onClick={() => { setLoginError(''); setAppMode('website'); }}>
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
    <div className="login-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflowY: 'auto', padding: '2rem 1rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,5,0.85)' }}></div>
      <div className="login-grid-overlay"></div>
      <div className="login-bg-glows">
        <div className="login-glow-1"></div>
        <div className="login-glow-2"></div>
        <div className="login-glow-3"></div>
      </div>
      <div className={`glass-panel login-card-animated ${isLoggingIn ? 'submitting' : ''}`} style={{ zIndex: 1, padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 className="brand animate-item-1" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
          <span className="brand-accent">MASTER</span> FIT Admin
        </h2>
        <p className="animate-item-2" style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Portal</p>
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
                    setSession(data.username, data.token);
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
              <div className="form-group animate-item-3" style={{ textAlign: 'left' }}>
                <label>Admin Username</label>
                <input type="text" className="form-control form-control-animated" placeholder="Enter admin username" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} disabled={isLoggingIn} required />
              </div>
              <div className="form-group animate-item-4" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ margin: 0 }}>Password</label>
                  <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); if (!isLoggingIn) { setIsForgotPassword(true); setLoginError(''); } }}>Forgot Password?</a>
                </div>
                <input type="password" className="form-control form-control-animated" placeholder="Enter password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} disabled={isLoggingIn} required />
              </div>
              <button type="submit" className="btn-primary animate-item-5" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isLoggingIn}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }} className="animate-item-6">
              <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} disabled={isLoggingIn} onClick={() => { setLoginError(''); setAppMode('login'); }}>
                Switch to Coordinator Login
              </button>
              <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} disabled={isLoggingIn} onClick={() => { setLoginError(''); setAppMode('website'); }}>
                Back to Website
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (appMode === 'website') {
    return renderPublic();
  }

  if (appMode === 'login') {
    return renderLogin();
  }

  if (appMode === 'superadmin-login') {
    return renderSuperAdminLogin();
  }



  // --- Main Admin Dashboard Template ---
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
          {isAdminUser(loggedInUser) && (
            <a className={`nav-item ${currentView === 'credentials-list' ? 'active' : ''}`} onClick={() => setCurrentView('credentials-list')}>
              <Lock className="nav-icon" /> <span>All Credentials</span>
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
        <header className="header">
          <div className="header-main-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="mobile-menu-btn" style={{ padding: 0 }} onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <h1 className="page-title">
                {currentView === 'dashboard' && 'Admin Dashboard'}
                {currentView === 'attendance' && 'Attendance Tracking'}
                {currentView === 'fees' && 'Fee Management'}
                {currentView === 'reminders' && 'Alerts & Reminders'}
                {currentView === 'performance' && 'Student Performance'}
                {currentView === 'settings' && 'Account Settings'}
                {currentView === 'credentials-list' && 'System Accounts & Credentials'}
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
                style={{ padding: '0.5rem 1rem', paddingRight: '2rem', width: '180px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                disabled={!isAdminUser(loggedInUser)}
              >
                {isAdminUser(loggedInUser) && <option value="All">All Branches</option>}
                {isAdminUser(loggedInUser) ? (
                  branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))
                ) : (
                  <option value={branchFilter}>{branchFilter}</option>
                )}
              </select>
            </div>
            {/* Status Filter Selector */}
            {(currentView === 'dashboard' || currentView === 'performance') && (
              <div style={{ position: 'relative' }}>
                <select
                  className="form-control"
                  style={{ padding: '0.5rem 1rem', paddingRight: '2rem', width: '150px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
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
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search students..."
                className="form-control"
                style={{ paddingLeft: '36px', width: '250px', height: '38px', paddingTop: 0, paddingBottom: 0 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="user-profile">
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500, textTransform: 'capitalize' }}>
                {loggedInUser} Panel
              </span>
              <div className="avatar">{loggedInUser.charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {currentView === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper"><Users className="stat-icon" /></div>
                  <div className="stat-details">
                    <h3>Active Students</h3>
                    <p className="stat-value">{searchedStudents.length}</p>
                  </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('attendance')}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                    <CalendarDays className="stat-icon" style={{ color: '#2196F3' }} />
                  </div>
                  <div className="stat-details">
                    <h3>Classes Today</h3>
                    <p className="stat-value" style={{ color: '#2196F3' }}>3 <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Batches</span></p>
                  </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('reminders')}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <AlertTriangle className="stat-icon" style={{ color: '#FFD700' }} />
                  </div>
                  <div className="stat-details">
                    <h3>Pending Dues</h3>
                    <p className="stat-value" style={{ color: '#FFD700' }}>{searchedStudents.filter(s => !s.paidMonths || !s.paidMonths[new Date().toISOString().slice(0, 7)]).length}</p>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3 className="panel-title">Academy Roster</h3>
                  <button className="btn-primary" onClick={() => {
                    const defaultBranch = isAdminUser(loggedInUser) ? 'Kuttiady' : (branches.find(b => b.toLowerCase() === (loggedInUser && loggedInUser.split('@')[1])) || 'Kuttiady');
                    setNewStudent(prev => ({ ...prev, branch: defaultBranch }));
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
                              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{student.schedule} • {student.batch}</span>
                            </td>
                            <td data-label="Belt Level"><span className={`badge ${getBeltColorClass(student.belt)}`}>{student.belt}</span></td>
                            <td data-label="Phone" style={{ color: 'var(--color-text-muted)' }}>{student.phone}</td>
                            <td data-label="Actions">
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <a href={`tel:${student.phone}`} className="btn-icon" style={{ color: '#2196F3' }} title="Call Student">
                                  <Phone size={18} />
                                </a>
                                <a href={`https://wa.me/${student.phone}`} target="_blank" rel="noreferrer" className="btn-icon" style={{ color: '#25D366' }} title="WhatsApp Student">
                                  <MessageCircle size={18} />
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
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No students found.</div>
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
                setStudents(students.map(s => s.id === editingStudentData.id ? editingStudentData : s));
                setSelectedStudent(editingStudentData);
                setIsEditingStudent(false);

                fetch(`${API_BASE_URL}/students/${editingStudentData.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editingStudentData)
                })
                  .then(res => res.json())
                  .catch(err => console.error("Error updating student profile:", err));

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
                      <label>Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editingStudentData.phone}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Batch Schedule</label>
                      <select
                        className="form-control"
                        value={editingStudentData.schedule}
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, schedule: e.target.value })}
                      >
                        {batchOptions.map(opt => (
                          <option key={opt.id} value={opt.schedule}>{opt.name}</option>
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
                        onChange={(e) => setEditingStudentData({ ...editingStudentData, branch: e.target.value })}
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
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Phone</span>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedStudent.phone}
                        <a href={`tel:${selectedStudent.phone}`} style={{ color: '#2196F3', display: 'flex' }} title="Call"><Phone size={14} /></a>
                        <a href={`https://wa.me/${selectedStudent.phone}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', display: 'flex' }} title="WhatsApp"><MessageCircle size={14} /></a>
                      </div>
                    </div>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Join Date</span><div style={{ fontWeight: 600 }}>{selectedStudent.joinDate}</div></div>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Status</span><div style={{ fontWeight: 600, color: selectedStudent.status === 'Inactive' ? '#F44336' : '#4CAF50' }}>{selectedStudent.status || 'Active'}</div></div>
                  </div>

                  <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Academy Details</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: 'var(--color-primary)', color: 'white' }}>{selectedStudent.branch} Branch</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{selectedStudent.schedule}</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{selectedStudent.batch} Batch</span>
                    </div>
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
                  <label>Phone</label>
                  <input type="tel" className="form-control" required value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} placeholder="Phone number" />
                </div>
              </div>
              <div className="grid-2-col">
                <div className="form-group">
                  <label>Batch Schedule</label>
                  <select className="form-control" value={newStudent.schedule} onChange={(e) => setNewStudent({ ...newStudent, schedule: e.target.value })}>
                    {batchOptions.map(opt => (
                      <option key={opt.id} value={opt.schedule}>{opt.name}</option>
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
                    onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
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
                          : (branches.find(b => b.toLowerCase() === (loggedInUser && loggedInUser.split('@')[1])) || 'Kuttiady')
                      }>
                        {
                          appMode === 'login'
                            ? selectedBranchLogin
                            : (branches.find(b => b.toLowerCase() === (loggedInUser && loggedInUser.split('@')[1])) || 'Kuttiady')
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
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(229, 9, 20, 0.1)', color: '#E50914', marginBottom: '1rem' }}>
                <AlertTriangle size={32} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>Delete Student?</h2>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setStudentToDelete(null)}>Cancel</button>
              <button className="btn-primary" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
