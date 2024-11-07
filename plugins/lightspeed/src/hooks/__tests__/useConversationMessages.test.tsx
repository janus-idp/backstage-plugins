import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { getTimestamp } from '../../utils/lightspeed-chatbox-utils';
import {
  useConversationMessages,
  useFetchConversationMessages,
} from '../useConversationMessages';

jest.mock('../../utils/lightspeed-chatbox-utils', () => ({
  ...jest.requireActual('../../utils/lightspeed-chatbox-utils'),
  getTimestamp: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

const mockLightspeedApi = {
  getConversations: jest.fn(),
  getConversationMessages: jest.fn(),
};

(useApi as jest.Mock).mockReturnValue(mockLightspeedApi);

// Create a query client with no retries for test purposes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      experimental_prefetchInRender: true,
    },
  },
});

const wrapper = ({
  children,
}: {
  conversationId?: string;
  children?: React.ReactNode;
}): any => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFetchConversations', () => {
  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should return conversations data when fetch is successful', async () => {
    const mockData = [{ id: '1', content: 'Hello' }];
    mockLightspeedApi.getConversationMessages.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useFetchConversationMessages('123'), {
      wrapper,
    });

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(mockLightspeedApi.getConversationMessages).toHaveBeenCalledWith(
      '123',
    );
  });

  it('should handle loading state', async () => {
    mockLightspeedApi.getConversationMessages.mockImplementation(
      () => new Promise(() => {}),
    );

    const { result } = renderHook(() => useFetchConversationMessages('123'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
  });

  it('should handle errors', async () => {
    mockLightspeedApi.getConversationMessages.mockImplementation(
      () => new Promise(() => {}),
    );
    const errorMessage = 'Failed to fetch conversations';
    mockLightspeedApi.getConversationMessages.mockRejectedValueOnce(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useFetchConversationMessages('123'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message ?? '').toBe(errorMessage);
  });
});

describe('useConversationMesages', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should initialize conversations with the given conversationId', () => {
    const { result } = renderHook(
      () =>
        useConversationMessages(
          'testConversationId',
          'test-user',
          'gpt-3',
          'avatar.png',
        ),
      {
        wrapper,
      },
    );

    expect(result.current.conversations).toEqual({
      testConversationId: [],
    });
  });

  it('should update current conversation when conversationId changes', () => {
    const { result, rerender } = renderHook(
      ({ conversationId }: { conversationId: any }) =>
        useConversationMessages(
          conversationId,
          'test-user-id',
          'gpt-3',
          'avatar.png',
        ),
      {
        wrapper,
        initialProps: { conversationId: 'initialConversationId' },
      },
    );

    expect(result.current.conversations).toEqual({
      initialConversationId: [],
    });

    rerender({ conversationId: 'updatedConversationId' });

    expect(result.current.conversations).toEqual({
      updatedConversationId: [],
    });
  });

  it('should call onComplete when streaming is done', async () => {
    const onComplete = jest.fn();

    const lightSpeedApi = {
      createMessage: jest.fn().mockResolvedValue({
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              '{"response":{"kwargs":{"content":"Hi test-user!"}}}',
            ),
          })
          .mockResolvedValueOnce({ done: true, value: null }),
      }),
    };

    (useApi as jest.Mock).mockReturnValue(lightSpeedApi);

    const { result } = renderHook(
      () =>
        useConversationMessages(
          'initialConversationId',
          'test-user',
          'gpt-3',
          'user.png',
          onComplete,
        ),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.handleInputPrompt('Hello there!');
    });

    expect(onComplete).toHaveBeenCalledWith('Hi test-user!');
  });

  it('should handle the invalid json error', async () => {
    const onComplete = jest.fn();

    const mockApi = {
      createMessage: jest.fn().mockResolvedValue({
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              '{"response":{"kwargs":{"content":"{{"key": "value"} }}}',
            ),
          })
          .mockResolvedValueOnce({ done: true, value: null }),
      }),
    };

    (useApi as jest.Mock).mockReturnValue(mockApi);

    const { result } = renderHook(
      () =>
        useConversationMessages(
          'testId',
          'test-user',
          'gpt-3',
          'user.png',
          onComplete,
        ),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.handleInputPrompt('Hello there!');
    });

    expect(onComplete).toHaveBeenCalledWith('Invalid JSON received');
  });

  it('should handle input prompt and update conversations with user and bot messages', async () => {
    const mockApi = {
      createMessage: jest.fn().mockResolvedValue({
        read: jest.fn().mockResolvedValue({ done: true, value: null }),
      }),
    };
    (useApi as jest.Mock).mockReturnValue(mockApi);

    const { result } = renderHook(
      () =>
        useConversationMessages(
          'testConversationId',
          'test-user',
          'gpt-3',
          'avatar.png',
        ),
      {
        wrapper,
      },
    );

    const prompt = 'Hello, how are you?';
    const userTimestamp = '01/01/2024, 10:00:00';
    const botTimestamp = '01/01/2024, 10:00:01';

    (getTimestamp as jest.Mock)
      .mockReturnValueOnce(userTimestamp)
      .mockReturnValueOnce(botTimestamp);

    await act(async () => {
      await result.current.handleInputPrompt(prompt);
    });

    expect(result.current.conversations.testConversationId).toEqual([
      {
        role: 'user',
        content: prompt,
        timestamp: userTimestamp,
        avatar: 'avatar.png',
        name: 'test-user',
        isLoading: false,
      },
      {
        role: 'bot',
        content: '',
        timestamp: '',
        avatar: 'logo.svg',
        name: 'gpt-3',
        isLoading: true,
      },
    ]);

    expect(mockApi.createMessage).toHaveBeenCalledWith(
      prompt,
      'gpt-3',
      'testConversationId',
    );
  });

  it('should update last bot message in conversation after API response', async () => {
    const mockApi = {
      createMessage: jest.fn().mockResolvedValue({
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              '{"response":{"kwargs":{"content":"Hi test-user!"}}}',
            ),
          })
          .mockResolvedValueOnce({ done: true, value: null }),
      }),
    };

    (useApi as jest.Mock).mockReturnValue(mockApi);

    const { result } = renderHook(
      () =>
        useConversationMessages(
          'testConversationId',
          'test-user',
          'gpt-3',
          'avatar.png',
        ),
      { wrapper },
    );

    const prompt = 'Hello, how are you?';

    await act(async () => {
      await result.current.handleInputPrompt(prompt);
    });

    await waitFor(() => {
      expect(result.current.conversations.testConversationId).toEqual([
        expect.objectContaining({
          role: 'user',
          content: prompt,
        }),
        expect.objectContaining({
          role: 'bot',
          content: 'Hi test-user!',
          isLoading: false,
        }),
      ]);
    });
  });

  it('should surface API error if last bot message failed', async () => {
    const mockLsApiClient = {
      createMessage: jest
        .fn()
        .mockRejectedValue(new Error('Failed to create message')),
    };

    (useApi as jest.Mock).mockReturnValue(mockLsApiClient);

    const { result } = renderHook(
      () =>
        useConversationMessages(
          'testConversationID',
          'test-user',
          'gpt-3',
          'avatar.png',
        ),
      { wrapper },
    );

    const prompt = 'what is json?';

    await act(async () => {
      await result.current.handleInputPrompt(prompt);
    });

    await waitFor(() => {
      expect(result.current.conversations.testConversationID).toEqual([
        expect.objectContaining({
          role: 'user',
          content: prompt,
        }),
        expect.objectContaining({
          role: 'bot',
          content: 'Error: Failed to create message',
          isLoading: false,
        }),
      ]);
    });
  });

  it('should have scrollToBottomRef defined', async () => {
    const mockData = [
      {
        id: ['HumanMessage'],
        kwargs: {
          content: 'Hello!',
          response_metadata: {
            created_at: 1609459200000,
          },
        },
      },
      {
        id: ['AiMessage'],
        kwargs: {
          content: 'Hi, How are you!',
          response_metadata: {
            created_at: 1609459200000,
          },
        },
      },
    ];

    const mockLsApi = {
      getConversationMessages: jest.fn().mockResolvedValue(mockData),
    };

    (useApi as jest.Mock).mockReturnValue(mockLsApi);

    const { result } = renderHook(
      () =>
        useConversationMessages(
          'testConversationId',
          'test-user',
          'gpt-3',
          'avatar.png',
        ),
      {
        wrapper,
      },
    );
    await waitFor(() => {
      expect(result.current.conversations.testConversationId).toHaveLength(2);
      expect(result.current.scrollToBottomRef).toBeDefined();
    });
  });
});
