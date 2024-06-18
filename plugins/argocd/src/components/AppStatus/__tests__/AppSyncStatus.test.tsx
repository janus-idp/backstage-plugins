import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import AppSyncStatus from '../AppSyncStatus';

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: () => (_theme: any) => {
    return {
      success: 'success',
      error: 'error',
      running: 'running',
      warning: 'warning',
      pending: 'pending',
    };
  },
}));

describe('AppSyncStatus', () => {
  test('should return default component', () => {
    render(<AppSyncStatus app={mockApplication} />);

    expect(screen.getByTestId('synced-icon')).toBeInTheDocument();
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  test('should return application health chip component', () => {
    render(<AppSyncStatus app={mockApplication} isChip />);

    expect(screen.getByTestId('app-sync-status-chip')).toBeInTheDocument();
  });
});
