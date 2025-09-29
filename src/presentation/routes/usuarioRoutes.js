const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');

const router = express.Router();

module.exports = (registrarUsuarioUseCase) => {
  const usuarioController = new UsuarioController(registrarUsuarioUseCase);
  router.post('/register', usuarioController.registrar.bind(usuarioController));
  return router;
};