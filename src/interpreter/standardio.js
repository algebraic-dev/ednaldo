module.exports = {
  stdout: {
    write: (bytes) => {
      process.stdout.write(bytes);
    },
  },
};
