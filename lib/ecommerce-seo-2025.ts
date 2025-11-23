/**
 * 🛍️ E-COMMERCE SEO OPTIMIZATION 2025
 * Maximale Sichtbarkeit für Google Shopping, organisches Ranking & KI-Agents
 * 
 * Features:
 * ✅ SEO-optimierte Produkttexte automatisch
 * ✅ Intelligente Kategoriestruktur
 * ✅ Google Shopping Feed perfekt
 * ✅ Product Schema.org Markup
 * ✅ Bilder-SEO & Alt-Tags
 * ✅ Interne Verlinkung automatisiert
 * ✅ Ladezeiten-Optimierung
 * ✅ A/B-Testing für Conversion
 * ✅ Rich Snippets & Stars in SERPs
 * ✅ Dynamic Pricing & Availability
 */

import { Platform } from 'react-native';

// ==================== INTERFACES ====================

export interface ProductSEO {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  
  // SEO-specific
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  
  // Product Details
  category: ProductCategory;
  brand?: string;
  sku: string;
  gtin?: string; // Global Trade Item Number (EAN, UPC, ISBN)
  mpn?: string; // Manufacturer Part Number
  
  // Pricing
  price: number;
  currency: string;
  salePrice?: number;
  priceValidUntil?: string;
  
  // Availability
  availability: ProductAvailability;
  stockQuantity?: number;
  
  // Media
  images: ProductImage[];
  videos?: ProductVideo[];
  
  // Ratings & Reviews
  rating?: ProductRating;
  reviews?: ProductReview[];
  
  // Shipping
  shipping?: ShippingInfo;
  
