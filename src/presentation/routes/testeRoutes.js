const express = require('express');
const TesteController = require('../controllers/TesteController');

const router = express.Router();

module.exports = (gerarTesteUseCase, calcularComprometimentoUseCase) => {
  const testeController = new TesteController(gerarTesteUseCase, calcularComprometimentoUseCase);
  router.post('/testes', testeController.gerarTeste.bind(testeController));
  router.post('/respostas', testeController.calcularComprometimento.bind(testeController));
  return router;
};