class PerguntaRepository {
  async findAll() {
    throw new Error('Método findAll deve ser implementado');
  }

  async findRandom(count) {
    throw new Error('Método findRandom deve ser implementado');
  }

  async getPerguntasFixas() {
    throw new Error('Método getPerguntasFixas deve ser implementado');
  }
}

module.exports = PerguntaRepository;