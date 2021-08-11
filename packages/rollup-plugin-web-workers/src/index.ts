import * as path from 'path';
import { OutputChunk, Plugin, rollup } from 'rollup';

interface ThreadsPluginOptions {
  plugins?: Plugin[];
}

const workerPrefix = 'worker:';
const workerModulePrefix = 'worker-module:';

export default function ({ plugins = [] }: ThreadsPluginOptions): Plugin {
  return {
    name: 'web-workers-plugin',

    resolveId(source, importer) {
      // Resolve modules with prefix: `import { loadWorker } from 'worker:./my-worker';`.
      if (source.startsWith(workerPrefix)) {
        return this.resolve(
          source.slice(workerPrefix.length),
          importer ?? ''
        ).then((resolved) => {
          return {
            id: `${workerPrefix}${resolved?.id}`,
            moduleSideEffects: false,
          };
        });
      }
      // Resolve worker modules prefixed with `worker-module`. This is an
      // internal prefix used to create a bundle for the worker module.
      else if (source.startsWith(workerModulePrefix)) {
        return this.resolve(
          source.slice(workerModulePrefix.length),
          importer ?? ''
        ).then((resolved) => ({
          id: `${workerModulePrefix}${resolved?.id}`,
          moduleSideEffects: false,
        }));
      } else {
        return null;
      }
    },

    load(id) {
      if (id.startsWith(workerPrefix)) {
        // Return a loader that uses a dynamic imports to load the worker
        // module.
        const filePath = getWorkerFilePath(workerPrefix, id);
        return getWorkerLoader(filePath);
      } else if (id.startsWith(workerModulePrefix)) {
        const filePath = getWorkerFilePath(workerModulePrefix, id);
        const workerName = getWorkerName(filePath);

        // Compile the worker and emit a file for the worker module.
        return buildWorker(filePath, plugins)
          .then((chunk) => {
            return {
              code: getWorkerModule(workerName, escapeCode(chunk.code)),
              moduleSideEffects: false,
            };
          })
          .catch((err) => this.error(err.toString()));
      } else {
        return null;
      }
    },
  };
}

function getWorkerFilePath(prefix: string, id: string): string {
  return id.slice(prefix.length);
}

function getWorkerName(filePath: string): string {
  const ext = path.extname(filePath);
  const filename = path.basename(filePath, ext);
  return `${filename}-worker`;
}

function getWorkerLoader(workerPath: string): string {
  return `
export async function loadWorker() {
  return import('${workerModulePrefix}${workerPath}');
}
`;
}

function getWorkerModule(workerName: string, workerCode: string): string {
  return `
import { BlobWorker, spawn, Pool, Transfer } from 'threads';
import { makeTransferable, TerminateController } from '@vertexvis/web-workers';

const workerName = "${workerName}.js";
const workerText = \`${workerCode}\`;

export function makeController() {
  return new TerminateController();
}

export function makeWorker() {
  return BlobWorker.fromText(workerText, { name: workerName });
}

export async function spawnWorker(terminate) {
  const fn = await spawn(makeWorker());
  if (terminate != null) {
    terminate.addThread(fn);
  }
  return (...args) => {
    return fn.apply(null, [...args.map((a) => makeTransferable(a))]);
  };
}

export function spawnPool(options) {
  return Pool(() => spawnWorker(options.terminate), options);
}
`;
}

function escapeCode(workerCode: string): string {
  return workerCode
    .replace(/\\n/g, '')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\$&');
}

function buildWorker(input: string, plugins: Plugin[]): Promise<OutputChunk> {
  return rollup({ input, plugins })
    .then((build) => build.generate({ format: 'iife' }))
    .then((bundle) => {
      const chunks = bundle.output.filter((output) => output.type === 'chunk');

      if (chunks == null || chunks.length === 0) {
        throw new Error("Rollup didn't output any chunks for worker.");
      } else if (chunks.length > 1) {
        throw new Error(
          'Rollup outputted too many chunks for workers. Expected 1.'
        );
      }

      const chunk = chunks[0];

      if (chunk.type !== 'chunk') {
        throw new Error('Worker output should be chunk. Got asset.');
      } else if (chunk.imports.length > 0) {
        throw new Error('Worker should not contain imports.');
      }

      return chunk;
    });
}
