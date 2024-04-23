import React from 'react';

import { render, screen } from '@testing-library/react';

import { HealthStatus, SyncStatusCode } from '../../../types';
import { AppHealthIcon, SyncIcon } from '../StatusIcons';

describe('StatusIcons', () => {
  describe('Sync Status', () => {
    test('should return application sync icon', () => {
      render(<SyncIcon status="Synced" />);
      screen.getByTestId('synced-icon');

      render(<SyncIcon status="OutOfSync" />);
      screen.getByTestId('outofsync-icon');

      render(<SyncIcon status="Unknown" />);
      screen.getByTestId('unknown-icon');

      render(<SyncIcon status={'invalid' as SyncStatusCode} />);
      screen.getByTestId('unknown-icon');
    });
  });

  describe('Health Status', () => {
    test('should return application health status icon', () => {
      render(<AppHealthIcon status={HealthStatus.Healthy} />);
      screen.getByTestId('healthy-icon');

      render(<AppHealthIcon status={HealthStatus.Suspended} />);
      screen.getByTestId('suspended-icon');

      render(<AppHealthIcon status={HealthStatus.Progressing} />);
      screen.getByTestId('progressing-icon');

      render(<AppHealthIcon status={HealthStatus.Missing} />);
      screen.getByTestId('missing-icon');

      render(<AppHealthIcon status={HealthStatus.Degraded} />);
      screen.getByTestId('degraded-icon');

      render(<AppHealthIcon status={HealthStatus.Unknown} />);
      screen.getByTestId('unknown-icon');
    });
  });
});
