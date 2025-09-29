const PerguntaRepository = require('./PerguntaRepository');
const { Pergunta } = require('../../domain/entities/Pergunta');
const { v4: uuidv4 } = require('uuid');

class InMemoryPerguntaRepository extends PerguntaRepository {
  constructor() {
    super();
    this.perguntas = [
      // Perguntas Fixas (Consentimento)
      ...this.getPerguntasFixasSync(),
      // Perguntas Afetivas (ligação emocional)
      new Pergunta(uuidv4(), 'Sinto-me orgulhoso de trabalhar para esta empresa.', [
        { texto: '1 - Discordo Totalmente', pontos: 1 },
        { texto: '2', pontos: 2 },
        { texto: '3', pontos: 3 },
        { texto: '4', pontos: 4 },
        { texto: '5 - Concordo Totalmente', pontos: 5 }
      ], { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 }),
      new Pergunta(uuidv4(), 'Me importo com o futuro da empresa.', [
        { texto: '1', pontos: 1 }, { texto: '2', pontos: 2 }, { texto: '3', pontos: 3 }, { texto: '4', pontos: 4 }, { texto: '5', pontos: 5 }
      ], { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 }),
      // Perguntas Normativas (obrigação moral)
      new Pergunta(uuidv4(), 'Sinto que devo lealdade à empresa.', [
        { texto: '1', pontos: 1 }, { texto: '2', pontos: 2 }, { texto: '3', pontos: 3 }, { texto: '4', pontos: 4 }, { texto: '5', pontos: 5 }
      ], { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 }),
      new Pergunta(uuidv4(), 'Devo ficar por gratidão ao que a empresa me ofereceu.', [
        { texto: '1', pontos: 1 }, { texto: '2', pontos: 2 }, { texto: '3', pontos: 3 }, { texto: '4', pontos: 4 }, { texto: '5', pontos: 5 }
      ], { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 }),
      // Perguntas Continuativas (custos de saída)
      new Pergunta(uuidv4(), 'Seria difícil deixar a empresa devido às perdas pessoais.', [
        { texto: '1', pontos: 1 }, { texto: '2', pontos: 2 }, { texto: '3', pontos: 3 }, { texto: '4', pontos: 4 }, { texto: '5', pontos: 5 }
      ], { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 }),
      new Pergunta(uuidv4(), 'Não tenho alternativa além de continuar aqui.', [
        { texto: '1', pontos: 1 }, { texto: '2', pontos: 2 }, { texto: '3', pontos: 3 }, { texto: '4', pontos: 4 }, { texto: '5', pontos: 5 }
      ], { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 }),
      // Dilemas Éticos (Integridade)
      new Pergunta(uuidv4(), 'Quebrar uma regra no trabalho poderia ser uma possibilidade para:', [
        { texto: 'Livrar-se de um problema', pontos: 0 },
        { texto: 'Proteger um colega', pontos: 2 },
        { texto: 'Conseguir uma vantagem pessoal', pontos: 0 },
        { texto: 'Fechar um negócio para a empresa', pontos: 1 },
        { texto: 'Nunca, independentemente da situação', pontos: 2 }
      ], { 'a': 0, 'b': 2, 'c': 0, 'd': 1, 'e': 2 }),
      // Continue expandindo para 50 (ex.: mais 42 perguntas misturando as dimensões)
    ];
  }

  getPerguntasFixasSync() {
    return [
      new Pergunta(uuidv4(), 'Comprometo-me a responder cada item a seguir estritamente com a verdade.', [
        { texto: 'Sim', pontos: 1 }, { texto: 'Não', pontos: 0 }
      ], { 'sim': 1, 'nao': 0 }),
      new Pergunta(uuidv4(), 'Estou ciente de que esse teste utilizará tecnologia para identificar respostas inconsistentes.', [
        { texto: 'Sim', pontos: 1 }, { texto: 'Não', pontos: 0 }
      ], { 'sim': 1, 'nao': 0 }),
      new Pergunta(uuidv4(), 'Estou ciente de que esse é um teste padronizado, ou seja, que meus resultados serão interpretados com base em curvas estatísticas.', [
        { texto: 'Sim', pontos: 1 }, { texto: 'Não', pontos: 0 }
      ], { 'sim': 1, 'nao': 0 }),
      new Pergunta(uuidv4(), 'Estou ciente de que esse teste se baseia em situações-problema nas quais precisarei aplicar meu melhor julgamento.', [
        { texto: 'Sim', pontos: 1 }, { texto: 'Não', pontos: 0 }
      ], { 'sim': 1, 'nao': 0 }),
      new Pergunta(uuidv4(), 'Estou ciente de que este teste identifica tendências, não ações certas ou erradas.', [
        { texto: 'Sim', pontos: 1 }, { texto: 'Não', pontos: 0 }
      ], { 'sim': 1, 'nao': 0 })
    ];
  }

  async getPerguntasFixas() {
    return this.getPerguntasFixasSync();
  }

  async findAll() {
    return this.perguntas;
  }

  async findRandom(count) {
    const fixas = this.getPerguntasFixasSync();
    const allRandom = this.perguntas.filter(p => !fixas.some(f => f.texto === p.texto));
    const shuffled = allRandom.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

module.exports = InMemoryPerguntaRepository;