'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Home, Scale, Calendar } from 'lucide-react';

const NEWS_ITEMS = [
  {
    icon: Building2,
    category: 'Luật Doanh nghiệp',
    date: '20/05/2026',
    dateTime: '2026-05-20',
    title: 'Nghị định mới về đăng ký doanh nghiệp: 5 điểm cần lưu ý trong năm 2026',
    excerpt:
      'Những thay đổi quan trọng trong thủ tục đăng ký kinh doanh, giấy phép con và nghĩa vụ báo cáo mà doanh nghiệp cần nắm rõ...',
    href: '/tin-tuc/nghi-dinh-moi-dang-ky-doanh-nghiep-2026',
  },
  {
    icon: Home,
    category: 'Luật Đất đai',
    date: '15/05/2026',
    dateTime: '2026-05-15',
    title: 'Hướng dẫn mới về bồi thường GPMB: Quyền lợi của người dân được tăng cường',
    excerpt:
      'Cập nhật chính sách bồi thường, hỗ trợ tái định cư và giải quyết khiếu nại trong các dự án hạ tầng giai đoạn 2026-2030...',
    href: '/tin-tuc/huong-dan-boi-thuong-giai-phong-mat-bang-2026',
  },
  {
    icon: Scale,
    category: 'Tư vấn pháp lý',
    date: '10/05/2026',
    dateTime: '2026-05-10',
    title: 'Top 10 câu hỏi thường gặp về ly hôn: Luật sư giải đáp chi tiết',
    excerpt:
      'Từ thủ tục ly hôn, phân chia tài sản, quyền nuôi con đến các vấn đề liên quan khi kết hôn có yếu tố nước ngoài...',
    href: '/tin-tuc/top-10-cau-hoi-thuong-gap-ve-ly-hon',
  },
];

export function NewsSection() {
  return (
    <section className="section section--gray" id="news">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Tin tức pháp luật</span>
          <h2 className="section__title">Tin Tức & Kiến Thức Pháp Luật Mới Nhất</h2>
          <p className="section__subtitle">
            Cập nhật thông tin pháp luật mới nhất, giúp bạn nắm bắt quyền lợi của mình
          </p>
        </div>

        <div className="news__grid">
          {NEWS_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.href} className="news-card">
                <div className="news-card__thumb">
                  <div className="news-card__thumb-placeholder">
                    <Icon size={44} strokeWidth={1.7} />
                  </div>
                  <span className="news-card__badge">{item.category}</span>
                </div>

                <div className="news-card__body">
                  <div className="news-card__meta">
                    <time className="news-card__date" dateTime={item.dateTime}>
                      <Calendar size={13} />
                      <span>{item.date}</span>
                    </time>
                  </div>

                  <h3 className="news-card__title">{item.title}</h3>
                  <p className="news-card__excerpt">{item.excerpt}</p>

                  <Link href={item.href} className="news-card__read">
                    Đọc thêm <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
