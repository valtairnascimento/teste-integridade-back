const Candidato = require('../entities/Candidato');

class CadastrarCandidatoUseCase {
  constructor(candidatoRepository, usuarioRepository) {
    this.candidatoRepository = candidatoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async execute(empresaId, nome, email, cpf, testeId) {
    const empresa = await this.usuarioRepository.findById(empresaId);
    if (!empresa || empresa.testesComprados <= 0) throw new Error('Créditos insuficientes');
    await this.usuarioRepository.updateCreditos(empresa._id, -1);

    const candidato = new Candidato(null, nome, email, cpf, empresa._id, testeId);
    return await this.candidatoRepository.save(candidato);
  }
}

module.exports = CadastrarCandidatoUseCase;