const auditoriaSchema = new Schema({
  empresaId: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
    index: true
  },
  usuarioId: Schema.Types.ObjectId,
  acao: {
    type: String,
    required: true,
    index: true
  },
  recurso: {
    tipo: String, // 'candidato', 'teste', 'campanha', 'configuracao', etc
    id: String
  },
  detalhes: {
    type: Schema.Types.Mixed
  },
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// TTL Index - remove logs após 90 dias
auditoriaSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 dias

const Auditoria = mongoose.model('Auditoria', auditoriaSchema);