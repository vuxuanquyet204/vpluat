import Link from 'next/link';
import { Phone, Calendar } from 'lucide-react';

export function SidebarCta() {
  return (
    <div className="cta-box">
      <div className="cta-box__icon">
        <Phone size={20} />
      </div>
      <h3 className="cta-box__title">Đặt lịch tư vấn ngay</h3>
      <p className="cta-box__sub">Đội ngũ luật sư sẵn sàng tư vấn miễn phí lần đầu.</p>
      <Link href="/booking" className="cta-box__btn">
        <Calendar size={14} />
        Đặt lịch tư vấn
      </Link>
    </div>
  );
}
