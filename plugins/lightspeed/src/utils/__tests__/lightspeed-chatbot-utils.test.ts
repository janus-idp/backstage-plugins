import { ConversationList, ConversationSummary } from '../../types';
import {
  createBotMessage,
  createMessage,
  createUserMessage,
  getCategorizeMessages,
  getMessageData,
  getTimestamp,
  getTimestampVariablesString,
  splitJsonStrings,
} from '../lightspeed-chatbox-utils';

describe('getTimestampVariablesString', () => {
  it('should add a leading zero if the number is less than 10', () => {
    expect(getTimestampVariablesString(5)).toBe('05');
  });

  it('should return the number as a string if it is 10 or greater', () => {
    expect(getTimestampVariablesString(10)).toBe('10');
    expect(getTimestampVariablesString(23)).toBe('23');
  });
});

describe('getTimestamp', () => {
  it('should format a given timestamp correctly', () => {
    const unixTimestamp = 1609459200000; // 01 Jan 2021 00:00:00 UTC
    const result = getTimestamp(unixTimestamp);
    expect(result).toBe('01/01/2021, 00:00:00');
  });

  it('should handle single-digit day, month, hour, minute, and second', () => {
    const unixTimestamp = new Date(2024, 0, 5, 3, 7, 9).getTime(); // 05 Jan 2024 03:07:09
    const result = getTimestamp(unixTimestamp);
    expect(result).toBe('05/01/2024, 03:07:09');
  });

  it('should handle end-of-year timestamps correctly', () => {
    const unixTimestamp = new Date(2024, 11, 31, 23, 59, 59).getTime(); // 31 Dec 2024 23:59:59
    const result = getTimestamp(unixTimestamp);
    expect(result).toBe('31/12/2024, 23:59:59');
  });

  it('should handle the beginning of the epoch (0 timestamp)', () => {
    const unixTimestamp = 0; // 01 Jan 1970 00:00:00 UTC
    const result = getTimestamp(unixTimestamp);
    expect(result).toBe('01/01/1970, 00:00:00');
  });

  it('should handle timestamps with daylight saving time shifts', () => {
    const unixTimestamp = new Date(2024, 2, 14, 2, 30, 0).getTime(); // 14 Mar 2024 02:30:00 (DST transition for some regions)
    const result = getTimestamp(unixTimestamp);
    expect(result).toBe('14/03/2024, 02:30:00');
  });
});

describe('splitJsonStrings', () => {
  it('should return the entire string in an array if no `}{` pattern is found', () => {
    const jsonString = '{"key1":"value1","key2":"value2"}';
    const result = splitJsonStrings(jsonString);
    expect(result).toEqual([jsonString]);
  });

  it('should split a concatenated JSON string into individual JSON strings', () => {
    const jsonString = '{"key1":"value1"}{"key2":"value2"}{"key3":"value3"}';
    const result = splitJsonStrings(jsonString);
    expect(result).toEqual([
      '{"key1":"value1"}',
      '{"key2":"value2"}',
      '{"key3":"value3"}',
    ]);
  });

  it('should handle a JSON string with multiple concatenated objects correctly', () => {
    const jsonString =
      '{"key1":"value1"}{"key2":"value2"}{"key3":"value3"}{"key4":"value4"}';
    const result = splitJsonStrings(jsonString);
    expect(result).toEqual([
      '{"key1":"value1"}',
      '{"key2":"value2"}',
      '{"key3":"value3"}',
      '{"key4":"value4"}',
    ]);
  });

  it('should handle a JSON string with edge case of empty objects', () => {
    const jsonString = '{}{}';
    const result = splitJsonStrings(jsonString);
    expect(result).toEqual(['{}', '{}']);
  });

  it('should handle a JSON string with nested braces correctly', () => {
    const jsonString = '{"key1":{"subKey":"subValue"}}{"key2":"value2"}';
    const result = splitJsonStrings(jsonString);
    expect(result).toEqual([
      '{"key1":{"subKey":"subValue"}}',
      '{"key2":"value2"}',
    ]);
  });
});

