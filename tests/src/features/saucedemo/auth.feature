Feature: SauceDemo authentication and session management
  As a QA engineer
  I want to validate authentication flows and session handling on SauceDemo
  So that I can ensure proper login, logout, and session persistence

  Background:
    Given I am on the SauceDemo login page

  @auth @session @smoke
  Scenario: User logout and session management with cart persistence
    When I login to SauceDemo with username "standard_user" and password "secret_sauce"
    Then I should be on the SauceDemo inventory page
    When I add the SauceDemo product "Sauce Labs Backpack" to cart
    And I add the SauceDemo product "Sauce Labs Bike Light" to cart
    Then the SauceDemo cart badge should show "2" items
    When I click the SauceDemo menu button
    And I click the SauceDemo logout link
    Then I should be on the SauceDemo login page
    And the SauceDemo cart badge should not be visible
    When I login to SauceDemo with username "standard_user" and password "secret_sauce"
    Then I should be on the SauceDemo inventory page
    And the SauceDemo cart badge should show "2" items
    And the SauceDemo product "Sauce Labs Backpack" should show "Remove" button
    And the SauceDemo product "Sauce Labs Bike Light" should show "Remove" button
