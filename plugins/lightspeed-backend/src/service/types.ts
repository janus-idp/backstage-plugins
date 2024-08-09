import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import { ChatCompletionMessageParam } from 'openai/resources';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
};

/**
 * Define the type for the request body of the /completions endpoint.
 */
export interface CompletionsRequestBody {
  /**
   * AI model identifier.
   */
  model: string;

  /**
   * Array of previous messages.
   */
  messages: Array<ChatCompletionMessageParam>;
}
