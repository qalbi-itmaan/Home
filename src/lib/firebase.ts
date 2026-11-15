import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration loaded securely from environment variables (Vite .env or CI/CD secrets).
// Secrets are never committed to version control.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Safe fallback configuration if env variables are missing (prevents crash and allows local fallback data)
const FALLBACK_CONFIG = {
  apiKey: 'placeholder-api-key',
  authDomain: 'qalbi-itmaan.firebaseapp.com',
  projectId: 'qalbi-itmaan-placeholder',
  storageBucket: 'qalbi-itmaan.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000000000',
};

// Try to load from localStorage only if it matches current project or if env is unset
function getConfig() {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
      const stored = localStorage.getItem('qalbi_firebase_config');
      if (stored) {
        const config = JSON.parse(stored);
        if (config.apiKey && config.projectId && config.projectId === firebaseConfig.projectId) {
          return config;
        }
      }
    } catch { /* ignore */ }
    return firebaseConfig;
  }
  
  try {
    const stored = localStorage.getItem('qalbi_firebase_config');
    if (stored) {
      const config = JSON.parse(stored);
      if (config.apiKey && config.projectId) return config;
    }
  } catch { /* ignore */ }
  
  return FALLBACK_CONFIG;
}

const app = initializeApp(getConfig());
export const db = getFirestore(app);
export const auth = getAuth(app);

// Seamless optional authentication helper:
// Public Firestore rules permit reading services/formations and creating reservations/inscriptions without auth.
// If anonymous authentication is enabled in Firebase Console, it is used transparently; otherwise it gracefully no-ops.
export async function ensureAuthenticated() {
  if (auth.currentUser) return auth.currentUser;

  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch {
    // Anonymous auth not enabled or restricted; public Firestore operations proceed without auth
    return null;
  }
}

// ============================================================
// READ: Get published formations
// ============================================================
export interface FormationCategoryObj {
  fr: string;
  ar: string;
  en?: string;
}

