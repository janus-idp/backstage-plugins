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
  test('Add button is shown', async () => {
    await page.locator(`a`).filter({ hasText: 'Add' }).click();
    await expect(
      page.getByRole('heading', { name: 'Add repositories' }),
    ).toBeVisible({
      timeout: 20000,
    });
  });

  test('Add repositories page is shown', async () => {
    await expect(
      page.getByRole('heading', {
        name: 'Steps of adding repositories into Red Hat Developer Hub',
      }),
    ).toBeVisible({
      timeout: 20000,
    });
    await page.mouse.wheel(0, 200);
    await expect(
      page.getByRole('heading', { name: 'Selected repositories (0)' }),
    ).toBeVisible({
      timeout: 20000,
    });
    let columns = ['Name', 'URL', 'Organization', 'catalog-info.yaml'];
    let thead = page.locator('thead');

    for (const col of columns) {
      await expect(thead.getByText(col)).toBeVisible();
    }
    await page.click('input[aria-label="select all repositories"]');
    await expect(
      page.getByRole('heading', { name: 'Selected repositories (6)' }),
    ).toBeVisible({
      timeout: 20000,
    });
    await page.locator(`button`).filter({ hasText: 'Organization' }).click();
    await expect(
      page.getByRole('heading', { name: 'Selected repositories (0)' }),
    ).toBeVisible({
      timeout: 20000,
    });
    columns = ['Name', 'URL', 'Selected repositories', 'catalog-info.yaml'];
    thead = page.locator('thead');

    for (const col of columns) {
      await expect(thead.getByText(col)).toBeVisible();
    }
  });
});
