import { ApiReference } from '@scalar/nextjs-api-reference';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'https://api.hyrelog.com';
const specUrl = `${apiBaseUrl}/openapi.json`;

export const GET = ApiReference({
  url: specUrl,
  pageTitle: 'HyreLog API Reference',
});
