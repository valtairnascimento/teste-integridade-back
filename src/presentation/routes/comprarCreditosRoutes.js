const express = require('express');
const CompraCreditosController = require('../controllers/CompraCreditosController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

module.exports = (comprarCreditosUseCase) => {
  const comprarCreditosController = new CompraCreditosController(comprarCreditosUseCase);
  router.post('/comprar-creditos', authMiddleware, comprarCreditosController.comprar.bind(comprarCreditosController));
  return router;
};