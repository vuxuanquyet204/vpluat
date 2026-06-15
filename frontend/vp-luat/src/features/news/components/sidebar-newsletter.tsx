'use client';

import { useState, FormEvent } from 'react';
import { Send, Mail } from 'lucide-react';

export function SidebarNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="newsletter-box">
      <div className="newsletter-box__icon">
        <Mail size={20} />
      </div>
      <h3 className="newsletter-box__title">Nhận tin pháp luật mới</h3>
      <p className="newsletter-box__sub">
        Đăng ký nhận bản tin hàng tuần về cập nhật pháp luật và blog chuyên môn.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="newsletter-box__input"
          placeholder="Nhập email của bạn..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email đăng ký nhận tin"
        />
        <button type="submit" className="newsletter-box__btn">
          <Send size={14} />
          {status === 'success' ? 'Đã đăng ký!' : status === 'error' ? 'Email không hợp lệ' : 'Đăng ký ngay'}
        </button>
      </form>
    </div>
  );
}
