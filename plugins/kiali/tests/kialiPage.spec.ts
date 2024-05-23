import { expect, Page, test } from '@playwright/test';

import CONFIG from '../dev/__fixtures__/general/config.json';
import NAMESPACES from '../dev/__fixtures__/general/namespaces.json';
import { Common } from './kialiHelper';

function filterByIstioInjectionEnabled(jsonArray: any): any {
  return jsonArray.filter(
    json =>
      (json.labels && json.labels['istio-injection'] === 'enabled') ||
      (json.name && json.name === 'istio-system'),
  );
}
const visibleNamespaces = filterByIstioInjectionEnabled(NAMESPACES);

test.describe('Kiali page', () => {
  let page: Page;
  let common: Common;
  test.describe('overview', () => {
    test.beforeEach(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      common = new Common(page);
      await common.loginAsGuest();
    });

    test('Home cluster is visible', async () => {
      await expect(page.locator('data-test=home-cluster')).toHaveText(
        CONFIG.clusters.Kubernetes.name,
      );
    });

    test('Debug info can be opened', async () => {
      await page.click('data-test=help-button');
      await page.click('text=View Debug Info');
      await expect(
        page.locator('css=[aria-describedby="Debug information"]'),
      ).toBeVisible();
    });

    test('User is visible', async () => {
      if (CONFIG.authStrategy === 'anonymous') {
        await expect(page.locator('data-test=user')).toHaveText(
          'User : anonymous',
        );
      }
      // There could be an else branch with non-anonymous auth strategies, but there is not enough test data in the fixtures for this.
    });

    test('Check namespaces visible to Kiali', async () => {
      await page.click('data-test=namespace-selector');
      for (const ns of visibleNamespaces) {
        await expect(page.locator(`ul[role="listbox"]`)).toContainText(ns.name);
      }
      await expect(page.locator('ul[role="listbox"] > li')).toHaveCount(
        visibleNamespaces.length,
      );
    });

    test('No namespaces are selected', async () => {
      await page.click('data-test=namespace-selector');
      for (const ns of visibleNamespaces) {
        await page.click(`ul[role="listbox"] > li:has-text("${ns.name}")`);
      }
      for (const ns of visibleNamespaces) {
        await expect(
          page.locator(`data-test=overview-card-${ns.name}`),
        ).toHaveCount(0);
      }
    });

    test('All namespaces are selected', async () => {
      for (const ns of visibleNamespaces) {
        await expect(
          page.locator(`data-test=overview-card-${ns.name}`),
        ).toHaveCount(1);
      }
    });
  });
});
