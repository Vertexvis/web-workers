# @vertexvis/web-workers

This package remains available for applications already using its
`defineWorker`, `makeTransferable`, or `TerminateController` helpers. For new
code, use [threadsx] directly. Its `expose`, `Transfer`, `spawn`, `Pool`, and
`Thread` APIs cover the worker lifecycle without this wrapper.

This is a recommendation to migrate, not an npm deprecation notice. The
remaining helpers continue to work in this release. The `worker:` loader and
`@vertexvis/rollup-plugin-web-workers` have been removed; see the
[migration guide](./MIGRATION.md) before upgrading.

## Remaining helpers

`defineWorker(implementation)` calls `threadsx`'s `expose` and automatically
marks transferable values in worker results for transfer. `makeTransferable`
recursively marks transferable values in an argument. `TerminateController`
collects spawned threads and pools so they can be terminated together.

```ts
// worker.ts
import { defineWorker } from '@vertexvis/web-workers';

export type AddFn = (a: number, b: number) => Promise<number>;
defineWorker(async (a: number, b: number) => a + b);
```

```ts
// main.ts
import { spawn, Thread, Worker } from 'threadsx';
import type { AddFn } from './worker';

const add = await spawn<AddFn>(
  new Worker(new URL('./worker', import.meta.url))
);
console.log(await add(1, 2));
await Thread.terminate(add);
```

`threadsx` can also create pools directly:

```ts
import { Pool, spawn, Worker } from 'threadsx';
import type { AddFn } from './worker';

const pool = Pool(
  () => spawn<AddFn>(new Worker(new URL('./worker', import.meta.url))),
  { size: 4 }
);
try {
  console.log(await pool.queue((add) => add(1, 2)));
} finally {
  await pool.terminate();
}
```

For new worker implementations, prefer `expose` from `threadsx/worker`. Use
`Transfer` when you need to move an `ArrayBuffer` or other transferable value.
The [migration guide](./MIGRATION.md) shows both a direct `threadsx` path and
the changes needed to keep using this package.

[threadsx]: https://github.com/jmaleonard/threadsx
