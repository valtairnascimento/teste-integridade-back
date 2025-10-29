// ============= SCHEMA NOTIFICAÇÃO =============
const notificacaoSchema = new Schema({
  empresaId: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: [
      'creditos_baixos',
      'teste_concluido',
      'campanha_concluida',
      'pagamento_aprovado',
      'pagamento_falhou',
      'teste_expirado',
      'sistema'
    ],
    required: true,
    index: true
  },
  titulo: {
    type: String,
    required: true
  },
  mensagem: {
    type: String,
    required: true
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  lida: {
    type: Boolean,
    default: false,
    index: true
  },
  dataLeitura: Date,
  link: String, // Link para ação relacionada
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Índices compostos
notificacaoSchema.index({ empresaId: 1, lida: 1, createdAt: -1 });

const Notificacao = mongoose.model('Notificacao', notificacaoSchema);