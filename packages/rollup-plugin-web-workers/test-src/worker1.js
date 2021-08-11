import { defineWorker } from '@vertexvis/web-workers';

const worker = async (a, b) => {
  return a + b;
};

defineWorker(worker);
