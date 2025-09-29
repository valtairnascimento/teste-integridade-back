class ValidarCandidatoController {
  constructor(validarCandidatoUseCase) {
    this.validarCandidatoUseCase = validarCandidatoUseCase;
  }

  async validar(req, res) {
    const { email, cpf } = req.body;
    if (!email || !cpf) return res.status(400).json({ error: 'email e cpf são obrigatórios' });
    try {
      const { token, testeId } = await this.validarCandidatoUseCase.execute(email, cpf);
      res.json({ token, testeId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ValidarCandidatoController;