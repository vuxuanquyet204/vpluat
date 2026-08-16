'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      // BE endpoint is /api/crm/newsletter/subscribe (permitAll).
      // We pass `source` so the BE can attribute signups to the footer
      // widget when reviewing the newsletter analytics later.
      await apiClient.post<ApiResponse<unknown>>('/crm/newsletter/subscribe', {
        email: trimmed,
        source: 'footer-widget',
      });
      setSubmitted(true);
      setEmail('');
      toast.success('Đăng ký nhận bản tin thành công!');
      window.setTimeout(() => setSubmitted(false), 3000);
    } catch {
      toast.error('Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="footer-newsletter" className="newsletter-form__label">
        Đăng ký nhận bản tin
      </label>
      <div className="newsletter-form__row">
        <input
          id="footer-newsletter"
          type="email"
          placeholder="Email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="newsletter-form__input"
          disabled={submitting}
          required
        />
        <button
          type="submit"
          className="newsletter-form__btn"
          aria-label="Đăng ký"
          disabled={submitting}
        >
          {submitting ? <Check size={16} /> : submitted ? <Check size={16} /> : <Send size={16} />}
        </button>
      </div>
      {submitted && <p className="newsletter-form__success">Cảm ơn bạn đã đăng ký!</p>}
    </form>
  );
}
