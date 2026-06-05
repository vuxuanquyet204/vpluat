'use client';

import Link from 'next/link';
import {
  Building2,
  Home,
  Scale,
  Shield,
  Briefcase,
  Landmark,
  FileText,
  Users,
  ArrowRight,
} from 'lucide-react';

const SERVICES = [
  {
    icon: Building2,
    name: 'Luật Doanh nghiệp',
    desc: 'Tư vấn thành lập, M&A, giải thể doanh nghiệp',
    href: '/dich-vu/luat-doanh-nghiep',
  },
  {
    icon: Home,
    name: 'Luật Đất đai',
    desc: 'Chuyển nhượng, thuê, thế chấp, tranh chấp đất đai',
    href: '/dich-vu/luat-dat-dai',
  },
  {
    icon: Scale,
    name: 'Luật Dân sự',
    desc: 'Hợp đồng, bồi thường, thừa kế, ly hôn',
    href: '/dich-vu/luat-dan-su',
  },
  {
    icon: Shield,
    name: 'Luật Hình sự',
    desc: 'Bào chữa, bảo vệ quyền lợi bị can, bị cáo',
    href: '/dich-vu/luat-hinh-su',
  },
  {
    icon: Briefcase,
    name: 'Luật Lao động',
    desc: 'Hợp đồng, tranh chấp, bảo hiểm xã hội',
    href: '/dich-vu/luat-lao-dong',
  },
  {
    icon: Landmark,
    name: 'Luật Hành chính',
    desc: 'Khiếu nại, tố cáo, thủ tục hành chính',
    href: '/dich-vu/luat-hanh-chinh',
  },
  {
    icon: FileText,
    name: 'Soạn thảo hợp đồng',
    desc: 'Hợp đồng thương mại, lao động, bất động sản',
    href: '/dich-vu/soan-thao-hop-dong',
  },
  {
    icon: Users,
    name: 'Đại diện theo ủy quyền',
    desc: 'Đại diện giải quyết tranh chấp tại tòa',
    href: '/dich-vu/dai-dien-uy-quyen',
  },
];

export function ServicesSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Dịch vụ</span>
          <h2 className="section__title">Giải Pháp Pháp Lý Toàn Diện</h2>
          <p className="section__subtitle">
            Chúng tôi cung cấp đa dạng các dịch vụ pháp lý cho cá nhân và doanh nghiệp
          </p>
        </div>

        <div className="services__grid">
          {SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="service-card"
            >
              <div className="service-card__icon-wrapper">
                <service.icon size={48} strokeWidth={1.5} />
              </div>
              <h3 className="service-card__name">{service.name}</h3>
              <p className="service-card__desc">{service.desc}</p>
              <span className="service-card__link">
                Tìm hiểu thêm <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
