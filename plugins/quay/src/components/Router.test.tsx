import React from 'react';

import { renderInTestApp } from '@backstage/test-utils';

import { QuayRepository } from './QuayRepository';
import { QuayTagPage } from './QuayTagPage';
import { Router } from './Router';

jest.mock('./QuayRepository', () => ({
  QuayRepository: jest.fn(() => null),
}));

jest.mock('./QuayTagPage', () => ({
  QuayTagPage: jest.fn(() => null),
}));

describe('Router', () => {
  beforeEach(() => {
    (QuayRepository as jest.Mock).mockClear();
    (QuayTagPage as jest.Mock).mockClear();
  });
  describe('/', () => {
    it('should render the QuayRepository', async () => {
      await renderInTestApp(<Router />);
      expect(QuayRepository).toHaveBeenCalled();
    });
  });

  describe('/tag/:digestId', () => {
    it('should render the QuayTagPage page', async () => {
      await renderInTestApp(<Router />, {
        routeEntries: ['/tag/my-digest'],
      });
      expect(QuayTagPage).toHaveBeenCalled();
    });
  });
});
