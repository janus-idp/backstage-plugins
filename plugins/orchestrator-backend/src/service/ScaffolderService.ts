import { loggerToWinstonLogger } from '@backstage/backend-common';
import type {
  LoggerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';
import {
  createBuiltinActions,
  TemplateActionRegistry,
} from '@backstage/plugin-scaffolder-backend';
import {
  ActionContext,
  TemplateAction,
} from '@backstage/plugin-scaffolder-node';
import type { JsonObject, JsonValue } from '@backstage/types';

import fs from 'fs-extra';

import { randomUUID } from 'crypto';
import path from 'path';
import { PassThrough } from 'stream';

import { getWorkingDirectory } from './Helper';

export interface ActionExecutionContext {
  actionId: string;
  instanceId: string | undefined;
  input: JsonObject;
}

export class ScaffolderService {
  private actionRegistry: TemplateActionRegistry;
  private streamLogger = new PassThrough();

  constructor(
    private readonly logger: LoggerService,
    private readonly config: Config,
    private readonly catalogApi: CatalogApi,
    private readonly urlReader: UrlReaderService,
  ) {
    this.actionRegistry = new TemplateActionRegistry();
  }

  public loadActions(): void {
    const actions = [
      ...createBuiltinActions({
        integrations: ScmIntegrations.fromConfig(this.config),
        catalogClient: this.catalogApi,
        reader: this.urlReader,
        config: this.config,
      }),
    ];
    actions.forEach(a => this.actionRegistry.register(a));
  }

  public getAction(id: string): TemplateAction {
    return this.actionRegistry.get(id);
  }

  public async executeAction(
    actionExecutionContext: ActionExecutionContext,
  ): Promise<JsonValue> {
    if (this.actionRegistry.list().length === 0) {
      this.loadActions();
    }

    const action: TemplateAction = this.getAction(
      actionExecutionContext.actionId,
    );
    const stepOutput: { [outputName: string]: JsonValue } = {};

    let workspacePath: string;
    try {
      const workingDirectory = await getWorkingDirectory(
        this.config,
        this.logger,
      );
      workspacePath = path.join(
        workingDirectory,
        actionExecutionContext.instanceId ?? randomUUID(),
      );
    } catch (err: unknown) {
      this.logger.error(
        `Error getting working directory to execute action ${actionExecutionContext.actionId}`,
        err as Error,
      );
      throw err;
    }
    const actionContext: ActionContext<JsonObject> = {
      input: actionExecutionContext.input,
      workspacePath: workspacePath,
      // TODO: Move this to LoggerService after scaffolder-node moves to LoggerService
      // https://github.com/backstage/backstage/issues/26933
      logger: loggerToWinstonLogger(this.logger),
      logStream: this.streamLogger,
      createTemporaryDirectory: async () =>
        await fs.mkdtemp(`${workspacePath}_step-${0}-`),
      output(name: string, value: JsonValue) {
        stepOutput[name] = value;
      },
      getInitiatorCredentials: async () => {
        return {
          $$type: '@backstage/BackstageCredentials',
          principal: 'mock-principal',
        };
      },
      checkpoint: async (key, fn) => {
        this.logger.info(`Orchestrator ScaffolderService checkpoint ${key}`);
        return fn();
      },
    };
    await action.handler(actionContext);

    return stepOutput;
  }
}
