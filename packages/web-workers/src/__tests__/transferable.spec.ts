import { TransferDescriptor } from 'threads';
import { makeTransferable } from '../transferable';
import '../__mocks__/browser';

function isTransferDescriptor(obj: unknown): obj is TransferDescriptor {
  return obj != null && Array.isArray((obj as any).transferables);
}

describe(makeTransferable, () => {
  it('returns Transfer for transferable type', () => {
    const buffer = new ArrayBuffer(0);
    expect(isTransferDescriptor(makeTransferable(buffer))).toBe(true);

    const messagePort = new MessagePort();
    expect(isTransferDescriptor(makeTransferable(messagePort))).toBe(true);

    const imageBitmap = new ImageBitmap();
    expect(isTransferDescriptor(makeTransferable(imageBitmap))).toBe(true);

    const canvas = new OffscreenCanvas(100, 50);
    expect(isTransferDescriptor(makeTransferable(canvas))).toBe(true);
  });

  it('returns self if primitive', () => {
    expect(makeTransferable(1)).toBe(1);
    expect(makeTransferable('')).toBe('');
    expect(makeTransferable(true)).toBe(true);
    expect(makeTransferable(null)).toBe(null);
    expect(makeTransferable(undefined)).toBe(undefined);
    expect(makeTransferable(Symbol.for('sym'))).toBe(Symbol.for('sym'));
  });

  it('returns Transfer for object', () => {
    const obj = {
      name: 'foo',
      empty: null,
      buffer: new ArrayBuffer(0),
      int8: new Int8Array(),
      uint8: new Uint8Array(),
      uint8Clamped: new Uint8ClampedArray(),
      int16: new Int16Array(),
      uint16: new Uint16Array(),
      float32: new Float32Array(),
      float64: new Float64Array(),
      big64: new BigInt64Array(),
      ubig64: new BigUint64Array(),
      children: [
        { name: 'a', nums: Uint8Array.of(2) },
        { name: 'b', nums: Uint8Array.of(3) },
      ],
    };

    const transferable = makeTransferable(obj);
    if (isTransferDescriptor(transferable)) {
      expect(transferable.transferables).toHaveLength(12);
    } else {
      throw new Error('Result is not a transferable');
    }
  });
});
