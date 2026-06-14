import type { ChatMessage, QuickReply } from '../types';

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

function makeBot(content: string, quickReplies?: QuickReply[], disclaimer?: string): ChatMessage {
  return {
    id: uid(),
    from: 'bot',
    content,
    timestamp: now(),
    quickReplies,
    disclaimer,
  };
}

function makeUser(text: string): ChatMessage {
  return { id: uid(), from: 'user', content: text, timestamp: now() };
}

export interface ConversationStep {
  userMessage?: string;
  botMessages: ChatMessage[];
  nextState?: string;
}

export const GREETING_MESSAGE = makeBot(
  `<div style="margin-bottom:8px;line-height:1.5">
    Xin chào! Tôi là <strong>Trợ Lý Pháp Lý</strong> của VP Luật Hùng & Cộng sự.<br>
    Tôi có thể hỗ trợ bạn tìm hiểu thông tin pháp luật sơ bộ.
  </div>
  <div style="margin-top:8px;padding:8px 10px;background:#FEF2F2;border-radius:6px;font-size:0.78rem;color:#DC2626;border-left:3px solid #DC2626">
    <i class="fa-solid fa-triangle-exclamation" style="margin-right:4px"></i>
    Lưu ý: Thông tin mang tính tham khảo, không thay thế tư vấn chuyên nghiệp.
  </div>`,
  undefined,
  'Thông tin mang tính tham khảo, không thay thế tư vấn chuyên nghiệp.',
);

export const SERVICE_PROMPT = makeBot(
  'Bạn cần hỗ trợ về lĩnh vực nào?',
  [
    { label: 'Luật Doanh nghiệp', icon: 'fa-solid fa-building', reply: 'Luật doanh nghiệp' },
    { label: 'Đất đai & BĐS', icon: 'fa-solid fa-land-plot', reply: 'Đất đai và bất động sản' },
    { label: 'Luật Dân sự', icon: 'fa-solid fa-file-contract', reply: 'Luật dân sự' },
    { label: 'Luật Hình sự', icon: 'fa-solid fa-gavel', reply: 'Luật hình sự' },
    { label: 'Lĩnh vực khác', icon: 'fa-solid fa-globe', reply: 'Lĩnh vực khác' },
  ],
);

export const DOANH_NGHIEP_REPLY = makeBot(
  `<div style="margin-bottom:8px">Về <strong>Luật Doanh Nghiệp</strong>, tôi có thể hỗ trợ bạn tìm hiểu về:</div>
  <ul style="margin:6px 0 8px;padding-left:16px">
    <li style="margin-bottom:4px"><i class="fa-solid fa-check" style="color:var(--green);margin-right:5px;font-size:0.7rem"></i>Thành lập &amp; đăng ký kinh doanh</li>
    <li style="margin-bottom:4px"><i class="fa-solid fa-check" style="color:var(--green);margin-right:5px;font-size:0.7rem"></i>Soạn thảo &amp; rà soát hợp đồng</li>
    <li style="margin-bottom:4px"><i class="fa-solid fa-check" style="color:var(--green);margin-right:5px;font-size:0.7rem"></i>Giải quyết tranh chấp thương mại</li>
    <li><i class="fa-solid fa-check" style="color:var(--green);margin-right:5px;font-size:0.7rem"></i>M&amp;A và tái cơ cấu doanh nghiệp</li>
  </ul>
  Bạn đang quan tâm đến vấn đề cụ thể nào?`,
  [
    { label: 'Thành lập công ty', icon: 'fa-solid fa-rocket', reply: 'Thành lập công ty' },
    { label: 'Tranh chấp hợp đồng', icon: 'fa-solid fa-file-signature', reply: 'Tranh chấp hợp đồng' },
    { label: 'M&A', icon: 'fa-solid fa-handshake', reply: 'M&A doanh nghiệp' },
    { label: 'Vấn đề khác', icon: 'fa-solid fa-ellipsis', reply: 'Vấn đề khác' },
  ],
);

