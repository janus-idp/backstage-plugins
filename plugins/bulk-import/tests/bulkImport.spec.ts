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
    await expect(page.getByText('Added repositories (1)')).toBeVisible();
    const columns = [
      'Name',
      'Repo URL',
      'Organization',
      'Status',
      'Last Updated',
      'Actions',
    ];
    const thead = page.locator('thead');

    for (const col of columns) {
      await expect(thead.getByText(col)).toBeVisible();
    }
  });

  test('Edit icon, Delete icon and Refresh icon are shown', async () => {
    await expect(
      page.locator('span[data-testid="edit-catalog-info"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('span[data-testid="delete-repository"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('span[data-testid="refresh-repository"]').first(),
    ).toBeVisible();
  });

  test('Edit catalog-info side panel is shown', async () => {
    await page.locator('span[data-testid="edit-catalog-info"]').first().click();
    await expect(
      page.getByRole('heading', { name: 'org/desert/Gingerbread' }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId('preview-file-sidebar')
        .getByText('Pull request details'),
    ).toBeVisible();
    await page.locator('button[title="Close the drawer"]').click();

    await expect(
      page.getByRole('heading', {
        name: 'Added repositories (1)',
        exact: true,
      }),
    ).toBeVisible({
      timeout: 20000,
    });
  });

  test('Remove repository alert window is shown', async () => {
    await page.locator('span[data-testid="delete-repository"]').first().click();
    await expect(
      page.getByText('Remove Gingerbread repository?'),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Removing a repository erases all associated information from the Catalog page.',
      ),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    await page.locator('button[title="Close"]').click();

    await expect(
      page.getByRole('heading', {
        name: 'Added repositories (1)',
        exact: true,
      }),
    ).toBeVisible({
      timeout: 20000,
    });
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
      page.getByRole('heading', { name: 'Selected repositories (9)' }),
    ).toBeVisible({
      timeout: 20000,
    });
    await page.locator(`button`).filter({ hasText: 'Organization' }).click();
    await expect(
      page.getByRole('heading', { name: 'Selected repositories (9)' }),
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
      page.getByRole('heading', { name: 'Selected repositories (9)' }),
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
      page.getByRole('heading', { name: 'Selected repositories (2)' }),
    ).toBeVisible();

    await page.locator('button[aria-labelledby="select-from-drawer"]').click();

    await expect(
      page.getByRole('heading', { name: 'Selected repositories (2)' }),
    ).toBeVisible();
    await expect(
      page.locator('tr:has-text("org/pet-store-boston") >> text=2'),
    ).toBeVisible();
    await expect(
      page.locator('tr:has-text("org/pet-store-boston") >> a >> text=Edit'),
    ).toBeVisible();

    await page.getByPlaceholder('Search').fill('org/pet-store-boston');
    await page.locator('a[data-testid="preview-files"]').click();
    await expect(page.getByRole('tab', { name: 'online-store' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'pet-app' })).toBeVisible();
    await expect(
      page
        .getByTestId('preview-file-sidebar')
        .getByText('Pull request details'),
    ).toBeVisible();
  });
});
