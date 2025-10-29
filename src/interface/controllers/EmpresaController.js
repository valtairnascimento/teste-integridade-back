class EmpresaController {
  constructor(registrarEmpresaUseCase, autenticarEmpresaUseCase, logger = console) {
    this.registrarEmpresaUseCase = registrarEmpresaUseCase;
    this.autenticarEmpresaUseCase = autenticarEmpresaUseCase;
    this.logger = logger;
  }

  async registrar(req, res) {
    try {
      const { email, senha, nome, cnpj } = req.body;

      this.logger.info('Tentativa de registro', { email, nome });

      const resultado = await this.registrarEmpresaUseCase.execute(
        email,
        senha,
        nome,
        cnpj
      );

      this.logger.info('Empresa registrada com sucesso', { 
        empresaId: resultado.id 
      });

      return res.status(201).json({
        success: true,
        message: 'Empresa registrada com sucesso',
        data: resultado
      });

    } catch (error) {
      this.logger.error('Erro ao registrar empresa', { 
        error: error.message,
        stack: error.stack 
      });

      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      this.logger.info('Tentativa de login', { email });

      const resultado = await this.autenticarEmpresaUseCase.execute(email, senha);

      this.logger.info('Login realizado com sucesso', { 
        empresaId: resultado.empresa.id 
      });

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: resultado
      });

    } catch (error) {
      this.logger.error('Erro ao fazer login', { 
        error: error.message 
      });

      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  async obterPerfil(req, res) {
    try {
      const empresaId = req.user.id;

      // Buscar dados atualizados da empresa
      const empresa = await this.empresaRepository.findById(empresaId);

      if (!empresa) {
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: empresa._id,
          email: empresa.email,
          nome: empresa.nome,
          cnpj: empresa.cnpj,
          creditos: empresa.creditos,
          creditosBaixos: empresa.creditosBaixos,
          status: empresa.status,
          configuracoes: empresa.configuracoes
        }
      });

    } catch (error) {
      this.logger.error('Erro ao obter perfil', { 
        error: error.message 
      });

      return res.status(500).json({
        success: false,
        error: 'Erro ao obter perfil'
      });
    }
  }
}