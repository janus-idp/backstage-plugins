import { z } from 'zod';

const projectStatus = z.union([
  z.literal('in-progress'),
  z.literal('on-boarded'),
]);

export type ProjectStatus = z.infer<typeof projectStatus>;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createDate: z.string().transform(Date),
  modifyDate: z.string().transform(Date),
  username: z.string().nullable(),
  status: projectStatus.nullable().optional(),
});

export type Project = z.infer<typeof projectSchema>;
