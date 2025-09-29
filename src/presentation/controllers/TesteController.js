const CalcularComprometimentoUseCase = require('../../domain/useCases/CalcularComprometimentoUseCase');

class TesteController {
  constructor(gerarTesteUseCase, calcularComprometimentoUseCase) {
    this.gerarTesteUseCase = gerarTesteUseCase;
    this.calcularComprometimentoUseCase = calcularComprometimentoUseCase;
  }

  async gerarTeste(req, res) {
    const { usuarioId } = req.body;
    if (!usuarioId) return res.status(400).json({ error: 'usuarioId é obrigatório' });
    try {
      const { testeId, teste } = await this.gerarTesteUseCase.execute(usuarioId);
      res.json({ testeId, ...teste });
    } catch (error) {
      console.error('Erro ao gerar teste:', error);
      res.status(500).json({ error: 'Erro ao gerar teste', details: error.message });
    }
  }

  async calcularComprometimento(req, res) {
    const { testeId, respostas, perguntas } = req.body; // Adiciona 'perguntas' ao body
    if (!testeId || !respostas || !perguntas) return res.status(400).json({ error: 'testeId, respostas e perguntas são obrigatórios' });
    try {
      const resultado = await this.calcularComprometimentoUseCase.execute(testeId, respostas, perguntas);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao calcular comprometimento:', error);
      res.status(500).json({ error: 'Erro ao calcular comprometimento', details: error.message });
    }
  }
}

module.exports = TesteController;