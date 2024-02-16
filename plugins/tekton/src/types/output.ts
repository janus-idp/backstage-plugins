import { TaskRunKind } from '@janus-idp/shared-react';

export enum TaskType {
  sbom = 'sbom',
  ec = 'ec',
  acsImageScan = 'acsImageScan',
  acsImageCheck = 'acsImageCheck',
  acsDeploymentCheck = 'acsDeploymentCheck',
}

export type OutputTaskRunGroup = {
  [key in `${TaskType}TaskRun`]?: TaskRunKind;
};
