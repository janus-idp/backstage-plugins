import { expect, Page } from '@playwright/test';

export const verifyCellsInTable = async (
  cellIdentifier: (string | RegExp)[],
  page: Page,
) => {
  for (const text of cellIdentifier) {
    const cellLocator = page
      .locator('td[class*="MuiTableCell-root"]')
      .filter({ hasText: text });
    const count = await cellLocator.count();

    if (count === 0) {
      throw new Error(
        `Expected at least one cell with text matching ${text}, but none were found.`,
      );
    }

    // Checks if all matching cells are visible.
    for (let i = 0; i < count; i++) {
      await expect(cellLocator.nth(i)).toBeVisible();
    }
  }
};

export const verifyColumnHeading = async (
  columns: (string | RegExp)[],
  page: Page,
) => {
  const thead = page.locator('thead');
  for (const col of columns) {
    await expect(
      thead.getByRole('columnheader', { name: col, exact: true }),
    ).toBeVisible();
  }
};

export const clickButton = async (
  label: string,
  page: Page,
  options: { exact?: boolean; force?: boolean } = {
    exact: true,
    force: false,
  },
) => {
  const selector = `span[class^="MuiButton-label"]:has-text("${label}")`;
  const button = page
    .locator(selector)
    .getByText(label, { exact: options.exact })
    .first();
  await button.waitFor({ state: 'visible' });

  if (options?.force) {
    await button.click({ force: true });
  } else {
    await button.click();
  }
};

export const verifyText = async (
  text: string | RegExp,
  page: Page,
  exact: boolean = true,
) => {
  const element = page.getByText(text, { exact: exact }).first();
  await element.scrollIntoViewIfNeeded();
  await expect(element).toBeVisible();
};
