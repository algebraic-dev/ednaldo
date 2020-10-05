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
