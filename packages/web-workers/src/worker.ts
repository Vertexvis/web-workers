import { expose as threadsExpose } from 'threadsx';

import { makeTransferable } from './transferable';

type Exposed = Parameters<typeof threadsExpose>[0];
type WorkerFunction = Extract<Exposed, (...args: any[]) => any>;
type WorkerModule = Exclude<Exposed, WorkerFunction>;

interface DefineWorkerOptions {
  expose?: typeof threadsExpose;
}

/**
 * Defines a web worker implementation. This function wraps the `expose` method
 * of threadsx and handles automatic conversion of Transferable types.
 *
 * @param impl The worker implementation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Transferable
 */
export function defineWorker(
  impl: Exposed,
  { expose = threadsExpose }: DefineWorkerOptions = {}
): void {
  function wrap(f: WorkerFunction): WorkerFunction {
    return async (...args: unknown[]) => {
      const res = await f(...args);
      return makeTransferable(res);
    };
  }

  if (typeof impl === 'function') {
    return expose(wrap(impl));
  } else {
    const mod = Object.entries(impl).reduce((mod, [key, fn]) => {
      mod[key] = wrap(fn);
      return mod;
    }, {} as WorkerModule);
    return expose(mod);
  }
}
