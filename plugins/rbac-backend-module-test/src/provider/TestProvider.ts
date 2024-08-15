import {
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import { parse } from 'csv-parse/sync';

import {
  RBACProvider,
  RBACProviderConnection,
} from '@janus-idp/backstage-plugin-rbac-node';

import fs from 'fs';

export class TestProvider implements RBACProvider {
  private readonly scheduleFn: () => Promise<void>;
  private readonly logger: LoggerService;
  private connection?: RBACProviderConnection;

  static fromConfig(
    config: Config,
    options: {
      logger: LoggerService;
      schedule?: SchedulerServiceTaskRunner;
      scheduler?: SchedulerService;
    },
  ): TestProvider {
    const providerConfig = readProviderConfig(config);
    let schedulerServiceTaskRunner;

    if (options.scheduler && providerConfig.schedule) {
      schedulerServiceTaskRunner = options.scheduler.createScheduledTaskRunner(
        providerConfig.schedule,
      );
    } else if (options.schedule) {
      schedulerServiceTaskRunner = options.schedule;
    } else {
      throw new Error('Neither schedule nor scheduler is provided.');
    }

    return new TestProvider(schedulerServiceTaskRunner, options.logger);
  }

  private constructor(
    schedulerServiceTaskRunner: SchedulerServiceTaskRunner,
    logger: LoggerService,
  ) {
    this.logger = logger.child({
      target: this.getProviderName(),
    });

    this.scheduleFn = this.createScheduleFN(schedulerServiceTaskRunner);
  }

  getProviderName(): string {
    return `testProvider`;
  }

  async connect(connection: RBACProviderConnection): Promise<void> {
    this.connection = connection;
    this.scheduleFn();
  }

  async refresh(): Promise<void> {
    try {
      await this.run();
    } catch (error: any) {
      this.logger.error(`Error occurred, here is the error ${error}`);
      console.log(error);
    }
  }

  private createScheduleFN(
    schedulerServiceTaskRunner: SchedulerServiceTaskRunner,
  ): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:run`;
      return schedulerServiceTaskRunner.run({
        id: taskId,
        fn: async () => {
          try {
            await this.run();
          } catch (error: any) {
            this.logger.error(`Error occurred, here is the error ${error}`);
          }
        },
      });
    };
  }

  private async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const permissions: string[][] = [];
    const roles: string[][] = [];

    const contents = readFromCSV();

    contents.forEach(policy => {
      const convertedPolicy = metadataStringToPolicy(policy);
      if (convertedPolicy[0] === 'p') {
        convertedPolicy.splice(0, 1);
        permissions.push(convertedPolicy);
      } else if (convertedPolicy[0] === 'g') {
        convertedPolicy.splice(0, 1);
        roles.push(convertedPolicy);
      }
    });

    await this.connection.applyRoles(roles);
    await this.connection.applyPermissions(permissions);
  }
}

function readProviderConfig(config: Config) {
  const rbacConfig = config.getOptionalConfig('permission.rbac.providers.test');
  if (!rbacConfig) {
    return {
      undefined,
    };
  }

  const baseUrl = rbacConfig.getString('baseUrl');
  const accessToken = rbacConfig.getString('accessToken');
  const schedule = rbacConfig.has('schedule')
    ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
        rbacConfig.getConfig('schedule'),
      )
    : undefined;

  return {
    baseUrl,
    accessToken,
    schedule,
  };
}

function readFromCSV(): string[] {
  const content = fs.readFileSync(
    '../../plugins/rbac-backend-module-test/test-policy.csv',
    'utf-8',
  );
  const parser: string[][] = parse(content, {
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  const newFlatContent = parser.flatMap(data => {
    return policyToString(data);
  });

  return newFlatContent;
}

function policyToString(policy: string[]): string {
  return `[${policy.join(', ')}]`;
}

function metadataStringToPolicy(policy: string): string[] {
  return policy.replace('[', '').replace(']', '').split(', ');
}
