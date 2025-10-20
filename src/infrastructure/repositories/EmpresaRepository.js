
const { Empresa, Candidato, Resposta, Pagamento } = require('../models');
const mongoose = require('mongoose');

// ============= EMPRESA REPOSITORY =============
class EmpresaRepository {
  async findByEmail(email) {
    return await Empresa.findOne({ email }).select('+senha');
  }

  async findById(id) {
    return await Empresa.findById(id);
  }

  async save(empresaData) {
    const empresa = new Empresa(empresaData);
    return await empresa.save();
  }

  async update(id, updateData) {
    return await Empresa.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Atualiza créditos com suporte a transações e histórico
   */
  async updateCreditos(empresaId, quantidade, options = {}) {
    const session = options.session || await mongoose.startSession();
    const shouldCommit = !options.session; // Se não passou session, commit aqui

    try {
      if (shouldCommit) await session.startTransaction();

      const empresa = await Empresa.findById(empresaId).session(session);
      
      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }

      // Validar se tem créditos suficientes para dedução
      if (quantidade < 0 && empresa.creditos + quantidade < 0) {
        throw new Error('Créditos insuficientes');
      }

      const saldoAnterior = empresa.creditos;
      empresa.creditos += quantidade;

      // Adicionar ao histórico
      empresa.historicoCreditos.push({
        tipo: options.tipo || (quantidade > 0 ? 'compra' : 'uso'),
        quantidade,
        saldoAnterior,
        saldoAtual: empresa.creditos,
        acao: options.acao || '',
        paymentId: options.paymentId || null,
        descricao: options.descricao || '',
        metadata: {
          ip: options.ip,
          userAgent: options.userAgent
        },
        data: new Date()
      });

      await empresa.save({ session });

      if (shouldCommit) await session.commitTransaction();

      return empresa;
    } catch (error) {
      if (shouldCommit) await session.abortTransaction();
      throw error;
    } finally {
      if (shouldCommit) session.endSession();
    }
  }

  async startSession() {
    return await mongoose.startSession();
  }

  /**
   * Busca empresas com créditos baixos
   */
  async findComCreditosBaixos() {
    return await Empresa.find({
      status: 'ativo',
      'configuracoes.notificacoesCreditosBaixos': true,
      $expr: { $lt: ['$creditos', '$configuracoes.limiteAlertaCreditos'] }
    });
  }

  /**
   * Estatísticas de uso de créditos
   */
  async getEstatisticasCreditos(empresaId, dataInicio, dataFim) {
    const empresa = await Empresa.findById(empresaId);
    
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }

    const historico = empresa.historicoCreditos.filter(h => 
      h.data >= dataInicio && h.data <= dataFim
    );

    const totalComprado = historico
      .filter(h => h.tipo === 'compra')
      .reduce((sum, h) => sum + h.quantidade, 0);

    const totalUsado = Math.abs(historico
      .filter(h => h.tipo === 'uso')
      .reduce((sum, h) => sum + h.quantidade, 0));

    return {
      creditosAtuais: empresa.creditos,
      totalComprado,
      totalUsado,
      periodo: { dataInicio, dataFim },
      historico
    };
  }
}