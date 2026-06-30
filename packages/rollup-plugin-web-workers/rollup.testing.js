import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
import workers from './dist/bundle.esm.js';

function threadsBrowserEntry() {
  return {
    name: 'threads-browser-entry',
    resolveId(source) {
      if (source === 'threads') {
        return path.resolve('../../node_modules/threads/dist-esm/index.js');
      }

      return null;
    },
  };
}

const browserPlugins = [
  threadsBrowserEntry(),
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
