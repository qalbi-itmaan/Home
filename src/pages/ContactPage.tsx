import { useState } from 'react';
import { useLanguage } from '../lib/i18n';
import { useToast } from '../lib/ToastContext';
import { MapPin, Phone, Mail, Clock, ArrowRight, Loader2, CheckCircle, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSuccess(true);
    setSubmitting(false);
    showToast(t('contact.success'), 'success');
  };

  const contactInfo = [
    { icon: MapPin, label: t('contact.address'), value: t('contact.address.value'), link: undefined },
    { icon: Phone, label: t('contact.phone'), value: '0550 00 00 00', link: 'tel:0550000000' },
    { icon: Mail, label: t('contact.email'), value: 'contact@qalbi-itmaan.com', link: 'mailto:contact@qalbi-itmaan.com' },
    { icon: Clock, label: t('contact.hours'), value: t('contact.hours.value'), link: undefined },
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
                  <div className="contact-info-card" key={i}>
                    <div className="contact-info-icon">
                      <Icon size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{info.label}</div>
                      {info.link ? (
                        <a href={info.link} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                          {info.value}
                        </a>
                      ) : (
                        <div style={{ color: 'var(--text-secondary)' }}>{info.value}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* WhatsApp Fast Contact Card */}
              <div 
                className="card" 
                style={{ 
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', 
                  color: 'white', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={26} />
                </div>
                <div style={{ flexGrow: 1, minWidth: '160px' }}>
                  <h4 style={{ color: 'white', fontSize: '1.05rem', marginBottom: '2px' }}>{t('contact.whatsapp.title')}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', margin: 0 }}>{t('contact.whatsapp.desc')}</p>
                </div>
                <a 
                  href="https://wa.me/213550000000" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn" 
                  style={{ background: 'white', color: '#128C7E', fontWeight: 800, padding: '10px 18px', fontSize: '0.85rem', flexShrink: 0 }}
                >
                  {t('contact.whatsapp.btn')}
                </a>
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
                    <h3 style={{ marginBottom: '8px' }}>{t('success.reservation')}</h3>
                    <p>{t('success.reservation.desc')}</p>
                    <button 
                      onClick={() => setSuccess(false)} 
                      className="btn btn-secondary" 
                      style={{ marginTop: '24px' }}
                    >
                      {t('contact.send_another')}
                    </button>
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
