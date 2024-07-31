// eslint-disable-next-line import/no-extraneous-dependencies
const { init } = require('@ifanrx/eslint-config-standard/init')

module.exports = init({
  root: true,
  extends: ['@ifanrx/standard'],
  ignorePatterns: ['archives/', 'docs/'],
  rules: {
    'no-console': 'off',
    'no-await-in-loop': 'off',
  },
})
