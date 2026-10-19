import { useState } from 'react';
import { useLanguage } from '../lib/i18n';
import { useToast } from '../lib/ToastContext';
import { MapPin, Phone, Mail, Clock, ArrowRight, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { submitContactMessage } from '../lib/firebase';

export default function ContactPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedForm, setSubmittedForm] = useState<{ name: string; email: string; phone: string; message: string } | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactMessage({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        message: form.message,
      });
      setSubmittedForm({ ...form });
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      showToast(t('contact.success'), 'success');
    } catch (err) {
      console.warn('Contact message submission error:', err);
      setSubmittedForm({ ...form });
      setSuccess(true);
      showToast(t('contact.success'), 'success');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    { 
      icon: MapPin, 
      label: t('contact.address'), 
      value: t('contact.address.value'), 
      link: 'https://maps.app.goo.gl/x7WfmaLJfHs4Jb3s9',
      actionText: t('contact.maps_btn'),
      external: true 
    },
    { 
      icon: Phone, 
      label: t('contact.phone_consultations_title'), 
      value: '0558 02 46 10', 
      link: 'tel:0558024610',
      whatsapp: 'https://wa.me/213558024610'
    },
    { 
      icon: Phone, 
      label: t('contact.phone_formations_title'), 
      value: '0698 74 64 28', 
      link: 'tel:0698746428',
      whatsapp: 'https://wa.me/213698746428'
    },
    { 
      icon: Phone, 
      label: t('contact.phone_fixe_title'), 
      value: '028 90 81 39', 
      link: 'tel:028908139' 
    },
    { 
      icon: Mail, 
      label: t('contact.email'), 
      value: 'qalbiitam@gmail.com', 
      link: 'mailto:qalbiitam@gmail.com' 
    },
    { 
      icon: Clock, 
      label: t('contact.hours'), 
      value: t('contact.hours.value'), 
      link: undefined 
    },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="container">
          <h1><span className="gradient-text">{t('contact.title')}</span></h1>
          <p>{t('contact.subtitle')}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Left - Contact Info */}
            <div>
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                return (
                  <div className="contact-info-card" key={i} style={{ marginBottom: '14px' }}>
                    <div className="contact-info-icon">
                      <Icon size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.95rem' }}>{info.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {info.link ? (
                          <a 
                            href={info.link} 
                            target={info.external ? '_blank' : undefined}
                            rel={info.external ? 'noopener noreferrer' : undefined}
                            dir="ltr"
                            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}
                          >
                            {info.value}
                          </a>
                        ) : (
                          <div style={{ color: 'var(--text-secondary)' }}>{info.value}</div>
                        )}

                        {info.actionText && (
                          <a
                            href={info.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: 'var(--bleu)',
                              textDecoration: 'none',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'var(--bleu-clair)'
                            }}
                          >
                            {info.actionText}
                          </a>
                        )}

                        {info.whatsapp && (
                          <a
                            href={info.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: '#128C7E',
                              textDecoration: 'none',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(37, 211, 102, 0.15)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MessageSquare size={12} /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* WhatsApp Fast Contact Card with dual choice */}
              <div 
                className="card" 
                style={{ 
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', 
                  color: 'white', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  marginTop: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '1.05rem', margin: '0 0 2px 0' }}>{t('contact.whatsapp.title')}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem', margin: 0 }}>{t('contact.whatsapp.desc')}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <a 
                    href="https://wa.me/213558024610" 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn" 
                    style={{ background: 'white', color: '#128C7E', fontWeight: 800, padding: '10px 14px', fontSize: '0.85rem', justifyContent: 'center' }}
                  >
                    🌿 {t('contact.whatsapp.consultations')}
                  </a>
                  <a 
                    href="https://wa.me/213698746428" 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn" 
                    style={{ background: 'white', color: '#128C7E', fontWeight: 800, padding: '10px 14px', fontSize: '0.85rem', justifyContent: 'center' }}
                  >
                    📚 {t('contact.whatsapp.formations')}
                  </a>
                </div>
              </div>

              {/* Social Media Card */}
              <div 
                className="card" 
                style={{ 
                  marginTop: '16px', 
                  padding: '20px 24px', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t('contact.social_title')}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a 
                    href="https://www.facebook.com/profile.php/?id=100064151347005" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px', color: '#1877F2', borderColor: 'rgba(24, 119, 242, 0.3)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    Facebook
                  </a>
                  <a 
                    href="https://www.instagram.com/qalbi_itmaan20/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px', color: '#E1306C', borderColor: 'rgba(225, 48, 108, 0.3)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div>
              <div className="card" style={{ padding: 'var(--space-xl)' }}>
                {success ? (
                  <div className="success-message" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div className="stat-icon-wrapper stat-icon-green" style={{ width: '70px', height: '70px', margin: '0 auto 16px auto' }}>
                      <CheckCircle size={40} />
                    </div>
                    <h3 style={{ marginBottom: '8px' }}>{t('contact.success')}</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                      {t('success.reservation.desc')}
                    </p>

                    {submittedForm && (
                      <div style={{ margin: '20px 0', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'inline-block' }}>
                        <a
                          href={`https://wa.me/213558024610?text=${encodeURIComponent(
                            `السلام عليكم، أنا ${submittedForm.name}.\nلقد أرسلت رسالة عبر الموقع:\n"${submittedForm.message}"\nرقم الهاتف: ${submittedForm.phone || 'غير محدد'}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn"
                          style={{
                            background: '#25D366',
                            color: 'white',
                            fontWeight: 700,
                            padding: '12px 20px',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
                          }}
                        >
                          <MessageSquare size={18} />
                          {t('contact.whatsapp.btn')}
                        </a>
                      </div>
                    )}

                    <div>
                      <button 
                        onClick={() => { setSuccess(false); setSubmittedForm(null); }} 
                        className="btn btn-secondary" 
                        style={{ marginTop: '12px' }}
                      >
                        {t('contact.send_another')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 style={{ marginBottom: 'var(--space-xl)' }}>
                      <span className="gradient-text">{t('contact.message')}</span>
                    </h2>
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label className="form-label">{t('form.name')} *</label>
                        <input
                          className="form-input"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">{t('form.email')}</label>
                          <input
                            className="form-input"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">{t('form.phone')}</label>
                          <input
                            className="form-input"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('form.notes')} *</label>
                        <textarea
                          className="form-textarea"
                          required
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          style={{ minHeight: '150px' }}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                        {submitting ? (
                          <><Loader2 size={20} /> {t('form.submitting')}</>
                        ) : (
                          <>{t('contact.send')} <ArrowRight size={20} /></>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
