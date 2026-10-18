import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLanguage } from './lib/i18n';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FormationsPage from './pages/FormationsPage';
import FormationDetailPage from './pages/FormationDetailPage';
import ConsultationsPage from './pages/ConsultationsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { ArrowUp, MessageCircle, X, Phone } from 'lucide-react';

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const { dir, lang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Observe fade-in elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div dir={dir} style={{ position: 'relative' }}>
      <ScrollToTopOnNavigate />
      <Header scrolled={scrolled} />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/formations" element={<FormationsPage />} />
          <Route path="/formations/:id" element={<FormationDetailPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Action Widgets: WhatsApp Chat & Scroll to Top */}
      <div 
        style={{
          position: 'fixed',
          bottom: '28px',
          right: dir === 'rtl' ? 'auto' : '28px',
          left: dir === 'rtl' ? '28px' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: dir === 'rtl' ? 'flex-start' : 'flex-end',
          gap: '14px',
          zIndex: 999
        }}
      >
        {/* Dual WhatsApp Quick Popup */}
        {showWhatsAppMenu && (
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid var(--border-color)',
              minWidth: '270px',
              animation: 'fadeIn 0.2s ease',
              marginBottom: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#25D366' }} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? 'تواصل معنا مباشرة' : 'Contact Direct'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppMenu(false)}
                aria-label="Fermer"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Option 1: Consultations */}
              <a
                href="https://wa.me/213558024610"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWhatsAppMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(37, 211, 102, 0.1)',
                  color: '#128C7E',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'background 0.15s ease'
                }}
              >
                <MessageCircle size={18} color="#25D366" />
                <div style={{ flex: 1 }}>
                  <div>{lang === 'ar' ? 'الاستشارات الأسرية' : 'Consultations'}</div>
                  <div dir="ltr" style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>0558 02 46 10</div>
                </div>
              </a>

              {/* Option 2: Formations */}
              <a
                href="https://wa.me/213698746428"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWhatsAppMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(37, 99, 235, 0.08)',
                  color: 'var(--bleu)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'background 0.15s ease'
                }}
              >
                <MessageCircle size={18} color="var(--bleu)" />
                <div style={{ flex: 1 }}>
                  <div>{lang === 'ar' ? 'الدورات والتكوينات' : 'Formations'}</div>
                  <div dir="ltr" style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>0698 74 64 28</div>
                </div>
              </a>

              {/* Option 3: Fixe */}
              <a
                href="tel:028908139"
                onClick={() => setShowWhatsAppMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary, #f8fafc)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem'
                }}
              >
                <Phone size={16} />
                <div style={{ flex: 1 }}>
                  <span>{lang === 'ar' ? 'الهاتف الثابت: ' : 'Ligne Fixe : '}</span>
                  <span dir="ltr">028 90 81 39</span>
                </div>
              </a>
            </div>
          </div>
        )}

        {/* Floating WhatsApp Quick Contact Button */}
        <button
          type="button"
          onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
          aria-label={lang === 'ar' ? 'تحدث معنا عبر واتساب' : 'Discuter sur WhatsApp'}
          title={lang === 'ar' ? 'تحدث معنا عبر واتساب' : 'Discuter sur WhatsApp'}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: '#25D366',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            cursor: 'pointer',
            border: 'none'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {showWhatsAppMenu ? <X size={26} color="white" /> : <MessageCircle size={28} fill="white" />}
        </button>

        {/* Scroll to Top Floating Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              color: 'var(--bleu)',
              border: '2px solid var(--bleu-clair)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-principal)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.color = 'var(--bleu)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ArrowUp size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