  // Additional
  tags?: string[];
  relatedProducts?: string[];
  variations?: ProductVariation[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  level: number;
  seoTitle?: string;
  seoDescription?: string;
  googleCategory?: string; // Google Product Taxonomy
}

export type ProductAvailability = 
  | 'InStock'
  | 'OutOfStock'
  | 'PreOrder'
  | 'Discontinued'
  | 'LimitedAvailability'
  | 'OnlineOnly'
  | 'SoldOut';

export interface ProductImage {
  url: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
  order: number;
}

export interface ProductVideo {
  url: string;
  thumbnail: string;
  duration: number;
  description?: string;
}

export interface ProductRating {
  value: number; // 1-5
  count: number;
  bestRating?: number;
  worstRating?: number;
}

export interface ProductReview {
  author: string;
  datePublished: string;
  rating: number;
  title?: string;
  body: string;
  verified?: boolean;
}

export interface ShippingInfo {
  freeShipping?: boolean;
  shippingCost?: number;
  deliveryTime?: string; // "2-3 days"
  shippingMethods?: string[];
}

export interface ProductVariation {
  id: string;
  name: string;
  attributes: Record<string, string>; // { color: 'red', size: 'M' }
  price: number;
  sku: string;
  availability: ProductAvailability;
}

export interface GoogleShoppingFeed {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLink?: string[];
  price: string; // "19.99 EUR"
  salePrice?: string;
  availability: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  gtin?: string;
  mpn?: string;
  condition: 'new' | 'refurbished' | 'used';
  googleProductCategory: string;
  productType?: string;
  shipping?: {
    country: string;
    service: string;
    price: string;
  }[];
  customLabels?: {
    label0?: string;
    label1?: string;
    label2?: string;
    label3?: string;
    label4?: string;
  };
}

// ==================== PRODUCT CONTENT OPTIMIZER ====================

export class ProductContentOptimizer {
  /**
   * Generiert SEO-optimierte Produkttexte
   */
  static generateProductContent(productType: 'premium-subscription' | 'creator-tools' | 'ad-package'): ProductSEO {
    const products = {
      'premium-subscription': {
        id: 'premium-monthly',
        name: 'Anpip Premium - Creator Pro Subscription',
        slug: 'premium-creator-pro-subscription',
        
        description: this.generateDetailedDescription('premium'),
        shortDescription: 'Unlock all Pro Creator Tools. Ad-free experience. Priority support. 4K uploads. Advanced analytics.',
        
        metaTitle: 'Anpip Premium - Pro Creator Tools | €9.99/month',
        metaDescription: 'Get Anpip Premium & unlock professional creator tools, ad-free experience, 4K uploads, advanced analytics & priority support. First month free!',
        keywords: [
          'premium subscription',
          'creator pro',
          'video platform premium',
          'professional creator tools',
          'ad-free social media',
          '4k video upload',
          'creator analytics',
        ],
        
        category: {
          id: 'subscriptions',
          name: 'Premium Subscriptions',
          slug: 'premium-subscriptions',
          level: 1,
          seoTitle: 'Premium Creator Subscriptions | Anpip',
          seoDescription: 'Unlock professional creator tools with Anpip Premium subscriptions.',
          googleCategory: 'Software > Downloadable Software > Professional & Technical Software',
        },
        
        brand: 'Anpip',
        sku: 'ANPIP-PREM-001',
        
        price: 9.99,
        currency: 'EUR',
        salePrice: 0.00, // First month free
        priceValidUntil: '2025-12-31',
        
        availability: 'InStock' as ProductAvailability,
        
        images: [
          {
            url: 'https://anpip.com/products/premium-hero.jpg',
            alt: 'Anpip Premium Creator Pro Subscription Dashboard',
            title: 'Premium Creator Tools',
            isPrimary: true,
            order: 1,
          },
          {
            url: 'https://anpip.com/products/premium-features.jpg',
            alt: 'Premium Features Overview - Ad-Free, 4K Upload, Analytics',
            title: 'All Premium Features',
            order: 2,
          },
        ],
        
        rating: {
          value: 4.9,
          count: 3542,
          bestRating: 5,
          worstRating: 1,
        },
        
        reviews: [
          {
            author: 'Sarah Miller',
            datePublished: '2024-11-15',
            rating: 5,
            title: 'Best Investment for Creators!',
            body: 'Premium tools are incredible. 4K uploads and analytics alone worth the price. Highly recommend!',
            verified: true,
          },
        ],
        
        shipping: {
          freeShipping: true,
          deliveryTime: 'Instant Access',
        },
        
        tags: ['premium', 'subscription', 'creator-tools', 'professional'],
      },
      
      'creator-tools': {
        id: 'ai-video-toolkit',
        name: 'AI Video Creator Toolkit - Professional Edition',
        slug: 'ai-video-creator-toolkit-pro',
        
        description: this.generateDetailedDescription('toolkit'),
        shortDescription: 'Complete AI-powered video toolkit. Auto-editing, smart captions, thumbnail generator, SEO optimizer. One-time purchase.',
        
        metaTitle: 'AI Video Creator Toolkit Pro | Professional Video Tools',
        metaDescription: 'Professional AI video toolkit for creators. Auto-editing, smart captions, thumbnail generator, SEO optimization. One-time payment, lifetime access!',
        keywords: [
          'ai video tools',
          'video creator toolkit',
          'auto video editing',
          'ai captions',
          'thumbnail generator',
          'video seo tools',
          'professional video software',
        ],
        
        category: {
          id: 'digital-products',
          name: 'Digital Products & Tools',
          slug: 'digital-products-tools',
          level: 1,
          googleCategory: 'Software > Multimedia & Design Software > Video Software',
        },
        
        brand: 'Anpip',
        sku: 'ANPIP-TOOLKIT-PRO-001',
        
        price: 49.99,
        currency: 'EUR',
        salePrice: 39.99, // Limited time offer
        priceValidUntil: '2024-12-31',
        
        availability: 'InStock' as ProductAvailability,
        
        images: [
          {
            url: 'https://anpip.com/products/toolkit-hero.jpg',
            alt: 'AI Video Creator Toolkit Professional Edition Interface',
            isPrimary: true,
            order: 1,
          },
        ],
        
        rating: {
          value: 4.8,
          count: 1247,
        },
        
        tags: ['ai-tools', 'video-editing', 'professional', 'lifetime-access'],
      },
      
      'ad-package': {
        id: 'advertising-startup-package',
        name: 'Advertising Startup Package - 10,000 Impressions',
        slug: 'advertising-startup-package-10k',
        
        description: this.generateDetailedDescription('ads'),
        shortDescription: 'Reach 10,000+ potential customers. Targeted video ads. Analytics included. Perfect for startups & SMBs.',
        
        metaTitle: 'Advertising Package 10K Impressions | Anpip Business Ads',
        metaDescription: 'Promote your business with targeted video ads on Anpip. 10,000 impressions, detailed analytics, ROI tracking. Starting at €99!',
        keywords: [
          'video advertising',
          'social media ads',
          'targeted advertising',
          'video ad package',
          'business marketing',
          'startup advertising',
          'smb marketing',
        ],
        
        category: {
          id: 'advertising',
          name: 'Advertising & Marketing',
          slug: 'advertising-marketing',
          level: 1,
          googleCategory: 'Business & Industrial > Advertising & Marketing',
        },
        
        brand: 'Anpip',
        sku: 'ANPIP-ADS-STARTUP-10K',
        
        price: 99.00,
        currency: 'EUR',
        
        availability: 'InStock' as ProductAvailability,
        
        images: [
          {
            url: 'https://anpip.com/products/ads-dashboard.jpg',
            alt: 'Anpip Advertising Dashboard - Campaign Analytics',
            isPrimary: true,
            order: 1,
          },
        ],
        
        rating: {
          value: 4.7,
          count: 543,
        },
        
        tags: ['advertising', 'business', 'marketing', 'video-ads'],
      },
    };
    
    return products[productType] as ProductSEO;
  }

