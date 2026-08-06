import getPort from 'get-port';
import puppeteerEnvironment from 'jest-environment-puppeteer';

export default async function globalSetup(globalConfig) {
  process.env.__PORT__ = await getPort();
  await puppeteerEnvironment.setup(globalConfig);
};
