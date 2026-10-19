import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import ExpertModal, { Expert } from '../components/ExpertModal';
import InscriptionModal from '../components/InscriptionModal';
import { getPublishedFormations, type Formation } from '../lib/firebase';
import { getDynamicUpcomingSlots } from '../lib/dateUtils';
import {
  Heart, Users, BookOpen, GraduationCap, MessageCircle,
  Sparkles, Clock, ArrowRight, Calendar, CheckCircle2, 
  ShieldCheck, Star, Award, UserCheck, Smartphone, Lightbulb,
  ChevronDown, ChevronUp, HelpCircle
} from 'lucide-react';

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / 40;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 30);
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <div className="stat-number" ref={ref}>+{count}{suffix}</div>;
}

export default function HomePage() {
  const { t, lang } = useLanguage();
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedFormationForInscription, setSelectedFormationForInscription] = useState<Formation | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formations, setFormations] = useState<Formation[]>([]);

  useEffect(() => {
    getPublishedFormations()
      .then((data) => setFormations(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  const services = [
    { icon: Heart, colorClass: 'stat-icon-pink', titleKey: 'service.consultation.name', descKey: 'service.consultation.desc' },
    { icon: MessageCircle, colorClass: 'stat-icon-purple', titleKey: 'service.psycho.name', descKey: 'service.psycho.desc' },
    { icon: Users, colorClass: 'stat-icon-blue', titleKey: 'service.couple.name', descKey: 'service.couple.desc' },
    { icon: GraduationCap, colorClass: 'stat-icon-green', titleKey: 'service.education.name', descKey: 'service.education.desc' },
    { icon: BookOpen, colorClass: 'stat-icon-purple', titleKey: 'service.formation.name', descKey: 'service.formation.desc' },
    { icon: Sparkles, colorClass: 'stat-icon-pink', titleKey: 'service.workshop.name', descKey: 'service.workshop.desc' },
  ];

  const features = [
    { icon: ShieldCheck, titleKey: 'why.confidentiality.title', descKey: 'why.confidentiality.desc' },
    { icon: Heart, titleKey: 'why.kindness.title', descKey: 'why.kindness.desc' },
    { icon: UserCheck, titleKey: 'why.experts.title', descKey: 'why.experts.desc' },
    { icon: Lightbulb, titleKey: 'why.integrated.title', descKey: 'why.integrated.desc' },
    { icon: Smartphone, titleKey: 'why.accessibility.title', descKey: 'why.accessibility.desc' },
    { icon: Award, titleKey: 'why.results.title', descKey: 'why.results.desc' },
  ];

  // SINGLE EXPERT AS SPECIFIED BY USER: الاستشارية الأسرية أم درة نسرين شريشي
  const experts: Expert[] = [
    {
      name: lang === 'ar' ? 'الأستاذة أم درة نسرين شريشي' : lang === 'en' ? 'Mme Oum Dorra Nesrine Cherichi' : 'Mme Oum Dorra Nesrine Cherichi',
      specialty: lang === 'ar' ? 'مستشارة أسرية وتربوية | مديرة المركز' : lang === 'en' ? 'Family Consultant & Center Director' : 'Conseillère familiale & Directrice du Centre',
      rating: '4.9 (350+)',
      img: './assets/images/oum-dorra-cherichi.jpeg',
      bio: lang === 'ar'
        ? 'أم درة نسرين شريشي؛ مستشارة أسرية وتربوية، ومديرة مركز "قلبي اطمأن" للتكوين والاستشارات بوزريعة (الجزائر العاصمة). حاصلة على ليسانس شريعة وقانون، ماستر في الفقه المقارن والأصول، وباحثة ماستر في علم الاجتماع العائلي بجامعة بوزريعة، مع تخصص دقيق واعتماد مهني في الإرشاد الأسري والتربوي والوساطة الاجتماعية وإصلاح ذات البين.'
        : lang === 'en'
        ? 'Family and educational consultant, and director of "Qalbi Itmaan" Center in Bouzaréah, Algiers. Holder of degrees in Sharia & Law, Comparative Jurisprudence, and completing a Master\'s in Family Sociology at the University of Bouzaréah, with professional certification in marital guidance, parenting, and family mediation.'
        : 'Conseillère familiale et éducative, directrice du centre « Qalbi Itmaan » à Bouzaréah (Alger). Titulaire d\'une licence en droit et charia, d\'un master en droit comparé et chercheuse en sociologie de la famille à l\'université de Bouzaréah, avec une expertise certifiée en conseil conjugal, éducation bienveillante et médiation familiale.',
      availableSlots: getDynamicUpcomingSlots(lang as 'fr' | 'ar' | 'en')
    }
  ];

  const faqs = [
    { qKey: 'faq.q1', aKey: 'faq.a1' },
    { qKey: 'faq.q2', aKey: 'faq.a2' },
    { qKey: 'faq.q3', aKey: 'faq.a3' },
    { qKey: 'faq.q4', aKey: 'faq.a4' },
  ];

  return (
    <div className="page-enter">
      {/* Modals */}
      <ExpertModal expert={selectedExpert} onClose={() => setSelectedExpert(null)} />
      
      {selectedFormationForInscription && (
        <InscriptionModal 
          formation={selectedFormationForInscription} 
          onClose={() => setSelectedFormationForInscription(null)} 
        />
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-tagline">
                <Heart size={16} fill="var(--rose)" />
                {t('hero.tagline')}
              </div>
              <h1>
                {t('hero.title1')}<br />
                <span className="gradient-text">{t('hero.title2')}</span>
              </h1>
              {lang !== 'ar' && <div className="hero-subtitle-ar">- لأجل بيوت مطمئنة - ♡</div>}
              <p className="hero-subtitle">
                {t('hero.subtitle').split('**').map((part, i) => 
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
              </p>
              
              <div className="hero-buttons">
                <Link to="/consultations" className="btn btn-primary btn-lg">
                  {t('hero.cta.consultation')}
                  <Calendar size={18} />
                </Link>
                <Link to="/formations" className="btn btn-secondary btn-lg">
                  <Heart size={18} />
                  {t('hero.cta.formations')}
                </Link>
              </div>

              {/* Social Proof Stack */}
              <div className="hero-social-proof">
                <div className="avatar-stack">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User 1" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="User 2" />
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="User 3" />
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80" alt="User 4" />
                </div>
                <div>
                  <div className="social-proof-text">{t('hero.social_proof')}</div>
                  <div className="social-proof-stars">
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <span style={{ color: 'var(--text-secondary)', marginInlineStart: '4px' }}>{t('hero.social_proof_rating')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual with Floating Widgets */}
            <div className="hero-visual-wrapper">
              <div className="hero-image-natural">
                <img 
                  src="./assets/images/hero.png" 
                  alt="Family Consultation Qalbi Itmaan" 
                />
              </div>

              {/* Floating Widget 1 — Top: Next Appointment */}
              <div className="floating-widget hero-float-appointment">
                <div className="stat-icon-wrapper stat-icon-pink" style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('hero.widget.next_appointment')}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {experts[0]?.availableSlots?.[0] || (lang === 'ar' ? 'غداً - 10:00' : 'Demain - 10:00')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--rose)', fontWeight: 600, marginTop: '2px' }}>{t('hero.widget.see_details')}</div>
                </div>
              </div>

              {/* Floating Widget 2 — Mid-Left: Recommended Course */}
              <div className="floating-widget hero-float-course">
                <div className="stat-icon-wrapper stat-icon-purple" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                  <BookOpen size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('hero.widget.recommended_course')}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'التواصل الإيجابي' : 'Communication'}
                  </div>
                  <div style={{ height: '4px', background: 'var(--desactive)', borderRadius: '4px', marginTop: '5px', width: '100%' }}>
                    <div style={{ width: '19%', height: '100%', background: 'var(--gradient-principal)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {lang === 'ar' ? '19% مكتمل' : lang === 'en' ? '19% completed' : '19% complété'}
                  </div>
                </div>
              </div>

              {/* Floating Widget 3 — Top-Right: Online Consultation */}
              <div className="floating-widget hero-float-online">
                <div className="stat-icon-wrapper stat-icon-green" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                  <Smartphone size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('hero.widget.online_available')}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--succes)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="pulse-dot" style={{ width: '6px', height: '6px', background: 'var(--succes)' }} />
                    {t('hero.widget.available')}
                  </div>
                </div>
              </div>

              {/* Floating Widget 4 — Bottom-Right: Resources */}
              <div className="floating-widget hero-float-resources">
                <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('hero.widget.resources')}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{t('hero.widget.new_articles')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Wave Decoration */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z" fill="var(--bg-primary)" />
          </svg>
        </div>
      </section>

      {/* ===== FLOATING STATS BANNER ===== */}
      <section className="stats-banner-container">
        <div className="container">
          <div className="stats-card">
            <div className="stat-item">
              <div className="stat-icon-wrapper stat-icon-pink">
                <Users size={28} />
              </div>
              <div>
                <Counter end={1200} />
                <div className="stat-label">{t('stats.families')}</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon-wrapper stat-icon-purple">
                <Award size={28} />
              </div>
              <div>
                <Counter end={10} />
                <div className="stat-label">{t('stats.years_experience')}</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrapper stat-icon-green">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <Counter end={98} suffix="%" />
                <div className="stat-label">{t('stats.satisfaction_rate')}</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrapper stat-icon-blue">
                <BookOpen size={28} />
              </div>
              <div>
                <Counter end={60} />
                <div className="stat-label">{t('stats.available_courses')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NOS SERVICES SECTION ===== */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>{t('services.title')}</h2>
            <p className="subtitle">{t('services.subtitle')}</p>
          </div>

          <div className="services-grid">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div className="service-card" key={i}>
                  <div className={`service-icon-box ${svc.colorClass}`}>
                    <Icon size={28} />
                  </div>
                  <h3>{t(svc.titleKey)}</h3>
                  <p>{t(svc.descKey)}</p>
                  <Link to="/consultations" className="service-link">
                    {t('services.learn_more')} <ArrowRight size={16} className="btn-arrow" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== POURQUOI CHOISIR QALBI ITMAAN ? ===== */}
      <section className="section bg-secondary" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-title">
            <h2>{t('why.title')}</h2>
            <p className="subtitle">{t('why.subtitle')}</p>
          </div>

          <div className="features-grid">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div className="feature-pill-card" key={i}>
                  <div className="feature-icon-wrapper stat-icon-blue">
                    <Icon size={24} />
                  </div>
                  <h4>{t(feat.titleKey)}</h4>
                  <p>{t(feat.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== EXPERT FEATURED SECTION: الاستشارية الأسرية أم درة شريشي ===== */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2><span className="gradient-text">{lang === 'ar' ? 'الاستشارية الأسرية والتربوية' : lang === 'en' ? 'Our Expert Consultant' : 'Notre Conseillère Experte'}</span></h2>
            <p className="subtitle">{lang === 'ar' ? 'مرافقة احترافية وأسرية مخصصة مع الاستشارية أم درة نسرين شريشي' : lang === 'en' ? 'Personalized, caring support with Mrs. Oum Dorra Nesrine Cherichi' : 'Un accompagnement personnalisé et bienveillant avec Mme Oum Dorra Nesrine Cherichi'}</p>
          </div>

          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            {experts.map((exp, i) => (
              <div 
                className="expert-card-featured" 
                key={i} 
                onClick={() => setSelectedExpert(exp)} 
              >
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={exp.img} 
                    alt={exp.name} 
                    style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bleu-clair)', margin: '0 auto 12px auto' }}
                  />
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Star size={16} fill="#F59E0B" color="#F59E0B" />
                    <span>{exp.rating}</span>
                  </div>
                </div>

                <div>
                  <span className="expert-tag" style={{ marginBottom: '8px', display: 'inline-block' }}>{exp.specialty}</span>
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '8px', fontWeight: 800 }}>{exp.name}</h3>
                  <p style={{ fontSize: '0.975rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    {exp.bio}
                  </p>
                  
                  <div className="expert-actions-row">
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedExpert(exp); }}>
                      <Calendar size={16} /> {t('home.book_consultation')}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedExpert(exp); }}>
                      {t('expert.see_profile')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FORMATIONS MISES EN AVANT ===== */}
      <section className="section bg-secondary" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-title section-title-split">
            <div>
              <h2>{t('formations.featured_title')}</h2>
              <p className="subtitle" style={{ margin: 0 }}>{t('formations.featured_subtitle')}</p>
            </div>
            <Link to="/formations" className="service-link" style={{ fontSize: '1rem' }}>
              {t('formations.view_all')} <ArrowRight size={18} className="btn-arrow" />
            </Link>
          </div>

          <div className="formations-grid">
            {formations.slice(0, 3).map((f) => {
              const title = f.name[lang as 'fr' | 'ar' | 'en'] || f.name.fr || f.name.ar || '';
              
              const numPrice = typeof f.price === 'number' ? f.price : Number(f.price) || 0;
              const priceFormatted = `${numPrice.toLocaleString()} ${t('currency')}`;
              const numOldPrice = f.oldPrice ? Number(f.oldPrice) : 0;
              const hasPromo = (numOldPrice > numPrice) || Boolean(f.isPromoted);
              const discountPercent = (numOldPrice > numPrice) ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100) : 0;
              const oldPriceFormatted = numOldPrice > 0 ? `${numOldPrice.toLocaleString()} ${t('currency')}` : '';

              return (
                <div className="formation-card" key={f.id}>
                  <div className="formation-card-image">
                    <img src={f.image || 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=600&q=80'} alt={title} />
                    <span className="formation-badge-populaire">
                      {f.type === 'online' ? t('type.online') : f.type === 'hybrid' ? t('type.hybrid') : t('type.presentiel')}
                    </span>
                    {hasPromo && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        insetInlineStart: '12px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        boxShadow: '0 4px 10px rgba(239,68,68,0.4)',
                        zIndex: 2
                      }}>
                        🔥 PROMO {discountPercent > 0 ? `-${discountPercent}%` : ''}
                      </span>
                    )}
                  </div>
                  <div className="formation-card-body">
                    <div className="formation-meta">
                      <span><Clock size={14} /> {f.duration}h</span>
                      <span>•</span>
                      <span>{f.level === 'beginner' ? t('level.beginner') : f.level === 'advanced' ? t('level.advanced') : t('level.intermediate')}</span>
                    </div>
                    <h3>{title}</h3>
                    <div className="formation-footer">
                      <div className="formation-footer-price-row">
                        <span className="formation-price-label">{t('price.fee_label')}</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          {hasPromo && numOldPrice > numPrice && (
                            <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
                              {oldPriceFormatted}
                            </span>
                          )}
                          <span className="formation-price">{priceFormatted}</span>
                        </div>
                      </div>
                      <div className="formation-actions-grid">
                        <button 
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => setSelectedFormationForInscription(f)}
                        >
                          {t('detail.enroll_now')}
                        </button>
                        <Link 
                          to={`/formations/${f.id}`} 
                          className="btn btn-secondary btn-sm"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          {t('formations.details')} <ArrowRight size={14} className="btn-arrow" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ACCORDION ===== */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2><span className="gradient-text">{t('faq.title')}</span></h2>
            <p className="subtitle">{t('faq.subtitle')}</p>
          </div>

          <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="card" 
                style={{ padding: '18px 22px', cursor: 'pointer', borderRadius: '20px' }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <HelpCircle size={20} color="var(--bleu)" />
                    <span>{t(faq.qKey)}</span>
                  </div>
                  {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {openFaq === i && (
                  <p style={{ marginTop: '14px', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    {t(faq.aKey)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TÉMOIGNAGES ===== */}
      <section className="section bg-secondary" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-title">
            <h2>{t('testimonials.title')}</h2>
            <p className="subtitle">{t('testimonials.subtitle')}</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                "{t('testimonial.1.quote')}"
              </p>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Sarah & Karim" />
                <div>
                  <div style={{ fontWeight: 700 }}>{t('testimonial.1.author')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('consultations.couple')}</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                "{t('testimonial.2.quote')}"
              </p>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="Fatima" />
                <div>
                  <div style={{ fontWeight: 700 }}>{t('testimonial.2.author')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('service.formation.name')}</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                "{t('testimonial.3.quote')}"
              </p>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Youssef" />
                <div>
                  <div style={{ fontWeight: 700 }}>{t('testimonial.3.author')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('consultations.individual')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RICH GRADIENT BOTTOM BANNER ===== */}
      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner-content">
              <div>
                <h2>{t('cta.banner_title')}</h2>
                <p>{t('cta.banner_subtitle')}</p>
              </div>
              <Link to="/consultations" className="btn btn-secondary btn-lg" style={{ background: 'white', color: 'var(--bleu-royal)', fontWeight: 700 }}>
                <Calendar size={20} />
                {t('hero.cta.consultation')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
