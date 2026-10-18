import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Loader2, GraduationCap } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useToast } from '../lib/ToastContext';
import { submitInscription, getCategoryLabel, type Formation } from '../lib/firebase';

interface InscriptionModalProps {
  formation: Formation | null;
  onClose: () => void;
}

export default function InscriptionModal({ formation, onClose }: InscriptionModalProps) {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ trackingNumber: string; accessPassword: string } | null>(null);

  if (!formation) return null;

  const formationTitle = formation.name[lang as 'fr' | 'ar' | 'en'] || formation.name.fr || formation.name.ar || (formation.name as any)?.en || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast(t('form.error.required'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitInscription({
        formationId: formation.id,
        formationName: formationTitle,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setResult(res);
      showToast(t('success.inscription'), 'success');
    } catch (err) {
      console.error(err);
      showToast(t('form.error.submit'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setResult(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleResetAndClose}>
      <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleResetAndClose}>
          <X size={20} />
        </button>

        {result ? (
          /* SUCCESS CONFIRMATION STATE */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--vert)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              {t('inscription.success_title')}
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
              {t('inscription.success_desc')}
            </p>

            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px dashed var(--bleu-ciel)', 
              borderRadius: '16px', 
              padding: '20px', 
              marginBottom: '24px',
              textAlign: lang === 'ar' ? 'right' : 'left'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                  {t('inscription.tracking_label')}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--bleu)', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {result.trackingNumber}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                  {t('inscription.password_label')}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--rose)', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {result.accessPassword}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', textAlign: 'start' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                ⚠️ {t('inscription.notice_save_codes')}
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleResetAndClose}>
              {t('inscription.done_btn')}
            </button>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(79, 110, 246, 0.1)', 
                color: 'var(--bleu)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--bleu)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {getCategoryLabel(formation.category, lang)}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {formationTitle}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">{t('inscription.name_label')} *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={t('inscription.name_placeholder')}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">{t('inscription.phone_label')} *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder={t('inscription.phone_placeholder')}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  dir="ltr"
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">{t('inscription.email_label')}</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder={t('inscription.email_placeholder')}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  dir="ltr"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">{t('inscription.notes_label')}</label>
                <textarea 
                  className="form-textarea" 
                  placeholder={t('inscription.notes_placeholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ minHeight: '90px' }}
                />
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('inscription.fee_label')}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bleu-royal)' }}>
                  {typeof formation.price === 'number' ? `${formation.price.toLocaleString()} ${t('currency')}` : formation.price}
                </span>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn btn-secondary" onClick={handleResetAndClose}>
                  {t('expert_modal.close')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={18} /> : t('detail.enroll_now')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
