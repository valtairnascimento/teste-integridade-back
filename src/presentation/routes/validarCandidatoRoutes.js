const express = require('express');
const ValidarCandidatoController = require('../controllers/ValidarCandidatoController');

const router = express.Router();

module.exports = (validarCandidatoUseCase) => {
  const validarCandidatoController = new ValidarCandidatoController(validarCandidatoUseCase);
  router.post('/validar-candidato', validarCandidatoController.validar.bind(validarCandidatoController));
  return router;
};