const fs = require('fs');
const readline = require('readline');
const util = require('util');
const Lexer = require('./src/front/lexer.js');
const Parser = require('./src/front/parser.js');
const Machine = require('./src/interpreter/interpreter.js');

function executeFile(file) {
  let code;
  try {
    code = fs.readFileSync(file).toString('utf-8');
  } catch (err) {
    process.stdout.write('File not found\n');
    return;
  }

  const lexer = new Lexer(code);
  const parser = new Parser(lexer);
  const machine = new Machine();

  try {
    machine.run(parser.parse());
  } catch (err) {
    process.stdout.write(util.inspect(err, false, 3, true));
  }
}

function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  const machine = new Machine();

  process.stdout.write("Repl de Ednaldo use ':quit' to quit!\n\n");

  rl.prompt();
  rl.on('line', (line) => {
    if (line.trim() === ':quit') {
      rl.close();
    } else {
      const lexer = new Lexer(line.trim());
      const parser = new Parser(lexer);
      try {
        const val = machine.run(parser.parse());
        if (val !== null) {
          machine.builtIn.println.run(machine, val);
        }
      } catch (err) {
        process.stdout.write(`${util.inspect(err, false, 3, true)}\n`);
      }
    }
    rl.prompt();
  });
}

if (process.argv.length > 2) {
  executeFile(process.argv[2]);
} else {
  repl();
}
