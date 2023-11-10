import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';

import { computedStatus } from '@janus-idp/shared-react';

import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import PipelineRunList from './PipelineRunList';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      metadata: {
        name: 'test',
      },
    },
  }),
}));

describe('PipelineRunList', () => {
  it('should render PipelineRunList if available', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: mockKubernetesPlrResponse.pipelineruns,
        },
        taskruns: {
          data: mockKubernetesPlrResponse.taskruns,
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: ['ocp'],
      setSelectedCluster: () => {},
      selectedStatus: '',
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <BrowserRouter>
          <PipelineRunList />
        </BrowserRouter>
      </TektonResourcesContext.Provider>,
    );

    expect(queryByText(/No Pipeline Runs found/i)).toBeNull();
  });

  it('should render loading if data has not been loaded', () => {
    const mockContextData = {
      watchResourcesData: {},
      loaded: false,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
      selectedStatus: '',
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { getByTestId } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    expect(getByTestId('tekton-progress')).not.toBeNull();
  });

  it('should show empty state if no data is available', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
      selectedStatus: '',
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { getByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    expect(getByText(/No Pipeline Runs found/i)).not.toBeNull();
  });

  it('should show empty state with no cluster selector if there are error in fetching resources and no clusters', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError:
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
      selectedStatus: '',
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { getByText, queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    getByText(/No Pipeline Runs found/i);
    expect(queryByText(/Cluster/)).toBeNull();
  });

  it('should show empty state with cluster selector if there are error in fetching resources and cluster(s) are fetched', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError:
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
      selectedClusterErrors: [{ message: '403 - forbidden' }],
      clusters: ['ocp'],
      setSelectedCluster: () => {},
      selectedStatus: '',
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { getByText, queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    getByText(/No Pipeline Runs found/i);
    expect(queryByText(/Cluster/)).not.toBeNull();
  });

  it('should render filtered PipelineRunList based on selected status', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: mockKubernetesPlrResponse.pipelineruns,
        },
        taskruns: {
          data: mockKubernetesPlrResponse.taskruns,
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: ['ocp'],
      setSelectedCluster: () => {},
      selectedStatus: computedStatus.Succeeded,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <BrowserRouter>
          <PipelineRunList />
        </BrowserRouter>
      </TektonResourcesContext.Provider>,
    );

    expect(queryByText('ruby-ex-git-xf45fo')).not.toBeNull();
  });

  it('should show empty state if no PipelineRuns matches selected status', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: mockKubernetesPlrResponse.pipelineruns,
        },
        taskruns: {
          data: mockKubernetesPlrResponse.taskruns,
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: ['ocp'],
      setSelectedCluster: () => {},
      selectedStatus: computedStatus.Running,
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };

    const { queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <BrowserRouter>
          <PipelineRunList />
        </BrowserRouter>
      </TektonResourcesContext.Provider>,
    );

    expect(queryByText(/No Pipeline Runs found/i)).not.toBeNull();
  });
});
