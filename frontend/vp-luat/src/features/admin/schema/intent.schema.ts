import { z } from 'zod';

export const intentSchema = z.object({
  name: z.string().min(2, 'Tên intent tối thiểu 2 ký tự').max(80),
  description: z.string().max(500).optional().or(z.literal('')),
  sampleUtterances: z
    .array(z.string().min(2, 'Utterance tối thiểu 2 ký tự').max(200))
    .min(1, 'Cần ít nhất 1 utterance')
    .max(50, 'Tối đa 50 utterances'),
  responseTemplate: z.string().min(5, 'Response template tối thiểu 5 ký tự').max(2000),
  handoffEnabled: z.boolean(),
  handoffTo: z.string().max(120).optional().or(z.literal('')),
  handoffKeywords: z.array(z.string().min(1).max(60)),
  isActive: z.boolean(),
});

export type IntentFormValues = z.infer<typeof intentSchema>;