const mongoose = require("mongoose");
const { Schema } = mongoose;

const perguntaSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    texto: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["multipla_escolha", "escala_likert", "sim_nao"],
      required: true,
    },
    dimensao: {
      type: String,
      enum: ["afetivo", "normativo", "continuativo"],
      index: true,
    },
    opcoes: [
      {
        texto: String,
        pontos: Number,
      },
    ],
    pontuacaoPorOpcao: {
      type: Map,
      of: Number,
    },
    tags: [String],
    ativa: {
      type: Boolean,
      default: true,
    },
    ordem: Number,
  },
  {
    timestamps: true,
  }
);

const Pergunta = mongoose.model("Pergunta", perguntaSchema);

module.exports = {
  Pergunta,
};
