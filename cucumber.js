module.exports = {
  default: {
    require: ['src/features/support/**/*.ts', 'src/features/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:results/cucumber-report.html', 'json:results/cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
