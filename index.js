const Lexer = require('./src/lexer.js');
const Parser = require('./src/parser.js');
const Machine = require('./src/interpreter.js');

const code = `
fn fib(n) ->
    if n < 2 -> 
        n.
    else ->
        fib(n-1) + fib(n-2)..

print(fib(10))
`;

const lexer = new Lexer(code);
const parser = new Parser(lexer);
const machine = new Machine();

try {
  machine.run(parser.parse());
} catch (err) {
  console.log(err);
}
