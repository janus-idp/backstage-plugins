import { AIMessage, HumanMessage } from '@langchain/core/messages';

import { Roles } from '../service/types';
import {
  deleteHistory,
  loadAllConversations,
  loadHistory,
  saveHistory,
  saveSummary,
} from './chatHistory';

const mockUser = 'user1';
const mockConversationId = `${mockUser}+1q2w3e4r-qwer1234`;

const mockConversationId2 = `${mockUser}+9i8u7y6t-654rew3`;

describe('Test History Functions', () => {
  afterEach(async () => {
    // Clear the history store before each test
    await deleteHistory(mockConversationId);
  });

  test('saveHistory should save a human message', async () => {
    const message = 'Hello, how are you?';

    await saveHistory(mockConversationId, Roles.HumanRole, message);

    const history = (await loadHistory(mockConversationId, 10)).history;
    expect(history.length).toBe(1);
    expect(history[0]).toBeInstanceOf(HumanMessage);
    expect(history[0].content).toBe(message);
  });

  test('saveHistory should save an AI message', async () => {
    const message = 'I am fine, thank you!';

    await saveHistory(mockConversationId, Roles.AIRole, message);

    const history = (await loadHistory(mockConversationId, 10)).history;

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

    const history = (await loadHistory(mockConversationId, 10)).history;
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

    const history = (await loadHistory(mockConversationId, 1)).history;
    expect(history.length).toBe(1);
    expect(history[0]).toBeInstanceOf(AIMessage);
    expect(history[0].content).toBe('Hi! How can I help you today?');
  });

  test('saveHistory should throw an error for unknown roles', async () => {
    await expect(
      saveHistory(mockConversationId, 'UnknownRole', 'Message'),
    ).rejects.toThrow('Unknown role: UnknownRole');
  });

  test('saveSummary should throw an error for unknown conversationId', async () => {
    await expect(
      saveSummary('UnknownConversationId', 'summary'),
    ).rejects.toThrow('unknown conversation_id: UnknownConversationId');
  });

  test('saveSummary should save a summary', async () => {
    const message = 'Hello, how are you?';
    const mockSummary = 'mock summary';

    await saveHistory(mockConversationId, Roles.HumanRole, message);
    await saveSummary(mockConversationId, mockSummary);

    const conversationHistory = await loadHistory(mockConversationId, 10);
    expect(conversationHistory.summary).toBe(mockSummary);
  });

  test('saveHistory should preserve previous summary', async () => {
    const message = 'Hello, how are you?';
    const mockSummary = 'mock summary';

    await saveHistory(mockConversationId, Roles.HumanRole, message);
    await saveSummary(mockConversationId, mockSummary);

    let conversationHistory = await loadHistory(mockConversationId, 10);
    expect(conversationHistory.history.length).toBe(1);
    expect(conversationHistory.summary).toBe(mockSummary);

    await saveHistory(
      mockConversationId,
      Roles.AIRole,
      'Hi! How can I help you today?',
    );
    conversationHistory = await loadHistory(mockConversationId, 10);
    expect(conversationHistory.history.length).toBe(2);
    expect(conversationHistory.summary).toBe(mockSummary);
  });

  test('loadAllConversations should return all conversation_id for given user_id', async () => {
    await saveHistory(mockConversationId, Roles.HumanRole, 'Hello');
    await saveHistory(
      mockConversationId,
      Roles.AIRole,
      'Hi! How can I help you today?',
    );

    await saveHistory(mockConversationId2, Roles.HumanRole, 'Hello');
    await saveHistory(
      mockConversationId2,
      Roles.AIRole,
      'Hi! How can I help you today?',
    );

    const conversationList = await loadAllConversations(mockUser);
    expect(conversationList.length).toBe(2);
    expect(
      conversationList.some(item => item.includes(mockConversationId)),
    ).toBe(true);
    expect(
      conversationList.some(item => item.includes(mockConversationId2)),
    ).toBe(true);
  });

  test('deleteHistory should delete specific conversation', async () => {
    await saveHistory(mockConversationId, Roles.HumanRole, 'Hello');
    await saveHistory('conv2', Roles.AIRole, 'Hi! How can I help you today?');

    const history1 = (await loadHistory(mockConversationId, 1)).history;
    expect(history1.length).toBe(1);

    const history2 = (await loadHistory('conv2', 1)).history;
    expect(history2.length).toBe(1);

    await deleteHistory('conv2');

    await expect(loadHistory('conv2', 1)).rejects.toThrow(
      'unknown conversation_id: conv2',
    );

    expect(await loadHistory(mockConversationId, 1)).toBeDefined();
  });

  test('deleteHistory should not return error with unknown id', async () => {
    await expect(() => deleteHistory(mockConversationId)).not.toThrow();
  });
});