export const COMPANY_SETUP_REPLY = makeBot(
  `<div style="margin-bottom:6px">Để thành lập công ty tại Việt Nam, bạn cần chuẩn bị:</div>
  <div style="background:#EFF3F8;border-radius:8px;padding:10px 12px;margin-bottom:8px;font-size:0.8rem">
    <div style="margin-bottom:4px"><i class="fa-solid fa-file-lines" style="color:var(--primary);margin-right:6px"></i><strong>Hồ sơ cơ bản:</strong></div>
    <div style="padding-left:22px;font-size:0.78rem;color:var(--gray-600)">Giấy tờ thành viên, vốn điều lệ, ngành nghề đăng ký</div>
  </div>
  <div style="background:#EFF3F8;border-radius:8px;padding:10px 12px;margin-bottom:8px;font-size:0.8rem">
    <div style="margin-bottom:4px"><i class="fa-solid fa-clock" style="color:var(--primary);margin-right:6px"></i><strong>Thời gian:</strong></div>
    <div style="padding-left:22px;font-size:0.78rem;color:var(--gray-600)">3-5 ngày làm việc (loại hình TNHH/CP)</div>
  </div>
  <div style="background:#FEF9EF;border-radius:8px;padding:10px 12px;font-size:0.8rem">
    <div style="margin-bottom:4px"><i class="fa-solid fa-coins" style="color:var(--accent);margin-right:6px"></i><strong>Chi phí nhà nước:</strong></div>
    <div style="padding-left:22px;font-size:0.78rem;color:var(--gray-600)">~500.000 VNĐ lệ phí đăng ký</div>
  </div>
  <br>
  Đội ngũ của chúng tôi có thể hỗ trợ toàn bộ quy trình từ A-Z.<br>
  Bạn có muốn đặt lịch tư vấn miễn phí với luật sư không?`,
  [
    { label: 'Đặt lịch tư vấn', icon: 'fa-solid fa-calendar-check', reply: 'Đặt lịch tư vấn' },
    { label: 'Hỏi thêm', icon: 'fa-solid fa-circle-question', reply: 'Hỏi thêm' },
  ],
);

export const BOOKING_CTA_REPLY = makeBot(
  'Tuyệt vời! Cho tôi xin thông tin để kết nối bạn với luật sư phù hợp nhé:<br><br>Họ và tên của bạn là gì?',
  undefined,
);

export const PHONE_PROMPT = (name: string) =>
  makeBot(
    `Dạ anh/chị <strong>${name}</strong>, vui lòng cho tôi số điện thoại để luật sư liên hệ xác nhận lịch:`,
    undefined,
  );

export const LEAD_COMPLETE_BOT = makeBot(
  'Cảm ơn bạn! Đội ngũ luật sư sẽ liên hệ trong 15 phút làm việc.',
);

export const LEAD_COMPLETE_HANDSOFF: ChatMessage = {
  id: uid(),
  from: 'bot',
  content: '',
  timestamp: now(),
};

export function makeLeadHandoff(userName?: string, userPhone?: string): ChatMessage {
  return {
    id: uid(),
    from: 'bot',
    content: '',
    timestamp: now(),
    quickReplies: [
      {
        label: 'Kết nối tư vấn viên',
        icon: 'fa-solid fa-phone',
        reply: `handoff:${userName ?? ''}:${userPhone ?? ''}`,
      },
    ],
  };
}

