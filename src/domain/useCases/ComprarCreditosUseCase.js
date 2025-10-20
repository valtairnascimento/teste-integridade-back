const { MercadoPagoConfig, Preference } = require('mercadopago');

class ComprarCreditosUseCase {
  constructor(usuarioRepository, config = {}) {
    this.usuarioRepository = usuarioRepository;
    this.precoPorCredito = config.precoPorCredito || parseFloat(process.env.PRECO_POR_CREDITO || '1.0');
    this.quantidadeMinima = config.quantidadeMinima || parseInt(process.env.QUANTIDADE_MINIMA_CREDITOS || '10');
    this.urlSuccess = config.urlSuccess || process.env.URL_PAGAMENTO_SUCESSO;
    this.urlFailure = config.urlFailure || process.env.URL_PAGAMENTO_FALHA;
    this.urlPending = config.urlPending || process.env.URL_PAGAMENTO_PENDENTE;
    
    this.mercadoPagoClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
      options: { timeout: 5000 },
    });
  }

  async execute(empresaId, quantidade) {
    // Validações
    this.validarQuantidade(quantidade);
    const empresa = await this.validarEmpresa(empresaId);
    
    // Cálculo do valor
    const valorTotal = this.calcularValor(quantidade);
    
    // Criar preferência de pagamento
    const preferencia = await this.criarPreferenciaPagamento(empresaId, quantidade, valorTotal);
    
    return {
      preferencia: {
        id: preferencia.id,
        initPoint: preferencia.init_point,
      },
      empresa: {
        id: empresa._id,
        nome: empresa.nome,
        creditosAtuais: empresa.creditos,
      },
      compra: {
        quantidade,
        valorUnitario: this.precoPorCredito,
        valorTotal,
      },
    };
  }

  validarQuantidade(quantidade) {
    if (!quantidade || !Number.isInteger(quantidade)) {
      throw new Error('Quantidade deve ser um número inteiro');
    }
    
    if (quantidade < this.quantidadeMinima) {
      throw new Error(`Quantidade mínima é ${this.quantidadeMinima} créditos`);
    }

    if (quantidade > 10000) { // Limite máximo de segurança
      throw new Error('Quantidade máxima é 10.000 créditos por compra');
    }
  }

  async validarEmpresa(empresaId) {
    const empresa = await this.usuarioRepository.findById(empresaId);
    
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }

    if (empresa.status === 'inativo') {
      throw new Error('Empresa inativa não pode comprar créditos');
    }

    return empresa;
  }

  calcularValor(quantidade) {
    // Pode adicionar descontos por volume aqui
    let valor = quantidade * this.precoPorCredito;
    
    // Exemplo: desconto progressivo
    if (quantidade >= 1000) {
      valor *= 0.9; // 10% de desconto
    } else if (quantidade >= 500) {
      valor *= 0.95; // 5% de desconto
    }
    
    return parseFloat(valor.toFixed(2));
  }

  async criarPreferenciaPagamento(empresaId, quantidade, valorTotal) {
    const preference = new Preference(this.mercadoPagoClient);
    
    const body = {
      items: [
        {
          title: `Pacote de ${quantidade} créditos - Teste Integridade`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: valorTotal,
        },
      ],
      back_urls: {
        success: this.urlSuccess,
        failure: this.urlFailure,
        pending: this.urlPending,
      },
      auto_return: 'approved',
      external_reference: this.gerarExternalReference(empresaId, quantidade),
      metadata: { 
        empresaId: empresaId.toString(),
        quantidade,
        timestamp: new Date().toISOString(),
      },
      notification_url: `${process.env.BASE_URL}/api/webhook/mercadopago`,
      statement_descriptor: 'TESTE_INTEGRIDADE',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: this.calcularDataExpiracao(),
    };

    try {
      return await preference.create({ body });
    } catch (error) {
      throw new Error(`Erro ao criar preferência de pagamento: ${error.message}`);
    }
  }

  gerarExternalReference(empresaId, quantidade) {
    const timestamp = Date.now();
    return `EMP-${empresaId}-QTD-${quantidade}-TS-${timestamp}`;
  }

  calcularDataExpiracao() {
    const expiracao = new Date();
    expiracao.setHours(expiracao.getHours() + 24); // Expira em 24h
    return expiracao.toISOString();
  }

  async adicionarCreditos(empresaId, quantidade, paymentId, transactionAmount) {
    const empresa = await this.usuarioRepository.findById(empresaId);
    
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }

    // Usar transação se disponível
    const session = await this.usuarioRepository.startSession?.();
    
    try {
      if (session) await session.startTransaction();

      const novoSaldo = empresa.creditos + quantidade;
      await this.usuarioRepository.updateCreditos(empresaId, quantidade, {
        session,
        paymentId,
        transactionAmount,
      });

      // Registrar histórico (se houver repository para isso)
      // await this.historicoRepository.create({ ... });

      if (session) await session.commitTransaction();

      return {
        empresaId,
        creditosAnteriores: empresa.creditos,
        creditosAdicionados: quantidade,
        creditosAtuais: novoSaldo,
        paymentId,
      };
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }
}

module.exports = ComprarCreditosUseCase;