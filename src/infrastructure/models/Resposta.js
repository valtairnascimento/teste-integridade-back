const mongoose = require("mongoose");
const { Schema } = mongoose;

const respostaSchema = new Schema(
  {
    testeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    candidatoId: {
      type: Schema.Types.ObjectId,
      ref: "Candidato",
      required: true,
      index: true,
    },
    empresaId: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
      index: true,
    },
    respostas: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
    pontuacaoTotal: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    nivel: {
      type: String,
      enum: ["Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto"],
      required: true,
      index: true,
    },
    detalhes: {
      afetivo: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      normativo: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      continuativo: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      inconsistencias: {
        type: Number,
        default: 0,
      },
    },
    pontuacaoTotalBruta: Number,
    detalhesPercentis: {
      pontuacaoTotal: Number,
      afetivo: Number,
      normativo: Number,
      continuativo: Number,
    },
    inconsistenciasDetalhadas: {
      total: Number,
      percentualPenalizacao: Number,
      detalhes: [
        {
          tipo: String,
          severidade: String,
          descricao: String,
        },
      ],
    },
    recomendacoes: [String],
    metadata: {
      versaoCalculo: String,
      dataCalculo: Date,
      totalPerguntas: Number,
      totalRespondidas: Number,
      tempoResposta: Number,
    },
  },
  {
    timestamps: true,
  }
);

respostaSchema.index({ empresaId: 1, createdAt: -1 });
respostaSchema.index({ nivel: 1, empresaId: 1 });

const Resposta = mongoose.model("Resposta", respostaSchema);

module.exports = {
  Resposta,
};
