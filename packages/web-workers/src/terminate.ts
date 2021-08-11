import { Pool, Thread } from 'threads';

type WorkerPoolLike = Pick<ReturnType<typeof Pool>, 'terminate'>;

export class TerminateController {
  private threads: Thread[] = [];
  private pools: WorkerPoolLike[] = [];

  public addThread(thread: Thread): void {
    this.threads.push(thread);
  }

  public addPool(pool: WorkerPoolLike): void {
    this.pools.push(pool);
  }

  public async terminate(force = false): Promise<void> {
    await Promise.all([
      ...this.threads.map((t) => Thread.terminate(t)),
      ...this.pools.map((p) => p.terminate(force)),
    ]);
  }
}
