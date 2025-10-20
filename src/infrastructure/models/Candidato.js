const mongoose = require('mongoose');

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