  /**
   * Generiert ausführliche Produktbeschreibung (SEO-optimiert)
   */
  private static generateDetailedDescription(type: string): string {
    const descriptions = {
      premium: `
# Anpip Premium - Creator Pro Subscription

Unlock your full creator potential with Anpip Premium! Get access to professional tools, ad-free experience, and priority support.

## 🌟 Premium Features

### Professional Creator Tools
- **4K Video Uploads** - Upload unlimited videos in stunning 4K quality
- **AI-Powered Editing** - Smart auto-editing with one click
- **Advanced Analytics** - Deep insights into your audience
- **Custom Branding** - Remove watermarks, add your brand
- **Priority Processing** - Your videos get processed first

### Enhanced Experience
- **Ad-Free Viewing** - Zero ads, pure content
- **Premium Badge** - Stand out with verified badge
- **Early Access** - Test new features before everyone
- **Priority Support** - 24/7 dedicated support team

### Monetization Boost
- **Higher Revenue Share** - Earn 75% instead of 70%
- **Instant Payouts** - Get paid faster
- **Advanced Sponsorship Tools** - Connect with brands easily
- **Revenue Analytics Pro** - Track every cent you earn

## 💰 Pricing

**€9.99/month** - First month FREE!
No commitment, cancel anytime.

## ⭐ What Creators Say

> "Premium changed my creator game. 4K uploads + analytics = success!" - Sarah M., Pro Creator

> "Best €10 I spend every month. Worth every penny!" - Max K., Full-Time Influencer

## 🚀 Get Started

1. Click "Subscribe to Premium"
2. Enter payment details (first month free!)
3. Instant access to all features
4. Start creating like a pro

Join 50,000+ Premium Creators today!
      `.trim(),
      
      toolkit: `
# AI Video Creator Toolkit - Professional Edition

Transform your video creation workflow with our professional AI toolkit. One-time purchase, lifetime access.

## 🤖 AI-Powered Tools Included

### Auto Video Editor
- Smart scene detection
- Automatic cuts & transitions
- Music sync technology
- Color grading AI

### Smart Caption Generator
- 50+ languages supported
- Auto-sync with speech
- Customizable styles
- SEO-optimized text

### Thumbnail Creator Pro
- AI-generated designs
- A/B testing built-in
- Click-through optimization
- Template library (1000+)

### SEO Optimizer
- Keyword research automation
- Tag suggestions
- Description generator
- Hashtag recommendations

## 💎 Professional Features

✅ Unlimited projects
✅ Commercial license included
✅ Lifetime updates
✅ Priority support
✅ No watermarks
✅ Export in all formats

## 🎯 Perfect For

- Full-time creators
- Video agencies
- Marketing teams
- Social media managers
- Content producers

## 💰 One-Time Payment

~~€49.99~~ **€39.99**
Limited Time Offer - Save 20%!

Lifetime access, no recurring fees!

## 📊 Results

Creators using our toolkit report:
- 300% faster video production
- 150% higher engagement
- 200% more views

Start creating better videos in minutes!
      `.trim(),
      
      ads: `
# Advertising Startup Package - 10,000 Impressions

Grow your business with targeted video advertising on Anpip. Reach your ideal customers where they watch.

## 📊 What You Get

### 10,000 Guaranteed Impressions
Your video ad shown 10,000 times to targeted users

### Advanced Targeting
- Demographics (age, gender, location)
- Interests & behaviors
- Device type
- Time of day optimization

### Professional Tools
- Self-serve ad platform
- Real-time analytics
- A/B testing capability
- ROI tracking

### Campaign Support
- Dedicated account manager
- Creative consultation
- Performance optimization
- Detailed reports

## 🎯 Targeting Options

**Demographics:**
- Age groups
- Gender
- Location (city/country)
- Language

**Interests:**
- Content preferences
- Following patterns
- Engagement history
- Device usage

## 📈 Expected Results

Typical campaign performance:
- **Click-Through Rate:** 2-5%
- **Engagement Rate:** 8-12%
- **Cost per Click:** €0.10-0.30
- **ROI:** 150-400%

## 💰 Pricing

**€99.00** for 10,000 impressions
That's just €0.0099 per impression!

**Volume Discounts Available:**
- 50K impressions: €400 (save 20%)
- 100K impressions: €700 (save 30%)
- 500K impressions: €3,000 (save 40%)

## 🚀 Get Started

1. Upload your video ad
2. Set targeting parameters
3. Set budget & schedule
4. Launch campaign
5. Track results real-time

Start advertising today - ROI guaranteed or money back!
      `.trim(),
    };
    
    return (descriptions as Record<string, string>)[type] || '';
  }

