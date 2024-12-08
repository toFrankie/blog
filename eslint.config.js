import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
}, {
  files: ['**/*.js', '**/*.ts'],
  rules: {
    'eslint-comments/no-unlimited-disable': 'off',
    'node/prefer-global/process': ['error', 'always'],
  },
}, {
  ignores: ['archives/**', 'docs/**', 'images/**'],

})
