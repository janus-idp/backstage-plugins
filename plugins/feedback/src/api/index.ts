import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import { FeedbackType } from '../models/feedback.model';

export const feedbackApiRef = createApiRef<FeedbackAPI>({
  id: 'plugin.feedback.service',
});

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

type feedbackResp = {
  data?: FeedbackType;
  message?: string;
  error?: string;
};

type feedbacksResp = {
  data: FeedbackType[];
  count: number;
  currentPage: number;
  pageSize: number;
};

export class FeedbackAPI {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }

  async getAllFeedbacks(
    page: number,
    pageSize: number,
    projectId: string,
    searchText: string,
  ) {
    const baseUrl = await this.discoveryApi.getBaseUrl('feedback');
    const offset = (page - 1) * pageSize;
    const resp = await fetch(
      `${baseUrl}?query=${searchText}&offset=${offset}&limit=${pageSize}&projectId=${projectId}`,
    );
    const respData: feedbacksResp = await resp.json();
    return respData;
  }

  async getFeedbackById(feedbackId: string): Promise<feedbackResp> {
    const baseUrl = await this.discoveryApi.getBaseUrl('feedback');
    const resp = await fetch(`${baseUrl}/${feedbackId}`);
    const respData: feedbackResp = await resp.json();
    return respData;
  }

  async createFeedback(
    data: any,
  ): Promise<{ data?: {}; message?: string; error?: string }> {
    const baseUrl = await this.discoveryApi.getBaseUrl('feedback');
    const resp = await fetch(`${baseUrl}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const respData = await resp.json();
    return respData;
  }

  async getTicketDetails(
    feedbackId: string,
    ticketUrl: string,
    projectId: string,
  ): Promise<{ status: string; assignee: string; avatarUrls: any }> {
    const baseUrl = await this.discoveryApi.getBaseUrl('feedback');
    const ticketId = ticketUrl.split('/').at(-1);
    const resp = await fetch(
      `${baseUrl}/${feedbackId}/ticket?ticketId=${ticketId}&projectId=${projectId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const data = (await resp.json()).data;
    return {
      status: data.status,
      assignee: data.assignee,
      avatarUrls: data.avatarUrls,
    };
  }
}
