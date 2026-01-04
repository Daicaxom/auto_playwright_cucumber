import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../core/world/playwright-world';

Given('I am on the DemoQA home page', async function (this: PlaywrightWorld) {
  throw new Error('Pending implementation');
});

When('I navigate to the DemoQA card {string}', async function (this: PlaywrightWorld, _cardTitle: string) {
  throw new Error('Pending implementation');
});

When('I open the DemoQA menu item {string}', async function (this: PlaywrightWorld, _menuItem: string) {
  throw new Error('Pending implementation');
});

When('I fill the DemoQA text box form with:', async function (
  this: PlaywrightWorld,
  _data: DataTable
) {
  throw new Error('Pending implementation');
});

When('I submit the DemoQA form', async function (this: PlaywrightWorld) {
  throw new Error('Pending implementation');
});

Then('I should see the DemoQA text box output with:', async function (
  this: PlaywrightWorld,
  _data: DataTable
) {
  throw new Error('Pending implementation');
});

When('I add a DemoQA web table record:', async function (this: PlaywrightWorld, _data: DataTable) {
  throw new Error('Pending implementation');
});

Then('I should see the DemoQA web table row for {string}', async function (
  this: PlaywrightWorld,
  _email: string
) {
  throw new Error('Pending implementation');
});

When('I delete the DemoQA web table row for {string}', async function (this: PlaywrightWorld, _email: string) {
  throw new Error('Pending implementation');
});

Then('I should not see the DemoQA web table row for {string}', async function (
  this: PlaywrightWorld,
  _email: string
) {
  throw new Error('Pending implementation');
});
