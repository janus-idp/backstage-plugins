import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { InMemoryStore } from '@langchain/core/stores';

import { Roles } from '../service/types';
import { deleteHistory, loadHistory, saveHistory } from './chatHistory'; // adjust the path accordingly

const historyStore = new InMemoryStore<BaseMessage[]>();

const mockConversationId = 'user1+1q2w3e4r-qwer1234';

describe('Test History Functions', () => {
  afterEach(async () => {
    // Clear the history store before each test
    await deleteHistory(mockConversationId);
  });

  test('saveHistory should save a human message', async () => {
    const message = 'Hello, how are you?';

    await saveHistory(mockConversationId, Roles.HumanRole, message);

    const history = await loadHistory(mockConversationId, 10);
    expect(history.length).toBe(1);
    expect(history[0]).toBeInstanceOf(HumanMessage);
    expect(history[0].content).toBe(message);
  });

  test('saveHistory should save an AI message', async () => {
    const message = 'I am fine, thank you!';

    await saveHistory(mockConversationId, Roles.AIRole, message);

    const history = await loadHistory(mockConversationId, 10);

    expect(history.length).toBe(1);
    expect(history[0]).toBeInstanceOf(AIMessage);
    expect(history[0].content).toBe(message);
  });

  test('saveHistory and loadHistory with multiple messages', async () => {
    await saveHistory(mockConversationId, Roles.HumanRole, 'Hello');
    await saveHistory(
      mockConversationId,
      Roles.AIRole,
      'Hi! How can I help you today?',
    );

    const history = await loadHistory(mockConversationId, 10);
    expect(history.length).toBe(2);
    expect(history[0]).toBeInstanceOf(HumanMessage);
    expect(history[0].content).toBe('Hello');
    expect(history[1]).toBeInstanceOf(AIMessage);
    expect(history[1].content).toBe('Hi! How can I help you today?');
  });

  test('saveHistory and loadHistory with exact number of messages', async () => {
    await saveHistory(mockConversationId, Roles.HumanRole, 'Hello');
    await saveHistory(
      mockConversationId,
      Roles.AIRole,
      'Hi! How can I help you today?',
    );

    const history = await loadHistory(mockConversationId, 1);
    expect(history.length).toBe(1);
    expect(history[0]).toBeInstanceOf(AIMessage);
    expect(history[0].content).toBe('Hi! How can I help you today?');
  });

  test('saveHistory should throw an error for unknown roles', async () => {
    await expect(
      saveHistory(mockConversationId, 'UnknownRole', 'Message'),
    ).rejects.toThrow('Unknown role: UnknownRole');
  });

  test('deleteHistory should delete specific conversation', async () => {
    await saveHistory(mockConversationId, Roles.HumanRole, 'Hello');
    await saveHistory('conv2', Roles.AIRole, 'Hi! How can I help you today?');

    const history1 = await loadHistory(mockConversationId, 1);
    expect(history1.length).toBe(1);

    const history2 = await loadHistory('conv2', 1);
    expect(history2.length).toBe(1);

    await deleteHistory('conv2');
    expect(await loadHistory('conv2', 1)).toBe(undefined);

    expect(await loadHistory(mockConversationId, 1)).toBeDefined();
  });
});
