const Candidato = require('../models/Candidato');

class CandidatoRepository {
  async save(candidatoData) {
    const candidato = new Candidato(candidatoData);
    return await candidato.save();
  }

  async findByEmailAndCpf(email, cpf, empresaId = null) {
    const query = { email };
    
    if (cpf) {
      query.cpf = cpf.replace(/\D/g, ''); // Remove formatação
    }
    
    if (empresaId) {
      query.empresaId = empresaId;
    }

    return await Candidato.findOne(query);
  }

  async findById(id) {
    return await Candidato.findById(id);
  }

  async findByTesteId(testeId) {
    return await Candidato.findOne({ testeId });
  }

  async findByEmpresaId(empresaId, options = {}) {
    const query = Candidato.find({ empresaId });

    if (options.status) {
      query.where('status').equals(options.status);
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.sort) {
      query.sort(options.sort);
    }

    return await query.exec();
  }

  async updateStatus(candidatoId, novoStatus) {
    return await Candidato.findByIdAndUpdate(
      candidatoId,
      { 
        status: novoStatus,
        ultimoAcesso: new Date()
      },
      { new: true }
    );
  }

  async incrementarTentativasAcesso(candidatoId) {
    return await Candidato.findByIdAndUpdate(
      candidatoId,
      { 
        $inc: { tentativasAcesso: 1 },
        ultimoAcesso: new Date()
      },
      { new: true }
    );
  }

  /**
   * Busca candidatos expirados para limpeza/notificação
   */
  async findExpirados() {
    return await Candidato.find({
      dataExpiracao: { $lt: new Date() },
      status: { $ne: 'concluido' }
    });
  }

  /**
   * Estatísticas de candidatos por empresa
   */
  async getEstatisticas(empresaId) {
    const total = await Candidato.countDocuments({ empresaId });
    const concluidos = await Candidato.countDocuments({ empresaId, status: 'concluido' });
    const pendentes = await Candidato.countDocuments({ empresaId, status: 'pendente' });
    const expirados = await Candidato.countDocuments({ 
      empresaId,
      dataExpiracao: { $lt: new Date() },
      status: { $ne: 'concluido' }
    });

    return {
      total,
      concluidos,
      pendentes,
      expirados,
      taxaConclusao: total > 0 ? ((concluidos / total) * 100).toFixed(2) : 0
    };
  }
}

module.exports = CandidatoRepository;