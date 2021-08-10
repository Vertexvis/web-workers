import { loadWorker as loadWorker1 } from 'worker:./worker1';
import { loadWorker as loadWorker2 } from 'worker:./worker2';

async function testThread() {
  const { spawnWorker, makeController } = await loadWorker1();
  const controller = makeController();
  const sum = await spawnWorker(controller);
  const result = await sum(1, 2);
  await controller.terminate();

  assert(3, result, 'testThread');
}

async function testTransferables() {
  const nums = Uint8Array.from([1, 2, 3]);

  const { spawnWorker, makeController } = await loadWorker2();
  const controller = makeController();
  const sum = await spawnWorker(controller);
  const result = await sum({ nums });
  await controller.terminate();

  assert(6, result[0], 'testTransferables');
}

async function testPool() {
  const nums = Uint8Array.from([2, 3, 4]);

  const { spawnPool, makeController } = await loadWorker2();
  const controller = makeController();
  const pool = await spawnPool({ controller });
  const result = await pool.queue((sum) => sum({ nums }));
  await controller.terminate();

  assert(9, result[0], 'testThread');
}

async function assert(expected, actual, msg) {
  if (expected !== actual) {
    recordFailure(`${msg} [expected=${expected}, actual=${actual}]`);
  }
}

async function recordFailure(msg) {
  console.error(msg);
  window.__test__.failures.push(msg);
}

export function setup() {
  window.__test__ = {
    done: false,
    failures: [],
  };
}

export async function runSuite() {
  console.log('Running suite');

  await testThread();
  await testTransferables();
  await testPool();

  window.__test__.done = true;
}
