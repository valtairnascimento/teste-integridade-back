class PagamentoRepository {
  async save(pagamentoData) {
    const pagamento = new Pagamento(pagamentoData);
    return await pagamento.save();
  }

  async findByPaymentId(paymentId) {
    return await Pagamento.findOne({ paymentId });
  }

  async findByExternalReference(externalReference) {
    return await Pagamento.findOne({ externalReference });
  }

  async findByEmpresaId(empresaId, options = {}) {
    const query = Pagamento.find({ empresaId });

    if (options.status) {
      query.where('status').equals(options.status);
    }

    query.sort({ createdAt: -1 });

    if (options.limit) {
      query.limit(options.limit);
    }

    return await query.exec();
  }

  async marcarComoProcessado(paymentId, dataProcessamento = new Date()) {
    return await Pagamento.findOneAndUpdate(
      { paymentId },
      { 
        processado: true,
        dataProcessamento
      },
      { new: true }
    );
  }

  async updateStatus(paymentId, novoStatus) {
    return await Pagamento.findOneAndUpdate(
      { paymentId },
      { status: novoStatus },
      { new: true }
    );
  }

  /**
   * Verifica se um pagamento já foi processado
   */
  async jaFoiProcessado(paymentId) {
    const pagamento = await Pagamento.findOne({ paymentId });
    return pagamento?.processado || false;
  }

  /**
   * Estatísticas de pagamentos
   */
  async getEstatisticas(empresaId, dataInicio, dataFim) {
    const match = { empresaId };
    
    if (dataInicio && dataFim) {
      match.createdAt = { $gte: dataInicio, $lte: dataFim };
    }

    const stats = await Pagamento.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          quantidade: { $sum: 1 },
          valorTotal: { $sum: '$valorTotal' },
          creditosTotal: { $sum: '$quantidade' }
        }
      }
    ]);

    return {
      porStatus: stats.reduce((acc, item) => {
        acc[item._id] = {
          quantidade: item.quantidade,
          valorTotal: item.valorTotal,
          creditosTotal: item.creditosTotal
        };
        return acc;
      }, {}),
      periodo: { dataInicio, dataFim }
    };
  }
}

module.exports = {
    PagamentoRepository
}