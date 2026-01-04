Feature: SauceDemo complex user flows
  As a QA engineer
  I want to validate complex e-commerce flows on SauceDemo
  So that I can showcase the framework with real-world shopping scenarios

  Background:
    Given I am on the SauceDemo login page

  @complex @purchase
  Scenario: Complete end-to-end purchase flow with multiple items
    When I login to SauceDemo with username "standard_user" and password "secret_sauce"
    Then I should be on the SauceDemo inventory page
    When I add the SauceDemo product "Sauce Labs Backpack" to cart
    And I add the SauceDemo product "Sauce Labs Bike Light" to cart
    And I add the SauceDemo product "Sauce Labs Onesie" to cart
    Then the SauceDemo cart badge should show "3" items
    When I click the SauceDemo cart icon
    Then I should be on the SauceDemo cart page
    And I should see the following SauceDemo cart items:
      | Product Name         |
      | Sauce Labs Backpack  |
      | Sauce Labs Bike Light|
      | Sauce Labs Onesie    |
    When I click the SauceDemo checkout button
    Then I should be on the SauceDemo checkout step one page
    When I fill the SauceDemo checkout information:
      | First Name | Last Name | Postal Code |
      | Test       | User      | 12345       |
    And I click the SauceDemo continue button
    Then I should be on the SauceDemo checkout step two page
    And I should see the SauceDemo order summary with total
    When I click the SauceDemo finish button
    Then I should be on the SauceDemo checkout complete page
    And I should see the SauceDemo order confirmation message "Thank you for your order!"

  @complex @filter @cart-management
  Scenario: Product filtering and cart management
    When I login to SauceDemo with username "standard_user" and password "secret_sauce"
    Then I should be on the SauceDemo inventory page
    When I sort SauceDemo products by "Price (low to high)"
    Then the first SauceDemo product should be the cheapest
    When I add the first SauceDemo product to cart
    And I add the last SauceDemo product to cart
    Then the SauceDemo cart badge should show "2" items
    When I click the SauceDemo cart icon
    Then I should be on the SauceDemo cart page
    When I remove the most expensive SauceDemo item from cart
    Then the SauceDemo cart badge should show "1" items
    When I click the SauceDemo continue shopping button
    Then I should be on the SauceDemo inventory page
    And the SauceDemo product "Sauce Labs Onesie" should show "Remove" button
    And the SauceDemo product "Sauce Labs Fleece Jacket" should show "Add to cart" button
