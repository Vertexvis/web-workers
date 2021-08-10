test('run test suite', async () => {
  await page.goto(`http://127.0.0.1:${process.env.__PORT__}`);

  let state = { done: false, failures: [] };
  do {
    state = await page.evaluate('window.__test__');
  } while (!state.done);

  expect(state.failures).toEqual([]);
});
