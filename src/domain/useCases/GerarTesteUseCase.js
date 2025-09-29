const { Teste } = require('../entities/Pergunta');
const { v4: uuidv4 } = require('uuid');

class GerarTesteUseCase {
  constructor(perguntaRepository, candidatoRepository, usuarioRepository) {
    this.perguntaRepository = perguntaRepository;
    this.candidatoRepository = candidatoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async execute(usuarioId, nomeCandidato, emailCandidato, cpfCandidato) {
    const perguntasFixas = await this.perguntaRepository.getPerguntasFixas();
    const perguntasRandomizadas = await this.perguntaRepository.findRandom(25);
    const testeId = uuidv4();
    const teste = new Teste(perguntasFixas, perguntasRandomizadas, usuarioId);

    // Valida e associa o candidato
    const empresa = await this.usuarioRepository.findById(usuarioId);
    if (!empresa || empresa.testesComprados <= 0) {
      throw new Error('Créditos insuficientes');
    }
    await this.usuarioRepository.updateCreditos(usuarioId, -1); // Deduz 1 crédito
    const candidato = await this.candidatoRepository.save({
      nome: nomeCandidato,
      email: emailCandidato,
      cpf: cpfCandidato,
      empresaId: usuarioId,
      testeId,
    });

    return { testeId, teste, candidato };
  }
}

module.exports = GerarTesteUseCase;