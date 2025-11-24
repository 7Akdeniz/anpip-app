/**
 * SOCIAL MEDIA SNIPPET GENERATOR
 * Optimiert für Facebook, Twitter, WhatsApp, LinkedIn, Discord, Telegram
 */

export interface SocialSnippetConfig {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  videoUrl?: string;
  type?: 'website' | 'video' | 'article' | 'product';
  siteName?: string;
  locale?: string;
  author?: string;
  tags?: string[];
}

// ==================== OPEN GRAPH (Facebook, WhatsApp, LinkedIn) ====================
export function generateOpenGraphTags(config: SocialSnippetConfig): Record<string, string> {
  const {
    title,
    description,
    url,
    imageUrl,
    videoUrl,
    type = 'website',
    siteName = 'Anpip',
    locale = 'de_DE',
  } = config;

  const tags: Record<string, string> = {
    'og:type': type,
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:site_name': siteName,
    'og:locale': locale,
    'og:image': imageUrl,
    'og:image:secure_url': imageUrl,
    'og:image:type': 'image/jpeg',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': title,
  };

  if (videoUrl) {
    tags['og:video'] = videoUrl;
    tags['og:video:secure_url'] = videoUrl;
    tags['og:video:type'] = 'video/mp4';
    tags['og:video:width'] = '1080';
    tags['og:video:height'] = '1920';
  }

  return tags;
}

// ==================== TWITTER CARD ====================
export function generateTwitterCardTags(config: SocialSnippetConfig): Record<string, string> {
  const {
    title,
    description,
    imageUrl,
    videoUrl,
    author = '@anpip',
  } = config;

  const tags: Record<string, string> = {
    'twitter:card': videoUrl ? 'player' : 'summary_large_image',
    'twitter:site': '@anpip',
    'twitter:creator': author,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': imageUrl,
    'twitter:image:alt': title,
  };

  if (videoUrl) {
    tags['twitter:player'] = videoUrl;
    tags['twitter:player:width'] = '1080';
    tags['twitter:player:height'] = '1920';
    tags['twitter:player:stream'] = videoUrl;
    tags['twitter:player:stream:content_type'] = 'video/mp4';
  }

  return tags;
}

// ==================== WHATSAPP PREVIEW ====================
export function generateWhatsAppPreview(config: SocialSnippetConfig): string {
  const { title, description, url } = config;
  
  // WhatsApp nutzt og:tags
  return `
🎬 ${title}

${description}

🔗 ${url}

#Anpip #VertikaleVideos #ShortVideos
  `.trim();
}

// ==================== TELEGRAM PREVIEW ====================
export function generateTelegramPreview(config: SocialSnippetConfig): Record<string, string> {
  const { title, description, imageUrl } = config;
  
  return {
    'telegram:channel': '@anpip',
    'telegram:card': 'summary_large_image',
    'telegram:title': title,
    'telegram:description': description,
    'telegram:image': imageUrl,
  };
}

// ==================== DISCORD EMBED ====================
export function generateDiscordEmbed(config: SocialSnippetConfig) {
  const { title, description, url, imageUrl, videoUrl } = config;
  
  return {
    title: title,
    description: description,
    url: url,
    color: 0x4ECDC4, // Anpip brand color
    thumbnail: {
      url: imageUrl,
    },
    image: videoUrl ? undefined : {
      url: imageUrl,
    },
    video: videoUrl ? {
      url: videoUrl,
    } : undefined,
    footer: {
      text: 'Anpip - Die #1 Plattform für vertikale Videos',
      icon_url: 'https://anpip.com/icon.png',
    },
    timestamp: new Date().toISOString(),
  };
}

// ==================== LINKEDIN PREVIEW ====================
export function generateLinkedInTags(config: SocialSnippetConfig): Record<string, string> {
  const { title, description, imageUrl } = config;
  
  return {
    'linkedin:owner': 'anpip',
    'og:title': title,
    'og:description': description,
    'og:image': imageUrl,
  };
}

// ==================== PINTEREST RICH PINS ====================
export function generatePinterestTags(config: SocialSnippetConfig): Record<string, string> {
  const { title, description, imageUrl } = config;
  
  return {
    'og:type': 'article',
    'og:title': title,
    'og:description': description,
    'og:image': imageUrl,
    'article:publisher': 'https://www.pinterest.com/anpip',
  };
}

