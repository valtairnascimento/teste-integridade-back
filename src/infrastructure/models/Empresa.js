const mongoose = require('mongoose');
const { Schema } = mongoose;

const empresaSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  senha: {
    type: String,
    required: true,
    select: false 
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  cnpj: {
    type: String,
    trim: true,
    match: /^\d{14}$/
  },
  creditos: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ['empresa', 'admin'],
    default: 'empresa'
  },
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'suspenso'],
    default: 'ativo'
  },
  configuracoes: {
    notificacoesCreditosBaixos: {
      type: Boolean,
      default: true
    },
    limiteAlertaCreditos: {
      type: Number,
      default: 50
    },
    emailNotificacoes: {
      type: String
    }
  },
  historicoCreditos: [{
    tipo: {
      type: String,
      enum: ['compra', 'uso', 'estorno', 'bonus'],
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
    acao: String,
    paymentId: String,
    descricao: String,
    metadata: {
      ip: String,
      userAgent: String
    },
    data: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

empresaSchema.virtual('creditosBaixos').get(function() {
  return this.creditos < this.configuracoes.limiteAlertaCreditos;
});

empresaSchema.methods.adicionarCreditos = function(quantidade, tipo = 'compra') {
  const saldoAnterior = this.creditos;
  this.creditos += quantidade;
  
  this.historicoCreditos.push({
    tipo,
    quantidade,
    saldoAnterior,
    saldoAtual: this.creditos,
    data: new Date()
  });

  return this.save();
};

const Empresa = mongoose.model('Empresa', empresaSchema);

const empresaSchemaExtension = {
  demonstracaoAtivada: {
    type: Boolean,
    default: false
  },
  dataDemonstracao: {
    type: Date
  },
  plano: {
    tipo: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    dataInicio: Date,
    dataFim: Date,
    renovacaoAutomatica: {
      type: Boolean,
      default: false
    }
  },
  configuracoes: {
    notificacoesCreditosBaixos: {
      type: Boolean,
      default: true
    },
    limiteAlertaCreditos: {
      type: Number,
      default: 50
    },
    emailNotificacoes: String,
    
    // Notificações
    notificacoes: {
      email: {
        testeConcluido: { type: Boolean, default: true },
        creditosBaixos: { type: Boolean, default: true },
        relatorioSemanal: { type: Boolean, default: false },
        atualizacoesSistema: { type: Boolean, default: true }
      },
      push: {
        habilitado: { type: Boolean, default: false }
      }
    },
    
    // Integrações
    integracoes: {
      apiKey: String,
      apiKeyAtiva: { type: Boolean, default: false },
      webhookUrl: String,
      webhookAtivo: { type: Boolean, default: false },
      webhookEventos: [String],
      sso: {
        habilitado: { type: Boolean, default: false },
        provider: String,
        configuracao: Schema.Types.Mixed
      }
    },
    
    // Retenção de dados
    retencaoDados: {
      periodoArmazenamento: {
        type: Number,
        default: 24 // meses
      },
      deletarAutomaticamente: {
        type: Boolean,
        default: false
      },
      modoConformidade: {
        type: Boolean,
        default: true
      }
    },
    
    // Personalização
    personalizacao: {
      logo: String,
      corPrimaria: String,
      mensagemBoasVindas: String,
      mensagemConclusao: String
    }
  },
  
  // Usuários da empresa (multi-user)
  usuarios: [{
    nome: String,
    email: String,
    role: {
      type: String,
      enum: ['admin', 'gestor', 'visualizador'],
      default: 'visualizador'
    },
    ativo: {
      type: Boolean,
      default: true
    },
    ultimoAcesso: Date,
    criadoEm: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Limites por plano
  limites: {
    testesSimultaneos: {
      type: Number,
      default: 100
    },
    usuariosAdicionais: {
      type: Number,
      default: 1
    },
    retencaoDados: {
      type: Number,
      default: 12 // meses
    },
    exportacoesIlimitadas: {
      type: Boolean,
      default: false
    }
  }
};

module.exports = {
  Empresa,
 
};