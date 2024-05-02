import { expect, Page, test } from '@playwright/test';

test.describe('Kiali plugin', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('/kiali/overview');
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('The title contains "Kiali"', async () => {
    const h1Text = await page.textContent('h1');
    expect(h1Text).toContain('Kiali');
  });

  test('All of the important components should be visible in the tabs', async () => {
    const columns = [
      'Overview',
      'Workloads',
      'Services',
      'Applications',
      'Istio Config',
    ];
    const tabs = page.locator("[aria-label='tabs']");

    for (const col of columns) {
      await expect(tabs.getByText(col)).toBeVisible();
    }
  });
});
