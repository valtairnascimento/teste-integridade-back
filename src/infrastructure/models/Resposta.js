const respostaSchema = new mongoose.Schema({
  testeId: { 
    type: String, 
    required: true,
    index: true
  },
  candidatoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidato', 
    required: true,
    index: true
  },
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
    index: true
  },
  respostas: { 
    type: Map,
    of: String,
    required: true 
  },
  pontuacaoTotal: { 
    type: Number, 
    required: true,
    min: 0,
    max: 5
  },
  pontuacaoTotalBruta: {
    type: Number
  },
  nivel: { 
    type: String, 
    required: true,
    enum: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto']
  },
  detalhes: {
    afetivo: { 
      type: Number, 
      required: true,
      min: 0,
      max: 5
    },
    normativo: { 
      type: Number, 
      required: true,
      min: 0,
      max: 5
    },
    continuativo: { 
      type: Number, 
      required: true,
      min: 0,
      max: 5
    },
    inconsistencias: { 
      type: Number, 
      required: true,
      default: 0
    }
  },
  detalhesPercentis: {
    pontuacaoTotal: Number,
    afetivo: Number,
    normativo: Number,
    continuativo: Number
  },
  inconsistenciasDetalhadas: {
    total: Number,
    percentualPenalizacao: Number,
    detalhes: [{
      tipo: String,
      severidade: String,
      descricao: String
    }]
  },
  recomendacoes: [String],
  metadata: {
    versaoCalculo: {
      type: String,
      default: '2.0'
    },
    dataCalculo: {
      type: Date,
      default: Date.now
    },
    totalPerguntas: Number,
    totalRespondidas: Number,
    tempoResposta: Number, // em segundos
    ip: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Índices para queries de relatórios
respostaSchema.index({ empresaId: 1, createdAt: -1 });
respostaSchema.index({ candidatoId: 1 });
respostaSchema.index({ nivel: 1 });

const Resposta = mongoose.model('Resposta', respostaSchema);