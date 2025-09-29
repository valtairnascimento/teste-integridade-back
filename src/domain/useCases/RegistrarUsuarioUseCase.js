const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class RegistrarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute(email, senha, empresaNome) {
    const usuarioExistente = await this.usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    const hashedSenha = bcrypt.hashSync(senha, 10);
    const usuario = {
      email,
      senha: hashedSenha,
      empresaNome,
      role: 'empresa',
      testesComprados: 0 // Inicialmente sem créditos
    };

    return await this.usuarioRepository.save(usuario);
  }
}

module.exports = RegistrarUsuarioUseCase;