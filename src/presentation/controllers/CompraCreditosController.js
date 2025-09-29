const Empresa = require('../../infrastructure/models/Empresa');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY');

class CompraCreditosController {
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
    const paymentIntent = await stripe.paymentIntents.create({
      amount: valor * 100, // Em centavos
      currency: 'brl',
      description: `Compra de ${quantidade} créditos`,
      metadata: { empresaId },
    });

    // Simulação: Aqui você deve confirmar o pagamento via webhook ou frontend
    // Após confirmação, atualize os créditos
    empresa.creditos += quantidade;
    await empresa.save();

    res.json({
      message: `Compra de ${quantidade} créditos realizada com sucesso. Novo saldo: ${empresa.creditos}`,
      clientSecret: paymentIntent.client_secret,
      saldo: empresa.creditos
    });
  }
}

module.exports = CompraCreditosController;