export const CONVERSATION_SCRIPT: Record<string, (userInput: string) => { botMessages: ChatMessage[]; nextState: string }> = {
  'greeting': (input) => {
    const lower = input.toLowerCase();
    if (
      lower.includes('doanh nghiệp') ||
      lower.includes('thành lập công ty') ||
      lower.includes('thành lập')
    ) {
      return { botMessages: [DOANH_NGHIEP_REPLY], nextState: 'service_selected' };
    }
    if (lower.includes('đất') || lower.includes('bất động')) {
      return { botMessages: [makeBot('Về <strong>Luật Đất đai & Bất động sản</strong>, tôi có thể hỗ trợ: đăng ký quyền sử dụng đất, chuyển nhượng, thế chấp, giải quyết tranh chấp.', [
        { label: 'Đặt lịch tư vấn', icon: 'fa-solid fa-calendar-check', reply: 'Đặt lịch tư vấn' },
        { label: 'Hỏi thêm', icon: 'fa-solid fa-circle-question', reply: 'Hỏi thêm' },
      ])], nextState: 'service_selected' };
    }
    if (lower.includes('dân sự')) {
      return { botMessages: [makeBot('Về <strong>Luật Dân sự</strong>, tôi có thể hỗ trợ: thừa kế, hợp đồng, bồi thường thiệt hại, quyền sở hữu trí tuệ.', [
        { label: 'Đặt lịch tư vấn', icon: 'fa-solid fa-calendar-check', reply: 'Đặt lịch tư vấn' },
        { label: 'Hỏi thêm', icon: 'fa-solid fa-circle-question', reply: 'Hỏi thêm' },
      ])], nextState: 'service_selected' };
    }
    if (lower.includes('hình sự')) {
      return { botMessages: [makeBot('Về <strong>Luật Hình sự</strong>, tôi có thể hỗ trợ: tư vấn quyền bào chữa, bảo lĩnh, giải quyết khiếu nại.', [
        { label: 'Đặt lịch tư vấn', icon: 'fa-solid fa-calendar-check', reply: 'Đặt lịch tư vấn' },
        { label: 'Hỏi thêm', icon: 'fa-solid fa-circle-question', reply: 'Hỏi thêm' },
      ])], nextState: 'service_selected' };
    }
    return { botMessages: [SERVICE_PROMPT], nextState: 'greeting' };
  },

  'service_selected': (input) => {
    const lower = input.toLowerCase();
    if (
      lower.includes('thành lập công ty') ||
      lower.includes('thành lập')
    ) {
      return { botMessages: [COMPANY_SETUP_REPLY], nextState: 'company_setup' };
    }
    if (
      lower.includes('tranh chấp') ||
      lower.includes('hợp đồng')
    ) {
      return { botMessages: [makeBot('Về <strong>Tranh chấp hợp đồng</strong>, chúng tôi hỗ trợ: soạn thảo, đàm phán, khởi kiện, giải quyết tranh chấp thương mại.', [
        { label: 'Đặt lịch tư vấn', icon: 'fa-solid fa-calendar-check', reply: 'Đặt lịch tư vấn' },
        { label: 'Hỏi thêm', icon: 'fa-solid fa-circle-question', reply: 'Hỏi thêm' },
      ])], nextState: 'company_setup' };
    }
    return { botMessages: [SERVICE_PROMPT], nextState: 'greeting' };
  },

  'company_setup': (input) => {
    if (input.includes('đặt lịch') || input.includes('tư vấn')) {
      return { botMessages: [BOOKING_CTA_REPLY], nextState: 'lead_name' };
    }
    if (input.includes('hỏi thêm')) {
      return { botMessages: [DOANH_NGHIEP_REPLY], nextState: 'service_selected' };
    }
    return { botMessages: [COMPANY_SETUP_REPLY], nextState: 'company_setup' };
  },

  'lead_name': (input) => {
    const name = input.trim();
    const displayName = name.split(' ').filter(Boolean).slice(-2).join(' ') || name;
    return { botMessages: [PHONE_PROMPT(displayName)], nextState: 'lead_phone' };
  },

  'lead_phone': () => {
    return { botMessages: [LEAD_COMPLETE_BOT, makeLeadHandoff()], nextState: 'lead_complete' };
  },
};

export function processUserInput(
  state: string,
  input: string,
): { botMessages: ChatMessage[]; nextState: string } {
  const handler = CONVERSATION_SCRIPT[state];
  if (handler) {
    return handler(input);
  }
  return {
    botMessages: [makeBot('Xin lỗi, tôi chưa hiểu ý bạn. Bạn cần hỗ trợ về lĩnh vực nào?', [
      { label: 'Luật Doanh nghiệp', icon: 'fa-solid fa-building', reply: 'Luật doanh nghiệp' },
      { label: 'Đất đai & BĐS', icon: 'fa-solid fa-land-plot', reply: 'Đất đai và bất động sản' },
      { label: 'Đặt lịch tư vấn', icon: 'fa-solid fa-calendar-check', reply: 'Đặt lịch tư vấn' },
    ])],
    nextState: 'greeting',
  };
}

export { makeBot, makeUser };
