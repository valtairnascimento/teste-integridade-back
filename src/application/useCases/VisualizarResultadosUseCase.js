class VisualizarResultadosUseCase {
  constructor(respostaRepository, candidatoRepository) {
    this.respostaRepository = respostaRepository;
    this.candidatoRepository = candidatoRepository;
  }

  async execute(empresaId, filtros = {}) {
    if (!empresaId) {
      throw new Error('ID da empresa é obrigatório');
    }

    const options = {
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
      nivel: filtros.nivel,
      limit: filtros.limit || 100
    };

    const respostas = await this.respostaRepository.findByEmpresaId(empresaId, options);

    // Formatar resultados
    const resultados = respostas.map(resposta => ({
      id: resposta._id,
      candidato: {
        nome: resposta.candidatoId?.nome || 'N/A',
        email: resposta.candidatoId?.email || 'N/A',
        cpf: resposta.candidatoId?.cpf 
          ? CPFValidator.formatar(resposta.candidatoId.cpf) 
          : 'N/A',
        status: resposta.candidatoId?.status || 'N/A'
      },
      testeId: resposta.testeId,
      pontuacaoTotal: resposta.pontuacaoTotal,
      nivel: resposta.nivel,
      detalhes: {
        afetivo: resposta.detalhes.afetivo,
        normativo: resposta.detalhes.normativo,
        continuativo: resposta.detalhes.continuativo,
        inconsistencias: resposta.detalhes.inconsistencias
      },
      percentis: resposta.detalhesPercentis,
      recomendacoes: resposta.recomendacoes || [],
      dataResposta: resposta.createdAt,
      tempoResposta: resposta.metadata?.tempoResposta || null
    }));

    // Buscar estatísticas
    const estatisticas = await this.respostaRepository.getEstatisticas(
      empresaId,
      options.dataInicio,
      options.dataFim
    );

    const estatisticasCandidatos = await this.candidatoRepository.getEstatisticas(empresaId);

    return {
      resultados,
      estatisticas: {
        ...estatisticas,
        candidatos: estatisticasCandidatos
      },
      total: resultados.length
    };
  }

  async executeUnico(testeId, empresaId) {
    if (!testeId || !empresaId) {
      throw new Error('testeId e empresaId são obrigatórios');
    }

    const resposta = await this.respostaRepository.findByTesteId(testeId);

    if (!resposta) {
      throw new Error('Resultado não encontrado');
    }

    // Verificar se pertence à empresa
    if (resposta.empresaId.toString() !== empresaId.toString()) {
      throw new Error('Acesso negado');
    }

    return {
      id: resposta._id,
      candidato: {
        nome: resposta.candidatoId?.nome || 'N/A',
        email: resposta.candidatoId?.email || 'N/A',
        cpf: resposta.candidatoId?.cpf 
          ? CPFValidator.formatar(resposta.candidatoId.cpf) 
          : 'N/A'
      },
      testeId: resposta.testeId,
      pontuacaoTotal: resposta.pontuacaoTotal,
      nivel: resposta.nivel,
      detalhes: resposta.detalhes,
      percentis: resposta.detalhesPercentis,
      inconsistencias: resposta.inconsistenciasDetalhadas,
      recomendacoes: resposta.recomendacoes || [],
      respostas: resposta.respostas,
      dataResposta: resposta.createdAt,
      metadata: resposta.metadata
    };
  }
}

module.exports = VisualizarResultadosUseCase;