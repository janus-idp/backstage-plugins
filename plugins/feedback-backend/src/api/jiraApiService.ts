import axios from 'axios';

export const createJiraTicket = async (options: {
  host: string;
  authToken: string;
  projectKey: string;
  summary: string;
  description: string;
  tag: string;
  feedbackType: string;
  reporter?: string;
}): Promise<any> => {
  const {
    host,
    authToken,
    projectKey,
    summary,
    description,
    tag,
    feedbackType,
    reporter,
  } = options;
  const requestBody = {
    fields: {
      ...(reporter && {
        reporter: {
          name: reporter,
        },
      }),
      project: {
        key: projectKey,
      },
      summary: summary,
      description: description,
      labels: ['reported-by-backstage', tag.toLowerCase().split(' ').join('-')],
      issuetype: {
        name: feedbackType === 'BUG' ? 'Bug' : 'Task',
      },
    },
  };
  const resp = await axios.post(`${host}/rest/api/latest/issue`, requestBody, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  return resp.data;
};

export const getJiraUsernameByEmail = async (
  host: string,
  reporterEmail: string,
  authToken: string,
): Promise<string | undefined> => {
  const resp = await axios.get(
    `${host}/rest/api/latest/user/search?username=${reporterEmail}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
  const data = resp.data;
  if (data.length === 0) return undefined;
  return data[0].name;
};

export const getTicketDetails = async (
  host: string,
  ticketId: string,
  authToken: string,
): Promise<
  { status: string; assignee: string; avatarUrls: {} } | undefined
> => {
  const resp = await axios.get(`${host}/rest/api/latest/issue/${ticketId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return {
    status: resp.data.fields.status.name,
    assignee: resp.data.fields.assignee
      ? resp.data.fields.assignee.displayName
      : null,
    avatarUrls: resp.data.fields.assignee
      ? resp.data.fields.assignee.avatarUrls
      : null,
  };
};
