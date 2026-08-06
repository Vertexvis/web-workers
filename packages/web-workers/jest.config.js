import jestConfig from '@vertexvis/jest-config-vertexvis';

export default {
  ...jestConfig,
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
};
