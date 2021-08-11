# @vertexvis/web-workers

A package for defining, bundling, and loading web workers. The [Threads] package
is used internally to provide worker creation and pooling behavior.
[Transferables] are automatically passed when sending data to and from web
workers.

Use this package in combination with [@vertexvis/rollup-plugin-web-workers] to
bundle your workers with Rollup.

## Install

```
// Yarn
yarn add @vertexvis/web-workers

// NPM
npm install @vertexvis/web-workers
```

## Usage

### Defining a Web Worker

Create a JS/TS file and wrap your worker implementation with `defineWorker`.

```ts
// ./worker.ts
import { defineWorker } from '@vertexvis/web-workers';

export type AddFn = (a: number, b: number) => Promise<number>;

const add: AddFn = async (a, b) => {
  return a + b;
}

defineWorker(add);
```

### Loading and Spawning a Web Worker

Use the `worker:` path prefix to bundle a web worker. The Rollup plugin will
transform the import and expose a `loadWorker` function to load the bundled
worker module. The worker module exports functions for spawning workers and
worker pools.

See [@vertexvis/rollup-plugin-web-workers] to bundle workers with Rollup.

```ts
// ./main.ts
import type { AddFn } from './worker';
import { loadWorker } from 'worker:./worker';

async function main(): Promise<void> {
  const { spawnWorker, makeController } = await loadWorker<AddFn>();

  const controller = makeController(); // optional controller to stop worker.
  const add = await spawnWorker(controller);
  const sum = await add(1, 2)
  console.log('sum', sum); // 3

  controller.terminate();
}
```

### Worker Pools

Spawn worker pools to create a set of workers that pull work from a queue.

```ts
import type { AddFn } from './worker';
import { loadWorker } from 'worker:./worker';

async function main(): Promise<void> {
  const { spawnPool, makeController } = await loadWorker<AddFn>();

  const controller = makeController();
  const pool = await spawnPool({ controller });
  pool
    .queue((sum) => add(1, 2))
    .then((sum) => console.log('sum', sum)); // 3

  controller.terminate();
}
```

`pool.queue()` will return a promise that will resolve with the task's result.
Use `Promise.then()` to handle the result vs using `await` when scheduling work
within a loop. This is because `await` will block until the task completes.

You can customize the number of workers spawned and concurrency by passing in
options to `spawnPool`.

```ts
interface CreatePoolOptions {
  // The number of concurrent tasks to run per worker. Defaults to 1.
  concurrency?: number;

  // Max number of tasks to queue. If count is reached, an error is thrown.
  maxQueuedJobs?: number;

  // The name of the pool for debugging.
  name?: string;

  // The number of workers to spawn. Defaults to number of CPU cores.
  size?: number;

  // A controller to terminate the pool.
  controller?: WorkerController;
}
```

### Worker Termination

A `WorkerController` is used to terminate a worker. A worker module exports a
`makeController` function to create a controller. You can pass a controller to
multiple workers and pools to terminate them together.


```ts
import type { Worker1Fn } from './worker1';
import { loadWorker as loadWorker1 } from 'worker:./worker1';

import type { Worker2Fn } from './worker1';
import { loadWorker as loadWorker2 } from 'worker:./worker2';

async function main(): Promise<void> {
  const { spawnWorker, makeController } = await loadWorker1<Worker1Fn>();
  const { spawnPool } = await loadWorker2<Worker2Fn>();

  const controller = makeController();

  const worker = await spawnWorker(controller);
  const pool = await spawnPool({ controller });

  // Terminate the worker and pool.
  await controller.terminate();
}
```

## Bundling Workers

See [@vertexvis/rollup-plugin-web-workers] for more details.

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

[Threads]: https://threads.js.org/
[Transferables]: https://developer.mozilla.org/en-US/docs/Web/API/Transferable
[@vertexvis/rollup-plugin-web-workers]: https://www.npmjs.com/package/@vertexvis/rollup-plugin-web-workers
