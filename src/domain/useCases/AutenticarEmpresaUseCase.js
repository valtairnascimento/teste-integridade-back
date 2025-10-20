class AutenticarEmpresaUseCase {
  constructor(empresaRepository) {
    this.empresaRepository = empresaRepository;
  }

  async execute(email, senha) {
    if (!email || !senha) {
      throw new Error('Email e senha são obrigatórios');
    }

    const empresa = await this.empresaRepository.findByEmail(email);
    
    if (!empresa) {
      throw new Error('Credenciais inválidas');
    }

    if (empresa.status !== 'ativo') {
      throw new Error('Conta inativa ou suspensa');
    }

    const senhaValida = await bcrypt.compare(senha, empresa.senha);
    
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: empresa._id, 
        email: empresa.email,
        role: empresa.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return { 
      token,
      empresa: {
        id: empresa._id,
        email: empresa.email,
        nome: empresa.nome,
        creditos: empresa.creditos,
        creditosBaixos: empresa.creditosBaixos
      }
    };
  }
}

module.exports = {
  AutenticarEmpresaUseCase,
};