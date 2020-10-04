class Machine {
    constructor(){

    }


    visit(node){
        switch(node.type){
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
        }
    }

    run(node){
        return this.visit(node)
    }
}

module.exports = Machine