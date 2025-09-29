class VisualizarResultadosUseCase {
  constructor(respostaRepository) {
    this.respostaRepository = respostaRepository;
  }

  async execute(empresaId) {
    const resultados = await this.respostaRepository.findByEmpresaId(empresaId);
    return resultados.map(resultado => ({
      candidato: {
        nome: resultado.candidatoId.nome,
        email: resultado.candidatoId.email,
        cpf: resultado.candidatoId.cpf,
      },
      testeId: resultado.testeId._id,
      pontuacaoTotal: resultado.pontuacaoTotal,
      nivel: resultado.nivel,
      detalhes: resultado.detalhes,
      dataResposta: resultado.dataResposta,
    }));
  }
}

module.exports = VisualizarResultadosUseCase;