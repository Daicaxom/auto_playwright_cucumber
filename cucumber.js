module.exports = {
  default: {
    paths: ['src/features/**/*.feature'],
    require: ['src/features/support/**/*.ts', 'src/features/step-definitions/**/*.ts'],
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
};
