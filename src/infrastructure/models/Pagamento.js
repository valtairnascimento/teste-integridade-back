const mongoose = require("mongoose");
const { Schema } = mongoose;

const pagamentoSchema = new Schema(
  {
    empresaId: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
      index: true,
    },
    paymentId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    externalReference: {
      type: String,
      required: true,
    },
    quantidade: {
      type: Number,
      required: true,
      min: 1,
    },
    valorTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    valorUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    metodoPagamento: {
      type: String,
      enum: ["credit_card", "debit_card", "pix", "boleto", "account_money"],
      required: true,
    },
    dadosPagamento: {
      type: mongoose.Schema.Types.Mixed,
    },
    processado: {
      type: Boolean,
      default: false,
      index: true,
    },
    dataProcessamento: {
      type: Date,
    },
    erros: [
      {
        mensagem: String,
        data: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

pagamentoSchema.index({ empresaId: 1, status: 1 });
pagamentoSchema.index({ processado: 1, status: 1 });

const Pagamento = mongoose.model("Pagamento", pagamentoSchema);

module.exports = {
  Pagamento,
};
