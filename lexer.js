function isDigit(char){
    return char >= '0' && char <= '9'
}

class Lexer {

    constructor(input){
        this.input = input
        this.pos = 0
    }
    
    nextToken(){

        if(this.input[this.pos] === undefined){
            return {type: "EOF", value: "EOF"}
        }

        if(['\t',' '].includes(this.input[this.pos])){
            while(['\t',' '].includes(this.input[this.pos])){
                this.pos++
            }
        }

        switch(this.input[this.pos]){
            case '+':
            case '-':
            case '*':
            case '/':
                return {type: this.input[this.pos], value: this.input[this.pos++]}
        }

        if(isDigit(this.input[this.pos])) {
            let start = this.pos
            while(isDigit(this.input[this.pos])) {
                this.pos++   
            }
            return {type: "Number", value: this.input.substring(start,this.pos)}
        }

        return {type: "ERRORED", value: this.input[this.pos]}
    }
}

module.exports = Lexer