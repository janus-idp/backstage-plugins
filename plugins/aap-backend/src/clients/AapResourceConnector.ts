import { JobTemplates } from './types';

export async function listJobTemplates(
  baseUrl: string,
  access_token: string,
): Promise<JobTemplates> {
  const res = await fetch(`${baseUrl}/api/v2/job_templates`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: access_token,
    },
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const data = (await res.json()) as { results: JobTemplates };

  return data.results;
}

export async function listWorkflowJobTemplates(
  baseUrl: string,
  access_token: string,
): Promise<JobTemplates> {
  const res = await fetch(`${baseUrl}/api/v2/workflow_job_templates`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: access_token,
    },
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const data = (await res.json()) as { results: JobTemplates };

  return data.results;
}
