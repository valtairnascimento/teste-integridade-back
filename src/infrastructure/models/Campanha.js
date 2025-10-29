const mongoose = require('mongoose');
const { Schema } = mongoose;

const campanhaSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  empresaId: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
    index: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  departamento: {
    type: String,
    trim: true
  },
  instrucoes: {
    type: String
  },
  dataExpiracao: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ativa', 'pausada', 'concluida', 'cancelada'],
    default: 'ativa',
    index: true
  },
  totalCandidatos: {
    type: Number,
    default: 0
  },
  candidatosConcluidos: {
    type: Number,
    default: 0
  },
  candidatosPendentes: {
    type: Number,
    default: 0
  },
  configuracoes: {
    enviarEmail: {
      type: Boolean,
      default: true
    },
    gerarQRCode: {
      type: Boolean,
      default: false
    },
    lembretes: {
      type: String,
      enum: ['none', 'daily', 'weekly'],
      default: 'none'
    },
    notificarInicio: {
      type: Boolean,
      default: false
    },
    notificarConclusao: {
      type: Boolean,
      default: true
    }
  },
  estatisticas: {
    taxaConclusao: {
      type: Number,
      default: 0
    },
    tempoMedioConclusao: {
      type: Number, // em minutos
      default: 0
    },
    pontuacaoMedia: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    criadoPor: Schema.Types.ObjectId,
    ip: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Índices compostos
campanhaSchema.index({ empresaId: 1, status: 1 });
campanhaSchema.index({ empresaId: 1, createdAt: -1 });

// Método para atualizar estatísticas
campanhaSchema.methods.atualizarEstatisticas = async function() {
  const Candidato = mongoose.model('Candidato');
  
  const stats = await Candidato.aggregate([
    { $match: { campanhaId: this.id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        concluidos: {
          $sum: { $cond: [{ $eq: ['$status', 'concluido'] }, 1, 0] }
        }
      }
    }
  ]);

  if (stats.length > 0) {
    this.totalCandidatos = stats[0].total;
    this.candidatosConcluidos = stats[0].concluidos;
    this.candidatosPendentes = stats[0].total - stats[0].concluidos;
    this.estatisticas.taxaConclusao = 
      (stats[0].concluidos / stats[0].total * 100).toFixed(2);
  }

  await this.save();
};

const Campanha = mongoose.model('Campanha', campanhaSchema);
















module.exports = {
  Campanha,
  Assinatura,
  Notificacao,
  Auditoria,
  TemplateEmail,
  empresaSchemaExtension,
  candidatoSchemaExtension
};