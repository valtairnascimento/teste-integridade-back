const { Teste } = require('../entities/Pergunta');
const { v4: uuidv4 } = require('uuid');

class GerarTesteUseCase {
  constructor(perguntaRepository) {
    this.perguntaRepository = perguntaRepository;
  }

  async execute(usuarioId) {
    const perguntasFixas = await this.perguntaRepository.getPerguntasFixas();
    const perguntasRandomizadas = await this.perguntaRepository.findRandom(25);
    const testeId = uuidv4(); // Gera um ID único para o teste
    return { testeId, teste: new Teste(perguntasFixas, perguntasRandomizadas, usuarioId) };
  }
}

module.exports = GerarTesteUseCase;