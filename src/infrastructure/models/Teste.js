const mongoose = require('mongoose');

const perguntaSchema = new mongoose.Schema({
  id: String,
  texto: String,
  opcoes: [{ texto: String, pontos: Number }],
  pontuacaoPorOpcao: { type: Map, of: Number },
});

const testeSchema = new mongoose.Schema({
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  perguntasFixas: [perguntaSchema],
  perguntasRandomizadas: [perguntaSchema],
  dataGeracao: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Teste', testeSchema);