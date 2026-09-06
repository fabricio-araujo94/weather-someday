# Weather Someday

Aplicação web de previsão do tempo com interface moderna, responsiva e dinâmica. Exibe o clima atual, previsão para 5 dias e gráfico de temperatura horária, utilizando a API do OpenWeatherMap. O tema visual muda automaticamente conforme as condições meteorológicas (céu limpo, chuva, neblina, etc.).

## Funcionalidades

- **Clima atual**: Temperatura, sensação térmica, mínima/máxima, umidade, vento, pressão atmosférica e visibilidade
- **Previsão para 5 dias**: Temperaturas mínimas e máximas com barra de comparação visual e probabilidade de chuva
- **Gráfico de temperatura horária**: Próximas 24 horas renderizadas com Chart.js
- **Geolocalização**: Localiza o usuário automaticamente via GPS do navegador
- **Busca por cidade**: Pesquisa por nome com campo de texto no cabeçalho
- **Temas dinâmicos**: Paleta de cores muda automaticamente de acordo com a condição e período do dia
- **Relógio e data em tempo real**: Exibidos no cabeçalho
- **Estados de carregamento**: Skeleton screens enquanto os dados são carregados
- **Tratamento de erros**: Banner amigável com opção de tentar novamente
- **Design glassmorphism**: Painéis com efeito de vidro fosco (backdrop-filter)
- **Totalmente responsivo**: Layout adaptável para desktop, tablet e mobile

## Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [Angular](https://angular.dev/) | ^22.1 | Framework frontend (standalone components, signals) |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 | Tipagem estática |
| [SCSS](https://sass-lang.com/) | — | Estilização |
| [Chart.js](https://www.chartjs.org/) + [ng2-charts](https://www.ng-charts.org/) | ^4.5 / ^10.0 | Gráficos |
| [Vitest](https://vitest.dev/) | ^4.0 | Testes unitários |
| [Prettier](https://prettier.io/) | ^3.8 | Formatação de código |
| [Vercel](https://vercel.com/) | — | Hospedagem e funções serverless |
| [OpenWeatherMap API](https://openweathermap.org/api) | — | Dados meteorológicos |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ (recomenda-se a versão LTS)
- npm 11+ (ou equivalente: yarn, pnpm)
- Chave de API do OpenWeatherMap ([obter gratuitamente](https://openweathermap.org/api))

## Instalação e Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/weather-someday.git
cd weather-someday

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de ambiente para desenvolvimento
#    O arquivo .gitignore já exclui src/environments/, então crie localmente:
cat > src/environments/environment.development.ts << 'EOF'
export const environment = {
  production: false,
  weatherApiKey: '',
  apiUrl: 'https://api.openweathermap.org/data/2.5'
};
EOF

# 4. Crie o arquivo .env.local na raiz do projeto (para deploy na Vercel)
echo "OPENWEATHER_API_KEY=sua_chave_aqui" > .env.local
```

## Variáveis de Ambiente

| Variável | Onde usar | Descrição |
|---|---|---|
| `OPENWEATHER_API_KEY` | Vercel (serverless function) | Chave de autenticação da API OpenWeatherMap |

> **Nota:** A variável `weatherApiKey` nos arquivos `src/environments/environment.ts` e `environment.development.ts` está reservada para uso futuro. Atualmente, a chave é lida exclusivamente pela function serverless em `api/weather.js` via `process.env.OPENWEATHER_API_KEY`. Não exponha chaves de API no código-fonte.

## Executando o Projeto

### Desenvolvimento

```bash
npm start
# ou
ng serve
```

O servidor de desenvolvimento inicia em `http://localhost:4200/`. A aplicação recarrega automaticamente ao salvar alterações nos arquivos-fonte.

### Build de Produção

```bash
ng build --configuration production
```

Os artefatos são gerados no diretório `dist/weather-someday/`. A build de produção inclui otimizações de performance, minificação e hashing de arquivos.

### Executar Testes

```bash
ng test
```

Executa os testes unitários com o Vitest. Os arquivos de teste seguem o padrão `*.spec.ts`.

## Estrutura do Projeto

```
weather-someday/
├── api/
│   └── weather.js              # Function serverless (Vercel) — proxy da OpenWeatherMap API
├── public/
│   └── favicon.ico             # Ícone do site
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── current-weather/ # Card principal — clima atual, dados detalhados e widget solar
│   │   │   ├── forecast-days/   # Previsão diária para 5 dias com barras de temperatura
│   │   │   ├── header/          # Cabeçalho sticky — logo, busca, geolocalização e relógio
│   │   │   ├── hourly-chart/    # Gráfico de linha — temperatura nas próximas 24h
│   │   │   └── weather-icon/    # Ícones SVG animados para cada condição meteorológica
│   │   ├── core/
│   │   │   ├── interfaces/      # Interfaces TypeScript (WeatherData, ForecastData)
│   │   │   └── services/        # WeatherService — comunicação com a API via HTTP
│   │   ├── app.ts               # Componente raiz — orquestra dados, temas e layout
│   │   ├── app.html             # Template principal
│   │   ├── app.scss             # Estilos do componente raiz
│   │   ├── app.routes.ts        # Rotas (SPA monopágina — sem rotas definidas)
│   │   ├── app.config.ts        # Configuração da aplicação (providers, locale pt-BR)
│   │   └── app.spec.ts          # Testes do componente raiz
│   ├── environments/
│   │   ├── environment.ts           # Ambiente de produção
│   │   └── environment.development.ts # Ambiente de desenvolvimento
│   ├── index.html               # Ponto de entrada HTML
│   ├── main.ts                  # Bootstrap da aplicação
│   └── styles.scss              # Estilos globais, temas dinâmicos e utilitários
├── angular.json                 # Configuração do Angular CLI
├── tsconfig.json                # Configuração base do TypeScript
├── tsconfig.app.json            # Configuração do TypeScript para a aplicação
├── tsconfig.spec.json           # Configuração do TypeScript para testes
├── .prettierrc                  # Configuração do Prettier
├── .editorconfig                # Configuração do editor
└── package.json                 # Dependências e scripts
```

## API Serverless

A aplicação utiliza uma function serverless em `api/weather.js` como proxy para a API do OpenWeatherMap. Isso mantém a chave de API segura no lado do servidor.

**Endpoints suportados (GET):**

```
/api/weather?city=São Paulo&type=weather
/api/weather?city=São Paulo&type=forecast
/api/weather?lat=-23.55&lon=-46.63&type=weather
/api/weather?lat=-23.55&lon=-46.63&type=forecast
```

**Parâmetros:**

| Parâmetro | Obrigatório | Padrão | Descrição |
|---|---|---|---|
| `city` | Sim* | — | Nome da cidade |
| `lat` | Sim* | — | Latitude |
| `lon` | Sim* | — | Longitude |
| `type` | Não | `weather` | Tipo de consulta: `weather` ou `forecast` |
| `units` | Não | `metric` | Unidades de temperatura |
| `lang` | Não | `pt_br` | Idioma da resposta |

> *Informe `city` **ou** `lat` + `lon`.

**Cache:** As respostas são cacheadas por 10 minutos (`s-maxage=600`) com revalidação em segundo plano (`stale-while-revalidate=120`).

## Deploy

O projeto está configurado para deploy na [Vercel](https://vercel.com):

1. Conecte o repositório à Vercel
2. Configure a variável de ambiente `OPENWEATHER_API_KEY` no painel da Vercel
3. O deploy é automatizado a cada push na branch principal

A Vercel detecta automaticamente o Angular como framework e executa `ng build --configuration production`. As functions serverless em `api/` são deployadas sem configuração adicional.

## Observações

- **Locale:** A aplicação está configurada para `pt-BR` (português brasileiro). Datas, números e textos são exibidos neste idioma.
- **Geolocalização:** O navegador solicita permissão ao usuário. Caso negada, a aplicação faz fallback para São Paulo automaticamente.
- **API Key:** A chave da OpenWeatherMap é necessária para o funcionamento. Planos gratuitos da API permitem até 1.000 chamadas/dia.
- **Testes:** Utiliza Vitest (não Jasmine/Karma). Execute com `ng test`.
- **Componentes standalone:** Todos os componentes Angular usam a arquitetura standalone (sem módulos NgModule).
- **Signals:** O estado reativo é gerenciado com signals do Angular (não RxJS para estado de componentes).
