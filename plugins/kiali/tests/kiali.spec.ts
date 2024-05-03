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

  test.describe('kiali resources', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('/kiali-entity-card');
      page.locator('[data-test="kiali-tabbed-card"]');
    });

    test.afterAll(async ({ browser }) => {
      await browser.close();
    });

    test('Workloads content', async () => {
      expect(page.locator('[data-test="virtual-list"]')).toBeDefined();
    });

    test('Workloads Drawer', async () => {
      await page.locator('#drawer_bookinfo_details-v1').click();
      expect(page.locator('[data-test="drawer"]')).toBeDefined();
    });
  });
});
