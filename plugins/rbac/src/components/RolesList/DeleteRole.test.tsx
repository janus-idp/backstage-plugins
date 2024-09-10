import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import * as DeleteDialogContext from '@janus-idp/shared-react';

import DeleteRole from './DeleteRole';

jest.mock('@janus-idp/shared-react', () => ({
  useDeleteDialog: jest.fn().mockReturnValue({
    deleteComponent: '',
    setDeleteComponent: jest.fn(),
    openDialog: false,
    setOpenDialog: jest.fn(),
  }),
}));
describe('DeleteRole', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the button with the correct tooltip', () => {
    render(
      <DeleteRole
        roleName="Admin"
        disable={false}
        tooltip="Delete Admin Role"
        dataTestId="delete-admin-role"
      />,
    );

    expect(screen.getByTestId('delete-admin-role')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'title',
      'Delete Admin Role',
    );
  });

  it('calls openDialog with the roleName when clicked', () => {
    render(
      <DeleteRole
        roleName="Admin"
        disable={false}
        dataTestId="delete-admin-role"
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    const { setDeleteComponent, setOpenDialog } =
      DeleteDialogContext.useDeleteDialog();
    expect(setDeleteComponent).toHaveBeenCalledWith({ roleName: 'Admin' });
    expect(setOpenDialog).toHaveBeenCalledWith(true);
  });

  it('disables the button when disable prop is true', () => {
    render(
      <DeleteRole roleName="Admin" disable dataTestId="delete-admin-role" />,
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
