const CallFrame = require('./callframe.js');
const { NotImplementedError, DivisionByZeroError } = require('./errors.js');

class Machine {
  constructor() {
    this.callStack = [new CallFrame()];
  }

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
        throw new Error('It\'s not a function motherfucker');
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

    return null;
  }

  visitFunction(node) {
    this.declVar(node.name, 'Function', node);
    return null;
  }

  visitVarDecl(node) {
    this.declVar(node.name, 'Number', this.visit(node.value));
    return null;
  }

  visitVarSet(node) {
    this.setVar(node.name, 'Number', this.visit(node.value));
    return null;
  }

  visitBinaryMathOperation(node, op) {
    const x = this.visit(node.left);
    const y = this.visit(node.right);
    return { type: 'Number', value: op(x, y) };
  }

  visitBinaryComparisonOperation(node, op) {
    const x = this.visit(node.left);
    const y = this.visit(node.right);
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
      case 'String': return node;
      case 'Number': return { type: 'Number', value: parseInt(node.value, 10) };
      case '+': return this.visitBinaryMathOperation(node, (x, y) => x.value + y.value);
      case '-': return this.visitBinaryMathOperation(node, (x, y) => x.value - y.value);
      case '*': return this.visitBinaryMathOperation(node, (x, y) => x.value * y.value);
      case '^': return this.visitBinaryMathOperation(node, (x, y) => x.value ** y.value);
      case '/': return this.visitBinaryMathOperation(node, (x, y) => {
        if (y.value === 0) throw new DivisionByZeroError(y.pos);
        return x.value / y.value;
      });
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

module.exports = Machine;
