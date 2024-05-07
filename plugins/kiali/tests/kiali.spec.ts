import { expect, Page, test } from '@playwright/test';

test.describe('Kiali plugin', () => {
  let page: Page;
  test.describe('kiali errors', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('/kiali-error');
      page.locator('[data-test="Kiali Errors"]');
    });

    test.afterAll(async ({ browser }) => {
      await browser.close();
    });

    test('Networking error', async () => {
      expect(
        page.locator('[data-test="Warning: Error reaching Kiali"]'),
      ).toBeDefined();
    });
  });
});
