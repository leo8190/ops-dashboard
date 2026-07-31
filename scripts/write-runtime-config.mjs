import { writeFileSync } from 'node:fs';

const fallbackUrl = 'http://localhost:5099';
const apiBaseUrl = process.env.ORDERFLOW_API_URL?.trim() || fallbackUrl;
const parsedUrl = new URL(apiBaseUrl);

if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
  throw new Error('ORDERFLOW_API_URL must use http or https.');
}

writeFileSync(
  new URL('../public/orderflow-config.js', import.meta.url),
  `globalThis.ORDERFLOW_CONFIG = globalThis.ORDERFLOW_CONFIG ?? {\n  apiBaseUrl: ${JSON.stringify(apiBaseUrl.replace(/\/+$/, ''))},\n};\n`,
);
