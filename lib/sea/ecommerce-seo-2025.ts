/**
 * 🛍️ E-COMMERCE SEO 2025
 * 
 * Marketplace SEO-Optimierung für Anpip
 * - Product Schema.org
 * - Kategorie-SEO
 * - Internal Linking
 * - Image SEO
 * - Conversion-Optimierung
 * 
 * @module ECommerceSEO2025
 */

import { supabase } from '../supabase';

export interface ProductSEO {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued';
  condition: 'new' | 'used' | 'refurbished';
  brand?: string;
  category: string;
  images: string[];
  sku?: string;
  gtin?: string; // EAN, UPC, ISBN
  rating?: {
    value: number;
    count: number;
  };
  seller: {
    name: string;
    url: string;
    rating?: number;
  };
  location?: {
    city: string;
    country: string;
  };
}

export interface CategorySEO {
  slug: string;
  name: string;
  description: string;
  parent?: string;
  productCount: number;
  image?: string;
  keywords: string[];
}

/**
 * E-Commerce SEO Manager
 */
export class ECommerceSEOManager {
  /**
   * 🏷️ Generate Product Schema.org JSON-LD
   */
  static generateProductSchema(product: ProductSEO): object {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: product.images,
      sku: product.sku,
      gtin: product.gtin,
      brand: product.brand
        ? {
            '@type': 'Brand',
            name: product.brand,
          }
        : undefined,
      offers: {
        '@type': 'Offer',
        url: `https://anpip.com/market/${product.id}`,
        priceCurrency: product.currency,
        price: product.price.toFixed(2),
        availability: `https://schema.org/${this.mapAvailability(product.availability)}`,
        itemCondition: `https://schema.org/${this.mapCondition(product.condition)}`,
        seller: {
          '@type': 'Organization',
          name: product.seller.name,
          url: product.seller.url,
        },
        priceValidUntil: this.getValidUntilDate(),
      },
    };

