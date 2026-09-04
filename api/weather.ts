import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido. Use GET.' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Configuração do servidor incompleta: OPENWEATHER_API_KEY não definida.'
    });
  }

  const { city, lat, lon, type = 'weather', units = 'metric', lang = 'pt_br' } = req.query;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({
      error: 'Parâmetro obrigatório ausente. Informe "city" ou "lat" e "lon".'
    });
  }

  const endpoint = type === 'forecast' ? 'forecast' : 'weather';
  const baseUrl = `https://api.openweathermap.org/data/2.5/${endpoint}`;

  const searchParams = new URLSearchParams({
    appid: apiKey,
    units: String(units),
    lang: String(lang)
  });

  if (city) {
    searchParams.set('q', String(city));
  } else if (lat && lon) {
    searchParams.set('lat', String(lat));
    searchParams.set('lon', String(lon));
  }

  try {
    const upstreamResponse = await fetch(`${baseUrl}?${searchParams.toString()}`);
    const data = await upstreamResponse.json();

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json(data);
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(502).json({
      error: 'Falha ao conectar com o serviço OpenWeatherMap.',
      details: error?.message || error
    });
  }
}
