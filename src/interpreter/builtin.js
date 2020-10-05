const { IncorrectArgNumberError } = require('../errors.js');

function formatInterpreterType(node) {
  switch (node.type) {
    case 'String':
      return node.value;
    case 'Number':
      return `\x1b[34m${node.value}\x1b[0m`;
    case 'Array': {
      const values = node.values.map((val) => formatInterpreterType(val)).join(' ');
      return `[ ${values} ]`;
    }
    case 'Bool':
      if (node.value) {
        return '\x1b[32mTrue\x1b[0m';
      }
      return '\x1b[31mFalse\x1b[0m';
    case 'Nil':
      return 'Nil';
    default:
      return `<Not Recognized = ${node.type}>`;
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
      return { type: 'Nil' };
    },
  },
  string: {
    run(machine, ...args) {
      if (args.length !== 1) throw new IncorrectArgNumberError(1, args.length, 'string');
      switch (args[0].type) {
        case 'String': return args[0];
        case 'Number': return { type: 'String', value: args[0].value.toString() };
        case 'Bool': return { type: 'String', value: args[0].value ? 'True' : 'False' };
        case 'Array': return { type: 'String', value: '[Array]' };
        default:
          return { type: 'Nil' };
      }
    },
  },
  registerNode: {
    run(machine, ...args) {
      if (args.length !== 2) throw new IncorrectArgNumberError(2, args.length, 'registerNode');
      return { type: 'String', value: args[0].value.toString() };
    },
  },
};
