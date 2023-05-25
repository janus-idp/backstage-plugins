export const kindToAbbr = (kind: string) =>
  (kind.replace(/[^A-Z]/g, '') || kind.toUpperCase()).slice(0, 4);
