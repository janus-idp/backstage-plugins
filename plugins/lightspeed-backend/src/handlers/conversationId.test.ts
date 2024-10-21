import {
  generateConversationId,
  getUserId,
  INVALID_FORTMAT_ERROR,
  validateUserRequest,
} from './conversationId';

const mockUser = `user1`;
const mockUser1ConversationId = 'user1+1q2w3e4rqwer1234';
const mockUser2ConversationId = 'user2+1kluA927dg2on22w';

function isAlphanumeric(str: string) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

describe('Test conversation_id Functions', () => {
  test('generateConversationId should return random string', async () => {
    const conversation_id1 = generateConversationId(mockUser);
    const conversation_id2 = generateConversationId(mockUser);
    expect(conversation_id1.length).toEqual(conversation_id2.length);
    expect(conversation_id1.length).toBe(mockUser.length + 17); // user_id length + `+` + 16-character session_id
    expect(conversation_id1).not.toBe(conversation_id2);
    const [user_id1, session_id1] = conversation_id1.split('+');
    const [user_id2, session_id2] = conversation_id2.split('+');
    expect(isAlphanumeric(session_id1)).toBe(true);
    expect(isAlphanumeric(session_id2)).toBe(true);

    expect(user_id1).toBe(user_id2);
  });

  test('getUserId should return currect user_Id', async () => {
    const user_Id = getUserId(mockUser1ConversationId);
    expect(user_Id).toEqual(mockUser);
  });

  test('getUserId should throw an error on invalid format', async () => {
    expect(() => getUserId('user1-293819dncjdd2Sc1')).toThrow(
      INVALID_FORTMAT_ERROR,
    );
  });

  test('validateUserRequest should not throw error on valid request', async () => {
    expect(() =>
      validateUserRequest(mockUser1ConversationId, mockUser),
    ).not.toThrow();
  });

  test('validateUserRequest should return false on different user', async () => {
    expect(() =>
      validateUserRequest(mockUser2ConversationId, mockUser),
    ).toThrow();
  });
});
