'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import type { ContactFormValues } from '../types';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface ContactFormProps {
  onSubmit?: (values: ContactFormValues) => Promise<void>;
}

const PHONE_RE = /^(0|\+84)[0-9]{9,10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ onSubmit }: ContactFormProps) {
  const t = useTranslations('contact');
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  const set = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof ContactFormValues, string>> = {};
    if (values.name.trim().length < 2) next.name = t('nameError');
    if (!EMAIL_RE.test(values.email ?? '')) next.email = t('emailError');
    if (!PHONE_RE.test(values.phone.replace(/\s/g, ''))) next.phone = t('phoneError');
    if (values.subject.trim().length < 5) next.subject = t('subjectError');
    if (values.message.trim().length < 20) next.message = t('messageError');
    if (!values.agreeTerms) next.agreeTerms = t('termsError');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setStatus('success');
      setValues({ name: '', email: '', phone: '', subject: '', message: '', agreeTerms: false });
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <Field
          id="name"
          label={`${t('name')} *`}
          value={values.name}
          onChange={(v) => set('name', v)}
          error={errors.name}
          placeholder={t('namePlaceholder')}
        />
        <Field
          id="email"
          label={`${t('email')} *`}
          type="email"
          value={values.email ?? ''}
          onChange={(v) => set('email', v)}
          error={errors.email}
          placeholder={t('emailPlaceholder')}
        />
      </div>

      <div className="contact-form__row">
        <Field
          id="phone"
          label={`${t('phone')} *`}
          type="tel"
          value={values.phone}
          onChange={(v) => set('phone', v)}
          error={errors.phone}
          placeholder={t('phonePlaceholder')}
        />
        <Field
          id="subject"
          label={`${t('subject')} *`}
          value={values.subject}
          onChange={(v) => set('subject', v)}
          error={errors.subject}
          placeholder={t('subjectPlaceholder')}
        />
      </div>

      <div className="contact-form__field">
        <label htmlFor="message" className="contact-form__label">{t('message')} *</label>
        <textarea
          id="message"
          className={`contact-form__textarea ${errors.message ? 'has-error' : ''}`}
          rows={5}
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder={t('messagePlaceholder')}
        />
        {errors.message && <div className="contact-form__error">{errors.message}</div>}
      </div>

      <label className="contact-form__checkbox">
        <input
          type="checkbox"
          checked={values.agreeTerms}
          onChange={(e) => set('agreeTerms', e.target.checked)}
        />
        <span>{t('termsAgreement')}</span>
      </label>
      {errors.agreeTerms && <div className="contact-form__error">{errors.agreeTerms}</div>}

      {status === 'success' && (
        <div className="contact-form__alert contact-form__alert--success">
          <CheckCircle size={18} />
          <span>{t('successMessage')}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="contact-form__alert contact-form__alert--error">
          <AlertCircle size={18} />
          <span>{t('errorMessage')}</span>
        </div>
      )}

      <button
        type="submit"
        className="contact-form__submit"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? (
          <>{t('submitting')}</>
        ) : (
          <>
            <Send size={16} />
            {t('submit')}
          </>
        )}
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}

function Field({ id, label, value, onChange, error, type = 'text', placeholder }: FieldProps) {
  return (
    <div className="contact-form__field">
      <label htmlFor={id} className="contact-form__label">{label}</label>
      <input
        id={id}
        type={type}
        className={`contact-form__input ${error ? 'has-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <div className="contact-form__error">{error}</div>}
    </div>
  );
}
