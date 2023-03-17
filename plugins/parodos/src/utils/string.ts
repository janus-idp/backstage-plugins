export function capitalize(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
}

export function taskDisplayName(taskName: string): string {
  return taskName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(capitalize)
    .join(' ');
}
