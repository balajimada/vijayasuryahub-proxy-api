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

const createGithubDeviceCode = async ({ client_id, scope }) => {
  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id, scope })
  });

  const data = await response.json();
  return { status: response.status, data };
};

app.post('/', async (req, res) => {
  const clientId = req.body.client_id || process.env.GITHUB_CLIENT_ID;
  const scope = req.body.scope || 'repo user';

  if (!clientId) {
    return res.status(400).json({ error: 'Missing GitHub client_id' });
  }

  const { status, data } = await createGithubDeviceCode({ client_id: clientId, scope });
  res.status(status).json(data);
});

app.get('/', async (req, res) => {
  const clientId = req.query.client_id || process.env.GITHUB_CLIENT_ID;
  const scope = req.query.scope || 'repo user';

  if (!clientId) {
    return res.status(400).json({ error: 'Missing GitHub client_id' });
  }

  const { status, data } = await createGithubDeviceCode({ client_id: clientId, scope });
  res.status(status).json(data);
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

module.exports = app;
