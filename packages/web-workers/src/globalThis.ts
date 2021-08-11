// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getGlobal(): any {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  } else if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
  } else if (typeof global !== 'undefined') {
    return global;
  }
  throw new Error('unable to locate global object');
}

export default getGlobal();
