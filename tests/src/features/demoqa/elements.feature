Feature: DemoQA Elements interactions
  As a QA engineer
  I want to validate form and table interactions on DemoQA
  So that I can showcase the framework with element manipulation scenarios

  Background:
    Given I am on the DemoQA home page

  @elements @forms @regression
  Scenario: Submit text box form shows entered summary
    When I navigate to the DemoQA card "Elements"
    And I open the DemoQA menu item "Text Box"
    And I fill the DemoQA text box form with:
      | Full Name         | Email                  | Current Address      | Permanent Address  |
      | Automation Tester | tester@example.com     | 742 Evergreen Street | 31 Spooner Street  |
    And I submit the DemoQA form
    Then I should see the DemoQA text box output with:
      | Name              | Email              | Current Address      | Permanent Address  |
      | Automation Tester | tester@example.com | 742 Evergreen Street | 31 Spooner Street  |

  @elements @tables @regression
  Scenario: Add and remove a DemoQA web table record
    When I navigate to the DemoQA card "Elements"
    And I open the DemoQA menu item "Web Tables"
    And I add a DemoQA web table record:
      | First Name | Last Name | Email                  | Age | Salary | Department   |
      | Jane       | Doe       | jane.doe@example.com   | 28  | 91000  | Engineering  |
    Then I should see the DemoQA web table row for "jane.doe@example.com"
    When I delete the DemoQA web table row for "jane.doe@example.com"
    Then I should not see the DemoQA web table row for "jane.doe@example.com"
