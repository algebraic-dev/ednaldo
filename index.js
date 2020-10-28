/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const readline = require('readline');
const util = require('util');
const Lexer = require('./src/front/lexer.js');
const Parser = require('./src/front/parser.js');
const Machine = require('./src/interpreter/interpreter.js');
const { SyntaxError } = require('./src/errors.js');

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

async function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  const machine = new Machine();

  process.stdout.write("Repl de Ednaldo use ':quit' to quit!\n\n");

  rl.prompt();

  let join = '';
  let joining = false;

  for await (const line of rl) {
    if (line.trim() === ':quit') {
      process.stdout.write(`\x1b[1m\x1b[41mJogue somente para ganhar, e não para perder\x1b[0m: O erro aqui foi voce ter saido do ednaldo... \n`);
      rl.close();
      return;
    }else if(line.trim() === ":help") {
      process.stdout.write("\nDocumentação oficial:\nhttps://www.letras.mus.br/ednaldo-pereira/1775281/\n\n");
    }
    const lexer = new Lexer(joining ? join + line.trim() : line.trim());
    const parser = new Parser(lexer);
    try {
      const val = machine.run(parser.parse());
      if (val !== null) {
        join = '';
        joining = false;
        machine.builtIn.printEdnaldo.run(machine, val);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        if (err.got === 'EOF') {
          process.stdout.write('.. ');
          joining = true;
          join += `${line}\n`;
          continue;
        }
      }
      join = '';
      joining = false;
      if(Math.random() > 0.2){  
        process.stdout.write(`\x1b[1m\x1b[41mJogue somente para ganhar, e não para perder:\x1b[0m ${util.inspect(err, false, 3, true)}\n\x1b[0m`);
      } else{
        process.stdout.write("Se eu te contar voce não acredita....\n");
      }
    }

    rl.prompt();
  }
}

if (process.argv.length > 2) {
  executeFile(process.argv[2]);
} else {
  repl();
}
