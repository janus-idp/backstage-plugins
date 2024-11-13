import { expect, Page, test } from '@playwright/test';

import { Common } from './quayHelper';

test.describe('Quay plugin', () => {
  let page: Page;
  let common: Common;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);

    await common.loginAsGuest();
    await expect(
      page.getByRole('link', { name: 'backstage-test/test-images' }),
    ).toBeEnabled({ timeout: 20000 });
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('All columns are shown in the table', async () => {
    const columns = [
      'Tag',
      'Last Modified',
      'Security Scan',
      'Size',
      'Expires',
      'Manifest',
    ];
    const thead = page.locator('thead');

    for (const col of columns) {
      await expect(thead.getByText(col)).toBeVisible();
    }
  });

  test('Vulnerabilities are listed', async () => {
    const severity = ['High:', 'Medium:', 'Low:'];
    for (const lvl of severity) {
      await expect(page.getByRole('link', { name: lvl })).toBeVisible();
    }
  });

  test('Vulnerability details are accessible', async () => {
    await page.getByRole('link', { name: 'High' }).first().click();
    await expect(page.getByText('Vulnerabilities for')).toBeVisible({
      timeout: 15000,
    });
  });

  test('Vulnerability columns are shown', async () => {
    const columns = [
      'Advisory',
      'Severity',
      'Package Name',
      'Current Version',
      'Fixed By',
    ];

    for (const col of columns) {
      await expect(page.getByText(col)).toBeVisible();
    }
  });

  test('Vulnerability rows are shown', async () => {
    const tbody = page.locator('tbody');
    await expect(tbody.locator('tr')).toHaveCount(5);
  });

  test('Link back to repository works', async () => {
    await page.getByRole('link', { name: 'Back to repository' }).click();
    await expect(
      page.getByRole('link', { name: 'backstage-test/test-images' }),
    ).toBeEnabled();
  });
});
