const { AllureRuntime, CucumberJSAllureFormatter } = require('allure-cucumberjs');

/**
 * Custom Allure reporter for Cucumber
 * Extends the base CucumberJSAllureFormatter with custom configurations
 */
class AllureReporter extends CucumberJSAllureFormatter {
  constructor(options) {
    super(
      options,
      new AllureRuntime({ resultsDir: './allure-results' }),
      {
        labels: [
          {
            pattern: [/@feature:(.*)/],
            name: 'epic',
          },
          {
            pattern: [/@severity:(.*)/],
            name: 'severity',
          },
          {
            pattern: [/@story:(.*)/],
            name: 'story',
          },
        ],
        links: [
          {
            pattern: [/@issue=(.*)/],
            type: 'issue',
            urlTemplate: 'https://github.com/Daicaxom/auto_playwright_cucumber/issues/%s',
          },
          {
            pattern: [/@tms=(.*)/],
            type: 'tms',
            urlTemplate: 'https://example.com/tms/%s',
          },
        ],
      }
    );
  }
}

module.exports = AllureReporter;
