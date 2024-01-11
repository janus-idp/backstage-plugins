import { Config } from '@backstage/config';

import { createTransport, Transporter } from 'nodemailer';
import { Logger } from 'winston';

import { readFileSync } from 'fs';

export class NodeMailer {
  private readonly transportConfig: Transporter;
  private readonly from: string;

  constructor(
    config: Config,
    private logger: Logger,
  ) {
    const useSecure: boolean = config.getBoolean(
      'feedback.integrations.email.secure',
    );
    const caCertPath = config.getOptionalString(
      'feedback.integrations.email.caCert',
    );
    const customCACert = caCertPath ? readFileSync(caCertPath) : undefined;

    this.from = config.getString('feedback.integrations.email.from');
    this.transportConfig = createTransport({
      host: config.getString('feedback.integrations.email.host'),
      port: config.getOptionalNumber('feedback.integrations.email.port') ?? 587,
      auth: {
        user: config.getOptionalString('feedback.integrations.email.auth.user'),
        pass: config.getOptionalString(
          'feedback.integrations.email.auth.password',
        ),
      },
      secure: useSecure,
      tls: {
        ca: customCACert,
      },
    });
  }

  async sendMail(options: {
    to: string;
    replyTo: string;
    subject: string;
    body: string;
  }): Promise<{}> {
    try {
      const { to, replyTo, subject, body } = options;
      this.logger.info(`Sending mail to ${to}`);
      const resp = await this.transportConfig.sendMail({
        to: to,
        replyTo: replyTo,
        cc: replyTo,
        from: this.from,
        subject: subject,
        html: body,
      });
      return resp;
    } catch (error: any) {
      this.logger.error(`Failed to send mail: ${error.message}`);
      return {};
    }
  }
}
