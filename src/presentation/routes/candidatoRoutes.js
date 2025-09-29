const express = require('express');
const CandidatoController = require('../controllers/CandidatoController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

module.exports = (cadastrarCandidatoUseCase) => {
  const candidatoController = new CandidatoController(cadastrarCandidatoUseCase);
  router.post('/candidatos', authMiddleware, candidatoController.cadastrar.bind(candidatoController));
  return router;
};