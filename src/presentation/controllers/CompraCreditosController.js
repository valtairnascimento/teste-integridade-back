const { MercadoPagoConfig, Preference } = require('mercadopago');
const Empresa = require('../../infrastructure/models/Empresa');

class CompraCreditosController {
  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
      options: { timeout: 5000 },
    });
  }

  async comprar(req, res) {
    const { quantidade } = req.body;
    const empresaId = req.user.id;

    if (!quantidade || quantidade < 10 || !Number.isInteger(quantidade)) {
      return res.status(400).json({ error: 'Quantidade inválida. Mínimo de 10 créditos.' });
    }

    const empresa = await Empresa.findById(empresaId);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const valor = quantidade * 1; // Ex.: R$ 1 por crédito
    const preference = new Preference(this.client);

    try {
      const body = {
        items: [
          {
            title: `Pacote de ${quantidade} créditos`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: valor,
          },
        ],
        back_urls: {
          success: 'https://seu-site.com/sucesso', // Redireciona após pagamento aprovado
          failure: 'https://seu-site.com/falha',
          pending: 'https://seu-site.com/pendente',
        },
        auto_return: 'approved', // Redireciona automaticamente após aprovação
        external_reference: `${empresaId}-${quantidade}`, // Para rastrear no webhook
        metadata: { empresaId },
      };

      const preferenceResponse = await preference.create({ body });
      res.json({
        message: 'Preference criada com sucesso',
        init_point: preferenceResponse.init_point, // Link para o checkout do Mercado Pago
        id: preferenceResponse.id, // ID da preferência para rastrear
        saldoAtual: empresa.creditos,
      });
    } catch (error) {
      console.error('Erro ao criar preferência Mercado Pago:', error);
      res.status(500).json({ error: 'Erro ao processar compra', details: error.message });
    }
  }
}

module.exports = CompraCreditosController;