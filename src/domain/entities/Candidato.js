class Candidato {
  constructor(id, nome, email, cpf, empresaId, testeId) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.empresaId = empresaId;
    this.testeId = testeId;
  }
}

module.exports = Candidato;