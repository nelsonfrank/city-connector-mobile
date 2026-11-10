import expoConfig from 'eslint-config-expo/flat';
import i18nextPlugin from 'eslint-plugin-i18next';

export default [
  ...expoConfig,
  {
    plugins: {
      i18next: i18nextPlugin,
    },
    rules: {
      'i18next/no-literal-string': [
        'warn',
        {
          mode: 'jsx-text-only',
          'should-validate-template': false,
        },
      ],
    },
  },
  {
    ignores: [
      'dist/**',
      '.expo/**',
      'node_modules/**',
      'ios/**',
      'android/**',
      'coverage/**',
      '*.config.js',
    ],
  },
];
