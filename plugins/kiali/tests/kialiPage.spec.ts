import { expect, Page, test } from '@playwright/test';

import { Common, kialiData } from './kialiHelper';

const CONFIG = kialiData.config;
const NAMESPACES = kialiData.namespaces;
const STATUS = kialiData.status;
const BOOKINFO_APPS = kialiData.apps.bookinfo;
const BOOKINFO_SERVICES = kialiData.services.bookinfo;
const BOOKINFO_WORKLOADS = kialiData.workloads.bookinfo;

async function checkReportedItems(
  type: string,
  ns: string,
  objects: any,
  page: any,
): Promise<void> {
  const ns_card = await page.locator(`data-test=overview-card-${ns}`);
  await page.click('[aria-label="Health for"]');
  await page.click(`[data-value=${type}]`);

  const icon = await ns_card.locator('data-test=overview-app-health');
  await icon.hover();
  const list = await page.locator('data-test=overview-status');

  // Wait for the list to appear
  await page.waitForSelector('data-test=overview-status');

  let i = 0;
  for (const object of Object.entries(objects)) {
    if (i === 5) {
      break;
    }
    await icon.hover({ force: true }).then(async () => {
      await expect(list).toContainText(`${object[1].name}`);
    });
    i++;
  }
  const expected = type === 'app' ? 'application' : type;
  await expect(
    ns_card.locator(`data-test=overview-type-${type}`),
  ).toContainText(`${Object.entries(objects).length} ${expected}s`);
}

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
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      common = new Common(page);
      await common.loginAsGuest();
    });
    test.beforeEach(async () => {
      page.reload();
    });

    test('Home cluster is visible', async () => {
      await expect(page.locator('data-test=home-cluster')).toHaveText(
        CONFIG.clusters.Kubernetes.name,
      );
    });

    test('About page can be opened', async () => {
      await page.click('data-test=help-button');
      await expect(page.locator('data-test=Kiali')).toContainText(
        STATUS.status['Kiali version'],
      );
      await expect(page.locator('data-test=Kiali')).toContainText(
        STATUS.status['Kiali commit hash'],
      );
      await expect(page.locator('data-test=Kiali container')).toContainText(
        STATUS.status['Kiali container version'],
      );
      await expect(page.locator('data-test=Service Mesh')).toContainText(
        STATUS.status['Mesh name'],
      );
      await expect(page.locator('data-test=Service Mesh')).toContainText(
        STATUS.status['Mesh version'],
      );

      for (const external of STATUS.externalServices) {
        let text;
        if (external.version) {
          text = external.version;
        } else {
          text = 'N/A';
        }
        await expect(page.locator(`data-test=${external.name}`)).toContainText(
          text,
        );
      }
    });

    test('MessageCenter can be opened', async () => {
      await page.click('data-test=message-center');
      await expect(
        page.locator('data-test=message-center-modal'),
      ).toBeVisible();
      await expect(page.locator('data-test=message-center-summary')).toHaveText(
        'Notifications 2 Unread Messages',
      );
      await page.click('data-test=message-center-summary');
      await page.locator(
        'data-test=message-center-messages [data-test=drawer-message]',
      );
    });

    test('Detail of a message in MessageCenter can be opened', async () => {
      await page.click('data-test=message-center');
      await page.click('data-test=message-center-summary');
      await page.click('data-test=show-message-detail');
      await expect(page.locator('data-test=message-detail').first()).toHaveText(
        'grafana URL is not set in Kiali configuration',
      );
    });

    test('Detail of a message in MessageCenter can be closed', async () => {
      await page.click('data-test=message-center');
      await page.click('data-test=message-center-summary');
      await page.click('data-test=show-message-detail');
      await page.click('data-test=hide-message-detail');
      await expect(
        page.locator('data-test=message-detail').first(),
      ).toBeHidden();
    });

    test('Messages can be marked as read', async () => {
      await page.click('data-test=message-center');
      await page.click('data-test=message-center-summary');
      await page.click('data-test=mark-as-read');
      await expect(page.locator('data-test=message-center-summary')).toHaveText(
        'Notifications 0 Unread Messages',
      );
    });

    test('Messages can be cleared', async () => {
      await page.click('data-test=message-center');
      await page.click('data-test=message-center-summary');
      await page.click('data-test=clear-all');
      await expect(page.locator('data-test=message-center-summary')).toHaveText(
        'Notifications 0 Unread Messages',
      );
      await expect(
        page.locator('data-test=message-center-messages'),
      ).toHaveText('No Messages Available');
      await expect(page.locator('data-test=drawer-message')).toHaveCount(0);
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

    test('Namespace card should have labels', async () => {
      const ns = visibleNamespaces[0];
      const ns_card = await page.locator(`data-test=overview-card-${ns.name}`);
      const icon = await ns_card.locator('data-test=labels-info-icon');
      await icon.hover();
      const list = await page.locator('data-test=namespace-labels');

      // Wait for the list to appear
      await page.waitForSelector('data-test=namespace-labels');

      for (const [key, value] of Object.entries(ns.labels)) {
        await icon.hover({ force: true }).then(async () => {
          await expect(list).toContainText(`${key}=${value}`);
        });
      }
      await expect(ns_card.locator('#labels_info')).toContainText(
        `${Object.entries(ns.labels).length} labels`,
      );
    });

    test('Apps should be reported in the namespace card', async () => {
      const ns = BOOKINFO_APPS.namespace.name;
      await checkReportedItems('app', ns, BOOKINFO_APPS.applications, page);
    });

    test('Services should be reported in the namespace card', async () => {
      const ns = BOOKINFO_SERVICES.namespace.name;
      await checkReportedItems('service', ns, BOOKINFO_SERVICES.services, page);
    });

    test('Workloads should be reported in the namespace card', async () => {
      const ns = BOOKINFO_WORKLOADS.namespace.name;
      await checkReportedItems(
        'workload',
        ns,
        BOOKINFO_WORKLOADS.workloads,
        page,
      );
    });

    test('Healthy apps should be reported in the namespace card', async () => {
      const ns_card = await page.locator(`data-test=overview-card-bookinfo`);
      const icon = await ns_card.locator('data-test=overview-app-health');
      await icon.hover();
      await page.waitForSelector('data-test=overview-status');
      await expect(ns_card.locator('data-test=Healthy-status')).toBeDefined();
    });

    test('Degraded apps should be reported in the namespace card', async () => {
      const ns_card = await page.locator(
        `data-test=overview-card-travel-agency`,
      );
      const icon = await ns_card
        .locator('[aria-label="Overview status"]')
        .first();
      await icon.hover();
      await page.waitForSelector('data-test=overview-status');
      await expect(ns_card.locator('data-test=Degraded-status')).toBeDefined();
    });

    test('Failed apps should be reported in the namespace card', async () => {
      const ns_card = await page.locator(
        `data-test=overview-card-travel-control`,
      );
      const icon = await ns_card.locator('[aria-label="Overview status"]');
      await icon.hover();
      await page.waitForSelector('data-test=overview-status');
      await expect(ns_card.locator('data-test=Failure-status')).toBeDefined();
    });

    test('Istio config with success should be reported in the namespace card', async () => {
      const ns_card = await page.locator(
        `data-test=overview-card-travel-agency`,
      );
      await expect(
        ns_card.locator('data-test=validation-icon-correct'),
      ).toBeVisible();
    });

    test('Istio config with warning should be reported in the namespace card', async () => {
      const ns_card = await page.locator(
        `data-test=overview-card-travel-control`,
      );
      await expect(
        ns_card.locator('data-test=validation-icon-warning'),
      ).toBeVisible();
    });

    test('Istio config with error should be reported in the namespace card', async () => {
      const ns_card = await page.locator(`data-test=overview-card-bookinfo`);
      await expect(
        ns_card.locator('data-test=validation-icon-error'),
      ).toBeVisible();
    });
  });
});
