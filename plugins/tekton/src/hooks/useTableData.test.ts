import { renderHook } from '@testing-library/react-hooks';
import { useTableData } from './useTableData';
import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { SortByDirection } from '@patternfly/react-table';

const mockData = [
  mockKubernetesPlrResponse.pipelineruns[0],
  {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      annotations: {
        'pipeline.openshift.io/started-by': 'kube:admin',
      },
      resourceVersion: '273095',
      name: 'nodejs-ex-git-04d4d9',
      uid: '5c067e77-97df-4e1f-961f-cc060b2cf203',
      creationTimestamp: new Date('2023-04-14T09:12:55Z'),
      generation: 1,
      namespace: 'web-app',
      labels: {
        'app.kubernetes.io/instance': 'nodejs-ex-git',
        'app.kubernetes.io/name': 'nodejs-ex-git',
        'backstage.io/kubernetes-id': 'backstage',
        'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
        'pipeline.openshift.io/runtime': 'nodejs',
        'pipeline.openshift.io/runtime-version': '16-ubi8',
        'pipeline.openshift.io/type': 'kubernetes',
        'tekton.dev/pipeline': 'nodejs-ex-git',
      },
    },
    spec: {},
  },
];

describe('useTableData', () => {
  it('should sort data', () => {
    const { result } = renderHook(() => useTableData({ propData: mockData }));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].metadata.name).toBe('nodejs-ex-git-04d4d9');
    expect(result.current.data[1].metadata.name).toBe('ruby-ex-git-xf45fo');
  });

  it('should sort data based on timestamp', () => {
    const { result } = renderHook(() =>
      useTableData({
        propData: mockData,
        defaultSortField: 'status.startTime',
      }),
    );
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].metadata.name).toBe('nodejs-ex-git-04d4d9');
    expect(result.current.data[1].metadata.name).toBe('ruby-ex-git-xf45fo');
  });

  it('should sort data based on timestamp with sort order', () => {
    const { result } = renderHook(() =>
      useTableData({
        propData: mockData,
        defaultSortField: 'status.startTime',
        defaultSortOrder: SortByDirection.desc,
      }),
    );
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].metadata.name).toBe('ruby-ex-git-xf45fo');
    expect(result.current.data[1].metadata.name).toBe('nodejs-ex-git-04d4d9');
  });
});
