import { expect, Page, test } from '@playwright/test';

test.describe('Entity resources', () => {
  let page: Page;

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

    test('Close drawer', async () => {
      await page.locator('#close_drawer').click();
      expect(page.locator('[data-test="service-tab"]')).toBeDefined();
    });

    test('Services tab', async () => {
      await page.locator('[data-test="service-tab"]').click();
      expect(page.locator('#drawer_bookinfo_details')).toBeDefined();
    });
  });
});
