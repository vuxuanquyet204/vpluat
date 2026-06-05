'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    text: 'Tôi rất hài lòng với dịch vụ tư vấn luật của VP Luật. Đội ngũ luật sư chuyên nghiệp, tận tâm và giải quyết vụ việc của tôi nhanh chóng. Đặc biệt, họ luôn cập nhật tiến độ và giải đáp mọi thắc mắc của tôi một cách nhiệt tình.',
    name: 'Nguyễn Thị Lan',
    role: 'Giám đốc, Công ty TNHH ABC',
    initials: 'NL',
  },
  {
    text: 'VP Luật đã hỗ trợ chúng tôi trong vụ tranh chấp đất đai kéo dài nhiều năm. Nhờ sự tận tâm của đội ngũ luật sư, chúng tôi đã giành chiến thắng và bảo vệ được quyền lợi hợp pháp. Chi phí hợp lý, quy trình minh bạch.',
    name: 'Trần Văn Minh',
    role: 'Chủ tịch HĐQT, Tập đoàn XYZ',
    initials: 'TM',
  },
  {
    text: 'Dịch vụ tư vấn M&A của VP Luật giúp chúng tôi hoàn tất thương vụ mua lại một cách suôn sẻ. Đội ngũ am hiểu sâu về luật doanh nghiệp, phản hồi nhanh chóng và đưa ra các giải pháp sáng tạo cho các vấn đề phức tạp.',
    name: 'Lê Hoàng Nam',
    role: 'CFO, Tập đoàn DEF',
    initials: 'HN',
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrent((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Đánh giá</span>
          <h2 className="section__title">Khách Hàng Nói Gì Về Chúng Tôi</h2>
          <p className="section__subtitle">
            Những đánh giá chân thực từ khách hàng đã sử dụng dịch vụ
          </p>
        </div>

        <div className="testimonials__slider">
          <div
            className="testimonials__track"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-card__inner">
                  <span className="testimonial-card__quote-icon">"</span>
                  <div className="testimonial-card__stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="testimonial-card__star"
                        size={16}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <p className="testimonial-card__text">{testimonial.text}</p>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">{testimonial.initials}</div>
                    <div>
                      <div className="testimonial-card__name">{testimonial.name}</div>
                      <div className="testimonial-card__role">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonials__controls">
          <button
            className="testimonials__arrow"
            onClick={prev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="testimonials__dots">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                className={`testimonials__dot ${index === current ? 'active' : ''}`}
                onClick={() => setCurrent(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          <button
            className="testimonials__arrow"
            onClick={next}
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
