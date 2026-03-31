# App Service Work

Documentacao tecnica do projeto, com foco em autenticacao, arquitetura e contrato de integracao para frontend.

## Comece por aqui
- Visao geral: [docs/00-visao-geral.md](docs/00-visao-geral.md)
- API de Auth (rotas, contratos e exemplos): [docs/01-guia-api.md](docs/01-guia-api.md)
- Banco, migrations e troca para Postgres: [docs/02-arquitetura-banco.md](docs/02-arquitetura-banco.md)

## Quick start
```bash
npm install
npm run start:dev
```

API local:
- `http://localhost:3000`

## Endpoints atuais
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

## Scripts importantes
```bash
npm run build
npm run test:e2e
npm run migration:run
npm run migration:revert
```

## Stack
- NestJS
- TypeORM
- SQLite em memoria (padrao)
- JWT access + refresh token com rotacao

## Nota
Se voce esta construindo o frontend, comece por [docs/01-guia-api.md](docs/01-guia-api.md), onde estao os contratos de request/response e exemplos de uso com fetch.
