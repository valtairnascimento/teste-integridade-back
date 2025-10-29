class TesteController {
  constructor(
    gerarTesteUseCase,
    calcularComprometimentoUseCase,
    logger = console
  ) {
    this.gerarTesteUseCase = gerarTesteUseCase;
    this.calcularComprometimentoUseCase = calcularComprometimentoUseCase;
    this.logger = logger;
  }

  async gerarTeste(req, res) {
    try {
      const { nomeCandidato, emailCandidato, cpfCandidato, observacoes } = req.body;
      const empresaId = req.user.id;

      this.logger.info('Gerando teste', { 
        empresaId, 
        emailCandidato 
      });

      const metadata = {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        origem: 'manual',
        observacoes
      };

      const resultado = await this.gerarTesteUseCase.execute(
        empresaId,
        nomeCandidato,
        emailCandidato,
        cpfCandidato,
        metadata
      );

      this.logger.info('Teste gerado com sucesso', { 
        testeId: resultado.testeId,
        candidatoId: resultado.candidato.id
      });

      return res.status(201).json({
        success: true,
        message: 'Teste gerado com sucesso',
        data: resultado
      });

    } catch (error) {
      this.logger.error('Erro ao gerar teste', { 
        error: error.message,
        empresaId: req.user?.id
      });

      const statusCode = error.message.includes('insuficientes') ? 402 : 400;

      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async calcularComprometimento(req, res) {
    const inicioProcessamento = Date.now();

    try {
      const { testeId, respostas, perguntas } = req.body;
      const token = req.headers['authorization'];

      if (!testeId || !respostas || !perguntas || !token) {
        return res.status(400).json({
          success: false,
          error: 'testeId, respostas, perguntas e token são obrigatórios'
        });
      }

      this.logger.info('Calculando comprometimento', { testeId });

      const resultado = await this.calcularComprometimentoUseCase.execute(
        testeId,
        respostas,
        perguntas,
        token
      );

      // Adicionar tempo de processamento
      const tempoProcessamento = Math.round((Date.now() - inicioProcessamento) / 1000);
      resultado.tempoProcessamento = tempoProcessamento;

      this.logger.info('Comprometimento calculado com sucesso', { 
        testeId,
        nivel: resultado.nivel,
        tempoProcessamento
      });

      return res.status(200).json({
        success: true,
        message: 'Teste concluído com sucesso',
        data: resultado
      });

    } catch (error) {
      this.logger.error('Erro ao calcular comprometimento', { 
        error: error.message,
        stack: error.stack
      });

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async obterPerguntas(req, res) {
    try {
      const { testeId } = req.params;
      const token = req.headers['authorization'];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token não fornecido'
        });
      }

      // Validar token e buscar perguntas
      // ... implementar lógica

      return res.status(200).json({
        success: true,
        data: {
          // perguntas
        }
      });

    } catch (error) {
      this.logger.error('Erro ao obter perguntas', { 
        error: error.message 
      });

      return res.status(500).json({
        success: false,
        error: 'Erro ao obter perguntas'
      });
    }
  }
}