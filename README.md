# web-workers

This repository contains `@vertexvis/web-workers`, originally a set of compatibility
helpers around threads, and now as around [threadsx] worker applications.

For new code, the recommendation is use `threadsx` directly. The custom `worker:` loader and
`@vertexvis/rollup-plugin-web-workers` have been retired.

This repo will probably not see further updates and the recommendation is to migrate away.

A testing or alpha 0.3.0 release as a migration step is available as a stepping stone towards that migrtion. 

This is not yet an npm deprecation notice: the remaining
`@vertexvis/web-workers` exports in the `@vertexvis/web-workers` for the 0.3.0 pre-release should theoretically work, but have recivede minimal testing. 

For practical purposes this should be considered an archived repo and an unsupported release.

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

Latest updates removes the old loader API, so 0.3.0 is a breaking one and the effort to adapt is likely no less than just moving to threadsx directly. 

The `nextVersionBump` setting in `package.json` tells
the release scripts which version to prepare; the release script runs after
the branch is merged to `main`.

[threadsx]: https://github.com/jmaleonard/threadsx
