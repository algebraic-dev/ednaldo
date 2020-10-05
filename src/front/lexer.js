const { NotFinishedStringError, UnrecognizedError } = require('../errors.js');

const {
  isDigit, isValidIdentifierCharacter, isValidStartOfIdentifierCharacter, checkIdType,
} = require('./validation.js');

/**
 * Essa classe é o inicio da interpretação, ela irá pegar o código fonte
 * e transformar em um stream de tokens/lexemas que são as unidades basicas
 * que classificam cada "palavra" e simbolo do código fonte em um tipo unico
 */

class Lexer {
  constructor(input) {
    this.input = input;
    this.relPos = { line: 0, column: 0 };
    this.pos = 0;
  }

  // Essa função é usada para caso dois simbolos diferentes
  // Comecem com o mesmo character.
  doubleChar(firstType, sec, secType) {
    this.pos += 1;
    if (this.input[this.pos] === sec) {
      this.pos += 1;
      return { type: secType, value: secType };
    }
    return { type: firstType, value: firstType };
  }

  nextToken() {
    if (this.input[this.pos] === undefined) {
      return { type: 'EOF', value: 'EOF' };
    }

    // Remove os characters considerados inuteis
    if (['\t', ' ', '\n', '\r'].includes(this.input[this.pos])) {
      while (['\t', ' ', '\n', '\r'].includes(this.input[this.pos]) && this.input[this.pos] !== undefined) {
        if (this.input[this.pos] === '\n') {
          this.relPos.line += 1;
        }
        this.pos += 1;
      }
      return this.nextToken();
    }

    switch (this.input[this.pos]) {
      case '+':
      case '*':
      case '/':
      case '^':
      case '(':
      case ')':
      case '{':
      case '}':
      case '.':
      case ',':
      case '[':
      case ']':
        this.pos += 1;
        return {
          type: this.input[this.pos - 1],
          value: this.input[this.pos - 1],
          pos: this.relPos,
        };
      case '-':
        return this.doubleChar('-', '>', '->');
      case '<':
        return this.doubleChar('<', '=', '<=');
      case '>':
        return this.doubleChar('>', '=', '>=');
      case '=':
        return this.doubleChar('=', '=', '==');
      case '!':
        return this.doubleChar('!', '=', '!=');
      default:
        break;
    }

    // Checa por strings que começam somente com aspas duplas
    if (this.input[this.pos] === '"') {
      const start = this.pos;
      this.pos += 1;
      while (this.input[this.pos] !== '"' && this.input[this.pos]) {
        this.pos += 1;
      }
      if (this.input[this.pos] === undefined) {
        throw new NotFinishedStringError(this.relPos);
      }
      this.pos += 1;
      return { type: 'String', value: this.input.substring(start + 1, this.pos - 1), pos: this.relPos };
    }

    // Checa se há um numero valido (floats não são considerados numeros válidos por enquanto)
    if (isDigit(this.input[this.pos])) {
      const start = this.pos;
      while (isDigit(this.input[this.pos])) {
        this.pos += 1;
      }
      return { type: 'Number', value: this.input.substring(start, this.pos), pos: this.relPos };
    }

    // Checa se é um identificador valido, junta os chars e então retorna.
    if (isValidStartOfIdentifierCharacter(this.input[this.pos])) {
      const start = this.pos;
      while (isValidIdentifierCharacter(this.input[this.pos])) {
        this.pos += 1;
      }
      const value = this.input.substring(start, this.pos);
      return { type: checkIdType(value), value, pos: this.relPos };
    }

    throw new UnrecognizedError(this.input[this.pos], this.relPos);
  }
}

module.exports = Lexer;
