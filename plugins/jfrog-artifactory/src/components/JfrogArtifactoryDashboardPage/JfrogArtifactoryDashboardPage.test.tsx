import { render, waitFor } from '@testing-library/react';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { useJfrogArtifactoryAppData } from '../useJfrogArtifactoryAppData';
import { useApi } from '@backstage/core-plugin-api';
import { JfrogArtifactoryDashboardPage } from './JfrogArtifactoryDashboardPage';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

jest.mock('../useJfrogArtifactoryAppData', () => ({
  useJfrogArtifactoryAppData: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => {
  const module = jest.requireActual('@backstage/core-plugin-api');
  return {
    ...module,
    useApi: jest.fn(),
  };
});

describe('<JfrogArtifactoryDashboardPage />', () => {
  beforeEach(() => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: { kind: 'component', metadata: { name: 'test' } },
    });
    (useJfrogArtifactoryAppData as jest.Mock).mockReturnValue({
      packageName: 'testArtifact',
    });
    (useApi as jest.Mock).mockReturnValue({});
  });

  it('renders JfrogArtifactoryRepository with correct props', async () => {
    render(<JfrogArtifactoryDashboardPage />);

    await waitFor(() => {
      expect(useEntity).toHaveBeenCalled();
      expect(useJfrogArtifactoryAppData).toHaveBeenCalled();
      expect(useApi).toHaveBeenCalled();
    });
  });
});
