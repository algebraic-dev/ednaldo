class Parser {
    constructor(lexer){
        this.lexer = lexer
        
        this.actual = this.lexer.nextToken()
        this.previous = {type: "EOF"};
    
    }

    eat(type){
        if ( this.actual.type == type ) {
            this.advance()
            return this.previous
        } else {
            throw new Error(`Expected ${type} but instead got ${this.actual.type}`)
        }
    }

    advance(){
        this.previous = this.actual
        this.actual = this.lexer.nextToken()
    }

    parseName(){
        let name = this.eat("Identifier")
        if (this.actual.type == '('){
            this.eat('(')
            let args = []
            while(this.actual.type != ')' && this.actual.type != "EOF"){ 
                args.push(this.expr())
            }
            this.eat(')')
            return {type: "Call", name: name.value, args }
        }
        return name
    }

    // Math 

    factor(){
        if (this.actual.type == '('){
            this.eat('(')
            let expr = this.expr()
            this.eat(')')
            return expr
        } else if(this.actual.type == '-'){
            this.eat('-')
            let expr = this.factor()
            return {type: "Unary", op: '-', value: expr}
        } else if(this.actual.type == "Identifier"){
            return this.parseName()
        }
        return this.eat("Number")
    }

    powered(){
        let left = this.factor() 
        while (this.actual.type == '^') {
            let type = this.actual.type;
            this.advance()
            left = {left, type, right: this.factor()}
        }
        return left
    }
    
    mult(){
        let left = this.powered() 
        while (this.actual.type == '*' || this.actual.type == '/') {
            let type = this.actual.type;
            this.advance()
            left = {left, type, right: this.powered()}
        }
        return left
    }

    expr(){
        let left = this.mult() 
        while (this.actual.type == '+' || this.actual.type == '-') {
            let type = this.actual.type;
            this.advance() 
            left = {left, type, right: this.mult()}
        }
        return left
    }

    condition(){
        let left = this.expr() 
        if (this.actual.type == '<' || this.actual.type == '>' || this.actual.type == '>='  || this.actual.type == '<='  || this.actual.type == '==') {
            let type = this.actual.type;
            this.advance() 
            left = {left, type, right: this.expr()}
        }
        return left
    }

    logicalOperators(){
        let left = this.condition() 
        while (this.actual.type == 'And' || this.actual.type == 'Or') {
            let type = this.actual.type;
            this.advance() 
            left = {left, type, right: this.condition()}
        }
        return left
    }

    // Statements

    parseVariableDeclaration(){
        this.eat('Val')
        let name = this.eat('Identifier').value
        this.eat('=')
        
        let expr = this.expr()
        return {type: "VarDecl", name, value: expr}
    }

    parseVarSet(name){
        this.eat('=')
        let expr = this.expr()
        return {type: "VarSet", name: name.value, value: expr}
    }

    parseCompound(){
        this.eat('{')
        let code = []
        while(this.actual.type != '}' && this.actual.type != "EOF"){
            code.push(this.statement())
        }
        this.eat('}')
        return {type: "Compound", code}
    }

    parseIf(){
        this.eat('If')
        let condition = this.logicalOperators()
        let compound = this.parseCompound()
        let elseifs = []
        let elseCompound;

        while(this.actual.type == 'Elif'){
            this.eat('Elif')
            let condition = this.logicalOperators()
            let compound = this.parseCompound()
            elseifs.push({condition, compound})
        }

        if(this.actual.type == 'Else'){
            this.eat('Else')
            elseCompound = this.parseCompound()
        }
        return {type: 'If', condition, compound, elseifs, elseCompound}
    }

    parseFn(){
        this.eat('Fn')
        let name = this.eat("Identifier").value
        let args = []
        if(this.actual.type == '('){
            this.eat('(')
            while(this.actual.type != ')' && this.actual.type != 'EOF'){
                args.push(this.eat('Identifier').value)
                if(this.actual.type != ','){
                    break
                } else {
                    this.eat(',')
                }
            }
            this.eat(')')
        }
        let compound = this.parseCompound()

        return {type: 'Function', name, args, compound}
    }

    statement(){
        switch(this.actual.type){
            case 'Val':
                return this.parseVariableDeclaration()
            case 'If':
                return this.parseIf()   
            case 'Fn':
                return this.parseFn()
            case '{':
                return this.parseCompound()
            default:
                let expr = this.logicalOperators()
                if (expr.type == 'Identifier' && this.actual.type == '='){
                    return this.parseVarSet(expr)
                }
                return expr
        }
    }

    parse(){
        let statements = []
        while(this.actual.type != 'EOF'){
            statements.push(this.statement())
        }
        this.eat('EOF')
        return {type:"Program", statements}
    }
}

module.exports = Parser