describe('createMessage', () => {
  it('should create a user message with default values', () => {
    const message = createMessage({
      role: 'user',
      content: 'Hello',
      timestamp: '2024-10-30T10:00:00Z',
    });
    expect(message).toEqual({
      role: 'user',
      name: 'Guest',
      avatar: undefined,
      isLoading: false,
      content: 'Hello',
      timestamp: '2024-10-30T10:00:00Z',
    });
  });

  it('should create a bot message with custom values', () => {
    const message = createMessage({
      role: 'bot',
      name: 'Bot',
      avatar: 'bot-avatar.png',
      isLoading: true,
      content: 'Hello from bot',
      timestamp: '2024-10-30T11:00:00Z',
    });
    expect(message).toEqual({
      role: 'bot',
      name: 'Bot',
      avatar: 'bot-avatar.png',
      isLoading: true,
      content: 'Hello from bot',
      timestamp: '2024-10-30T11:00:00Z',
    });
  });
});

describe('createUserMessage', () => {
  it('should create a user message with default name if name is not provided', () => {
    const message = createUserMessage({
      content: 'User message',
      timestamp: '2024-10-30T12:00:00Z',
    });
    expect(message).toEqual({
      role: 'user',
      name: 'Guest',
      avatar: undefined,
      isLoading: false,
      content: 'User message',
      timestamp: '2024-10-30T12:00:00Z',
    });
  });

  it('should create a user message with provided name', () => {
    const message = createUserMessage({
      name: 'John',
      avatar: 'alice-avatar.png',
      content: 'Hello, this is John',
      timestamp: '2024-10-30T13:00:00Z',
    });
    expect(message).toEqual({
      role: 'user',
      name: 'John',
      avatar: 'alice-avatar.png',
      isLoading: false,
      content: 'Hello, this is John',
      timestamp: '2024-10-30T13:00:00Z',
    });
  });
});

describe('createBotMessage', () => {
  it('should create a bot message with provided properties', () => {
    const message = createBotMessage({
      name: 'BotMaster',
      avatar: 'bot-avatar.png',
      content: 'Bot message content',
      timestamp: '2024-10-30T14:00:00Z',
      isLoading: true,
    });
    expect(message).toEqual({
      role: 'bot',
      name: 'BotMaster',
      avatar: 'bot-avatar.png',
      isLoading: true,
      content: 'Bot message content',
      timestamp: '2024-10-30T14:00:00Z',
    });
  });
});

describe('getMessageData', () => {
  it('should return content and timestamp from message.kwargs', () => {
    const message = {
      kwargs: {
        content: 'This is the message content',
        response_metadata: {
          created_at: 1730121598867,
        },
      },
    };
    const result = getMessageData(message as any);
    expect(result).toEqual({
      content: 'This is the message content',
      timestamp: '28/10/2024, 13:19:58',
    });
  });

  it('should handle missing kwargs properties gracefully', () => {
    const message = {};
    const result = getMessageData(message as any);
    expect(result).toEqual({
      content: '',
      timestamp: '',
    });
  });
});

describe('getCategorizeMessages', () => {
  const addProps = (c: ConversationSummary) => ({
    customProp: `prop-${c.conversation_id}`,
  });

  const messages: ConversationList = [
    {
      conversation_id: '1',
      lastMessageTimestamp: new Date().toISOString(),
      summary: 'Today message',
    },
    {
      conversation_id: '2',
      lastMessageTimestamp: new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString() as any,
      summary: 'Yesterday message',
    },
    {
      conversation_id: '3',
      lastMessageTimestamp: new Date(
        Date.now() - 5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      summary: '5 days ago',
    },
    {
      conversation_id: '4',
      lastMessageTimestamp: new Date(
        Date.now() - 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      summary: '15 days ago',
    },
    {
      conversation_id: '5',
      lastMessageTimestamp: new Date(
        Date.now() - 45 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      summary: '45 days ago',
    },
  ];

  it('categorizes messages correctly', () => {
    const result = getCategorizeMessages(messages, addProps);

    expect(result.Today).toHaveLength(1);
    expect(result.Today[0].text).toBe('Today message');

    expect(result.Yesterday).toHaveLength(1);
    expect(result.Yesterday[0].text).toBe('Yesterday message');

    expect(result['Previous 7 Days']).toHaveLength(1);
    expect(result['Previous 7 Days'][0].text).toBe('5 days ago');

    expect(result['Previous 30 Days']).toHaveLength(1);
    expect(result['Previous 30 Days'][0].text).toBe('15 days ago');

    const monthYearKey = new Date(
      messages[4].lastMessageTimestamp,
    ).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    expect(result[monthYearKey]).toHaveLength(1);
    expect(result[monthYearKey][0].text).toBe('45 days ago');
  });
});
