import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import { useToast } from '../lib/ToastContext';
import InscriptionModal from '../components/InscriptionModal';
import { extractYoutubeId } from '../components/StudentSpaceModal';
import { getFormationById, getPublishedFormations, getCategoryLabel, type Formation } from '../lib/firebase';
import { 
  GraduationCap, Clock, Award, Star, CheckCircle, ChevronDown, 
  ChevronUp, Heart, Video, FileText, Smartphone, ShieldCheck, 
  Share2, ArrowRight, ArrowLeft, Play, X, Loader2, MessageCircle, Sparkles
} from 'lucide-react';

export default function FormationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'apercu' | 'programme' | 'formateur' | 'avis' | 'faq'>('apercu');
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0, 1]));
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showInscriptionModal, setShowInscriptionModal] = useState(false);

  // Real-time Countdown Timer (calculated dynamically or from promoEndDate)
  const [timeLeft, setTimeLeft] = useState(2 * 86400 + 14 * 3600 + 27 * 60 + 36);

  useEffect(() => {
    if (!formation) return;
    if (formation.promoEndDate) {
      const end = new Date(formation.promoEndDate).getTime();
      const initial = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(initial);
    } else if (formation.isPromoted || (formation.oldPrice && formation.oldPrice > formation.price)) {
      // Calculate remaining time until next Sunday midnight
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
      nextSunday.setHours(23, 59, 59, 999);
      const diff = Math.max(0, Math.floor((nextSunday.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff > 0 ? diff : 86400 * 2);
    }
  }, [formation]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getFormationById(id)
      .then((data) => {
        if (data) {
          setFormation(data);
        } else {
          // Fallback to searching published formations
          return getPublishedFormations().then((all) => {
            const match = all.find((f) => f.id === id) || all[0];
            setFormation(match || null);
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const formatCountdown = (totalSeconds: number) => {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${d.toString().padStart(2, '0')}j : ${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast(t('common.share_copied'), 'info');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showToast(isFavorite ? t('detail.add_fav') : t('detail.in_fav'), 'success');
  };

  const toggleModule = (index: number) => {
    const next = new Set(openModules);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setOpenModules(next);
  };

  if (loading) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontWeight: 600 }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>{t('common.formation_not_found')}</h2>
        <p style={{ margin: '16px 0 24px 0' }}>{t('common.formation_not_found_desc')}</p>
        <Link to="/formations" className="btn btn-primary">
          {t('common.back_to_catalog')}
        </Link>
      </div>
    );
  }

  const title = (formation.name as any)[lang] || formation.name.fr || formation.name.ar || (formation.name as any).en;
  const description = (formation.description as any)[lang] || formation.description.fr || formation.description.ar || (formation.description as any).en;
  
  const numPrice = typeof formation.price === 'number' ? formation.price : Number(formation.price) || 0;
  const priceFormatted = `${numPrice.toLocaleString()} ${t('currency')}`;
  const numOldPrice = formation.oldPrice ? Number(formation.oldPrice) : 0;
  const hasPromo = (numOldPrice > numPrice) || Boolean(formation.isPromoted);
  const discountPercent = (numOldPrice > numPrice) ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100) : 0;
  const savings = (numOldPrice > numPrice) ? (numOldPrice - numPrice) : 0;
  const savingsFormatted = savings > 0 ? `${savings.toLocaleString()} ${t('currency')}` : '';
  const oldPriceFormatted = numOldPrice > 0 ? `${numOldPrice.toLocaleString()} ${t('currency')}` : '';

  const youtubeInfo = extractYoutubeId(formation.youtubeLink);
  const youtubeEmbedUrl = youtubeInfo
    ? youtubeInfo.isPlaylist
      ? `https://www.youtube-nocookie.com/embed/videoseries?list=${youtubeInfo.id}&autoplay=1&rel=0`
      : `https://www.youtube-nocookie.com/embed/${youtubeInfo.id}?autoplay=1&rel=0`
    : null;

  const objectivesList = (formation.objectives as any)?.[lang] || formation.objectives?.fr || [
    'Comprendre les principes fondamentaux de la thématique',
    'Acquérir des outils pratiques applicables au quotidien',
    'Développer des compétences durables et autonomes'
  ];

  const targetList = (formation.targetAudience as any)?.[lang] || formation.targetAudience?.fr || [
    'Toute personne souhaitant se former et progresser',
    'Parents, éducateurs et professionnels de la famille'
  ];

  const curriculumList = (formation.curriculum as any)?.[lang] || formation.curriculum?.fr || [
    { title: 'Module 1: Introduction et fondamentaux', items: ['Présentation générale', 'Objectifs clés'] },
    { title: 'Module 2: Concepts et pratiques clés', items: ['Études de cas', 'Exercices d\'application'] },
    { title: 'Module 3: Évaluation et plan d\'action', items: ['Synthèse finale', 'Attestation de réussite'] }
  ];

  return (
    <div className="page-enter">
      {/* Video Modal Preview */}
      {showVideoModal && (
        <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="modal-container" style={{ maxWidth: '800px', padding: '0', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', paddingTop: youtubeEmbedUrl ? '56.25%' : '0', background: '#0f172a' }}>
              <button 
                onClick={() => setShowVideoModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(255,255,255,0.85)', padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
              {youtubeEmbedUrl ? (
                <iframe 
                  src={youtubeEmbedUrl}
                  title={title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: 'white' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Video size={32} color="var(--bleu-ciel)" />
                  </div>
                  <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.25rem' }}>{title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                    {lang === 'ar' 
                      ? 'محتوى الدورة متاح حصرياً للمشتركين المسجلين في فضاء الطالب. يرجى التسجيل أو التواصل معنا لمزيد من التفاصيل.' 
                      : 'La vidéo de présentation complète est réservée aux étudiants inscrits dans leur espace de cours. Contactez-nous pour toute information.'}
                  </p>
                  <a
                    href={`https://wa.me/213698746428?text=${encodeURIComponent(lang === 'ar' ? `السلام عليكم، أود الاستفسار والحصول على تفاصيل دورة: ${title}` : `Bonjour, je souhaite avoir plus de détails sur la formation : ${title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ gap: '8px', display: 'inline-flex' }}
                  >
                    <MessageCircle size={18} />
                    <span>{lang === 'ar' ? 'تواصل معنا عبر واتساب' : 'Contacter sur WhatsApp'}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inscription Modal */}
      {showInscriptionModal && (
        <InscriptionModal formation={formation} onClose={() => setShowInscriptionModal(false)} />
      )}

      {/* ===== HERO HEADER ===== */}
      <div className="page-header" style={{ textAlign: 'start', paddingBottom: '40px' }}>
        <div className="container">
          <div style={{ marginBottom: '18px' }}>
            <Link to="/formations" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
              <ArrowLeft size={16} style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }} />
              <span>{t('formations.title')}</span>
            </Link>
          </div>
          <div className="detail-header-grid">
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="hero-tagline" style={{ background: 'var(--rose-pastel)', color: 'var(--rose)', margin: 0 }}>
                  {getCategoryLabel(formation.category, lang) || t('detail.badge_popular')}
                </div>
                {hasPromo && (
                  <div className="hero-tagline" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)', color: 'white', borderColor: 'transparent', margin: 0, fontWeight: 800 }}>
                    🔥 {discountPercent > 0 ? `-${discountPercent}%` : (lang === 'ar' ? 'تخفيض خاص' : 'PROMOTION')}
                  </div>
                )}
              </div>
              <h1 style={{ textAlign: 'start', marginTop: '12px', fontSize: '2.3rem' }}>
                {title}
              </h1>
              <p style={{ textAlign: 'start', fontSize: '1.05rem', margin: '16px 0 24px 0', maxWidth: '640px', lineHeight: 1.7 }}>
                {description}
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <span className="lang-toggle">
                  <GraduationCap size={16} /> 
                  {formation.level === 'beginner' ? t('level.beginner') : formation.level === 'advanced' ? t('level.advanced') : t('level.intermediate')}
                </span>
                <span className="lang-toggle"><Clock size={16} /> {formation.duration}h</span>
                <span className="lang-toggle"><Award size={16} /> {t('detail.certif_included')}</span>
              </div>

              <div className="detail-header-actions">
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={() => setShowInscriptionModal(true)}
                >
                  {t('detail.enroll_now')} <ArrowRight size={18} className="btn-arrow" />
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={toggleFavorite}
                  style={{ color: isFavorite ? 'var(--rose)' : 'inherit' }}
                >
                  <Heart size={18} fill={isFavorite ? 'var(--rose)' : 'none'} />
                  {isFavorite ? t('detail.in_fav') : t('detail.add_fav')}
                </button>
                <button className="btn btn-secondary" onClick={handleShare} title="Partager">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Right Header Visual with Play Button Overlay */}
            <div style={{ position: 'relative' }}>
              <div className="hero-image-frame" style={{ height: '320px', width: '100%', cursor: 'pointer' }} onClick={() => setShowVideoModal(true)}>
                <img 
                  src={formation.image || 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=800&q=80'} 
                  alt={title} 
                />

                {/* Play Button Badge */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--gradient-principal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 10px 25px rgba(37,99,235,0.4)',
                  transition: 'transform 0.2s'
                }}>
                  <Play size={28} fill="white" style={{ marginLeft: '4px' }} />
                </div>

                <div className="floating-widget" style={{ bottom: '20px', right: '20px', background: 'rgba(255,255,255,0.95)' }}>
                  <Star size={24} fill="#F59E0B" color="#F59E0B" />
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>4.9 / 5</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('detail.based_on_reviews')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION TABS BAR ===== */}
      <div className="detail-tabs-bar" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 'var(--header-height)', zIndex: 100 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 'clamp(16px, 2.5vw, 32px)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {(['apercu', 'programme', 'formateur', 'avis', 'faq'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '18px 0',
                  fontFamily: 'var(--font-title)',
                  fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? 'var(--bleu)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '3px solid var(--bleu)' : '3px solid transparent',
                  textTransform: 'capitalize',
                  fontSize: '1rem',
                  flexShrink: 0
                }}
              >
                {tab === 'apercu' ? t('detail.tab.apercu') : tab === 'programme' ? t('detail.tab.curriculum') : tab === 'formateur' ? t('detail.tab.instructor') : tab === 'avis' ? t('detail.tab.reviews') : t('detail.tab.faq')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT GRID ===== */}
      <section className="section">
        <div className="container">
          <div className="detail-main-grid">
            {/* LEFT MAIN CONTENT */}
            <div>
              {/* À propos */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '16px' }}>{t('detail.about_course')}</h2>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '24px' }}>
                  {description}
                </p>

                {/* 2 Feature Cards Grid */}
                <div className="grid-2">
                  <div className="card" style={{ padding: '24px', borderRadius: '20px', background: 'var(--bleu-clair)' }}>
                    <h4 style={{ color: 'var(--bleu)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={20} /> {t('detail.what_you_learn')}
                    </h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                      {objectivesList.map((obj: any, idx: number) => (
                        <li key={idx}>✓ {obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="card" style={{ padding: '24px', borderRadius: '20px', background: 'var(--rose-pastel)' }}>
                    <h4 style={{ color: 'var(--rose)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={20} /> {t('detail.who_is_it_for')}
                    </h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                      {targetList.map((tgt: any, idx: number) => (
                        <li key={idx}>✓ {tgt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Programme (Accordions) */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '16px' }}>{t('detail.course_program')}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {curriculumList.map((mod: any, i: number) => (
                    <div 
                      key={i} 
                      style={{ 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '16px', 
                        overflow: 'hidden' 
                      }}
                    >
                      <div 
                        onClick={() => toggleModule(i)}
                        style={{ 
                          padding: '16px 20px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Video size={18} color="var(--bleu)" />
                          <span>{mod.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {openModules.has(i) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                      
                      {openModules.has(i) && (
                        <div style={{ padding: '0 20px 16px 50px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {mod.items.map((item: any, subIdx: number) => (
                              <li key={subIdx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Formateur Bio */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '16px' }}>{t('detail.your_instructor')}</h2>
                <div className="card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <img 
                    src="./assets/images/oum-dorra-cherichi.webp" 
                    alt={t('about.founder_name')} 
                    style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{t('about.founder_name')} ✓</h3>
                    <div style={{ color: 'var(--bleu)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                      {t('detail.instructor_title')}
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>
                      {t('detail.instructor_bio')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT STICKY PRICING CARD WITH REAL-TIME COUNTDOWN */}
            <div id="inscription-card">
              <div 
                className="card" 
                style={{ 
                  padding: 'var(--card-padding)', 
                  borderRadius: '28px', 
                  boxShadow: 'var(--shadow-xl)', 
                  border: hasPromo ? '2px solid #f43f5e' : '2px solid var(--bleu-clair)',
                  position: 'sticky',
                  top: '100px',
                  background: 'var(--bg-card)'
                }}
              >
                {/* Header label & Promo flash pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                    {t('detail.pricing_title')}
                  </div>
                  {hasPromo && (
                    <span style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
                    }}>
                      <Sparkles size={12} />
                      {discountPercent > 0 ? `-${discountPercent}% PROMO` : (lang === 'ar' ? 'عرض ترويجي' : 'OFFRE PROMO')}
                    </span>
                  )}
                </div>
                
                {/* Price Display with Strikethrough & Savings */}
                <div style={{ margin: '8px 0 16px 0' }}>
                  {hasPromo && numOldPrice > numPrice && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'السعر الأصلي:' : 'Prix initial :'}
                      </span>
                      <span style={{
                        fontSize: '1.2rem',
                        color: '#94a3b8',
                        textDecoration: 'line-through',
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}>
                        {oldPriceFormatted}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--bleu-royal)', fontFamily: 'var(--font-title)', lineHeight: 1 }}>
                      {priceFormatted}
                    </span>
                  </div>

                  {hasPromo && savings > 0 && (
                    <div style={{
                      marginTop: '8px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#059669',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>🎉 {lang === 'ar' ? `وفّر ${savingsFormatted} عند التسجيل الآن` : `Économisez ${savingsFormatted} !`}</span>
                    </div>
                  )}
                </div>

                {/* Real-Time Countdown Timer (Active on promotion) */}
                {hasPromo && timeLeft > 0 && (
                  <div style={{
                    background: 'linear-gradient(145deg, var(--bg-secondary) 0%, rgba(239, 68, 68, 0.05) 100%)',
                    padding: '14px',
                    borderRadius: '18px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    border: '1.5px dashed rgba(239, 68, 68, 0.4)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '8px' }}>
                      <Clock size={15} color="var(--rose)" />
                      <span>{t('detail.special_offer_ends')}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontFamily: 'monospace'
                    }}>
                      <div style={{ background: 'var(--bg-card)', padding: '5px 8px', borderRadius: '8px', minWidth: '40px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--bleu)' }}>{Math.floor(timeLeft / 86400).toString().padStart(2, '0')}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{lang === 'ar' ? 'يوم' : 'j'}</div>
                      </div>
                      <span style={{ fontWeight: 900, color: 'var(--bleu)' }}>:</span>
                      <div style={{ background: 'var(--bg-card)', padding: '5px 8px', borderRadius: '8px', minWidth: '40px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--bleu)' }}>{Math.floor((timeLeft % 86400) / 3600).toString().padStart(2, '0')}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{lang === 'ar' ? 'ساعة' : 'h'}</div>
                      </div>
                      <span style={{ fontWeight: 900, color: 'var(--bleu)' }}>:</span>
                      <div style={{ background: 'var(--bg-card)', padding: '5px 8px', borderRadius: '8px', minWidth: '40px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--bleu)' }}>{Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{lang === 'ar' ? 'دقيقة' : 'm'}</div>
                      </div>
                      <span style={{ fontWeight: 900, color: 'var(--rose)' }}>:</span>
                      <div style={{ background: 'var(--bg-card)', padding: '5px 8px', borderRadius: '8px', minWidth: '40px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--rose)' }}>{(timeLeft % 60).toString().padStart(2, '0')}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{lang === 'ar' ? 'ثانية' : 's'}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--rose)', fontWeight: 700, marginTop: '8px' }}>
                      ⚡ {lang === 'ar' ? 'المقاعد محدودة بهذا السعر الترويجي' : 'Places limitées au tarif promotionnel !'}
                    </div>
                  </div>
                )}

                <button 
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%', marginBottom: '10px' }}
                  onClick={() => setShowInscriptionModal(true)}
                >
                  {t('detail.enroll_now')} <ArrowRight size={18} className="btn-arrow" />
                </button>

                <a
                  href={`https://wa.me/213698746428?text=${encodeURIComponent(
                    lang === 'ar'
                      ? `السلام عليكم، أود الاستفسار بخصوص دورة: ${title}`
                      : lang === 'en'
                      ? `Hello, I would like to inquire about the course: ${title}`
                      : `Bonjour, je souhaite me renseigner sur la formation : ${title}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    gap: '8px',
                    borderColor: 'rgba(37, 211, 102, 0.4)',
                    color: '#128C7E',
                    fontWeight: 700,
                    marginBottom: '16px'
                  }}
                >
                  <MessageCircle size={18} color="#25D366" />
                  {t('detail.whatsapp_inquiry')}
                </a>

                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', marginTop: '16px' }}>
                  {t('detail.includes_title')}
                </div>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Video size={16} color="var(--succes)" /> {t('detail.lifetime_access')}</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="var(--succes)" /> {t('detail.hd_videos')}</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={16} color="var(--succes)" /> {formation.duration}h</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={16} color="var(--succes)" /> {t('detail.pdf_downloads')}</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Smartphone size={16} color="var(--succes)" /> {t('detail.mobile_access')}</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Award size={16} color="var(--succes)" /> {t('detail.certif_name')}</li>
                </ul>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={20} color="var(--bleu)" />
                  {t('detail.guarantee_text')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
