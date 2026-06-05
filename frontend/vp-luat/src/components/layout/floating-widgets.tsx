'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Phone, ArrowUp } from 'lucide-react';

export function FloatingWidgets() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <>
      <div className="floating-widget">
        <button
          onClick={toggleChat}
          className="floating-widget__item floating-widget__item--chatbot"
          aria-label="Mở chatbot"
        >
          <MessageSquare size={24} />
          <span className="floating-widget__tooltip">Chatbot</span>
        </button>
        <a
          href="tel:19001234"
          className="floating-widget__item"
          style={{ background: 'var(--primary)', color: 'var(--white)' }}
          aria-label="Call us"
        >
          <Phone size={22} />
          <span className="floating-widget__tooltip">Gọi ngay</span>
        </a>
      </div>

      {chatOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-modal__header">
            <div className="chatbot-modal__avatar">
              <MessageSquare size={20} />
            </div>
            <div className="chatbot-modal__info">
              <span className="chatbot-modal__name">Trợ lý ảo VP Luật</span>
              <span className="chatbot-modal__status">
                <span className="chatbot-modal__status-dot" />
                Đang trực tuyến
              </span>
            </div>
            <button
              className="chatbot-modal__close"
              onClick={toggleChat}
              aria-label="Đóng chatbot"
            >
              ×
            </button>
          </div>
          <div className="chatbot-modal__body">
            <div className="chatbot-modal__welcome">
              <p>Xin chào! Tôi là trợ lý ảo của VP Luật Hùng & Cộng sự.</p>
              <p>Tôi có thể giúp bạn về:</p>
              <ul>
                <li>Tư vấn pháp lý miễn phí</li>
                <li>Đặt lịch hẹn luật sư</li>
                <li>Hỏi về dịch vụ pháp lý</li>
                <li>Các thủ tục pháp lý thông thường</li>
              </ul>
              <p className="chatbot-modal__hint">
                💡 Bạn có thể nhắn tin hoặc gọi hotline <strong>1900 1234</strong> để được hỗ trợ trực tiếp.
              </p>
            </div>
          </div>
          <div className="chatbot-modal__footer">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="chatbot-modal__input"
              disabled
            />
            <button className="chatbot-modal__send" disabled>
              Gửi
            </button>
          </div>
        </div>
      )}

      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </>
  );
}
