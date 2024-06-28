import React from 'react';

import { usePermission } from '@backstage/plugin-permission-react';

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

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('TektonComponent', () => {
  beforeEach(() => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
  });

  it('should render Permission alert if the user does not have view permission', () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    const { getByTestId } = render(<TektonCIComponent />);
    expect(getByTestId('no-permission-alert')).toBeInTheDocument();
  });

  it('should render TektonComponent', () => {
    const { getByText } = render(<TektonCIComponent />);
    expect(getByText(/No Pipeline Runs found/i)).not.toBeNull();
  });
});
