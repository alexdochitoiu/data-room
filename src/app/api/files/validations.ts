import z from 'zod';

export const renameFileSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name too long'),
});
