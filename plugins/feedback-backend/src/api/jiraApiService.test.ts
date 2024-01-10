import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  mockConfig,
  mockCreateJiraTicketResp,
  mockFeedback,
  mockJiraTicketDetailsResp,
  mockJiraUsernameResp,
} from '../mocks';
import {
  createJiraTicket,
  getJiraUsernameByEmail,
  getTicketDetails,
} from './jiraApiService';

const handlers = [
  rest.post(
    'https://jira.host/rest/api/latest/issue',
    async (req, res, ctx) => {
      const reqData = await req.json();
      const key = reqData.fields.project.key;
      return res(ctx.json(mockCreateJiraTicketResp(key)));
    },
  ),
  rest.get('https://jira.host/rest/api/latest/user/search', (_, res, ctx) =>
    res(ctx.json(mockJiraUsernameResp)),
  ),
  rest.get('https://jira.host/rest/api/latest/issue/ticket-id', (_, res, ctx) =>
    res(ctx.json(mockJiraTicketDetailsResp)),
  ),
];

describe('JIRA issue', () => {
  const mswMockServer = setupServer();
  handlers.forEach(handler => mswMockServer.use(handler));
  mswMockServer.listen({ onUnhandledRequest: 'warn' });
  const jiraHost = mockConfig.feedback.integrations.jira[0].host;
  const jiraToken = mockConfig.feedback.integrations.jira[0].token;

  it('createJiraTicket', async () => {
    const data = await createJiraTicket({
      host: jiraHost,
      authToken: jiraToken,
      projectKey: 'proj-key',
      summary: mockFeedback.summary!,
      description: 'Submitted from Test App',
      tag: mockFeedback.tag!,
      feedbackType: mockFeedback.feedbackType!,
      reporter: 'John Doe',
    });
    expect(data.key).toEqual('proj-key-01');
  });

  it('getJiraUsernameByEmail', async () => {
    const data = await getJiraUsernameByEmail(
      jiraHost,
      'john.doe@example.com',
      jiraToken,
    );
    expect(data).toEqual('John Doe');
  });

  it('getTicketDetails', async () => {
    const data = await getTicketDetails(jiraHost, 'ticket-id', jiraToken);
    expect(data?.status).toEqual('Backlog');
    expect(data?.assignee).toEqual('John Doe');
  });
});
