import { CloudEvent, emitterFor, httpTransport } from 'cloudevents';
import { Logger } from 'winston';

export type CloudEventResponse =
  | { success: true }
  | { success: false; error: string };

export class CloudEventService {
  constructor(private readonly logger: Logger) {}

  public async send<T>(args: {
    event: CloudEvent<T>;
    endpoint?: string;
  }): Promise<CloudEventResponse> {
    try {
      if (!args.endpoint) {
        throw new Error('Endpoint is required');
      }
      const targetUrl = args.endpoint;
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
