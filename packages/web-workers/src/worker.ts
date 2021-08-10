import { expose } from 'threads/worker';
import { WorkerFunction, WorkerModule } from 'threads/dist/types/worker';
import { makeTransferable } from './transferable';

/**
 * Defines a web worker implementation. This function wraps the `expose` method
 * of Threads and handles automatic conversion of Transferable types.
 *
 * @param impl The worker implementation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Transferable
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineWorker(impl: WorkerFunction | WorkerModule<any>): void {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as WorkerModule<any>);
    return expose(mod);
  }
}
