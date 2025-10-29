class AtivarDemonstracaoUseCase {
  constructor(empresaRepository, emailService) {
    this.empresaRepository = empresaRepository;
    this.emailService = emailService;
  }

  async execute(empresaId) {
    const empresa = await this.empresaRepository.findById(empresaId);

    if (!empresa) {
      throw new Error("Empresa não encontrada");
    }

    // Verificar se já ativou demonstração
    if (empresa.demonstracaoAtivada) {
      throw new Error("Demonstração já foi ativada anteriormente");
    }

    const CREDITOS_DEMONSTRACAO = 10;

    // Adicionar créditos de demonstração
    await this.empresaRepository.updateCreditos(
      empresaId,
      CREDITOS_DEMONSTRACAO,
      {
        tipo: "bonus",
        acao: "demonstracao_gratuita",
        descricao: "Créditos de demonstração gratuita",
      }
    );

    // Marcar demonstração como ativada
    await this.empresaRepository.update(empresaId, {
      demonstracaoAtivada: true,
      dataDemonstracao: new Date(),
    });

    // Enviar email de boas-vindas
    if (this.emailService) {
      await this.emailService.enviarBoasVindasDemonstracao({
        nome: empresa.nome,
        email: empresa.email,
        creditosConcedidos: CREDITOS_DEMONSTRACAO,
      });
    }

    return {
      sucesso: true,
      creditosConcedidos: CREDITOS_DEMONSTRACAO,
      creditosTotais: empresa.creditos + CREDITOS_DEMONSTRACAO,
      mensagem: `${CREDITOS_DEMONSTRACAO} créditos de demonstração adicionados com sucesso!`,
    };
  }
}

module.exports = {
  AtivarDemonstracaoUseCase,
};
