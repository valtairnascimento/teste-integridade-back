class ComprarCreditosUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute(empresaId, quantidade) {
    if (quantidade <= 0) {
      throw new Error('Quantidade de créditos deve ser maior que zero');
    }
    const usuario = await this.usuarioRepository.findById(empresaId);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return await this.usuarioRepository.updateCreditos(empresaId, quantidade); // Adiciona créditos
  }
}

module.exports = ComprarCreditosUseCase;