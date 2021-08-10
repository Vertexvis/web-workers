import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import workers from './dist/bundle.esm';

export default {
  input: './test-src/main.js',
  output: {
    dir: './dist-test',
    format: 'esm',
  },
  plugins: [
    commonjs(),
    resolve({ browser: true }),
    workers({
      plugins: [commonjs(), resolve({ browser: true }), terser()],
    }),
    terser(),
    copy({
      targets: [{ src: 'test-src/index.html', dest: 'dist-test' }],
    }),
  ],
};
