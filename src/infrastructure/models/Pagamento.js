const mongoose = require('mongoose');

const pagamentoSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
    index: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  preferenciaId: {
    type: String,
    index: true
  },
  externalReference: {
    type: String,
    required: true,
    index: true
  },
  quantidade: {
    type: Number,
    required: true,
    min: 1
  },
  valorUnitario: {
    type: Number,
    required: true
  },
  valorTotal: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded'],
    default: 'pending'
  },
  metodoPagamento: String,
  processado: {
    type: Boolean,
    default: false
  },
  dataProcessamento: Date,
  erroProcessamento: String,
  metadata: {
    ip: String,
    userAgent: String,
    mercadoPagoData: Object
  }
}, {
  timestamps: true
});

// Índices
pagamentoSchema.index({ empresaId: 1, status: 1 });
pagamentoSchema.index({ createdAt: -1 });

const Pagamento = mongoose.model('Pagamento', pagamentoSchema);

module.exports = {
  Empresa,
  Candidato,
  Resposta,
  Pagamento
};