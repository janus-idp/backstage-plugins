import { ConfigApi, IdentityApi } from '@backstage/core-plugin-api';

import { LightspeedAPI } from './api';

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class LightspeedApiClient implements LightspeedAPI {
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  async getBaseUrl() {
    return `${this.configApi.getString('backend.baseUrl')}/api/lightspeed`;
  }

  getServerUrl() {
    // Currently supports a single llm server
    return `${this.configApi.getConfigArray('lightspeed.servers')[0].getOptionalString('url')}`;
  }

  async getUserAuthorization() {
    const { token: idToken } = await this.identityApi.getCredentials();
    return idToken;
  }

  async createChatCompletions(
    prompt: string,
    selectedModel: string,
    conversation_id: string,
  ) {
    await this.createConversation();
    const baseUrl = await this.getBaseUrl();
    const token = await this.getUserAuthorization();

    const response = await fetch(`${baseUrl}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        conversation_id,
        serverURL: this.getServerUrl(),
        model: selectedModel,
        query: prompt,
        historyLength: 10,
      }),
    });

    if (!response.body) {
      throw new Error('Readable stream is not supported or there is no body.');
    }

    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return response.body.getReader();
  }

  async createConversation() {
    const baseUrl = await this.getBaseUrl();
    const token = await this.getUserAuthorization();

    const response = await fetch(`${baseUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({}),
    });

    if (!response.body) {
      throw new Error('Readable stream is not supported or there is no body.');
    }

    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    const result = await response.json();
    return result;
  }

  private async fetcher(url: string) {
    const token = await this.getUserAuthorization();

    const response = await fetch(url, {
      headers: token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return response;
  }

  async getAllModels() {
    const baseUrl = await this.getBaseUrl();
    const result = await this.fetcher(`${baseUrl}/v1/models`);
    const response = await result.json();
    return response?.data ? response.data : [];
  }

  async getConversations(conversation_id: string) {
    const baseUrl = await this.getBaseUrl();
    const result = await this.fetcher(
      `${baseUrl}/conversations/${encodeURIComponent(conversation_id)}`,
    );
    return await result.json();
  }
}
