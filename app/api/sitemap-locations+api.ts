/**
 * LOCATIONS SITEMAP API
 * Alle Länder & Städte
 */

import { generateLocationsSitemap, generateXMLFromURLs, Location } from '@/lib/sitemap-2025';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Top-Locations weltweit
  const locations: Location[] = [
    {
      country: 'Deutschland',
      countryCode: 'DE',
      cities: [
        { name: 'Berlin', slug: 'berlin', lat: 52.5200, lng: 13.4050, population: 3645000 },
        { name: 'Hamburg', slug: 'hamburg', lat: 53.5511, lng: 9.9937, population: 1841000 },
        { name: 'München', slug: 'muenchen', lat: 48.1351, lng: 11.5820, population: 1472000 },
        { name: 'Köln', slug: 'koeln', lat: 50.9375, lng: 6.9603, population: 1086000 },
        { name: 'Frankfurt', slug: 'frankfurt', lat: 50.1109, lng: 8.6821, population: 753000 },
        { name: 'Stuttgart', slug: 'stuttgart', lat: 48.7758, lng: 9.1829, population: 634000 },
        { name: 'Düsseldorf', slug: 'duesseldorf', lat: 51.2277, lng: 6.7735, population: 619000 },
        { name: 'Dortmund', slug: 'dortmund', lat: 51.5136, lng: 7.4653, population: 587000 },
        { name: 'Essen', slug: 'essen', lat: 51.4556, lng: 7.0116, population: 583000 },
        { name: 'Leipzig', slug: 'leipzig', lat: 51.3397, lng: 12.3731, population: 593000 },
      ],
    },
    {
      country: 'Türkiye',
      countryCode: 'TR',
      cities: [
        { name: 'İstanbul', slug: 'istanbul', lat: 41.0082, lng: 28.9784, population: 15460000 },
        { name: 'Ankara', slug: 'ankara', lat: 39.9334, lng: 32.8597, population: 5663000 },
        { name: 'İzmir', slug: 'izmir', lat: 38.4237, lng: 27.1428, population: 4394000 },
        { name: 'Bursa', slug: 'bursa', lat: 40.1826, lng: 29.0665, population: 3056000 },
        { name: 'Antalya', slug: 'antalya', lat: 36.8969, lng: 30.7133, population: 2548000 },
        { name: 'Adana', slug: 'adana', lat: 37.0000, lng: 35.3213, population: 2237000 },
      ],
    },
    {
      country: 'Austria',
      countryCode: 'AT',
      cities: [
        { name: 'Wien', slug: 'wien', lat: 48.2082, lng: 16.3738, population: 1911000 },
        { name: 'Graz', slug: 'graz', lat: 47.0707, lng: 15.4395, population: 291000 },
        { name: 'Linz', slug: 'linz', lat: 48.3069, lng: 14.2858, population: 206000 },
        { name: 'Salzburg', slug: 'salzburg', lat: 47.8095, lng: 13.0550, population: 154000 },
        { name: 'Innsbruck', slug: 'innsbruck', lat: 47.2692, lng: 11.4041, population: 132000 },
      ],
    },
    {
      country: 'Switzerland',
      countryCode: 'CH',
      cities: [
        { name: 'Zürich', slug: 'zuerich', lat: 47.3769, lng: 8.5417, population: 421000 },
        { name: 'Genf', slug: 'genf', lat: 46.2044, lng: 6.1432, population: 201000 },
        { name: 'Basel', slug: 'basel', lat: 47.5596, lng: 7.5886, population: 172000 },
        { name: 'Bern', slug: 'bern', lat: 46.9480, lng: 7.4474, population: 134000 },
      ],
    },
  ];

  const urls = generateLocationsSitemap(baseUrl, locations);
  const xml = generateXMLFromURLs(urls);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=7200, s-maxage=14400',
    },
  });
}
