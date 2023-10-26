/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ErrorLike } from '@backstage/errors';

import os from 'os';
import { Worker } from 'worker_threads';

const defaultParallelism = Math.ceil(os.cpus().length / 2);

const PARALLEL_ENV_VAR = 'BACKSTAGE_CLI_BUILD_PARALLEL';

export type ParallelismOption = boolean | string | number | null | undefined;

export function parseParallelismOption(parallel: ParallelismOption): number {
  if (parallel === undefined || parallel === null) {
    return defaultParallelism;
  } else if (typeof parallel === 'boolean') {
    return parallel ? defaultParallelism : 1;
  } else if (typeof parallel === 'number' && Number.isInteger(parallel)) {
    if (parallel < 1) {
      return 1;
    }
    return parallel;
  } else if (typeof parallel === 'string') {
    if (parallel === 'true') {
      return parseParallelismOption(true);
    } else if (parallel === 'false') {
      return parseParallelismOption(false);
    }
    const parsed = Number(parallel);
    if (Number.isInteger(parsed)) {
      return parseParallelismOption(parsed);
    }
  }

  throw Error(
    `Parallel option value '${parallel}' is not a boolean or integer`,
  );
}

export function getEnvironmentParallelism() {
  return parseParallelismOption(process.env[PARALLEL_ENV_VAR]);
}

type WorkerThreadMessage =
  | {
      type: 'done';
    }
  | {
      type: 'item';
      index: number;
      item: unknown;
    }
  | {
      type: 'start';
    }
  | {
      type: 'result';
      index: number;
      result: unknown;
    }
  | {
      type: 'error';
      error: ErrorLike;
    }
  | {
      type: 'message';
      message: unknown;
    };

export type WorkerThreadsOptions<TResult, TData, TMessage> = {
  /**
   * A function that is called by each worker thread to produce a result.
   *
   * This function must be defined as an arrow function or using the
   * function keyword, and must be entirely self contained, not referencing
   * any variables outside of its scope. This is because the function source
   * is stringified and evaluated in the worker thread.
   *
   * To pass data to the worker, use the `workerData` option, but
   * note that they are both copied by value into the worker thread, except for
   * types that are explicitly shareable across threads, such as `SharedArrayBuffer`.
   */
  worker: (
    data: TData,
    sendMessage: (message: TMessage) => void,
  ) => Promise<TResult>;
  /** Data supplied to each worker */
  workerData?: TData;
  /** Number of threads, defaults to 1 */
  threadCount?: number;
  /** An optional handler for messages posted from the worker thread */
  onMessage?: (message: TMessage) => void;
};

/**
 * Spawns one or more worker threads using the `worker_threads` module.
 */
export async function runWorkerThreads<TResult, TData, TMessage>(
  options: WorkerThreadsOptions<TResult, TData, TMessage>,
): Promise<TResult[]> {
  const { worker, workerData, threadCount = 1, onMessage } = options;

  return Promise.all(
    Array(threadCount)
      .fill(0)
      .map(async () => {
        const thread = new Worker(`(${workerThread})(${worker})`, {
          eval: true,
          workerData,
        });

        return new Promise<TResult>((resolve, reject) => {
          thread.on('message', (message: WorkerThreadMessage) => {
            if (message.type === 'result') {
              resolve(message.result as TResult);
            } else if (message.type === 'error') {
              reject(message.error);
            } else if (message.type === 'message') {
              onMessage?.(message.message as TMessage);
            }
          });

          thread.on('error', reject);
          thread.on('exit', (code: number) => {
            reject(
              new Error(`Unexpected worker thread exit with code ${code}`),
            );
          });
        });
      }),
  );
}

/* istanbul ignore next */
function workerThread(
  workerFunc: (
    data: unknown,
    sendMessage: (message: unknown) => void,
  ) => Promise<unknown>,
) {
  const { parentPort, workerData } = require('worker_threads');

  const sendMessage = (message: unknown) => {
    parentPort.postMessage({ type: 'message', message });
  };

  workerFunc(workerData, sendMessage).then(
    result => {
      parentPort.postMessage({
        type: 'result',
        index: 0,
        result,
      });
    },
    error => {
      parentPort.postMessage({ type: 'error', error });
    },
  );
}
