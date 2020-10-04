class CallFrame {
    constructor(){
        this.frames = [{}]
    }

    findVar(name){
        for(let i = this.frames.length-1; i >= 0; i--){
            if (this.frames[i][name] !== undefined) {
                return this.frames[i][name]
            }
        }
        return undefined
    }

    declVar(name, type, value){
        if(this.frames[this.frames.length-1][name] !== undefined){
            throw new Error(`Variavel '${name}' já foi declarada nesse escopo`)
        } else {
            this.frames[this.frames.length-1][name] = {type, value}
        }
    }

    // Caso retorne true quer dizer que foi setado se não é pq a variavel não existe nesse frame
    setVarAndCheckExistence(name, type, value){
        for(let i = this.frames.length-1; i >= 0; i--){
            if (this.frames[i][name] !== undefined) {
                this.frames[this.frames.length-1][name] = {type, value}
                return true
            }
        }
        return false
    }
}

class Machine {
    constructor(){
        this.callStack = [new CallFrame()]
    }

    findVar(name){
        if(this.callStack[this.callStack.length-1].findVar(name) !== undefined){
            return this.callStack[this.callStack.length-1].findVar(name)
        }
        if(this.callStack[0].findVar(name) !== undefined){
            return this.callStack[0].findVar(name)
        }
        throw new Error(`Variavel '${name}' não existe`)
    }

    setVar(name, type, value){
        if (!this.callStack[this.callStack.length-1].setVarAndCheckExistence(name, type, value)){
            if(!this.callStack[0].setVarAndCheckExistence(name, type, value)){
                throw new Error(`Variavel '${name}' não existe`)
            }
        }
    }

    declVar(name, type, value){
        this.callStack[this.callStack.length-1].declVar(name, type, value)
    }

    visit(node){
        switch(node.type){
            case 'Compound':
                this.callStack[this.callStack.length-1].frames.push({})
                for(let i = 0; i < node.code.length; i++){
                    this.visit(node.code[i])
                }
                this.callStack[this.callStack.length-1].frames.pop()
                return null
            case 'Call':
                let name = node.name
                let args = node.args.map(a => this.visit(a))
                if (name == 'print'){
                    console.log(...args)
                } 
                return null
            case 'Identifier':
                let value = this.findVar(node.value)
                return value.value
            case 'Program':
                for(let i = 0; i < node.statements.length; i++){
                    this.visit(node.statements[i])
                }
                return
            case 'VarSet':
                this.setVar(node.name, 'Number', this.visit(node.value))
                return null
            case 'VarDecl':
                this.declVar(node.name, 'Number', this.visit(node.value))
                return null
            case 'Function':
            case 'If':
            case 'Number':
                return parseInt(node.value)
            case '*':
                return this.visit(node.left) * this.visit(node.right)
            case '/':
                return this.visit(node.left) / this.visit(node.right)
            case '-':
                return this.visit(node.left) - this.visit(node.right)
            case '+':
                return this.visit(node.left) + this.visit(node.right)
            case '^':
                return this.visit(node.left) ** this.visit(node.right)
            case 'And':
                return this.visit(node.left) && this.visit(node.right)
            case 'Or':
                return this.visit(node.left) || this.visit(node.right)
            case '>':
                return this.visit(node.left) > this.visit(node.right)
            case '<':
                return this.visit(node.left) < this.visit(node.right)
            case '>=':
                return this.visit(node.left) >= this.visit(node.right)
            case '<=':
                return this.visit(node.left) <= this.visit(node.right)
        }
    }

    run(node){
        return this.visit(node)
    }
}

module.exports = Machine