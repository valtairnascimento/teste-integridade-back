const { Teste } = require('../entities/Pergunta');
const { v4: uuidv4 } = require('uuid');

class GerarTesteUseCase {
  constructor(perguntaRepository, candidatoRepository, empresaRepository) {
    this.perguntaRepository = perguntaRepository;
    this.candidatoRepository = candidatoRepository;
    this.empresaRepository = empresaRepository;
  }

  async execute(empresaId, nomeCandidato, emailCandidato, cpfCandidato, metadata = {}) {
    // Validações
    if (!empresaId || !nomeCandidato || !emailCandidato || !cpfCandidato) {
      throw new Error('Todos os campos são obrigatórios');
    }

    // Validar CPF
    const cpfLimpo = CPFValidator.validarOuLancarErro(cpfCandidato);

    // Verificar se empresa existe e tem créditos
    const empresa = await this.empresaRepository.findById(empresaId);
    
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }

    if (empresa.status !== 'ativo') {
      throw new Error('Empresa inativa');
    }

    if (empresa.creditos < 1) {
      throw new Error('Créditos insuficientes. Compre mais créditos para gerar testes.');
    }

    // Verificar se candidato já existe
    const candidatoExistente = await this.candidatoRepository.findByEmailAndCpf(
      emailCandidato,
      cpfLimpo,
      empresaId
    );

    if (candidatoExistente) {
      if (candidatoExistente.status === 'concluido') {
        throw new Error('Candidato já concluiu o teste');
      }
      
      if (!candidatoExistente.estaExpirado()) {
        // Retornar teste existente
        return {
          testeId: candidatoExistente.testeId,
          candidato: candidatoExistente,
          mensagem: 'Teste já existe para este candidato'
        };
      }
    }

    // Gerar perguntas
    const perguntasFixas = await this.perguntaRepository.getPerguntasFixas();
    const perguntasRandomizadas = await this.perguntaRepository.findRandom(25);
    const testeId = uuidv4();

    // Iniciar transação
    const session = await this.empresaRepository.startSession();
    
    try {
      await session.startTransaction();

      // Deduzir 1 crédito
      await this.empresaRepository.updateCreditos(empresaId, -1, {
        session,
        tipo: 'uso',
        acao: '/api/gerar-teste',
        descricao: `Teste gerado para ${nomeCandidato}`,
        ip: metadata.ip,
        userAgent: metadata.userAgent
      });

      // Criar candidato
      const candidato = await this.candidatoRepository.save({
        nome: nomeCandidato,
        email: emailCandidato.toLowerCase(),
        cpf: cpfLimpo,
        empresaId,
        testeId,
        status: 'pendente',
        metadata: {
          origem: metadata.origem || 'manual',
          observacoes: metadata.observacoes || ''
        }
      });

      await session.commitTransaction();

      // Gerar token para candidato
      const tokenCandidato = jwt.sign(
        {
          testeId,
          email: candidato.email,
          empresaId,
          candidatoId: candidato._id
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        testeId,
        candidato: {
          id: candidato._id,
          nome: candidato.nome,
          email: candidato.email,
          cpf: CPFValidator.formatar(candidato.cpf),
          status: candidato.status,
          dataExpiracao: candidato.dataExpiracao
        },
        teste: {
          perguntasFixas,
          perguntasRandomizadas,
          totalPerguntas: perguntasFixas.length + perguntasRandomizadas.length
        },
        tokenCandidato,
        linkTeste: `${process.env.FRONTEND_URL}/teste/${testeId}?token=${tokenCandidato}`
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = GerarTesteUseCase;