export interface OpenSessionInfo {
  id: string;
  formationId: string;
  formationName?: string;
  startDate: string;
  endDate: string;
  schedule: string;
  capacity?: number;
  enrolled?: number;
  instructor?: string;
  location?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Formation {
  id: string;
  name: { fr: string; ar: string; en?: string };
  description: { fr: string; ar: string; en?: string };
  category: FormationCategoryObj | string;
  price: number;
  oldPrice?: number;
  isPromoted?: boolean;
  promoEndDate?: string;
  promoBadge?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'presentiel' | 'online' | 'hybrid';
  image?: string;
  driveLink?: string;
  youtubeLink?: string;
  objectives: { fr: string[]; ar: string[]; en?: string[] };
  curriculum: { fr: CurriculumModule[]; ar: CurriculumModule[]; en?: CurriculumModule[] };
  prerequisites: { fr: string[]; ar: string[]; en?: string[] };
  targetAudience: { fr: string[]; ar: string[]; en?: string[] };
  isActive: boolean;
  publishedOnWebsite: boolean;
  hasOpenSession?: boolean;
  openSessions?: OpenSessionInfo[];
}

const CATEGORY_MAP: Record<string, { fr: string; ar: string; en: string }> = {
  'couple & famille': { fr: 'Couple & Famille', ar: 'الأسرة والزواج', en: 'Couples & Family' },
  'education': { fr: 'Éducation', ar: 'التربية', en: 'Education' },
  'éducation': { fr: 'Éducation', ar: 'التربية', en: 'Education' },
  'developpement personnel': { fr: 'Développement Personnel', ar: 'تطوير الذات', en: 'Personal Development' },
  'développement personnel': { fr: 'Développement Personnel', ar: 'تطوير الذات', en: 'Personal Development' },
  'psychologie': { fr: 'Psychologie & Santé Mentale', ar: 'علم النفس والصحة النفسية', en: 'Psychology & Mental Health' },
  'parentalite': { fr: 'Parentalité & Éducation', ar: 'التربية والوالدية', en: 'Parenting & Education' },
  'parentalité': { fr: 'Parentalité & Éducation', ar: 'التربية والوالدية', en: 'Parenting & Education' },
  'softskills': { fr: 'Soft Skills & Communication', ar: 'المهارات الحياتية والتواصل', en: 'Soft Skills & Communication' },
  'soutien': { fr: 'Soutien & Accompagnement', ar: 'الدعم والمرافقة', en: 'Support & Guidance' },
  'coaching': { fr: 'Coaching de Vie', ar: 'التوجيه الحياتي', en: 'Life Coaching' },
  'famille': { fr: 'Famille & Relations', ar: 'الأسرة والعلاقات', en: 'Family & Relationships' },
  'general': { fr: 'Général', ar: 'عام', en: 'General' },
  'autre': { fr: 'Autre', ar: 'أخرى', en: 'Other' },
  'all': { fr: 'Toutes les catégories', ar: 'جميع الفئات', en: 'All Categories' }
};

export function getCategoryLabel(category: any, lang: string): string {
  if (!category) return '';
  const currentLang = (lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'fr') as 'fr' | 'ar' | 'en';

  if (typeof category === 'object') {
    return category[currentLang] || category.fr || category.ar || category.en || '';
  }

  const rawStr = String(category).trim();
  const normalizedKey = rawStr.toLowerCase().replace(/_/g, ' ');
  if (CATEGORY_MAP[normalizedKey]) {
    return CATEGORY_MAP[normalizedKey][currentLang];
  }
  return rawStr;
}

export interface CurriculumModule {
  title: string;
  items: string[];
}

const STATIC_DEMO_FORMATION_IDS = new Set(['f1', 'f2', 'f3']);
const STATIC_DEMO_TITLES = new Set([
  'communication positive dans le couple',
  'positive communication for couples',
  'التواصل الإيجابي في الحياة الزوجية',
  'éducation bienveillante & gestion des émotions chez l’enfant',
  "éducation bienveillante & gestion des émotions chez l'enfant",
  'positive parenting & managing children’s emotions',
  "positive parenting & managing children's emotions",
  'التربية الإيجابية وإدارة مشاعر الطفل',
  'gestion du stress et confiance en soi',
  'stress management & self-confidence',
  'إدارة الضغوطات وتعزيز الثقة بالنفس',
]);

export function isStaticDemoFormation(f: Partial<Formation> | null | undefined): boolean {
  if (!f) return false;
  if (f.id && STATIC_DEMO_FORMATION_IDS.has(String(f.id).trim().toLowerCase())) return true;
  const fr = (f.name?.fr || '').trim().toLowerCase();
  const en = (f.name?.en || '').trim().toLowerCase();
  const ar = (f.name?.ar || '').trim().toLowerCase();
  if ((fr && STATIC_DEMO_TITLES.has(fr)) || (en && STATIC_DEMO_TITLES.has(en)) || (ar && STATIC_DEMO_TITLES.has(ar))) {
    return true;
  }
  return false;
}

export async function getPublishedFormations(_forceRefresh = false): Promise<Formation[]> {
  // Always clear legacy localStorage cache so session openings/closings reflect immediately
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('qalbi_formations_cache');
    } catch { /* ignore */ }
  }

  try {
    const config = getConfig();
    if (config.apiKey && config.projectId) {
      await ensureAuthenticated();

      const snapshot = await getDocs(collection(db, 'services'));
      const rawFormations = snapshot.docs
        .map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }) as Formation)
        .filter(f => !isStaticDemoFormation(f) && f.publishedOnWebsite !== false && f.isActive !== false);

      // Query open sessions directly from 'sessions' collection if accessible
      const openSessionsByFormation = new Map<string, OpenSessionInfo[]>();
      let sessionsCollectionAccessible = false;
      try {
        const sessionsQuery = query(
          collection(db, 'sessions'),
          where('status', '==', 'open')
        );
        const sessionsSnap = await getDocs(sessionsQuery);
        sessionsCollectionAccessible = true;
        sessionsSnap.docs.forEach(sDoc => {
          const sData = sDoc.data() as any;
          if (sData.formationId && sData.status === 'open') {
            const list = openSessionsByFormation.get(sData.formationId) || [];
            list.push({
              id: sDoc.id,
              formationId: sData.formationId,
              formationName: sData.formationName || '',
              startDate: sData.startDate || '',
              endDate: sData.endDate || '',
              schedule: sData.schedule || '',
              capacity: sData.capacity || 20,
              enrolled: sData.enrolled || 0,
              instructor: sData.instructor || '',
              location: sData.location || '',
              status: 'open',
            });
            openSessionsByFormation.set(sData.formationId, list);
          }
        });
      } catch {
        // If 'sessions' collection read is restricted by un-deployed rules, fallback to embedded openSessions on services doc
      }

      // Filter: ONLY show formations that have at least one open session
      const formationsWithOpenSession = rawFormations
        .map(f => {
          const fromSessionsCol = openSessionsByFormation.get(f.id) || [];
          const fromEmbedded = Array.isArray(f.openSessions)
            ? f.openSessions.filter(s => s && s.status === 'open')
            : [];

          const mergedMap = new Map<string, OpenSessionInfo>();
          if (sessionsCollectionAccessible) {
            fromSessionsCol.forEach(s => mergedMap.set(s.id, s));
            // Also include embedded if sessions collection was empty for this formation but hasOpenSession is true
            if (mergedMap.size === 0 && f.hasOpenSession === true) {
              fromEmbedded.forEach(s => mergedMap.set(s.id, s));
            }
          } else {
            fromEmbedded.forEach(s => mergedMap.set(s.id, s));
          }

          const openSessions = Array.from(mergedMap.values()).sort((a, b) =>
            (a.startDate || '').localeCompare(b.startDate || '')
          );
          const hasOpen = sessionsCollectionAccessible
            ? (fromSessionsCol.length > 0 || (f.hasOpenSession === true && fromEmbedded.length > 0))
            : (openSessions.length > 0 || f.hasOpenSession === true);

          return {
            ...f,
            hasOpenSession: hasOpen,
            openSessions,
          };
        })
        .filter(f => f.hasOpenSession === true);

      return formationsWithOpenSession;
    }
  } catch (error) {
    console.warn('Firebase fetching formations failed:', error);
  }
  return [];
}

