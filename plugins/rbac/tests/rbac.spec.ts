import { expect, Page, test } from '@playwright/test';

import {
  Common,
  verifyCellsInTable,
  verifyColumnHeading,
  verifyText,
} from './rbacHelper';

test.describe('RBAC plugin', () => {
  let page: Page;
  let common: Common;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);
    await common.loginAsGuest();
    const navSelector = 'nav [aria-label="Administration"]';
    await page.locator(navSelector).click();
    await expect(
      page.getByRole('heading', { name: 'Administration' }),
    ).toBeVisible({ timeout: 20000 });
    const rbacTabSelector = page.getByRole('tab', { name: 'RBAC' });
    await expect(rbacTabSelector).toBeVisible({
      timeout: 20000,
    });
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('Should show 2 roles in the list, column headings and cells', async () => {
    await expect(
      page.getByRole('heading', { name: 'All roles (2)' }),
    ).toBeVisible({ timeout: 20000 });

    const columns = [
      'Name',
      'Users and groups',
      'Permission Policies',
      'Actions',
    ];
    await verifyColumnHeading(columns, page);

    const roleName = new RegExp(/^(role|user|group):[a-zA-Z]+\/[\w@*.~-]+$/);
    const usersAndGroups = new RegExp(
      /^(1\s(user|group)|[2-9]\s(users|groups))(, (1\s(user|group)|[2-9]\s(users|groups)))?$/,
    );
    const permissionPolicies = /\d/;
    const cellIdentifier = [roleName, usersAndGroups, permissionPolicies];

    await verifyCellsInTable(cellIdentifier, page);
  });

  test('View details of role', async () => {
    const roleName = 'role:default/rbac_admin';
    await page.locator(`a`).filter({ hasText: roleName }).click();
    await expect(page.getByRole('heading', { name: roleName })).toBeVisible({
      timeout: 20000,
    });

    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('About')).toBeVisible();

    // verify users and groups table
    await expect(
      page.getByRole('heading', { name: 'Users and groups (1 user, 1 group)' }),
    ).toBeVisible({ timeout: 20000 });

    await verifyColumnHeading(['Name', 'Type', 'Members'], page);

    const name = new RegExp(/^(\w+)$/);
    const type = new RegExp(/^(User|Group)$/);
    const members = /^(-|\d+)$/;
    const userGroupCellIdentifier = [name, type, members];
    await verifyCellsInTable(userGroupCellIdentifier, page);

    // verify permission policy table
    await expect(
      page.getByRole('heading', { name: 'Permission policies (5)' }),
    ).toBeVisible({ timeout: 20000 });
    await verifyColumnHeading(['Plugin', 'Permission', 'Policies'], page);
    const policies =
      /^(?:(Read|Create|Update|Delete)(?:, (?:Read|Create|Update|Delete))*|Use)$/;
    await verifyCellsInTable([policies], page);

    await page.locator(`a`).filter({ hasText: 'RBAC' }).click();
  });

  test('Edit user from overview page', async () => {
    const roleName = 'role:default/rbac_admin';
    await page.locator(`a`).filter({ hasText: roleName }).click();
    await expect(page.getByRole('heading', { name: roleName })).toBeVisible({
      timeout: 20000,
    });
    await page.getByRole('tab', { name: 'Overview' }).click();

    const RoleOverviewPO = {
      updatePolicies: 'span[data-testid="update-policies"]',
      updateMembers: 'span[data-testid="update-members"]',
    };

    await page.locator(RoleOverviewPO.updateMembers).click();
    await expect(page.getByRole('heading', { name: 'Edit Role' })).toBeVisible({
      timeout: 20000,
    });
    await page
      .getByPlaceholder('Search by user name or group name')
      .fill('Guest User');
    await page.getByText('Guest User').click();
    await expect(
      page.getByRole('heading', {
        name: 'Users and groups (2 users, 1 group)',
      }),
    ).toBeVisible({
      timeout: 20000,
    });
    await common.clickButton('Next');
    await common.clickButton('Next');
    await common.clickButton('Save');
    await verifyText('Role role:default/rbac_admin updated successfully', page);

    // alert doesn't show up after Cancel button is clicked
    await page.locator(RoleOverviewPO.updateMembers).click();
    await expect(page.getByRole('heading', { name: 'Edit Role' })).toBeVisible({
      timeout: 20000,
    });
    await common.clickButton('Cancel');
    await expect(page.getByRole('alert')).toHaveCount(0);

    // edit/update policies
    await page.locator(RoleOverviewPO.updatePolicies).click();
    await expect(page.getByRole('heading', { name: 'Edit Role' })).toBeVisible({
      timeout: 20000,
    });

    await page.getByTestId('AddIcon').click();
    await page.getByPlaceholder('Select a plugin').last().click();
    await page.getByText('scaffolder').click();
    await page.getByPlaceholder('Select a resource type').last().click();
    await page.getByText('scaffolder-action').click();

    await common.clickButton('Next');
    await common.clickButton('Save');
    await verifyText('Role role:default/rbac_admin updated successfully', page);

    await page.locator(`a`).filter({ hasText: 'RBAC' }).click();
  });

  test('Create role from rolelist page with simple/conditional permission policies', async () => {
    await expect(
      page.getByRole('heading', { name: 'All roles (2)' }),
    ).toBeVisible({ timeout: 20000 });

    // create-role
    await page.getByTestId('create-role').click();
    await expect(
      page.getByRole('heading', { name: 'Create role' }),
    ).toBeVisible({ timeout: 20000 });

    await page.fill('input[name="name"]', 'sample-role-1');
    await page.fill('textarea[name="description"]', 'Test Description data');
    await common.clickButton('Next');

    await page
      .getByPlaceholder('Search by user name or group name')
      .fill('Guest Use');
    await page.getByText('Guest User').click();
    await expect(
      page.getByRole('heading', {
        name: 'Users and groups (1 user)',
      }),
    ).toBeVisible({
      timeout: 20000,
    });
    await common.clickButton('Next');

    await page.getByPlaceholder('Select a plugin').first().click();
    await page.getByRole('option', { name: 'permission' }).click();
    await page.getByPlaceholder('Select a resource type').first().click();
    await page.getByText('policy-entity').click();

    await page.getByRole('button', { name: 'Add' }).click();

    await page.getByPlaceholder('Select a plugin').last().click();
    await page.getByText('scaffolder').click();
    await page.getByPlaceholder('Select a resource type').last().click();
    await page.getByText('scaffolder-action').click();
    await page.getByText('Configure access').first().click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_ACTION_ID').click();
    await page.getByLabel('actionId').fill('temp');
    await page.getByTestId('save-conditions').click();
    await expect(page.getByText('Configure access (1 rule)')).toBeVisible({
      timeout: 20000,
    });

    await page.getByRole('button', { name: 'Add' }).click();

    await page.getByPlaceholder('Select a plugin').last().click();
    await page.getByText('catalog').click();
    await page.getByPlaceholder('Select a resource type').last().click();
    await page.getByText('catalog-entity').click();
    await page.getByText('Configure access').last().click();
    await page.getByRole('button', { name: 'AllOf' }).click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_LABEL').click();
    await page.getByLabel('label').fill('temp');
    await page.getByRole('button', { name: 'Add rule' }).click();
    await page.getByPlaceholder('Select a rule').last().click();
    await page.getByText('HAS_SPEC').click();
    await page.getByLabel('key').fill('test');
    await page.getByTestId('save-conditions').click();
    await expect(page.getByText('Configure access (2 rules)')).toBeVisible({
      timeout: 20000,
    });

    await common.clickButton('Next');

    await common.clickButton('Create');
    await verifyText(
      'Role role:default/sample-role-1 created successfully',
      page,
    );
  });
});
