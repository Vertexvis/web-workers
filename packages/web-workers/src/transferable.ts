import { Transfer } from 'threads';

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

function isTransferable(obj: unknown): obj is Transferable {
  return (
    obj instanceof ArrayBuffer ||
    obj instanceof MessagePort ||
    obj instanceof ImageBitmap ||
    obj instanceof OffscreenCanvas
  );
}

function isTypedArray(obj: unknown): obj is TypedArray {
  return (
    obj instanceof Int8Array ||
    obj instanceof Uint8Array ||
    obj instanceof Uint8ClampedArray ||
    obj instanceof Int16Array ||
    obj instanceof Uint16Array ||
    obj instanceof Int32Array ||
    obj instanceof Uint32Array ||
    obj instanceof Float32Array ||
    obj instanceof Float64Array ||
    obj instanceof BigInt64Array ||
    obj instanceof BigUint64Array
  );
}

/**
 * A function that will recursively inspect an object and return a Threads
 * `Transfer` that contains all the `Transferable`s in the given object.
 *
 * @param obj The object to make transferable.
 * @returns A `Transfer` from Threads.
 */
export function makeTransferable<T>(obj: T): ReturnType<typeof Transfer> | T {
  if (isTransferable(obj)) {
    return Transfer(obj);
  } else if (obj != null && typeof obj === 'object') {
    const transferables = findTransferables(obj);
    return Transfer(obj, transferables);
  } else {
    return obj;
  }
}

function findTransferables<T>(obj: T): Transferable[] {
  if (isTransferable(obj)) {
    return [obj];
  } else if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      const result: Transferable[] = [];
      obj.forEach((o) => result.push(...findTransferables(o)));
      return result;
    } else if (isTypedArray(obj)) {
      return [obj.buffer];
    } else if (obj != null) {
      return Object.values(obj).reduce((acc, value) => {
        acc.push(...findTransferables(value));
        return acc;
      }, []);
    } else {
      return [];
    }
  } else {
    return [];
  }
}
