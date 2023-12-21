import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';

import { useTags } from '../../hooks';
import { QuayRepository } from './QuayRepository';

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockReturnValue({ loading: true }),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValue({ getOptionalString: (param: any) => param }),
}));

jest.mock('../../hooks/', () => ({
  useRepository: () => ({
    repository: 'redhat-backstage-build',
    organization: 'janus-idp',
  }),
  useTags: jest.fn().mockReturnValue({}),
}));

describe('QuayRepository', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should show loading if loading is true', () => {
    (useTags as jest.Mock).mockReturnValue({ loading: true, data: [] });
    const { getByTestId } = render(<QuayRepository />);
    expect(getByTestId('quay-repo-progress')).not.toBeNull();
  });

  it('should show empty table if loaded and data is not present', () => {
    (useTags as jest.Mock).mockReturnValue({ loading: false, data: [] });
    const { getByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );
    expect(getByTestId('quay-repo-table')).not.toBeNull();
    expect(getByTestId('quay-repo-table-empty')).not.toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(queryByText(/No data was added yet/i)).toBeInTheDocument();
  });

  it('should show table if loaded and data is present', () => {
    (useTags as jest.Mock).mockReturnValue({
      loading: false,
      data: [
        {
          name: 'latest',
          manifest_digest:
            'sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54',
          size: null,
          last_modified: 'Wed, 15 Mar 2023 18:22:18 -0000',
        },
      ],
    });
    const { queryByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );
    expect(queryByTestId('quay-repo-table')).not.toBeNull();
    expect(queryByTestId('quay-repo-table-empty')).toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(queryByText(/No data was added yet/i)).not.toBeInTheDocument();
  });

  it('should show table if loaded and data is present but shows progress if security scan is not loaded', () => {
    (useTags as jest.Mock).mockReturnValue({
      loading: false,
      data: [
        {
          name: 'latest',
          manifest_digest: undefined,
          size: null,
          last_modified: 'Wed, 15 Mar 2023 18:22:18 -0000',
        },
      ],
    });
    const { queryByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );
    expect(queryByTestId('quay-repo-table')).not.toBeNull();
    expect(queryByTestId('quay-repo-table-empty')).toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(queryByTestId('quay-repo-security-scan-progress')).not.toBeNull();
  });

  it('should show table if loaded and data is present but shows unsupported if security scan is not supported', () => {
    (useTags as jest.Mock).mockReturnValue({
      loading: false,
      data: [
        {
          name: 'latest',
          manifest_digest: undefined,
          securityStatus: 'unsupported',
          size: null,
          last_modified: 'Wed, 15 Mar 2023 18:22:18 -0000',
        },
      ],
    });
    const { queryByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );
    expect(queryByTestId('quay-repo-table')).not.toBeNull();
    expect(queryByTestId('quay-repo-table-empty')).toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(queryByTestId('quay-repo-security-scan-unsupported')).not.toBeNull();
  });
});