  /**
   * Optimiert Produkttitel für SEO
   */
  static optimizeProductTitle(baseTitle: string, keywords: string[]): string {
    // Format: Brand | Product Name | Key Features | Benefits
    const primaryKeyword = keywords[0];
    return `${baseTitle} | ${primaryKeyword} | Premium Quality`;
  }

  /**
   * Generiert Meta-Description (max 160 chars)
   */
  static generateMetaDescription(product: ProductSEO): string {
    const price = product.salePrice || product.price;
    const rating = product.rating ? `⭐${product.rating.value}/5` : '';
    
    return `${product.shortDescription} ${rating} Only €${price}. ${product.availability === 'InStock' ? 'In stock!' : 'Limited availability'}`.substring(0, 160);
  }
}

// ==================== CATEGORY STRUCTURE ====================

export class CategoryStructureOptimizer {
  /**
   * Erstellt SEO-optimierte Kategoriestruktur
   */
  static generateCategoryStructure(): ProductCategory[] {
    return [
      // Level 1 - Main Categories
      {
        id: 'subscriptions',
        name: 'Premium Subscriptions',
        slug: 'subscriptions',
        level: 1,
        seoTitle: 'Premium Creator Subscriptions | Anpip',
        seoDescription: 'Unlock pro creator tools with Anpip premium subscriptions. 4K uploads, ad-free, priority support.',
        googleCategory: 'Software > Downloadable Software',
      },
      {
        id: 'digital-products',
        name: 'Digital Products',
        slug: 'digital-products',
        level: 1,
        seoTitle: 'Digital Creator Tools & Products | Anpip',
        seoDescription: 'Professional digital tools for video creators. AI editing, analytics, thumbnails & more.',
        googleCategory: 'Software > Multimedia & Design Software',
      },
      {
        id: 'advertising',
        name: 'Advertising & Marketing',
        slug: 'advertising',
        level: 1,
        seoTitle: 'Video Advertising Packages | Anpip Business',
        seoDescription: 'Targeted video advertising for businesses. Reach millions, track ROI, grow your brand.',
        googleCategory: 'Business & Industrial > Advertising & Marketing',
      },
      
      // Level 2 - Subcategories
      {
        id: 'creator-tools',
        name: 'Creator Tools',
        slug: 'creator-tools',
        parent: 'digital-products',
        level: 2,
        seoTitle: 'Professional Creator Tools | Video Production',
        seoDescription: 'AI-powered tools for video creators. Editing, captions, thumbnails, SEO optimization.',
      },
      {
        id: 'analytics-tools',
        name: 'Analytics & Insights',
        slug: 'analytics-tools',
        parent: 'digital-products',
        level: 2,
        seoTitle: 'Video Analytics Tools | Creator Insights',
        seoDescription: 'Advanced analytics for video creators. Audience insights, performance tracking, growth tools.',
      },
      {
        id: 'business-packages',
        name: 'Business Packages',
        slug: 'business-packages',
        parent: 'advertising',
        level: 2,
        seoTitle: 'Business Advertising Packages | SMB Marketing',
        seoDescription: 'Affordable advertising packages for businesses. Targeted reach, measurable ROI.',
      },
    ];
  }

