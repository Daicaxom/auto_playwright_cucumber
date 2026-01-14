@skip
Feature: Example Login Feature
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given I am on the login page

  Scenario: Successful login with valid credentials
    When I enter username "testuser@example.com"
    And I enter password "SecurePass123!"
    And I click the login button
    Then I should see the dashboard
    And I should see a welcome message

  Scenario: Failed login with invalid credentials
    When I enter username "invalid@example.com"
    And I enter password "WrongPassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  Scenario Outline: Login with different user roles
    When I enter username "<username>"
    And I enter password "<password>"
    And I click the login button
    Then I should see the "<page>" page
    And my role should be "<role>"

    Examples:
      | username          | password     | page      | role  |
      | admin@test.com    | AdminPass1!  | admin     | admin |
      | user@test.com     | UserPass1!   | dashboard | user  |
      | viewer@test.com   | ViewPass1!   | dashboard | viewer|
