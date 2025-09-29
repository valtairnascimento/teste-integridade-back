const { v4: uuidv4 } = require('uuid');
const Candidato = require('../../domain/entities/Candidato');

class InMemoryCandidatoRepository {
  constructor() {
    this.candidatos = [];
  }

  async save(candidato) {
    if (!(candidato instanceof Candidato)) {
      candidato = new Candidato(
        uuidv4(),
        candidato.nome,
        candidato.email,
        candidato.cpf,
        candidato.empresaId,
        candidato.testeId
      );
    }
    this.candidatos.push(candidato);
    return candidato;
  }

  async findByEmailAndCpf(email, cpf, empresaId) {
    return this.candidatos.find(c => c.email === email && c.cpf === cpf && c.empresaId === empresaId);
  }
}

module.exports = InMemoryCandidatoRepository;