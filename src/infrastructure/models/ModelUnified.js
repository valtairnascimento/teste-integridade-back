const mongoose = require('mongoose');

// ============= EMPRESA/USUÁRIO (UNIFICADO) =============
const empresaSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome da empresa é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  senha: { 
    type: String, 
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
  },
  cnpj: {
    type: String,
    sparse: true,
    match: [/^\d{14}$/, 'CNPJ deve ter 14 dígitos']
  },
  telefone: {
    type: String,
    trim: true
  },
  creditos: { 
    type: Number, 
    default: 0,
    min: [0, 'Créditos não podem ser negativos']
  },
  role: { 
    type: String, 
    default: 'empresa',
    enum: ['empresa', 'admin']
  },
  status: {
    type: String,
    default: 'ativo',
    enum: ['ativo', 'inativo', 'suspenso']
  },
  historicoCreditos: [{
    tipo: {
      type: String,
      enum: ['compra', 'uso', 'ajuste', 'reembolso'],
      required: true
    },
    quantidade: {
      type: Number,
      required: true
    },
    saldoAnterior: {
      type: Number,
      required: true
    },
    saldoAtual: {
      type: Number,
      required: true
    },
    acao: String, // ex: "/api/gerar-teste"
    paymentId: String, // ID do pagamento Mercado Pago
    descricao: String,
    data: {
      type: Date,
      default: Date.now
    },
    metadata: {
      ip: String,
      userAgent: String
    }
  }],
  configuracoes: {
    notificacoesEmail: {
      type: Boolean,
      default: true
    },
    notificacoesCreditosBaixos: {
      type: Boolean,
      default: true
    },
    limiteAlertaCreditos: {
      type: Number,
      default: 10
    }
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Índices para melhor performance
empresaSchema.index({ email: 1 });
empresaSchema.index({ status: 1 });
empresaSchema.index({ creditos: 1 });

// Método virtual para verificar créditos baixos
empresaSchema.virtual('creditosBaixos').get(function() {
  return this.creditos < this.configuracoes.limiteAlertaCreditos;
});

// Método para adicionar ao histórico
empresaSchema.methods.adicionarHistorico = function(tipo, quantidade, acao, paymentId = null, metadata = {}) {
  this.historicoCreditos.push({
    tipo,
    quantidade,
    saldoAnterior: this.creditos,
    saldoAtual: this.creditos + quantidade,
    acao,
    paymentId,
    metadata,
    data: new Date()
  });
};

const Empresa = mongoose.model('Empresa', empresaSchema);

// ============= CANDIDATO =============
const candidatoSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  cpf: { 
    type: String, 
    required: [true, 'CPF é obrigatório'],
    match: [/^\d{11}$/, 'CPF deve ter 11 dígitos']
  },
  telefone: {
    type: String,
    trim: true
  },
  empresaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Empresa', 
    required: true,
    index: true
  },
  testeId: { 
    type: String, 
    required: true,
    index: true
  },
  status: {
    type: String,
    default: 'pendente',
    enum: ['pendente', 'em_andamento', 'concluido', 'expirado']
  },
  dataExpiracao: {
    type: Date,
    default: function() {
      // Expira em 7 dias
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  tentativasAcesso: {
    type: Number,
    default: 0
  },
  ultimoAcesso: Date,
  metadata: {
    origem: String, // 'manual', 'importacao', 'api'
    observacoes: String
  }
}, {
  timestamps: true
});

// Índices compostos para queries frequentes
candidatoSchema.index({ email: 1, cpf: 1 });
candidatoSchema.index({ empresaId: 1, status: 1 });
candidatoSchema.index({ testeId: 1 });

// Método para verificar se está expirado
candidatoSchema.methods.estaExpirado = function() {
  return this.dataExpiracao < new Date();
};

const Candidato = mongoose.model('Candidato', candidatoSchema);

// ============= RESPOSTA =============
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

// ============= PAGAMENTO (NOVO) =============
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