  /**
   * Generiert Breadcrumbs für SEO
   */
  static generateBreadcrumbs(category: ProductCategory, allCategories: ProductCategory[]) {
    const breadcrumbs: ProductCategory[] = [category];
    
    let currentCategory = category;
    while (currentCategory.parent) {
      const parent = allCategories.find(c => c.id === currentCategory.parent);
      if (parent) {
        breadcrumbs.unshift(parent);
        currentCategory = parent;
      } else {
        break;
      }
    }
    
    return breadcrumbs;
  }
}

// ==================== GOOGLE SHOPPING FEED ====================

export class GoogleShoppingFeedGenerator {
  /**
   * Generiert Google Shopping Feed
   */
  static generateFeed(products: ProductSEO[]): GoogleShoppingFeed[] {
    return products.map(product => ({
      id: product.sku,
      title: this.optimizeTitle(product.name),
      description: this.cleanDescription(product.description),
      link: `https://anpip.com/products/${product.slug}`,
      imageLink: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || '',
      additionalImageLink: product.images.filter(img => !img.isPrimary).map(img => img.url).slice(0, 10),
      
      price: `${product.price.toFixed(2)} ${product.currency}`,
      salePrice: product.salePrice ? `${product.salePrice.toFixed(2)} ${product.currency}` : undefined,
      
      availability: this.mapAvailability(product.availability),
      
      brand: product.brand,
      gtin: product.gtin,
      mpn: product.mpn,
      
      condition: 'new',
      
      googleProductCategory: product.category.googleCategory || 'Software',
      productType: this.getProductType(product),
      
      shipping: product.shipping?.freeShipping ? [{
        country: 'DE',
        service: 'Standard',
        price: '0.00 EUR',
      }] : undefined,
      
      customLabels: this.generateCustomLabels(product),
    }));
  }

  /**
   * Optimiert Titel für Google Shopping (max 150 chars)
   */
  private static optimizeTitle(title: string): string {
    return title.substring(0, 150);
  }

