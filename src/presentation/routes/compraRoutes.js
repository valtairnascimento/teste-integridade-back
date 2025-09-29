const express = require('express');
const CompraCreditosController = require('../controllers/CompraCreditosController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

module.exports = (compraCreditosController = new CompraCreditosController()) => {
  router.post('/comprar-creditos', [authMiddleware], compraCreditosController.comprar.bind(compraCreditosController));
  return router;
};