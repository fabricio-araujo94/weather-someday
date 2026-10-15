module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método não permitido. Use GET.' });
    }

    const query = req.query || {};
    const { city, lat, lon } = query;
    const type = query.type === undefined ? 'weather' : query.type;
    const units = query.units === undefined ? 'metric' : query.units;
    const lang = query.lang === undefined ? 'pt_br' : query.lang;

    const cityProvided = city !== undefined;
    const coordsProvided = lat !== undefined || lon !== undefined;
    const validCity =
      typeof city === 'string' && city.trim().length > 0 && city.trim().length <= 100;
    const validCoordinates =
      typeof lat === 'string' &&
      lat.trim().length > 0 &&
      Number.isFinite(Number(lat)) &&
      Number(lat) >= -90 &&
      Number(lat) <= 90 &&
      typeof lon === 'string' &&
      lon.trim().length > 0 &&
      Number.isFinite(Number(lon)) &&
      Number(lon) >= -180 &&
      Number(lon) <= 180;

    if (
      (cityProvided && (coordsProvided || !validCity)) ||
      (!cityProvided && (!coordsProvided || !validCoordinates)) ||
      !['weather', 'forecast'].includes(type) ||
      !['metric', 'imperial', 'standard'].includes(units) ||
      !['pt_br', 'en', 'es'].includes(lang)
    ) {
      return res.status(400).json({
        error: 'Parâmetros de busca inválidos.'
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY não está configurada.');
      return res.status(500).json({
        error: 'Serviço de clima indisponível no momento.'
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
      searchParams.set('q', city.trim());
    } else {
      searchParams.set('lat', lat.trim());
      searchParams.set('lon', lon.trim());
    }

    const upstreamResponse = await fetch(`${baseUrl}?${searchParams.toString()}`);

    if (!upstreamResponse.ok) {
      const status = upstreamResponse.status === 404 ? 404 : 502;
      const error =
        status === 404
          ? 'Cidade ou localização não encontrada.'
          : 'Serviço de clima indisponível no momento.';
      return res.status(status).json({ error });
    }

    let data;
    try {
      data = await upstreamResponse.json();
    } catch {
      console.error('Resposta inválida recebida do serviço de clima.');
      return res.status(502).json({
        error: 'Serviço de clima indisponível no momento.'
      });
    }

    res.setHeader('Cache-Control', 'public, max-age=180, s-maxage=600, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch {
    console.error('Falha ao consultar o serviço de clima.');
    return res.status(500).json({
      error: 'Serviço de clima indisponível no momento.'
    });
  }
};
