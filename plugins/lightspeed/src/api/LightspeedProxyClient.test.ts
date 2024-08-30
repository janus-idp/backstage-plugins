import { ConfigApi, IdentityApi } from '@backstage/core-plugin-api';

import OpenAI from 'openai';

import { LightspeedProxyClient, Options } from './LightspeedProxyClient';

jest.mock('openai');

describe('LightspeedProxyClient', () => {
  let configApi: jest.Mocked<ConfigApi>;
  let identityApi: jest.Mocked<IdentityApi>;
  let lightspeedClient: LightspeedProxyClient;
  let mockCreateChatCompletion: jest.Mock;

  beforeEach(() => {
    configApi = {
      getString: jest.fn().mockReturnValue('http://localhost:7007'),
    } as unknown as jest.Mocked<ConfigApi>;

    identityApi = {
      getCredentials: jest.fn().mockResolvedValue({ token: 'mock-token' }),
    } as unknown as jest.Mocked<IdentityApi>;

    const options: Options = { configApi, identityApi };
    lightspeedClient = new LightspeedProxyClient(options);

    mockCreateChatCompletion = jest.fn().mockResolvedValue({} as any);
    const mockOpenAI = new OpenAI({});
    mockOpenAI.chat = {
      completions: {
        create: mockCreateChatCompletion,
      },
    } as any;

    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAI);
  });

  describe('constructor', () => {
    it('should initialize the client with the correct baseURL', () => {
      expect(OpenAI).toHaveBeenCalledWith({
        baseURL: 'http://localhost:7007/api/proxy/lightspeed/api',
        apiKey: 'random-key',
        dangerouslyAllowBrowser: true,
      });
    });
  });

  describe('getUserAuthorization', () => {
    it('should return the idToken from identityApi', async () => {
      const token = await lightspeedClient.getUserAuthorization();
      expect(token).toBe('mock-token');
      expect(identityApi.getCredentials).toHaveBeenCalledTimes(1);
    });
  });

  describe('createChatCompletions', () => {
    it('should call openAIApi.chat.completions.create with correct parameters', async () => {
      const prompt = 'Test prompt';
      await lightspeedClient.createChatCompletions(prompt, 'llama3');

      expect(mockCreateChatCompletion).toHaveBeenCalledWith(
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
            Authorization: 'Bearer mock-token',
          },
        },
      );
    });

    it('should not include Authorization header if idToken is not available', async () => {
      identityApi.getCredentials.mockResolvedValueOnce({ token: undefined });

      const prompt = 'Test prompt';
      await lightspeedClient.createChatCompletions(prompt, 'llama3');

      expect(mockCreateChatCompletion).toHaveBeenCalledWith(
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
          headers: {},
        },
      );
    });
  });
});
