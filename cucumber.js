module.exports = {
  default: {
    paths: ['tests/src/features/**/*.feature'],
    require: [
      'tests/support/**/*.ts',
      'tests/src/applications/**/*.steps.ts',
      'framework/src/step-definitions/**/*.ts',
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:results/cucumber-report.html',
      'json:results/cucumber-report.json',
      './src/features/support/allure-reporter.js',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    tags: 'not @skip',
  },
  smoke: {
    paths: ['tests/src/features/**/*.feature'],
    require: [
      'tests/support/**/*.ts',
      'tests/src/applications/**/*.steps.ts',
      'framework/src/step-definitions/**/*.ts',
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:results/cucumber-report.html',
      'json:results/cucumber-report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    tags: '@smoke and not @skip',
  },
  regression: {
    paths: ['tests/src/features/**/*.feature'],
    require: [
      'tests/support/**/*.ts',
      'tests/src/applications/**/*.steps.ts',
      'framework/src/step-definitions/**/*.ts',
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:results/cucumber-report.html',
      'json:results/cucumber-report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    tags: '@regression and not @skip',
  },
  negative: {
    paths: ['tests/src/features/**/*.feature'],
    require: [
      'tests/support/**/*.ts',
      'tests/src/applications/**/*.steps.ts',
      'framework/src/step-definitions/**/*.ts',
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:results/cucumber-report.html',
      'json:results/cucumber-report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    tags: '@negative and not @skip',
  },
};
