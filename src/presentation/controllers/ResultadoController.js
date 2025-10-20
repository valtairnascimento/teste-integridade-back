class ResultadoController {
  constructor(visualizarResultadosUseCase, logger = console) {
    this.visualizarResultadosUseCase = visualizarResultadosUseCase;
    this.logger = logger;
  }

  async listar(req, res) {
    try {
      const empresaId = req.user.id;
      
      const filtros = {
        dataInicio: req.query.dataInicio 
          ? new Date(req.query.dataInicio) 
          : null,
        dataFim: req.query.dataFim 
          ? new Date(req.query.dataFim) 
          : null,
        nivel: req.query.nivel,
        limit: parseInt(req.query.limit) || 100
      };

      this.logger.info('Listando resultados', { empresaId, filtros });

      const resultado = await this.visualizarResultadosUseCase.execute(
        empresaId,
        filtros
      );

      return res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error) {
      this.logger.error('Erro ao listar resultados', { 
        error: error.message,
        empresaId: req.user?.id
      });

      return res.status(500).json({
        success: false,
        error: 'Erro ao visualizar resultados'
      });
    }
  }

  async obterUnico(req, res) {
    try {
      const empresaId = req.user.id;
      const { testeId } = req.params;

      this.logger.info('Obtendo resultado único', { empresaId, testeId });

      const resultado = await this.visualizarResultadosUseCase.executeUnico(
        testeId,
        empresaId
      );

      return res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error) {
      this.logger.error('Erro ao obter resultado', { 
        error: error.message 
      });

      const statusCode = error.message === 'Acesso negado' ? 403 : 404;

      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async exportar(req, res) {
    try {
      const empresaId = req.user.id;
      const { formato = 'json' } = req.query;

      this.logger.info('Exportando resultados', { empresaId, formato });

      const resultado = await this.visualizarResultadosUseCase.execute(
        empresaId,
        { limit: 10000 }
      );

      if (formato === 'csv') {
        // Implementar exportação CSV
        const csv = this._converterParaCSV(resultado.resultados);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=resultados.csv');
        
        return res.send(csv);
      }

      return res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error) {
      this.logger.error('Erro ao exportar resultados', { 
        error: error.message 
      });

      return res.status(500).json({
        success: false,
        error: 'Erro ao exportar resultados'
      });
    }
  }

  _converterParaCSV(resultados) {
    const headers = [
      'Nome',
      'Email',
      'CPF',
      'Pontuação Total',
      'Nível',
      'Afetivo',
      'Normativo',
      'Continuativo',
      'Inconsistências',
      'Data'
    ].join(',');

    const rows = resultados.map(r => [
      r.candidato.nome,
      r.candidato.email,
      r.candidato.cpf,
      r.pontuacaoTotal,
      r.nivel,
      r.detalhes.afetivo,
      r.detalhes.normativo,
      r.detalhes.continuativo,
      r.detalhes.inconsistencias,
      new Date(r.dataResposta).toLocaleDateString('pt-BR')
    ].join(','));

    return [headers, ...rows].join('\n');
  }
}