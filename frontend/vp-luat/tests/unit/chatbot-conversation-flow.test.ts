import { describe, it, expect } from 'vitest';
import { CONVERSATION_SCRIPT, processUserInput } from '@/features/chatbot/config/conversation-flow';

describe('conversation-flow', () => {
  describe('CONVERSATION_SCRIPT', () => {
    it('greeting: routes doanh nghiep correctly', () => {
      const result = CONVERSATION_SCRIPT['greeting']('doanh nghiệp');
      expect(result.botMessages).toHaveLength(1);
      expect(result.botMessages[0].from).toBe('bot');
      expect(result.nextState).toBe('service_selected');
    });

    it('greeting: routes land/real estate correctly', () => {
      const result = CONVERSATION_SCRIPT['greeting']('đất đai');
      expect(result.nextState).toBe('service_selected');
    });

    it('greeting: routes civil law correctly', () => {
      const result = CONVERSATION_SCRIPT['greeting']('luật dân sự');
      expect(result.nextState).toBe('service_selected');
    });

    it('greeting: routes criminal law correctly', () => {
      const result = CONVERSATION_SCRIPT['greeting']('luật hình sự');
      expect(result.nextState).toBe('service_selected');
    });

    it('greeting: unknown input returns service prompt', () => {
      const result = CONVERSATION_SCRIPT['greeting']('asdfghjkl');
      expect(result.botMessages[0].quickReplies).toBeDefined();
      expect(result.botMessages[0].quickReplies!.length).toBeGreaterThan(0);
    });

    it('service_selected: company setup routes correctly', () => {
      const result = CONVERSATION_SCRIPT['service_selected']('Thành lập công ty');
      expect(result.nextState).toBe('company_setup');
    });

    it('company_setup: booking routes to lead_name', () => {
      const result = CONVERSATION_SCRIPT['company_setup']('Đặt lịch tư vấn');
      expect(result.nextState).toBe('lead_name');
    });

    it('lead_name: returns phone prompt with last 2 words of name', () => {
      const result = CONVERSATION_SCRIPT['lead_name']('Nguyễn Văn A');
      expect(result.nextState).toBe('lead_phone');
      // Shows last 2 words: "Văn A"
      expect(result.botMessages[0].content).toContain('Văn A');
    });

    it('lead_phone: completes with handoff', () => {
      const result = CONVERSATION_SCRIPT['lead_phone']('0912345678');
      expect(result.nextState).toBe('lead_complete');
      expect(result.botMessages.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('processUserInput', () => {
    it('routes unknown state to greeting', () => {
      const result = processUserInput('idle', 'hello');
      expect(result.botMessages[0].from).toBe('bot');
    });

    it('processes greeting state via script', () => {
      const result = processUserInput('greeting', 'doanh nghiệp');
      expect(result.nextState).toBe('service_selected');
    });

    it('processes lead_name state correctly', () => {
      const result = processUserInput('lead_name', 'Test User');
      expect(result.nextState).toBe('lead_phone');
    });
  });
});
