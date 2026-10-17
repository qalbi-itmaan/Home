import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import InscriptionModal from '../components/InscriptionModal';
import { getPublishedFormations, getCategoryLabel, type Formation } from '../lib/firebase';
import { 
  GraduationCap, Clock, ArrowRight, Search, 
  User, Loader2
} from 'lucide-react';

export default function FormationsPage() {
  const { t, lang } = useLanguage();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormationForInscription, setSelectedFormationForInscription] = useState<Formation | null>(null);

  useEffect(() => {
    getPublishedFormations()
      .then((data) => setFormations(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const dynamicCategories = useMemo(() => {
    const catMap = new Map<string, { key: string; name: string }>();
    catMap.set('all', { key: 'all', name: t('formations.all') });

    formations.forEach(f => {
      if (!f.category) return;
      const label = getCategoryLabel(f.category, lang);
      const key = (typeof f.category === 'object'
        ? (f.category.fr || f.category.ar || f.category.en || '')
        : String(f.category)).toLowerCase().trim();

      if (key && !catMap.has(key)) {
        catMap.set(key, { key, name: label || key });
      }
    });

    return Array.from(catMap.values());
  }, [formations, lang, t]);

  const filteredFormations = formations.filter((f) => {
    const title = f.name[lang as 'fr' | 'ar' | 'en'] || f.name.fr || f.name.ar || f.name.en || '';
    const desc = f.description[lang as 'fr' | 'ar' | 'en'] || f.description.fr || f.description.ar || f.description.en || '';

    const catKey = (typeof f.category === 'object'
      ? (f.category.fr || f.category.ar || f.category.en || '')
      : String(f.category)).toLowerCase().trim();

    const matchesCategory = activeCategory === 'all' || catKey === activeCategory;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          desc.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-enter">
      {/* Inscription Modal */}
      <InscriptionModal 
        formation={selectedFormationForInscription} 
        onClose={() => setSelectedFormationForInscription(null)} 
      />

      {/* ===== HERO BANNER ===== */}
      <div className="page-header">
        <div className="container">
          <h1>
            <span className="gradient-text">{t('formations.title')}</span>
          </h1>
          <p>{t('formations.subtitle')}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '24px', flexWrap: 'wrap' }}>
            <div className="hero-tagline" style={{ margin: 0 }}>
              <GraduationCap size={16} /> +60 {t('stats.available_courses')}
            </div>
            <div className="hero-tagline" style={{ margin: 0, background: 'var(--bleu-clair)', color: 'var(--bleu)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>
              <User size={16} /> {t('stats.experts_qual')}
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* ===== CATALOGUE TOOLBAR ===== */}
          <div className="catalogue-toolbar">
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder={t('formations.search_placeholder')} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="filter-pills-row">
              {dynamicCategories.map((cat) => (
                <button
                  key={cat.key}
                  className={`filter-pill ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* ===== COURSES GRID ===== */}
          <div style={{ marginBottom: '24px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {filteredFormations.length} {t('formations.found_count')}
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px' }}>{t('formations.loading')}</p>
            </div>
          ) : (
            <div className="formations-grid">
              {filteredFormations.map((f) => {
                const title = f.name[lang as 'fr' | 'ar' | 'en'] || f.name.fr || f.name.ar || (f.name as any).en || '';
                const desc = f.description[lang as 'fr' | 'ar' | 'en'] || f.description.fr || f.description.ar || (f.description as any).en || '';
                const priceFormatted = typeof f.price === 'number' ? `${f.price.toLocaleString()} ${t('currency')}` : f.price;

                return (
                  <div className="formation-card" key={f.id}>
                    <div className="formation-card-image">
                      <img src={f.image || 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=600&q=80'} alt={title} />
                      <span className="formation-badge-populaire">
                        {f.type === 'online' ? t('type.online') : f.type === 'hybrid' ? t('type.hybrid') : t('type.presentiel')}
                      </span>
                    </div>

                    <div className="formation-card-body">
                      <div className="formation-meta">
                        <span><Clock size={14} /> {f.duration}h</span>
                        <span>•</span>
                        <span>{f.level === 'beginner' ? t('level.beginner') : f.level === 'advanced' ? t('level.advanced') : t('level.intermediate')}</span>
                      </div>

                      <h3>{title}</h3>
                      <p className="formation-card-desc">
                        {desc}
                      </p>

                      <div className="formation-footer">
                        <div className="formation-footer-price-row">
                          <span className="formation-price-label">{t('price.fee_label')}</span>
                          <span className="formation-price">{priceFormatted}</span>
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
          )}
        </div>
      </section>
    </div>
  );
}
