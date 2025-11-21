/**
 * CATEGORIES SITEMAP API
 * Alle Kategorien & Unterkategorien
 */

import { generateCategoriesSitemap, generateXMLFromURLs, Category } from '@/lib/sitemap-2025';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Kategorien aus Datenbank laden
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error loading categories:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }

  // Hierarchie aufbauen
  const categoryTree = buildCategoryTree(categories || []);
  
  const urls = generateCategoriesSitemap(baseUrl, categoryTree);
  const xml = generateXMLFromURLs(urls);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=7200, s-maxage=14400', // 2h browser, 4h CDN
    },
  });
}

function buildCategoryTree(categories: any[]): Category[] {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // Erste Pass: Alle Kategorien erstellen
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      id: cat.id,
      slug: cat.slug || slugify(cat.name),
      name: cat.name,
      parent: cat.parent_id,
      subcategories: [],
    });
  });

  // Zweite Pass: Hierarchie aufbauen
  categoryMap.forEach(cat => {
    if (cat.parent && categoryMap.has(cat.parent)) {
      const parent = categoryMap.get(cat.parent)!;
      parent.subcategories!.push(cat);
    } else {
      rootCategories.push(cat);
    }
  });

  return rootCategories;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
