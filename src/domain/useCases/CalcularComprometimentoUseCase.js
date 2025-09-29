const { Resultado } = require('../entities/Pergunta');

class CalcularComprometimentoUseCase {
  constructor(perguntaRepository) {
    this.perguntaRepository = perguntaRepository;
  }

  async execute(testeId, respostas, perguntas) {
    let scoreAfetivo = 0, countAfetivo = 0;
    let scoreNormativo = 0, countNormativo = 0;
    let scoreContinuativo = 0, countContinuativo = 0;
    let inconsistencias = 0;

    console.log('Respostas recebidas:', respostas);
    console.log('Perguntas recebidas:', perguntas);

    for (const [perguntaId, opcao] of Object.entries(respostas)) {
      const pergunta = perguntas.find(p => p.id === perguntaId); // Usa as perguntas do body
      if (pergunta) {
        console.log(`Pergunta ${perguntaId}: Texto=${pergunta.texto}, Opção=${opcao}`);
        const pontos = pergunta.pontuacaoPorOpcao[opcao.toLowerCase()] || 0;
        console.log(`Pontos para ${opcao}: ${pontos}`);

        // Classificação manual por texto (case insensitive)
        if (pergunta.texto.toLowerCase().includes('orgulhoso') || pergunta.texto.toLowerCase().includes('futuro')) {
          scoreAfetivo += pontos;
          countAfetivo++;
        } else if (pergunta.texto.toLowerCase().includes('lealdade') || pergunta.texto.toLowerCase().includes('gratidão')) {
          scoreNormativo += pontos;
          countNormativo++;
        } else if (pergunta.texto.toLowerCase().includes('difícil deixar') || pergunta.texto.toLowerCase().includes('alternativa')) {
          scoreContinuativo += pontos;
          countContinuativo++;
        }
      } else {
        console.log(`Pergunta ${perguntaId} não encontrada nas perguntas fornecidas`);
      }
    }

    // Médias por dimensão
    const mediaAfetivo = countAfetivo > 0 ? scoreAfetivo / countAfetivo : 0;
    const mediaNormativo = countNormativo > 0 ? scoreNormativo / countNormativo : 0;
    const mediaContinuativo = countContinuativo > 0 ? scoreContinuativo / countContinuativo : 0;

    // Pontuação total como média das dimensões válidas
    const dimensoesValidas = [mediaAfetivo, mediaNormativo, mediaContinuativo].filter(v => v > 0).length;
    const pontuacaoTotal = dimensoesValidas > 0 ? (mediaAfetivo + mediaNormativo + mediaContinuativo) / dimensoesValidas : 0;

    // Nível
    const nivel = pontuacaoTotal > 3 ? 'Alto' : pontuacaoTotal > 1.5 ? 'Moderado' : 'Baixo';

    // Detalhes
    const detalhes = {
      afetivo: mediaAfetivo,
      normativo: mediaNormativo,
      continuativo: mediaContinuativo,
      inconsistencias
    };

    console.log('Resultados calculados:', { pontuacaoTotal, nivel, detalhes });
    return new Resultado(pontuacaoTotal, nivel, detalhes);
  }
}

module.exports = CalcularComprometimentoUseCase;