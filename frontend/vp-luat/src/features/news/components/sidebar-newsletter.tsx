'use client';

import { useState, FormEvent } from 'react';
import { Send, Mail } from 'lucide-react';
import { newsletterApi } from '@/lib/api/admin-crm';
import { useTranslations } from 'next-intl';

export function SidebarNewsletter() {
  const t = useTranslations('public.news');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }

    setSubmitting(true);
    try {
      await newsletterApi.subscribe({ email: email.trim() });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="newsletter-box">
      <div className="newsletter-box__icon">
        <Mail size={20} />
      </div>
      <h3 className="newsletter-box__title">{t('newsletterTitle')}</h3>
      <p className="newsletter-box__sub">{t('newsletterSubtitle')}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="newsletter-box__input"
          placeholder={t('newsletterPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label={t('newsletterEmailLabel')}
        />
        <button type="submit" className="newsletter-box__btn" disabled={submitting}>
          <Send size={14} />
          {submitting ? t('newsletterSubmitting') : status === 'success' ? t('newsletterSuccess') : status === 'error' ? t('newsletterError') : t('newsletterSubmit')}
        </button>
      </form>
    </div>
  );
}
