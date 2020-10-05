const CallFrame = require('./callframe.js');
const { NotImplementedError, DivisionByZeroError, TypeError } = require('../errors.js');

function checkType(node, op, type){
  if(node.type != type){
    throw new TypeError(type, node.type, op)
  } else {
    return node
  }
}

function valToNumber(val, name){
  switch(value.type){
    case 'Number':
      return val
    case 'Bool':
      return {type: 'Number', value: +val.value};
    case 'String':
    case 'Array':
      return {type: 'Number', value: val.value.length}
    default:
      throw new TypeError('Number', val.type, name)
  }
}

function valToBool(val, name){
  switch(val.type){
    case 'Number':
      return {type: 'Number', value: !!val.value};
    case 'Bool':
      return bool
    default:
      throw new TypeError('Bool', val.type, name)

  }
}

class Interpreter {
  constructor() {
    this.callStack = [new CallFrame()];
  }

  // Variable manipulation funtions 
  findVar(name) {
    if (this.callStack[this.callStack.length - 1].findVar(name) !== undefined) {
      return this.callStack[this.callStack.length - 1].findVar(name);
    }
    if (this.callStack[0].findVar(name) !== undefined) {
      return this.callStack[0].findVar(name);
    }
    return null;
  }

  setVar(name, type, value) {
    if (!this.callStack[this.callStack.length - 1].setVarAndCheckExistence(name, type, value)) {
      if (!this.callStack[0].setVarAndCheckExistence(name, type, value)) {
        throw new Error(`Variavel '${name}' não existe`);
      }
    }
  }

  declVar(name, type, value) {
    this.callStack[this.callStack.length - 1].declVar(name, type, value);
  }

  visitVarDecl(node) {
    this.declVar(node.name, 'Number', this.visit(node.value));
    return null;
  }

  visitVarSet(node) {
    this.setVar(node.name, 'Number', this.visit(node.value));
    return null;
  }

  // Funções que servem para dar parsing em cada tipo de nó da arvore sintática
  visitCompound(node) {
    this.callStack[this.callStack.length - 1].frames.push({});
    let val = null;
    for (let i = 0; i < node.code.length; i += 1) {
      val = this.visit(node.code[i]);
    }
    this.callStack[this.callStack.length - 1].frames.pop();
    return val;
  }

  visitCall(node) {
    const { name } = node;
    const args = node.args.map((a) => this.visit(a));
    if (name === 'print') {
      console.log(...args);
    } else {
      const value = this.findVar(name);
      if (value === undefined) {
        throw new Error(`Função ${name} não encontrada!`);
      }
      if (value.type !== 'Function') {
        throw new Error(`O valor encontrado em ${value}`);
      }
      const func = value.value;

      if (func.args.length !== args.length) {
        throw new Error(`Opo numero errado de argumentos, voce deu ${args.length} mas precisa de ${value.args.length}`);
      }

      this.callStack.push(new CallFrame());
      for (let i = 0; i < func.args.length; i += 1) {
        this.declVar(func.args[i], 'Number', args[i]);
      }
      let val = null;
      for (let i = 0; i < func.compound.code.length; i += 1) {
        val = this.visit(func.compound.code[i]);
      }

      this.callStack.pop();
      return val;
    }
    return null;
  }

  visitId(node) {
    const value = this.findVar(node.value);
    if (value === undefined) {
      throw new Error(`Variável ${node.value} não encontrada!`);
    }
    return value.value;
  }

  visitProgram(node) {
    for (let i = 0; i < node.statements.length; i += 1) {
      this.visit(node.statements[i]);
    }
    return null;
  }

  visitIf(node) {
    if (this.visit(node.condition).value) {
      return this.visit(node.compound);
    }
    if (node.elseCompound) {
      return this.visit(node.elseCompound);
    }

    return {type: 'Null', value: 'Null'};
  }

  visitFunction(node) {
    this.declVar(node.name, 'Function', node);
    return {type: 'Null', value: 'Null'};
  }

  visitBinaryMathOperation(node, op, name) {
    const x = checkType(this.visit(node.left), name,'Number');
    const y = checkType(this.visit(node.right), name,'Number');
    return { type: 'Number', value: op(x, y) };
  }

  visitBinaryComparisonOperation(node, op) {
    const x = valToBool(this.visit(node.left), op);
    const y = valToBool(this.visit(node.right), op);
    return { type: 'Bool', value: op(x, y) };
  }

  visit(node) {
    switch (node.type) {
      case 'Compound': return this.visitCompound(node);
      case 'Call': return this.visitCall(node);
      case 'Identifier': return this.visitId(node);
      case 'Program': return this.visitProgram(node);
      case 'VarSet': return this.visitVarSet(node);
      case 'VarDecl': return this.visitVarDecl(node);
      case 'Function': return this.visitFunction(node);
      case 'If': return this.visitIf(node);
      case 'Bool': 
      case 'String': return node;
      case 'Number': return { type: 'Number', value: parseInt(node.value, 10) };
      case '+': return this.visitBinaryMathOperation(node, (x, y) => x.value + y.value,'+');
      case '-': return this.visitBinaryMathOperation(node, (x, y) => x.value - y.value,'-');
      case '*': return this.visitBinaryMathOperation(node, (x, y) => x.value * y.value,'*');
      case '^': return this.visitBinaryMathOperation(node, (x, y) => x.value ** y.value,'^');
      case '/': return this.visitBinaryMathOperation(node, (x, y) => {
        if (y.value === 0) throw new DivisionByZeroError(y.pos);
        return x.value / y.value;
      },'/');
      case '>': return this.visitBinaryMathOperation(node, (x, y) => x.value > y.value);
      case '<': return this.visitBinaryMathOperation(node, (x, y) => x.value < y.value);
      case '>=': return this.visitBinaryMathOperation(node, (x, y) => x.value >= y.value);
      case '<=': return this.visitBinaryMathOperation(node, (x, y) => x.value <= y.value);
      case '==': return this.visitBinaryMathOperation(node, (x, y) => x.value === y.value);
      default:
        throw new NotImplementedError(node);
    }
  }

  run(node) {
    return this.visit(node);
  }
}

module.exports = Interpreter;