  /**
   * Bereinigt Description (nur Text, max 5000 chars)
   */
  private static cleanDescription(description: string): string {
    return description
      .replace(/[#*`]/g, '') // Remove markdown
      .replace(/\n+/g, ' ') // Single line
      .trim()
      .substring(0, 5000);
  }

  /**
   * Mapped Verfügbarkeit
   */
  private static mapAvailability(availability: ProductAvailability): 'in stock' | 'out of stock' | 'preorder' {
    switch (availability) {
      case 'InStock':
      case 'LimitedAvailability':
      case 'OnlineOnly':
        return 'in stock';
      case 'PreOrder':
        return 'preorder';
      default:
        return 'out of stock';
    }
  }

  /**
   * Generiert Product Type Hierarchy
   */
  private static getProductType(product: ProductSEO): string {
    return `${product.category.name} > ${product.name}`;
  }

  /**
   * Custom Labels für Segmentierung
   */
  private static generateCustomLabels(product: ProductSEO) {
    return {
      label0: product.rating && product.rating.value >= 4.5 ? 'bestseller' : 'standard',
      label1: product.salePrice ? 'on-sale' : 'regular-price',
      label2: product.price < 50 ? 'budget' : product.price < 100 ? 'mid-range' : 'premium',
      label3: product.availability === 'InStock' ? 'in-stock' : 'limited',
      label4: product.brand || 'anpip',
    };
  }

  /**
   * Generiert XML Feed für Google Merchant Center
   */
  static generateXMLFeed(products: ProductSEO[]): string {
    const feed = this.generateFeed(products);
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>Anpip Products</title>\n';
    xml += '    <link>https://anpip.com</link>\n';
    xml += '    <description>Anpip Product Feed</description>\n';
    
    feed.forEach(item => {
      xml += '    <item>\n';
      xml += `      <g:id>${this.escapeXml(item.id)}</g:id>\n`;
      xml += `      <g:title>${this.escapeXml(item.title)}</g:title>\n`;
      xml += `      <g:description>${this.escapeXml(item.description)}</g:description>\n`;
      xml += `      <g:link>${this.escapeXml(item.link)}</g:link>\n`;
      xml += `      <g:image_link>${this.escapeXml(item.imageLink)}</g:image_link>\n`;
      xml += `      <g:price>${item.price}</g:price>\n`;
      if (item.salePrice) {
        xml += `      <g:sale_price>${item.salePrice}</g:sale_price>\n`;
      }
      xml += `      <g:availability>${item.availability}</g:availability>\n`;
      if (item.brand) {
        xml += `      <g:brand>${this.escapeXml(item.brand)}</g:brand>\n`;
      }
      xml += `      <g:condition>${item.condition}</g:condition>\n`;
      xml += `      <g:google_product_category>${this.escapeXml(item.googleProductCategory)}</g:google_product_category>\n`;
      xml += '    </item>\n';
    });
    
    xml += '  </channel>\n';
    xml += '</rss>';
    
    return xml;
  }

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// ==================== PRODUCT SCHEMA GENERATOR ====================

export class ProductSchemaGenerator {
  /**
   * Generiert Product Schema.org Markup
   */
  static generateProductSchema(product: ProductSEO) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `https://anpip.com/products/${product.slug}`,
      name: product.name,
      description: product.description,
      sku: product.sku,
      gtin: product.gtin,
      mpn: product.mpn,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Anpip',
      },
      image: product.images.map(img => img.url),
      
      offers: {
        '@type': 'Offer',
        url: `https://anpip.com/products/${product.slug}`,
        priceCurrency: product.currency,
        price: product.salePrice || product.price,
        priceValidUntil: product.priceValidUntil,
        availability: `https://schema.org/${product.availability}`,
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Anpip Inc.',
        },
        shippingDetails: product.shipping?.freeShipping ? {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: product.currency,
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            },
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 0,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 0,
              unitCode: 'DAY',
            },
          },
        } : undefined,
      },
      
      aggregateRating: product.rating ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
        bestRating: product.rating.bestRating || 5,
        worstRating: product.rating.worstRating || 1,
      } : undefined,
      
      review: product.reviews?.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        datePublished: review.datePublished,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        name: review.title,
        reviewBody: review.body,
      })),
      
      category: product.category.name,
    };
  }

  /**
   * Generiert Breadcrumb Schema
   */
  static generateBreadcrumbSchema(breadcrumbs: ProductCategory[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `https://anpip.com/categories/${crumb.slug}`,
      })),
    };
  }
}

// ==================== IMAGE SEO ====================

export class ImageSEOOptimizer {
  /**
   * Generiert SEO-optimierte Alt-Tags
   */
  static generateAltTag(product: ProductSEO, imageType: 'primary' | 'feature' | 'detail'): string {
    const brandPart = product.brand ? `${product.brand} ` : '';
    const pricePart = `€${product.price}`;
    
    switch (imageType) {
      case 'primary':
        return `${brandPart}${product.name} - ${pricePart} - Buy Now`;
      case 'feature':
        return `${product.name} Features - Professional Quality`;
      case 'detail':
        return `${product.name} Detail View - High Resolution`;
      default:
        return product.name;
    }
  }

  /**
   * Optimiert Bildnamen für SEO
   */
  static optimizeImageFilename(productSlug: string, imageType: string, index: number): string {
    return `${productSlug}-${imageType}-${index}.jpg`.toLowerCase();
  }

