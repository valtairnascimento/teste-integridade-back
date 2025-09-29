const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  empresaNome: { type: String, required: true },
  role: { type: String, default: 'empresa' },
  testesComprados: { type: Number, default: 0 },
});

module.exports = mongoose.model('Usuario', usuarioSchema);