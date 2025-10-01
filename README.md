# Teste de Integridade

## Descrição
O **Teste de Integridade** é uma aplicação backend desenvolvida para auxiliar empresas no processo de recrutamento e avaliação de candidatos, utilizando uma metodologia baseada na Escala de Comprometimento Organizacional de Allen e Meyer (1991). A plataforma permite o registro de empresas, geração de testes personalizados, envio de respostas por candidatos, cálculo do nível de comprometimento (afetivo, normativo e continuativo) e visualização de resultados. Além disso, integra um sistema de compra de créditos via Mercado Pago para gerenciar o uso da funcionalidade de testes.

## Funcionalidades
- **Registro e Autenticação**: Empresas podem se registrar e autenticar-se com JWT.
- **Geração de Testes**: Criação de testes com perguntas baseadas em um repositório (inicialmente em memória, expansível para MongoDB).
- **Validação de Candidatos**: Verificação de candidatos antes de enviar respostas.
- **Envio de Respostas**: Candidatos enviam respostas que são processadas para calcular comprometimento.
- **Cálculo de Comprometimento**: Análise detalhada em três dimensões (afetivo, normativo, continuativo) com detecção de inconsistências.
- **Visualização de Resultados**: Empresas acessam os resultados dos candidatos.
- **Compra de Créditos**: Sistema de créditos para geração de testes, integrado ao Mercado Pago, com compra mínima de 10 créditos.

## Tecnologias Utilizadas
- **Node.js**: Ambiente de execução do servidor.
- **Express**: Framework para rotas e middlewares.
- **MongoDB**: Banco de dados NoSQL para persistência de dados.
- **Mongoose**: ORM para interação com MongoDB.
- **Mercado Pago**: Gateway de pagamento para compra de créditos.
- **JWT**: Autenticação baseada em tokens.
- **Cors**: Suporte a requisições cross-origin.

## Pré-requisitos
- Node.js (versão 18.x ou superior recomendada)
- MongoDB (local ou remoto)
- Chaves de API do Mercado Pago
- Variáveis de ambiente configuradas

## Instalação

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/teste-integridade-back.git
   cd teste-integridade-back

   Instale as dependências:
bashnpm install

Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
textMONGO_URI=sua_string_de_conexão_mongodb
JWT_SECRET=sua_chave_secreta_jwt
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_mercado_pago
PORT=3000

Inicie o servidor:
bashnpm start
Ou use nodemon para desenvolvimento:
bashnpm run dev


Estrutura do Projeto
textteste-integridade-back/
├── src/
│   ├── domain/              # Lógica de negócios (Use Cases)
│   ├── infrastructure/      # Repositórios e configuração (MongoDB, InMemory)
│   ├── presentation/        # Controllers, rotas e middlewares
│   └── server.js           # Ponto de entrada do servidor
├── .env                    # Variáveis de ambiente
├── package.json            # Dependências e scripts
└── README.md               # Este arquivo
Uso
Endpoints Principais

Registro de Empresa: POST /api/usuarios

Body: { "nome": "Empresa Teste", "email": "teste@empresa.com", "senha": "senha123" }


Login: POST /api/login

Body: { "email": "teste@empresa.com", "senha": "senha123" }
Retorno: { "token": "jwt_token", "id": "empresa_id" }


Gerar Teste: POST /api/testes (requer token e créditos)

Retorno: { "testeId": "uuid" }


Validar Candidato: POST /api/validar-candidato

Body: { "email": "candidato@teste.com", "testeId": "uuid" }


Enviar Respostas: POST /api/respostas

Body: { "testeId": "uuid", "respostas": { "perguntaId": "resposta" }, "candidatoToken": "Bearer token" }


Visualização de Resultados: GET /api/resultados (requer token)

Retorno: [{ "pontuacaoTotal": 2.33, "nivel": "Baixo", "detalhes": { ... } }]


Comprar Créditos: POST /api/comprar-creditos

Body: { "quantidade": 50 }
Retorno: { "init_point": "url_mercado_pago", "saldoAtual": 0 }



Teste com Mercado Pago

Use o modo sandbox no Painel de Desenvolvedores Mercado Pago.
Configure um webhook em /api/webhook e use ngrok (ngrok http 3000) para testes locais.
Após pagamento simulado, verifique se os créditos são atualizados.

Contribuição

Faça um fork do repositório.
Crie uma branch para sua feature: git checkout -b feature/nova-funcionalidade.
Commit suas mudanças: git commit -m "Adiciona nova funcionalidade".
Envie para o repositório: git push origin feature/nova-funcionalidade.
Abra um Pull Request.

Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
Contato

Desenvolvedor: Valtair (valtair215945@gmail.com)
Data de Criação: Setembro de 2025
Última Atualização: 01/10/2025
