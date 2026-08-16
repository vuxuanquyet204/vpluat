'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useRecentReviews } from '@/features/home/hooks/use-reviews';

// Empty-state copy when the backend has no reviews yet (or the call failed).
// We intentionally do NOT ship hard-coded Vietnamese names / companies as
// fallback data — that would put fake testimonials in front of users.
const EMPTY_MESSAGE = 'Chưa có đánh giá nào từ khách hàng. Hãy là người đầu tiên chia sẻ trải nghiệm của bạn.';

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const { data: reviews = [], isLoading, isError } = useRecentReviews(10);

  // Only use real reviews from the API — never fall back to hard-coded names.
  const testimonials = reviews.slice(0, 5).map((review) => ({
    text: review.content,
    name: review.clientName,
    role:
      review.clientRole ||
      (review.serviceName ? `Khách hàng ${review.serviceName}` : 'Khách hàng'),
    initials: review.initials || review.clientName?.slice(0, 2).toUpperCase() || 'CL',
  }));

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
            <p>�ang tải đánh giá...</p>
          </div>
        </div>
      </section>
    );
  }

  if (total === 0) {
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
          <div className="testimonial-card testimonial-card--empty" role="status">
            <Quote className="testimonial-card__quote-icon" aria-hidden="true" />
            <p className="testimonial-card__text">
              {isError ? 'Không thể tải đánh giá. Vui lòng thử lại sau.' : EMPTY_MESSAGE}
            </p>
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
            disabled={total <= 1}
            aria-label="Đánh giá trước"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="testimonials__dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`testimonials__dot ${index === current ? 'active' : ''}`}
                onClick={() => setCurrent(index)}
                aria-label={`Đánh giá ${index + 1}`}
                aria-current={index === current ? 'true' : undefined}
              />
            ))}
          </div>
          <button
            className="testimonials__arrow"
            onClick={next}
            disabled={total <= 1}
            aria-label="Đánh giá tiếp theo"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
