/**
 * GEO-SEO SITEMAP API
 * Kombinationen aus Stadt + Kategorie für Local SEO
 */

import { generateGeoSitemap, generateXMLFromURLs, Location, Category } from '@/lib/sitemap-2025';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Locations (aus sitemap-locations wiederverwenden)
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
      ],
    },
    {
      country: 'Türkiye',
      countryCode: 'TR',
      cities: [
        { name: 'İstanbul', slug: 'istanbul', lat: 41.0082, lng: 28.9784, population: 15460000 },
        { name: 'Ankara', slug: 'ankara', lat: 39.9334, lng: 32.8597, population: 5663000 },
        { name: 'İzmir', slug: 'izmir', lat: 38.4237, lng: 27.1428, population: 4394000 },
      ],
    },
  ];

  // Kategorien aus DB laden
  const { data: categoriesData, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null) // Nur Haupt-Kategorien
    .order('name')
    .limit(20); // Top 20 Kategorien

  if (error) {
    console.error('Error loading categories:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }

  const categories: Category[] = (categoriesData || []).map(cat => ({
    id: cat.id,
    slug: cat.slug || slugify(cat.name),
    name: cat.name,
    subcategories: cat.subcategories || [],
  }));

  const urls = generateGeoSitemap(baseUrl, locations, categories);
  const xml = generateXMLFromURLs(urls);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=7200, s-maxage=14400',
    },
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
