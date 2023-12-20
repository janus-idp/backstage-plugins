import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import {
  taskRunWithResults,
  taskRunWithSBOMResult,
  taskRunWithSBOMResultExternalLink,
} from '../__fixtures__/taskRunData';
import {
  getActiveTaskRun,
  getSbomLink,
  getSbomTaskRun,
  getSortedTaskRuns,
  hasExternalLink,
  isSbomTaskRun,
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
    expect(activeTaskRun).toBe('pipeline-test-wbvtlk-tkn');
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

  it('should not return the taskrun related to SBOM', () => {
    const taskrunsWithoutSBOM = [taskRunWithResults];
    expect(getSbomTaskRun('test-plr', [])).toBeUndefined();
    expect(getSbomTaskRun('test-plr', taskrunsWithoutSBOM)).toBeUndefined();
  });

  it('should return the taskrun related to SBOM', () => {
    expect(getSbomTaskRun('test-plr', [taskRunWithSBOMResult])).toBeDefined();
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

  it('should return false if the taskrun is not a valid SBOM task', () => {
    expect(isSbomTaskRun(taskRunWithResults)).toBe(false);
  });
});
