import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Node } from '@patternfly/react-topology';
import { UrlDecorator } from './UrlDecorator';
import { mockKubernetesResponse } from '../../../__fixtures__/1-deployments';
import { useIngressURL } from '../../../hooks/useIngressURL';

const topologyNodeDataModel = {
  id: 'e187afa2-53b1-406d-a619-cf9ff1468031',
  type: 'workload',
  label: 'hello-openshift',
  resource: mockKubernetesResponse.deployments[0],
  data: {
    data: {},
    id: 'e187afa2-53b1-406d-a619-cf9ff1468031',
    name: 'hello-openshift',
    type: 'workload',
    resources: {
      buildConfigs: [],
      obj: mockKubernetesResponse.deployments[0],
      ingresses: [],
      services: [],
    },
  },
  width: 100,
  height: 100,
  group: false,
  visible: true,
  style: {
    padding: 0,
  },
};

// mock Decorator
jest.mock('@patternfly/react-topology', () => ({
  Decorator: () => <div>Decorator</div>,
}));

const mockElement = {
  getModel: jest.fn(),
  setModel: jest.fn(),
  getData: () => topologyNodeDataModel,
} as unknown as Node;

// mock useIngressURL to return a value
jest.mock('../../../hooks/useIngressURL', () => ({
  useIngressURL: jest.fn(),
}));

const mockUseIngressURL = useIngressURL as jest.Mock;

describe('UrlDecorator', () => {
  it('should not render decorator if not ingress is mapped', () => {
    mockUseIngressURL.mockReturnValue(null);
    render(<UrlDecorator element={mockElement} radius={0} x={0} y={0} />);
    expect(screen.queryByText('Decorator')).not.toBeInTheDocument();
  });

  it('should render decorator if ingress is mapped', () => {
    mockUseIngressURL.mockReturnValue('http:hello-world');
    render(<UrlDecorator element={mockElement} radius={0} x={0} y={0} />);
    expect(screen.queryByText('Decorator')).toBeInTheDocument();
  });
});
