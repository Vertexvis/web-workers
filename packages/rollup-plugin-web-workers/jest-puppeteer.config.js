module.exports = {
  launch: {
    dumpio: true,
  },
  server: {
    command: `http-server ./dist-test -p ${process.env.__PORT__}`,
    port: process.env.__PORT__,
  },
};
