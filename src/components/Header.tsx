import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage, type Lang } from '../lib/i18n';
import { Menu, X, Globe, Sun, Moon, ChevronDown, Calendar, Check, GraduationCap } from 'lucide-react';
import { StudentSpaceModal } from './StudentSpaceModal';

interface HeaderProps {
  scrolled: boolean;
}

function WebLanguageDropdown({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: Array<{ code: Lang; flag: string; label: string }> = [
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'ar', flag: '🇩🇿', label: 'العربية' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
  ];

  const currentOption = options.find((o) => o.code === lang) || options[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="header-lang-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Globe size={15} className="header-lang-globe" color="var(--bleu, #4f6ef6)" />
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{currentOption.flag}</span>
          <span className="header-lang-label-full">{currentOption.label}</span>
          <span className="header-lang-label-short">{currentOption.code.toUpperCase()}</span>
        </span>
        <ChevronDown
          size={13}
          style={{
            color: 'var(--text-secondary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: lang === 'ar' ? 'auto' : 0,
            left: lang === 'ar' ? 0 : 'auto',
            minWidth: '150px',
            padding: '6px',
            borderRadius: '16px',
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.16), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
            zIndex: 1100,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.code === lang;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLang(opt.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isSelected ? 'var(--bleu-clair, #eef2ff)' : 'transparent',
                  color: isSelected ? 'var(--bleu, #4f6ef6)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: opt.code === 'ar' ? 'right' : 'left',
                  transition: 'all 0.15s ease',
                  marginBottom: '2px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{opt.flag}</span>
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check size={16} color="var(--bleu, #4f6ef6)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Header({ scrolled }: HeaderProps) {
  const { t, lang, setLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentSpaceOpen, setStudentSpaceOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('qalbi_theme') as 'light' | 'dark') || 'light'
  );
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qalbi_theme', theme);
  }, [theme]);

  // Lock body scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/formations', label: t('nav.formations') },
    { to: '/consultations', label: t('nav.consultations') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        {/* Scroll Progress Bar */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            height: '3px', 
            width: `${scrollProgress}%`, 
            background: 'var(--gradient-principal)',
            transition: 'width 100ms ease-out',
            zIndex: 1200
          }} 
        />

        <div className="header-inner">
          <Link to="/" className="header-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="./assets/logo/logo-header.png" 
              alt="Qalbi Itmaan - قلبي اطمأن" 
              className="header-logo-img"
            />
          </Link>

          <nav className={`header-nav ${mobileOpen ? 'open' : ''}`}>
            <div className="header-nav-links">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={location.pathname === link.to ? 'active' : ''}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="header-nav-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm header-student-btn"
                onClick={() => {
                  setStudentSpaceOpen(true);
                  setMobileOpen(false);
                }}
              >
                <GraduationCap size={16} color="var(--primary, #6366f1)" />
                {t('nav.student_space')}
              </button>
              <Link
                to="/consultations"
                className="btn btn-primary btn-sm header-reserve-btn"
                onClick={() => setMobileOpen(false)}
              >
                <Calendar size={16} />
                {t('nav.reserve')}
              </Link>
            </div>
          </nav>

          <div className="header-actions">
            {/* Theme Toggle */}
            <button 
              className="theme-toggle" 
              onClick={toggleTheme} 
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Custom Web Language Dropdown */}
            <WebLanguageDropdown lang={lang} setLang={setLang} />

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div 
          className="mobile-nav-backdrop" 
          onClick={() => setMobileOpen(false)} 
          aria-hidden="true"
        />
      )}

      <StudentSpaceModal isOpen={studentSpaceOpen} onClose={() => setStudentSpaceOpen(false)} />
    </>
  );
}
