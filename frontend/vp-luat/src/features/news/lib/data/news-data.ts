import type { NewsArticle, NewsCategoryFilter, PopularPost } from '../../types';

export const CATEGORY_LABELS: Record<string, string> = {
  'tin-tuc': 'Tin tức',
  'nghi-dinh': 'Nghị định',
  'blog': 'Blog',
  'case-study': 'Case study',
  'huong-dan': 'Hướng dẫn',
};

export const CATEGORY_SLUGS: Record<string, string> = {
  'tin-tuc': 'tin-tuc',
  'nghi-dinh': 'nghi-dinh',
  'blog': 'blog',
  'case-study': 'case-study',
  'huong-dan': 'huong-dan',
};

const LAN = {
  name: 'Lan',
  initials: 'L',
  avatarColor: 'linear-gradient(135deg, #1E3A5F, #C9A84C)',
};

const MINH = {
  name: 'Minh',
  initials: 'M',
  avatarColor: 'linear-gradient(135deg, #2A4F7A, #C9A84C)',
};

const HUNG = {
  name: 'Hùng',
  initials: 'H',
  avatarColor: 'linear-gradient(135deg, #152A45, #1E3A5F)',
};

export const NEWS_CATEGORIES: NewsCategoryFilter[] = [
  { id: 'all', label: 'Tất cả', count: 12, slug: 'all', icon: 'fa-solid fa-layer-group' },
  { id: 'tin-tuc', label: 'Tin tức', count: 4, slug: 'tin-tuc', icon: 'fa-solid fa-newspaper' },
  { id: 'nghi-dinh', label: 'Nghị định', count: 3, slug: 'nghi-dinh', icon: 'fa-solid fa-scale-balanced' },
  { id: 'blog', label: 'Blog', count: 2, slug: 'blog', icon: 'fa-solid fa-pen-nib' },
  { id: 'case-study', label: 'Case study', count: 2, slug: 'case-study', icon: 'fa-solid fa-briefcase' },
  { id: 'huong-dan', label: 'Hướng dẫn', count: 1, slug: 'huong-dan', icon: 'fa-solid fa-circle-info' },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    slug: 'thong-tu-moi-2025-ve-thanh-lap-doanh-nghiep',
    title: 'Thông tư mới 2025 về thành lập doanh nghiệp: Những điểm doanh nghiệp cần biết',
    excerpt: 'Bộ Tài chính vừa ban hành thông tư mới với nhiều điểm đáng chú ý về thủ tục thành lập doanh nghiệp, có hiệu lực từ 01/01/2025.',
    content: `
      <p>Bộ Tài chính vừa ban hành Thông tư số 12/2025/TT-BTC hướng dẫn chi tiết về đăng ký thành lập doanh nghiệp, có hiệu lực từ ngày 01/01/2025. Thông tư này thay thế các quy định cũ và bổ sung nhiều điểm mới quan trọng.</p>
      <h2 id="tong-quan">Tổng quan thay đổi</h2>
      <p>Thông tư mới quy định rõ ràng hơn về thủ tục đăng ký, hồ sơ cần chuẩn bị, và thời gian xử lý. Một số điểm đáng chú ý bao gồm:</p>
      <ul>
        <li>Giảm thời gian xử lý hồ sơ từ 3 ngày xuống còn 1 ngày làm việc</li>
        <li>Bổ sung quy định về đăng ký trực tuyến</li>
        <li>Đơn giản hóa mẫu đơn đăng ký</li>
        <li>Quy định rõ hơn về phí và lệ phí</li>
      </ul>
      <h2 id="ho-so-can-chuan-bi">Hồ sơ cần chuẩn bị</h2>
      <p>Theo thông tư mới, hồ sơ đăng ký thành lập doanh nghiệp bao gồm các giấy tờ sau:</p>
      <ol>
        <li>Giấy đề nghị đăng ký doanh nghiệp</li>
        <li>Điều lệ công ty</li>
        <li>Danh sách thành viên/cổ đông</li>
        <li>Bản sao CMND/CCCD của người đại diện</li>
        <li>Giấy ủy quyền (nếu có)</li>
      </ol>
      <h2 id="quy-trinh-thuc-hien">Quy trình thực hiện</h2>
      <p>Quy trình đăng ký được thực hiện qua 4 bước chính: chuẩn bị hồ sơ, nộp hồ sơ, nhận kết quả, và đăng ký thuế ban đầu. Toàn bộ quy trình có thể hoàn tất trong vòng 7-10 ngày làm việc.</p>
    `,
    category: 'nghi-dinh',
    tags: ['thành lập công ty', 'nghị định', 'doanh nghiệp 2025'],
    author: LAN,
    publishedAt: '2025-05-20T08:00:00Z',
    readingTime: 8,
    views: 1248,
    isHot: true,
    isFeatured: true,
    toc: [
      { id: 'tong-quan', text: 'Tổng quan thay đổi' },
      { id: 'ho-so-can-chuan-bi', text: 'Hồ sơ cần chuẩn bị' },
      { id: 'quy-trinh-thuc-hien', text: 'Quy trình thực hiện' },
    ],
  },
  {
    id: '2',
    slug: 'quy-dinh-moi-ve-hop-dong-dien-tu-2025',
    title: 'Quy định mới về hợp đồng điện tử có hiệu lực từ tháng 6/2025',
    excerpt: 'Nghị định 13/2025/NĐ-CP quy định chi tiết về giao dịch điện tử trong lĩnh vực tài chính sẽ chính thức có hiệu lực.',
    content: `<p>Nội dung chi tiết về hợp đồng điện tử và các quy định mới...</p>`,
    category: 'nghi-dinh',
    tags: ['hợp đồng điện tử', 'nghị định', 'tài chính'],
    author: MINH,
    publishedAt: '2025-05-18T10:30:00Z',
    readingTime: 6,
    views: 856,
    isFeatured: true,
  },
  {
    id: '3',
    slug: 'case-study-thanh-lap-cong-ty-fdi',
    title: 'Case study: Thành công tư vấn thành lập công ty FDI 50 triệu USD',
    excerpt: 'Câu chuyện về hành trình tư vấn pháp lý cho một dự án FDI lớn vào Việt Nam, từ khâu khảo sát đến khi đi vào hoạt động.',
    content: `<p>Chi tiết case study về dự án FDI...</p>`,
    category: 'case-study',
    tags: ['FDI', 'case study', 'doanh nghiệp'],
    author: HUNG,
    thumbnail: 'https://picsum.photos/seed/news3/600/400',
    publishedAt: '2025-05-16T14:00:00Z',
    readingTime: 12,
    views: 2340,
    isFeatured: true,
  },
  {
    id: '4',
    slug: 'huong-dan-thu-tuc-ly-hon-thuan-tinh',
    title: 'Hướng dẫn thủ tục ly hôn thuận tình chi tiết nhất 2025',
    excerpt: 'Ly hôn thuận tình là quy trình pháp lý đơn giản nhất, tuy nhiên cần chuẩn bị đầy đủ hồ sơ để tránh mất thời gian.',
    content: `<p>Hướng dẫn chi tiết thủ tục ly hôn...</p>`,
    category: 'huong-dan',
    tags: ['ly hôn', 'hôn nhân', 'thủ tục'],
    author: LAN,
    thumbnail: 'https://picsum.photos/seed/news4/600/400',
    publishedAt: '2025-05-15T09:00:00Z',
    readingTime: 10,
    views: 4521,
    isHot: true,
    isFeatured: true,
  },
  {
    id: '5',
    slug: 'tin-tuc-thi-truong-bat-dong-san-2025',
    title: 'Tin tức thị trường bất động sản quý 2/2025: Tín hiệu phục hồi tích cực',
    excerpt: 'Thị trường bất động sản Việt Nam trong quý 2/2025 ghi nhận nhiều tín hiệu tích cực từ phía cơ quan quản lý và doanh nghiệp.',
    content: `<p>Tin tức thị trường bất động sản...</p>`,
    category: 'tin-tuc',
    tags: ['bất động sản', 'thị trường', 'tin tức'],
    author: MINH,
    thumbnail: 'https://picsum.photos/seed/news5/600/400',
    publishedAt: '2025-05-14T11:00:00Z',
    readingTime: 7,
    views: 1893,
  },
  {
    id: '6',
    slug: 'blog-cach-tra-cuu-nhan-hieu',
    title: 'Cách tra cứu nhãn hiệu trước khi đăng ký kinh doanh',
    excerpt: 'Tra cứu nhãn hiệu là bước quan trọng giúp tránh xung đột pháp lý và bảo vệ thương hiệu lâu dài cho doanh nghiệp.',
    content: `<p>Blog về tra cứu nhãn hiệu...</p>`,
    category: 'blog',
    tags: ['nhãn hiệu', 'sở hữu trí tuệ', 'doanh nghiệp'],
    author: LAN,
    thumbnail: 'https://picsum.photos/seed/news6/600/400',
    publishedAt: '2025-05-12T15:30:00Z',
    readingTime: 9,
    views: 978,
  },
  {
    id: '7',
    slug: 'tin-tuc-chinh-sach-thue-moi',
    title: 'Chính sách thuế mới cho doanh nghiệp nhỏ và vừa từ 01/07/2025',
    excerpt: 'Chính phủ vừa ban hành chính sách thuế ưu đãi mới cho doanh nghiệp nhỏ và vừa với nhiều điểm đáng chú ý.',
    content: `<p>Chi tiết chính sách thuế mới...</p>`,
    category: 'tin-tuc',
    tags: ['thuế', 'chính sách', 'SME'],
    author: MINH,
    thumbnail: 'https://picsum.photos/seed/news7/600/400',
    publishedAt: '2025-05-10T13:00:00Z',
    readingTime: 6,
    views: 1456,
  },
  {
    id: '8',
    slug: 'case-study-tranh-chap-lao-dong',
    title: 'Case study: Giải quyết tranh chấp lao động tập thể quy mô lớn',
    excerpt: 'Bài học kinh nghiệm từ việc tư vấn cho một doanh nghiệp FDI giải quyết tranh chấp lao động tập thể với 800 công nhân.',
    content: `<p>Case study tranh chấp lao động...</p>`,
    category: 'case-study',
    tags: ['lao động', 'case study', 'FDI'],
    author: HUNG,
    thumbnail: 'https://picsum.photos/seed/news8/600/400',
    publishedAt: '2025-05-08T10:00:00Z',
    readingTime: 14,
    views: 2103,
  },
  {
    id: '9',
    slug: 'blog-cach-soan-thao-hop-dong',
    title: '10 lưu ý quan trọng khi soạn thảo hợp đồng thương mại',
    excerpt: 'Hợp đồng thương mại là xương sống của mọi giao dịch kinh doanh. Bài viết chia sẻ 10 lưu ý quan trọng giúp tránh rủi ro pháp lý.',
    content: `<p>10 lưu ý khi soạn thảo hợp đồng...</p>`,
    category: 'blog',
    tags: ['hợp đồng', 'thương mại', 'pháp lý'],
    author: LAN,
    thumbnail: 'https://picsum.photos/seed/news9/600/400',
    publishedAt: '2025-05-05T08:30:00Z',
    readingTime: 11,
    views: 1672,
  },
  {
    id: '10',
    slug: 'tin-tuc-phap-luat-moi-nhat',
    title: 'Cập nhật pháp luật mới nhất tuần 19/2025',
    excerpt: 'Tổng hợp các văn bản pháp luật mới được ban hành trong tuần 19/2025 có ảnh hưởng đến doanh nghiệp và cá nhân.',
    content: `<p>Cập nhật pháp luật mới...</p>`,
    category: 'tin-tuc',
    tags: ['pháp luật', 'cập nhật', 'tin tức'],
    author: MINH,
    thumbnail: 'https://picsum.photos/seed/news10/600/400',
    publishedAt: '2025-05-12T07:00:00Z',
    readingTime: 5,
    views: 845,
  },
  {
    id: '11',
    slug: 'nghi-dinh-moi-ve-bao-hiem-xa-hoi',
    title: 'Nghị định mới về bảo hiểm xã hội: Những thay đổi quan trọng cho doanh nghiệp',
    excerpt: 'Nghị định 15/2025/NĐ-CP về BHXH có hiệu lực từ 01/08/2025 với nhiều thay đổi quan trọng ảnh hưởng đến doanh nghiệp.',
    content: `<p>Chi tiết nghị định BHXH mới...</p>`,
    category: 'nghi-dinh',
    tags: ['BHXH', 'nghị định', 'doanh nghiệp'],
    author: LAN,
    thumbnail: 'https://picsum.photos/seed/news11/600/400',
    publishedAt: '2025-05-10T09:30:00Z',
    readingTime: 9,
    views: 1289,
  },
  {
    id: '12',
    slug: 'tin-tuc-xu-huong-phap-ly-2025',
    title: 'Xu hướng pháp lý nổi bật 2025: ESG, AI, và chuyển đổi số',
    excerpt: 'Năm 2025 chứng kiến nhiều xu hướng pháp lý mới nổi lên, bao gồm ESG compliance, AI regulation, và chuyển đổi số trong lĩnh vực pháp luật.',
    content: `<p>Xu hướng pháp lý 2025...</p>`,
    category: 'tin-tuc',
    tags: ['xu hướng', 'ESG', 'AI', 'pháp lý'],
    author: HUNG,
    thumbnail: 'https://picsum.photos/seed/news12/600/400',
    publishedAt: '2025-05-08T16:00:00Z',
    readingTime: 13,
    views: 3421,
  },
];

export const POPULAR_POSTS: PopularPost[] = NEWS_ARTICLES
  .slice()
  .sort((a, b) => b.views - a.views)
  .slice(0, 5)
  .map((a) => ({ id: a.id, title: a.title, publishedAt: a.publishedAt }));

export const NEWS_TAGS: string[] = [
  'Luật Doanh nghiệp',
  'Luật Đất đai',
  'Tranh chấp đất đai',
  'Luật Hình sự',
  'Luật Dân sự',
  'Luật Lao động',
  'BHXH',
  'Sở hữu trí tuệ',
  'Nhãn hiệu',
  'Hợp đồng',
  'Thừa kế',
  'Bồi thường',
  'Bất động sản',
  'Thuế',
  'Hải quan',
  'Bảo vệ dữ liệu',
  'GDPR',
  'FDI',
  'M&A',
  'ESG',
];
