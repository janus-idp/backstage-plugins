export const getCurrentTimestamp = (date?: Date) => {
  const dateObj = date || new Date(Date.now());
  return `${dateObj.toLocaleDateString()}, ${dateObj.toLocaleTimeString('en-US')}`;
};
