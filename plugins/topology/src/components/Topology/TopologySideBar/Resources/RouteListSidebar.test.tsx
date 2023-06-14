import React from 'react';

import { render } from '@testing-library/react';

import { workloadNodeData } from '../../../../__fixtures__/workloadNodeData';
import { RouteData } from '../../../../types/route';
import RouteListSidebar from './RouteListSidebar';

describe('RouteListSidebar', () => {
  it('should render host URL, Route if exists', () => {
    const { queryByText } = render(
      <RouteListSidebar
        routesData={workloadNodeData.data.data.routesData as RouteData[]}
      />,
    );
    expect(queryByText(/hello-minikube2/i)).toBeInTheDocument();
    expect(
      queryByText(
        /nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com/,
      ),
    ).toBeInTheDocument();
  });

  it('should not render host URL if does not exists', () => {
    const { queryByText, getByText } = render(
      <RouteListSidebar routesData={[] as RouteData[]} />,
    );
    getByText(/No Routes found for this resource./i);
    expect(queryByText(/hello-minikube2/i)).not.toBeInTheDocument();
    expect(
      queryByText(
        /nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com/,
      ),
    ).not.toBeInTheDocument();
  });
});
