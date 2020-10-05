const { IncorrectArgNumberError } = require('../errors.js');

function formatInterpreterType(node) {
  switch (node.type) {
    case 'String':
      return node.value;
    case 'Number':
      return `\x1b[34m${node.value}\x1b[0m`;
    case 'Array':
      return `｢ ${node.value} ｣`;
    case 'Bool':
      if (node.value) {
        return '\x1b[32mTrue\x1b[0m';
      }
      return '\x1b[31mFalse\x1b[0m';
    case 'nil':
      return 'nil';
    default:
      return 'nil';
  }
}

module.exports = {
  println: {
    run(machine, ...args) {
      if (args.length < 1) throw new IncorrectArgNumberError(1, args.length, 'print');
      for (let i = 0; i < args.length; i += 1) {
        machine.io.stdout.write(`${formatInterpreterType(args[i])} `);
      }
      machine.io.stdout.write('\n');
    },
  },
};
