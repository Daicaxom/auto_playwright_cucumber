import { Given, When, Then, DataTable, setDefaultTimeout } from '@cucumber/cucumber';
import { expect, errors } from '@playwright/test';
import { PlaywrightWorld } from '../../core/world/playwright-world';

const { TimeoutError } = errors;

const DEMOQA_TIMEOUT = Number(process.env.CUCUMBER_TIMEOUT || 60000);
const DEMOQA_BANNER_SELECTOR = '#close-fixedban';
const DEMOQA_BANNER_TIMEOUT = Number(process.env.DEMOQA_BANNER_TIMEOUT || 2000);
const TEXTBOX_OUTPUT_SELECTORS = {
  name: '#name',
  email: '#email',
  currentAddress: '#output #currentAddress',
  permanentAddress: '#output #permanentAddress',
};

setDefaultTimeout(DEMOQA_TIMEOUT);

Given('I am on the DemoQA home page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await this.goto('https://demoqa.com/');
  await this.page.waitForLoadState('domcontentloaded');
  await dismissFixedBanner(this);
});

When(
  'I navigate to the DemoQA card {string}',
  async function (this: PlaywrightWorld, cardTitle: string) {
    if (!this.page) throw new Error('Page not initialized');
    const card = this.getLocator(`div.card:has-text("${cardTitle}")`).first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await this.page.waitForLoadState('domcontentloaded');
    await dismissFixedBanner(this);
  }
);

When(
  'I open the DemoQA menu item {string}',
  async function (this: PlaywrightWorld, menuItem: string) {
    if (!this.page) throw new Error('Page not initialized');
    const item = this.getLocator('.menu-list li').filter({ hasText: menuItem });
    await item.first().scrollIntoViewIfNeeded();
    await item.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
);

When(
  'I fill the DemoQA text box form with:',
  async function (this: PlaywrightWorld, data: DataTable) {
    if (!this.page) throw new Error('Page not initialized');
    const [row] = data.hashes();
    await this.getLocator('#userName').fill(row['Full Name']);
    await this.getLocator('#userEmail').fill(row['Email']);
    await this.getLocator('#currentAddress').fill(row['Current Address']);
    await this.getLocator('#permanentAddress').fill(row['Permanent Address']);
  }
);

When('I submit the DemoQA form', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await this.getLocator('#submit').click();
  await this.page.waitForSelector('#output');
});

Then(
  'I should see the DemoQA text box output with:',
  async function (this: PlaywrightWorld, data: DataTable) {
    if (!this.page) throw new Error('Page not initialized');
    const [row] = data.hashes();
    const output = this.getLocator('#output');
    await expect(output).toBeVisible();
    await verifyTextBoxOutput(this, row);
  }
);

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
  await this.getLocator('#submit').click();
});

Then(
  'I should see the DemoQA web table row for {string}',
  async function (this: PlaywrightWorld, email: string) {
    if (!this.page) throw new Error('Page not initialized');
    const row = this.getLocator('.rt-tr-group').filter({ hasText: email });
    await expect(row).toHaveCount(1);
  }
);

When(
  'I delete the DemoQA web table row for {string}',
  async function (this: PlaywrightWorld, email: string) {
    if (!this.page) throw new Error('Page not initialized');
    const row = this.getLocator('.rt-tr-group').filter({ hasText: email }).first();
    const deleteButton = row.locator('[title="Delete"]');
    await deleteButton.click();
  }
);

Then(
  'I should not see the DemoQA web table row for {string}',
  async function (this: PlaywrightWorld, email: string) {
    if (!this.page) throw new Error('Page not initialized');
    const row = this.getLocator('.rt-tr-group').filter({ hasText: email });
    await expect(row).toHaveCount(0);
  }
);

async function dismissFixedBanner(world: PlaywrightWorld): Promise<void> {
  if (!world.page) return;
  const closeButton = world.page.locator(DEMOQA_BANNER_SELECTOR).first();
  try {
    if (await closeButton.isVisible({ timeout: DEMOQA_BANNER_TIMEOUT })) {
      await closeButton.click();
    }
  } catch (error) {
    if (error instanceof TimeoutError) {
      return;
    }
    if (error instanceof Error && error.message.includes('detached')) {
      return;
    }
    throw error;
  }
}

async function verifyTextBoxOutput(
  world: PlaywrightWorld,
  row: Record<string, string>
): Promise<void> {
  const expectedName = row['Name'] ?? row['Full Name'];
  const expectedEmail = row['Email'];
  const expectedCurrentAddress = row['Current Address'];
  const expectedPermanentAddress = row['Permanent Address'];

  await expect(world.getLocator(TEXTBOX_OUTPUT_SELECTORS.name)).toContainText(expectedName || '');
  await expect(world.getLocator(TEXTBOX_OUTPUT_SELECTORS.email)).toContainText(expectedEmail || '');
  await expect(world.getLocator(TEXTBOX_OUTPUT_SELECTORS.currentAddress)).toContainText(
    expectedCurrentAddress || ''
  );
  await expect(world.getLocator(TEXTBOX_OUTPUT_SELECTORS.permanentAddress)).toContainText(
    expectedPermanentAddress || ''
  );
}
