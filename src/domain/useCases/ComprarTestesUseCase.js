class ComprarTestesUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute(usuarioId, quantidade) {
    if (quantidade <= 0) throw new Error('Quantidade inválida');
    return await this.usuarioRepository.updateCreditos(usuarioId, quantidade);
  }
}

module.exports = ComprarTestesUseCase;