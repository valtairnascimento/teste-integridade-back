const jwt = require('jsonwebtoken');

class ValidarCandidatoUseCase {
  constructor(candidatoRepository) {
    this.candidatoRepository = candidatoRepository;
  }

  async execute(email, cpf, empresaId = null) {
    if (!email || !cpf) {
      throw new Error('Email e CPF são obrigatórios');
    }

    // Validar CPF
    const cpfLimpo = CPFValidator.validarOuLancarErro(cpf);

    // Buscar candidato
    const candidato = await this.candidatoRepository.findByEmailAndCpf(
      email.toLowerCase(),
      cpfLimpo,
      empresaId
    );

    if (!candidato) {
      throw new Error('Candidato não encontrado. Verifique email e CPF.');
    }

    // Verificar se está expirado
    if (candidato.estaExpirado() && candidato.status !== 'concluido') {
      throw new Error('Teste expirado. Entre em contato com a empresa.');
    }

    // Verificar se já concluiu
    if (candidato.status === 'concluido') {
      throw new Error('Teste já foi concluído anteriormente.');
    }

    // Atualizar status e incrementar tentativas
    await this.candidatoRepository.updateStatus(candidato._id, 'em_andamento');
    await this.candidatoRepository.incrementarTentativasAcesso(candidato._id);

    // Gerar token
    const token = jwt.sign(
      {
        testeId: candidato.testeId,
        email: candidato.email,
        empresaId: candidato.empresaId,
        candidatoId: candidato._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      testeId: candidato.testeId,
      candidato: {
        nome: candidato.nome,
        email: candidato.email,
        status: candidato.status
      }
    };
  }
}

module.exports = ValidarCandidatoUseCase;