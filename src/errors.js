/* eslint-disable max-classes-per-file */

class SyntaxError {
  constructor(expected, got, pos) {
    this.expected = expected;
    this.got = got;
    this.pos = pos;
  }
}

class NotFinishedStringError {
  constructor(pos) {
    this.pos = pos;
  }
}

class NotImplementedError {
  constructor(node) {
    this.node = node;
  }
}

class DivisionByZeroError {
  constructor(pos) {
    this.pos = pos;
  }
}

class TypeError {
  constructor(expected, got, operation){
    this.expected = expected
    this.got = got
    this.operation = operation
  }
}

module.exports = {
  SyntaxError, NotFinishedStringError, NotImplementedError, DivisionByZeroError, TypeError
};
