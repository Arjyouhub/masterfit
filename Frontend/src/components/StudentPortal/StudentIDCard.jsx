import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, Download, ShieldCheck, X, User, Phone, MapPin, 
  Users, Droplet, Calendar, CreditCard
} from 'lucide-react';

export default function StudentIDCard({ student, onClose, isModal = true }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const cardRef = useRef(null);
  const displayZoneRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (!displayZoneRef.current) return;
      const parent = displayZoneRef.current.parentElement;
      const containerWidth = parent ? parent.clientWidth : window.innerWidth;
      const targetWidth = 530;
      const availableWidth = Math.min(window.innerWidth - 20, (containerWidth > 0 ? containerWidth : window.innerWidth) - 10);
      if (availableWidth < targetWidth && availableWidth > 50) {
        setScale(Math.min(1, Math.max(0.48, availableWidth / targetWidth)));
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  if (!student) return null;

  const BRANCH_CODE_MAP = {
    'KUTTIADY': 'KTY',
    'ORKKATTERI': 'OKT',
    'ORAKATTERI': 'OKT',
    'PERAMBRA': 'PBR',
    'KALLACHI': 'KLC',
    'PARAKADAV': 'PKD',
    'DEVERGOVIL': 'DGV',
    'KALLIKANDY': 'KKD',
    'CHEMBRA': 'CHM',
    'THOOVAKUNN': 'TVK',
    'ELANKODE': 'ELK',
    'SIRAJUL HUDA': 'SJH',
    'SIRAJUL-HUDA': 'SJH'
  };

  const getBranchCode = (bName) => {
    if (!bName) return 'KTY';
    const clean = String(bName).toUpperCase().trim();
    if (BRANCH_CODE_MAP[clean]) return BRANCH_CODE_MAP[clean];
    const alphaOnly = clean.replace(/[^A-Z]/g, '');
    return alphaOnly.slice(0, 3) || 'KTY';
  };

  const rawId = student.id || student.admissionNumber || '1';
  const bCode = getBranchCode(student.branch);
  const displayId = student.uniqueStudentId || `MF-${bCode}-${String(rawId).padStart(4, '0')}`;
  
  // Instant QR URL:
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrTargetId = student.uniqueStudentId || rawId;
  const qrLoginUrl = `${origin}/#/student/qr-login/${qrTargetId}`;

  // Clean Batch Display Name
  const formatBatchName = (rawBatch) => {
    if (!rawBatch) return 'Evening Batch';
    const s = String(rawBatch).trim();
    if (s.startsWith('batch_')) {
      return 'Evening Batch';
    }
    return s;
  };

  const studentName = student.name || 'Student Name';
  const studentBranch = student.branch || 'Kuttiady';
  const studentBatch = formatBatchName(student.batch);
  const studentBloodGroup = student.bloodGroup || 'O+';
  const studentPhone = student.phone || student.emergencyPhone || student.parentPhone || student.mobileNumber || '—';
  const studentJoinDate = student.joinDate || student.admissionDate || (student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jun 2024');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloadingPdf(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`MASTERFIT_ID_${displayId}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Martial Artist Kick Silhouette SVG
  const KarateSilhouette = () => (
    <svg viewBox="0 0 100 100" className="mf-karate-kick-svg" fill="#050608">
      {/* Karate practitioner in kicking pose */}
      <circle cx="78" cy="18" r="6" />
      {/* Head guard */}
      <path d="M72,15 L78,12 L84,15 L82,23 L73,23 Z" fill="#050608" />
      {/* Torso & arms */}
      <path d="M72,25 L58,34 L54,30 L66,24 Z" />
      <path d="M58,34 L46,42 L52,48 L64,38 Z" />
      <path d="M53,38 L68,44 L78,40 L76,34 L65,38 Z" />
      {/* Kicking Leg extending high left */}
      <path d="M48,44 L26,24 L14,24 L18,30 L38,48 L46,46 Z" />
      <polygon points="14,24 6,24 10,30 18,30" />
      {/* Supporting Leg */}
      <path d="M48,46 L42,68 L48,84 L55,84 L50,68 L56,48 Z" />
      <polygon points="48,84 42,88 56,88 55,84" />
      {/* Belt knot & ties */}
      <path d="M52,44 L44,52 L46,55 L54,46 Z" />
      <path d="M50,46 L46,58 L49,60 L53,47 Z" />
    </svg>
  );

  // Official MF Logo SVG
  const MFLogo = () => (
    <svg viewBox="0 0 110 70" className="mf-brand-logo-svg">
      <g transform="skewX(-14)">
        {/* M */}
        <path d="M6,52 L17,12 L28,34 L39,12 L50,52 L39,52 L34,29 L28,42 L23,29 L18,52 Z" fill="#ffffff" />
        {/* F */}
        <path d="M55,12 L84,12 L81,21 L65,21 L63,31 L78,31 L75,40 L61,40 L58,52 L47,52 Z" fill="#E50914" />
        {/* Swoosh Underline */}
        <path d="M4,57 Q40,66 90,52 Q50,72 4,57 Z" fill="#E50914" />
      </g>
    </svg>
  );

  const CardFront = () => (
    <div id="printable-id-card" ref={cardRef} className="mf-official-card">
      {/* 1. TOP HEADER (Black with red geometric cuts & martial artist) */}
      <div className="mf-card-top-header">
        {/* Left: MF Logo */}
        <div className="mf-logo-group">
          <MFLogo />
          <div className="mf-header-divider"></div>
          <div className="mf-title-group">
            <h1 className="mf-academy-title">
              MASTER<span className="text-red">FIT</span>
            </h1>
            <span className="mf-academy-subtitle">ACADEMY</span>
            <div className="mf-sports-bar">
              <span>KARATE</span>
              <span className="bar-pipe">|</span>
              <span>KICKBOXING</span>
              <span className="bar-pipe">|</span>
              <span>FITNESS</span>
              <span className="bar-pipe">|</span>
              <span>SELF DEFENCE</span>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Red Angle with Karate Silhouette */}
        <div className="mf-header-angle-graphic">
          <div className="mf-red-slash-bg">
            <KarateSilhouette />
          </div>
        </div>
      </div>

      {/* 2. RED SLANTED BANNER: STUDENT ID CARD */}
      <div className="mf-banner-container">
        <div className="mf-slanted-red-banner">
          <span>STUDENT ID CARD</span>
        </div>
      </div>

      {/* 3. CARD BODY (White background with photo, info list, and QR) */}
      <div className="mf-card-middle-body">
        {/* Left: Student Photo with Red Border Frame */}
        <div className="mf-photo-outer-frame">
          <div className="mf-photo-inner-box">
            {student.photo ? (
              <img src={student.photo} alt={studentName} className="mf-real-student-photo" />
            ) : (
              <div className="mf-avatar-placeholder">
                <User size={68} color="#94a3b8" />
              </div>
            )}
          </div>
        </div>

        {/* Center: Clean Details List with Red Icons */}
        <div className="mf-details-list">
          {/* Name */}
          <div className="mf-detail-row">
            <div className="mf-row-icon">
              <User size={13} color="#E50914" />
            </div>
            <span className="mf-row-label">Name</span>
            <span className="mf-row-colon">:</span>
            <span className="mf-row-value student-name-text">{studentName}</span>
          </div>

          {/* Student ID (Solid Red Pill) */}
          <div className="mf-detail-row">
            <div className="mf-row-icon">
              <CreditCard size={13} color="#E50914" />
            </div>
            <span className="mf-row-label">Student ID</span>
            <span className="mf-row-colon">:</span>
            <div className="mf-solid-id-pill">
              <span>{displayId}</span>
            </div>
          </div>

          {/* Branch */}
          <div className="mf-detail-row">
            <div className="mf-row-icon">
              <MapPin size={13} color="#E50914" />
            </div>
            <span className="mf-row-label">Branch</span>
            <span className="mf-row-colon">:</span>
            <span className="mf-row-value">{studentBranch}</span>
          </div>

          {/* Batch */}
          <div className="mf-detail-row">
            <div className="mf-row-icon">
              <Users size={13} color="#E50914" />
            </div>
            <span className="mf-row-label">Batch</span>
            <span className="mf-row-colon">:</span>
            <span className="mf-row-value">{studentBatch}</span>
          </div>

          {/* Blood Group */}
          <div className="mf-detail-row">
            <div className="mf-row-icon">
              <Droplet size={13} color="#E50914" />
            </div>
            <span className="mf-row-label">Blood Group</span>
            <span className="mf-row-colon">:</span>
            <span className="mf-row-value blood-value">{studentBloodGroup}</span>
          </div>

          {/* Phone / Contact */}
          <div className="mf-detail-row">
            <div className="mf-row-icon">
              <Phone size={13} color="#E50914" />
            </div>
            <span className="mf-row-label">Contact No</span>
            <span className="mf-row-colon">:</span>
            <span className="mf-row-value phone-value">{studentPhone}</span>
          </div>

          {/* Admission Date */}
          <div className="mf-detail-row">
            <div className="mf-row-icon">
              <Calendar size={13} color="#E50914" />
            </div>
            <span className="mf-row-label">Admission Date</span>
            <span className="mf-row-colon">:</span>
            <span className="mf-row-value date-value">{studentJoinDate}</span>
          </div>
        </div>

        {/* Right: Pure, Clean QR Code with Divider */}
        <div className="mf-qr-clean-zone">
          <div className="mf-qr-vertical-divider"></div>
          <div className="mf-qr-box">
            <QRCodeSVG 
              value={qrLoginUrl}
              size={94}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
            {/* Center mini MF emblem */}
            <div className="mf-qr-center-badge">
              <svg viewBox="0 0 70 45" style={{ width: '15px', height: '10px' }}>
                <g transform="skewX(-14)">
                  <path d="M4,36 L12,8 L20,24 L28,8 L36,36 L28,36 L24,20 L20,30 L16,20 L12,36 Z" fill="#ffffff" />
                  <path d="M40,8 L62,8 L60,15 L48,15 L46,22 L58,22 L56,29 L44,29 L42,36 L34,36 Z" fill="#E50914" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM FOOTER (Geometric red/black polygons & white cursive signature) */}
      <div className="mf-card-bottom-footer">
        {/* Left: Dynamic red chevron angles & speed bars */}
        <div className="mf-footer-geom-left">
          <div className="geom-red-block"></div>
          <div className="geom-red-cut"></div>
          <div className="geom-speed-bars">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>

        {/* Right: Authorised Signature */}
        <div className="mf-signature-block">
          <svg viewBox="0 0 130 36" className="mf-script-sig-svg">
            <path 
              d="M 12 28 C 22 10, 28 6, 36 18 C 42 27, 48 30, 56 12 C 62 0, 70 8, 76 22 C 82 14, 90 10, 102 18 C 114 26, 120 18, 126 14" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <div className="mf-sig-red-line"></div>
          <span className="mf-sig-label">Authorised Signature</span>
        </div>
      </div>
    </div>
  );

  // Standalone inline card rendering (e.g. Student Portal tab or bulk print)
  if (!isModal) {
    return (
      <div className="id-card-standalone-wrapper">
        <div className="id-card-inline-toolbar no-print">
          <div className="toolbar-title">
            <ShieldCheck size={20} color="#E50914" />
            <span>Official MASTERFIT Student ID Card</span>
          </div>
          <div className="toolbar-actions">
            <button className="id-btn download-btn" onClick={handleDownloadPDF} disabled={downloadingPdf}>
              <Download size={16} />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button className="id-btn print-btn" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print Card</span>
            </button>
          </div>
        </div>
        <div 
          ref={displayZoneRef} 
          className="id-cards-display-zone" 
          style={{ 
            height: scale < 1 ? `${Math.ceil(335 * scale)}px` : 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'hidden'
          }}
        >
          <div 
            className="id-card-scaler" 
            style={{ 
              transform: scale < 1 ? `scale(${scale})` : 'none',
              transformOrigin: 'top center',
              width: '530px',
              height: '335px'
            }}
          >
            <CardFront />
          </div>
        </div>

        {/* Inline Scoped Styles */}
        <style>{cardStyles}</style>
      </div>
    );
  }

  // Modal Card Rendering
  return (
    <div className="id-card-modal-backdrop">
      <div className="id-card-modal-wrapper">
        {/* Modal Toolbar */}
        <div className="id-card-toolbar no-print">
          <div className="toolbar-left">
            <div className="toolbar-title">
              <ShieldCheck size={20} color="#E50914" />
              <span>Official MASTERFIT Student ID Card</span>
            </div>
          </div>

          <div className="toolbar-actions">
            <button className="id-btn download-btn" onClick={handleDownloadPDF} disabled={downloadingPdf}>
              <Download size={16} />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button className="id-btn print-btn" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print Card</span>
            </button>
            {onClose && (
              <button className="id-close-btn" onClick={onClose} title="Close">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Printable Card Area (CR80 Landscape) */}
        <div 
          ref={displayZoneRef} 
          className="id-cards-display-zone" 
          style={{ 
            height: scale < 1 ? `${Math.ceil(335 * scale)}px` : 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'hidden'
          }}
        >
          <div 
            className="id-card-scaler" 
            style={{ 
              transform: scale < 1 ? `scale(${scale})` : 'none',
              transformOrigin: 'top center',
              width: '530px',
              height: '335px'
            }}
          >
            <CardFront />
          </div>
        </div>
      </div>

      {/* Scoped CSS Styles replicating reference image */}
      <style>{cardStyles}</style>
    </div>
  );
}

// Scoped CSS Styles
const cardStyles = `
  .id-card-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(5, 7, 11, 0.9);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 16px;
  }
  .id-card-modal-wrapper {
    background: #0f121a;
    border: 1px solid #242938;
    border-radius: 18px;
    max-width: 620px;
    width: 100%;
    padding: 24px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
    max-height: 94vh;
    overflow-y: auto;
  }
  .id-card-standalone-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 10px 0;
  }
  .id-card-inline-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 530px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #23283a;
    gap: 12px;
    flex-wrap: wrap;
  }
  .id-card-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
    flex-wrap: wrap;
    gap: 12px;
    border-bottom: 1px solid #1f2537;
    padding-bottom: 14px;
  }
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .toolbar-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f8fafc;
    font-weight: 800;
    font-size: 1.05rem;
  }
  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .id-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .download-btn {
    background: #1e2433;
    color: #f8fafc;
    border: 1px solid #333d54;
  }
  .download-btn:hover {
    background: #2a3347;
    color: #fff;
  }
  .print-btn {
    background: #E50914;
    color: #ffffff;
  }
  .print-btn:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
  .id-close-btn {
    background: #1a1f2c;
    border: 1px solid #2b3348;
    color: #cbd5e1;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .id-close-btn:hover {
    background: #ef4444;
    color: #fff;
  }
  .id-cards-display-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
  }

  /* -------------------------------------------------------------------------
     MASTERFIT OFFICIAL CR80 LANDSCAPE CARD (Exact Match to Reference Image)
  ------------------------------------------------------------------------- */
  .mf-official-card {
    width: 530px;
    height: 335px;
    background: #ffffff;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    user-select: none;
  }

  /* TOP HEADER */
  .mf-card-top-header {
    height: 80px;
    background: #090b10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    padding-left: 18px;
  }
  .mf-logo-group {
    display: flex;
    align-items: center;
    gap: 14px;
    z-index: 2;
  }
  .mf-brand-logo-svg {
    width: 82px;
    height: 52px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  }
  .mf-header-divider {
    width: 1.5px;
    height: 48px;
    background: rgba(255, 255, 255, 0.25);
  }
  .mf-title-group {
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .mf-academy-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: 1.5px;
    color: #ffffff;
    line-height: 1;
  }
  .mf-academy-title .text-red {
    color: #E50914 !important;
    font-style: italic;
  }
  .mf-academy-subtitle {
    font-size: 0.65rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 4px;
    margin-top: 2px;
    margin-bottom: 3px;
  }
  .bar-pipe {
    color: #E50914;
    font-weight: 900;
    margin: 0 3px;
  }
  .mf-sports-bar {
    font-size: 0.44rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    gap: 2px;
    opacity: 0.95;
  }

  /* Top Right Karate Silhouette in Red Angle */
  .mf-header-angle-graphic {
    position: absolute;
    right: 0;
    top: 0;
    width: 135px;
    height: 80px;
    background: linear-gradient(135deg, #E50914 0%, #a00000 100%);
    clip-path: polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 12px;
  }
  .mf-red-slash-bg {
    width: 75px;
    height: 75px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mf-karate-kick-svg {
    width: 65px;
    height: 65px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }

  /* RED SLANTED RIBBON: STUDENT ID CARD */
  .mf-banner-container {
    position: relative;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
    margin-top: -3px;
    z-index: 3;
  }
  .mf-slanted-red-banner {
    background: linear-gradient(90deg, #b91c1c 0%, #E50914 25%, #E50914 75%, #b91c1c 100%);
    color: #ffffff;
    padding: 4px 44px;
    clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
    box-shadow: 0 4px 10px rgba(229, 9, 20, 0.45);
  }
  .mf-slanted-red-banner span {
    font-size: 0.88rem;
    font-weight: 900;
    font-style: italic;
    letter-spacing: 1.5px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  }

  /* CARD MIDDLE BODY */
  .mf-card-middle-body {
    display: flex;
    align-items: center;
    padding: 8px 18px 4px 18px;
    flex: 1;
    gap: 16px;
    background: #ffffff;
  }

  /* Photo Frame */
  .mf-photo-outer-frame {
    width: 105px;
    height: 135px;
    border: 2.5px solid #E50914;
    border-radius: 12px;
    padding: 3px;
    background: #ffffff;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
    flex-shrink: 0;
  }
  .mf-photo-inner-box {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    background: #f1f5f9;
  }
  .mf-real-student-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mf-avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e2e8f0;
  }

  /* Details List */
  .mf-details-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
    text-align: left;
  }
  .mf-detail-row {
    display: flex;
    align-items: center;
    font-size: 0.74rem;
    color: #0f172a;
    line-height: 1.15;
  }
  .mf-row-icon {
    width: 18px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
  }
  .mf-row-label {
    width: 82px;
    font-weight: 700;
    color: #0f172a;
    flex-shrink: 0;
    font-size: 0.72rem;
  }
  .mf-row-colon {
    margin-right: 8px;
    font-weight: 800;
    color: #0f172a;
  }
  .mf-row-value {
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .student-name-text {
    font-weight: 800;
    color: #000000;
    font-size: 0.8rem;
    text-transform: capitalize;
  }
  .blood-value {
    font-weight: 800;
    color: #E50914;
  }
  .phone-value {
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .date-value {
    font-weight: 600;
  }
  .mf-solid-id-pill {
    background: #E50914;
    color: #ffffff;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.8px;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 2px 5px rgba(229, 9, 20, 0.3);
  }

  /* Right QR Code Section */
  .mf-qr-clean-zone {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 14px;
    flex-shrink: 0;
  }
  .mf-qr-vertical-divider {
    width: 1px;
    height: 125px;
    background: #cbd5e1;
  }
  .mf-qr-box {
    position: relative;
    padding: 2px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mf-qr-center-badge {
    position: absolute;
    width: 22px;
    height: 22px;
    background: #090b10;
    border: 1.5px solid #E50914;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.4);
  }

  /* BOTTOM FOOTER */
  .mf-card-bottom-footer {
    height: 58px;
    background: #090b10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    position: relative;
    overflow: hidden;
  }
  .mf-footer-geom-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .geom-red-block {
    width: 60px;
    height: 38px;
    background: #E50914;
    clip-path: polygon(0% 0%, 80% 0%, 100% 100%, 0% 100%);
  }
  .geom-red-cut {
    width: 14px;
    height: 38px;
    background: #b91c1c;
    clip-path: polygon(0% 0%, 100% 0%, 60% 100%, 0% 100%);
  }
  .geom-speed-bars {
    display: flex;
    gap: 4px;
  }
  .geom-speed-bars span {
    width: 4px;
    height: 16px;
    background: #E50914;
    transform: skewX(-20deg);
    display: inline-block;
    opacity: 0.85;
  }

  /* Signature */
  .mf-signature-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 145px;
  }
  .mf-script-sig-svg {
    width: 85px;
    height: 22px;
  }
  .mf-sig-red-line {
    width: 120px;
    height: 1.5px;
    background: #E50914;
    margin-bottom: 3px;
  }
  .mf-sig-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  @media (max-width: 600px) {
    .id-card-modal-backdrop {
      padding: 8px;
    }
    .id-card-modal-wrapper {
      padding: 16px 10px;
      border-radius: 14px;
      max-height: 96vh;
      width: 100%;
    }
    .id-card-toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 12px;
    }
    .toolbar-left {
      width: 100%;
      justify-content: space-between;
    }
    .toolbar-title {
      font-size: 0.95rem;
    }
    .toolbar-actions {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      width: 100%;
      gap: 8px;
    }
    .toolbar-actions .id-btn {
      width: 100%;
      justify-content: center;
      padding: 8px 6px;
      font-size: 0.78rem;
    }
    .id-card-inline-toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      width: 100%;
    }
    .id-card-inline-toolbar .toolbar-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      gap: 8px;
    }
    .id-card-inline-toolbar .id-btn {
      width: 100%;
      justify-content: center;
      padding: 8px 10px;
      font-size: 0.8rem;
    }
  }

  /* PRINT STYLES */
  @media print {
    body * {
      visibility: hidden !important;
    }
    #printable-id-card, #printable-id-card * {
      visibility: visible !important;
    }
    #printable-id-card {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: row !important;
      justify-content: center !important;
      background: #fff !important;
      padding: 10px !important;
    }
    .id-card-scaler,
    .id-cards-display-zone {
      width: 530px !important;
      height: 335px !important;
      transform: none !important;
      overflow: visible !important;
    }
    .mf-official-card {
      box-shadow: none !important;
      page-break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      transform: none !important;
    }
    .no-print {
      display: none !important;
    }
  }
`;
