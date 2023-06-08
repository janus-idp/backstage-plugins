import React from 'react';
import { useParams } from 'react-router-dom';

import { render } from '@testing-library/react';

import { useTagDetails } from '../../hooks';
import QuayTagPage from './component';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValue({ getOptionalString: (param: any) => param }),
  useRouteRef: jest.fn(),
}));

jest.mock('../../hooks/', () => ({
  useRepository: () => ({
    repository: 'redhat-backstage-build',
    organization: 'janus-idp',
  }),
  useTags: jest.fn().mockReturnValue({}),
  useTagDetails: jest.fn().mockReturnValue({}),
}));

jest.mock('../QuayTagDetails', () => ({
  QuayTagDetails: () => <div>QuayTagDetails</div>,
}));

describe('QuayTagPage', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should throw error if digest is not defined', () => {
    expect(() => render(<QuayTagPage />)).toThrow('digest is not defined');
  });

  it('should show loading if loading is in progress', () => {
    (useParams as jest.Mock).mockReturnValue({ digest: 'digest_data' });
    (useTagDetails as jest.Mock).mockReturnValue({ loading: true });
    const { queryByTestId } = render(<QuayTagPage />);
    expect(queryByTestId('quay-tag-page-progress')).not.toBeNull();
  });

  it('should show error: no digest if value is not there', () => {
    (useParams as jest.Mock).mockReturnValue({ digest: 'digest_data' });
    (useTagDetails as jest.Mock).mockReturnValue({ loading: false });
    const { queryByTestId, queryAllByText } = render(<QuayTagPage />);
    expect(queryAllByText(/no digest/i)[0]).toBeInTheDocument();
    expect(queryByTestId('quay-tag-page-progress')).toBeNull();
  });

  it('should show QuayTagDetails if value is there', () => {
    (useParams as jest.Mock).mockReturnValue({ digest: 'digest_data' });
    (useTagDetails as jest.Mock).mockReturnValue({
      loading: false,
      value: { data: [{ Features: [] }] },
    });
    const { queryByText } = render(<QuayTagPage />);
    expect(queryByText(/QuayTagDetails/i)).toBeInTheDocument();
  });
});
