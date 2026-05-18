# GitHub Device Code Proxy

This repository hosts a small Node.js/Express API for Vercel that proxies requests to GitHub's device authorization endpoint.

## Endpoint

- `GET /api/github-device-code`
- `POST /api/github-device-code`

Both endpoints forward incoming client ID and scope values to `https://github.com/login/device/code`.

## Local usage

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

## Example request

```bash
curl -X POST https://your-vercel-app.vercel.app/api/github-device-code \
  -H 'Content-Type: application/json' \
  -d '{"client_id":"YOUR_CLIENT_ID","scope":"repo user"}'
```

## Environment

You can set `GITHUB_CLIENT_ID` in Vercel environment variables so the endpoint works without a request body.
