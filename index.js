const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const parseGithubDeviceCodeBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const payload = await response.text();
  return Object.fromEntries(new URLSearchParams(payload).entries());
};

const createGithubDeviceCode = async ({ client_id, scope }) => {
  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ client_id, scope }).toString()
  });

  const data = await parseGithubDeviceCodeBody(response);
  return { status: response.status, data };
};

const handleDeviceCodeRequest = async (req, res, getParams) => {
  try {
    const { client_id: clientId, scope } = getParams(req);
    const scopeValue = scope || 'repo user';

    if (!clientId) {
      return res.status(400).json({ error: 'Missing GitHub client_id' });
    }

    const { status, data } = await createGithubDeviceCode({
      client_id: clientId,
      scope: scopeValue
    });
    res.status(status).json(data);
  } catch (err) {
    console.error('GitHub device code proxy error:', err);
    res.status(502).json({ error: 'Failed to reach GitHub device code endpoint' });
  }
};

app.post('/', (req, res) =>
  handleDeviceCodeRequest(req, res, (r) => ({
    client_id: r.body.client_id || process.env.GITHUB_CLIENT_ID,
    scope: r.body.scope
  }))
);

app.get('/', (req, res) =>
  handleDeviceCodeRequest(req, res, (r) => ({
    client_id: r.query.client_id || process.env.GITHUB_CLIENT_ID,
    scope: r.query.scope
  }))
);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

module.exports = app;
