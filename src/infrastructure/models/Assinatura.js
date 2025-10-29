const mongoose = require('mongoose');
const { Schema } = mongoose;

const assinaturaSchema = new Schema({
  empresaId: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
    unique: true,
    index: true
  },
  plano: {
    tipo: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      required: true
    },
    nome: String,
    valorMensal: Number,
    creditosMensais: Number
  },
  status: {
    type: String,
    enum: ['ativa', 'cancelada', 'suspensa', 'trial'],
    default: 'ativa',
    index: true
  },
  renovacaoAutomatica: {
    type: Boolean,
    default: true
  },
  metodoPagamento: {
    tipo: String,
    cartaoFinal: String,
    mercadoPagoId: String
  },
  proximaCobranca: {
    type: Date,
    required: true
  },
  historicoCobrancas: [{
    data: Date,
    valor: Number,
    status: String,
    paymentId: String
  }],
  trialAtivo: {
    type: Boolean,
    default: false
  },
  trialExpiraEm: Date
}, {
  timestamps: true
});

// Método para verificar se está em trial
assinaturaSchema.methods.emTrial = function() {
  return this.trialAtivo && this.trialExpiraEm > new Date();
};

// Método para verificar se pode usar funcionalidade
assinaturaSchema.methods.podeUsar = function(funcionalidade) {
  const permissoes = {
    basic: ['testes_basicos', 'relatorios_basicos'],
    pro: ['testes_basicos', 'relatorios_basicos', 'campanhas', 'api', 'exportacao_ilimitada'],
    enterprise: ['testes_basicos', 'relatorios_basicos', 'campanhas', 'api', 'exportacao_ilimitada', 'sso', 'multi_usuario', 'suporte_dedicado']
  };

  return permissoes[this.plano.tipo]?.includes(funcionalidade) || false;
};

const Assinatura = mongoose.model('Assinatura', assinaturaSchema);