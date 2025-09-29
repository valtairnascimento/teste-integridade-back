const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

class CalcularComprometimentoUseCase {
  constructor(perguntaRepository, respostaRepository, candidatoRepository) {
    this.perguntaRepository = perguntaRepository;
    this.respostaRepository = respostaRepository;
    this.candidatoRepository = candidatoRepository;
  }

  async execute(testeId, respostas, perguntas, candidatoToken) {
    console.log('Token recebido:', candidatoToken);
    let decoded;
    try {
      decoded = jwt.verify(candidatoToken.split(' ')[1], process.env.JWT_SECRET);
      console.log('Token decodificado:', decoded);
    } catch (err) {
      throw new Error('Token inválido ou expirado');
    }

    console.log('Buscando candidato com:', { email: decoded.email, empresaId: decoded.empresaId });
    const candidato = await this.candidatoRepository.findByEmailAndCpf(decoded.email, null, decoded.empresaId);
    console.log('Candidato encontrado:', candidato);
    if (!candidato) {
      throw new Error('Candidato não encontrado');
    }
    if (candidato.testeId.toString() !== testeId) {
      console.log('testeId do candidato:', candidato.testeId, 'testeId da requisição:', testeId);
      throw new Error('Validação de testeId falhou');
    }

    let pontuacaoTotal = 0;
    let totalPerguntas = 0;
    const detalhes = { afetivo: 0, normativo: 0, continuativo: 0, inconsistencias: 0 };

    // Mapeamento manual das perguntas para categorias
    const categoriaMap = {
      'efb51db2-4a0b-4e08-8047-68872a833608': 'normativo', // Exemplo: Compromisso com a verdade
      '4e3a14d1-c726-4f9d-a7e5-7204c895f521': 'normativo', // Tecnologia para inconsistências
      '0256d0e5-d11f-4e66-9132-f572abc215a4': 'continuativo', // Teste padronizado
      'c9bf4b18-3873-4a1a-bda4-868cc3f7679a': 'afetivo', // Julgamento
      '467cb925-de6f-4d09-ad22-9519ac0289ed': 'continuativo', // Tendências
      '866f28c4-df31-4139-af78-3d1170f8ff3a': 'continuativo', // Continuação
      'db558d9a-38c7-4bee-8c5f-1224bd03e68b': 'afetivo', // Orgulho
      'af636672-fa7f-4fbb-adfc-1b123df456e1': 'afetivo', // Futuro da empresa
      '6b9f73fd-8fc7-4fef-ad34-1a7de606f06b': 'continuativo', // Perdas pessoais
      'be99ee9e-3e83-40af-95fa-8a591ef5b022': 'normativo', // Gratidão
      '69568e39-3d20-41c8-823f-00a500b92d02': 'normativo', // Lealdade
      'd0f00dab-8971-438d-acd3-07d3c3129259': 'afetivo' // Julgamento ético
    };

    for (const [perguntaId, resposta] of Object.entries(respostas)) {
      const pergunta = perguntas.find(p => p.id === perguntaId);
      if (pergunta) {
        totalPerguntas++;
        let pontos = 0;

        if (pergunta.opcoes.some(opt => opt.texto.toLowerCase() === resposta.toLowerCase())) {
          const opcao = pergunta.opcoes.find(opt => opt.texto.toLowerCase() === resposta.toLowerCase());
          pontos = opcao ? opcao.pontos : 0;
        } else if (['1', '2', '3', '4', '5'].includes(resposta)) {
          const index = parseInt(resposta) - 1;
          if (index >= 0 && index < pergunta.opcoes.length) {
            pontos = pergunta.opcoes[index].pontos;
          }
        } else if (['a', 'b', 'c', 'd', 'e'].includes(resposta.toLowerCase())) {
          pontos = pergunta.pontuacaoPorOpcao[resposta.toLowerCase()] || 0;
        }

        pontuacaoTotal += pontos;

        // Atribuir pontos às categorias
        const categoria = categoriaMap[perguntaId];
        if (categoria) {
          detalhes[categoria] += pontos;
        }
      }
    }

    // Normalizar as pontuações
    const maxPontosPorCategoria = 5; // Supondo escala de 0 a 5
    const numPerguntasPorCategoria = Object.values(categoriaMap).reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, { afetivo: 0, normativo: 0, continuativo: 0 });
    detalhes.afetivo = numPerguntasPorCategoria.afetivo > 0 ? (detalhes.afetivo / numPerguntasPorCategoria.afetivo) : 0;
    detalhes.normativo = numPerguntasPorCategoria.normativo > 0 ? (detalhes.normativo / numPerguntasPorCategoria.normativo) : 0;
    detalhes.continuativo = numPerguntasPorCategoria.continuativo > 0 ? (detalhes.continuativo / numPerguntasPorCategoria.continuativo) : 0;
    pontuacaoTotal = totalPerguntas > 0 ? pontuacaoTotal / totalPerguntas : 0;
    const nivel = pontuacaoTotal > 3 ? 'Alto' : 'Baixo';

    const resposta = {
      testeId,
      candidatoId: candidato._id,
      respostas,
      pontuacaoTotal,
      nivel,
      detalhes,
    };
    await this.respostaRepository.save(resposta);

    return { pontuacaoTotal, nivel, detalhes, inconsistencias: 0 };
  }
}

module.exports = CalcularComprometimentoUseCase;