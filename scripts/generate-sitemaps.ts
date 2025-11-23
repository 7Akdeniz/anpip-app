/**
 * SITEMAP GENERATION SCRIPT
 * Generiert alle Sitemaps für Anpip.com
 * 
 * Usage: npx ts-node scripts/generate-sitemaps.ts
 */

import { supabase } from '../lib/supabase';
import { SEOManager } from '../lib/seo/index';
import { MARKET_CATEGORIES } from '../lib/seo/market-seo';
import fs from 'fs';
import path from 'path';

const seoManager = new SEOManager();

async function generateAllSitemaps() {
  console.log('🚀 Starting sitemap generation...\n');

  try {
    // 1. Videos laden
    console.log('📹 Loading videos...');
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (videosError) throw videosError;
    console.log(`✅ Loaded ${videos?.length || 0} videos\n`);

    // 2. Profile laden
    console.log('👤 Loading profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, updated_at')
      .limit(5000);

    if (profilesError) throw profilesError;
    console.log(`✅ Loaded ${profiles?.length || 0} profiles\n`);

    // 3. Trending Hashtags extrahieren
    console.log('🏷️ Extracting hashtags...');
    const hashtagSet = new Set<string>();
    videos?.forEach(video => {
      if (video.hashtags && Array.isArray(video.hashtags)) {
        video.hashtags.forEach((tag: string) => hashtagSet.add(tag));
      }
    });
    const hashtags = Array.from(hashtagSet).slice(0, 500); // Top 500
    console.log(`✅ Found ${hashtags.length} unique hashtags\n`);

    // 4. Sitemaps generieren
    console.log('🗺️ Generating sitemaps...');
    const sitemaps = await seoManager.generateAllSitemaps({
      videos: videos || [],
      profiles: profiles || [],
      categories: MARKET_CATEGORIES,
      hashtags
    });

    // 5. In public/ Ordner speichern
    const publicDir = path.join(process.cwd(), 'public');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Sitemap Index
    fs.writeFileSync(
      path.join(publicDir, 'sitemap.xml'),
      sitemaps.index
    );
    console.log('✅ sitemap.xml');

    // Main Sitemap
    fs.writeFileSync(
      path.join(publicDir, 'sitemap-main.xml'),
      sitemaps.main
    );
    console.log('✅ sitemap-main.xml');

    // Video Sitemap
    fs.writeFileSync(
      path.join(publicDir, 'sitemap-videos.xml'),
      sitemaps.videos
    );
    console.log('✅ sitemap-videos.xml');

    // Profile Sitemap
    fs.writeFileSync(
      path.join(publicDir, 'sitemap-profiles.xml'),
      sitemaps.profiles
    );
    console.log('✅ sitemap-profiles.xml');

    // Market Sitemap
    fs.writeFileSync(
      path.join(publicDir, 'sitemap-market.xml'),
      sitemaps.market
    );
    console.log('✅ sitemap-market.xml');

    // Hashtag Sitemap
    fs.writeFileSync(
      path.join(publicDir, 'sitemap-hashtags.xml'),
      sitemaps.hashtags
    );
    console.log('✅ sitemap-hashtags.xml');

    // robots.txt aktualisieren
    fs.writeFileSync(
      path.join(publicDir, 'robots.txt'),
      sitemaps.robotsTxt
    );
    console.log('✅ robots.txt');

    console.log('\n🎉 All sitemaps generated successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Videos: ${videos?.length || 0}`);
    console.log(`   Profiles: ${profiles?.length || 0}`);
    console.log(`   Hashtags: ${hashtags.length}`);
    console.log(`   Market Categories: ${MARKET_CATEGORIES.length}`);
    console.log('\n📂 Files saved to: public/');
    console.log('\n🔗 Next Steps:');
    console.log('   1. Deploy to production');
    console.log('   2. Submit to Google Search Console');
    console.log('   3. Submit to Bing Webmaster Tools');
    console.log('\n✨ Done!\n');

  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run
generateAllSitemaps();
