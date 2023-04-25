import React from 'react';
import { render } from '@testing-library/react';
import { TektonComponent } from './TektonComponent';

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
    const { getByText } = render(<TektonComponent />);
    expect(getByText(/List of Pipeline Runs/i)).not.toBeNull();
  });
});
