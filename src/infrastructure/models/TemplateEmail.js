const templateEmailSchema = new Schema({
  empresaId: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    index: true
  },
  nome: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: [
      'convite_teste',
      'lembrete_teste',
      'teste_concluido',
      'boas_vindas',
      'demonstracao'
    ],
    required: true
  },
  assunto: {
    type: String,
    required: true
  },
  corpo: {
    type: String,
    required: true
  },
  variaveis: [String], // Ex: ['{{nome}}', '{{linkTeste}}', '{{dataExpiracao}}']
  ativo: {
    type: Boolean,
    default: true
  },
  padrao: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const TemplateEmail = mongoose.model('TemplateEmail', templateEmailSchema);