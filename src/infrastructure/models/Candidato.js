const mongoose = require('mongoose');

const candidatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  cpf: { type: String, required: true },
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  testeId: { type: String, required: true }, 
});

module.exports = mongoose.model('Candidato', candidatoSchema);