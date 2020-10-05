const Lexer = require('./src/front/lexer.js');
const Parser = require('./src/front/parser.js');
const Machine = require('./src/interpreter/interpreter.js');

const code = `
fn fib(n) do
    if n < 2 do 
        n
    else
        fib(n-1) + fib(n-2)
    end
end

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
