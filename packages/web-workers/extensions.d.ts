/**
 * Provides static analysis for import paths that are prefixed with `worker:`.
 */
declare module 'worker:*' {
  import type { Worker } from 'threads';

  interface SpawnPoolOptions {
    /**
     * Maximum number of tasks to run on one worker thread at a time. Defaults
     * to one.
     **/
    concurrency?: number;

    /**
     * Maximum number of jobs to be queued for execution before throwing an
     * error.
     **/
    maxQueuedJobs?: number;

    /**
     * Gives that pool a name to be used for debug logging, letting you
     * distinguish between log output of different pools.
     **/
    name?: string;

    /**
     * No. of worker threads to spawn and to be managed by the pool.
     **/
    size?: number;

    /**
     * A controller that can be used to terminate the pool.
     */
    terminate?: TerminateController;
  }

  /**
   * Thread pool managing a set of worker threads.
   * Use it to queue tasks that are run on those threads with limited
   * concurrency.
   */
  interface Pool<ThreadType> {
    /**
     * Returns a promise that resolves once the task queue is emptied. Promise
     * will be rejected if any task fails.
     *
     * @param allowResolvingImmediately Set to `true` to resolve immediately if
     * task queue is currently empty.
     */
    completed(allowResolvingImmediately?: boolean): Promise<any>;
    /**
     * Returns a promise that resolves once the task queue is emptied. Failing
     * tasks will not cause the promise to be rejected.
     *
     * @param allowResolvingImmediately Set to `true` to resolve immediately if
     * task queue is currently empty.
     */
    settled(allowResolvingImmediately?: boolean): Promise<Error[]>;
    /**
     * Queue a task and return a promise that resolves once the task has been
     * dequeued, started and finished.
     *
     * @param task An async function that takes a thread instance and invokes
     * it.
     */
    queue<Return>(task: (thread: ThreadType) => Return): QueuedTask<Return>;
    /**
     * Terminate all pool threads.
     *
     * @param force Set to `true` to kill the thread even if it cannot be stopped gracefully.
     */
    terminate(force?: boolean): Promise<void>;
  }

  interface QueuedTask<Return> {
    /**
     * `QueuedTask` is thenable, so you can `await` it. Resolves when the task
     * has successfully been executed. Rejects if the task fails.
     */
    then: Promise<Return>['then'];

    /**
     * Queued tasks can be cancelled until the pool starts running them on a
     * worker thread.
     */
    cancel(): void;
  }

  interface TerminateController {
    /**
     * Terminates any workers or pools that have been assigned to this
     * controller.
     *
     * @param force Set to `true` to kill the thread even if it cannot be
     * stopped gracefully.
     */
    terminate(force?: boolean): Promise<void>;
  }

  interface WorkerModule<T> {
    /**
     * Returns a web worker primitive. Note, you generally want to use
     * {@link WorkerModule.spawnWorker} to spawn a worker with its exposed
     * interface.
     */
    makeWorker(): Worker;

    /**
     * Returns a controller that can be used to terminate a series of workers.
     */
    makeController(): TerminateController;

    /**
     * Spawns a pool of web workers. By default, will spawn a number of workers
     * that is equal to the hardware concurrency of the user's device.
     *
     * @param options Options for instantiating the worker pool.
     * @returns A worker pool.
     *
     * @see {@link WorkerModule.spawnWorker} to spawn a single worker.
     */
    spawnPool(options?: SpawnPoolOptions): Pool<T>;

    /**
     * Instantiates a new web worker and returns a promise that is resolved with
     * the worker's interface.
     *
     * @param terminate A controller to terminate the worker.
     * @see {@link WorkerModule.spawnPool} to spawn pool of workers.
     */
    spawnWorker(terminate: TerminateController): Promise<T>;
  }

  /**
   * Loads the worker bundle and returns a `WorkerModule` that contains methods
   * for spawning a web worker or creating worker pools.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function loadWorker<T = any>(): Promise<WorkerModule<T>>;
}
