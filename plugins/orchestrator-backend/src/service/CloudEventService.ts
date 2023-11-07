import { CloudEvent, emitterFor, httpTransport } from 'cloudevents';
import { Logger } from 'winston';

export type CloudEventResponse =
  | { success: true }
  | { success: false; error: string };

export class CloudEventService {
  constructor(
    private readonly logger: Logger,
    private readonly baseUrl: string,
  ) {}

  public async send<T>(args: {
    event: CloudEvent<T>;
    endpoint?: string;
  }): Promise<CloudEventResponse> {
    try {
      const targetUrl = args.endpoint
        ? `${this.baseUrl}/${args.endpoint}`
        : this.baseUrl;
      this.logger.info(
        `Sending CloudEvent to ${targetUrl} with data ${JSON.stringify(
          args.event,
        )}`,
      );
      const emit = emitterFor(httpTransport(targetUrl));
      await emit(args.event);
      return { success: true };
    } catch (e: any) {
      this.logger.error(e);
      return {
        success: false,
        error: e.message,
      };
    }
  }
}
