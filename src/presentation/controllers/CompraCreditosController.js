const Empresa = require('../../infrastructure/models/Empresa');

class CompraCreditosController {
  async comprar(req, res) {
    const { quantidade } = req.body; // Ex.: { quantidade: 50 }
    const empresaId = req.user.id;

    if (!quantidade || quantidade < 10 || !Number.isInteger(quantidade)) {
      return res.status(400).json({ error: 'Quantidade inválida. Mínimo de 10 créditos.' });
    }

    const empresa = await Empresa.findById(empresaId);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Simulação de pagamento (integre com Stripe/PayPal aqui)
    // Exemplo: Após confirmação de pagamento
    empresa.creditos += quantidade;
    await empresa.save();

    res.json({
      message: `Compra de ${quantidade} créditos realizada com sucesso. Novo saldo: ${empresa.creditos}`,
      saldo: empresa.creditos
    });
  }
}

module.exports = CompraCreditosController;