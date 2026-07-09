'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecentReviews } from '@/features/home/hooks/use-reviews';

// Fallback testimonials when API fails
const FALLBACK_TESTIMONIALS = [
  {
    text: 'Tôi rất hài lòng với dịch vụ tư vấn luật của VP Luật. Đội ngũ luật sư chuyên nghiệp, tận tâm và giải quyết vụ việc của tôi nhanh chóng.',
    name: 'Nguyễn Thị Lan',
    role: 'Giám đốc, Công ty TNHH ABC',
    initials: 'NL',
  },
  {
    text: 'VP Luật đã hỗ trợ chúng tôi trong vụ tranh chấp đất đai kéo dài nhiều năm. Nhờ sự tận tâm của đội ngũ luật sư, chúng tôi đã giành chiến thắng.',
    name: 'Trần Văn Minh',
    role: 'Chủ tịch HĐQT, Tập đoàn XYZ',
    initials: 'TM',
  },
  {
    text: 'Dịch vụ tư vấn M&A của VP Luật giúp chúng tôi hoàn tất thương vụ mua lại một cách suôn sẻ. Đội ngũ am hiểu sâu về luật doanh nghiệp.',
    name: 'Lê Hoàng Nam',
    role: 'CFO, Tập đoàn DEF',
    initials: 'HN',
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const { data: reviews = [], isLoading } = useRecentReviews(10);

  // Use API data if available, otherwise fallback
  const testimonials = reviews.length > 0
    ? reviews.slice(0, 5).map((review) => ({
        text: review.content,
        name: review.clientName,
        role: review.clientRole || `${review.serviceName ? 'Khách hàng ' + review.serviceName : 'Khách hàng'}`,
        initials: review.initials || review.clientName?.slice(0, 2).toUpperCase() || 'CL',
      }))
    : FALLBACK_TESTIMONIALS;

  const total = testimonials.length;

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const next = () => {
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Đang tải đánh giá...</p>
          </div>
        </div>
      </section>
    );
  }

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
            {testimonials.map((testimonial, index) => (
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
            {testimonials.map((_, index) => (
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
