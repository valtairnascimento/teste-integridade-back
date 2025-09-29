const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./infrastructure/config/database');
const MongoUsuarioRepository = require('./infrastructure/repositories/MongoUsuarioRepository');
const MongoCandidatoRepository = require('./infrastructure/repositories/MongoCandidatoRepository');
const MongoRespostaRepository = require('./infrastructure/repositories/MongoRespostaRepository');
const InMemoryPerguntaRepository = require('./infrastructure/repositories/InMemoryPerguntaRepository');
const GerarTesteUseCase = require('./domain/useCases/GerarTesteUseCase');
const CalcularComprometimentoUseCase = require('./domain/useCases/CalcularComprometimentoUseCase');
const RegistrarUsuarioUseCase = require('./domain/useCases/RegistrarUsuarioUseCase');
const AutenticarUsuarioUseCase = require('./domain/useCases/AutenticarUsuarioUseCase');
const ValidarCandidatoUseCase = require('./domain/useCases/ValidarCandidatoUseCase');
const VisualizarResultadosUseCase = require('./domain/useCases/VisualizarResultadosUseCase');
const ComprarCreditosUseCase = require('./domain/useCases/ComprarCreditosUseCase');
const validarCandidatoRoutes = require('./presentation/routes/validarCandidatoRoutes');
const testeRoutes = require('./presentation/routes/testeRoutes');
const usuarioRoutes = require('./presentation/routes/usuarioRoutes');
const resultadoRoutes = require('./presentation/routes/resultadoRoutes');
const comprarCreditosRoutes = require('./presentation/routes/comprarCreditosRoutes');
const authMiddleware = require('./presentation/middlewares/auth');

dotenv.config();

// Conectar ao MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const perguntaRepository = new InMemoryPerguntaRepository();
const usuarioRepository = new MongoUsuarioRepository();
const candidatoRepository = new MongoCandidatoRepository();
const respostaRepository = new MongoRespostaRepository();
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepository);
const autenticarUsuarioUseCase = new AutenticarUsuarioUseCase(usuarioRepository);
const gerarTesteUseCase = new GerarTesteUseCase(perguntaRepository, candidatoRepository, usuarioRepository);
const calcularComprometimentoUseCase = new CalcularComprometimentoUseCase(perguntaRepository, respostaRepository, candidatoRepository);
const validarCandidatoUseCase = new ValidarCandidatoUseCase(candidatoRepository);
const visualizarResultadosUseCase = new VisualizarResultadosUseCase(respostaRepository);
const comprarCreditosUseCase = new ComprarCreditosUseCase(usuarioRepository);

app.use('/api', usuarioRoutes(registrarUsuarioUseCase));
app.use('/api', testeRoutes(gerarTesteUseCase, calcularComprometimentoUseCase));
app.use('/api', validarCandidatoRoutes(validarCandidatoUseCase));
app.use('/api', resultadoRoutes(visualizarResultadosUseCase));
app.use('/api', comprarCreditosRoutes(comprarCreditosUseCase));

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const { token, id } = await autenticarUsuarioUseCase.execute(email, senha);
    res.json({ token, id });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));