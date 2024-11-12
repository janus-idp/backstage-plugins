import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import type { JsonObject } from '@backstage/types';

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  isAxiosError,
  RawAxiosRequestHeaders,
} from 'axios';

import {
  AssessedProcessInstanceDTO,
  Configuration,
  DefaultApi,
  ExecuteWorkflowResponseDTO,
  Filter,
  GetInstancesRequest,
  InputSchemaResponseDTO,
  PaginationInfoDTO,
  ProcessInstanceListResultDTO,
  WorkflowDefinition,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { OrchestratorApi } from './api';

const getError = (err: unknown): Error => {
  if (
    isAxiosError<{ error: { message: string; name: string } }>(err) &&
    err.response?.data?.error?.message
  ) {
    const error = new Error(err.response?.data?.error?.message);
    error.name = err.response?.data?.error?.name || 'Error';
    return error;
  }
  return err as Error;
};

export interface OrchestratorClientOptions {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
  axiosInstance?: AxiosInstance;
}
export class OrchestratorClient implements OrchestratorApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  private axiosInstance?: AxiosInstance;

  private baseUrl: string | null = null;
  constructor(options: OrchestratorClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
    this.axiosInstance = options.axiosInstance;
  }

  async getDefaultAPI(): Promise<DefaultApi> {
    const baseUrl = await this.getBaseUrl();
    const { token: idToken } = await this.identityApi.getCredentials();

    // Fixme: Following makes mocking of global axios complicated in the tests, ideally there should be just one axios instance:
    this.axiosInstance =
      this.axiosInstance ||
      axios.create({
        baseURL: baseUrl,
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        withCredentials: true,
      });
    const config = new Configuration({
      basePath: baseUrl,
    });

    return new DefaultApi(config, baseUrl, this.axiosInstance);
  }
  private async getBaseUrl(): Promise<string> {
    if (!this.baseUrl) {
      this.baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    }

    return this.baseUrl;
  }

  async executeWorkflow(args: {
    workflowId: string;
    parameters: JsonObject;
    businessKey?: string;
  }): Promise<AxiosResponse<ExecuteWorkflowResponseDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    try {
      return await defaultApi.executeWorkflow(
        args.workflowId,
        { inputData: args.parameters },
        reqConfigOption,
      );
    } catch (err) {
      throw getError(err);
    }
  }

  async abortWorkflowInstance(
    instanceId: string,
  ): Promise<AxiosResponse<string>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    try {
      return await defaultApi.abortWorkflow(instanceId, reqConfigOption);
    } catch (err) {
      throw getError(err);
    }
  }

  async getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition> {
    const baseUrl = await this.getBaseUrl();
    try {
      return await this.fetcher(`${baseUrl}/workflows/${workflowId}`).then(r =>
        r.json(),
      );
    } catch (err) {
      throw getError(err);
    }
  }

  async getWorkflowSource(workflowId: string): Promise<AxiosResponse<string>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    reqConfigOption.responseType = 'text';
    try {
      return await defaultApi.getWorkflowSourceById(
        workflowId,
        reqConfigOption,
      );
    } catch (err) {
      throw getError(err);
    }
  }

  async listWorkflowOverviews(
    paginationInfo?: PaginationInfoDTO,
    filters?: Filter,
  ): Promise<AxiosResponse<WorkflowOverviewListResultDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    try {
      return await defaultApi.getWorkflowsOverview(
        { paginationInfo, filters },
        reqConfigOption,
      );
    } catch (err) {
      throw getError(err);
    }
  }

  async listInstances(
    args: GetInstancesRequest,
  ): Promise<AxiosResponse<ProcessInstanceListResultDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    try {
      return await defaultApi.getInstances(args, reqConfigOption);
    } catch (err) {
      throw getError(err);
    }
  }

  async getInstance(
    instanceId: string,
    includeAssessment = false,
  ): Promise<AxiosResponse<AssessedProcessInstanceDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    try {
      return await defaultApi.getInstanceById(
        instanceId,
        includeAssessment,
        reqConfigOption,
      );
    } catch (err) {
      throw getError(err);
    }
  }

  async getWorkflowDataInputSchema(
    workflowId: string,
    instanceId?: string,
  ): Promise<AxiosResponse<InputSchemaResponseDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    try {
      return await defaultApi.getWorkflowInputSchemaById(
        workflowId,
        instanceId,
        reqConfigOption,
      );
    } catch (err) {
      throw getError(err);
    }
  }

  async getWorkflowOverview(
    workflowId: string,
  ): Promise<AxiosResponse<WorkflowOverviewDTO>> {
    const defaultApi = await this.getDefaultAPI();
    const reqConfigOption: AxiosRequestConfig =
      await this.getDefaultReqConfig();
    try {
      return await defaultApi.getWorkflowOverviewById(
        workflowId,
        reqConfigOption,
      );
    } catch (err) {
      throw getError(err);
    }
  }

  /** fetcher is convenience fetch wrapper that includes authentication
   * and other necessary headers **/
  private async fetcher(
    url: string,
    requestInit?: RequestInit,
  ): Promise<Response> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const r = { ...requestInit };
    r.headers = {
      ...r.headers,
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    };
    const response = await fetch(url, r);
    return response;
  }

  // getDefaultReqConfig is a convenience wrapper that includes authentication and other necessary headers
  private async getDefaultReqConfig(
    additionalHeaders?: RawAxiosRequestHeaders,
  ): Promise<AxiosRequestConfig> {
    const idToken = await this.identityApi.getCredentials();
    const reqConfigOption: AxiosRequestConfig = {
      baseURL: await this.getBaseUrl(),
      headers: {
        Authorization: `Bearer ${idToken.token}`,
        ...additionalHeaders,
      },
    };
    return reqConfigOption;
  }
}
