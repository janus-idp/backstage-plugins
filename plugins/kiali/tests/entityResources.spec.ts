import { expect, Page, test } from '@playwright/test';

import { Common } from './kialiHelper';

test.describe('Entity resources', () => {
  let page: Page;
  let common: Common;

  test.describe('kiali resources', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      common = new Common(page);

      await common.loginAsGuest();
      await page.goto('/kiali-entity-card');
      page.locator('[data-test="kiali-tabbed-card"]');
    });

    // List container is loaded
    test('Workloads content', async () => {
      expect(page.locator('[data-test="virtual-list"]')).toBeDefined();
    });

    // Update time
    test('Update since time', async () => {
      await page
        .getByRole('button')
        .filter({ hasText: /Last 10m/ })
        .click();
      await page
        .getByRole('option')
        .filter({ hasText: /Last 1h/ })
        .click();
      expect(
        page.getByRole('button').filter({ hasText: /Last 1h/ }),
      ).toBeDefined();
    });

    // Validate columns
    test('All columns are valid', async () => {
      const columns = [
        'HEALTH',
        'NAME',
        'NAMESPACE',
        'TYPE',
        'LABELS',
        'DETAILS',
      ];
      const tableHead = page.locator('.MuiTableHead-root');
      for (let i = 0; i < columns.length; i++) {
        await expect(tableHead).toContainText(columns[i]);
      }
    });

    // Validate health
    test('heath for workload details', async () => {
      const icon = page
        .locator(
          '[data-test="VirtualItem_ClusterKubernetes_Nsbookinfo_Deployment_details-v1"]',
        )
        .locator('[data-test="health"]');
      await icon.hover({ force: true }).then(async () => {
        const tooltip = await page.locator('[role="tooltip"]');
        await expect(tooltip).toContainText(`Healthy`);
        await expect(tooltip).toContainText(`details-v1: 1 / 1`);
      });
    });

    // Validate tags
    test('tags for workload details', async () => {
      await page
        .locator(
          '[data-test="VirtualItem_ClusterKubernetes_Nsbookinfo_Deployment_details-v1"]',
        )
        .locator('.MuiChip-label')
        .hover();
      const tooltip = page.locator('.MuiTooltip-popper');
      await expect(tooltip).toContainText(`app=details`);
      await expect(tooltip).toContainText(`version=v1`);
    });

    // After click on a workload, the drawer is open
    test('Workloads Drawer', async () => {
      await page.locator('#drawer_bookinfo_details-v1').click();
      expect(page.locator('[data-test="drawer"]')).toBeDefined();
    });

    // Verify drawer date
    test('Workload Drawer Data', async () => {
      const wbadge = page.locator('[data-test="w-badge"]');
      expect(wbadge).toBeDefined();
      await expect(wbadge).toContainText('W');

      const title = page.locator('[data-test="workload-title"]');
      expect(title).toBeDefined();
      await expect(title).toContainText('details-v1');

      const health = title.locator('[data-test="health"]');
      expect(health).toBeDefined();
      await health.hover();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toContainText('Pod Status');

      const labels = page.locator('[data-test="app-label-container"]');
      await expect(labels).toContainText('app=details');
      const versionLabels = page.locator(
        '[data-test="version-label-container"]',
      );
      await expect(versionLabels).toContainText('version=v1');
      expect(page.locator('[data-test="help-icon"]')).toBeDefined();

      const appLinks = page.locator('[data-test="App_bookinfo_details"]');
      await expect(appLinks).toContainText('A');
      await expect(appLinks).toContainText('details');

      const serviceLinks = page.locator('[data-test="Service_details"]');
      await expect(serviceLinks).toContainText('S');
      await expect(serviceLinks).toContainText('details');
    });

    // The drawer is closed
    test('Close drawer', async () => {
      await page.locator('#close_drawer').click();
      expect(page.locator('[data-test="services-tab"]')).toBeDefined();
    });

    // The services tab is working
    test('Services tab', async () => {
      await page.locator('[data-test="services-tab"]').click();
      expect(page.locator('#drawer_bookinfo_details')).toBeDefined();
    });

    // Check service Istio Configs
    test('Service productpage istio config', async () => {
      const productRow = page
        .locator(
          '[data-test="VirtualItem_ClusterKubernetes_Nsbookinfo_productpage"]',
        )
        .getByRole('gridcell');
      expect(productRow.filter({ hasText: /bookinfo-gateway/ })).toBeDefined();
      expect(productRow.locator('#pfbadge-G')).toBeDefined();
      expect(productRow.filter({ hasText: /bookinfo/ })).toBeDefined();
      expect(productRow.locator('#pfbadge-VS')).toBeDefined();
    });

    // Click in Service details
    test('Service details for productpage', async () => {
      await page
        .locator(
          '[data-test="VirtualItem_ClusterKubernetes_Nsbookinfo_productpage"]',
        )
        .locator('#drawer_bookinfo_productpage')
        .click();
      expect(page.locator('[data-test="drawer"]')).toBeDefined();
      expect(page.locator('#ServiceDescriptionCard')).toBeDefined();
      expect(page.locator('#pfbadge-S')).toBeDefined();
    });

    // Navigate to workload
    test('Go to workload link', async () => {
      await page.getByRole('link', { name: 'productpage-v1' }).click();
      expect(page.locator('[data-test="drawer"]')).toBeDefined();
      expect(page.locator('#pfbadge-W')).toBeDefined();
      // Then, close the drawer
      await page.locator('#close_drawer').click();
      expect(page.locator('[data-test="services-tab"]')).toBeDefined();
    });

    // The apps tab is working
    test('Applications tab', async () => {
      await page.locator('[data-test="apps-tab"]').click();
      expect(page.locator('#drawer_bookinfo_details')).toBeDefined();
    });

    // Applications details
    test('Application details', async () => {
      await page.locator('#drawer_travel-agency_travels').click();
      expect(page.locator('[data-test="drawer"]')).toBeDefined();
      expect(page.locator('#AppDescriptionCard')).toBeDefined();
      expect(page.locator('#pfbadge-A')).toBeDefined();
    });

    // Applications details
    test('Applicatoin istio details', async () => {
      const productRow = page
        .locator(
          '[data-test="VirtualItem_ClusterKubernetes_Nsbookinfo_productpage"]',
        )
        .getByRole('gridcell');
      expect(productRow.filter({ hasText: /bookinfo-gateway/ })).toBeDefined();
      expect(productRow.locator('#pfbadge-G')).toBeDefined();
      // Then, close the drawer
      await page.locator('#close_drawer').click();
      expect(page.locator('[data-test="services-tab"]')).toBeDefined();
    });
  });
});
