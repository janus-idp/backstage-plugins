import { LoggerService } from '@backstage/backend-plugin-api';

import chokidar from 'chokidar';

import fs from 'fs';

/**
 * Represents a file watcher that can be used to monitor changes in a file.
 */
export abstract class AbstractFileWatcher<T> {
  constructor(
    protected readonly filePath: string,
    protected readonly allowReload: boolean,
    protected readonly logger: LoggerService,
  ) {}

  /**
   * Initializes the file watcher and starts watching the specified file.
   */
  abstract initialize(): Promise<void>;

  /**
   * watchFile initializes the file watcher and sets it to begin watching for changes.
   */
  watchFile(): void {
    const watcher = chokidar.watch(this.filePath);
    watcher.on('change', async path => {
      this.logger.info(`file ${path} has changed`);
      await this.onChange();
    });
    watcher.on('error', error => {
      this.logger.error(`error watching file ${this.filePath}: ${error}`);
    });
  }

  /**
   * Handles the change event when the watched file is modified.
   * @returns A promise that resolves when the change event is handled.
   */
  abstract onChange(): Promise<void>;

  /**
   * getCurrentContents reads the current contents of the CSV file.
   * @returns The current contents of the CSV file.
   */
  getCurrentContents(): string {
    return fs.readFileSync(this.filePath, 'utf-8');
  }

  /**
   * parse is used to parse the current contents of the file.
   * @returns The file parsed into a type <T>.
   */
  abstract parse(): T;
}
