class ObterHistoricoPagamentosUseCase {
  constructor(pagamentoRepository) {
    this.pagamentoRepository = pagamentoRepository;
  }

  async execute(empresaId, filtros = {}) {
    const pagamentos = await this.pagamentoRepository.findByEmpresaId(
      empresaId,
      {
        status: filtros.status,
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        limit: filtros.limit || 50,
      }
    );

    const historicoFormatado = pagamentos.map((pag) => ({
      id: pag._id,
      paymentId: pag.paymentId,
      data: pag.createdAt,
      quantidade: pag.quantidade,
      valorTotal: pag.valorTotal,
      valorUnitario: pag.valorUnitario,
      status: pag.status,
      metodoPagamento: pag.metodoPagamento,
      processado: pag.processado,
    }));

    // Calcular estatísticas
    const stats = await this.pagamentoRepository.getEstatisticas(
      empresaId,
      filtros.dataInicio,
      filtros.dataFim
    );

    return {
      historico: historicoFormatado,
      estatisticas: stats,
      total: pagamentos.length,
    };
  }
}

module.exports = {
  ObterHistoricoPagamentosUseCase,
};
