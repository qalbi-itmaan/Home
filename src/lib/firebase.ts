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

const DEFAULT_FORMATIONS: Formation[] = [
  {
    id: 'f1',
    name: {
      fr: 'Communication Positive dans le Couple',
      ar: 'التواصل الإيجابي في الحياة الزوجية',
      en: 'Positive Communication for Couples',
    },
    description: {
      fr: 'Apprenez à mieux communiquer avec votre conjoint pour renforcer votre complicité et résoudre les conflits avec bienveillance.',
      ar: 'تعلم أساسيات التواصل الإيجابي وتجاوز الخلافات الزوجية بحكمة وتفهم.',
      en: 'Learn how to communicate effectively with your partner to strengthen intimacy and resolve conflict with empathy.',
    },
    category: { fr: 'Couple & Famille', ar: 'الأسرة والزواج', en: 'Couples & Family' },
    price: 15000,
    oldPrice: 22000,
    isPromoted: true,
    duration: 12,
    level: 'beginner',
    type: 'hybrid',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=600',
    objectives: {
      fr: ['Comprendre les styles de communication', 'Gérer les émotions lors des désaccords', 'Développer l’écoute active'],
      ar: ['فهم أنماط التواصل الزوجي', 'إدارة المشاعر أثناء الخلافات', 'تطوير مهارة الاستماع الفعال'],
      en: ['Understand communication styles', 'Manage emotions during disagreements', 'Master active listening']
    },
    curriculum: {
      fr: [{ title: 'Module 1: Les bases de la communication', items: ['Écoute active', 'Langages de l’amour'] }],
      ar: [{ title: 'المحور الأول: أساسيات التواصل', items: ['الاستماع الفعال', 'لغات الحب الخمس'] }],
      en: [{ title: 'Module 1: Fundamentals of Communication', items: ['Active Listening', 'The 5 Love Languages'] }]
    },
    prerequisites: { fr: ['Aucun prérequis'], ar: ['لا توجد متطلبات'], en: ['No prerequisites'] },
    targetAudience: { fr: ['Couples et futurs mariés'], ar: ['الأزواج والمقبلون على الزواج'], en: ['Couples and newlyweds'] },
    isActive: true,
    publishedOnWebsite: true,
  },
  {
    id: 'f2',
    name: {
      fr: 'Éducation Bienveillante & Gestion des Émotions chez l’Enfant',
      ar: 'التربية الإيجابية وإدارة مشاعر الطفل',
      en: 'Positive Parenting & Managing Children’s Emotions',
    },
    description: {
      fr: 'Des outils pratiques pour accompagner le développement de votre enfant, gérer les crises et instaurer une discipline positive.',
      ar: 'أدوات عملية لمرافقة نمو طفلك والتعامل مع نوبات الغضب بأساليب تربوية حديثة.',
      en: 'Practical tools to nurture your child’s emotional development, handle tantrums, and implement positive discipline.',
    },
    category: { fr: 'Éducation', ar: 'التربية', en: 'Education' },
    price: 18000,
    duration: 16,
    level: 'beginner',
    type: 'presentiel',
    image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=600',
    objectives: {
      fr: ['Comprendre le cerveau de l’enfant', 'Accompagner les émotions sans crier', 'Instaurer un cadre sécurisant'],
      ar: ['فهم التطور العاطفي للطفل', 'التعامل مع المشاعر بدون صراخ', 'وضع حدود واضحة وبناءة'],
      en: ['Understand child neurodevelopment', 'Guide emotions without yelling', 'Establish safe, loving boundaries']
    },
    curriculum: {
      fr: [{ title: 'Module 1: Le développement de l’enfant', items: ['Neurosciences et émotions'] }],
      ar: [{ title: 'المحور الأول: نمو الطفل العاطفي', items: ['علم الأعصاب والمشاعر'] }],
      en: [{ title: 'Module 1: Child Development', items: ['Neuroscience & Emotions'] }]
    },
    prerequisites: { fr: ['Aucun prérequis'], ar: ['لا توجد متطلبات'], en: ['No prerequisites'] },
    targetAudience: { fr: ['Parents et éducateurs'], ar: ['الأولياء والمربون'], en: ['Parents and educators'] },
    isActive: true,
    publishedOnWebsite: true,
  },
  {
    id: 'f3',
    name: {
      fr: 'Gestion du Stress et Confiance en Soi',
      ar: 'إدارة الضغوطات وتعزيز الثقة بالنفس',
      en: 'Stress Management & Self-Confidence',
    },
    description: {
      fr: 'Développez des stratégies efficaces pour canaliser votre anxiété au quotidien et retrouver une sérénité durable.',
      ar: 'تطوير استراتيجيات عملية لتجاوز القلق اليومي واستعادة التوازن النفسي والسكينة.',
      en: 'Develop proven strategies to manage daily anxiety and cultivate lasting inner peace and self-esteem.',
    },
    category: { fr: 'Développement Personnel', ar: 'تطوير الذات', en: 'Personal Development' },
    price: 20000,
    oldPrice: 28000,
    isPromoted: true,
    duration: 20,
    level: 'intermediate',
    type: 'online',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
    objectives: {
      fr: ['Identifier les déclencheurs du stress', 'Pratiquer la méditation et la respiration', 'Renforcer l’estime de soi'],
      ar: ['تحديد مسببات الضغط النفسي', 'تقنيات التنفس والاسترخاء', 'تعزيز التقدير الذاتي'],
      en: ['Identify stress triggers', 'Practice breathing and relaxation techniques', 'Build healthy self-esteem']
    },
    curriculum: {
      fr: [{ title: 'Module 1: Comprendre le stress', items: ['Physiologie du stress', 'Exercices de relaxation'] }],
      ar: [{ title: 'المحور الأول: فهم ميكانيزمات الضغط', items: ['فيزيولوجيا القلق', 'تمارين الاسترخاء'] }],
      en: [{ title: 'Module 1: Understanding Stress', items: ['Physiology of Stress', 'Relaxation Exercises'] }]
    },
    prerequisites: { fr: ['Aucun prérequis'], ar: ['لا توجد متطلبات'], en: ['No prerequisites'] },
    targetAudience: { fr: ['Toute personne cherchant l’épanouissement'], ar: ['كل من يبحث عن التوازن'], en: ['Anyone seeking balance and fulfillment'] },
    isActive: true,
    publishedOnWebsite: true,
  }
];

