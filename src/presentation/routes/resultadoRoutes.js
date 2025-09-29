const express = require('express');
const ResultadoController = require('../controllers/ResultadoController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

module.exports = (visualizarResultadosUseCase) => {
  const resultadoController = new ResultadoController(visualizarResultadosUseCase);
  router.get('/resultados', authMiddleware, resultadoController.visualizar.bind(resultadoController));
  return router;
};