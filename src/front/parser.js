const { SyntaxError } = require('../errors.js');

// O parser pega o stream de lemexas do lexer e tenta
// Correlacionar eles. Caso não seja possivel correlacionar ele
// irá soltar um erro.

class Parser {
  constructor(lexer) {
    this.lexer = lexer;

    this.actual = this.lexer.nextToken();
    this.previous = { type: 'EOF' };
  }

  eat(type) {
    if (this.actual.type === type) {
      this.advance();
      return this.previous;
    }
    throw new SyntaxError(type, this.actual.type, this.actual.pos);
  }

  advance() {
    this.previous = this.actual;
    this.actual = this.lexer.nextToken();
  }

  parseName() {
    const name = this.eat('Identifier');
    if (this.actual.type === '(') {
      this.eat('(');
      const args = [];
      while (this.actual.type !== ')' && this.actual.type !== 'EOF') {
        args.push(this.logicalOperators());
        if (this.actual.type === ',') {
          
          this.eat(',')
        } else {
          break
        }
      }
      this.eat(')');
      return { type: 'Call', name: name.value, args };
    }
    return name;
  }

  // Math

  factor() {
    switch(this.actual.type){
      case '(': {
        this.eat('(');
        const expr = this.expr();
        this.eat(')');
        return expr;
      }
      case '-': {
        this.eat('-');
        const expr = this.factor();
        return { type: 'Unary', op: '-', value: expr };
      }
      case 'True':
        this.advance()
        return {type: 'Bool', value: true}
      case 'False':
        this.advance()
        return {type: 'Bool', value: false}
      case 'Identifier': 
        return this.parseName();
      case 'String':
        return this.eat('String');
      default:     
        return this.eat('Number');
    }
  }

  powered() {
    let left = this.factor();
    while (this.actual.type === '^') {
      const { type } = this.actual;
      this.advance();
      left = { left, type, right: this.factor() };
    }
    return left;
  }

  mult() {
    let left = this.powered();
    while (this.actual.type === '*' || this.actual.type === '/') {
      const { type } = this.actual;
      this.advance();
      left = { left, type, right: this.powered() };
    }
    return left;
  }

  expr() {
    let left = this.mult();
    while (this.actual.type === '+' || this.actual.type === '-') {
      const { type } = this.actual;
      this.advance();
      left = { left, type, right: this.mult() };
    }
    return left;
  }

  condition() {
    let left = this.expr();
    if (this.actual.type === '<' || this.actual.type === '>' || this.actual.type === '>=' || this.actual.type === '<=' || this.actual.type === '==') {
      const { type } = this.actual;
      this.advance();
      left = { left, type, right: this.expr() };
    }
    return left;
  }

  logicalOperators() {
    let left = this.condition();
    while (this.actual.type === 'And' || this.actual.type === 'Or') {
      const { type } = this.actual;
      this.advance();
      left = { left, type, right: this.condition() };
    }
    return left;
  }

  // Statements

  parseVariableDeclaration() {
    this.eat('Val');
    const name = this.eat('Identifier').value;
    this.eat('=');

    const expr = this.expr();
    return { type: 'VarDecl', name, value: expr };
  }

  parseVarSet(name) {
    this.eat('=');
    const expr = this.expr();
    return { type: 'VarSet', name: name.value, value: expr };
  }

  parseCompound() {
    this.eat('Do');
    const code = [];
    while (this.actual.type !== 'End' && this.actual.type !== 'EOF') {
      code.push(this.statement());
    }
    this.eat('End');
    return { type: 'Compound', code };
  }

  parseUnrestrictedCompound(terminals) {
    const code = [];
    while (!terminals.includes(this.actual.type) && this.actual.type !== 'EOF') {
      code.push(this.statement());
    }
    return { type: 'Compound', code };
  }

  parseIf() {
    this.eat('If');
    const condition = this.logicalOperators();
    this.eat('Do')
    const compound = this.parseUnrestrictedCompound(['End','Else','Elif'])
    const elseifs = [];
    let elseCompound;

    while (this.actual.type === 'Elif') {
      this.eat('Elif');
      const elifCondition = this.logicalOperators();
      const elifCompound = this.parseCompound();
      elseifs.push({ condition: elifCondition, compound: elifCompound });
    }

    if (this.actual.type === 'Else') {
      this.eat('Else');
      elseCompound = this.parseUnrestrictedCompound(['End']);
    }

    this.eat('End')

    return {
      type: 'If', condition, compound, elseifs, elseCompound,
    };
  }

  parseFn() {
    this.eat('Fn');
    const name = this.eat('Identifier').value;
    const args = [];
    if (this.actual.type === '(') {
      this.eat('(');
      while (this.actual.type !== ')' && this.actual.type !== 'EOF') {
        args.push(this.eat('Identifier').value);
        if (this.actual.type !== ',') {
          break;
        } else {
          this.eat(',');
        }
      }
      this.eat(')');
    }
    const compound = this.parseCompound();

    return {
      type: 'Function', name, args, compound,
    };
  }

  statement() {
    switch (this.actual.type) {
      case 'Val':
        return this.parseVariableDeclaration();
      case 'If':
        return this.parseIf();
      case '{':
        return this.parseCompound();
      default: {
        const expr = this.logicalOperators();
        if (expr.type === 'Identifier' && this.actual.type === '=') {
          return this.parseVarSet(expr);
        }
        return expr;
      }
    }
  }

  firstClassStructs(){
    if (this.actual.type === 'Fn') {
      return this.parseFn();
    } else {
      return this.statement();
    }
  }

  parse() {
    const statements = [];
    while (this.actual.type !== 'EOF') {
      statements.push(this.firstClassStructs())
    }
    this.eat('EOF');
    return { type: 'Program', statements };
  }
}

module.exports = Parser;
