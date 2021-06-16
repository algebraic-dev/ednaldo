/* eslint-disable no-nested-ternary */
const { IncorrectArgNumberError } = require('../errors.js');
const { checkType } = require('./utils.js');

function formatInterpreterType(node) {
  switch (node.type) {
    case 'String':
      return node.value;
    case 'Number':
      return `\x1b[34m${node.value}\x1b[0m`;
    case 'Array':
      return `[ ${node.value.map((val) => formatInterpreterType(val)).join(' ')} ]`;
    case 'Bool':
      return node.value ? '\x1b[32mVoce vale tudo\x1b[0m' : '\x1b[31mVoce vale nada\x1b[0m';
    case 'Nil':
      return '\u001b[38;5;240mNil\x1b[0m';
    case 'FunctionDecl':
      return `\x1b[2m\x1b[36m<Fn: ${node.value.name}>\x1b[0m`;
    default:
      return `<Not Recognized = ${node.type}>`;
  }
}

module.exports = {
  print: {
    run(machine, ...args) {
      if (args.length < 1) throw new IncorrectArgNumberError(1, args.length, 'printOrTrick');
      for (let i = 0; i < args.length; i += 1) {
        machine.io.stdout.write(`${formatInterpreterType(args[i])} `);
      }
      machine.io.stdout.write('\n');
      return { type: 'Nil' };
    },
  },
  string: {
    run(_machine, ...args) {
      if (args.length !== 1) throw new IncorrectArgNumberError(1, args.length, 'string');
      switch (args[0].type) {
        case 'String': return args[0];
        case 'Number': return { type: 'String', value: args[0].value.toString() };
        case 'Bool': return { type: 'String', value: args[0].value ? 'Voce vale tudo' : 'Voce vale nada' };
        case 'Array': return { type: 'String', value: '[Array]' };
        default:
          return { type: 'Nil' };
      }
    },
  },
  append: {
    run(_machine, ...args) {
      if (args.length !== 2) throw new IncorrectArgNumberError(2, args.length, 'append');
      checkType(args[0], 'append', 'Array');
      return { type: 'Array', value: args[0].value.concat(args[1]) };
    },
  },
  len: {
    run(_machine, ...args) {
      if (args.length !== 1) throw new IncorrectArgNumberError(2, args.length, 'len');
      return { type: 'Number', value: args[0].value ? (args[0].value.length ? args[0].value.length : 0) : 0 };
    },
  },
};
