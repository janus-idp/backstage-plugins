import { z } from 'zod';

export const notificationLinkSchema = z.object({
  name: z.string(),
  title: z.string(),
  href: z.string(),
  rel: z.string(),
  hreflang: z.string(),
  media: z.string(),
  type: z.string(),
  deprecation: z.string(),
  profile: z.string(),
});

export const notificationContentSchema = z.object({
  id: z.string(),
  subject: z.string(),
  body: z.string(),
  fromuser: z.string(),
  read: z.boolean(),
  createdOn: z.string().transform(Date),
  messageType: z.string(),
  tags: z.array(z.string()),
  folder: z.string(),
});

export const notificationsSchema = z.object({
  content: z.array(notificationContentSchema),
  page: z.object({
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    number: z.number(),
  }),
});

export type NotificationLink = z.infer<typeof notificationLinkSchema>;
export type NotificationContent = z.infer<typeof notificationContentSchema>;
export type Notifications = z.infer<typeof notificationsSchema>;
