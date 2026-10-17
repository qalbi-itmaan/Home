import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import { useToast } from '../lib/ToastContext';
import InscriptionModal from '../components/InscriptionModal';
import { getFormationById, getPublishedFormations, getCategoryLabel, type Formation } from '../lib/firebase';
import { 
  GraduationCap, Clock, Award, Star, CheckCircle, ChevronDown, 
  ChevronUp, Heart, Video, FileText, Smartphone, ShieldCheck, 
  Share2, ArrowRight, ArrowLeft, Play, X, Loader2, MessageCircle
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

  // Real-time Countdown Timer (2 days, 14 hours, 27 mins, 36 secs)
  const [timeLeft, setTimeLeft] = useState(2 * 86400 + 14 * 3600 + 27 * 60 + 36);

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
  const priceFormatted = typeof formation.price === 'number' ? `${formation.price.toLocaleString()} ${t('currency')}` : formation.price;

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
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
              <button 
                onClick={() => setShowVideoModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '8px', borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
              <iframe 
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="Preview Video"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
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
              <div className="hero-tagline" style={{ background: 'var(--rose-pastel)', color: 'var(--rose)' }}>
                {getCategoryLabel(formation.category, lang) || t('detail.badge_popular')}
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
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" 
                    alt="Mme. Oum Dorra Cherichi" 
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
                  border: '2px solid var(--bleu-clair)',
                  position: 'sticky',
                  top: '100px'
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  {t('detail.pricing_title')}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '12px 0 20px 0' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--bleu-royal)', fontFamily: 'var(--font-title)' }}>
                    {priceFormatted}
                  </span>
                </div>

                {/* Real-Time Countdown Timer */}
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('detail.special_offer_ends')}</div>
                  <div style={{ fontWeight: 800, color: 'var(--rose)', fontSize: '1rem', letterSpacing: '1px' }}>
                    {formatCountdown(timeLeft)}
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%', marginBottom: '10px' }}
                  onClick={() => setShowInscriptionModal(true)}
                >
                  {t('detail.enroll_now')} <ArrowRight size={18} className="btn-arrow" />
                </button>

                <a
                  href={`https://wa.me/213550000000?text=${encodeURIComponent(
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
