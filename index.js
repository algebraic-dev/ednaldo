const Lexer = require("./lexer.js")
const Parser = require("./parser.js")
const Machine = require("./interpreter.js")

let lexer = new Lexer('1 + 2 * 3')
let parser = new Parser(lexer)
let machine = new Machine()

console.log(machine.run(parser.expr()))