import { Config } from '@backstage/config';

import fs from 'fs-extra';
import { Logger } from 'winston';

import os from 'os';

export async function getWorkingDirectory(
  config: Config,
  logger: Logger,
): Promise<string> {
  if (!config.has('backend.workingDirectory')) {
    return os.tmpdir();
  }

  const workingDirectory = config.getString('backend.workingDirectory');
  try {
    // Check if working directory exists and is writable
    await fs.access(workingDirectory, fs.constants.F_OK | fs.constants.W_OK);
    logger.info(`using working directory: ${workingDirectory}`);
  } catch (err: any) {
    logger.error(
      `working directory ${workingDirectory} ${
        err.code === 'ENOENT' ? 'does not exist' : 'is not writable'
      }`,
    );
    throw err;
  }
  return workingDirectory;
}

export async function executeWithRetry(
  action: () => Promise<Response>,
  maxErrors = 15,
): Promise<Response> {
  let response: Response;
  let errorCount = 0;
  // execute with retry
  const backoff = 5000;
  while (errorCount < maxErrors) {
    try {
      response = await action();
      if (response.status >= 400) {
        errorCount++;
        // backoff
        await delay(backoff);
      } else {
        return response;
      }
    } catch (e) {
      errorCount++;
      await delay(backoff);
    }
  }
  throw new Error('Unable to execute query.');
}

export function delay(time: number) {
  return new Promise(r => setTimeout(r, time));
}
