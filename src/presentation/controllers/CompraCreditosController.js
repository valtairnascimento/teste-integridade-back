const { MercadoPagoConfig, Preference } = require('mercadopago');
const Empresa = require('../../infrastructure/models/Empresa');

class CompraCreditosController {
  constructor(comprarCreditosUseCase, logger = console) {
    this.comprarCreditosUseCase = comprarCreditosUseCase;
    this.logger = logger;
  }

  async comprar(req, res) {
    const startTime = Date.now();
    const { quantidade } = req.body;
    const empresaId = req.user.id;

    // Log da requisição
    this.logger.info('Iniciando compra de créditos', {
      empresaId,
      quantidade,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    try {
      const resultado = await this.comprarCreditosUseCase.execute(empresaId, quantidade);

      this.logger.info('Compra de créditos processada com sucesso', {
        empresaId,
        quantidade,
        preferenciaId: resultado.preferencia.id,
        duracao: Date.now() - startTime,
      });

      return res.status(200).json({
        success: true,
        message: 'Preferência de pagamento criada com sucesso',
        data: resultado,
      });
    } catch (error) {
      return this.handleError(error, res, { empresaId, quantidade, duracao: Date.now() - startTime });
    }
  }

  handleError(error, res, context) {
    this.logger.error('Erro ao processar compra de créditos', {
      ...context,
      error: error.message,
      stack: error.stack,
    });

    // Erros de validação
    if (error.message.includes('Quantidade') || 
        error.message.includes('número inteiro') ||
        error.message.includes('mínima') ||
        error.message.includes('máxima')) {
      return res.status(400).json({
        success: false,
        error: 'Validação falhou',
        message: error.message,
      });
    }

    // Empresa não encontrada ou inativa
    if (error.message.includes('não encontrada') || 
        error.message.includes('inativa')) {
      return res.status(404).json({
        success: false,
        error: 'Empresa não encontrada ou inativa',
        message: error.message,
      });
    }

    // Erro do Mercado Pago
    if (error.message.includes('preferência de pagamento')) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de pagamento temporariamente indisponível',
        message: 'Por favor, tente novamente em alguns instantes',
      });
    }

    // Erro genérico
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível processar a compra. Tente novamente mais tarde.',
    });
  }
}

module.exports = CompraCreditosController;