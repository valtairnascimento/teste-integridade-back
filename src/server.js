const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const InMemoryPerguntaRepository = require('./infrastructure/repositories/InMemoryPerguntaRepository');
const InMemoryUsuarioRepository = require('./infrastructure/repositories/InMemoryUsuarioRepository');
const GerarTesteUseCase = require('./domain/useCases/GerarTesteUseCase');
const CalcularComprometimentoUseCase = require('./domain/useCases/CalcularComprometimentoUseCase');
const RegistrarUsuarioUseCase = require('./domain/useCases/RegistrarUsuarioUseCase');
const AutenticarUsuarioUseCase = require('./domain/useCases/AutenticarUsuarioUseCase');
const InMemoryCandidatoRepository = require('./infrastructure/repositories/InMemoryCandidatoRepository');
const CadastrarCandidatoUseCase = require('./domain/useCases/CadastrarCandidatoUseCase');
const candidatoRoutes = require('./presentation/routes/candidatoRoutes');
const testeRoutes = require('./presentation/routes/testeRoutes');
const usuarioRoutes = require('./presentation/routes/usuarioRoutes');
const authMiddleware = require('./presentation/middlewares/auth');
const ValidarCandidatoUseCase = require('./domain/useCases/ValidarCandidatoUseCase');
const validarCandidatoRoutes = require('./presentation/routes/validarCandidatoRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const perguntaRepository = new InMemoryPerguntaRepository();
const usuarioRepository = new InMemoryUsuarioRepository();
const candidatoRepository = new InMemoryCandidatoRepository();
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepository);
const autenticarUsuarioUseCase = new AutenticarUsuarioUseCase(usuarioRepository);
const gerarTesteUseCase = new GerarTesteUseCase(perguntaRepository, candidatoRepository, usuarioRepository);
const calcularComprometimentoUseCase = new CalcularComprometimentoUseCase(perguntaRepository);
const cadastrarCandidatoUseCase = new CadastrarCandidatoUseCase(candidatoRepository, usuarioRepository);
const validarCandidatoUseCase = new ValidarCandidatoUseCase(candidatoRepository);

app.use('/api', usuarioRoutes(registrarUsuarioUseCase));
app.use('/api', testeRoutes(gerarTesteUseCase, calcularComprometimentoUseCase));
app.use('/api', candidatoRoutes(cadastrarCandidatoUseCase));
app.use('/api', validarCandidatoRoutes(validarCandidatoUseCase));

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