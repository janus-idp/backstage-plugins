import { notificationsSchema } from './notification';

describe('notification', () => {
  it('parses the notification response', () => {
    // Following data are based on swagger and not recent API response (TODO: https://issues.redhat.com/browse/FLPATH-260)
    const result = notificationsSchema.safeParse({
      links: [
        {
          rel: 'myrel',
          href: 'https://link.to/something',
          hreflang: 'en',
          media: 'text/html',
          title: 'My title',
          type: 'my-type',
          deprecation: 'no',
          profile: 'my profile',
          name: 'My name',
        },
      ],
      content: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          subject: 'My subject',
          createdOn: '2023-03-24T08:16:53.048Z',
          messageType: 'message',
          body: 'COntent of the message',
          fromuser: 'my-user',
          read: false,
          tags: ['tag1', 'tag2'],
          folder: 'my-folder',
          links: [
            {
              rel: 'myrel2',
              href: 'https://link.to/something/foo',
              hreflang: 'cz',
              media: 'text/html',
              title: 'My next title',
              type: 'my-type',
              deprecation: 'no',
              profile: 'my profile',
              name: 'My next name',
            },
          ],
        },
      ],
      page: {
        size: 1,
        totalElements: 1,
        totalPages: 1,
        number: 0,
      },
    });

    expect(result.success).toBe(true);
  });

  it('parses empty notification response', () => {
    const result = notificationsSchema.safeParse({
      links: [],
      content: [],
      page: {
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
      },
    });

    expect(result.success).toBe(true);
  });
});
