jest.mock('threads');

import { Thread } from 'threads';
import { TerminateController } from '../terminate';

describe(TerminateController, () => {
  it('terminates workers and pools', async () => {
    const worker = {} as Thread;
    const pool = { terminate: jest.fn() };

    const controller = new TerminateController();
    controller.addThread(worker);
    controller.addPool(pool);

    await controller.terminate(true);

    expect(Thread.terminate).toHaveBeenCalledWith(worker);
    expect(pool.terminate).toHaveBeenCalledWith(true);
  });
});
