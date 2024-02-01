import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { enterpriseContractResult } from '../__fixtures__/enterpriseContractData';
import { testPipelineRunPods } from '../__fixtures__/pods-data';
import {
  acsDeploymentCheckTaskRun,
  acsImageCheckTaskRun,
  acsImageScanTaskRun,
  enterpriseContractTaskRun,
  taskRunWithResults,
  taskRunWithSBOMResult,
  taskRunWithSBOMResultExternalLink,
} from '../__fixtures__/taskRunData';
import {
  formatData,
  getActiveTaskRun,
  getPodsOutputGroup,
  getSbomLink,
  getSortedTaskRuns,
  getTaskrunsOutputGroup,
  hasExternalLink,
  isACSDeploymentCheckTaskRun,
  isACSImageCheckTaskRun,
  isACSImageScanTaskRun,
  isECTaskRun,
  isSbomTaskRun,
  mapEnterpriseContractResultData,
} from './taskRun-utils';

describe('taskRun-utils', () => {
  it('should return sorted task runs', () => {
    const sortedTaskRuns = getSortedTaskRuns(
      mockKubernetesPlrResponse.taskruns,
    );
    expect(sortedTaskRuns[0].id).toEqual('ruby-ex-git-xf45fo-build');
  });

  it('should return empty sorted task runs', () => {
    const sortedTaskRuns = getSortedTaskRuns([]);
    expect(sortedTaskRuns).toHaveLength(0);
  });

  it('should return active taskrun as the latest taskrun when active task is not present', () => {
    const activeTaskRun = getActiveTaskRun(
      getSortedTaskRuns(mockKubernetesPlrResponse.taskruns),
      '',
    );
    expect(activeTaskRun).toBe('pipelinerun-with-sbom-task-t237ev-sbom-task');
  });

  it('should return active taskrun when active task is present', () => {
    const activeTaskRun = getActiveTaskRun(
      getSortedTaskRuns(mockKubernetesPlrResponse.taskruns),
      'pipeline-test-wbvtlk-tkn',
    );
    expect(activeTaskRun).toBe('pipeline-test-wbvtlk-tkn');
  });

  it('should return undefined when active task is not present', () => {
    const activeTaskRun = getActiveTaskRun(
      getSortedTaskRuns(mockKubernetesPlrResponse.taskruns),
      'pipeline-test-wbvt-tkn',
    );
    expect(activeTaskRun).toBe(undefined);
  });

  it('should not return the SBOM link', () => {
    expect(getSbomLink(taskRunWithResults)).toBeUndefined();
  });

  it('should return the SBOM link', () => {
    expect(getSbomLink(taskRunWithSBOMResult)).toBe(
      'quay.io/test/image:build-8e536-1692702836',
    );
  });

  it('should return false if taskrun is missing annotations', () => {
    expect(
      hasExternalLink({
        ...taskRunWithSBOMResultExternalLink,
        metadata: {
          ...taskRunWithSBOMResultExternalLink.metadata,
          annotations: undefined,
        },
      }),
    ).toBe(false);
  });

  it('should return false if the taskrun is missing external-link type annotation', () => {
    expect(hasExternalLink(taskRunWithSBOMResult)).toBe(false);
  });

  it('should return true if the taskrun has external-link type annotation', () => {
    expect(hasExternalLink(taskRunWithSBOMResultExternalLink)).toBe(true);
  });

  it('should return true if the taskrun is a valid SBOM task', () => {
    expect(isSbomTaskRun(taskRunWithSBOMResultExternalLink)).toBe(true);
    expect(isSbomTaskRun(taskRunWithSBOMResult)).toBe(true);
  });

  it('should return true if the taskrun is a valid EC task', () => {
    expect(isECTaskRun(enterpriseContractTaskRun)).toBe(true);
  });

  it('should return true if the taskrun is a valid ACS image scan task', () => {
    expect(isACSImageScanTaskRun(acsImageScanTaskRun)).toBe(true);
  });

  it('should return true if the taskrun is a valid ACS image check task', () => {
    expect(isACSImageCheckTaskRun(acsImageCheckTaskRun)).toBe(true);
  });
  it('should return true if the taskrun is a valid ACS deployment check task', () => {
    expect(isACSDeploymentCheckTaskRun(acsDeploymentCheckTaskRun)).toBe(true);
  });

  it('should return false if the taskrun is not a valid SBOM task', () => {
    expect(isSbomTaskRun(taskRunWithResults)).toBe(false);
    expect(isECTaskRun(taskRunWithResults)).toBe(false);
    expect(isACSImageScanTaskRun(taskRunWithResults)).toBe(false);
    expect(isACSImageCheckTaskRun(taskRunWithResults)).toBe(false);
    expect(isACSDeploymentCheckTaskRun(taskRunWithResults)).toBe(false);
  });

  it('should return the taskrun group', () => {
    const outputGroup = getTaskrunsOutputGroup(
      'pipelinerun-with-scanner-task',
      [acsImageScanTaskRun, acsImageCheckTaskRun, acsDeploymentCheckTaskRun],
    );

    expect(outputGroup.acsImageScanTaskRun).toBeDefined();
    expect(outputGroup.acsImageCheckTaskRun).toBeDefined();
    expect(outputGroup.acsDeploymentCheckTaskRun).toBeDefined();
    expect(outputGroup.ecTaskRun).toBeUndefined();
    expect(outputGroup.sbomTaskRun).toBeUndefined();
  });

  it('should return the pods group', () => {
    const outputGroup = getTaskrunsOutputGroup(
      'pipelinerun-with-scanner-task',
      [acsImageScanTaskRun],
    );

    const podGroup = getPodsOutputGroup(outputGroup, testPipelineRunPods.pods);
    expect(podGroup.acsImageScanPod).toBeDefined();
    expect(podGroup.ecPod).toBeUndefined();
  });

  it('should formatData in the given format', () => {
    expect(formatData('application/json', '{"key":"value"}')).toEqual({
      key: 'value',
    });

    expect(formatData('application/text', '{"key":"value"}')).toEqual(
      '{"key":"value"}',
    );
  });

  it('should throw error if the json is not parsable', () => {
    const warnFunction = jest.fn();
    jest.spyOn(console, 'warn').mockImplementation(warnFunction);

    expect(formatData('application/json', 'key:value')).toEqual('');
    expect(warnFunction).toHaveBeenCalled();
  });

  it('should process the enterprise contract results and return in expected structure', () => {
    expect(
      mapEnterpriseContractResultData(enterpriseContractResult),
    ).toHaveLength(4);
  });
});
