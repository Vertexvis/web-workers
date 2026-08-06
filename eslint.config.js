import vertexvisTypescript from '@vertexvis/eslint-config-vertexvis-typescript';

export default [
  { ignores: ['**/dist/**', '**/dist-test/**', '**/coverage/**', '**/.rpt2_cache/**'] },
  ...vertexvisTypescript,
  {
    rules: {
      '@typescript-eslint/func-call-spacing': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
