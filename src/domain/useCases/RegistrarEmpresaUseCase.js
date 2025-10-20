const bcrypt = require('bcryptjs');

// ============= REGISTRAR EMPRESA =============
class RegistrarEmpresaUseCase {
  constructor(empresaRepository) {
    this.empresaRepository = empresaRepository;
  }

  async execute(email, senha, nome, cnpj = null) {
    // Validações
    if (!email || !senha || !nome) {
      throw new Error('Email, senha e nome são obrigatórios');
    }

    if (senha.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    // Validar se email já existe
    const empresaExistente = await this.empresaRepository.findByEmail(email);
    if (empresaExistente) {
      throw new Error('Email já cadastrado');
    }

    // Validar CNPJ se fornecido
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos');
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar empresa
    const empresa = await this.empresaRepository.save({
      email: email.toLowerCase(),
      senha: senhaHash,
      nome,
      cnpj: cnpj ? cnpj.replace(/\D/g, '') : null,
      creditos: 0,
      role: 'empresa',
      status: 'ativo'
    });

    return {
      id: empresa._id,
      email: empresa.email,
      nome: empresa.nome,
      creditos: empresa.creditos
    };
  }
}

module.exports = {
  RegistrarEmpresaUseCase
};