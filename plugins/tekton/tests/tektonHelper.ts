import { expect, Page } from '@playwright/test';

export class Common {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyHeading(heading: string) {
    const headingLocator = this.page
      .locator('h1, h2, h3, h4, h5, h6')
      .filter({ hasText: heading })
      .first();
    await headingLocator.waitFor({ state: 'visible', timeout: 30000 });
    await expect(headingLocator).toBeVisible();
  }

  async clickButton(
    label: string,
    options: { exact?: boolean; force?: boolean } = {
      exact: true,
      force: false,
    },
  ) {
    const muiButtonLabel = 'span[class^="MuiButton-label"]';
    const selector = `${muiButtonLabel}:has-text("${label}")`;
    const button = this.page
      .locator(selector)
      .getByText(label, { exact: options.exact })
      .first();
    await button.waitFor({ state: 'visible' });

    if (options?.force) {
      await button.click({ force: true });
    } else {
      await button.click();
    }
  }

  async waitForSideBarVisible() {
    await this.page.waitForSelector('nav a', { timeout: 120000 });
  }

  async loginAsGuest() {
    await this.page.goto('/');
    // TODO - Remove it after https://issues.redhat.com/browse/RHIDP-2043. A Dynamic plugin for Guest Authentication Provider needs to be created
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await this.verifyHeading('Select a sign-in method');
    await this.clickButton('Enter');
    await this.waitForSideBarVisible();
  }
}
