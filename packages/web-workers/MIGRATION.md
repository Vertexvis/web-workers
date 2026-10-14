# Migrating to native worker URLs

This release removes the custom `worker:` loader and stops publishing
`@vertexvis/rollup-plugin-web-workers`. New applications should use `threadsx`
directly. Existing applications can keep the three remaining helpers in
`@vertexvis/web-workers`, but no longer need the loader or its Blob-worker
pipeline.

This is a documentation recommendation, not an npm deprecation notice for
`@vertexvis/web-workers`.

## Prerequisites

Remove the old Rollup plugin and install `threadsx`. If your application still
depends on `threads`, remove that package too:

```sh
yarn remove @vertexvis/rollup-plugin-web-workers
yarn add threadsx@^2

# or
npm uninstall @vertexvis/rollup-plugin-web-workers
npm install threadsx@^2
```

For applications still using `threads`, also remove it and change direct
worker imports from `threads/worker` to `threadsx/worker`.

Your TypeScript configuration must preserve ES module syntax so the bundler can
recognize `new Worker(new URL(..., import.meta.url))`; use a module setting
such as `"module": "esnext"`. Ensure your bundler emits the worker entry as a
separate file; see the Rollup example below.

## Replace the loader and single-worker helpers

Before:

```ts
import { loadWorker } from 'worker:./worker';

const { spawnWorker } = await loadWorker<AddFn>();
const add = await spawnWorker();
```

After:

```ts
import { spawn, Worker } from 'threadsx';

const add = await spawn<AddFn>(
  new Worker(new URL('./worker', import.meta.url))
);
```

Replace `makeWorker()` with `new Worker(new URL('./worker', import.meta.url))`.
Terminate the thread through `threadsx` directly:

```ts
import { Thread } from 'threadsx';

await Thread.terminate(add);
```

## Replace pools

Before:

```ts
const { spawnPool } = await loadWorker<AddFn>();
const pool = spawnPool({ size: 4 });
```

After:

```ts
import { Pool, spawn, Worker } from 'threadsx';

const pool = Pool(
  () => spawn<AddFn>(new Worker(new URL('./worker', import.meta.url))),
  { size: 4 }
);
```

Pool options (`size`, `concurrency`, `maxQueuedJobs`, and `name`) are unchanged.
Terminate with `await pool.terminate()`.

## Transferable arguments

If you keep using this package, `defineWorker` still makes transferable values
returned by a worker automatic. The removed `spawnWorker` wrapper also converted
arguments automatically; call `makeTransferable` yourself for arguments
containing transferable values:

```ts
import { makeTransferable } from '@vertexvis/web-workers';

const result = await worker(makeTransferable({ pixels }));
```

If you keep using `TerminateController`, construct it directly and register
resources after spawning them:

```ts
import { TerminateController } from '@vertexvis/web-workers';

const controller = new TerminateController();
controller.addThread(worker);
controller.addPool(pool);
await controller.terminate();
```

## Move off the wrapper completely

Replace `defineWorker` with `expose` from `threadsx/worker`. When returning
transferable values, use `Transfer` with an explicit transfer list:

```ts
// worker.ts
import { Transfer } from 'threadsx';
import { expose } from 'threadsx/worker';

export type EchoFn = (pixels: Uint8Array) => Promise<Uint8Array>;

expose(async (pixels: Uint8Array) =>
  Transfer(pixels, [pixels.buffer])
);
```

Use `Transfer` on the calling side when sending transferable arguments. Use
`Thread.terminate` or `pool.terminate` for cleanup:

```ts
// main.ts
import { spawn, Thread, Transfer, Worker } from 'threadsx';
import type { EchoFn } from './worker';

const echo = await spawn<EchoFn>(
  new Worker(new URL('./worker', import.meta.url))
);
try {
  const pixels = new Uint8Array([1, 2, 3]);
  const result = await echo(Transfer(pixels, [pixels.buffer]));
  console.log(result);
} finally {
  await Thread.terminate(echo);
}
```

Transfer ownership makes `pixels` unusable on the calling side until it is
transferred back. Ordinary cloneable values need no `Transfer` wrapper.

## Rollup projects

Rollup itself leaves `new URL('./worker.js', import.meta.url)` in the output and
does not emit a worker file for that URL. Build the main and worker entries
together, keep the generated filenames stable, and use a module worker:

```ts
// main.ts
import { spawn, Worker } from 'threadsx';
import type { AddFn } from './worker';

const add = await spawn<AddFn>(
  new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
);
```

```js
// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: { main: 'src/main.ts', worker: 'src/worker.ts' },
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].js',
  },
  plugins: [nodeResolve({ browser: true }), typescript()],
};
```

This puts `main.js` and `worker.js` beside each other. If your build changes
their locations or filenames, update the URL accordingly. Bundlers that
recognize worker URLs may handle the worker entry automatically; check their
own worker configuration.
