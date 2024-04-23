import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import AppHealthStatus from '../AppHealthStatus';

describe('AppHealthStatus', () => {
  test('should return default component', () => {
    render(<AppHealthStatus app={mockApplication} />);

    screen.getByTestId('healthy-icon');
    screen.getByText('Healthy');
  });

  test('should return application health chip component', () => {
    render(<AppHealthStatus app={mockApplication} isChip />);

    screen.getByTestId('app-health-status-chip');
  });
});