export async function getFormationById(id: string): Promise<Formation | null> {
  try {
    const published = await getPublishedFormations(true);
    const found = published.find(f => f.id === id);
    return found || null;
  } catch (error) {
    console.warn('Error fetching formation from Firebase:', error);
    return null;
  }
}

// ============================================================
// WRITE: Submit a consultation reservation
// ============================================================
export interface ReservationData {
  type: 'consultation';
  consultationType: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  consultationMode: 'presentiel' | 'en_ligne';
  duration: number; // 30, 45, or 60
  amount: number; // 2000, 3000, or 4000 DZD
  contactPreference?: string;
  date: string;
  time: string;
  notes?: string;
}

export async function submitReservation(data: ReservationData): Promise<string> {
  const generatedId = 'WEB-RDV-' + Math.floor(100000 + Math.random() * 900000);
  
  // Clean undefined properties so Firestore setDoc doesn't reject undefined values
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
  );

  const reservationDoc = {
    ...cleanData,
    id: generatedId,
    trackingCode: generatedId,
    type: 'consultation',
    customerAddress: data.address || '',
    title: data.consultationType,
    serviceName: { fr: data.consultationType, ar: data.consultationType },
    status: 'pending',
    duration: data.duration || 60,
    amount: data.amount || 4000,
    source: 'website',
    createdBy: 'Site Web',
  };

  try {
    const config = getConfig();
    if (config.apiKey && config.projectId) {
      await ensureAuthenticated();

      await setDoc(doc(db, 'reservations', generatedId), {
        ...reservationDoc,
        createdAt: Timestamp.now(),
      });
      console.log('[FIREBASE] Successfully saved reservation:', generatedId);
      return generatedId;
    }
  } catch (error) {
    console.warn('Firebase reservation submission failed, saving to local storage fallback:', error);
  }

  // Local storage fallback so appointment is never lost
  const localReservations = JSON.parse(localStorage.getItem('qalbi_website_reservations') || '[]');
  localReservations.push({
    ...reservationDoc,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem('qalbi_website_reservations', JSON.stringify(localReservations));
  return generatedId;
}

// ============================================================
// WRITE: Submit a formation inscription
// ============================================================
export interface InscriptionData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  formationId: string;
  formationName: string;
  sessionId?: string;
  sessionName?: string;
  notes?: string;
}

export async function submitInscription(data: InscriptionData): Promise<{ trackingNumber: string; accessPassword: string }> {
  const trackingNumber = 'WEB-INS-' + Math.floor(100000 + Math.random() * 900000);
  const accessPassword = 'QI-' + Math.floor(1000 + Math.random() * 9000);
  const nowMs = Date.now();

  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );

  try {
    const config = getConfig();
    if (config.apiKey && config.projectId) {
      await ensureAuthenticated();
      await setDoc(doc(db, 'inscriptions', trackingNumber), {
        ...cleanData,
        status: 'pending',
        trackingNumber,
        accessPassword,
        accessGranted: true,
        source: 'website',
        createdAt: Timestamp.now(),
        createdAtMs: nowMs,
      });
      return { trackingNumber, accessPassword };
    }
  } catch (error) {
    console.warn('Firebase inscription submission failed, saving to local storage fallback:', error);
  }

  const localInscriptions = JSON.parse(localStorage.getItem('qalbi_website_inscriptions') || '[]');
  const newInscription = {
    id: trackingNumber,
    ...data,
    status: 'pending',
    trackingNumber,
    accessPassword,
    accessGranted: true,
    source: 'website',
    createdAt: new Date(nowMs).toISOString(),
    createdAtMs: nowMs,
  };
  localInscriptions.push(newInscription);
  localStorage.setItem('qalbi_website_inscriptions', JSON.stringify(localInscriptions));
  return { trackingNumber, accessPassword };
}

