const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AutenticarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute(email, senha) {
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token, id: usuario.id }; 
  }
}

module.exports = AutenticarUsuarioUseCase;