/**
 * MARKET-MODUL SEO OPTIMIZER
 * Product-Schema, Review-Schema, Offer-Schema für Shop-Integration
 */

import { supabase } from './supabase';

// ==================== PRODUCT SCHEMA ====================
export interface MarketProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  seller: {
    id: string;
    name: string;
    rating?: number;
  };
  rating?: {
    value: number;
    count: number;
  };
  inStock: boolean;
  sku?: string;
  brand?: string;
}

export function generateProductSchema(product: MarketProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl,
    "sku": product.sku || product.id,
    "brand": product.brand ? {
      "@type": "Brand",
      "name": product.brand
    } : {
      "@type": "Organization",
      "name": product.seller.name
    },
    "offers": {
      "@type": "Offer",
      "url": `https://anpip.com/market/${product.id}`,
      "priceCurrency": product.currency,
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Person",
        "name": product.seller.name,
        "url": `https://anpip.com/profile/${product.seller.id}`
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating.value,
      "reviewCount": product.rating.count,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "category": product.category
  };
}

// ==================== REVIEW SCHEMA ====================
export interface ProductReview {
  id: string;
  productId: string;
  author: {
    id: string;
    name: string;
  };
  rating: number;
  title: string;
  text: string;
  date: string;
}

export function generateReviewSchema(review: ProductReview) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "@id": `https://anpip.com/market/${review.productId}`
    },
    "author": {
      "@type": "Person",
      "name": review.author.name,
      "url": `https://anpip.com/profile/${review.author.id}`
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "name": review.title,
    "reviewBody": review.text,
    "datePublished": review.date,
    "publisher": {
      "@type": "Organization",
      "name": "Anpip"
    }
  };
}

// ==================== OFFER SCHEMA ====================
export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  currency: string;
  validFrom: string;
  validThrough: string;
  url: string;
}

export function generateOfferSchema(offer: SpecialOffer) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": offer.name,
    "description": offer.description,
    "price": offer.price,
    "priceCurrency": offer.currency,
    "priceValidUntil": offer.validThrough,
    "availability": "https://schema.org/InStock",
    "url": offer.url,
    "validFrom": offer.validFrom,
    "validThrough": offer.validThrough,
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": offer.price,
      "priceCurrency": offer.currency,
      "referencePrice": {
        "@type": "UnitPriceSpecification",
        "price": offer.originalPrice,
        "priceCurrency": offer.currency
      }
    },
    "seller": {
      "@type": "Organization",
      "name": "Anpip Market"
    }
  };
}

// ==================== MARKET HOMEPAGE SCHEMA ====================
export function generateMarketHomepageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Anpip Market - Digitaler Marktplatz für Creator",
    "description": "Kaufe und verkaufe digitale Produkte: Musik, Sound-Effekte, Video-Presets, LUTs, Templates und mehr. Der Marktplatz für Video-Creator.",
    "url": "https://anpip.com/market",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://anpip.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Market",
          "item": "https://anpip.com/market"
        }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Featured Products",
      "description": "Top-Produkte im Anpip Market"
    }
  };
}

// ==================== CATEGORY SCHEMA ====================
export function generateCategorySchema(category: {
  name: string;
  description: string;
  productCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description,
    "url": `https://anpip.com/market/category/${category.name.toLowerCase()}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://anpip.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Market",
          "item": "https://anpip.com/market"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": category.name,
          "item": `https://anpip.com/market/category/${category.name.toLowerCase()}`
        }
      ]
    },
    "numberOfItems": category.productCount
  };
}

// ==================== MARKET KEYWORDS ====================
export const MARKET_KEYWORDS = {
  primary: [
    'digitaler marktplatz',
    'creator marketplace',
    'video assets kaufen',
    'musik für videos',
    'sound effekte',
  ],
  secondary: [
    'video presets',
    'luts kaufen',
    'video templates',
    'stock musik',
    'lizenzfreie musik',
  ],
  longTail: [
    'digitale produkte für creator',
    'video musik lizenzfrei kaufen',
    'creator assets marketplace',
    'anpip market',
  ]
};

// ==================== META-DATEN FÜR PRODUKTE ====================
export function generateProductMetadata(product: MarketProduct) {
  return {
    title: `${product.name} | Anpip Market`,
    description: `${product.description} - ${product.price} ${product.currency}. Jetzt kaufen im Anpip Market.`,
    keywords: [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      'anpip market',
      'digitale produkte',
      'creator assets',
    ],
    ogType: 'product' as const,
    ogImage: product.imageUrl,
    price: product.price,
    currency: product.currency,
    availability: product.inStock ? 'in stock' : 'out of stock',
  };
}

// ==================== SELLER PROFILE SCHEMA ====================
export function generateSellerSchema(seller: {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  productCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": seller.name,
    "description": seller.description || `Creator auf Anpip Market`,
    "url": `https://anpip.com/profile/${seller.id}`,
    "image": `https://anpip.com/api/avatar/${seller.id}`,
    "aggregateRating": seller.rating ? {
      "@type": "AggregateRating",
      "ratingValue": seller.rating,
      "reviewCount": seller.reviewCount || 0,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "makesOffer": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Digital Products",
        "description": `${seller.productCount} products available`
      }
    }
  };
}

// ==================== FETCH PRODUCT DATA ====================
export async function getProductWithSEO(productId: string) {
  try {
    const { data: product, error } = await supabase
      .from('market_products')
      .select(`
        *,
        seller:profiles!market_products_seller_id_fkey (
          id,
          username,
          full_name
        ),
        reviews:market_reviews (
          rating
        )
      `)
      .eq('id', productId)
      .single();
    
    if (error || !product) {
      return null;
    }
    
    // Calculate average rating
    const avgRating = product.reviews?.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
      : undefined;
    
    const productData: MarketProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency || 'EUR',
      imageUrl: product.image_url,
      category: product.category,
      seller: {
        id: product.seller.id,
        name: product.seller.username || product.seller.full_name,
        rating: avgRating,
      },
      rating: avgRating ? {
        value: avgRating,
        count: product.reviews.length,
      } : undefined,
      inStock: product.in_stock ?? true,
      sku: product.sku,
      brand: product.brand,
    };
    
    return {
      product: productData,
      schema: generateProductSchema(productData),
      metadata: generateProductMetadata(productData),
    };
    
  } catch (error) {
    console.error('Error fetching product SEO:', error);
    return null;
  }
}

export default {
  generateProductSchema,
  generateReviewSchema,
  generateOfferSchema,
  generateMarketHomepageSchema,
  generateCategorySchema,
  generateSellerSchema,
  generateProductMetadata,
  getProductWithSEO,
  MARKET_KEYWORDS,
};
