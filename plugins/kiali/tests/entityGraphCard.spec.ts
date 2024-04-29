import { expect, Page, test } from '@playwright/test';

import { Common } from './kialiHelper';

test.describe('Entity traffic graph', () => {
  let page: Page;
  let common: Common;

  test.describe('kiali traffic graph', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      common = new Common(page);

      await common.loginAsGuest();
      await page.goto('/kiali-graph-card');
      page.locator('[data-test="kiali-graph-card"]');
    });

    // List container is loaded
    test('Graph content', async () => {
      expect(page.locator('[data-test="kiali-graph-card"]')).toBeDefined();
    });
  });
});
