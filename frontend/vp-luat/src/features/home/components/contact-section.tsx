'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { submitContactMessage } from '@/features/contact/api/contact-api';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';

const SERVICE_OPTIONS = [
  { value: 'doanh-nghiep', key: 'business' },
  { value: 'dat-dai', key: 'land' },
  { value: 'dan-su', key: 'civil' },
  { value: 'hinh-su', key: 'criminal' },
  { value: 'lao-dong', key: 'labor' },
  { value: 'dau-tu', key: 'investment' },
  { value: 'shtt', key: 'ip' },
  { value: 'hon-nhan', key: 'family' },
  { value: 'khac', key: 'other' },
] as const;

function PaperPlaneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

const PHONE_RE = /^(0|\+84)[0-9]{9,10}$/;

export function ContactSection() {
  const t = useTranslations('homeSections.contact');
  const contact = useTranslations('contact');
  const { data: siteContent } = usePublicSiteContent();
  const siteContact = siteContent?.contact;
  const [formData, setFormData] = useState({ name: '', phone: '', service: '' });
  const [errors, setErrors] = useState<{ name?: string; phone?: string; service?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (formData.name.trim().length < 2) next.name = t('nameError');
    if (!PHONE_RE.test(formData.phone.replace(/\s+/g, ''))) next.phone = t('phoneError');
    if (!formData.service) next.service = t('serviceError');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const selectedService = SERVICE_OPTIONS.find((option) => option.value === formData.service);
      const serviceLabel = selectedService ? contact(`serviceOptions.${selectedService.key}`) : formData.service;
      await submitContactMessage(
        {
          name: formData.name.trim(),
          phone: formData.phone.replace(/\s+/g, ''),
          subject: contact('requestSubject', { service: serviceLabel }),
          message: contact('requestMessage', { service: serviceLabel }),
          agreeTerms: true,
        },
        'home-contact-section',
      );
      setSubmitted(true);
      setFormData({ name: '', phone: '', service: '' });
      toast.success(t('successToast'));
    } catch {
      toast.error(t('errorToast'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section section--gray" id="contact">
      <div className="container">
        <div className="section__header">
          <span className="section__label">{t('label')}</span><h2 className="section__title">{t('title')}</h2>
          <p className="section__subtitle">{t('subtitle')}</p>
        </div>
        <div className="contact__grid">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <h3 className="contact-form__title">{t('requestTitle')}</h3><p className="contact-form__subtitle">{t('requestSubtitle')}</p>
            {submitted && <div className="contact-form__alert contact-form__alert--success"><span>{t('success')}</span></div>}
            <div className="form-group"><label htmlFor="contact-home-name">{contact('name')} *</label><input type="text" id="contact-home-name" name="name" value={formData.name} onChange={handleChange} placeholder={t('namePlaceholder')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'contact-home-name-error' : undefined} required />{errors.name && <div id="contact-home-name-error" className="contact-form__error">{errors.name}</div>}</div>
            <div className="form-group"><label htmlFor="contact-home-phone">{contact('phone')} *</label><input type="tel" id="contact-home-phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="0xxx xxx xxx" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'contact-home-phone-error' : undefined} required />{errors.phone && <div id="contact-home-phone-error" className="contact-form__error">{errors.phone}</div>}</div>
            <div className="form-group"><label htmlFor="contact-home-service">{t('serviceLabel')} *</label><select id="contact-home-service" name="service" value={formData.service} onChange={handleChange} aria-invalid={!!errors.service} aria-describedby={errors.service ? 'contact-home-service-error' : undefined} required><option value="">{t('servicePlaceholder')}</option>{SERVICE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{contact(`serviceOptions.${opt.key}`)}</option>)}</select>{errors.service && <div id="contact-home-service-error" className="contact-form__error">{errors.service}</div>}</div>
            <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={submitting}>{submitting ? t('submitting') : <><PaperPlaneIcon size={18} />{t('submit')}</>}</button>
          </form>
          <div className="contact-info">
            <h3 className="contact-info__title">{t('officeTitle')}</h3>
            <div className="contact-info__items">
              <div className="contact-info__item"><div className="contact-info__icon"><MapPin size={20} /></div><div><div className="contact-info__label">{t('address')}</div><div className="contact-info__value">{siteContact?.address ?? ''}</div></div></div>
              <div className="contact-info__item"><div className="contact-info__icon"><Clock size={20} /></div><div><div className="contact-info__label">{t('hours')}</div><div className="contact-info__value">{(siteContact?.workingHours ?? '').split('\n').map((line) => <span key={line}>{line}<br /></span>)}</div></div></div>
              <div className="contact-info__item"><div className="contact-info__icon"><Phone size={20} /></div><div><div className="contact-info__label">{t('hotline')}</div><div className="contact-info__value">{siteContact?.hotline ?? ''}</div></div></div>
              <div className="contact-info__item"><div className="contact-info__icon"><Mail size={20} /></div><div><div className="contact-info__label">{t('email')}</div><div className="contact-info__value">{siteContact?.email ?? ''}</div></div></div>
            </div>
            <div className="contact-info__cta"><a href={siteContact?.zaloUrl || undefined} target="_blank" rel="noopener noreferrer" className="contact-info__cta-btn contact-info__cta-btn--zalo">{t('zalo')}</a><a href={siteContact?.hotline ? `tel:${siteContact.hotline.replace(/\s/g, '')}` : undefined} className="contact-info__cta-btn contact-info__cta-btn--phone"><Phone size={18} />{t('call')}</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}
