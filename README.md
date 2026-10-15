# web-workers

This repository contains `@vertexvis/web-workers`, a small set of compatibility
helpers for existing [threadsx] worker applications. For new code, use
`threadsx` directly. The custom `worker:` loader and
`@vertexvis/rollup-plugin-web-workers` have been retired.

This is a recommendation, not an npm deprecation notice: the remaining
`@vertexvis/web-workers` exports continue to work in this release.

## Use threadsx directly

```ts
// worker.ts
import { expose } from 'threadsx/worker';

export type AddFn = (a: number, b: number) => Promise<number>;

expose(async (a: number, b: number) => a + b);
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

Your bundler must emit the worker as a separate file. See the
[migration guide](./packages/web-workers/MIGRATION.md) for worker pools,
transferables, and Rollup configuration. The
[@vertexvis/web-workers README](./packages/web-workers/README.md) documents the
remaining helpers for existing users.

## Release

This branch removes the old loader API, so the next release is a breaking
`0.3.0` minor release. The `nextVersionBump` setting in `package.json` tells
the release scripts which version to prepare; the release script runs after
the branch is merged to `main`.

[threadsx]: https://github.com/jmaleonard/threadsx
