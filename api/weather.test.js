const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const handler = require('./weather');

const originalFetch = global.fetch;
const originalApiKey = process.env.OPENWEATHER_API_KEY;

function createResponse() {
  const headers = {};
  return {
    headers,
    statusCode: null,
    body: null,
    setHeader(name, value) {
      headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

afterEach(() => {
  global.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env.OPENWEATHER_API_KEY;
  } else {
    process.env.OPENWEATHER_API_KEY = originalApiKey;
  }
});

test('rejects out-of-range coordinates without calling the upstream API', async () => {
  let fetchCalled = false;
  process.env.OPENWEATHER_API_KEY = 'test-key';
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error('fetch should not be called');
  };
  const res = createResponse();

  await handler({ method: 'GET', query: { lat: '999', lon: '0' } }, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Parâmetros de busca inválidos.' });
  assert.equal(fetchCalled, false);
});

test('rejects unsupported methods', async () => {
  const res = createResponse();

  await handler({ method: 'POST', query: {} }, res);

  assert.equal(res.statusCode, 405);
});

test('returns a generic server error when the API key is missing', async () => {
  let fetchCalled = false;
  delete process.env.OPENWEATHER_API_KEY;
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error('fetch should not be called');
  };
  const res = createResponse();

  await handler({ method: 'GET', query: { city: 'São Paulo' } }, res);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Serviço de clima indisponível no momento.' });
  assert.equal(fetchCalled, false);
});

test('queries the upstream API with valid city parameters', async () => {
  process.env.OPENWEATHER_API_KEY = 'test-key';
  const weatherData = { name: 'São Paulo' };
  let requestedUrl;
  global.fetch = async (url) => {
    requestedUrl = new URL(url);
    return { ok: true, json: async () => weatherData };
  };
  const res = createResponse();

  await handler(
    { method: 'GET', query: { city: ' São Paulo ', type: 'forecast', units: 'imperial', lang: 'en' } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, weatherData);
  assert.equal(requestedUrl.pathname, '/data/2.5/forecast');
  assert.equal(requestedUrl.searchParams.get('q'), 'São Paulo');
  assert.equal(requestedUrl.searchParams.get('units'), 'imperial');
  assert.equal(requestedUrl.searchParams.get('lang'), 'en');
  assert.equal(requestedUrl.searchParams.get('appid'), 'test-key');
  assert.equal(res.headers['Cache-Control'], 'public, max-age=180, s-maxage=600, stale-while-revalidate=120');
});

test('queries the upstream API with valid coordinate parameters', async () => {
  process.env.OPENWEATHER_API_KEY = 'test-key';
  let requestedUrl;
  global.fetch = async (url) => {
    requestedUrl = new URL(url);
    return { ok: true, json: async () => ({ coord: { lat: -23.55, lon: -46.63 } }) };
  };
  const res = createResponse();

  await handler(
    { method: 'GET', query: { lat: '-23.55', lon: '-46.63', type: 'weather' } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(requestedUrl.pathname, '/data/2.5/weather');
  assert.equal(requestedUrl.searchParams.get('lat'), '-23.55');
  assert.equal(requestedUrl.searchParams.get('lon'), '-46.63');
});

test('rejects invalid query options without calling the upstream API', async () => {
  let fetchCalled = false;
  process.env.OPENWEATHER_API_KEY = 'test-key';
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error('fetch should not be called');
  };
  const invalidQueries = [
    {},
    { city: 'São Paulo', type: 'other' },
    { city: 'São Paulo', units: 'kelvin' },
    { city: 'São Paulo', lang: 'fr' },
    { city: 'x'.repeat(101) }
  ];

  for (const query of invalidQueries) {
    const res = createResponse();
    await handler({ method: 'GET', query }, res);
    assert.equal(res.statusCode, 400);
  }

  assert.equal(fetchCalled, false);
});

test('does not expose upstream error details', async () => {
  process.env.OPENWEATHER_API_KEY = 'test-key';
  global.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ message: 'secret upstream details' })
  });
  const res = createResponse();

  await handler({ method: 'GET', query: { city: 'São Paulo' } }, res);

  assert.equal(res.statusCode, 502);
  assert.deepEqual(res.body, { error: 'Serviço de clima indisponível no momento.' });
  assert.equal(JSON.stringify(res.body).includes('secret upstream details'), false);
});

test('preserves upstream 404 as a generic not-found response', async () => {
  process.env.OPENWEATHER_API_KEY = 'test-key';
  global.fetch = async () => ({
    ok: false,
    status: 404,
    json: async () => ({ message: 'upstream details' })
  });
  const res = createResponse();

  await handler({ method: 'GET', query: { city: 'Unknown City' } }, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { error: 'Cidade ou localização não encontrada.' });
});

test('maps upstream server errors to a generic bad-gateway response', async () => {
  process.env.OPENWEATHER_API_KEY = 'test-key';
  global.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ message: 'upstream infrastructure details' })
  });
  const res = createResponse();

  await handler({ method: 'GET', query: { city: 'São Paulo' } }, res);

  assert.equal(res.statusCode, 502);
  assert.deepEqual(res.body, { error: 'Serviço de clima indisponível no momento.' });
  assert.equal(JSON.stringify(res.body).includes('upstream infrastructure details'), false);
});
