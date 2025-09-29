class ComprarCreditosController {
  constructor(comprarCreditosUseCase) {
    this.comprarCreditosUseCase = comprarCreditosUseCase;
  }

  async comprar(req, res) {
    const empresaId = req.user.id; // Pega do token via authMiddleware
    const { quantidade } = req.body;
    if (!quantidade) return res.status(400).json({ error: 'Quantidade é obrigatória' });
    try {
      const usuario = await this.comprarCreditosUseCase.execute(empresaId, quantidade);
      res.json({ mensagem: 'Créditos comprados com sucesso', testesComprados: usuario.testesComprados });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ComprarCreditosController;