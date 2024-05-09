export const convertLabelsToObject = (
  labelsString: string | undefined,
): { [key: string]: string } => {
  const result: { [key: string]: string } = {};

  if (!labelsString || labelsString.indexOf('=') === -1) {
    console.error(
      "Invalid label string. Label string must contain at least one label separated by '=' character.",
    );
    return result;
  }

  const labelsArray = labelsString.split(';');

  labelsArray.forEach(label => {
    const separatorIndex = label.indexOf('=');
    if (separatorIndex !== -1) {
      const key = label.slice(0, separatorIndex).trim();
      const value = label.slice(separatorIndex + 1).trim();
      if (key && value) {
        result[key] = value;
      }
    } else {
      console.error(
        `Invalid label: '${label}'. Label must contain at least one '=' character.`,
      );
    }
  });

  return result;
};
