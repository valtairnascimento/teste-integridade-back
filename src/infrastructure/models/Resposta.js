const mongoose = require('mongoose');

const respostaSchema = new mongoose.Schema({
  testeId: { type: String, required: true }, // Alterado de ObjectId para String
  candidatoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidato', required: true },
  respostas: { type: Object, required: true },
  pontuacaoTotal: { type: Number, required: true },
  nivel: { type: String, required: true },
  detalhes: {
    afetivo: { type: Number, required: true },
    normativo: { type: Number, required: true },
    continuativo: { type: Number, required: true },
    inconsistencias: { type: Number, required: true },
  },
});

module.exports = mongoose.model('Resposta', respostaSchema);