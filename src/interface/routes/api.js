const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/authMiddleware');

// ============= IMPORTAR REPOSITORIES =============
const EmpresaRepository = require('../repositories/EmpresaRepository');
const CandidatoRepository = require('../repositories/CandidatoRepository');
const RespostaRepository = require('../repositories/RespostaRepository');
const PagamentoRepository = require('../repositories/PagamentoRepository');
const PerguntaRepository = require('../repositories/PerguntaRepository');

// ============= IMPORTAR USE CASES =============
const { RegistrarEmpresaUseCase } = require('../usecases/RegistrarEmpresaUseCase');
const { AutenticarEmpresaUseCase } = require('../usecases/AutenticarEmpresaUseCase');
const GerarTesteUseCase = require('../usecases/GerarTesteUseCase');
const ValidarCandidatoUseCase = require('../usecases/ValidarCandidatoUseCase');
const CalcularComprometimentoUseCase = require('../usecases/CalcularComprometimentoUseCase');
const VisualizarResultadosUseCase = require('../usecases/VisualizarResultadosUseCase');
const ComprarCreditosUseCase = require('../usecases/ComprarCreditosUseCase');

// ============= IMPORTAR CONTROLLERS =============
const EmpresaController = require('../controllers/EmpresaController');
const TesteController = require('../controllers/TesteController');
const CandidatoController = require('../controllers/CandidatoController');
const ResultadoController = require('../controllers/ResultadoController');
const CompraCreditosController = require('../controllers/CompraCreditosController');
const DashboardController = require('../controllers/DashboardController');

// ============= INSTANCIAR REPOSITORIES =============
const empresaRepository = new EmpresaRepository();
const candidatoRepository = new CandidatoRepository();
const respostaRepository = new RespostaRepository();
const pagamentoRepository = new PagamentoRepository();
const perguntaRepository = new PerguntaRepository();

// ============= INSTANCIAR USE CASES =============
const registrarEmpresaUseCase = new RegistrarEmpresaUseCase(empresaRepository);
const autenticarEmpresaUseCase = new AutenticarEmpresaUseCase(empresaRepository);
const gerarTesteUseCase = new GerarTesteUseCase(
  perguntaRepository,
  candidatoRepository,
  empresaRepository
);
const validarCandidatoUseCase = new ValidarCandidatoUseCase(candidatoRepository);
const calcularComprometimentoUseCase = new CalcularComprometimentoUseCase(
  perguntaRepository,
  respostaRepository,
  candidatoRepository
);
const visualizarResultadosUseCase = new VisualizarResultadosUseCase(
  respostaRepository,
  candidatoRepository
);
const comprarCreditosUseCase = new ComprarCreditosUseCase(empresaRepository);

// ============= INSTANCIAR CONTROLLERS =============
const empresaController = new EmpresaController(
  registrarEmpresaUseCase,
  autenticarEmpresaUseCase
);
const testeController = new TesteController(
  gerarTesteUseCase,
  calcularComprometimentoUseCase
);
const candidatoController = new CandidatoController(validarCandidatoUseCase);
const resultadoController = new ResultadoController(visualizarResultadosUseCase);
const compraCreditosController = new CompraCreditosController(comprarCreditosUseCase);
const dashboardController = new DashboardController(
  empresaRepository,
  candidatoRepository,
  respostaRepository,
  pagamentoRepository
);

// ============= ROTAS PÚBLICAS =============

// Autenticação de Empresa
router.post('/empresa/registrar', (req, res) => 
  empresaController.registrar(req, res)
);

router.post('/empresa/login', (req, res) => 
  empresaController.login(req, res)
);

// Validação de Candidato (acesso público com email/cpf)
router.post('/candidato/validar', (req, res) => 
  candidatoController.validar(req, res)
);

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

// ============= ROTAS PROTEGIDAS - EMPRESA =============

// Perfil da Empresa
router.get('/empresa/perfil',
  AuthMiddleware.autenticarEmpresa,
  (req, res) => empresaController.obterPerfil(req, res)
);

// Dashboard
router.get('/dashboard',
  AuthMiddleware.autenticarEmpresa,
  (req, res) => dashboardController.obterEstatisticas(req, res)
);

// Gestão de Testes
router.post('/teste/gerar',
  AuthMiddleware.autenticarEmpresa,
  AuthMiddleware.rateLimiter(50, 60 * 60 * 1000), // 50 req/hora
  (req, res) => testeController.gerarTeste(req, res)
);

router.get('/teste/:testeId/perguntas',
  AuthMiddleware.autenticarCandidato,
  (req, res) => testeController.obterPerguntas(req, res)
);

// Resultados
router.get('/resultados',
  AuthMiddleware.autenticarEmpresa,
  (req, res) => resultadoController.listar(req, res)
);

router.get('/resultados/:testeId',
  AuthMiddleware.autenticarEmpresa,
  (req, res) => resultadoController.obterUnico(req, res)
);

router.get('/resultados/exportar',
  AuthMiddleware.autenticarEmpresa,
  (req, res) => resultadoController.exportar(req, res)
);

// Créditos
router.post('/creditos/comprar',
  AuthMiddleware.autenticarEmpresa,
  (req, res) => compraCreditosController.comprar(req, res)
);

// ============= ROTAS PROTEGIDAS - CANDIDATO =============

// Submissão de Teste
router.post('/teste/calcular',
  AuthMiddleware.autenticarCandidato,
  AuthMiddleware.rateLimiter(10, 60 * 60 * 1000), // 10 req/hora
  (req, res) => testeController.calcularComprometimento(req, res)
);

// ============= WEBHOOK MERCADO PAGO =============
router.post('/webhook/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('Webhook recebido:', { type, data });

    // Responder imediatamente (Mercado Pago exige resposta rápida)
    res.status(200).send('OK');

    // Processar webhook assincronamente
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Verificar se já foi processado
      const jaProcessado = await pagamentoRepository.jaFoiProcessado(paymentId);
      
      if (jaProcessado) {
        console.log('Pagamento já processado:', paymentId);
        return;
      }

      // Buscar detalhes do pagamento no Mercado Pago
      const { Payment } = require('mercadopago');
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
      });
      const payment = new Payment(client);
      
      const pagamentoInfo = await payment.get({ id: paymentId });
      
      if (pagamentoInfo.status === 'approved') {
        // Extrair dados do external_reference
        const externalRef = pagamentoInfo.external_reference;
        const match = externalRef.match(/EMP-(.+?)-QTD-(\d+)-TS-(\d+)/);
        
        if (match) {
          const empresaId = match[1];
          const quantidade = parseInt(match[2]);
          
          // Adicionar créditos
          await comprarCreditosUseCase.adicionarCreditos(
            empresaId,
            quantidade,
            paymentId,
            pagamentoInfo.transaction_amount
          );
          
          // Salvar registro de pagamento
          await pagamentoRepository.save({
            empresaId,
            paymentId,
            externalReference: externalRef,
            quantidade,
            valorTotal: pagamentoInfo.transaction_amount,
            valorUnitario: pagamentoInfo.transaction_amount / quantidade,
            status: 'approved',
            metodoPagamento: pagamentoInfo.payment_method_id,
            dadosPagamento: pagamentoInfo,
            processado: true,
            dataProcessamento: new Date()
          });
          
          console.log('Créditos adicionados com sucesso:', {
            empresaId,
            quantidade,
            paymentId
          });
        }
      }
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    // Não retornar erro para não causar retry infinito
  }
});

// ============= ERRO 404 =============
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path
  });
});

module.exports = router;