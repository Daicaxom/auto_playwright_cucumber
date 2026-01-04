import { Given, When, Then, DataTable, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../../core/world/playwright-world';

setDefaultTimeout(60000);

Given('I am on the DemoQA home page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await this.goto('https://demoqa.com/');
  await this.page.waitForLoadState('domcontentloaded');
  await dismissFixedBanner(this);
});

When('I navigate to the DemoQA card {string}', async function (this: PlaywrightWorld, cardTitle: string) {
  if (!this.page) throw new Error('Page not initialized');
  const card = this.getLocator(`div.card:has-text("${cardTitle}")`).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await this.page.waitForLoadState('domcontentloaded');
  await dismissFixedBanner(this);
});

When('I open the DemoQA menu item {string}', async function (this: PlaywrightWorld, menuItem: string) {
  if (!this.page) throw new Error('Page not initialized');
  const item = this.getLocator('.menu-list li').filter({ hasText: menuItem });
  await item.first().scrollIntoViewIfNeeded();
  await item.first().click();
  await this.page.waitForLoadState('domcontentloaded');
});

When('I fill the DemoQA text box form with:', async function (this: PlaywrightWorld, data: DataTable) {
  if (!this.page) throw new Error('Page not initialized');
  const [row] = data.hashes();
  await this.getLocator('#userName').fill(row['Full Name']);
  await this.getLocator('#userEmail').fill(row['Email']);
  await this.getLocator('#currentAddress').fill(row['Current Address']);
  await this.getLocator('#permanentAddress').fill(row['Permanent Address']);
  this.sharedData['textBoxForm'] = row;
});

When('I submit the DemoQA form', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await this.getLocator('#submit').click();
  await this.page.waitForSelector('#output');
});

Then('I should see the DemoQA text box output with:', async function (this: PlaywrightWorld, data: DataTable) {
  if (!this.page) throw new Error('Page not initialized');
  const [row] = data.hashes();
  const output = this.getLocator('#output');
  await expect(output).toBeVisible();
  await expect(this.getLocator('#name')).toContainText(row['Name']);
  await expect(this.getLocator('#email')).toContainText(row['Email']);
  await expect(this.getLocator('#currentAddress')).toContainText(row['Current Address']);
  await expect(this.getLocator('#permanentAddress')).toContainText(row['Permanent Address']);
});

When('I add a DemoQA web table record:', async function (this: PlaywrightWorld, data: DataTable) {
  if (!this.page) throw new Error('Page not initialized');
  const [row] = data.hashes();
  await this.getLocator('#addNewRecordButton').click();
  await this.getLocator('#firstName').fill(row['First Name']);
  await this.getLocator('#lastName').fill(row['Last Name']);
  await this.getLocator('#userEmail').fill(row['Email']);
  await this.getLocator('#age').fill(row['Age']);
  await this.getLocator('#salary').fill(row['Salary']);
  await this.getLocator('#department').fill(row['Department']);
  this.sharedData['lastWebTableEmail'] = row['Email'];
  await this.getLocator('#submit').click();
});

Then('I should see the DemoQA web table row for {string}', async function (this: PlaywrightWorld, email: string) {
  if (!this.page) throw new Error('Page not initialized');
  const row = this.getLocator('.rt-tr-group').filter({ hasText: email });
  await expect(row).toHaveCount(1);
});

When('I delete the DemoQA web table row for {string}', async function (this: PlaywrightWorld, email: string) {
  if (!this.page) throw new Error('Page not initialized');
  const row = this.getLocator('.rt-tr-group').filter({ hasText: email }).first();
  const deleteButton = row.locator('[title="Delete"]');
  await deleteButton.click();
});

Then('I should not see the DemoQA web table row for {string}', async function (
  this: PlaywrightWorld,
  email: string
) {
  if (!this.page) throw new Error('Page not initialized');
  const row = this.getLocator('.rt-tr-group').filter({ hasText: email });
  await expect(row).toHaveCount(0);
});

async function dismissFixedBanner(world: PlaywrightWorld): Promise<void> {
  if (!world.page) return;
  const close = world.page.locator('#close-fixedban');
  if (await close.isVisible({ timeout: 2000 }).catch(() => false)) {
    await close.click();
  }
}
