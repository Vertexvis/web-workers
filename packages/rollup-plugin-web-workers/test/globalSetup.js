const getPort = require('get-port');
const { setup: setupPuppeteer } = require('jest-environment-puppeteer');

module.exports = async function globalSetup(globalConfig) {
  process.env.__PORT__ = await getPort();
  await setupPuppeteer(globalConfig);
};
