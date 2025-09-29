const express = require('express');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const empresaId = paymentIntent.metadata.empresaId;
    const empresa = await Empresa.findById(empresaId);
    if (empresa) {
      empresa.creditos += parseInt(paymentIntent.amount) / 100; // Ajuste conforme quantidade
      await empresa.save();
    }
  }

  res.json({ received: true });
});

module.exports = router;