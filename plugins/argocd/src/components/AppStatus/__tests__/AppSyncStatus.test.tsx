import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import AppSyncStatus from '../AppSyncStatus';

describe('AppSyncStatus', () => {
  test('should return default component', () => {
    render(<AppSyncStatus app={mockApplication} />);

    screen.getByTestId('synced-icon');
    screen.getByText('Synced');
  });

  test('should return application health chip component', () => {
    render(<AppSyncStatus app={mockApplication} isChip />);

    screen.getByTestId('app-sync-status-chip');
  });
});
