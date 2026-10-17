import { useLanguage } from '../lib/i18n';
import { Heart, Shield, Users, Star, Flower2, Ear, GraduationCap, TrendingUp, Eye, Target, MapPin, Award, CheckCircle } from 'lucide-react';

const values = [
  { icon: Heart, nameKey: 'value.bienveillance' },
  { icon: Shield, nameKey: 'value.confiance' },
  { icon: Users, nameKey: 'value.famille' },
  { icon: Star, nameKey: 'value.expertise' },
  { icon: Flower2, nameKey: 'value.serenite' },
  { icon: Ear, nameKey: 'value.ecoute' },
  { icon: GraduationCap, nameKey: 'value.formation' },
  { icon: TrendingUp, nameKey: 'value.developpement' },
];

export default function AboutPage() {
  const { t, lang } = useLanguage();

  const titleFont = lang === 'ar' ? 'var(--font-title-ar)' : 'var(--font-title)';

  return (
    <div className="page-enter">
      {/* Header Banner */}
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontFamily: titleFont }}>
            <span className="gradient-text">{t('about.title')}</span>
          </h1>
          <p className="subtitle" style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            {t('about.subtitle_desc')}
          </p>
        </div>
      </div>

      {/* Presentation section for Mme. Oum Dorra Cherichi */}
      <section className="section">
        <div className="container">
          <div className="card" style={{ padding: 'clamp(2rem, 4vw, 3rem)', borderRadius: '32px', border: '2px solid var(--bleu-clair)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=450&q=80" 
                    alt="الأستاذة أم درة شريشي" 
                    style={{ width: '220px', height: '220px', borderRadius: '50%', objectFit: 'cover', border: '6px solid var(--bleu-clair)', boxShadow: 'var(--shadow-lg)' }}
                  />
                  <div style={{ position: 'absolute', bottom: '10px', insetInlineEnd: '10px', background: 'var(--gradient-principal)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem' }}>
                    {t('about.stat_rating')}
                  </div>
                </div>
              </div>

              <div>
                <div className="hero-tagline" style={{ marginBottom: '12px', display: 'inline-flex' }}>
                  <Award size={16} />
                  {t('about.founder_badge')}
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', fontFamily: titleFont }}>
                  {t('about.founder_name')}
                </h2>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  {t('about.founder_bio')}
                </p>

                <div className="grid-2" style={{ gap: '14px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.925rem', fontWeight: 600 }}>
                    <CheckCircle size={18} color="var(--bleu)" />
                    <span>{t('about.feature_mediation')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.925rem', fontWeight: 600 }}>
                    <CheckCircle size={18} color="var(--bleu)" />
                    <span>{t('about.feature_education')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.925rem', fontWeight: 600 }}>
                    <CheckCircle size={18} color="var(--bleu)" />
                    <span>{t('about.feature_onsite')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.925rem', fontWeight: 600 }}>
                    <CheckCircle size={18} color="var(--bleu)" />
                    <span>{t('about.feature_online')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--bleu-royal)', fontWeight: 700, background: 'var(--bleu-clair)', padding: '12px 20px', borderRadius: '16px' }}>
                  <MapPin size={18} />
                  <span>
                    {t('about.hq_location')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section bg-secondary" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div className="card" style={{ borderTop: '4px solid var(--bleu)', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '48px', height: '48px' }}>
                  <Eye size={24} />
                </div>
                <h2 style={{ margin: 0, fontFamily: titleFont, fontSize: '1.5rem' }}>{t('about.vision.title')}</h2>
              </div>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{t('about.vision.text')}</p>
            </div>

            <div className="card" style={{ borderTop: '4px solid var(--violet)', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className="stat-icon-wrapper stat-icon-purple" style={{ width: '48px', height: '48px' }}>
                  <Target size={24} />
                </div>
                <h2 style={{ margin: 0, fontFamily: titleFont, fontSize: '1.5rem' }}>{t('about.mission.title')}</h2>
              </div>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{t('about.mission.text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2 style={{ fontFamily: titleFont }}><span className="gradient-text">{t('about.values.title')}</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div className="card" style={{ textAlign: 'center', padding: '24px', borderRadius: '20px' }} key={i}>
                  <div className="stat-icon-wrapper stat-icon-pink" style={{ width: '56px', height: '56px', margin: '0 auto 14px auto' }}>
                    <Icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: titleFont }}>{t(v.nameKey)}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="section">
        <div className="container">
          <div className="cta-banner" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: titleFont, fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', margin: 0, color: 'white' }}>
              "{t('about.promise')}"
            </h2>
          </div>
        </div>
      </section>
    </div>
  );
}
