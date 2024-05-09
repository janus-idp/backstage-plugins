import { expect, Page, test } from '@playwright/test';

import { Common } from './kialiHelper';

test.describe('Kiali plugin', () => {
  let page: Page;
  let common: Common;
  test.describe('kiali errors', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      common = new Common(page);

      await common.loginAsGuest();
      await page.goto('/kiali-error');
      await page.locator('[data-test="Kiali Errors"]');
    });

    test.afterAll(async ({ browser }) => {
      await browser.close();
    });

    test('Networking error', async () => {
      await expect(
        page.locator('[data-test="Warning: Error reaching Kiali"]'),
      ).toBeDefined();
    });
  });
});
