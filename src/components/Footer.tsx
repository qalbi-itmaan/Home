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
                src="/assets/logo/logo-mark.png" 
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
            <ul>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="#E84D9B" />
                {t('footer.location')}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#E84D9B" />
                <a href="tel:0550000000" style={{ color: 'inherit', textDecoration: 'none' }}>0550 00 00 00</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="#E84D9B" />
                <a href="mailto:contact@qalbi-itmaan.com" style={{ color: 'inherit', textDecoration: 'none' }}>contact@qalbi-itmaan.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.rights')}</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
            <a href="#" aria-label="Youtube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
