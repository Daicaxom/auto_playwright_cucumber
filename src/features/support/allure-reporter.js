const { AllureRuntime, CucumberJSAllureFormatter } = require('allure-cucumberjs');

/**
 * Custom Allure reporter for Cucumber
 * Extends the base CucumberJSAllureFormatter with custom configurations
 */
class AllureReporter extends CucumberJSAllureFormatter {
  constructor(options) {
    // Get repository URL from environment or use default
    const repoUrl =
      process.env.GITHUB_REPOSITORY || 'Daicaxom/auto_playwright_cucumber';
    const issueUrlTemplate = `https://github.com/${repoUrl}/issues/%s`;

    // Get TMS URL from environment or use placeholder
    const tmsUrl = process.env.TMS_URL || 'https://example.com/tms/%s';

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
            urlTemplate: issueUrlTemplate,
          },
          {
            pattern: [/@tms=(.*)/],
            type: 'tms',
            urlTemplate: tmsUrl,
          },
        ],
      }
    );
  }
}

module.exports = AllureReporter;
