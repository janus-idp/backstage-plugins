import { Client } from '@urql/core';
import { Logger } from 'winston';

import { DEFAULT_DATA_INDEX_URL } from './constants';

export class BackendExecCtx {
  constructor(
    public logger: Logger,
    public client: Client,
    public dataIndexUrl = DEFAULT_DATA_INDEX_URL,
  ) {
    this.dataIndexUrl = dataIndexUrl;
    this.logger = logger;
    this.client = client;
  }
}
