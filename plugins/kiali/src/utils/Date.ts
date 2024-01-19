export const toLocaleStringWithConditionalDate = (date: Date): string => {
  const nowDate = new Date().toLocaleDateString();
  const thisDate = date.toLocaleDateString();
  return nowDate === thisDate
    ? date.toLocaleTimeString()
    : date.toLocaleString();
};
