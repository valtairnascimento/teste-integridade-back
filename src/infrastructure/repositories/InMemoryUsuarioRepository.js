// const { v4: uuidv4 } = require('uuid');

// class InMemoryUsuarioRepository {
//   constructor() {
//     this.usuarios = [];
//   }

//   async findByEmail(email) {
//     return this.usuarios.find(u => u.email === email);
//   }

//   async save(usuario) {
//     this.usuarios.push(usuario);
//     return usuario;
//   }

//   async updateCreditos(id, creditos) {
//     const usuario = this.usuarios.find(u => u.id === id);
//     if (usuario) {
//       usuario.testesComprados += creditos;
//       return usuario;
//     }
//     throw new Error('Usuário não encontrado');
//   }

//   async findById(id) {
//   return this.usuarios.find(u => u.id === id);
// }
// }

// module.exports = InMemoryUsuarioRepository;
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class InMemoryUsuarioRepository {
  constructor() {
    this.usuarios = [
      {
        id: uuidv4(),
        email: 'empresa1@example.com',
        senha: bcrypt.hashSync('senha123', 10), 
        empresaNome: 'Minha Empresa',
        role: 'empresa',
        testesComprados: 2
      },
    ];
  }

  async findByEmail(email) {
    return this.usuarios.find(u => u.email === email);
  }

  async findById(id) {
    return this.usuarios.find(u => u.id === id);
  }

  async save(usuario) {
    this.usuarios.push(usuario);
    return usuario;
  }

  async updateCreditos(id, creditos) {
    const usuario = this.usuarios.find(u => u.id === id);
    if (usuario) {
      usuario.testesComprados += creditos;
      return usuario;
    }
    throw new Error('Usuário não encontrado');
  }
}

module.exports = InMemoryUsuarioRepository;