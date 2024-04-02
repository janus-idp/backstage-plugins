import { expect, Page, test } from '@playwright/test';

test.describe('Bulk import plugin', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Bulk import' })).toBeEnabled({
      timeout: 20000,
    });
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('Repositories tab is shown', async () => {
    await expect(page.getByText('Added repositories (0)')).toBeVisible();
    const columns = [
      'Name',
      'Repo URL',
      'Organization',
      'Status',
      'Last Updated',
    ];
    const thead = page.locator('thead');

    for (const col of columns) {
      await expect(thead.getByText(col)).toBeVisible();
    }
  });
});