// 1-hour cache in localStorage to maximize cost-savings on Firebase reads
let formationsMemoryCache: { data: Formation[]; timestamp: number } | null = null;
const FORMATIONS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getPublishedFormations(forceRefresh = false): Promise<Formation[]> {
  const now = Date.now();
  if (!forceRefresh && formationsMemoryCache && (now - formationsMemoryCache.timestamp < FORMATIONS_CACHE_TTL_MS)) {
    return formationsMemoryCache.data;
  }

  // Check persistent localStorage first to save reads across visits
  if (!forceRefresh && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('qalbi_formations_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.timestamp && (now - parsed.timestamp < FORMATIONS_CACHE_TTL_MS) && Array.isArray(parsed.data) && parsed.data.length > 0) {
          formationsMemoryCache = parsed;
          return parsed.data;
        }
      }
    } catch { /* ignore */ }
  }

  try {
    const config = getConfig();
    if (config.apiKey && config.projectId) {
      const q = query(
        collection(db, 'services'),
        where('publishedOnWebsite', '==', true),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Formation[];
      if (results.length > 0) {
        formationsMemoryCache = { data: results, timestamp: now };
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('qalbi_formations_cache', JSON.stringify(formationsMemoryCache));
          }
        } catch { /* ignore */ }
        return results;
      }
    }
  } catch (error) {
    console.warn('Firebase fetching failed, returning default formations:', error);
  }
  return DEFAULT_FORMATIONS;
}

export async function getFormationById(id: string): Promise<Formation | null> {
  // 1. Check memory cache first (0 Firestore read)
  if (formationsMemoryCache?.data) {
    const found = formationsMemoryCache.data.find(f => f.id === id);
    if (found) return found;
  }

  // 2. Check localStorage cached list (0 Firestore read)
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('qalbi_formations_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.data)) {
          const found = parsed.data.find((f: Formation) => f.id === id);
          if (found) return found;
        }
      }
    } catch { /* ignore */ }
  }

  // 3. Check bundled default formations (0 Firestore read)
  const defaultFound = DEFAULT_FORMATIONS.find(f => f.id === id);
  if (defaultFound) return defaultFound;

  // 4. Single document fetch only if not in any cache
  try {
    const config = getConfig();
    if (config.apiKey && config.projectId) {
      const { doc: docRef, getDoc } = await import('firebase/firestore');
      const docSnap = await getDoc(docRef(db, 'services', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Formation;
      }
    }
  } catch (error) {
    console.warn('Error fetching formation from Firebase:', error);
  }
  return null;
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
    customerAddress: data.address || '',
    title: data.consultationType,
    serviceName: { fr: data.consultationType, ar: data.consultationType },
    status: 'pending',
    duration: data.duration || 60,
    amount: data.amount || 4000,
    source: 'website',
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
  notes?: string;
}

export async function submitInscription(data: InscriptionData): Promise<{ trackingNumber: string; accessPassword: string }> {
  const trackingNumber = 'WEB-INS-' + Math.floor(100000 + Math.random() * 900000);
  const accessPassword = 'QI-' + Math.floor(1000 + Math.random() * 9000);

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
    createdAt: new Date().toISOString(),
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

