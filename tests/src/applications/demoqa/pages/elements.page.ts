import { Page, expect } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

/**
 * DemoQA Elements Page Object
 * Handles interactions with DemoQA elements section
 */
export class ElementsPage extends BasePage {
  private readonly selectors = {
    card: '.card-body',
    menuItem: '.menu-list .btn',
    // Text Box
    textBox: {
      fullName: '#userName',
      email: '#userEmail',
      currentAddress: '#currentAddress',
      permanentAddress: '#permanentAddress',
      submitButton: '#submit',
      output: '#output',
      outputName: '#name',
      outputEmail: '#email',
      outputCurrentAddress: '#currentAddress',
      outputPermanentAddress: '#permanentAddress',
    },
    // Web Tables
    webTable: {
      addButton: '#addNewRecordButton',
      firstName: '#firstName',
      lastName: '#lastName',
      email: '#userEmail',
      age: '#age',
      salary: '#salary',
      department: '#department',
      submitButton: '#submit',
      tableRow: '.rt-tr-group',
      deleteButton: '[title="Delete"]',
    },
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to DemoQA home page
   * Uses extended timeout for external site reliability
   */
  async navigate(): Promise<void> {
    try {
      await this.page.goto('https://demoqa.com/', { timeout: 60000 });
      await this.waitForPageLoad();
    } catch (error) {
      // Retry once if initial navigation fails
      await this.page.goto('https://demoqa.com/', { timeout: 60000 });
      await this.waitForPageLoad();
    }
  }

  /**
   * Navigate to a specific card (Elements, Forms, etc.)
   */
  async navigateToCard(cardName: string): Promise<void> {
    const card = this.getLocator(this.selectors.card).filter({ hasText: cardName });
    await card.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Open a menu item (Text Box, Web Tables, etc.)
   */
  async openMenuItem(menuItem: string): Promise<void> {
    const item = this.getLocator(this.selectors.menuItem).filter({ hasText: menuItem });
    await item.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ===== Text Box Methods =====

  /**
   * Fill text box form
   */
  async fillTextBoxForm(data: {
    fullName: string;
    email: string;
    currentAddress: string;
    permanentAddress: string;
  }): Promise<void> {
    await this.fill(this.selectors.textBox.fullName, data.fullName);
    await this.fill(this.selectors.textBox.email, data.email);
    await this.fill(this.selectors.textBox.currentAddress, data.currentAddress);
    await this.fill(this.selectors.textBox.permanentAddress, data.permanentAddress);
  }

  /**
   * Submit text box form
   */
  async submitTextBoxForm(): Promise<void> {
    await this.click(this.selectors.textBox.submitButton);
  }

  /**
   * Verify text box output
   */
  async verifyTextBoxOutput(expected: {
    name: string;
    email: string;
    currentAddress: string;
    permanentAddress: string;
  }): Promise<void> {
    await expect(this.getLocator(this.selectors.textBox.output)).toBeVisible();

    const outputName = await this.getText(this.selectors.textBox.outputName);
    const outputEmail = await this.getText(this.selectors.textBox.outputEmail);
    const outputCurrentAddress = await this.getText(`${this.selectors.textBox.output} p:nth-of-type(3)`);
    const outputPermanentAddress = await this.getText(`${this.selectors.textBox.output} p:nth-of-type(4)`);

    expect(outputName).toContain(expected.name);
    expect(outputEmail).toContain(expected.email);
    expect(outputCurrentAddress).toContain(expected.currentAddress);
    expect(outputPermanentAddress).toContain(expected.permanentAddress);
  }

  // ===== Web Tables Methods =====

  /**
   * Add web table record
   */
  async addWebTableRecord(data: {
    firstName: string;
    lastName: string;
    email: string;
    age: string;
    salary: string;
    department: string;
  }): Promise<void> {
    await this.click(this.selectors.webTable.addButton);
    await this.fill(this.selectors.webTable.firstName, data.firstName);
    await this.fill(this.selectors.webTable.lastName, data.lastName);
    await this.fill(this.selectors.webTable.email, data.email);
    await this.fill(this.selectors.webTable.age, data.age);
    await this.fill(this.selectors.webTable.salary, data.salary);
    await this.fill(this.selectors.webTable.department, data.department);
    await this.click(this.selectors.webTable.submitButton);
  }

  /**
   * Check if web table row exists by email
   */
  async isWebTableRowVisible(email: string): Promise<boolean> {
    const row = this.getLocator(this.selectors.webTable.tableRow).filter({ hasText: email });
    try {
      await row.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete web table row by email
   */
  async deleteWebTableRow(email: string): Promise<void> {
    const row = this.getLocator(this.selectors.webTable.tableRow).filter({ hasText: email });
    await row.locator(this.selectors.webTable.deleteButton).click();
  }

  /**
   * Verify web table row exists
   */
  async verifyWebTableRowExists(email: string): Promise<void> {
    const row = this.getLocator(this.selectors.webTable.tableRow).filter({ hasText: email });
    await expect(row).toBeVisible();
  }

  /**
   * Verify web table row does not exist
   */
  async verifyWebTableRowNotExists(email: string): Promise<void> {
    const row = this.getLocator(this.selectors.webTable.tableRow).filter({ hasText: email });
    await expect(row).not.toBeVisible();
  }
}
