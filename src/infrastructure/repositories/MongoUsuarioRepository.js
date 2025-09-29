const Usuario = require('../models/Usuario');

class MongoUsuarioRepository {
  async findByEmail(email) {
    return await Usuario.findOne({ email });
  }

  async findById(id) {
    return await Usuario.findById(id);
  }

  async save(usuario) {
    const novoUsuario = new Usuario(usuario);
    return await novoUsuario.save();
  }

  async updateCreditos(id, creditos) {
    return await Usuario.findByIdAndUpdate(id, { $inc: { testesComprados: creditos } }, { new: true });
  }
}

module.exports = MongoUsuarioRepository;