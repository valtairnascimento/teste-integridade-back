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

    const empresa = await this.usuarioRepository.findById(usuarioId);
    if (!empresa || empresa.testesComprados <= 0) {
      throw new Error('Créditos insuficientes');
    }
    await this.usuarioRepository.updateCreditos(empresa._id, -1); 

    const candidato = await this.candidatoRepository.save({
      nome: nomeCandidato,
      email: emailCandidato,
      cpf: cpfCandidato,
      empresaId: empresa._id, 
      testeId,
    });

    return { testeId, teste, candidato };
  }
}

module.exports = GerarTesteUseCase;