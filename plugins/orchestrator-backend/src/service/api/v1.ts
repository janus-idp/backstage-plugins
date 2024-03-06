import { OperationResult } from '@urql/core';
import express from 'express';

import {
  AssessedProcessInstance,
  ProcessInstance,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowOverview,
  WorkflowOverviewListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from '../DataIndexService';
import { retryAsyncFunction } from '../Helper';
import { SonataFlowService } from '../SonataFlowService';

const FETCH_INSTANCE_MAX_ATTEMPTS = 10;
const FETCH_INSTANCE_RETRY_DELAY_MS = 1000;

export namespace V1 {
  export async function getWorkflowsOverview(
    sonataFlowService: SonataFlowService,
  ): Promise<WorkflowOverviewListResult> {
    const overviews = await sonataFlowService.fetchWorkflowOverviews();
    if (!overviews) {
      throw new Error("Couldn't fetch workflow overviews");
    }
    const result: WorkflowOverviewListResult = {
      items: overviews,
      limit: 0,
      offset: 0,
      totalCount: overviews?.length ?? 0,
    };
    return result;
  }

  export async function getWorkflowOverviewById(
    sonataFlowService: SonataFlowService,
    workflowId: string,
  ): Promise<WorkflowOverview> {
    const overviewObj =
      await sonataFlowService.fetchWorkflowOverview(workflowId);

    if (!overviewObj) {
      throw new Error(`Couldn't fetch workflow overview for ${workflowId}`);
    }
    return overviewObj;
  }

  export async function getWorkflowById(
    sonataFlowService: SonataFlowService,
    workflowId: string,
  ): Promise<WorkflowDefinition> {
    const definition =
      await sonataFlowService.fetchWorkflowDefinition(workflowId);

    if (!definition) {
      throw new Error(`Couldn't fetch workflow definition for ${workflowId}`);
    }

    return definition;
  }

  export async function getWorkflowSourceById(
    sonataFlowService: SonataFlowService,
    workflowId: string,
  ): Promise<string> {
    const source = await sonataFlowService.fetchWorkflowSource(workflowId);

    if (!source) {
      throw new Error(`Couldn't fetch workflow source for ${workflowId}`);
    }

    return source;
  }

  export async function getInstances(
    dataIndexService: DataIndexService,
  ): Promise<ProcessInstance[]> {
    const instances = await dataIndexService.fetchProcessInstances();

    if (!instances) {
      throw new Error("Couldn't fetch process instances");
    }
    return instances;
  }

  export async function getInstanceById(
    dataIndexService: DataIndexService,
    instanceId: string,
    includeAssessment?: string,
  ): Promise<AssessedProcessInstance> {
    const instance = await dataIndexService.fetchProcessInstance(instanceId);

    if (!instance) {
      throw new Error(`Couldn't fetch process instance ${instanceId}`);
    }

    let assessedByInstance: ProcessInstance | undefined;

    if (!!includeAssessment && instance.businessKey) {
      assessedByInstance = await dataIndexService.fetchProcessInstance(
        instance.businessKey,
      );
    }

    const response: AssessedProcessInstance = {
      instance,
      assessedBy: assessedByInstance,
    };
    return response;
  }

  export async function executeWorkflow(
    dataIndexService: DataIndexService,
    sonataFlowService: SonataFlowService,
    reqBody: Record<string, any>,
    workflowId: string,
    businessKey: string | undefined,
  ): Promise<WorkflowExecutionResponse> {
    const definition = await dataIndexService.getWorkflowDefinition(workflowId);
    if (!definition) {
      throw new Error(`Couldn't fetch workflow definition for ${workflowId}`);
    }
    if (!definition.serviceUrl) {
      throw new Error(`ServiceURL is not defined for workflow ${workflowId}`);
    }
    const executionResponse = await sonataFlowService.executeWorkflow({
      workflowId,
      inputData: reqBody,
      endpoint: definition.serviceUrl,
      businessKey,
    });

    if (!executionResponse) {
      throw new Error(`Couldn't execute workflow ${workflowId}`);
    }

    // Making sure the instance data is available before returning
    await retryAsyncFunction({
      asyncFn: () =>
        dataIndexService.fetchProcessInstance(executionResponse.id),
      maxAttempts: FETCH_INSTANCE_MAX_ATTEMPTS,
      delayMs: FETCH_INSTANCE_RETRY_DELAY_MS,
    });

    return executionResponse;
  }

  export async function abortWorkflow(
    dataIndexService: DataIndexService,
    workflowId: string,
  ): Promise<OperationResult> {
    const result = await dataIndexService.abortWorkflowInstance(workflowId);

    if (result.error) {
      throw new Error(
        `Can't abort workflow ${workflowId}. The error was: ${result.error}`,
      );
    }

    return result;
  }

  export function extractQueryParam(
    req: express.Request,
    key: string,
  ): string | undefined {
    return req.query[key] as string | undefined;
  }
}
