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

    // Math 

    factor(){
        return this.eat("Number")
    }

    mult(){
        let left = this.factor() 
        while (this.actual.type == '*' || this.actual.type == '/') {
            let type = this.actual.type;
            this.advance()
            left = {left, type, right: this.factor()}
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
}

module.exports = Parser