import antfu from '@antfu/eslint-config'
import format from 'eslint-plugin-format'

export default antfu(
  {
    typescript: true,
  },
  {
    files: ['**/*.js', '**/*.ts'],
    plugins: { format },
    rules: {
      'eslint-comments/no-unlimited-disable': 'off',
      'node/prefer-global/process': ['error', 'always'],

      'antfu/if-newline': 'off',
      'antfu/consistent-list-newline': 'off',

      'style/arrow-parens': ['error', 'as-needed'],
      'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],

      'format/prettier': [
        'error',
        {
          tabWidth: 2,
          printWidth: 100,
          semi: false,
          singleQuote: true,
          arrowParens: 'avoid',
        },
      ],
    },
  },
  {
    ignores: ['archives/**', 'docs/**', 'images/**'],
  },
)
