const KEYWORDS = ['val','fn','if','else','const','and','or','elif']

function isDigit(char){
    return char >= '0' && char <= '9'
}

function isOperator(char){
    return ['+','-','*','/','(',')','[',']','{','}','>','<','=','.',',','|','^','&','@','#','?','!',':'].includes(char)
}

function isUseless(char){
    return [' ', '\t', '\n', '\r'].includes(char)
}

function isValidStartOfIdentifierCharacter(char){
    return !isUseless(char) && !isDigit(char) && !isOperator(char)
}

function isValidIdentifierCharacter(char){
    return !isUseless(char)  && !isOperator(char)
}

function checkIdType(value){
    return KEYWORDS.includes(value) ? value[0].toUpperCase() + value.substring(1,value.length) : 'Identifier'
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

        if(['\t',' ','\n'].includes(this.input[this.pos])){
            while(['\t',' ','\n'].includes(this.input[this.pos])){
                this.pos++
            }
        }

        switch(this.input[this.pos]){
            case '+':
            case '-':
            case '*':
            case '/':
            case '^':
            case '(':
            case ')':
            case '<':
            case '>':
            case '=':
            case '{':
            case '}':
                return {type: this.input[this.pos], value: this.input[this.pos++]}
        }

        if(isDigit(this.input[this.pos])) {
            let start = this.pos
            while(isDigit(this.input[this.pos])) {
                this.pos++   
            }
            return {type: "Number", value: this.input.substring(start,this.pos)}
        } else if(isValidStartOfIdentifierCharacter(this.input[this.pos])){
            let start = this.pos
            while(isValidIdentifierCharacter(this.input[this.pos])) {
                this.pos++   
            }
            let value = this.input.substring(start,this.pos)
            return {type: checkIdType(value), value}
        }

        return {type: "ERRORED", value: this.input[this.pos]}
    }
}

module.exports = Lexer