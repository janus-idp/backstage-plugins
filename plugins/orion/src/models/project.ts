import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createDate: z.string().transform(Date),
  modifyDate: z.string().transform(Date),
  username: z.string().nullable(),
});

export type Project = z.infer<typeof projectSchema>;
