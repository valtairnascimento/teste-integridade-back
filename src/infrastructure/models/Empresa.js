const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  creditos: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('Empresa', empresaSchema);