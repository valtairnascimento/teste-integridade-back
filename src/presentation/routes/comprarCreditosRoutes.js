const express = require('express');
const ComprarCreditosController = require('../controllers/ComprarCreditosController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

module.exports = (comprarCreditosUseCase) => {
  const comprarCreditosController = new ComprarCreditosController(comprarCreditosUseCase);
  router.post('/comprar-creditos', authMiddleware, comprarCreditosController.comprar.bind(comprarCreditosController));
  return router;
};