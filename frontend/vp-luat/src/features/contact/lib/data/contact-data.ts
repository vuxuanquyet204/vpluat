import type { OfficeInfo, ContactFAQ, OfficeLocation } from '../../types';

export const OFFICE_INFOS: OfficeInfo[] = [
  {
    type: 'address',
    icon: 'fa-solid fa-location-dot',
    label: 'Văn phòng chính',
    value: '123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    sub: 'Tầng 8, Tòa nhà VP Luật',
  },
  {
    type: 'phone',
    icon: 'fa-solid fa-phone',
    label: 'Hotline 24/7',
    value: '1900 1234',
    sub: 'Miễn phí tư vấn lần đầu',
  },
  {
    type: 'email',
    icon: 'fa-solid fa-envelope',
    label: 'Email',
    value: 'contact@vpluat.vn',
    sub: 'Phản hồi trong vòng 30 phút',
  },
  {
    type: 'hours',
    icon: 'fa-solid fa-clock',
    label: 'Giờ làm việc',
    value: 'T2 - T7: 8:00 - 18:00',
    sub: 'Ngoài giờ: Hỗ trợ qua hotline',
  },
];

export const QUICK_CONTACTS = [
  {
    label: 'Gọi ngay',
    icon: 'fa-solid fa-phone',
    href: 'tel:19001234',
    variant: 'phone' as const,
  },
  {
    label: 'Zalo',
    icon: 'fa-solid fa-comment-dots',
    href: 'https://zalo.me/19001234',
    variant: 'zalo' as const,
  },
  {
    label: 'Messenger',
    icon: 'fa-brands fa-facebook-messenger',
    href: 'https://m.me/vpluat',
    variant: 'messenger' as const,
  },
];

export const CONTACT_FAQS: ContactFAQ[] = [
  {
    id: '1',
    question: 'Tôi có thể được tư vấn miễn phí không?',
    answer: 'Có. Chúng tôi cung cấp buổi tư vấn đầu tiên hoàn toàn miễn phí trong 30 phút. Bạn có thể đến trực tiếp văn phòng, gọi điện, hoặc trao đổi qua video call.',
  },
  {
    id: '2',
    question: 'Thời gian phản hồi email là bao lâu?',
    answer: 'Chúng tôi cam kết phản hồi email trong vòng 30 phút trong giờ làm việc và trong vòng 4 giờ ngoài giờ. Với các trường hợp khẩn cấp, vui lòng gọi hotline 1900 1234.',
  },
  {
    id: '3',
    question: 'VP Luật có hỗ trợ làm việc ngoài giờ không?',
    answer: 'Có. Hotline 1900 1234 hoạt động 24/7 để hỗ trợ các trường hợp khẩn cấp. Đội ngũ luật sư sẵn sàng hỗ trợ bạn bất kỳ lúc nào.',
  },
  {
    id: '4',
    question: 'Có thể đến văn phòng mà không cần hẹn trước không?',
    answer: 'Chúng tôi khuyến khích bạn đặt lịch trước để được phục vụ tốt nhất. Tuy nhiên, bạn vẫn có thể đến trực tiếp và lễ tân sẽ hỗ trợ sắp xếp.',
  },
];

export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    city: 'TP. Hồ Chí Minh',
    address: '123 Nguyễn Trãi, P. Bến Thành, Q. 1',
    phone: '1900 1234',
    email: 'hcm@vpluat.vn',
    workingHours: 'T2 - T7: 8:00 - 18:00',
    isMain: true,
  },
  {
    city: 'Hà Nội',
    address: '456 Láng Hạ, P. Láng Hạ, Q. Đống Đa',
    phone: '024 7300 1234',
    email: 'hanoi@vpluat.vn',
    workingHours: 'T2 - T7: 8:00 - 18:00',
  },
  {
    city: 'Đà Nẵng',
    address: '789 Trần Phú, P. Bạc Đằng, Q. Hải Châu',
    phone: '023 6300 1234',
    email: 'danang@vpluat.vn',
    workingHours: 'T2 - T7: 8:00 - 17:30',
  },
];

export const SOCIAL_LINKS = [
  { label: 'Facebook', icon: 'fa-brands fa-facebook-f', href: '#' },
  { label: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', href: '#' },
  { label: 'YouTube', icon: 'fa-brands fa-youtube', href: '#' },
  { label: 'Zalo', icon: 'fa-solid fa-comment', href: '#' },
];
