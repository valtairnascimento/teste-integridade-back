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