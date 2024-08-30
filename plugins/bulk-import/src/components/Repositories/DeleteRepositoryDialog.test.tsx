import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockGetRepositories } from '../../mocks/mockData';
import DeleteRepositoryDialog from './DeleteRepositoryDialog';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('DeleteRepositoryDialog', () => {
  it('renders delete repository dialog correctly', () => {
    render(
      <DeleteRepositoryDialog
        open
        closeDialog={jest.fn()}
        repository={mockGetRepositories.repositories[0]}
      />,
    );
    expect(
      screen.queryByText(/Remove cupcake repository?/i),
    ).toBeInTheDocument();
    const deleteButton = screen.getByRole('button', { name: /Remove/i });
    expect(deleteButton).toBeEnabled();
  });

  it('does not render when not open', () => {
    const { queryByText } = render(
      <DeleteRepositoryDialog
        open={false}
        closeDialog={jest.fn()}
        repository={mockGetRepositories.repositories[0]}
      />,
    );
    expect(queryByText(/Remove cupcake repository?/i)).not.toBeInTheDocument();
  });

  it('shows an error when the deletion fails', async () => {
    const mockDeleteRepository = jest
      .fn()
      .mockResolvedValue({ error: { message: 'Error occured' } });
    const useApiMock = useApi as jest.Mock;
    useApiMock.mockReturnValue({
      deleteImportAction: mockDeleteRepository,
    });

    const user = userEvent.setup();
    render(
      <DeleteRepositoryDialog
        open
        closeDialog={jest.fn()}
        repository={mockGetRepositories.repositories[0]}
      />,
    );

    const deleteButton = screen.getByText('Remove');
    await user.click(deleteButton);
    await waitFor(() => {
      expect(
        screen.queryByText(/Unable to remove repository. Error occured/i),
      ).toBeInTheDocument();
    });
  });
});
