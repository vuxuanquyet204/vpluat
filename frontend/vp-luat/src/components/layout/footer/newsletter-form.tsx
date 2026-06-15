'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    // TODO: connect to API
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
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
          required
        />
        <button type="submit" className="newsletter-form__btn" aria-label="Đăng ký">
          {submitted ? <Check size={16} /> : <Send size={16} />}
        </button>
      </div>
      {submitted && <p className="newsletter-form__success">Cảm ơn bạn đã đăng ký!</p>}
    </form>
  );
}
