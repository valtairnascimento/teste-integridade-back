const express = require('express');
const CompraCreditosController = require('../controllers/CompraCreditosController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const compraCreditosController = new CompraCreditosController();

module.exports = () => {
  router.post('/comprar-creditos', authMiddleware, compraCreditosController.comprar.bind(compraCreditosController));
  return router;
};