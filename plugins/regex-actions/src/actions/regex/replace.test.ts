import { getVoidLogger } from '@backstage/backend-common';

import mockFs from 'mock-fs';

import os from 'os';
import { Writable } from 'stream';

import { createReplaceAction } from './replace';

// When calling the action handler in a mock environment
// the schema (zod) validation does not get called for some reason.
// So, we cannot test with invalid inputs the schema would normally catch.

// NOTE: We only need to escape the backslashes for the testing environment.
// This is a JavaScript quirk with how it automatically serialize strings
// and removes unescaped characters.

describe('regex:replace', () => {
  const action = createReplaceAction();

  const logStream = {
    write: jest.fn(),
  } as jest.Mocked<Partial<Writable>> as jest.Mocked<Writable>;

  const mockTmpDir = os.tmpdir();
  const mockContext = {
    input: {},
    baseUrl: 'somebase',
    workspacePath: mockTmpDir,
    logger: getVoidLogger(),
    logStream,
    output: jest.fn(),
    createTemporaryDirectory: jest.fn().mockResolvedValue(mockTmpDir),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('should complete a simple regex', async () => {
    const input = {
      regExps: [
        {
          pattern: '^(\\S+).*$',
          replacement: '$1',
          values: [
            { key: 'eg1', value: 'Hello world!' },
            { key: 'eg2', value: 'Test world!' },
          ],
        },
      ],
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('values', {
      eg1: 'Hello',
      eg2: 'Test',
    });
  });

  it('should complete the String.prototype.replace() example', async () => {
    const value =
      'The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?';

    const input = {
      regExps: [
        {
          pattern: 'dog',
          replacement: 'monkey',
          values: [
            {
              key: 'eg1',
              value,
            },
          ],
        },
        {
          pattern: 'Dog',
          replacement: 'ferret',
          flags: ['i'] as any,
          values: [
            {
              key: 'eg2',
              value,
            },
          ],
        },
      ],
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('values', {
      eg1: 'The quick brown fox jumps over the lazy monkey. If the dog reacted, was it really lazy?',
      eg2: 'The quick brown fox jumps over the lazy ferret. If the dog reacted, was it really lazy?',
    });
  });

  it('should complete the String.prototype.replaceAll() example', async () => {
    const value =
      'The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?';

    const input = {
      regExps: [
        {
          pattern: 'dog',
          replacement: 'monkey',
          flags: ['g'] as any,
          values: [
            {
              key: 'eg1',
              value,
            },
          ],
        },
        {
          pattern: 'Dog',
          replacement: 'ferret',
          flags: ['g', 'i'] as any,
          values: [
            {
              key: 'eg2',
              value,
            },
          ],
        },
      ],
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('values', {
      eg1: 'The quick brown fox jumps over the lazy monkey. If the monkey reacted, was it really lazy?',
      eg2: 'The quick brown fox jumps over the lazy ferret. If the ferret reacted, was it really lazy?',
    });
  });

  it('should throw an error with duplicate keys', async () => {
    const input = {
      regExps: [
        {
          pattern: '^(\\S+).*$',
          replacement: '$1 test',
          values: [
            { key: 'eg1', value: 'Hello world!' },
            { key: 'eg1', value: 'Hello world!' },
          ],
        },
      ],
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(async () => {
      await action.handler(context);
    }).rejects.toThrow("The key 'eg1' is used more than once in the input.");
  });
});
