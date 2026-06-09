import type { LandingPageConfig, LandingPageVariantConfig } from '@/features/landing-pages/types';

const COMMON_CONTACT = {
  type: 'contact' as const,
  title: 'Kết nối với đội ngũ VP Luật',
  description:
    'Liên hệ để được đội ngũ luật sư chuyên môn phù hợp phản hồi trong ngày làm việc.',
  items: [
    { label: 'Hotline', value: '1900 6789' },
    { label: 'Email', value: 'contact@vuplat.vn' },
    { label: 'Địa chỉ', value: 'Tầng 15, Landmark 72, Phạm Hùng, Hà Nội' },
  ],
  ctas: [
    { label: 'Đặt lịch tư vấn', href: '/booking', variant: 'primary' as const },
    { label: 'Xem FAQ', href: '/cau-hoi-thuong-gap', variant: 'outline-dark' as const },
  ],
};

const LANDING_PAGES: LandingPageConfig[] = [
  {
    slug: 'dich-vu',
    title: 'Dịch vụ pháp lý',
    seoTitle: 'Dịch vụ pháp lý toàn diện',
    sectionLabel: 'Dịch vụ',
    description:
      'Khám phá các nhóm dịch vụ pháp lý dành cho doanh nghiệp, nhà đầu tư và cá nhân tại VP Luật.',
    keywords: ['dịch vụ pháp lý', 'luật doanh nghiệp', 'luật đất đai', 'tư vấn luật'],
    variants: [
      { key: 'control' },
      {
        key: 'hero-alt',
        heroEyebrow: 'Tư vấn theo ngành nghề',
        heroTitle: 'Giải pháp pháp lý thiết kế theo rủi ro kinh doanh',
        heroDescription:
          'Từ hợp đồng, nhân sự, đầu tư đến tranh chấp, mỗi dịch vụ đều được đóng gói theo mục tiêu vận hành thực tế.',
        ctaLabel: 'Nhận đề xuất dịch vụ',
      },
    ],
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Dịch vụ mũi nhọn',
        title: 'Hệ sinh thái dịch vụ pháp lý cho doanh nghiệp và cá nhân',
        description:
          'Chúng tôi cung cấp tư vấn chiến lược, rà soát hồ sơ và đại diện xử lý tranh chấp với quy trình minh bạch, đo lường được tiến độ.',
        ctas: [
          { label: 'Đặt lịch tư vấn', href: '/booking', variant: 'primary' },
          { label: 'Xem đội ngũ luật sư', href: '/luat-su', variant: 'outline-dark' },
        ],
        stats: [
          { value: '15+', label: 'Năm kinh nghiệm' },
          { value: '2.000+', label: 'Hồ sơ đã xử lý' },
          { value: '95%', label: 'Khách hàng hài lòng' },
        ],
      },
      {
        type: 'feature-grid',
        title: 'Nhóm dịch vụ chủ lực',
        description: 'Các gói dịch vụ được tổ chức theo nhu cầu phổ biến nhất của khách hàng.',
        items: [
          { title: 'Luật Doanh nghiệp', description: 'Thành lập, M&A, quản trị nội bộ, tái cấu trúc và giải thể.' },
          { title: 'Luật Đất đai', description: 'Chuyển nhượng, dự án, cấp sổ, bồi thường và tranh chấp.' },
          { title: 'Luật Dân sự', description: 'Hợp đồng, thừa kế, bồi thường, hôn nhân gia đình và tài sản.' },
          { title: 'Luật Lao động', description: 'Nội quy, hợp đồng lao động, kỷ luật và tranh chấp nhân sự.' },
          { title: 'Đầu tư nước ngoài', description: 'Tư vấn FDI, giấy phép, cấu trúc sở hữu và tuân thủ hậu kiểm.' },
          { title: 'Sở hữu trí tuệ', description: 'Đăng ký nhãn hiệu, bản quyền, xử lý xâm phạm và licensing.' },
        ],
      },
      {
        type: 'content',
        title: 'Cách chúng tôi triển khai dịch vụ',
        body: [
          'Mỗi hồ sơ đều đi qua 3 bước: chẩn đoán pháp lý ban đầu, đề xuất chiến lược xử lý và triển khai theo mốc tiến độ có người phụ trách rõ ràng.',
          'Khách hàng nhận được checklist hồ sơ, timeline, trạng thái xử lý và các cảnh báo rủi ro trọng yếu để chủ động ra quyết định.',
        ],
      },
      COMMON_CONTACT,
    ],
  },
  {
    slug: 'luat-su',
    title: 'Đội ngũ luật sư',
    seoTitle: 'Đội ngũ luật sư chuyên môn cao',
    sectionLabel: 'Đội ngũ',
    description: 'Gặp gỡ đội ngũ luật sư và chuyên gia phụ trách từng lĩnh vực pháp lý tại VP Luật.',
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Con người tạo nên khác biệt',
        title: 'Đội ngũ luật sư kết hợp tư duy tranh tụng và tư vấn chiến lược',
        description:
          'Mỗi luật sư phụ trách một nhóm ngành và phối hợp liên phòng ban để đảm bảo khách hàng nhận giải pháp đầy đủ góc nhìn.',
        ctas: [
          { label: 'Đặt lịch gặp luật sư', href: '/booking', variant: 'primary' },
          { label: 'Khám phá dịch vụ', href: '/dich-vu', variant: 'outline-dark' },
        ],
        stats: [
          { value: '50+', label: 'Luật sư cộng tác' },
          { value: '12', label: 'Lĩnh vực chuyên sâu' },
          { value: '24h', label: 'Phản hồi hồ sơ mới' },
        ],
      },
      {
        type: 'feature-grid',
        title: 'Nhóm chuyên môn',
        items: [
          { title: 'Doanh nghiệp & M&A', description: 'Tư vấn giao dịch, due diligence và cấu trúc pháp lý.' },
          { title: 'Đất đai & Bất động sản', description: 'Hồ sơ dự án, giao dịch, cấp giấy và tranh chấp.' },
          { title: 'Tranh tụng dân sự', description: 'Đại diện đàm phán, trọng tài, tố tụng nhiều cấp.' },
          { title: 'Lao động & Tuân thủ', description: 'Nội quy, kỷ luật, giải quyết tranh chấp nhân sự.' },
        ],
      },
      {
        type: 'testimonials',
        title: 'Khách hàng đánh giá đội ngũ',
        items: [
          {
            quote: 'Đội ngũ giải thích rất rõ ràng, giúp chúng tôi xử lý tranh chấp cổ đông mà không làm gián đoạn vận hành.',
            author: 'CEO công ty thương mại',
            role: 'Khách hàng doanh nghiệp',
            rating: 5,
          },
          {
            quote: 'Tôi đánh giá cao việc luật sư phản hồi nhanh và luôn đưa ra các phương án thay thế trước khi ra quyết định.',
            author: 'Nhà đầu tư cá nhân',
            role: 'Khách hàng tư vấn đầu tư',
            rating: 5,
          },
        ],
      },
      COMMON_CONTACT,
    ],
  },
  {
    slug: 'blog',
    title: 'Blog pháp lý',
    seoTitle: 'Blog pháp lý và phân tích chuyên sâu',
    sectionLabel: 'Blog',
    description: 'Phân tích chuyên sâu, checklist áp dụng và góc nhìn thực chiến từ đội ngũ tư vấn pháp lý.',
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Phân tích chuyên sâu',
        title: 'Blog pháp lý dành cho người ra quyết định',
        description:
          'Tập hợp các bài phân tích về thay đổi pháp luật, case study và hướng dẫn áp dụng thực tế cho doanh nghiệp và cá nhân.',
        ctas: [
          { label: 'Đọc tin tức mới', href: '/tin-tuc', variant: 'primary' },
          { label: 'Xem FAQ', href: '/cau-hoi-thuong-gap', variant: 'outline-dark' },
        ],
      },
      {
        type: 'feature-grid',
        title: 'Chuyên mục nổi bật',
        items: [
          { title: 'Quản trị doanh nghiệp', description: 'Checklist họp HĐQT, quản trị rủi ro và compliance.' },
          { title: 'Hợp đồng & giao dịch', description: 'Điều khoản trọng yếu, cơ chế phạt và xử lý vi phạm.' },
          { title: 'Bất động sản', description: 'Cập nhật pháp lý dự án, mua bán, đặt cọc và tranh chấp.' },
          { title: 'Lao động', description: 'Điểm mới về tuyển dụng, chấm dứt, bảo hiểm và nội quy.' },
        ],
      },
      {
        type: 'content',
        title: 'Cách chúng tôi biên tập nội dung',
        body: [
          'Mỗi bài viết đều xuất phát từ các câu hỏi thật của khách hàng, sau đó được đội ngũ luật sư biên tập lại theo hướng dễ áp dụng, tránh diễn giải học thuật quá mức.',
          'Chúng tôi ưu tiên bài viết có checklist và ví dụ để người đọc có thể dùng ngay trong công việc hằng ngày.',
        ],
      },
      COMMON_CONTACT,
    ],
  },
  {
    slug: 'tin-tuc',
    title: 'Tin tức pháp luật',
    seoTitle: 'Tin tức pháp luật mới nhất',
    sectionLabel: 'Tin tức',
    description: 'Theo dõi các cập nhật pháp luật, quy định mới và tác động thực tế tới doanh nghiệp, cá nhân.',
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Cập nhật nhanh',
        title: 'Tin tức pháp luật mới nhất được chắt lọc cho người bận rộn',
        description:
          'Mỗi bản tin đều tóm tắt nội dung thay đổi, đối tượng chịu tác động và gợi ý hành động tiếp theo.',
        ctas: [
          { label: 'Nhận tư vấn theo quy định mới', href: '/booking', variant: 'primary' },
          { label: 'Đọc blog chuyên sâu', href: '/blog', variant: 'outline-dark' },
        ],
      },
      {
        type: 'feature-grid',
        title: 'Các nhóm tin được theo dõi',
        items: [
          { title: 'Doanh nghiệp', description: 'Nghị định, thông tư và thủ tục đăng ký mới.' },
          { title: 'Đất đai', description: 'Khung giá, quy hoạch, bồi thường và cấp giấy chứng nhận.' },
          { title: 'Đầu tư', description: 'Điều kiện tiếp cận thị trường và ưu đãi đầu tư.' },
          { title: 'Lao động', description: 'Tiền lương, BHXH, an toàn lao động và hồ sơ nhân sự.' },
        ],
      },
      COMMON_CONTACT,
    ],
  },
  {
    slug: 'cau-hoi-thuong-gap',
    title: 'Câu hỏi thường gặp',
    seoTitle: 'Câu hỏi thường gặp về dịch vụ pháp lý',
    sectionLabel: 'FAQ',
    description: 'Tổng hợp những câu hỏi phổ biến về quy trình làm việc, thời gian xử lý và chi phí dịch vụ.',
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Hỏi nhanh đáp gọn',
        title: 'Giải đáp các câu hỏi khách hàng thường gặp trước khi sử dụng dịch vụ',
        description:
          'Nếu bạn đang cần hình dung rõ quy trình, chi phí hoặc hồ sơ phải chuẩn bị, đây là nơi bắt đầu nhanh nhất.',
        ctas: [
          { label: 'Trao đổi trực tiếp', href: '/booking', variant: 'primary' },
          { label: 'Xem dịch vụ', href: '/dich-vu', variant: 'outline-dark' },
        ],
      },
      {
        type: 'faq',
        title: 'Những câu hỏi được hỏi nhiều nhất',
        items: [
          {
            question: 'Mất bao lâu để nhận phản hồi ban đầu?',
            answer: 'Trong giờ hành chính, đội ngũ tiếp nhận phản hồi trong vòng 30 phút đến 2 giờ tùy kênh liên hệ.',
          },
          {
            question: 'Chi phí tư vấn được tính như thế nào?',
            answer: 'Chúng tôi báo phí theo phạm vi công việc, thời lượng xử lý và mức độ phức tạp; luôn có báo giá trước khi triển khai.',
          },
          {
            question: 'Có thể làm việc từ xa với khách hàng ngoài Hà Nội không?',
            answer: 'Có. Hồ sơ có thể tiếp nhận qua email, họp online và ký kết theo quy trình phù hợp từng loại việc.',
          },
        ],
      },
      COMMON_CONTACT,
    ],
  },
  {
    slug: 'danh-gia',
    title: 'Đánh giá khách hàng',
    seoTitle: 'Đánh giá từ khách hàng',
    sectionLabel: 'Đánh giá',
    description: 'Các phản hồi tiêu biểu từ khách hàng doanh nghiệp và cá nhân đã làm việc cùng VP Luật.',
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Niềm tin từ khách hàng',
        title: 'Những đánh giá phản ánh cách chúng tôi làm việc mỗi ngày',
        description:
          'Tập trung vào tốc độ phản hồi, chất lượng tư vấn và khả năng đồng hành xuyên suốt từng hồ sơ.',
        ctas: [
          { label: 'Đặt lịch tư vấn', href: '/booking', variant: 'primary' },
          { label: 'Xem đội ngũ luật sư', href: '/luat-su', variant: 'outline-dark' },
        ],
      },
      {
        type: 'testimonials',
        title: 'Phản hồi nổi bật',
        items: [
          {
            quote: 'Rõ việc, rõ timeline và luôn có phương án dự phòng. Đây là điều tôi đánh giá cao nhất khi làm việc với một văn phòng luật.',
            author: 'Giám đốc vận hành',
            role: 'Công ty logistics',
            rating: 5,
          },
          {
            quote: 'Luật sư đồng hành rất sát trong giai đoạn thương lượng hợp đồng và giúp chúng tôi giảm đáng kể rủi ro pháp lý.',
            author: 'Founder startup SaaS',
            role: 'Khách hàng doanh nghiệp',
            rating: 5,
          },
          {
            quote: 'Tôi đánh giá cao cách giải thích dễ hiểu và không tạo cảm giác áp lực khi khách hàng chưa quen làm việc với luật sư.',
            author: 'Khách hàng cá nhân',
            role: 'Tư vấn dân sự',
            rating: 5,
          },
        ],
      },
      COMMON_CONTACT,
    ],
  },
  {
    slug: 'lien-he',
    title: 'Liên hệ',
    seoTitle: 'Liên hệ tư vấn pháp lý',
    sectionLabel: 'Liên hệ',
    description: 'Kết nối với VP Luật để được tư vấn, gửi hồ sơ sơ bộ hoặc đặt lịch làm việc với luật sư phù hợp.',
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Tư vấn nhanh',
        title: 'Liên hệ để được phân loại nhu cầu và kết nối đúng luật sư phụ trách',
        description:
          'Chỉ cần để lại mô tả ngắn về vấn đề, chúng tôi sẽ đề xuất hướng xử lý và lịch làm việc phù hợp nhất.',
        ctas: [
          { label: 'Gọi hotline 1900 6789', href: 'tel:19006789', variant: 'primary' },
          { label: 'Chat qua Zalo', href: '#', variant: 'outline-dark' },
        ],
      },
      {
        type: 'contact',
        title: 'Thông tin văn phòng và kênh hỗ trợ',
        description: 'Bạn có thể gọi trực tiếp, gửi email hoặc đến văn phòng theo lịch hẹn.',
        items: [
          { label: 'Hotline', value: '1900 6789' },
          { label: 'Email', value: 'contact@vuplat.vn' },
          { label: 'Địa chỉ', value: 'Tầng 15, Landmark 72, Phạm Hùng, Hà Nội' },
          { label: 'Giờ làm việc', value: 'Thứ 2 - Thứ 6: 8:00 - 18:00 · Thứ 7: 8:00 - 12:00' },
        ],
        ctas: [
          { label: 'Xem FAQ', href: '/cau-hoi-thuong-gap', variant: 'outline-dark' },
          { label: 'Khám phá dịch vụ', href: '/dich-vu', variant: 'primary' },
        ],
      },
    ],
  },
];

export const publicPageSlugs = LANDING_PAGES.map((page) => page.slug);

export function getLandingPageBySlug(slug: string): LandingPageConfig | undefined {
  return LANDING_PAGES.find((page) => page.slug === slug);
}

export function pickLandingPageVariant(
  page: LandingPageConfig,
  requestedVariant?: string
): LandingPageVariantConfig['key'] {
  const variants = page.variants?.map((variant) => variant.key) ?? ['control'];

  if (!requestedVariant) {
    return variants[0] ?? 'control';
  }

  return variants.includes(requestedVariant) ? requestedVariant : variants[0] ?? 'control';
}

export function resolveLandingPageVariant(
  page: LandingPageConfig,
  requestedVariant?: string
): LandingPageVariantConfig | undefined {
  const key = pickLandingPageVariant(page, requestedVariant);
  return page.variants?.find((variant) => variant.key === key);
}
