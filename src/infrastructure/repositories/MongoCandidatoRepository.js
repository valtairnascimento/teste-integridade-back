const Candidato = require('../models/Candidato');

class MongoCandidatoRepository {
  async save(candidato) {
    const novoCandidato = new Candidato(candidato);
    return await novoCandidato.save();
  }

  async findByEmailAndCpf(email, cpf, empresaId = null) {
    const query = { email };
    if (cpf) query.cpf = cpf; // Só adiciona cpf se fornecido
    if (empresaId) query.empresaId = empresaId; // Filtra por empresaId
    console.log('Consulta no repositório:', query);
    return await Candidato.findOne(query);
  }
}

module.exports = MongoCandidatoRepository;