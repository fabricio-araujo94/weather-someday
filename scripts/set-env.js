const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../src/environments/environment.ts');

// Lê a variável de ambiente configurada na Vercel (ou outras convenções comuns)
const apiKey =
  process.env.WEATHER_API_KEY ||
  process.env.OPENWEATHER_API_KEY ||
  process.env.API_KEY ||
  '';

const apiUrl = process.env.API_URL || 'https://api.openweathermap.org/data/2.5';

const envConfigFile = `export const environment = {
  production: true,
  weatherApiKey: '${apiKey}',
  apiUrl: '${apiUrl}'
};
`;

const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(targetPath, envConfigFile, { encoding: 'utf8' });
console.log(`[set-env] Arquivo environment.ts gerado com sucesso!`);
