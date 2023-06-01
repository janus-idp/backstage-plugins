import React from 'react';

import { render } from '@testing-library/react';

import { workloadNodeData } from '../../../../__fixtures__/workloadNodeData';
import { IngressData } from '../../../../types/ingresses';
import IngressListSidebar from './IngressListSidebar';

describe('IngressListSidebar', () => {
  it('should render ingress if exists', () => {
    const { queryByText } = render(
      <IngressListSidebar
        ingressesData={workloadNodeData.data.data.ingressesData as IngressData[]}
      />,
    );
    expect(queryByText(/hello-minikube2-ingress/i)).toBeInTheDocument();
    expect(queryByText(/Location:/i)).toBeInTheDocument();
  });

  it('should render ingress rule if exists', () => {
    const { queryByText } = render(
      <IngressListSidebar
        ingressesData={workloadNodeData.data.data.ingressesData as IngressData[]}
      />,
    );
    expect(queryByText(/hello-minikube2-ingress/i)).toBeInTheDocument();
    expect(queryByText(/rules:/i)).toBeInTheDocument();
  });

  it('should not render ingress and show empty state if does not exists', () => {
    const { queryByText, getByText } = render(<IngressListSidebar ingressesData={[]} />);
    getByText(/No Ingresses found for this resource./i);
    expect(queryByText(/hello-minikube2-ingress/i)).not.toBeInTheDocument();
    expect(queryByText(/Location:/)).not.toBeInTheDocument();
  });
});
