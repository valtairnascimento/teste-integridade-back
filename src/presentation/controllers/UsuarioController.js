class UsuarioController {
  constructor(registrarUsuarioUseCase) {
    this.registrarUsuarioUseCase = registrarUsuarioUseCase;
  }

  async registrar(req, res) {
    const { email, senha, empresaNome } = req.body;
    if (!email || !senha || !empresaNome) return res.status(400).json({ error: 'email, senha e empresaNome são obrigatórios' });
    try {
      const usuario = await this.registrarUsuarioUseCase.execute(email, senha, empresaNome);
      res.json({ mensagem: 'Usuário registrado com sucesso', id: usuario.id, email: usuario.email });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UsuarioController;