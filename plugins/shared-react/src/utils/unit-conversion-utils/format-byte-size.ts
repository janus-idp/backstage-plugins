import { create, createUnitDependencies, unitDependencies } from 'mathjs';

const math = create({ createUnitDependencies, unitDependencies });

// https://mathjs.org/docs/datatypes/units.html#prefixes
const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const;

export function formatByteSize(sizeInBytes: number | undefined): string {
  if (!sizeInBytes) {
    return 'N/A';
  }

  // Math.log10(1_000) === 3
  const i = Math.floor(Math.log10(sizeInBytes) / 3);

  // Base 10 prefixes are more common when purchasing storage.
  // math.unit bytes default to base 2 prefixes (e.g. 1 KiB = 1024 B).
  // Therefore we need to change to base 10 prefixes (e.g. 1 kB = 1000 B).
  const fileSize = math
    .unit(sizeInBytes, 'B')
    .to(UNITS[i])
    .format({ precision: 3, notation: 'auto' });

  return fileSize;
}
