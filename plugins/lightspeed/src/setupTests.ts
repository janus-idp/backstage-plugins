import '@testing-library/jest-dom';

// eslint-disable-next-line no-restricted-imports
import { TextDecoder, TextEncoder } from 'util';

// Also used in browser-based APIs for hashing.
Object.defineProperty(global.self, 'TextEncoder', {
  value: TextEncoder,
});

Object.defineProperty(global.self, 'TextDecoder', {
  value: TextDecoder,
});
