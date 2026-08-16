'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

const SERVICE_OPTIONS = [
  { value: 'doanh-nghiep', label: 'Luật Doanh nghiệp' },
  { value: 'dat-dai', label: 'Luật Đất đai' },
  { value: 'dan-su', label: 'Luật Dân sự' },
  { value: 'hinh-su', label: 'Luật Hình sự' },
  { value: 'lao-dong', label: 'Luật Lao động' },
  { value: 'dau-tu', label: 'Đầu tư nước ngoài (FDI)' },
  { value: 'shtt', label: 'Sở hữu trí tuệ' },
  { value: 'hon-nhan', label: 'Hôn nhân & Gia đình' },
  { value: 'khac', label: 'Khác' },
];

// Paper plane icon as inline SVG
function PaperPlaneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

const PHONE_RE = /^(0|\+84)[0-9]{9,10}$/;

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string; service?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (formData.name.trim().length < 2) next.name = 'Họ tên phải có ít nhất 2 ký tự';
    if (!PHONE_RE.test(formData.phone.replace(/\s+/g, ''))) {
      next.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.service) next.service = 'Vui lòng chọn lĩnh vực';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await apiClient.post<ApiResponse<unknown>>('/public/contact-messages', {
        name: formData.name.trim(),
        phone: formData.phone.replace(/\s+/g, ''),
        subject: `Yêu cầu tư vấn nhanh: ${formData.service}`,
        message: `Khách hàng quan tâm đến lĩnh vực ${formData.service}. Vui lòng liên hệ lại trong vòng 30 phút.`,
        source: 'home-contact-section',
      });
      setSubmitted(true);
      setFormData({ name: '', phone: '', service: '' });
      toast.success('Đã gửi yêu cầu! Chúng tôi sẽ liên hệ lại trong 30 phút.');
    } catch {
      toast.error('Không thể gửi yêu cầu. Vui lòng thử lại hoặc gọi hotline 1900 1234.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section section--gray" id="contact">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Liên hệ nhanh</span>
          <h2 className="section__title">Đặt Lịch Tư Vấn Ngay</h2>
          <p className="section__subtitle">
            Điền thông tin, chúng tôi sẽ liên hệ lại trong 30 phút
          </p>
        </div>

        <div className="contact__grid">
          {/* Form */}
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <h3 className="contact-form__title">Yêu cầu tư vấn</h3>
            <p className="contact-form__subtitle">
              Tư vấn miễn phí lần đầu · Phản hồi trong 30 phút
            </p>

            {submitted && (
              <div className="contact-form__alert contact-form__alert--success">
                <span>Yêu cầu của bạn đã được gửi. Chúng tôi sẽ liên hệ lại trong vòng 30 phút.</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="contact-home-name">Họ và tên *</label>
              <input
                type="text"
                id="contact-home-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên của bạn"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'contact-home-name-error' : undefined}
                required
              />
              {errors.name && (
                <div id="contact-home-name-error" className="contact-form__error">{errors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contact-home-phone">Số điện thoại *</label>
              <input
                type="tel"
                id="contact-home-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0xxx xxx xxx"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'contact-home-phone-error' : undefined}
                required
              />
              {errors.phone && (
                <div id="contact-home-phone-error" className="contact-form__error">{errors.phone}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contact-home-service">Lĩnh vực pháp lý *</label>
              <select
                id="contact-home-service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                aria-invalid={!!errors.service}
                aria-describedby={errors.service ? 'contact-home-service-error' : undefined}
                required
              >
                <option value="">-- Chọn lĩnh vực cần tư vấn --</option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.service && (
                <div id="contact-home-service-error" className="contact-form__error">{errors.service}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg btn--full"
              disabled={submitting}
            >
              {submitting ? (
                <>Đang gửi...</>
              ) : (
                <>
                  <PaperPlaneIcon size={18} />
                  Gửi Yêu Cầu Tư Vấn
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="contact-info">
            <h3 className="contact-info__title">Thông Tin Văn Phòng</h3>

            <div className="contact-info__items">
              <div className="contact-info__item">
                <div className="contact-info__icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="contact-info__label">Địa chỉ</div>
                  <div className="contact-info__value">
                    Tầng 15, Tòa nhà Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội
                  </div>
                </div>
              </div>

              <div className="contact-info__item">
                <div className="contact-info__icon">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="contact-info__label">Giờ làm việc</div>
                  <div className="contact-info__value">
                    Thứ 2 – Thứ 6: 8:00 – 18:00
                    <br />
                    Thứ 7: 8:00 – 12:00
                  </div>
                </div>
              </div>

              <div className="contact-info__item">
                <div className="contact-info__icon">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="contact-info__label">Hotline</div>
                  <div className="contact-info__value">1900 1234</div>
                </div>
              </div>

              <div className="contact-info__item">
                <div className="contact-info__icon">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="contact-info__label">Email</div>
                  <div className="contact-info__value">contact@vuplat.vn</div>
                </div>
              </div>
            </div>

            <div className="contact-info__cta">
              <a
                href="https://zalo.me/19001234"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info__cta-btn contact-info__cta-btn--zalo"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 4.98L2 22l5.02-1.34C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.76 13.77c-.37.93-2.05 1.7-3.38 1.27-.88-.28-1.72-.9-2.38-1.57-1.2-1.2-1.78-2.67-2.14-4.12-.17-.66.02-1.35.52-1.88.45-.47 1.07-.63 1.63-.42.53.2 1.05.65 1.53 1.23.57.7 1.13 1.1 1.88 1.1.22 0 .47-.05.73-.15.53-.2 1.05-.15 1.47.13.47.3.77.78.85 1.35.12.8-.1 1.65-.73 2.06z" />
                </svg>
                Chat Zalo ngay
              </a>
              <a
                href="tel:19001234"
                className="contact-info__cta-btn contact-info__cta-btn--phone"
              >
                <Phone size={18} />
                Gọi 1900 1234
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
