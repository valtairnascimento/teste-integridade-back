const { v4: uuidv4 } = require("uuid");
const CPFValidator = require("../utils/CPFValidator");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");

// ============= LISTAR CAMPANHAS =============
class ListarCampanhasUseCase {
  constructor(campanhaRepository, candidatoRepository) {
    this.campanhaRepository = campanhaRepository;
    this.candidatoRepository = candidatoRepository;
  }

  async execute(empresaId, filtros = {}) {
    const campanhas = await this.campanhaRepository.findByEmpresaId(empresaId, {
      status: filtros.status,
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
      departamento: filtros.departamento,
      limit: filtros.limit || 50,
    });

    // Enriquecer com estatísticas
    const campanhasEnriquecidas = await Promise.all(
      campanhas.map(async (campanha) => {
        const stats = await this.candidatoRepository.getEstatisticasPorCampanha(
          campanha.id
        );

        return {
          id: campanha.id,
          nome: campanha.nome,
          departamento: campanha.departamento,
          status: campanha.status,
          dataCriacao: campanha.createdAt,
          dataExpiracao: campanha.dataExpiracao,
          estatisticas: {
            total: stats.total,
            concluidos: stats.concluidos,
            pendentes: stats.pendentes,
            emAndamento: stats.emAndamento,
            expirados: stats.expirados,
            taxaConclusao: stats.taxaConclusao,
          },
        };
      })
    );

    return {
      campanhas: campanhasEnriquecidas,
      total: campanhas.length,
    };
  }
}

module.exports = {
  ListarCampanhasUseCase,
};
