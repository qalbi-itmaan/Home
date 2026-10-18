import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  GraduationCap,
  Lock,
  Key,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PlayCircle,
  FileText,
  MessageCircle,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, getFormationById } from '../lib/firebase';

interface StudentSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UnlockedCourse {
  studentName: string;
  formationTitle: string;
  trackingNumber: string;
  status: string;
  driveLink?: string;
  youtubeLink?: string;
  customerPhone?: string;
}

export function extractYoutubeId(url?: string): { id: string; isPlaylist: boolean } | null {
  if (!url) return null;
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (playlistMatch) {
    return { id: playlistMatch[1], isPlaylist: true };
  }
  const videoMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (videoMatch) {
    return { id: videoMatch[1], isPlaylist: false };
  }
  return null;
}

export function extractDriveFolderId(url?: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function StudentSpaceModal({ isOpen, onClose }: StudentSpaceModalProps) {
  const { t, lang } = useLanguage();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unlockedCourse, setUnlockedCourse] = useState<UnlockedCourse | null>(null);

  if (!isOpen) return null;

  const handleVerifyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanTracking = trackingNumber.trim();
    const cleanPassword = accessPassword.trim();

    if (!cleanTracking || !cleanPassword) {
      setError(t('student.err_required'));
      return;
    }

    setLoading(true);
    try {
      let inscriptionData: any = null;

      // 1. Direct point-lookup by ID first (1 single Firestore read, fast & cheap)
      try {
        const docRef = doc(db, 'inscriptions', cleanTracking);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          inscriptionData = docSnap.data();
        } else {
          // Fallback query if stored under auto-ID
          const q = query(
            collection(db, 'inscriptions'),
            where('trackingNumber', '==', cleanTracking)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            inscriptionData = snapshot.docs[0].data();
          }
        }
      } catch (err) {
        console.warn('Firebase query failed, checking local fallback:', err);
      }

      // 2. Check LocalStorage fallback if not found in Firebase
      if (!inscriptionData) {
        const localList = JSON.parse(localStorage.getItem('qalbi_website_inscriptions') || '[]');
        inscriptionData = localList.find((i: any) => i.trackingNumber === cleanTracking || i.id === cleanTracking);
      }

      if (!inscriptionData) {
        setError(t('student.err_not_found'));
        setLoading(false);
        return;
      }

      // Check Password match
      const expectedPassword = inscriptionData.accessPassword || '';
      if (expectedPassword && expectedPassword.toLowerCase() !== cleanPassword.toLowerCase()) {
        setError(t('student.err_wrong_pass'));
        setLoading(false);
        return;
      }

      // Fetch formation details to retrieve YouTube link & Google Drive link
      // Uses the 1-hour memory & localStorage cache (0 Firestore reads)
      let driveLink = inscriptionData.driveLink || '';
      let youtubeLink = inscriptionData.youtubeLink || '';

      if (inscriptionData.formationId) {
        try {
          const form = await getFormationById(inscriptionData.formationId);
          if (form) {
            if (!driveLink) driveLink = (form as any).driveLink || '';
            if (!youtubeLink) youtubeLink = (form as any).youtubeLink || '';
          }
        } catch { /* ignore */ }
      }

      // If driveLink actually contains a YouTube URL, treat it as youtubeLink
      if (!youtubeLink && extractYoutubeId(driveLink)) {
        youtubeLink = driveLink;
        driveLink = '';
      }

      setUnlockedCourse({
        studentName: inscriptionData.customerName || (lang === 'ar' ? 'طالب' : lang === 'en' ? 'Student' : 'Étudiant'),
        formationTitle: inscriptionData.formationName || (lang === 'ar' ? 'دورة عبر الإنترنت' : lang === 'en' ? 'Online Course' : 'Formation en ligne'),
        trackingNumber: inscriptionData.trackingNumber || cleanTracking,
        status: inscriptionData.status || 'pending',
        driveLink: driveLink,
        youtubeLink: youtubeLink,
        customerPhone: inscriptionData.customerPhone || '',
      });
    } catch (err) {
      console.error(err);
      setError(t('student.err_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUnlockedCourse(null);
    setTrackingNumber('');
    setAccessPassword('');
    setError('');
  };

  const youtubeInfo = unlockedCourse ? extractYoutubeId(unlockedCourse.youtubeLink || unlockedCourse.driveLink) : null;
  const folderId = unlockedCourse ? extractDriveFolderId(unlockedCourse.driveLink) : null;
  const isPaid = unlockedCourse?.status === 'validated';

  const youtubeEmbedUrl = youtubeInfo
    ? youtubeInfo.isPlaylist
      ? `https://www.youtube-nocookie.com/embed/videoseries?list=${youtubeInfo.id}&rel=0&modestbranding=1`
      : `https://www.youtube-nocookie.com/embed/${youtubeInfo.id}?rel=0&modestbranding=1&controls=1`
    : null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: unlockedCourse ? (isPaid ? '880px' : '540px') : '480px',
          width: '92%',
          padding: '28px 24px',
          margin: 'auto',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          transition: 'max-width 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button positioned cleanly */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>

        {!unlockedCourse ? (
          /* ============================================================
             1. LOGIN / ACCESS VERIFICATION FORM
             ============================================================ */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: '52px',
                  height: '52px',
                  margin: '0 auto 12px auto',
                  background: 'var(--rose-pastel)',
                  color: 'var(--rose)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: 800 }}>
                {t('student.title')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                {t('student.subtitle')}
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAccess}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                  <Lock size={14} color="var(--bleu)" />
                  {t('student.tracking_label')} *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: WEB-INS-355143"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace', fontWeight: 700 }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                  <Key size={14} color="#ec4899" />
                  {t('student.password_label')} *
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Ex: QI-8492"
                  value={accessPassword}
                  onChange={(e) => setAccessPassword(e.target.value)}
                  style={{ letterSpacing: '1px', fontWeight: 700 }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '8px' }}
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <GraduationCap size={18} />}
                {t('student.submit_btn')}
              </button>
            </form>
          </div>
        ) : !isPaid ? (
          /* ============================================================
             2. PROTECTED PAYWALL (NON-VALIDATED / PENDING ENROLLMENT)
             The videos and resources are STRICTLY locked until payment is verified.
             ============================================================ */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px auto',
                background: '#fffbeb',
                color: '#b45309',
                border: '2px solid #fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={32} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px' }}>
              <span>{t('student.pending_badge')}</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              {unlockedCourse.formationTitle}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
              👤 {unlockedCourse.studentName}
            </p>

            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '16px 20px',
                borderRadius: '16px',
                textAlign: 'center',
                marginBottom: '22px',
                lineHeight: 1.6,
                fontSize: '0.92rem',
              }}
            >
              <p style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontWeight: 600 }}>
                {t('student.pending_title')}
              </p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                {t('student.pending_desc')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={`https://wa.me/213698746428?text=${encodeURIComponent(
                  lang === 'ar'
                    ? `السلام عليكم قلبي اطمأن، هذا وصل دفع رسوم دورة "${unlockedCourse.formationTitle}" (رقم التتبع: ${unlockedCourse.trackingNumber}، الاسم: ${unlockedCourse.studentName}). يرجى تأكيد الدخول وتفعيل الدروس.`
                    : lang === 'en'
                    ? `Hello Qalbi ITMAAN, here is my payment receipt for the course "${unlockedCourse.formationTitle}" (Ref: ${unlockedCourse.trackingNumber}, Name: ${unlockedCourse.studentName}). Please confirm my access.`
                    : `Bonjour Qalbi ITMAAN, voici mon reçu de paiement pour la formation "${unlockedCourse.formationTitle}" (Réf: ${unlockedCourse.trackingNumber}, Nom: ${unlockedCourse.studentName}). Merci de valider mon accès.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', gap: '8px', padding: '12px' }}
              >
                <MessageCircle size={18} />
                <span>{t('student.whatsapp_btn')}</span>
              </a>

              <button type="button" className="btn btn-secondary" onClick={handleReset} style={{ width: '100%' }}>
                {t('student.switch_account')}
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================
             3. UNLOCKED COURSE DASHBOARD (VALIDATED / PAID STUDENT)
             Displays Unlisted YouTube Video Player & Google Drive Handouts
             ============================================================ */
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge" style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} />
                    {t('student.unlocked_badge')}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontWeight: 600 }}>
                    #{unlockedCourse.trackingNumber}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', margin: '4px 0', fontWeight: 800 }}>
                  {unlockedCourse.formationTitle}
                </h3>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  👤 {unlockedCourse.studentName}
                </span>
              </div>

              <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
                {t('student.change_student')}
              </button>
            </div>

            {/* A. YOUTUBE UNLISTED VIDEO PLAYER */}
            {youtubeEmbedUrl ? (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontWeight: 700, fontSize: '0.95rem' }}>
                  <PlayCircle size={18} color="var(--rose)" />
                  <span>{t('student.video_title')}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 12px 0' }}>
                  {t('student.video_desc')}
                </p>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '56.25%', // 16:9 Aspect Ratio
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: '#0f172a',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <iframe
                    src={youtubeEmbedUrl}
                    title="Lecteur de cours vidéo Qalbi ITMAAN"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}

            {/* B. GOOGLE DRIVE DOCUMENTS & RESOURCES (IF AVAILABLE) */}
            {unlockedCourse.driveLink ? (
              <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700 }}>
                  <FileText size={18} color="var(--bleu)" />
                  <span>{t('student.drive_title')}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  {t('student.drive_desc')}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <a
                    href={unlockedCourse.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <Download size={15} />
                    <span>{t('student.drive_download')}</span>
                  </a>
                  <a
                    href={unlockedCourse.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} />
                    <span>{t('student.drive_open')}</span>
                  </a>
                </div>
              </div>
            ) : null}

            {/* Fallback if no video and no drive link */}
            {!youtubeEmbedUrl && !unlockedCourse.driveLink && (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                <FileText size={40} color="var(--text-secondary)" style={{ opacity: 0.6, marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem' }}>
                  {t('student.empty_title')}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0 }}>
                  {t('student.empty_desc')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
