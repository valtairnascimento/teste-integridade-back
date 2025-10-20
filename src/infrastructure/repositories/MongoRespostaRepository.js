const Resposta = require('../models/Resposta');

class RespostaRepository {
  async save(respostaData) {
    const resposta = new Resposta(respostaData);
    return await resposta.save();
  }

  async findByTesteId(testeId) {
    return await Resposta.findOne({ testeId })
      .populate('candidatoId')
      .exec();
  }

  async findByEmpresaId(empresaId, options = {}) {
    const query = Resposta.find({ empresaId });

    if (options.dataInicio && options.dataFim) {
      query.where('createdAt').gte(options.dataInicio).lte(options.dataFim);
    }

    if (options.nivel) {
      query.where('nivel').equals(options.nivel);
    }

    query.populate('candidatoId');
    query.sort({ createdAt: -1 });

    if (options.limit) {
      query.limit(options.limit);
    }

    return await query.exec();
  }

  async findByCandidatoId(candidatoId) {
    return await Resposta.findOne({ candidatoId });
  }

  /**
   * Estatísticas de respostas por empresa
   */
  async getEstatisticas(empresaId, dataInicio, dataFim) {
    const match = { empresaId };
    
    if (dataInicio && dataFim) {
      match.createdAt = { $gte: dataInicio, $lte: dataFim };
    }

    const stats = await Resposta.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          mediaPontuacao: { $avg: '$pontuacaoTotal' },
          mediaAfetivo: { $avg: '$detalhes.afetivo' },
          mediaNormativo: { $avg: '$detalhes.normativo' },
          mediaContinuativo: { $avg: '$detalhes.continuativo' },
          mediaInconsistencias: { $avg: '$detalhes.inconsistencias' }
        }
      }
    ]);

    const distribuicaoNiveis = await Resposta.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$nivel',
          quantidade: { $sum: 1 }
        }
      }
    ]);

    return {
      total: stats[0]?.total || 0,
      medias: {
        pontuacaoTotal: stats[0]?.mediaPontuacao?.toFixed(2) || 0,
        afetivo: stats[0]?.mediaAfetivo?.toFixed(2) || 0,
        normativo: stats[0]?.mediaNormativo?.toFixed(2) || 0,
        continuativo: stats[0]?.mediaContinuativo?.toFixed(2) || 0,
        inconsistencias: stats[0]?.mediaInconsistencias?.toFixed(2) || 0
      },
      distribuicaoNiveis: distribuicaoNiveis.reduce((acc, item) => {
        acc[item._id] = item.quantidade;
        return acc;
      }, {})
    };
  }
}

module.exports = RespostaRepository;