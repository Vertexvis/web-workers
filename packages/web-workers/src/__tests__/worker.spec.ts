jest.mock('threads/worker');

import { expose } from 'threads/worker';
import { defineWorker } from '../worker';
import '../__mocks__/browser';

describe(defineWorker, () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('makes worker function result transferable', async () => {
    defineWorker(() => Uint8Array.of(1));

    const workerFn = (expose as jest.Mock).mock.calls[0][0];
    const result = await workerFn();
    expect(result.transferables).toHaveLength(1);
  });

  it('makes worker module function results transferable', async () => {
    defineWorker({ a: () => Uint8Array.of(1) });

    const module = (expose as jest.Mock).mock.calls[0][0];
    const result = await module.a();
    expect(result.transferables).toHaveLength(1);
  });
});
