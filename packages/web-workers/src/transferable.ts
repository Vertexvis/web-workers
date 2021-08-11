import globalThis from './globalThis';
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

function instanceOf(obj: unknown, className: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Type = globalThis[className];
  return Type != null && obj instanceof Type;
}

function isTransferable(obj: unknown): obj is Transferable {
  return (
    instanceOf(obj, 'ArrayBuffer') ||
    instanceOf(obj, 'MessagePort') ||
    instanceOf(obj, 'ImageBitmap') ||
    instanceOf(obj, 'OffscreenCanvas')
  );
}

function isTypedArray(obj: unknown): obj is TypedArray {
  return (
    instanceOf(obj, 'Int8Array') ||
    instanceOf(obj, 'Uint8Array') ||
    instanceOf(obj, 'Uint8ClampedArray') ||
    instanceOf(obj, 'Int16Array') ||
    instanceOf(obj, 'Uint16Array') ||
    instanceOf(obj, 'Int32Array') ||
    instanceOf(obj, 'Uint32Array') ||
    instanceOf(obj, 'Float32Array') ||
    instanceOf(obj, 'Float64Array') ||
    instanceOf(obj, 'BigInt64Array') ||
    instanceOf(obj, 'BigUint64Array')
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
