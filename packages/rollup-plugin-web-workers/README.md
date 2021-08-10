# @vertexvis/rollup-plugin-web-workers

A Rollup plugin that will bundle web workers into a module. Intended to be used
with [@vertexvis/web-workers].

## Install

```
// Yarn
yarn add --dev @vertexvis/rollup-plugin-web-workers

// NPM
npm install --save-dev @vertexvis/rollup-plugin-web-workers
```

## Usage

### Worker

```ts
// ./worker.ts
import { defineWorker } from '@vertexvis/web-workers';

export type AddFn = (a: number, b: number) => Promise<number>;

const add: AddFn = async (a, b) => {
  return a + b;
}

defineWorker(add);
```

### Entry

```ts
// ./main.ts
import type { AddFn } from './worker';
import { loadWorker } from 'worker:./worker';

async function main(): Promise<void> {
  const { spawnWorker } = await loadWorker<AddFn>();

  const add = await spawnWorker();
  const sum = await add(1, 2)
  console.log('sum', sum);
}

main();
```

### Rollup Config

```js
import resolve from '@rollup/plugin-node-resolve';
import typescript2 from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import workers from '@vertexvis/rollup-plugin-web-workers';

export default {
  input: 'src/main.ts',
  output: {
    dir: './dist',
    format: 'esm',
  },
  plugins: [
    resolve(),
    workers({
      // Workers are bundled separately. Pass a list of plugins to use when
      // bundling the worker.
      plugins: [resolve(), typescript(), terser()]
    }),
    typescript2(),
  ]
}
```

[@vertexvis/web-workers]: https://www.npmjs.com/package/@vertexvis/web-workers
