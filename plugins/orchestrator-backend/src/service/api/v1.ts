import { OperationResult } from '@urql/core';
import express from 'express';

import {
  AssessedProcessInstance,
  fromWorkflowSource,
  ProcessInstance,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowItem,
  WorkflowListResult,
  WorkflowOverview,
  WorkflowOverviewListResult,
  WorkflowSpecFile,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from '../DataIndexService';
import { SonataFlowService } from '../SonataFlowService';
import { WorkflowService } from '../WorkflowService';

export namespace V1 {
  export async function getWorkflowOverview(
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

  export async function getWorkflows(
    sonataFlowService: SonataFlowService,
    dataIndexService: DataIndexService,
  ): Promise<WorkflowListResult> {
    const definitions: WorkflowInfo[] =
      await dataIndexService.getWorkflowDefinitions();
    const items: WorkflowItem[] = await Promise.all(
      definitions.map(async info => {
        const uri = await sonataFlowService.fetchWorkflowUri(info.id);
        if (!uri) {
          throw new Error(`Uri is required for workflow ${info.id}`);
        }
        const item: WorkflowItem = {
          definition: info as WorkflowDefinition,
          serviceUrl: info.serviceUrl,
          uri,
        };
        return item;
      }),
    );

    if (!items) {
      throw new Error("Couldn't fetch workflows");
    }

    return {
      items: items,
      limit: 0,
      offset: 0,
      totalCount: items?.length ?? 0,
    };
  }

  export async function getWorkflowById(
    sonataFlowService: SonataFlowService,
    workflowId: string,
  ): Promise<{ uri: string; definition: WorkflowDefinition }> {
    const definition =
      await sonataFlowService.fetchWorkflowDefinition(workflowId);

    if (!definition) {
      throw new Error(`Couldn't fetch workflow definition for ${workflowId}`);
    }

    const uri = await sonataFlowService.fetchWorkflowUri(workflowId);
    if (!uri) {
      throw new Error(`Couldn't fetch workflow uri for ${workflowId}`);
    }

    return { uri, definition };
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
    const serviceUrl = definition.serviceUrl;
    if (!serviceUrl) {
      throw new Error(`ServiceURL is not defined for workflow ${workflowId}`);
    }
    const executionResponse = await sonataFlowService.executeWorkflow({
      workflowId,
      inputData: reqBody,
      endpoint: serviceUrl,
      businessKey,
    });

    if (!executionResponse) {
      throw new Error(`Couldn't execute workflow ${workflowId}`);
    }

    return executionResponse;
  }

  export async function createWorkflow(
    workflowService: WorkflowService,
    uri: string,
    reqBody: string,
  ): Promise<WorkflowItem> {
    const workflowItem = uri?.startsWith('http')
      ? await workflowService.saveWorkflowDefinitionFromUrl(uri)
      : await workflowService.saveWorkflowDefinition({
          uri,
          definition: fromWorkflowSource(reqBody),
        });
    return workflowItem;
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

  export async function getWorkflowSpecs(
    workflowService: WorkflowService,
  ): Promise<WorkflowSpecFile[]> {
    return await workflowService.listStoredSpecs();
  }

  export function extractQueryParam(
    req: express.Request,
    key: string,
  ): string | undefined {
    return req.query[key] as string | undefined;
  }
}
