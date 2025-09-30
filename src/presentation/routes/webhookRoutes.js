const express = require('express');
const Empresa = require('../../infrastructure/models/Empresa');
const mercadopago = require('mercadopago');

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const body = req.body.toString();
  const signature = req.headers['x-signature'];
  const topic = req.headers['x-topic'];

  try {
    const data = JSON.parse(body);
    const externalReference = data.external_reference;

    if (topic === 'payment' && data.action === 'payment.updated' && data.data.status === 'approved') {
      const [empresaId, quantidade] = externalReference.split('-');
      const empresa = await Empresa.findById(empresaId);
      if (empresa) {
        empresa.creditos += parseInt(quantidade);
        await empresa.save();
        console.log(`Créditos adicionados para empresa ${empresaId}: +${quantidade}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(400).send('Erro');
  }
});

module.exports = () => {
  return router;
};