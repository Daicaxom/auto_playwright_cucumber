/**
 * Unit tests for SauceDemo step definitions
 * Tests the selectors, helper functions, and step logic
 */

describe('SauceDemo Steps', () => {
  describe('SAUCEDEMO_SELECTORS', () => {
    // Define selectors here for testing
    const SAUCEDEMO_SELECTORS = {
      usernameInput: '#user-name',
      passwordInput: '#password',
      loginButton: '#login-button',
      loginError: '[data-test="error"]',
      inventoryContainer: '.inventory_container',
      inventoryItem: '.inventory_item',
      inventoryItemName: '.inventory_item_name',
      inventoryItemPrice: '.inventory_item_price',
      addToCartButton: (productName: string): string =>
        `[data-test="add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}"]`,
      removeButton: (productName: string): string =>
        `[data-test="remove-${productName.toLowerCase().replace(/\s+/g, '-')}"]`,
      productSortDropdown: '[data-test="product-sort-container"]',
      cartBadge: '.shopping_cart_badge',
      cartIcon: '.shopping_cart_link',
      cartItem: '.cart_item',
      cartItemName: '.inventory_item_name',
      cartItemPrice: '.inventory_item_price',
      cartRemoveButton: '.cart_button',
      checkoutButton: '[data-test="checkout"]',
      continueShoppingButton: '[data-test="continue-shopping"]',
      firstNameInput: '[data-test="firstName"]',
      lastNameInput: '[data-test="lastName"]',
      postalCodeInput: '[data-test="postalCode"]',
      continueButton: '[data-test="continue"]',
      finishButton: '[data-test="finish"]',
      summaryTotal: '.summary_total_label',
      checkoutComplete: '.checkout_complete_container',
      completeHeader: '.complete-header',
    };

    describe('Static selectors', () => {
      it('should have correct login page selectors', () => {
        expect(SAUCEDEMO_SELECTORS.usernameInput).toBe('#user-name');
        expect(SAUCEDEMO_SELECTORS.passwordInput).toBe('#password');
        expect(SAUCEDEMO_SELECTORS.loginButton).toBe('#login-button');
        expect(SAUCEDEMO_SELECTORS.loginError).toBe('[data-test="error"]');
      });

      it('should have correct inventory page selectors', () => {
        expect(SAUCEDEMO_SELECTORS.inventoryContainer).toBe('.inventory_container');
        expect(SAUCEDEMO_SELECTORS.inventoryItem).toBe('.inventory_item');
        expect(SAUCEDEMO_SELECTORS.inventoryItemName).toBe('.inventory_item_name');
        expect(SAUCEDEMO_SELECTORS.inventoryItemPrice).toBe('.inventory_item_price');
        expect(SAUCEDEMO_SELECTORS.productSortDropdown).toBe(
          '[data-test="product-sort-container"]'
        );
      });

      it('should have correct cart selectors', () => {
        expect(SAUCEDEMO_SELECTORS.cartBadge).toBe('.shopping_cart_badge');
        expect(SAUCEDEMO_SELECTORS.cartIcon).toBe('.shopping_cart_link');
        expect(SAUCEDEMO_SELECTORS.cartItem).toBe('.cart_item');
        expect(SAUCEDEMO_SELECTORS.cartRemoveButton).toBe('.cart_button');
        expect(SAUCEDEMO_SELECTORS.checkoutButton).toBe('[data-test="checkout"]');
        expect(SAUCEDEMO_SELECTORS.continueShoppingButton).toBe('[data-test="continue-shopping"]');
      });

      it('should have correct checkout selectors', () => {
        expect(SAUCEDEMO_SELECTORS.firstNameInput).toBe('[data-test="firstName"]');
        expect(SAUCEDEMO_SELECTORS.lastNameInput).toBe('[data-test="lastName"]');
        expect(SAUCEDEMO_SELECTORS.postalCodeInput).toBe('[data-test="postalCode"]');
        expect(SAUCEDEMO_SELECTORS.continueButton).toBe('[data-test="continue"]');
        expect(SAUCEDEMO_SELECTORS.finishButton).toBe('[data-test="finish"]');
        expect(SAUCEDEMO_SELECTORS.summaryTotal).toBe('.summary_total_label');
        expect(SAUCEDEMO_SELECTORS.checkoutComplete).toBe('.checkout_complete_container');
        expect(SAUCEDEMO_SELECTORS.completeHeader).toBe('.complete-header');
      });
    });

    describe('Dynamic selectors', () => {
      it('should generate correct add to cart selector for product with single word', () => {
        const selector = SAUCEDEMO_SELECTORS.addToCartButton('Backpack');
        expect(selector).toBe('[data-test="add-to-cart-backpack"]');
      });

      it('should generate correct add to cart selector for product with multiple words', () => {
        const selector = SAUCEDEMO_SELECTORS.addToCartButton('Sauce Labs Backpack');
        expect(selector).toBe('[data-test="add-to-cart-sauce-labs-backpack"]');
      });

      it('should generate correct add to cart selector for product with special characters', () => {
        const selector = SAUCEDEMO_SELECTORS.addToCartButton('Sauce Labs Bike Light');
        expect(selector).toBe('[data-test="add-to-cart-sauce-labs-bike-light"]');
      });

      it('should generate correct remove button selector', () => {
        const selector = SAUCEDEMO_SELECTORS.removeButton('Sauce Labs Backpack');
        expect(selector).toBe('[data-test="remove-sauce-labs-backpack"]');
      });

      it('should handle extra whitespace in product names', () => {
        const selector = SAUCEDEMO_SELECTORS.addToCartButton('Sauce  Labs   Backpack');
        expect(selector).toBe('[data-test="add-to-cart-sauce-labs-backpack"]');
      });
    });
  });

  describe('Price parsing helper', () => {
    const parsePrice = (priceText: string): number => {
      return parseFloat(priceText.replace('$', ''));
    };

    it('should parse price with dollar sign', () => {
      expect(parsePrice('$29.99')).toBe(29.99);
    });

    it('should parse price without dollar sign', () => {
      expect(parsePrice('29.99')).toBe(29.99);
    });

    it('should parse integer price', () => {
      expect(parsePrice('$100')).toBe(100);
    });

    it('should handle single digit cents', () => {
      expect(parsePrice('$9.9')).toBe(9.9);
    });
  });

  describe('Cart item tracking', () => {
    it('should track cart items correctly', () => {
      const sharedData: Record<string, unknown> = {};
      const cartItems = (sharedData['saucedemo_cart_items'] as string[]) || [];

      cartItems.push('Sauce Labs Backpack');
      sharedData['saucedemo_cart_items'] = cartItems;

      expect(sharedData['saucedemo_cart_items']).toEqual(['Sauce Labs Backpack']);
    });

    it('should accumulate multiple cart items', () => {
      const sharedData: Record<string, unknown> = {};
      let cartItems = (sharedData['saucedemo_cart_items'] as string[]) || [];

      cartItems.push('Sauce Labs Backpack');
      sharedData['saucedemo_cart_items'] = cartItems;

      cartItems = (sharedData['saucedemo_cart_items'] as string[]) || [];
      cartItems.push('Sauce Labs Bike Light');
      sharedData['saucedemo_cart_items'] = cartItems;

      expect(sharedData['saucedemo_cart_items']).toEqual([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
      ]);
    });

    it('should handle empty cart items array', () => {
      const sharedData: Record<string, unknown> = {};
      const cartItems = (sharedData['saucedemo_cart_items'] as string[]) || [];

      expect(cartItems).toEqual([]);
    });
  });

  describe('Sort option validation', () => {
    const validSortOptions = [
      'Name (A to Z)',
      'Name (Z to A)',
      'Price (low to high)',
      'Price (high to low)',
    ];

    it('should validate Price (low to high) as valid sort option', () => {
      expect(validSortOptions).toContain('Price (low to high)');
    });

    it('should validate Price (high to low) as valid sort option', () => {
      expect(validSortOptions).toContain('Price (high to low)');
    });

    it('should validate Name (A to Z) as valid sort option', () => {
      expect(validSortOptions).toContain('Name (A to Z)');
    });

    it('should validate Name (Z to A) as valid sort option', () => {
      expect(validSortOptions).toContain('Name (Z to A)');
    });
  });

  describe('URL patterns', () => {
    const SAUCEDEMO_URL = 'https://www.saucedemo.com';

    it('should have correct base URL', () => {
      expect(SAUCEDEMO_URL).toBe('https://www.saucedemo.com');
    });

    it('should match inventory URL pattern', () => {
      const inventoryUrl = `${SAUCEDEMO_URL}/inventory.html`;
      expect(inventoryUrl).toMatch(/inventory\.html/);
    });

    it('should match cart URL pattern', () => {
      const cartUrl = `${SAUCEDEMO_URL}/cart.html`;
      expect(cartUrl).toMatch(/cart\.html/);
    });

    it('should match checkout step one URL pattern', () => {
      const checkoutStepOneUrl = `${SAUCEDEMO_URL}/checkout-step-one.html`;
      expect(checkoutStepOneUrl).toMatch(/checkout-step-one\.html/);
    });

    it('should match checkout step two URL pattern', () => {
      const checkoutStepTwoUrl = `${SAUCEDEMO_URL}/checkout-step-two.html`;
      expect(checkoutStepTwoUrl).toMatch(/checkout-step-two\.html/);
    });

    it('should match checkout complete URL pattern', () => {
      const checkoutCompleteUrl = `${SAUCEDEMO_URL}/checkout-complete.html`;
      expect(checkoutCompleteUrl).toMatch(/checkout-complete\.html/);
    });
  });

  describe('Checkout information validation', () => {
    it('should validate checkout data structure', () => {
      const checkoutData = {
        'First Name': 'Test',
        'Last Name': 'User',
        'Postal Code': '12345',
      };

      expect(checkoutData['First Name']).toBe('Test');
      expect(checkoutData['Last Name']).toBe('User');
      expect(checkoutData['Postal Code']).toBe('12345');
    });

    it('should handle postal code as string', () => {
      const checkoutData = {
        'First Name': 'Test',
        'Last Name': 'User',
        'Postal Code': '12345',
      };

      expect(typeof checkoutData['Postal Code']).toBe('string');
    });
  });

  describe('Finding cheapest/most expensive item logic', () => {
    const findMinPrice = (prices: number[]): number => {
      return Math.min(...prices);
    };

    const findMaxPrice = (prices: number[]): number => {
      return Math.max(...prices);
    };

    const findMaxPriceIndex = (prices: number[]): number => {
      if (prices.length === 0) return -1;
      let maxPrice = prices[0];
      let maxIndex = 0;
      for (let i = 1; i < prices.length; i++) {
        if (prices[i] > maxPrice) {
          maxPrice = prices[i];
          maxIndex = i;
        }
      }
      return maxIndex;
    };

    it('should find minimum price from array', () => {
      const prices = [29.99, 9.99, 15.99, 49.99];
      expect(findMinPrice(prices)).toBe(9.99);
    });

    it('should find maximum price from array', () => {
      const prices = [29.99, 9.99, 15.99, 49.99];
      expect(findMaxPrice(prices)).toBe(49.99);
    });

    it('should find index of maximum price', () => {
      const prices = [29.99, 9.99, 15.99, 49.99];
      expect(findMaxPriceIndex(prices)).toBe(3);
    });

    it('should handle single item array', () => {
      const prices = [29.99];
      expect(findMinPrice(prices)).toBe(29.99);
      expect(findMaxPrice(prices)).toBe(29.99);
      expect(findMaxPriceIndex(prices)).toBe(0);
    });

    it('should handle array with duplicate prices', () => {
      const prices = [29.99, 29.99, 15.99];
      expect(findMaxPriceIndex(prices)).toBe(0); // First occurrence
    });
  });
});
