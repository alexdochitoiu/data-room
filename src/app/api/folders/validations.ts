import z from 'zod';

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name too long'),
  parentId: z.string().optional(),
});

export const renameFolderSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name too long'),
});

export const deleteFolderSchema = z.object({
  id: z.string().min(1, 'Folder ID is required'),
});
