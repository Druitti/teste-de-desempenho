# Testes de Desempenho com k6 - Projeto de Checkout E-commerce

## Descrição
Este projeto contém uma suíte completa de testes de performance para uma API de Checkout de e-commerce, realizados com a ferramenta **k6**. O objetivo é identificar os limites de performance da aplicação em diferentes cenários: I/O-Bound e CPU-Bound.

## Estrutura do Projeto

```
.
├── src/
│   └── server.js              # API de Checkout (SUT - System Under Test)
├── tests/
│   ├── smoke.js               # Teste de Smoke - Verifica disponibilidade
│   ├── load.js                # Teste de Carga - 50 usuários simultâneos
│   ├── stress.js              # Teste de Estresse - Até 1000 usuários
│   └── spike.js               # Teste de Pico - Simulação de Flash Sale
├── RELATORIO_TECNICO.pdf      # Relatório com resultados dos testes
├── package.json
└── README.md
```

## Endpoints da API

### GET /health
- **Descrição**: Health check da aplicação
- **Tipo**: Rápido e leve
- **Uso**: Verificação de disponibilidade

### POST /checkout/simple
- **Descrição**: Operação de checkout com simula I/O (banco de dados)
- **Tipo**: I/O-Bound (~100-300ms)
- **Payload**: JSON com dados do carrinho

### POST /checkout/crypto
- **Descrição**: Operação de checkout com criptografia (bcrypt)
- **Tipo**: CPU-Bound (pesado em processamento)
- **Payload**: JSON com dados da transação

## Instalação e Execução

### Pré-requisitos
- Node.js (v14 ou superior)
- k6 (v1.4.1 ou superior)

### Instalação
```bash
# 1. Instalar dependências da API
npm install

# 2. Instalar k6 (se ainda não tiver)
# Windows (com Chocolatey):
choco install k6

# Linux (Ubuntu/Debian):
sudo apt-get install k6

# macOS:
brew install k6
```

### Executar a API
```bash
npm start
```
A API será iniciada em `http://localhost:3000`

### Executar os Testes

#### 1. Smoke Test (rápido)
```bash
k6 run tests/smoke.js
```
- **Duração**: ~1 minuto
- **Objetivo**: Verificar se a API está disponível

#### 2. Load Test (carga normal)
```bash
k6 run tests/load.js
```
- **Duração**: ~4 minutos
- **Objetivo**: Testar com 50 usuários simultâneos (cenário I/O)

#### 3. Stress Test (estresse extremo)
```bash
k6 run tests/stress.js
```
- **Duração**: ~6 minutos
- **Objetivo**: Encontrar ponto de ruptura (até 1000 usuários, CPU-Bound)

#### 4. Spike Test (pico súbito)
```bash
k6 run tests/spike.js
```
- **Duração**: ~2 minutos
- **Objetivo**: Simular Flash Sale com salto súbito de tráfego

## Resultados dos Testes

### Resumo Executivo

| Cenário | Capacidade | Status | Detalhes |
|---------|-----------|--------|----------|
| **I/O (/simple)** | 50+ VUsers | ✓ PASSOU | p95=296.82ms, erro=0%, SLA atendido |
| **CPU (/crypto)** | ~400-500 VUsers | ⚠ LIMITED | Ponto de ruptura: ~600 VUsers |

### Métricas Principais

#### Teste de Carga (I/O)
- Requisições: 6,828
- Taxa de Sucesso: 100%
- Latência Média: 205.76ms
- p95: 296.82ms (< 500ms ✓)
- Taxa de Erro: 0%

#### Teste de Estresse (CPU)
- Requisições: 1,615,870
- Fase 1 (0-200 VU): ✓ OK
- Fase 2 (200-500 VU): ⚠ Degradação
- Fase 3 (500-1000 VU): ✗ Falha total
- Ponto de Ruptura: ~600 VUsers

## Análise e Recomendações

### Para Operações I/O (/checkout/simple)
✓ **Muito Bem**: A API suporta 50+ usuários sem degradação significativa.
- Manter monitoramento de SLA (p95 < 500ms)
- Usar ferramentas como Grafana/Prometheus para produção
- Capacidade demonstrada é suficiente para picos de promoção

### Para Operações CPU (/checkout/crypto)
⚠ **Ponto de Atenção**: Limites de CPU identificados a ~600 usuários.

**Recomendações de Otimização:**
1. **Cache de Hashes**: Implementar caching de resultados de bcrypt para transações similares
2. **Processamento Assíncrono**: Usar filas (Bull, RabbitMQ) para desacoplar o processamento
3. **Worker Threads**: Utilizar worker threads do Node.js para paralelizar cálculos pesados
4. **Aumentar Recursos**: Scale-up: mais CPU cores no servidor
5. **Rate Limiting**: Implementar circuit breaker e rate limiting para evitar sobrecarga
6. **Máximo Recomendado**: Limitar a ~400-500 VUsers simultâneos para operações criptográficas

## Configuração dos SLAs

### Smoke Test
- p95 latência < 200ms
- Taxa de erro < 1%
- Taxa de sucesso > 99%

### Load Test
- p95 latência < 500ms
- Taxa de erro < 1%
- Taxa de sucesso > 99%

### Stress Test
- p95 latência < 2000ms (mais leniente)
- Taxa de erro < 10%
- Taxa de sucesso > 90%

### Spike Test
- p95 latência < 1000ms
- Taxa de erro < 5%
- Taxa de sucesso > 95%

## Interpretação das Métricas

### Latência (p95)
- **Mediana**: 50% das requisições respondem em menos desse tempo
- **p95**: 95% das requisições respondem em menos desse tempo
- **p99**: 99% das requisições respondem em menos desse tempo

### Throughput
- Número de requisições processadas por segundo
- Indicador de eficiência da aplicação

### Taxa de Erro
- Percentual de requisições que falharam
- Incluir timeouts e erros de servidor

## Ferramentas Utilizadas

- **k6**: Framework de teste de load em Go
- **Node.js**: Runtime para execução da API
- **Express.js**: Framework web
- **bcryptjs**: Biblioteca de criptografia (simulação de carga CPU)

## Próximos Passos

1. Implementar melhorias baseadas nas recomendações
2. Re-executar testes após otimizações
3. Monitorar performance em produção
4. Estabelecer baseline de performance
5. Criar alertas para degradação de performance

## Referências

- [k6 Documentation](https://k6.io/docs/)
- [API Testing with k6](https://k6.io/blog/)
- [Node.js Performance](https://nodejs.org/en/docs/guides/nodejs-performance-best-practices/)

## Autor

Engenharia de Performance - Testes de Software

## Data

Novembro de 2025

---

**Nota**: Este é um projeto educacional para fins de demonstração de engenharia de performance. 
Os testes devem ser adaptados conforme a realidade de produção.