    // Add Rating if available
    if (product.rating && product.rating.count > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
        bestRating: 5,
        worstRating: 1,
      };
    }

    return schema;
  }

  /**
   * 📂 Generate Category Page Schema
   */
  static generateCategorySchema(category: CategorySEO): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      description: category.description,
      url: `https://anpip.com/market/${category.slug}`,
      image: category.image,
      breadcrumb: this.generateCategoryBreadcrumb(category),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: category.productCount,
      },
    };
  }

  /**
   * 🍞 Generate Breadcrumb for Category
   */
  private static generateCategoryBreadcrumb(category: CategorySEO): object {
    const items: any[] = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://anpip.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Marketplace',
        item: 'https://anpip.com/market',
      },
    ];

    // Parent category if exists
    if (category.parent) {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: category.parent,
        item: `https://anpip.com/market/${category.parent}`,
      });
      items.push({
        '@type': 'ListItem',
        position: 4,
        name: category.name,
        item: `https://anpip.com/market/${category.slug}`,
      });
    } else {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://anpip.com/market/${category.slug}`,
      });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    };
  }

  /**
   * 🖼️ Optimize Product Images for SEO
   */
  static optimizeProductImage(url: string, product: ProductSEO): string {
    const filename = this.generateSEOFilename(product);
    return `${url}?auto=format&w=800&q=80&alt=${encodeURIComponent(filename)}`;
  }

  /**
   * 📝 Generate SEO-friendly filename
   */
  private static generateSEOFilename(product: ProductSEO): string {
    const slug = product.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `${slug}-${product.id}.jpg`;
  }

  /**
   * 📄 Generate Product Meta Tags
   */
  static generateProductMetaTags(product: ProductSEO): {
    title: string;
    description: string;
    keywords: string[];
    canonical: string;
    ogType: string;
    ogImage: string;
  } {
    const location = product.location
      ? ` in ${product.location.city}`
      : '';

    return {
      title: `${product.title}${location} - ${product.price} ${product.currency} | Anpip Marketplace`,
      description: `${product.description.substring(0, 150)}... Kaufe jetzt bei Anpip Marketplace. ${product.condition === 'new' ? 'Neu' : 'Gebraucht'}. ${product.availability === 'in_stock' ? 'Sofort verfügbar.' : ''}`,
      keywords: [
        product.title,
        product.category,
        product.brand || '',
        product.condition,
        'marketplace',
        'kaufen',
        product.location?.city || '',
      ].filter(Boolean),
      canonical: `https://anpip.com/market/${product.id}`,
      ogType: 'product',
      ogImage: product.images[0] || '',
    };
  }

  /**
   * 📂 Generate Category Meta Tags
   */
  static generateCategoryMetaTags(category: CategorySEO): {
    title: string;
    description: string;
    keywords: string[];
    canonical: string;
  } {
    return {
      title: `${category.name} kaufen | ${category.productCount}+ Angebote | Anpip Marketplace`,
      description: `${category.description} ${category.productCount}+ Produkte in der Kategorie ${category.name}. Jetzt durchstöbern und günstig kaufen!`,
      keywords: [category.name, ...category.keywords, 'marketplace', 'kaufen', 'verkaufen'],
      canonical: `https://anpip.com/market/${category.slug}`,
    };
  }

  /**
   * 🔗 Generate Related Products Links
   */
  static async getRelatedProducts(productId: string, limit: number = 6): Promise<any[]> {
    const { data: product } = await supabase
      .from('market_items')
      .select('category, location_city')
      .eq('id', productId)
      .single();

    if (!product) return [];

    const { data: related } = await supabase
      .from('market_items')
      .select('id, title, price, currency, images')
      .eq('category', product.category)
      .neq('id', productId)
      .eq('status', 'active')
      .limit(limit);

    return related || [];
  }

  /**
   * 📊 Generate Product List Schema (for Category Pages)
   */
  static generateProductListSchema(products: ProductSEO[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.title,
          url: `https://anpip.com/market/${product.id}`,
          image: product.images[0],
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency,
            availability: `https://schema.org/${this.mapAvailability(product.availability)}`,
          },
        },
      })),
    };
  }

  /**
   * 🏪 Generate Marketplace Organization Schema
   */
  static generateMarketplaceSchema(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Anpip Marketplace',
      url: 'https://anpip.com/market',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://anpip.com/market/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Anpip',
        logo: {
          '@type': 'ImageObject',
          url: 'https://anpip.com/assets/logo-512x512.png',
        },
      },
    };
  }

  /**
   * 🎯 SEO Optimization Tips for Sellers
   */
  static getSellerSEOTips(): string[] {
    return [
      '✅ Titel: 60-80 Zeichen, wichtigste Keywords am Anfang',
      '✅ Beschreibung: Min. 300 Wörter, strukturiert mit Absätzen',
      '✅ Bullet Points für Features verwenden',
      '✅ Mindestens 5 hochwertige Bilder (1080x1080 oder besser)',
      '✅ Alt-Text für alle Bilder',
      '✅ Preis wettbewerbsfähig & klar sichtbar',
      '✅ Standort angeben für lokale SEO',
      '✅ Kategorie korrekt wählen',
      '✅ Marke & Modell angeben falls zutreffend',
      '✅ Zustand klar beschreiben (neu/gebraucht)',
      '✅ Versandoptionen & Kosten transparent',
      '✅ Rückgaberecht angeben',
      '✅ FAQ-Bereich nutzen',
      '✅ Schnelle Antworten auf Fragen',
      '✅ Positive Bewertungen sammeln',
    ];
  }

  /**
   * 📈 Category URL Structure
   */
  static getCategoryURLStructure(): Record<string, string> {
    return {
      electronics: '/market/electronics',
      electronicsSmartphones: '/market/electronics/smartphones',
      electronicsLaptops: '/market/electronics/laptops',
      fashion: '/market/fashion',
      fashionShoes: '/market/fashion/shoes',
      home: '/market/home',
      homeGarden: '/market/home/garden',
      sports: '/market/sports',
      sportsFitness: '/market/sports/fitness',
      books: '/market/books',
      music: '/market/music',
      toys: '/market/toys',
      automotive: '/market/automotive',
      services: '/market/services',
    };
  }

  /**
   * 🔍 Internal Linking Strategy
   */
  static getInternalLinkingStrategy() {
    return {
      productPage: [
        'Link to category',
        'Link to parent category',
        'Link to related products (6)',
        'Link to seller profile',
        'Link to similar items',
        'Link to recently viewed',
      ],
      categoryPage: [
        'Link to subcategories',
        'Link to parent category',
        'Link to popular products',
        'Link to new arrivals',
        'Link to on-sale items',
        'Breadcrumb navigation',
      ],
      homepage: [
        'Link to top categories',
        'Link to featured products',
        'Link to local marketplace',
        'Link to trending items',
      ],
    };
  }

  /**
   * 🗺️ Helper: Map Availability to Schema.org
   */
  private static mapAvailability(availability: string): string {
    const mapping: Record<string, string> = {
      in_stock: 'InStock',
      out_of_stock: 'OutOfStock',
      preorder: 'PreOrder',
      discontinued: 'Discontinued',
    };
    return mapping[availability] || 'InStock';
  }

  /**
   * 🔧 Helper: Map Condition to Schema.org
   */
  private static mapCondition(condition: string): string {
    const mapping: Record<string, string> = {
      new: 'NewCondition',
      used: 'UsedCondition',
      refurbished: 'RefurbishedCondition',
    };
    return mapping[condition] || 'NewCondition';
  }

  /**
   * 📅 Helper: Get Valid Until Date (30 days from now)
   */
  private static getValidUntilDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }
}

export default ECommerceSEOManager;
