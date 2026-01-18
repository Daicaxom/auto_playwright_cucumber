Feature: SauceDemo shopping and cart management
  As a QA engineer
  I want to validate product browsing and cart operations on SauceDemo
  So that I can ensure proper filtering, sorting, and cart management

  Background:
    Given I am on the SauceDemo login page
    When I login to SauceDemo with username "standard_user" and password "secret_sauce"
    Then I should be on the SauceDemo inventory page

  @cart @filter @regression
  Scenario: Product filtering and cart management
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
