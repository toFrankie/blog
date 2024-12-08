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
      'eslint-comments/no-unlimited-disable': 'off',
      'node/prefer-global/process': ['error', 'always'],
      'antfu/if-newline': 'off',
    },
  },
  {
    ignores: ['archives/**', 'docs/**', 'images/**'],
  },
)
