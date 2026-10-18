import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img 
                src="./assets/logo/logo-mark.png" 
                alt="Qalbi Itmaan" 
                style={{ height: '42px', width: 'auto', objectFit: 'contain' }} 
              />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                {lang === 'ar' ? 'قلبي اطمأن' : 'Qalbi Itmaan'}
              </span>
            </div>
            <p>{t('footer.description')}</p>
            <p style={{ marginTop: '12px', fontFamily: 'var(--font-title-ar)', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
              {t('footer.slogan')}
            </p>
          </div>

          <div className="footer-col">
            <h4>{t('footer.links')}</h4>
            <ul>
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/formations">{t('nav.formations')}</Link></li>
              <li><Link to="/consultations">{t('nav.consultations')}</Link></li>
              <li><Link to="/about">{t('nav.about')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.services')}</h4>
            <ul>
              <li><Link to="/consultations">{t('service.consultation.name')}</Link></li>
              <li><Link to="/consultations">{t('service.psycho.name')}</Link></li>
              <li><Link to="/formations">{t('service.formation.name')}</Link></li>
              <li><Link to="/consultations">{t('service.coaching.name')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.contact')}</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <a 
                  href="https://maps.app.goo.gl/x7WfmaLJfHs4Jb3s9" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
                  title="Localisation Google Maps"
                >
                  <MapPin size={15} color="#E84D9B" style={{ flexShrink: 0 }} />
                  <span>{t('footer.location')} (Bouzaréah)</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/213558024610" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
                  title="WhatsApp & Appel Consultations"
                >
                  <Phone size={15} color="#25D366" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>{lang === 'ar' ? 'الاستشارات: ' : 'Consultations : '}</strong>
                    <span dir="ltr">0558 02 46 10</span>
                  </span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/213698746428" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
                  title="WhatsApp & Appel Formations"
                >
                  <Phone size={15} color="#25D366" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>{lang === 'ar' ? 'الدورات: ' : 'Formations : '}</strong>
                    <span dir="ltr">0698 74 64 28</span>
                  </span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:028908139" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
                  title="Ligne Fixe"
                >
                  <Phone size={15} color="#E84D9B" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>{lang === 'ar' ? 'الثابت: ' : 'Fixe : '}</strong>
                    <span dir="ltr">028 90 81 39</span>
                  </span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@qalbi-itmaan.dz" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
                >
                  <Mail size={15} color="#E84D9B" style={{ flexShrink: 0 }} />
                  <span>contact@qalbi-itmaan.dz</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.rights')}</p>
          <div className="footer-social">
            <a 
              href="https://www.facebook.com/profile.php/?id=100064151347005" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook Qalbi Itmaan"
              title="Facebook Qalbi Itmaan"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a 
              href="https://www.instagram.com/qalbi_itmaan20/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram Qalbi Itmaan"
              title="Instagram @qalbi_itmaan20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
            <a 
              href="https://maps.app.goo.gl/x7WfmaLJfHs4Jb3s9" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Google Maps Qalbi Itmaan"
              title="Google Maps"
            >
              <MapPin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
