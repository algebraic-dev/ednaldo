const { TypeError } = require('../errors.js');

function checkType(node, op, type) {
  if (node.type !== type) {
    throw new TypeError(type, node.type, op);
  } else {
    return node;
  }
}

function valToNumber(val, name) {
  switch (val.type) {
    case 'Number':
      return val;
    case 'Bool':
      return { type: 'Number', value: +val.value };
    case 'String':
    case 'Array':
      return { type: 'Number', value: val.value.length };
    default:
      throw new TypeError('Number', val.type, name);
  }
}

function valToBool(val, name) {
  switch (val.type) {
    case 'Number':
      return { type: 'Number', value: !!val.value };
    case 'Bool':
      return val;
    default:
      throw new TypeError('Bool', val.type, name);
  }
}

module.exports = { checkType, valToBool, valToNumber };
