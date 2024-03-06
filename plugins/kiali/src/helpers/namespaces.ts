export const nsEqual = (ns: string[], ns2: string[]): boolean => {
  return (
    ns.length === ns2.length &&
    ns.every((value: any, index: number) => value === ns2[index])
  );
};
