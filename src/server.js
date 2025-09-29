const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const InMemoryPerguntaRepository = require('./infrastructure/repositories/InMemoryPerguntaRepository');
const GerarTesteUseCase = require('./domain/useCases/GerarTesteUseCase');
const CalcularComprometimentoUseCase = require('./domain/useCases/CalcularComprometimentoUseCase');
const testeRoutes = require('./presentation/routes/testeRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const perguntaRepository = new InMemoryPerguntaRepository();
const gerarTesteUseCase = new GerarTesteUseCase(perguntaRepository);
const calcularComprometimentoUseCase = new CalcularComprometimentoUseCase(perguntaRepository);
app.use('/api', testeRoutes(gerarTesteUseCase, calcularComprometimentoUseCase));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));