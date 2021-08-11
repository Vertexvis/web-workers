import { defineWorker } from '@vertexvis/web-workers';

const worker = async ({ nums }) => {
  const sum = nums.reduce((acc, num) => acc + num, 0);
  const result = Uint8Array.of(sum);
  return result;
};

defineWorker(worker);