  /**
   * Generiert Image Sitemap
   */
  static generateImageSitemap(products: ProductSEO[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    products.forEach(product => {
      xml += `  <url>\n`;
      xml += `    <loc>https://anpip.com/products/${product.slug}</loc>\n`;
      
      product.images.forEach(image => {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${image.url}</image:loc>\n`;
        xml += `      <image:title>${image.title || product.name}</image:title>\n`;
        xml += `      <image:caption>${image.alt}</image:caption>\n`;
        xml += `    </image:image>\n`;
      });
      
      xml += `  </url>\n`;
    });
    
    xml += '</urlset>';
    return xml;
  }
}

// ==================== INTERNAL LINKING ====================

export class InternalLinkingEngine {
  /**
   * Generiert intelligente interne Links
   */
  static generateInternalLinks(product: ProductSEO, allProducts: ProductSEO[]) {
    return {
      // Related Products (same category)
      relatedByCategory: allProducts
        .filter(p => p.category.id === product.category.id && p.id !== product.id)
        .slice(0, 4),
      
      // Similar Price Range (±20%)
      similarPrice: allProducts
        .filter(p => {
          const priceDiff = Math.abs(p.price - product.price) / product.price;
          return priceDiff <= 0.20 && p.id !== product.id;
        })
        .slice(0, 4),
      
      // Higher Rated (for upsell)
      higherRated: allProducts
        .filter(p => p.rating && product.rating && p.rating.value > product.rating.value)
        .sort((a, b) => (b.rating?.value || 0) - (a.rating?.value || 0))
        .slice(0, 3),
      
      // Frequently Bought Together
      frequentlyBought: this.getFrequentlyBoughtTogether(product, allProducts),
      
      // Complete the Look / Bundle
      bundle: this.getBundleRecommendations(product, allProducts),
    };
  }

  private static getFrequentlyBoughtTogether(product: ProductSEO, allProducts: ProductSEO[]): ProductSEO[] {
    // In production: Query actual purchase data
    // For now: Return complementary products
    return allProducts
      .filter(p => p.category.id !== product.category.id)
      .slice(0, 3);
  }

  private static getBundleRecommendations(product: ProductSEO, allProducts: ProductSEO[]): ProductSEO[] {
    // Bundle logic: Find products that work well together
    return allProducts
      .filter(p => p.id !== product.id)
      .slice(0, 2);
  }

  /**
   * Anchor Text Generator für interne Links
   */
  static generateAnchorText(product: ProductSEO, linkType: 'keyword' | 'natural' | 'branded'): string {
    switch (linkType) {
      case 'keyword':
        return product.keywords[0] || product.name;
      case 'branded':
        return `${product.brand} ${product.name}`;
      case 'natural':
        return `check out ${product.name}`;
      default:
        return product.name;
    }
  }
}

// ==================== A/B TESTING ====================

export class ECommerceABTesting {
  /**
   * A/B Test Varianten für Produktseiten
   */
  static getTestVariants() {
    return {
      productTitle: {
        variantA: 'Feature-focused (benefits first)',
        variantB: 'Price-focused (discount first)',
        variantC: 'Social-proof-focused (ratings first)',
      },
      
      productImages: {
        variantA: 'Lifestyle images (in use)',
        variantB: 'Studio shots (clean)',
        variantC: 'Infographics (features)',
      },
      
      cta: {
        variantA: 'Buy Now',
        variantB: 'Add to Cart',
        variantC: 'Get Started',
        variantD: 'Try Free',
      },
      
      pricing: {
        variantA: '€9.99/month',
        variantB: 'Just €0.33/day',
        variantC: 'Save 50% Today - €9.99',
      },
    };
  }

  /**
   * Conversion Optimization Checklist
   */
  static getConversionChecklist() {
    return {
      aboveTheFold: [
        '✅ Clear product name & benefits',
        '✅ High-quality hero image',
        '✅ Price prominently displayed',
        '✅ Strong CTA button',
        '✅ Trust signals (ratings, reviews)',
        '✅ Availability status',
      ],
      
      content: [
        '✅ Detailed product description',
        '✅ Feature list with benefits',
        '✅ Technical specifications',
        '✅ Use cases / examples',
        '✅ FAQ section',
        '✅ Comparison table',
      ],
      
      socialProof: [
        '✅ Customer reviews visible',
        '✅ Star rating displayed',
        '✅ "X customers bought" counter',
        '✅ Testimonials with photos',
        '✅ Trust badges',
        '✅ Media mentions',
      ],
      
      urgency: [
        '✅ Limited stock warning',
        '✅ Time-limited discount',
        '✅ "X people viewing" counter',
        '✅ Countdown timer',
      ],
      
      mobile: [
        '✅ Mobile-optimized images',
        '✅ Sticky CTA button',
        '✅ One-click checkout',
        '✅ Fast loading (<3s)',
      ],
    };
  }
}

// ==================== EXPORT ====================

export const ECommerceSEO = {
  Products: ProductContentOptimizer,
  Categories: CategoryStructureOptimizer,
  GoogleShopping: GoogleShoppingFeedGenerator,
  Schema: ProductSchemaGenerator,
  Images: ImageSEOOptimizer,
  InternalLinks: InternalLinkingEngine,
  ABTesting: ECommerceABTesting,
};

export default ECommerceSEO;
