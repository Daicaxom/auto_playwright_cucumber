import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../../../../framework/src/core/world/playwright-world';
import { ElementsPage } from '../pages/elements.page';

/**
 * DemoQA Elements Step Definitions
 * Handles interactions with DemoQA elements section
 */

Given('I am on the DemoQA home page', { timeout: 90000 }, async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  
  const elementsPage = new ElementsPage(this.page);
  await elementsPage.navigate();
  this.logger.info('Navigated to DemoQA home page');
});

When('I navigate to the DemoQA card {string}', async function (this: PlaywrightWorld, cardName: string) {
  if (!this.page) throw new Error('Page not initialized');

  const elementsPage = new ElementsPage(this.page);
  await elementsPage.navigateToCard(cardName);
  this.logger.info('Navigated to DemoQA card', { cardName });
});

When('I open the DemoQA menu item {string}', async function (this: PlaywrightWorld, menuItem: string) {
  if (!this.page) throw new Error('Page not initialized');

  const elementsPage = new ElementsPage(this.page);
  await elementsPage.openMenuItem(menuItem);
  this.logger.info('Opened DemoQA menu item', { menuItem });
});

When(
  'I fill the DemoQA text box form with:',
  async function (this: PlaywrightWorld, dataTable: DataTable) {
    if (!this.page) throw new Error('Page not initialized');

    const [data] = dataTable.hashes();
    const elementsPage = new ElementsPage(this.page);
    await elementsPage.fillTextBoxForm({
      fullName: data['Full Name'],
      email: data['Email'],
      currentAddress: data['Current Address'],
      permanentAddress: data['Permanent Address'],
    });

    this.logger.info('Filled DemoQA text box form', data);
  }
);

When('I submit the DemoQA form', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const elementsPage = new ElementsPage(this.page);
  await elementsPage.submitTextBoxForm();
  this.logger.info('Submitted DemoQA form');
});

Then(
  'I should see the DemoQA text box output with:',
  async function (this: PlaywrightWorld, dataTable: DataTable) {
    if (!this.page) throw new Error('Page not initialized');

    const [expected] = dataTable.hashes();
    const elementsPage = new ElementsPage(this.page);
    await elementsPage.verifyTextBoxOutput({
      name: expected['Name'],
      email: expected['Email'],
      currentAddress: expected['Current Address'],
      permanentAddress: expected['Permanent Address'],
    });

    this.logger.info('Verified DemoQA text box output', expected);
  }
);

When(
  'I add a DemoQA web table record:',
  async function (this: PlaywrightWorld, dataTable: DataTable) {
    if (!this.page) throw new Error('Page not initialized');

    const [data] = dataTable.hashes();
    const elementsPage = new ElementsPage(this.page);
    await elementsPage.addWebTableRecord({
      firstName: data['First Name'],
      lastName: data['Last Name'],
      email: data['Email'],
      age: data['Age'],
      salary: data['Salary'],
      department: data['Department'],
    });

    this.logger.info('Added DemoQA web table record', data);
  }
);

Then(
  'I should see the DemoQA web table row for {string}',
  async function (this: PlaywrightWorld, email: string) {
    if (!this.page) throw new Error('Page not initialized');

    const elementsPage = new ElementsPage(this.page);
    await elementsPage.verifyWebTableRowExists(email);
    this.logger.info('Verified DemoQA web table row exists', { email });
  }
);

When(
  'I delete the DemoQA web table row for {string}',
  async function (this: PlaywrightWorld, email: string) {
    if (!this.page) throw new Error('Page not initialized');

    const elementsPage = new ElementsPage(this.page);
    await elementsPage.deleteWebTableRow(email);
    this.logger.info('Deleted DemoQA web table row', { email });
  }
);

Then(
  'I should not see the DemoQA web table row for {string}',
  async function (this: PlaywrightWorld, email: string) {
    if (!this.page) throw new Error('Page not initialized');

    const elementsPage = new ElementsPage(this.page);
    await elementsPage.verifyWebTableRowNotExists(email);
    this.logger.info('Verified DemoQA web table row does not exist', { email });
  }
);
