class AtualizarConfiguracoesUseCase {
  constructor(empresaRepository) {
    this.empresaRepository = empresaRepository;
  }

  async execute(empresaId, configuracoes) {
    const empresa = await this.empresaRepository.findById(empresaId);

    if (!empresa) {
      throw new Error("Empresa não encontrada");
    }

    const configuracoesAtualizadas = {
      ...empresa.configuracoes,
      ...configuracoes,
    };

    await this.empresaRepository.update(empresaId, {
      configuracoes: configuracoesAtualizadas,
    });

    return {
      sucesso: true,
      configuracoes: configuracoesAtualizadas,
    };
  }
}

module.exports = {
  AtualizarConfiguracoesUseCase,
};
