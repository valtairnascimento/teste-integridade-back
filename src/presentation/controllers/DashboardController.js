class DashboardController {
  constructor(
    empresaRepository,
    candidatoRepository,
    respostaRepository,
    pagamentoRepository,
    logger = console
  ) {
    this.empresaRepository = empresaRepository;
    this.candidatoRepository = candidatoRepository;
    this.respostaRepository = respostaRepository;
    this.pagamentoRepository = pagamentoRepository;
    this.logger = logger;
  }

  async obterEstatisticas(req, res) {
    try {
      const empresaId = req.user.id;
      const { periodo = '30' } = req.query; // dias

      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
      const dataFim = new Date();

      this.logger.info('Obtendo estatísticas dashboard', { 
        empresaId, 
        periodo 
      });

      // Buscar dados em paralelo
      const [
        empresa,
        estatisticasCandidatos,
        estatisticasRespostas,
        estatisticasPagamentos,
        estatisticasCreditos
      ] = await Promise.all([
        this.empresaRepository.findById(empresaId),
        this.candidatoRepository.getEstatisticas(empresaId),
        this.respostaRepository.getEstatisticas(empresaId, dataInicio, dataFim),
        this.pagamentoRepository.getEstatisticas(empresaId, dataInicio, dataFim),
        this.empresaRepository.getEstatisticasCreditos(empresaId, dataInicio, dataFim)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          empresa: {
            creditos: empresa.creditos,
            creditosBaixos: empresa.creditosBaixos
          },
          candidatos: estatisticasCandidatos,
          respostas: estatisticasRespostas,
          pagamentos: estatisticasPagamentos,
          creditos: estatisticasCreditos,
          periodo: {
            dias: periodo,
            dataInicio,
            dataFim
          }
        }
      });

    } catch (error) {
      this.logger.error('Erro ao obter estatísticas', { 
        error: error.message 
      });

      return res.status(500).json({
        success: false,
        error: 'Erro ao obter estatísticas'
      });
    }
  }
}