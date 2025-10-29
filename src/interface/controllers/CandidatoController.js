class CandidatoController {
  constructor(validarCandidatoUseCase, logger = console) {
    this.validarCandidatoUseCase = validarCandidatoUseCase;
    this.logger = logger;
  }

  async validar(req, res) {
    try {
      const { email, cpf, empresaId } = req.body;

      this.logger.info('Validando candidato', { email });

      const resultado = await this.validarCandidatoUseCase.execute(
        email,
        cpf,
        empresaId
      );

      this.logger.info('Candidato validado com sucesso', { 
        testeId: resultado.testeId 
      });

      return res.status(200).json({
        success: true,
        message: 'Candidato validado com sucesso',
        data: resultado
      });

    } catch (error) {
      this.logger.error('Erro ao validar candidato', { 
        error: error.message 
      });

      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}