import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

import OpenAI from 'openai';
import { Stream } from 'openai/streaming';

export type LightspeedAPI = {
  createChatCompletions: (
    prompt: string,
  ) => Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
};

export const lightspeedApiRef = createApiRef<LightspeedAPI>({
  id: 'plugin.lightspeed.service',
});

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class LightspeedProxyClient implements LightspeedAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;
  private readonly openAIApi: OpenAI;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
    this.openAIApi = new OpenAI({
      baseURL: `${this.configApi.getString('backend.baseUrl')}/api/proxy/lightspeed/api`,

      // required but ignored
      apiKey: 'random-key',
      dangerouslyAllowBrowser: true,
    });
  }

  async getUserAuthorization() {
    const { token: idToken } = await this.identityApi.getCredentials();
    return idToken;
  }

  async createChatCompletions(prompt: string) {
    const idToken = await this.getUserAuthorization();
    return await this.openAIApi.chat.completions.create(
      {
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that can answer question in Red Hat Developer Hub.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'llama3',
        stream: true,
      },
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
  }
}
