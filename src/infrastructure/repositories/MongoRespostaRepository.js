const Resposta = require('../models/Resposta');

class MongoRespostaRepository {
  async save(resposta) {
    const novaResposta = new Resposta(resposta);
    return await novaResposta.save();
  }

  async findByEmpresaId(empresaId) {
    console.log('Buscando respostas para empresaId:', empresaId);
    const respostas = await Resposta.find()
      .populate({
        path: 'candidatoId',
        match: { empresaId: empresaId } // Filtra candidatos pelo empresaId
      })
      .exec();
    console.log('Respostas brutas:', respostas);
    return respostas.filter(r => r.candidatoId != null); // Retorna apenas os que têm candidato válido
  }
}

module.exports = MongoRespostaRepository;