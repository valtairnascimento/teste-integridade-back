const Candidato = require('../entities/Candidato');

class CadastrarCandidatoUseCase {
  constructor(candidatoRepository, usuarioRepository) {
    this.candidatoRepository = candidatoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async execute(empresaId, nome, email, cpf, testeId) {
    const empresa = await this.usuarioRepository.findById(empresaId); // Assumindo método findById adicionado
    if (!empresa || empresa.testesComprados <= 0) throw new Error('Créditos insuficientes');
    await this.usuarioRepository.updateCreditos(empresaId, -1); // Deduz 1 crédito

    const candidato = new Candidato(null, nome, email, cpf, empresaId, testeId);
    return await this.candidatoRepository.save(candidato);
  }
}

module.exports = CadastrarCandidatoUseCase;