export async function syncPendingWebReservations() {
  try {
    const stored = localStorage.getItem('qalbi_website_reservations');
    if (!stored) return;
    const items = JSON.parse(stored);
    if (!Array.isArray(items) || items.length === 0) return;

    await ensureAuthenticated();

    const remaining = [];
    for (const item of items) {
      const docId = item.id || item.trackingCode || ('WEB-RDV-' + Math.floor(100000 + Math.random() * 900000));
      try {
        await setDoc(doc(db, 'reservations', docId), {
          ...item,
          createdAt: Timestamp.now(),
        });
        console.log('[FIREBASE] Synced local reservation to Cloud:', docId);
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      localStorage.removeItem('qalbi_website_reservations');
    } else {
      localStorage.setItem('qalbi_website_reservations', JSON.stringify(remaining));
    }
  } catch (e) {
    console.warn('Failed to sync pending web reservations:', e);
  }
}

export async function syncPendingWebInscriptions() {
  try {
    const stored = localStorage.getItem('qalbi_website_inscriptions');
    if (!stored) return;
    const items = JSON.parse(stored);
    if (!Array.isArray(items) || items.length === 0) return;

    await ensureAuthenticated();

    const remaining = [];
    for (const item of items) {
      const docId = item.trackingNumber || item.id || ('WEB-INS-' + Math.floor(100000 + Math.random() * 900000));
      try {
        await setDoc(doc(db, 'inscriptions', docId), {
          ...item,
          createdAt: Timestamp.now(),
        });
        console.log('[FIREBASE] Synced local inscription to Cloud:', docId);
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      localStorage.removeItem('qalbi_website_inscriptions');
    } else {
      localStorage.setItem('qalbi_website_inscriptions', JSON.stringify(remaining));
    }
  } catch (e) {
    console.warn('Failed to sync pending web inscriptions:', e);
  }
}

// ============================================================
// WRITE: Submit a contact message
// ============================================================
export interface ContactMessageData {
  name: string;
  email?: string;
  phone?: string;
  message: string;
}

export async function submitContactMessage(data: ContactMessageData): Promise<string> {
  const messageId = 'WEB-MSG-' + Math.floor(100000 + Math.random() * 900000);
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
  );

  const messageDoc = {
    ...cleanData,
    id: messageId,
    status: 'unread',
    source: 'website',
  };

  try {
    const config = getConfig();
    if (config.apiKey && config.projectId) {
      await ensureAuthenticated();
      await setDoc(doc(db, 'messages', messageId), {
        ...messageDoc,
        createdAt: Timestamp.now(),
      });
      console.log('[FIREBASE] Successfully saved contact message:', messageId);
      return messageId;
    }
  } catch (error) {
    console.warn('Firebase message submission failed, saving to local storage fallback:', error);
  }

  // Local storage fallback
  const localMessages = JSON.parse(localStorage.getItem('qalbi_website_messages') || '[]');
  localMessages.push({
    ...messageDoc,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem('qalbi_website_messages', JSON.stringify(localMessages));
  return messageId;
}

export async function syncPendingWebContactMessages() {
  try {
    const stored = localStorage.getItem('qalbi_website_messages');
    if (!stored) return;
    const items = JSON.parse(stored);
    if (!Array.isArray(items) || items.length === 0) return;

    await ensureAuthenticated();

    const remaining = [];
    for (const item of items) {
      const docId = item.id || ('WEB-MSG-' + Math.floor(100000 + Math.random() * 900000));
      try {
        await setDoc(doc(db, 'messages', docId), {
          ...item,
          createdAt: Timestamp.now(),
        });
        console.log('[FIREBASE] Synced local contact message to Cloud:', docId);
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      localStorage.removeItem('qalbi_website_messages');
    } else {
      localStorage.setItem('qalbi_website_messages', JSON.stringify(remaining));
    }
  } catch (e) {
    console.warn('Failed to sync pending web contact messages:', e);
  }
}

// Auto-run background sync on load
syncPendingWebReservations();
syncPendingWebInscriptions();
syncPendingWebContactMessages();

