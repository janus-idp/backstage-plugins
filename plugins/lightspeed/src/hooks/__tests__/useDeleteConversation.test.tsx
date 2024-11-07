import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useDeleteConversation } from '../useDeleteConversation';

// Mocking the useApi and lightspeed API
jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

const mockDeleteConversation = jest.fn().mockResolvedValue({});
const mockGetQueryData = jest.fn();
const mockSetQueryData = jest.fn();
const mockCancelQueries = jest.fn();
const mockInvalidateQueries = jest.fn();

// Provide a query client with mock methods for cache manipulation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

queryClient.getQueryData = mockGetQueryData;
queryClient.setQueryData = mockSetQueryData;
queryClient.cancelQueries = mockCancelQueries;
queryClient.invalidateQueries = mockInvalidateQueries;

const wrapper = ({
  children,
}: {
  conversationId?: string;
  children?: React.ReactNode;
}): any => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockLightspeedApi = {
  getConversations: jest.fn(),
  getConversationMessages: jest.fn(),
};

(useApi as jest.Mock).mockReturnValue(mockLightspeedApi);
describe('useDeleteConversation', () => {
  beforeEach(() => {
    queryClient.clear();
    mockDeleteConversation.mockClear();
    mockGetQueryData.mockClear();
    mockSetQueryData.mockClear();
    mockCancelQueries.mockClear();
    mockInvalidateQueries.mockClear();

    // Mocking lightspeedApiRef and queryClient methods
    (useApi as jest.Mock).mockReturnValue({
      deleteConversation: mockDeleteConversation,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls deleteConversation API and updates cache correctly', async () => {
    const conversationId = 'test-id';
    const previousConversations = [{ conversation_id: conversationId }];

    mockGetQueryData.mockReturnValue(previousConversations);

    const { result } = renderHook(() => useDeleteConversation(), { wrapper });

    await act(async () => {
      await result.current.mutate({ conversation_id: conversationId });
    });

    expect(mockDeleteConversation).toHaveBeenCalledWith(conversationId);
    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: ['conversations'],
    });
    expect(mockSetQueryData).toHaveBeenCalledWith(
      ['conversations'],
      expect.any(Function),
    );
  });

  it('invalidates cache on success if invalidateCache is true', async () => {
    const conversationId = 'test-conv-id';

    const { result } = renderHook(() => useDeleteConversation(), { wrapper });

    await act(async () => {
      await result.current.mutate({
        conversation_id: conversationId,
        invalidateCache: true,
      });
    });

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['conversations'],
      });
    });
  });

  it('reverts cache on error', async () => {
    const conversationId = 'test-cache-error-id';
    const previousConversations = [{ conversation_id: conversationId }];

    mockGetQueryData.mockReturnValue(previousConversations);
    mockDeleteConversation.mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useDeleteConversation(), { wrapper });

    await act(async () => {
      await result.current.mutate({ conversation_id: conversationId });
    });

    expect(mockSetQueryData).toHaveBeenCalledWith(
      ['conversations'],
      previousConversations,
    );
  });
});
