import { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { tektonApiRef } from '../api/types';
import { PipelineRun, PipelineRunsByEntityRequest } from '@jquad-group/plugin-tekton-pipelines-common';
import useAsync from 'react-use/lib/useAsync';
import { Entity } from '@backstage/catalog-model';
import logger from '../logging/logger';

export interface PipelineRunObjects {
  pipelineRunObjects?: PipelineRun[];
  loading: boolean;
  error?: string;
}

export const usePipelineRunObjects = (
  entity: Entity,
  intervalMs: number = 10000,
): PipelineRunObjects => {
  const tektonApi = useApi(tektonApiRef);
  const request: PipelineRunsByEntityRequest = {
    entity: entity,
  }

  const getObjects = useCallback(async (): Promise<PipelineRun[]> => {
    return await tektonApi.getPipelineRuns(request,"","","","","");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tektonApi, entity]);
  
  
  const {value, loading, error } = useAsync(
    () => getObjects(),
    [getObjects],
  );

  return {
    pipelineRunObjects: value,
    loading,
    error: error?.message,
  }

}