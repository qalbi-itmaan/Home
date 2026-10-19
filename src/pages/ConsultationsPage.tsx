import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import { useToast } from '../lib/ToastContext';
import { submitReservation } from '../lib/firebase';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function ConsultationsPage() {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  
  // State matching admin form fields exactly
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [consultationMode, setConsultationMode] = useState<'presentiel' | 'en_ligne'>('presentiel');
  const [contactPreference, setContactPreference] = useState<'telegram' | 'whatsapp' | 'viber'>('whatsapp');
  const [duration, setDuration] = useState<number>(60); // 30, 45, or 60 min
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>('09:00');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Duration cards mapping matching the admin app exactly
  const durationOptions = [
    { duration: 30, labelKey: 'form.duration_30', price: 2000, priceFormatted: `2,000 ${t('currency')}` },
    { duration: 45, labelKey: 'form.duration_45', price: 3000, priceFormatted: `3,000 ${t('currency')}` },
    { duration: 60, labelKey: 'form.duration_60', price: 4000, priceFormatted: `4,000 ${t('currency')}` },
  ];

  const selectedDurationObj = durationOptions.find(d => d.duration === duration) || durationOptions[2];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!patientName.trim() || !patientPhone.trim()) {
      showToast(t('form.error.required'), 'error');
      return;
    }

    if (consultationMode === 'presentiel' && !address.trim()) {
      showToast(t('form.error.required'), 'error');
      return;
    }

    if (date < todayStr) {
      showToast(lang === 'ar' ? 'يرجى اختيار تاريخ اليوم أو موعد لاحق' : 'Veuillez choisir une date valide (aujourd’hui ou ultérieure)', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const resId = await submitReservation({
        type: 'consultation',
        consultationType: consultationMode === 'presentiel' 
          ? (lang === 'ar' ? 'استشارة حضورية' : lang === 'en' ? 'In-Person Consultation' : 'Consultation Présentielle')
          : (lang === 'ar' ? 'استشارة عن بعد' : lang === 'en' ? 'Online Consultation' : 'Consultation En ligne'),
        customerName: patientName,
        customerPhone: patientPhone,
        customerEmail: patientEmail || undefined,
        address: address,
        consultationMode: consultationMode,
        contactPreference: consultationMode === 'en_ligne' ? contactPreference : undefined,
        duration: duration,
        amount: selectedDurationObj.price,
        date: date,
        time: time,
        notes: notes || undefined,
      });

      setSuccessId(resId);
      showToast(t('success.reservation'), 'success');
    } catch (err) {
      console.error(err);
      showToast(t('form.error.submit'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>
            <span className="gradient-text">{t('consultations.title')}</span>
          </h1>
          <p>{t('consultations.subtitle')}</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '980px' }}>
          {successId ? (
            /* SUCCESS CONFIRMATION CARD */
            <div className="card consultation-success-card">
              <div className="stat-icon-wrapper stat-icon-green" style={{ width: '80px', height: '80px', margin: '0 auto 24px auto' }}>
                <CheckCircle size={48} />
              </div>

              <h2 style={{ marginBottom: '12px' }}>{t('success.reservation')}</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '24px', color: 'var(--text-secondary)' }}>
                {t('success.reservation.desc')}
              </p>

              <div style={{ background: 'var(--bleu-clair)', padding: '18px 28px', borderRadius: '20px', display: 'inline-block', fontWeight: 700, color: 'var(--bleu-royal)', marginBottom: '32px', fontSize: '1.1rem' }}>
                {t('reservation.code')} : {successId}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary btn-lg" 
                  onClick={() => {
                    setSuccessId(null);
                    setPatientName('');
                    setPatientPhone('');
                    setAddress('');
                    setPatientEmail('');
                    setNotes('');
                  }}
                >
                  {t('form.another_reservation')}
                </button>
                <Link to="/" className="btn btn-primary btn-lg">
                  {t('success.back')}
                </Link>
              </div>
            </div>
          ) : (
            /* CONSULTATION FORM MATCHING ADMIN FORM EXACTLY */
            <div className="card" style={{ borderRadius: '32px', boxShadow: 'var(--shadow-xl)', border: '1.5px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
                  {t('consultation.new_title')}
                </h2>
                <span className="lang-toggle" style={{ background: 'var(--bleu-clair)', color: 'var(--bleu-royal)', fontWeight: 700 }}>
                  Qalbi Itmaan
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Row 1: Patient Name & Phone */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('form.patient_name')} <span style={{ color: 'var(--erreur)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('form.patient_phone')} <span style={{ color: 'var(--erreur)' }}>*</span></label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      required 
                      placeholder="05..."
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 2: Address & Optional Email */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {t('form.address')}{' '}
                      {consultationMode === 'en_ligne' ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                          ({t('form.address_optional_online')})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--erreur)' }}>*</span>
                      )}
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required={consultationMode === 'presentiel'}
                      placeholder={consultationMode === 'en_ligne' ? t('consultation.address_placeholder_online') : ''}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('form.email_optional')}</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="nom@exemple.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 3: Consultation Mode Pills */}
                <div className="form-group">
                  <label className="form-label">{t('form.consultation_type_label')} <span style={{ color: 'var(--erreur)' }}>*</span></label>
                  <div className="consultation-mode-row">
                    <button 
                      type="button" 
                      onClick={() => setConsultationMode('presentiel')}
                      className={`consultation-mode-pill ${consultationMode === 'presentiel' ? 'active' : ''}`}
                    >
                      {t('form.mode.presentielle_btn')}
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setConsultationMode('en_ligne')}
                      className={`consultation-mode-pill ${consultationMode === 'en_ligne' ? 'active' : ''}`}
                    >
                      {t('form.mode.online_btn')}
                    </button>
                  </div>
                </div>

                {/* Row 3.5: Contact Preference (WHEN Online / En Ligne is selected) */}
                {consultationMode === 'en_ligne' && (
                  <div className="form-group">
                    <label className="form-label">{t('form.contact_pref')} <span style={{ color: 'var(--erreur)' }}>*</span></label>
                    <div className="consultation-contact-row">
                      {(['telegram', 'whatsapp', 'viber'] as const).map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setContactPreference(app)}
                          className={`consultation-contact-pill ${contactPreference === app ? 'active' : ''}`}
                        >
                          {app.charAt(0).toUpperCase() + app.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row 4: Session Duration & Price Cards (3 Cards) */}
                <div className="form-group">
                  <label className="form-label">{t('form.session_duration_label')}</label>
                  <div className="consultation-duration-grid">
                    {durationOptions.map((opt) => (
                      <div 
                        key={opt.duration}
                        onClick={() => setDuration(opt.duration)}
                        style={{
                          background: duration === opt.duration ? 'var(--vert-clair)' : 'var(--bg-secondary)',
                          border: duration === opt.duration ? '2px solid var(--succes)' : '1.5px solid var(--border-input)',
                          borderRadius: '18px',
                          padding: '18px 14px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {t(opt.labelKey)}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--succes)' }}>
                          {opt.priceFormatted}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 5: Date & Time Picker */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('form.date')} *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      required 
                      min={todayStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('form.time')} *</label>
                    <select 
                      className="form-select" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    >
                      {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 6: Optional Notes */}
                <div className="form-group">
                  <label className="form-label">{t('form.notes_optional')}</label>
                  <textarea 
                    className="form-textarea" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ minHeight: '100px' }}
                  />
                </div>

                {/* Submit Action Buttons */}
                <div className="form-submit-row">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg consultation-submit-btn" 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={20} className="spin" /> : t('form.save_reservation')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
