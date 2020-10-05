const { checkType } = require('./utils.js');
const { IncorrectArgNumberError } = require('../errors.js');

function formatInterpreterType(node){
    switch(node.type){
        case 'String':
           return node.value;
        case 'Number':
            return '\x1b[34m' + node.value + '\x1b[0m';
        case 'Array':
            return `｢ ${node.value} ｣`;
        case 'Null':
            return 'Null'
    }
}

module.exports = {
    'println': {
        run: function(machine, ...args){
            if (args.length < 1) throw new IncorrectArgNumberError(1, args.length, 'print')
            for(let i = 0; i < args.length; i++){
                machine.io.stdout.write(formatInterpreterType(args[i]) + ' ')
            }
            machine.io.stdout.write('\n')
        }
    }
}