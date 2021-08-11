import {
  autoExternal,
  config,
  output,
  typescript,
  input,
} from '@vertexvis/build-tools';

export default config(
  input('src/index.ts'),
  autoExternal(),
  typescript(),
  output()
);
