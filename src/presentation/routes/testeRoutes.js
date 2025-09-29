const express = require('express');
const TesteController = require('../controllers/TesteController');
const authMiddleware = require('../middlewares/auth');
const verificarCreditos = require('../middlewares/verificarCreditos'); // Adicione esta importação

const router = express.Router();

module.exports = (gerarTesteUseCase, calcularComprometimentoUseCase) => {
  const testeController = new TesteController(gerarTesteUseCase, calcularComprometimentoUseCase);
  router.post('/testes', [authMiddleware, verificarCreditos], testeController.gerarTeste.bind(testeController));
  router.post('/respostas', authMiddleware, testeController.calcularComprometimento.bind(testeController));
  return router;
};