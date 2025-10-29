const mongoose = require("mongoose");
const { Schema } = mongoose;

const candidatoSchema = new Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    cpf: {
      type: String,
      required: true,
      match: /^\d{11}$/,
    },
    empresaId: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
      index: true,
    },
    testeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pendente", "em_andamento", "concluido", "expirado"],
      default: "pendente",
      index: true,
    },
    dataExpiracao: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    },
    ultimoAcesso: {
      type: Date,
    },
    tentativasAcesso: {
      type: Number,
      default: 0,
    },
    metadata: {
      origem: {
        type: String,
        enum: ["manual", "csv", "api"],
        default: "manual",
      },
      observacoes: String,
    },
  },
  {
    timestamps: true,
  }
);

candidatoSchema.index({ email: 1, cpf: 1, empresaId: 1 }, { unique: true });
candidatoSchema.index({ empresaId: 1, status: 1 });

candidatoSchema.methods.estaExpirado = function () {
  return this.dataExpiracao < new Date();
};

const Candidato = mongoose.model("Candidato", candidatoSchema);

const candidatoSchemaExtension = {
  campanhaId: {
    type: String,
    index: true
  },
  reenvios: {
    type: Number,
    default: 0
  },
  lembretes: [{
    dataEnvio: {
      type: Date,
      default: Date.now
    },
    tipo: {
      type: String,
      enum: ['inicial', 'lembrete', 'urgente']
    }
  }],
  qrCode: {
    gerado: {
      type: Boolean,
      default: false
    },
    dataGeracao: Date,
    acessosViaQR: {
      type: Number,
      default: 0
    }
  }
};

module.exports = {
  Candidato,
};
