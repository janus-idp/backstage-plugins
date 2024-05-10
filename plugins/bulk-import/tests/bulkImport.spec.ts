import { expect, Page, test } from '@playwright/test';

import { Common } from './bulkImportHelper';

test.describe('Bulk import plugin', () => {
  let page: Page;
  let common: Common;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);

    await common.loginAsGuest();

    await expect(page.getByRole('link', { name: 'Bulk import' })).toBeEnabled({
      timeout: 20000,
    });
  });

  test.afterAll(async ({ browser }) => {
    test.setTimeout(60000);
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
      page.getByRole('heading', { name: 'Add repositories', exact: true }),
    ).toBeVisible({
      timeout: 20000,
    });
  });

  test('Add repositories page is shown', async () => {
    await expect(
      page.getByRole('heading', {
        name: 'Add repositories to Red Hat Developer Hub in 5 steps',
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
      page.getByRole('heading', { name: 'Selected repositories (17)' }),
    ).toBeVisible({
      timeout: 20000,
    });
    await page.locator(`button`).filter({ hasText: 'Organization' }).click();
    await expect(
      page.getByRole('heading', { name: 'Selected repositories (17)' }),
    ).toBeVisible({
      timeout: 20000,
    });
    columns = ['Name', 'URL', 'Selected repositories', 'catalog-info.yaml'];
    thead = page.locator('thead');

    for (const col of columns) {
      await expect(thead.getByText(col)).toBeVisible();
    }
  });

  test('Select Repositories side panel is shown', async () => {
    await page.locator('button[type="button"][value="repository"]').click();
    await expect(
      page.getByRole('heading', { name: 'Selected repositories (17)' }),
    ).toBeVisible({
      timeout: 20000,
    });
    await page.click('input[aria-label="select all repositories"]');
    await expect(
      page.getByRole('heading', { name: 'Selected repositories (0)' }),
    ).toBeVisible({
      timeout: 20000,
    });
    await page.locator(`button`).filter({ hasText: 'Organization' }).click();
    await expect(
      page.locator('tr:has-text("org/pet-store-boston") >> text=None'),
    ).toBeVisible();
    await page
      .locator('tr:has-text("org/pet-store-boston") >> text=Select')
      .click();
    await expect(
      page.getByRole('heading', { name: 'org/pet-store-boston' }),
    ).toBeVisible({
      timeout: 20000,
    });

    const columns = ['Name', 'URL'];
    const thead = page.locator(
      'table[aria-labelledby="drawer-repositories-table"] >> thead',
    );

    for (const col of columns) {
      const thLocator = thead.locator(`th:has-text("${col}")`);
      await expect(thLocator).toBeVisible();
    }
  });

  test('Cancel button closes side panel', async () => {
    await page
      .locator('button[aria-labelledby="cancel-drawer-select"]')
      .click();

    await expect(
      page.getByRole('heading', { name: 'org/pet-store-boston' }),
    ).not.toBeVisible({
      timeout: 20000,
    });

    await expect(
      page.getByRole('heading', { name: 'Selected repositories (0)' }),
    ).toBeVisible({
      timeout: 20000,
    });
  });

  test('Side panel selected repositories are shown in table', async () => {
    await page
      .locator('tr:has-text("org/pet-store-boston") >> text=Select')
      .click();
    await expect(
      page.getByRole('heading', { name: 'org/pet-store-boston' }),
    ).toBeVisible({
      timeout: 20000,
    });
    await page.click('input[aria-label="select all repositories"]');
    await expect(
      page.getByRole('heading', { name: 'Selected repositories (3)' }),
    ).toBeVisible();

    await page.locator('button[aria-labelledby="select-from-drawer"]').click();

    await expect(
      page.getByRole('heading', { name: 'Selected repositories (3)' }),
    ).toBeVisible();
    await expect(
      page.locator('tr:has-text("org/pet-store-boston") >> text=3'),
    ).toBeVisible();
    await expect(
      page.locator('tr:has-text("org/pet-store-boston") >> a >> text=Edit'),
    ).toBeVisible();
  });
});
