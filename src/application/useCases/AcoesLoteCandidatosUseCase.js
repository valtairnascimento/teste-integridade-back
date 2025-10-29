const jwt = require("jsonwebtoken");

class AcoesLoteCandidatosUseCase {
  constructor(candidatoRepository, emailService) {
    this.candidatoRepository = candidatoRepository;
    this.emailService = emailService;
  }

  async reenviarConvites(candidatoIds, empresaId) {
    const candidatos = await this.candidatoRepository.findByIds(candidatoIds);

    // Validar que todos pertencem à empresa
    const candidatosInvalidos = candidatos.filter(
      (c) => c.empresaId.toString() !== empresaId.toString()
    );

    if (candidatosInvalidos.length > 0) {
      throw new Error("Alguns candidatos não pertencem a esta empresa");
    }

    const resultados = {
      sucesso: [],
      erro: [],
    };

    for (const candidato of candidatos) {
      try {
        // Gerar novo token
        const token = jwt.sign(
          {
            testeId: candidato.testeId,
            email: candidato.email,
            empresaId: candidato.empresaId,
            candidatoId: candidato._id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        const linkTeste = `${process.env.FRONTEND_URL}/teste/${candidato.testeId}?token=${token}`;

        // Enviar email
        if (this.emailService) {
          await this.emailService.reenviarConvite({
            nome: candidato.nome,
            email: candidato.email,
            linkTeste,
            dataExpiracao: candidato.dataExpiracao,
          });
        }

        // Atualizar tentativas
        await this.candidatoRepository.incrementarReenvios(candidato._id);

        resultados.sucesso.push({
          candidatoId: candidato._id,
          nome: candidato.nome,
          email: candidato.email,
        });
      } catch (error) {
        resultados.erro.push({
          candidatoId: candidato._id,
          nome: candidato.nome,
          erro: error.message,
        });
      }
    }

    return resultados;
  }

  async estenderPrazos(candidatoIds, empresaId, diasAdicionais) {
    const candidatos = await this.candidatoRepository.findByIds(candidatoIds);

    // Validar empresa
    const candidatosInvalidos = candidatos.filter(
      (c) => c.empresaId.toString() !== empresaId.toString()
    );

    if (candidatosInvalidos.length > 0) {
      throw new Error("Alguns candidatos não pertencem a esta empresa");
    }

    const resultados = {
      sucesso: [],
      erro: [],
    };

    for (const candidato of candidatos) {
      try {
        const novaDataExpiracao = new Date(candidato.dataExpiracao);
        novaDataExpiracao.setDate(novaDataExpiracao.getDate() + diasAdicionais);

        await this.candidatoRepository.updateDataExpiracao(
          candidato._id,
          novaDataExpiracao
        );

        // Atualizar status se estava expirado
        if (candidato.status === "expirado") {
          await this.candidatoRepository.updateStatus(
            candidato._id,
            "pendente"
          );
        }

        resultados.sucesso.push({
          candidatoId: candidato._id,
          nome: candidato.nome,
          novaDataExpiracao,
        });
      } catch (error) {
        resultados.erro.push({
          candidatoId: candidato._id,
          nome: candidato.nome,
          erro: error.message,
        });
      }
    }

    return resultados;
  }

  async deletarCandidatos(candidatoIds, empresaId) {
    const candidatos = await this.candidatoRepository.findByIds(candidatoIds);

    // Validar empresa
    const candidatosInvalidos = candidatos.filter(
      (c) => c.empresaId.toString() !== empresaId.toString()
    );

    if (candidatosInvalidos.length > 0) {
      throw new Error("Alguns candidatos não pertencem a esta empresa");
    }

    // Soft delete
    await this.candidatoRepository.softDeleteMany(candidatoIds);

    return {
      sucesso: true,
      deletados: candidatoIds.length,
    };
  }
}

module.exports = {
  AcoesLoteCandidatosUseCase,
};
