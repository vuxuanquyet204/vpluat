'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    question: 'Tôi cần chuẩn bị những gì khi đến tư vấn lần đầu?',
    answer:
      'Khi đến tư vấn lần đầu, bạn nên mang theo các giấy tờ liên quan đến vụ việc như hợp đồng, quyết định, thông báo từ cơ quan nhà nước, ảnh chụp hiện trường (nếu có), và ghi chép lại các sự kiện theo thứ tự thời gian. Đội ngũ VP Luật sẽ hướng dẫn chi tiết qua điện thoại trước buổi tư vấn.',
  },
  {
    question: 'Chi phí tư vấn pháp lý được tính như thế nào?',
    answer:
      'VP Luật cung cấp buổi tư vấn đầu tiên miễn phí 15 phút. Các buổi tư vấn tiếp theo và dịch vụ pháp lý có mức phí linh hoạt tùy theo loại vụ việc, độ phức tạp và thời gian thực hiện. Chúng tôi cam kết báo giá minh bạch trước khi thực hiện công việc.',
  },
  {
    question: 'VP Luật có hỗ trợ khách hàng ở nước ngoài không?',
    answer:
      'Có, chúng tôi hỗ trợ khách hàng qua các kênh trực tuyến như video call, email và điện thoại quốc tế. Đội ngũ luật sư có thể gặp trực tiếp tại văn phòng hoặc theo yêu cầu của khách hàng tại các địa điểm thuận tiện.',
  },
  {
    question: 'Thời gian giải quyết một vụ việc thường kéo dài bao lâu?',
    answer:
      'Thời gian giải quyết phụ thuộc vào loại vụ việc và độ phức tạp. Các vụ đơn giản có thể giải quyết trong 1-3 tháng. Các vụ phức tạp như tranh chấp đất đai, M&A có thể kéo dài 6-12 tháng hoặc hơn. Chúng tôi sẽ ước tính thời gian cụ thể sau khi nghiên cứu hồ sơ.',
  },
  {
    question: 'VP Luật có cam kết bảo mật thông tin khách hàng không?',
    answer:
      'Hoàn toàn có. Tất cả thông tin của khách hàng được bảo mật theo quy định của pháp luật và đạo đức nghề nghiệp luật sư. Chúng tôi chỉ sử dụng thông tin để phục vụ công việc tư vấn và không tiết lộ cho bên thứ ba khi chưa có sự đồng ý của khách hàng.',
  },
  {
    question: 'Tôi có thể thanh toán phí dịch vụ bằng cách nào?',
    answer:
      'VP Luật chấp nhận thanh toán qua chuyển khoản ngân hàng, tiền mặt tại văn phòng, và các phương thức thanh toán điện tử phổ biến. Đối với các vụ việc lớn, chúng tôi có chính sách thanh toán theo giai đoạn để giảm áp lực tài chính cho khách hàng.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqId = useId();

  return (
    <section className="section section--gray">
      <div className="container">
        <div className="section__header">
          <span className="section__label">FAQ</span>
          <h2 className="section__title">Câu Hỏi Thường Gặp</h2>
          <p className="section__subtitle">
            Giải đáp những thắc mắc phổ biến của khách hàng về dịch vụ
          </p>
        </div>

        <div className="faq__container">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `${faqId}-answer-${index}`;

            return (
              <div key={index} className={`faq-item ${isOpen ? 'active' : ''}`}>
                <button
                  className="faq-item__question"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span>{faq.question}</span>
                  <Plus className="faq-item__icon" size={16} />
                </button>
                <div
                  id={answerId}
                  className={`faq-item__answer ${isOpen ? 'active' : ''}`}
                >
                  <div className="faq-item__answer-inner">{faq.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
