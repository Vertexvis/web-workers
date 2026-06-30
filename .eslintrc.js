module.exports = {
  extends: '@vertexvis/vertexvis-typescript',
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/func-call-spacing': 'off',
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx', '*.mjs'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
};
