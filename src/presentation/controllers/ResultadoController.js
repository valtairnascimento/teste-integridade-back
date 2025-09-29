class ResultadoController {
  constructor(visualizarResultadosUseCase) {
    this.visualizarResultadosUseCase = visualizarResultadosUseCase;
  }

  async visualizar(req, res) {
    const empresaId = req.user.id; // Asegure-se de que req.user está definido pelo authMiddleware
    try {
      const resultados = await this.visualizarResultadosUseCase.execute(empresaId);
      res.json(resultados);
    } catch (error) {
      console.error('Erro ao visualizar resultados:', error);
      res.status(500).json({ error: 'Erro ao visualizar resultados', details: error.message });
    }
  }
}

module.exports = ResultadoController;