import { z } from 'zod';

export const leadNoteSchema = z.object({
  content: z.string().min(1, 'Nội dung ghi chú không được trống').max(2000),
});

export type LeadNoteFormValues = z.infer<typeof leadNoteSchema>;
