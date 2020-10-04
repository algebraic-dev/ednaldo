const Lexer = require("./lexer.js")
const Parser = require("./parser.js")
const Machine = require("./interpreter.js")


const code = `
{
    val a = 5
    val b = a * 3
    print(b)
    print(a)
}
print(a)`

let lexer = new Lexer(code)

let parser = new Parser(lexer)

let machine = new Machine()

machine.run(parser.parse())