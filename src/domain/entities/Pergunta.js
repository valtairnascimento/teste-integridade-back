class Pergunta {
  constructor(id, texto, opcoes, pontuacaoPorOpcao) {
    this.id = id;
    this.texto = texto;
    this.opcoes = opcoes; // Array [{ texto: string, pontos: number }]
    this.pontuacaoPorOpcao = pontuacaoPorOpcao; // { opcao: pontos }
  }
}

class Teste {
  constructor(perguntasFixas, perguntasRandomizadas, usuarioId) {
    this.perguntasFixas = perguntasFixas;
    this.perguntasRandomizadas = perguntasRandomizadas;
    this.usuarioId = usuarioId;
  }
}

class Resultado {
  constructor(pontuacaoTotal, nivel, detalhes) {
    this.pontuacaoTotal = pontuacaoTotal;
    this.nivel = nivel;
    this.detalhes = detalhes;
  }
}

module.exports = { Pergunta, Teste, Resultado };