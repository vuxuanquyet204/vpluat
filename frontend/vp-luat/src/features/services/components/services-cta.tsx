import Link from 'next/link';
import { Calendar, Phone, ArrowRight } from 'lucide-react';

export function ServicesCta() {
  return (
    <section className="services-cta-section">
      <div className="container">
        <div className="services-cta-box">
          <div className="services-cta-content">
            <div className="services-cta-eyebrow">Sẵn sàng bắt đầu?</div>
            <h2 className="services-cta-title">
              Đặt lịch tư vấn <em>miễn phí</em> ngay hôm nay
            </h2>
            <p className="services-cta-sub">
              Đội ngũ luật sư giàu kinh nghiệm của chúng tôi sẵn sàng hỗ trợ bạn giải quyết mọi vấn đề pháp lý.
              Buổi tư vấn đầu tiên hoàn toàn miễn phí.
            </p>
            <div className="services-cta-buttons">
              <Link href="/booking" className="services-cta-btn services-cta-btn--primary">
                <Calendar size={16} aria-hidden="true" />
                Đặt lịch tư vấn
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a href="tel:19001234" className="services-cta-btn services-cta-btn--outline">
                <Phone size={16} aria-hidden="true" />
                Gọi 1900 1234
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
