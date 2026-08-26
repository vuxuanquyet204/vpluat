import type { ChatMessage, QuickReply } from '../types';

type Translator = {
  (key: string, values?: Record<string, string | number>): string;
  raw: (key: string) => unknown;
};

function richMessage(t: Translator, key: string): string {
  const value = t.raw(key);
  return typeof value === 'string' ? value : t(key);
}

const now = () => new Date().toISOString();
let msgCounter = 0;
const stableUid = (prefix: string) => `${prefix}-${++msgCounter}`;

function makeBot(content: string, quickReplies?: QuickReply[], disclaimer?: string): ChatMessage {
  return { id: stableUid('bot'), from: 'bot', content, timestamp: now(), quickReplies, disclaimer };
}

function makeUser(text: string): ChatMessage {
  return { id: stableUid('user'), from: 'user', content: text, timestamp: now() };
}

export interface ConversationStep {
  userMessage?: string;
  botMessages: ChatMessage[];
  nextState?: string;
  passthrough?: boolean;
}

const reply = (t: Translator, key: string, icon: string, value: string): QuickReply => ({
  label: t(`replies.${key}`),
  icon,
  reply: value,
});

export function createConversationFlow(t: Translator) {
  const consultationReplies = [
    reply(t, 'bookConsultation', 'fa-solid fa-calendar-check', 'intent:book_consultation'),
    reply(t, 'askMore', 'fa-solid fa-circle-question', 'intent:ask_more'),
  ];
  const serviceReplies = [
    reply(t, 'businessLaw', 'fa-solid fa-building', 'intent:business_law'),
    reply(t, 'landLaw', 'fa-solid fa-land-plot', 'intent:land_law'),
    reply(t, 'civilLaw', 'fa-solid fa-file-contract', 'intent:civil_law'),
    reply(t, 'criminalLaw', 'fa-solid fa-gavel', 'intent:criminal_law'),
    reply(t, 'otherArea', 'fa-solid fa-globe', 'intent:other_area'),
  ];

  const greetingMessage = makeBot(richMessage(t, 'greetingHtml'), undefined, t('disclaimer'));
  const servicePrompt = makeBot(t('servicePrompt'), serviceReplies);
  const businessReply = makeBot(richMessage(t, 'businessReplyHtml'), [
    reply(t, 'companySetup', 'fa-solid fa-rocket', 'intent:company_setup'),
    reply(t, 'contractDispute', 'fa-solid fa-file-signature', 'intent:contract_dispute'),
    reply(t, 'ma', 'fa-solid fa-handshake', 'intent:mna'),
    reply(t, 'otherIssue', 'fa-solid fa-ellipsis', 'intent:other_issue'),
  ]);
  const companySetupReply = makeBot(richMessage(t, 'companySetupHtml'), consultationReplies);
  const bookingCtaReply = makeBot(richMessage(t, 'bookingCta'));
  const leadCompleteBot = makeBot(t('leadComplete'));

  const makePhonePrompt = (name: string) => makeBot(t('phonePrompt', { name }));
  const makeLeadHandoff = (userName?: string, userPhone?: string): ChatMessage => ({
    id: stableUid('bot'),
    from: 'bot',
    content: '',
    timestamp: now(),
    quickReplies: [reply(t, 'connectConsultant', 'fa-solid fa-phone', `handoff:${userName ?? ''}:${userPhone ?? ''}`)],
  });

  const areaReply = (key: string) => makeBot(t(`${key}Reply`), consultationReplies);

  const matchesIntent = (input: string, intent: string) =>
    input === `intent:${intent}` || input.trim().toLowerCase().includes(intent.replace('_', ' '));

  const script: Record<string, (input: string) => ConversationStep> = {
    greeting: (input) => {
      const lower = input.toLowerCase();
      if (matchesIntent(input, 'business_law') || lower.includes('doanh nghiệp') || lower.includes('thành lập công ty') || lower.includes('thành lập')) {
        return { botMessages: [businessReply], nextState: 'service_selected' };
      }
      if (matchesIntent(input, 'land_law') || lower.includes('đất') || lower.includes('bất động')) return { botMessages: [areaReply('landLaw')], nextState: 'service_selected' };
      if (matchesIntent(input, 'civil_law') || lower.includes('dân sự') || lower.includes('hôn nhân') || lower.includes('ly hôn') || lower.includes('lyhon')) return { botMessages: [areaReply('civilLaw')], nextState: 'service_selected' };
      if (matchesIntent(input, 'criminal_law') || lower.includes('hình sự')) return { botMessages: [areaReply('criminalLaw')], nextState: 'service_selected' };
      return { botMessages: [], nextState: 'greeting', passthrough: true };
    },
    service_selected: (input) => {
      const lower = input.toLowerCase();
      if (matchesIntent(input, 'company_setup') || lower.includes('thành lập công ty') || lower.includes('thành lập')) return { botMessages: [companySetupReply], nextState: 'company_setup' };
      if (matchesIntent(input, 'contract_dispute') || lower.includes('tranh chấp') || lower.includes('hợp đồng')) return { botMessages: [areaReply('contractDispute')], nextState: 'company_setup' };
      return { botMessages: [servicePrompt], nextState: 'greeting' };
    },
    company_setup: (input) => {
      if (matchesIntent(input, 'book_consultation') || input.includes('đặt lịch') || input.includes('tư vấn')) return { botMessages: [bookingCtaReply], nextState: 'lead_name' };
      if (matchesIntent(input, 'ask_more') || input.includes('hỏi thêm')) return { botMessages: [businessReply], nextState: 'service_selected' };
      return { botMessages: [companySetupReply], nextState: 'company_setup' };
    },
    lead_name: (input) => {
      const name = input.trim();
      const displayName = name.split(' ').filter(Boolean).slice(-2).join(' ') || name;
      return { botMessages: [makePhonePrompt(displayName)], nextState: 'lead_phone' };
    },
    lead_phone: () => ({ botMessages: [leadCompleteBot, makeLeadHandoff()], nextState: 'lead_complete' }),
  };

  return {
    greetingMessage,
    processUserInput: (state: string, input: string): ConversationStep => script[state]
      ? script[state](input)
      : { botMessages: [makeBot(t('fallback'), serviceReplies)], nextState: 'greeting' },
  };
}

export function processUserInput(t: Translator, state: string, input: string): ConversationStep {
  return createConversationFlow(t).processUserInput(state, input);
}

export { makeBot, makeUser };
