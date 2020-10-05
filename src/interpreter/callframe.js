/**
 * Essa classe serve para a criação de pedaços de memória que são vistos somente
 * por uma função e não por outra. Por exemplo, quando a função a() chama a funcão b()
 * a função b() não pode acessar o espaço de variaveis do espaço a() e por isso a cada 
 * chamada de função nós criamos um CallFrame e botamos no fim da CallStack
 */

class CallFrame {
  constructor() {
    this.frames = [{}];
  }

  findVar(name) {
    for (let i = this.frames.length - 1; i >= 0; i -= 1) {
      if (this.frames[i][name] !== undefined) {
        return this.frames[i][name];
      }
    }
    return undefined;
  }

  declVar(name, type, value) {
    if (this.frames[this.frames.length - 1][name] !== undefined) {
      throw new Error(`Variavel '${name}' já foi declarada nesse escopo`);
    } else {
      this.frames[this.frames.length - 1][name] = { type, value };
    }
  }

  // Caso retorne true quer dizer que foi setado se não é pq a variavel não existe nesse frame
  setVarAndCheckExistence(name, type, value) {
    for (let i = this.frames.length - 1; i >= 0; i -= 1) {
      if (this.frames[i][name] !== undefined) {
        this.frames[this.frames.length - 1][name] = { type, value };
        return true;
      }
    }
    return false;
  }
}

module.exports = CallFrame;
