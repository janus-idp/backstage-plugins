import React from 'react';

import { render } from '@testing-library/react';

import { TektonCIComponent } from './TektonCIComponent';

// mock useTektonObjectsResponse hook
jest.mock('../../hooks/useTektonObjectsResponse', () => ({
  useTektonObjectsResponse: () => ({
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
  }),
}));

describe('TektonComponent', () => {
  it('should render TektonComponent', () => {
    const { getByText } = render(<TektonCIComponent />);
    expect(getByText(/No Pipeline Runs found/i)).not.toBeNull();
  });
});
