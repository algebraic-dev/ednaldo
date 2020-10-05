const Lexer = require('./src/front/lexer.js');
const Parser = require('./src/front/parser.js');
const Machine = require('./src/interpreter/interpreter.js');

const code = `
print("atapo")`;

const lexer = new Lexer(code);
const parser = new Parser(lexer);
const machine = new Machine();

try {
  machine.run(parser.parse());
} catch (err) {
  console.log(err);
}
