Feature: SauceDemo checkout and purchase flows
  As a QA engineer
  I want to validate checkout processes on SauceDemo
  So that I can ensure proper purchase flow and form validation

  Background:
    Given I am on the SauceDemo login page
    When I login to SauceDemo with username "standard_user" and password "secret_sauce"
    Then I should be on the SauceDemo inventory page

  @checkout @purchase @e2e @smoke
  Scenario: Complete end-to-end purchase flow with multiple items
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

  @checkout @negative @validation @regression
  Scenario: Invalid checkout information handling
    When I add the SauceDemo product "Sauce Labs Backpack" to cart
    And I click the SauceDemo cart icon
    Then I should be on the SauceDemo cart page
    When I click the SauceDemo checkout button
    Then I should be on the SauceDemo checkout step one page
    When I click the SauceDemo continue button
    Then I should see the SauceDemo error message "Error: First Name is required"
    When I fill the SauceDemo checkout information:
      | First Name | Last Name | Postal Code |
      | John       |           |             |
    And I click the SauceDemo continue button
    Then I should see the SauceDemo error message "Error: Last Name is required"
    When I fill the SauceDemo checkout information:
      | First Name | Last Name | Postal Code |
      | John       | Doe       |             |
    And I click the SauceDemo continue button
    Then I should see the SauceDemo error message "Error: Postal Code is required"
