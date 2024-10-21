const SESSION_ID_LENGTH = 16;
export const INVALID_FORTMAT_ERROR =
  'Invalid format: Must be in <user_id>+<session_id> format';

function generateSessionId(length = SESSION_ID_LENGTH) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  }).join('');
}

export function generateConversationId(user_id: string) {
  const session_id = generateSessionId();
  return `${user_id}+${session_id}`;
}

export function getUserId(conversation_id: string) {
  const [user_id, session_id] = conversation_id.split('+');

  // Check if both userId and sessionId are present
  if (user_id && session_id) {
    return user_id;
  }
  throw new Error(INVALID_FORTMAT_ERROR);
}

export function validateUserRequest(conversation_id: string, user_id: string) {
  const requestUserId = getUserId(conversation_id);
  if (requestUserId === user_id) {
    return;
  }
  throw new Error(
    `Invalid request: requested conversation_id: ${conversation_id} does not belong to authenticated user ${user_id}`,
  );
}
