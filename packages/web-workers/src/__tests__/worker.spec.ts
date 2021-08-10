import { defineWorker } from '../worker';
import '../__mocks__/browser';

describe(defineWorker, () => {
  const expose = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('makes worker function result transferable', async () => {
    defineWorker(() => Uint8Array.of(1), { expose });

    const workerFn = (expose as jest.Mock).mock.calls[0][0];
    const result = await workerFn();
    expect(result.transferables).toHaveLength(1);
  });

  it('makes worker module function results transferable', async () => {
    defineWorker({ a: () => Uint8Array.of(1) }, { expose });

    const module = (expose as jest.Mock).mock.calls[0][0];
    const result = await module.a();
    expect(result.transferables).toHaveLength(1);
  });
});
