# web-workers

This is a mono-repo that contains utilities to create and build web workers. It
uses the [Threads](https://threads.js.org/) internally to handle the management
of web workers and provide pooling behavior.

## Packages

| Package      | Version | Description |
| ------------ | ------- | ----------- |
| [@vertexvis/web-workers]      | ![npm](https://img.shields.io/npm/v/@vertexvis/web-workers)  | Package for defining and loading web workers. |
| [@vertexvis/rollup-plugin-web-workers]  | ![npm](https://img.shields.io/npm/v/@vertexvis/rollup-plugin-web-workers)   | Package for building web workers with Rollup. |

## Simple Usage

See [@vertexvis/web-workers](./packages/web-workers/README.md) for more advanced
usage.

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

## Bumping Versions

The project's release scripts will automatically bump version based on the
`nextBumpVersion` that's specified in the projects `package.json` file. When
making a breaking change, you should run `yarn version:bump` and specify
`minor`. This should be done as part of your PR.

## Releasing

Run `yarn release` to create a release based on the `nextBumpVersion` that's
specified in the projects `package.json` file. This field tracks if the next
version should be a `major`, `minor` or `patch` release.

Run `yarn release:ask` to specify a custom release version.

These script will verify that your working directory is clean, is up-to-date
with master, ask for the release version, generate documentation, and push a
release branch to GitHub.

You can then create a PR from the release branch. Once your PR has been approved
and merged, the CI pipeline will automatically publish packages to NPM, tag the
release, and create a release in Github.

If the publishing, open a new PR with any fixes and merge your changes. CI will
attempt to republish the previous release that failed.

[@vertexvis/web-workers]: https://www.npmjs.com/package/@vertexvis/web-workers
[@vertexvis/rollup-plugin-web-workers]: https://www.npmjs.com/package/@vertexvis/rollup-plugin-web-workers
