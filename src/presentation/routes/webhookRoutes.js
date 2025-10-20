const crypto = require('crypto');
const mercadopago = require('mercadopago');

class WebhookController {
  constructor(comprarCreditosUseCase, logger = console) {
    this.comprarCreditosUseCase = comprarCreditosUseCase;
    this.logger = logger;
    this.webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    
    // Configurar Mercado Pago
    mercadopago.configure({
      access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
  }

  async handleWebhook(req, res) {
    try {
      // Validar assinatura
      if (!this.validarAssinatura(req)) {
        this.logger.warn('Webhook com assinatura inválida', {
          ip: req.ip,
          headers: req.headers,
        });
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      const { type, data, action } = req.body;

      this.logger.info('Webhook recebido', {
        type,
        action,
        dataId: data?.id,
      });

      // Processar apenas notificações de pagamento
      if (type === 'payment') {
        await this.processarPagamento(data.id);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      this.logger.error('Erro ao processar webhook', {
        error: error.message,
        stack: error.stack,
      });
      
      // Retornar 200 para não reenviar o webhook
      return res.status(200).json({ success: false });
    }
  }

  validarAssinatura(req) {
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    
    if (!xSignature || !xRequestId) {
      return false;
    }

    // Extrair ts e hash da assinatura
    const parts = xSignature.split(',');
    let ts, hash;
    
    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        const trimmedKey = key.trim();
        if (trimmedKey === 'ts') ts = value.trim();
        if (trimmedKey === 'v1') hash = value.trim();
      }
    });

    if (!ts || !hash) {
      return false;
    }

    // Verificar se o timestamp não é muito antigo (5 minutos)
    const timestamp = parseInt(ts);
    const now = Date.now();
    if (Math.abs(now - timestamp) > 300000) {
      this.logger.warn('Webhook com timestamp expirado', { ts, now });
      return false;
    }

    // Construir string para validação
    const dataId = req.body?.data?.id || '';
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    
    // Calcular HMAC
    const hmac = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(manifest)
      .digest('hex');

    return hmac === hash;
  }

  async processarPagamento(paymentId) {
    try {
      // Buscar informações do pagamento
      const payment = await mercadopago.payment.get(paymentId);

      this.logger.info('Detalhes do pagamento', {
        id: payment.body.id,
        status: payment.body.status,
        externalReference: payment.body.external_reference,
        transactionAmount: payment.body.transaction_amount,
      });

      // Processar apenas pagamentos aprovados
      if (payment.body.status !== 'approved') {
        this.logger.info('Pagamento não aprovado, ignorando', {
          paymentId,
          status: payment.body.status,
        });
        return;
      }

      // Verificar se já foi processado (idempotência)
      const jaProcessado = await this.verificarSeJaProcessado(paymentId);
      if (jaProcessado) {
        this.logger.info('Pagamento já processado anteriormente', { paymentId });
        return;
      }

      // Extrair informações da external_reference
      const { empresaId, quantidade } = this.parseExternalReference(
        payment.body.external_reference
      );

      // Adicionar créditos
      const resultado = await this.comprarCreditosUseCase.adicionarCreditos(
        empresaId,
        quantidade,
        paymentId,
        payment.body.transaction_amount
      );

      this.logger.info('Créditos adicionados com sucesso', resultado);

      // Marcar como processado
      await this.marcarComoProcessado(paymentId, resultado);

      // Enviar notificação para empresa (email, etc)
      // await this.notificationService.notificarCompraAprovada(resultado);

    } catch (error) {
      this.logger.error('Erro ao processar pagamento', {
        paymentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  parseExternalReference(externalReference) {
    // Formato: EMP-{empresaId}-QTD-{quantidade}-TS-{timestamp}
    const regex = /EMP-([^-]+)-QTD-(\d+)-TS-(\d+)/;
    const match = externalReference.match(regex);

    if (!match) {
      throw new Error(`Formato de external_reference inválido: ${externalReference}`);
    }

    return {
      empresaId: match[1],
      quantidade: parseInt(match[2]),
      timestamp: parseInt(match[3]),
    };
  }

  async verificarSeJaProcessado(paymentId) {
    // Implementar verificação no banco de dados
    // const processado = await ProcessedPaymentRepository.findByPaymentId(paymentId);
    // return !!processado;
    return false; // Placeholder
  }

  async marcarComoProcessado(paymentId, resultado) {
    // Implementar registro no banco de dados
    // await ProcessedPaymentRepository.create({
    //   paymentId,
    //   empresaId: resultado.empresaId,
    //   quantidade: resultado.creditosAdicionados,
    //   processedAt: new Date(),
    // });
    this.logger.info('Pagamento marcado como processado', { paymentId });
  }
}

module.exports = WebhookController;