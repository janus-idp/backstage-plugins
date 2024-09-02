import express from 'express';

import { WorkflowDefinition } from '@janus-idp/backstage-plugin-orchestrator-common';

import { OrchestratorService } from '../OrchestratorService';

export class V1 {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  public async getWorkflowById(
    definitionId: string,
  ): Promise<WorkflowDefinition> {
    const definition = await this.orchestratorService.fetchWorkflowDefinition({
      definitionId,
      cacheHandler: 'throw',
    });

    if (!definition) {
      throw new Error(`Couldn't fetch workflow definition for ${definitionId}`);
    }

    return definition;
  }

  public async getWorkflowSourceById(definitionId: string): Promise<string> {
    const source = await this.orchestratorService.fetchWorkflowSource({
      definitionId,
      cacheHandler: 'throw',
    });

    if (!source) {
      throw new Error(`Couldn't fetch workflow source for ${definitionId}`);
    }

    return source;
  }

  public extractQueryParam(
    req: express.Request,
    key: string,
  ): string | undefined {
    return req.query[key] as string | undefined;
  }
}
