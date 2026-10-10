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