// ==================== REDDIT PREVIEW ====================
export function generateRedditPreview(config: SocialSnippetConfig): string {
  const { title, url, tags = [] } = config;
  
  return `**${title}**

${url}

${tags.map(tag => `r/${tag}`).join(' ')}
  `.trim();
}

// ==================== SNAPCHAT PREVIEW ====================
export function generateSnapchatTags(config: SocialSnippetConfig): Record<string, string> {
  const { title, description, imageUrl } = config;
  
  return {
    'snapchat:sticker': imageUrl,
    'snapchat:app_id': 'YOUR_SNAPCHAT_APP_ID',
  };
}

// ==================== EMAIL SHARE TEMPLATE ====================
export function generateEmailShareTemplate(config: SocialSnippetConfig): string {
  const { title, description, url } = config;
  
  const subject = encodeURIComponent(`Schau dir das an: ${title}`);
  const body = encodeURIComponent(`
Hallo,

ich habe gerade dieses Video auf Anpip gefunden und dachte, es könnte dich interessieren:

${title}

${description}

Hier ansehen: ${url}

Viel Spaß!
  `.trim());
  
  return `mailto:?subject=${subject}&body=${body}`;
}

// ==================== SMS SHARE TEMPLATE ====================
export function generateSMSShareTemplate(config: SocialSnippetConfig): string {
  const { title, url } = config;
  
  const body = encodeURIComponent(`
Schau dir das an: ${title}

${url}

#Anpip
  `.trim());
  
  return `sms:?body=${body}`;
}

// ==================== COPY-TO-CLIPBOARD TEMPLATE ====================
export function generateClipboardShareText(config: SocialSnippetConfig): string {
  const { title, description, url } = config;
  
  return `
🎬 ${title}

${description}

🔗 ${url}

#Anpip #VertikaleVideos
  `.trim();
}

// ==================== COMPLETE META TAGS GENERATOR ====================
export function generateAllSocialMetaTags(config: SocialSnippetConfig): string {
  const ogTags = generateOpenGraphTags(config);
  const twitterTags = generateTwitterCardTags(config);
  const linkedInTags = generateLinkedInTags(config);
  const pinterestTags = generatePinterestTags(config);
  const telegramTags = generateTelegramPreview(config);
  
  const allTags = {
    ...ogTags,
    ...twitterTags,
    ...linkedInTags,
    ...pinterestTags,
    ...telegramTags,
  };
  
  return Object.entries(allTags)
    .map(([property, content]) => {
      const attr = property.startsWith('og:') || property.startsWith('article:') 
        ? 'property' 
        : 'name';
      return `<meta ${attr}="${property}" content="${content}" />`;
    })
    .join('\n    ');
}

// ==================== SHARE BUTTONS CONFIG ====================
export const SHARE_BUTTONS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    getUrl: (url: string, text: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&via=anpip`,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    getUrl: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: '#0088cc',
    getUrl: (url: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0077B5',
    getUrl: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🔶',
    color: '#FF4500',
    getUrl: (url: string, title: string) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: '#E60023',
    getUrl: (url: string, media: string, description: string) => 
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(description)}`,
  },
  {
    id: 'email',
    name: 'E-Mail',
    icon: '📧',
    color: '#666666',
    getUrl: (url: string, title: string, description: string) => {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(`${description}\n\n${url}`);
      return `mailto:?subject=${subject}&body=${body}`;
    },
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: '💬',
    color: '#00C853',
    getUrl: (url: string, text: string) => `sms:?body=${encodeURIComponent(`${text} ${url}`)}`,
  },
];

export default {
  generateOpenGraphTags,
  generateTwitterCardTags,
  generateWhatsAppPreview,
  generateTelegramPreview,
  generateDiscordEmbed,
  generateLinkedInTags,
  generatePinterestTags,
  generateRedditPreview,
  generateSnapchatTags,
  generateEmailShareTemplate,
  generateSMSShareTemplate,
  generateClipboardShareText,
  generateAllSocialMetaTags,
  SHARE_BUTTONS,
};
