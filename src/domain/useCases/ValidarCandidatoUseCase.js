const jwt = require('jsonwebtoken');

class ValidarCandidatoUseCase {
  constructor(candidatoRepository) {
    this.candidatoRepository = candidatoRepository;
  }

  async execute(email, cpf, empresaId = null) {
    const candidato = await this.candidatoRepository.findByEmailAndCpf(email, cpf, empresaId);
    if (!candidato) {
      throw new Error('Candidato não encontrado ou dados inválidos');
    }

    // Gera um token temporário para o candidato (válido por 1 hora)
    const token = jwt.sign({ testeId: candidato.testeId, email: candidato.email, empresaId: candidato.empresaId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token, testeId: candidato.testeId };
  }
}

module.exports = ValidarCandidatoUseCase;