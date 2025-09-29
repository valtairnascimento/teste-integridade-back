class CandidatoController {
  constructor(cadastrarCandidatoUseCase) {
    this.cadastrarCandidatoUseCase = cadastrarCandidatoUseCase;
  }

  async cadastrar(req, res) {
    const { nome, email, cpf, testeId } = req.body;
    const empresaId = req.user.id; // Do middleware auth
    if (!nome || !email || !cpf) return res.status(400).json({ error: 'nome, email e cpf são obrigatórios' });
    try {
      const candidato = await this.cadastrarCandidatoUseCase.execute(empresaId, nome, email, cpf, testeId);
      res.json({ mensagem: 'Candidato cadastrado com sucesso', candidato });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = CandidatoController;