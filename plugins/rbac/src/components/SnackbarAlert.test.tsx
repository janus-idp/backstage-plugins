import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import { SnackbarAlert } from './SnackbarAlert';

describe('SnackbarAlert', () => {
  it('displays the Snackbar with the message when toastMessage is provided', () => {
    const toastMessage = 'Test message';
    render(
      <SnackbarAlert toastMessage={toastMessage} onAlertClose={() => {}} />,
    );

    expect(screen.getByText(toastMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(toastMessage);
  });

  it('does not display the Snackbar when toastMessage is an empty string', () => {
    render(<SnackbarAlert toastMessage="" onAlertClose={() => {}} />);

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('calls onAlertClose when the Snackbar is closed', () => {
    const onAlertClose = jest.fn();
    render(
      <SnackbarAlert toastMessage="Test message" onAlertClose={onAlertClose} />,
    );

    fireEvent.click(screen.getByLabelText(/close/i));

    expect(onAlertClose).toHaveBeenCalled();
  });
});
