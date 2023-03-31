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
  createDate: z.coerce.date(),
  modifyDate: z.coerce.date(),
  username: z.string().nullable(),
  // TODO: I hate this default and the API should be returing this
  status: projectStatus.default('in-progress'),
});

export type Project = z.infer<typeof projectSchema>;
