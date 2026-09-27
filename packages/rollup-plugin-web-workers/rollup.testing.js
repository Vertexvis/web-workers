import path from 'node:path';

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

import workers from './dist/bundle.esm.js';

function threadsxBrowserEntry() {
  return {
    name: 'threadsx-browser-entry',
    resolveId(source) {
      if (source === 'threadsx') {
        return path.resolve('../../node_modules/threadsx/dist-esm/index.js');
      }

      return null;
    },
  };
}

const browserPlugins = [
  threadsxBrowserEntry(),
  commonjs(),
  nodeResolve({ browser: true }),
];

export default {
  input: './test-src/main.js',
  output: {
    dir: './dist-test',
    format: 'esm',
  },
  plugins: [
    ...browserPlugins,
    workers({
      plugins: [...browserPlugins, terser()],
    }),
    terser(),
    copy({
      targets: [{ src: 'test-src/index.html', dest: 'dist-test' }],
    }),
  ],
};
