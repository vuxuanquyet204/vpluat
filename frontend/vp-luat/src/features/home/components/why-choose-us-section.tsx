'use client';

import {
  Award,
  Clock,
  Shield,
  Heart,
  Headphones,
  FileCheck,
} from 'lucide-react';

const WHY_ITEMS = [
  {
    icon: Award,
    title: '15+ Năm Kinh Nghiệm',
    desc: 'Hơn 15 năm hoạt động trong lĩnh vực tư vấn pháp lý, chúng tôi đã xử lý hàng nghìn vụ việc đa dạng.',
  },
  {
    icon: Shield,
    title: 'Đội Ngũ Chuyên Nghiệp',
    desc: '50+ luật sư với trình độ cao, nhiều thạc sĩ và tiến sĩ luật từ các trường đại học hàng đầu.',
  },
  {
    icon: Clock,
    title: 'Hỗ Trợ 24/7',
    desc: 'Đội ngũ tư vấn luôn sẵn sàng hỗ trợ khách hàng mọi lúc, mọi nơi qua nhiều kênh liên lạc.',
  },
  {
    icon: FileCheck,
    title: 'Quy Trình Minh Bạch',
    desc: 'Báo cáo tiến độ thường xuyên, minh bạch trong chi phí và cam kết kết quả rõ ràng.',
  },
  {
    icon: Heart,
    title: 'Tận Tâm Với Khách Hàng',
    desc: 'Lấy lợi ích khách hàng làm ưu tiên hàng đầu, tư vấn chi tiết và đồng hành trong suốt quá trình.',
  },
  {
    icon: Headphones,
    title: 'Dịch Vụ Đa Ngôn Ngữ',
    desc: 'Hỗ trợ khách hàng bằng tiếng Việt, tiếng Anh và nhiều ngôn ngữ khác.',
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="section section--dark">
      <div className="container">
        <div className="section__header">
          <span className="section__label" style={{ color: 'var(--accent)', background: 'rgba(201,168,76,0.15)' }}>
            Tại sao chọn chúng tôi
          </span>
          <h2 className="section__title section__title--white">
            Vì Sao Chọn VP Luật?
          </h2>
          <p className="section__subtitle section__subtitle--white">
            Chúng tôi cam kết mang đến dịch vụ pháp lý chất lượng cao nhất
          </p>
        </div>

        <div className="why__grid">
          {WHY_ITEMS.map((item) => (
            <div key={item.title} className="why-card">
              <div className="why-card__icon">
                <item.icon size={28} />
              </div>
              <div className="why-card__content">
                <h3 className="why-card__title">{item.title}</h3>
                <p className="why-card__desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
