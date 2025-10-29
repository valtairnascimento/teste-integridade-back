const { v4: uuidv4 } = require("uuid");
const CPFValidator = require("../utils/CPFValidator");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");

// ============= CRIAR CAMPANHA (TESTES EM LOTE) =============
class CriarCampanhaUseCase {
  constructor(
    campanhaRepository,
    candidatoRepository,
    empresaRepository,
    emailService
  ) {
    this.campanhaRepository = campanhaRepository;
    this.candidatoRepository = candidatoRepository;
    this.empresaRepository = empresaRepository;
    this.emailService = emailService;
  }

  async execute(empresaId, dadosCampanha, candidatos, metadata = {}) {
    const {
      nomeCampanha,
      dataExpiracao,
      enviarEmail,
      gerarQRCode,
      departamento,
      instrucoes,
    } = dadosCampanha;

    // Validações
    if (!nomeCampanha || !candidatos || candidatos.length === 0) {
      throw new Error("Nome da campanha e candidatos são obrigatórios");
    }

    // Verificar empresa e créditos
    const empresa = await this.empresaRepository.findById(empresaId);

    if (!empresa || empresa.status !== "ativo") {
      throw new Error("Empresa não encontrada ou inativa");
    }

    const creditosNecessarios = candidatos.length;

    if (empresa.creditos < creditosNecessarios) {
      throw new Error(
        `Créditos insuficientes. Necessário: ${creditosNecessarios}, Disponível: ${empresa.creditos}`
      );
    }

    const campanhaId = uuidv4();
    const session = await this.empresaRepository.startSession();

    try {
      await session.startTransaction();

      // Validar e processar candidatos
      const candidatosValidados = [];
      const candidatosErro = [];

      for (const candidato of candidatos) {
        try {
          // Validar CPF
          const cpfLimpo = CPFValidator.validarOuLancarErro(candidato.cpf);

          // Verificar duplicata
          const existe = await this.candidatoRepository.findByEmailAndCpf(
            candidato.email,
            cpfLimpo,
            empresaId
          );

          if (
            existe &&
            existe.status !== "concluido" &&
            !existe.estaExpirado()
          ) {
            candidatosErro.push({
              ...candidato,
              erro: "Candidato já possui teste ativo",
            });
            continue;
          }

          candidatosValidados.push({
            ...candidato,
            cpf: cpfLimpo,
          });
        } catch (error) {
          candidatosErro.push({
            ...candidato,
            erro: error.message,
          });
        }
      }

      if (candidatosValidados.length === 0) {
        throw new Error("Nenhum candidato válido na campanha");
      }

      // Deduzir créditos
      await this.empresaRepository.updateCreditos(
        empresaId,
        -candidatosValidados.length,
        {
          session,
          tipo: "uso",
          acao: "criar_campanha",
          descricao: `Campanha: ${nomeCampanha} (${candidatosValidados.length} candidatos)`,
          ip: metadata.ip,
          userAgent: metadata.userAgent,
        }
      );

      // Criar candidatos e gerar testes
      const testesGerados = [];

      for (const candidato of candidatosValidados) {
        const testeId = uuidv4();

        const candidatoCriado = await this.candidatoRepository.save({
          nome: candidato.nome,
          email: candidato.email.toLowerCase(),
          cpf: candidato.cpf,
          empresaId,
          testeId,
          campanhaId,
          status: "pendente",
          dataExpiracao:
            dataExpiracao || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          metadata: {
            origem: "campanha",
            campanhaId,
            departamento: candidato.departamento || departamento,
            cargo: candidato.cargo,
            observacoes: candidato.observacoes,
          },
        });

        // Gerar token
        const token = jwt.sign(
          {
            testeId,
            email: candidatoCriado.email,
            empresaId,
            candidatoId: candidatoCriado._id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        const linkTeste = `${process.env.FRONTEND_URL}/teste/${testeId}?token=${token}`;

        // Gerar QR Code se solicitado
        let qrCode = null;
        if (gerarQRCode) {
          qrCode = await QRCode.toDataURL(linkTeste);
        }

        testesGerados.push({
          candidatoId: candidatoCriado._id,
          testeId,
          token,
          linkTeste,
          qrCode,
          candidato: {
            nome: candidato.nome,
            email: candidato.email,
            cpf: CPFValidator.formatar(candidato.cpf),
          },
        });

        // Enviar email se solicitado
        if (enviarEmail && this.emailService) {
          try {
            await this.emailService.enviarConviteTeste({
              nome: candidato.nome,
              email: candidato.email,
              linkTeste,
              nomeCampanha,
              nomeEmpresa: empresa.nome,
              dataExpiracao: candidatoCriado.dataExpiracao,
              instrucoes,
            });
          } catch (emailError) {
            console.error("Erro ao enviar email:", emailError);
          }
        }
      }

      // Criar registro da campanha
      const campanha = await this.campanhaRepository.save({
        id: campanhaId,
        empresaId,
        nome: nomeCampanha,
        departamento,
        instrucoes,
        dataExpiracao,
        status: "ativa",
        totalCandidatos: candidatosValidados.length,
        candidatosConcluidos: 0,
        candidatosPendentes: candidatosValidados.length,
        configuracoes: {
          enviarEmail,
          gerarQRCode,
          lembretes: dadosCampanha.lembretes || "none",
        },
        metadata: {
          criadoPor: metadata.usuarioId,
          ip: metadata.ip,
        },
      });

      await session.commitTransaction();

      return {
        campanhaId,
        campanha: {
          id: campanhaId,
          nome: nomeCampanha,
          status: "ativa",
          totalCandidatos: candidatosValidados.length,
          creditosUsados: candidatosValidados.length,
        },
        testesGerados,
        candidatosErro,
        resumo: {
          total: candidatos.length,
          sucesso: candidatosValidados.length,
          erro: candidatosErro.length,
          creditosRestantes: empresa.creditos - candidatosValidados.length,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = {
  CriarCampanhaUseCase,
};
