const Empresa = require('../../infrastructure/models/Empresa');

/**
 * Middleware para verificar e deduzir créditos antes de executar uma ação
 * @param {number} custoEmCreditos - Quantidade de créditos necessários (padrão: 1)
 */
const verificarCreditos = (custoEmCreditos = 1) => {
  return async (req, res, next) => {
    const empresaId = req.user.id;
    const session = await Empresa.startSession();
    
    try {
      await session.startTransaction();

      // Buscar empresa com lock pessimista para evitar race conditions
      const empresa = await Empresa.findById(empresaId).session(session);

      if (!empresa) {
        await session.abortTransaction();
        return res.status(404).json({ 
          success: false,
          error: 'Empresa não encontrada' 
        });
      }

      if (empresa.status === 'inativo') {
        await session.abortTransaction();
        return res.status(403).json({ 
          success: false,
          error: 'Empresa inativa' 
        });
      }

      // Verificar saldo
      if (empresa.creditos < custoEmCreditos) {
        await session.abortTransaction();
        return res.status(402).json({ 
          success: false,
          error: 'Créditos insuficientes',
          creditosDisponiveis: empresa.creditos,
          creditosNecessarios: custoEmCreditos,
          message: `Você precisa de ${custoEmCreditos} crédito(s), mas possui apenas ${empresa.creditos}. Compre mais créditos para continuar.`
        });
      }

      // Deduzir créditos
      empresa.creditos -= custoEmCreditos;
      
      // Registrar uso no histórico
      if (!empresa.historicoCreditos) {
        empresa.historicoCreditos = [];
      }
      
      empresa.historicoCreditos.push({
        tipo: 'uso',
        quantidade: -custoEmCreditos,
        saldoAnterior: empresa.creditos + custoEmCreditos,
        saldoAtual: empresa.creditos,
        acao: req.path,
        data: new Date(),
        metadata: {
          ip: req.ip,
          userAgent: req.get('user-agent'),
        }
      });

      await empresa.save({ session });
      await session.commitTransaction();

      req.empresa = {
        id: empresa._id,
        nome: empresa.nome,
        creditosRestantes: empresa.creditos,
        creditosUsados: custoEmCreditos,
      };

      console.log(`[CREDITOS] Empresa ${empresaId} usou ${custoEmCreditos} crédito(s). Saldo: ${empresa.creditos}`);

      next();
    } catch (error) {
      await session.abortTransaction();
      console.error('Erro ao verificar créditos:', error);
      
      return res.status(500).json({ 
        success: false,
        error: 'Erro ao processar créditos',
        message: 'Ocorreu um erro ao verificar seus créditos. Tente novamente.'
      });
    } finally {
      session.endSession();
    }
  };
};


const apenasVerificarCreditos = (minimoNecessario = 1) => {
  return async (req, res, next) => {
    const empresaId = req.user.id;

    try {
      const empresa = await Empresa.findById(empresaId).select('creditos status nome');

      if (!empresa) {
        return res.status(404).json({ 
          success: false,
          error: 'Empresa não encontrada' 
        });
      }

      if (empresa.status === 'inativo') {
        return res.status(403).json({ 
          success: false,
          error: 'Empresa inativa' 
        });
      }

      req.empresa = {
        id: empresa._id,
        nome: empresa.nome,
        creditosDisponiveis: empresa.creditos,
        temCreditosSuficientes: empresa.creditos >= minimoNecessario,
      };

      next();
    } catch (error) {
      console.error('Erro ao verificar créditos:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erro ao verificar créditos' 
      });
    }
  };
};

module.exports = {
  verificarCreditos,
  apenasVerificarCreditos,
};