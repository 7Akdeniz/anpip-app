// ================================================
// ANPIP AUTOPILOT CRON JOB
// ================================================
// Supabase Edge Function für tägliche Auto-Optimierungen
// Wird per Supabase Cron täglich ausgeführt
// ================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ================================================
// CONFIGURATION
// ================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ================================================
// MAIN HANDLER
// ================================================

serve(async (req) => {
  try {
    // Verify cron secret (security)
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚀 Starting Autopilot Cron Job...');
    const startTime = Date.now();

    // Get autopilot config
    const { data: config } = await supabase
      .from('autopilot_config')
      .select('*')
      .single();

    if (!config || !config.enabled) {
      console.log('⚠️  Autopilot is disabled');
      return new Response(
        JSON.stringify({ message: 'Autopilot is disabled' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];

    // ==========================================
    // 1. SEO OPTIMIZATION (DAILY)
    // ==========================================
    if (config.services?.seo) {
      console.log('🔍 Running SEO optimization...');
      const seoResult = await runSEOOptimization();
      results.push(seoResult);
    }

    // ==========================================
    // 2. GEO OPTIMIZATION (DAILY)
    // ==========================================
    if (config.services?.geo) {
      console.log('🌍 Running GEO optimization...');
      const geoResult = await runGEOOptimization();
      results.push(geoResult);
    }

    // ==========================================
    // 3. CONTENT QUALITY (DAILY)
    // ==========================================
    if (config.services?.content) {
      console.log('🎥 Running content quality check...');
      const contentResult = await runContentQualityCheck();
      results.push(contentResult);
    }

    // ==========================================
    // 4. SECURITY SCAN (HOURLY)
    // ==========================================
    if (config.services?.security) {
      console.log('🛡️  Running security scan...');
      const securityResult = await runSecurityScan();
      results.push(securityResult);
    }

    // ==========================================
    // 5. PERFORMANCE OPTIMIZATION (DAILY)
    // ==========================================
    if (config.services?.performance) {
      console.log('⚡ Running performance optimization...');
      const perfResult = await runPerformanceOptimization();
      results.push(perfResult);
    }

    // ==========================================
    // 6. TREND DETECTION (DAILY)
    // ==========================================
    if (config.services?.trends) {
      console.log('📈 Running trend detection...');
      const trendResult = await runTrendDetection();
      results.push(trendResult);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Autopilot completed in ${duration}ms`);

    // Log overall result
    await logAutopilotRun(results, duration);

    return new Response(
      JSON.stringify({
        success: true,
        duration,
        results,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Autopilot error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// ================================================
// JOB FUNCTIONS
// ================================================

async function runSEOOptimization(): Promise<any> {
  const startTime = Date.now();
  let actionsCount = 0;

  try {
    // 1. Optimize recent video meta tags
    const { data: videos } = await supabase
      .from('videos')
      .select('id, title, description, market_id, location_city, location_country')
      .is('seo_optimized_at', null)
      .limit(50);

    for (const video of videos || []) {
      const seoTitle = optimizeTitle(video.title, video.location_city);
      const seoDescription = generateSEODescription(video);
      const keywords = generateKeywords(video);

      await supabase
        .from('videos')
        .update({
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: keywords,
          seo_optimized_at: new Date().toISOString(),
        })
        .eq('id', video.id);

      actionsCount++;
    }

    // 2. Update city pages
    const { data: cities } = await supabase.rpc('get_top_cities', { limit_count: 30 });

    for (const city of cities || []) {
      await supabase.from('city_pages').upsert({
        city: city.city,
        country: city.country,
        seo_title: `Videos from ${city.city}, ${city.country} | Anpip.com`,
        seo_description: `Watch ${city.video_count} local videos from ${city.city}`,
        video_count: city.video_count,
        updated_at: new Date().toISOString(),
      });

      actionsCount++;
    }

    return {
      job: 'seo-optimization',
      success: true,
      duration: Date.now() - startTime,
      actionsCount,
    };

  } catch (error) {
    return {
      job: 'seo-optimization',
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function runGEOOptimization(): Promise<any> {
  const startTime = Date.now();
  let actionsCount = 0;

  try {
    // Analyze regional trends
    const { data: trends } = await supabase.rpc('get_regional_trends', { days: 7 });

    for (const trend of trends || []) {
      await supabase.from('regional_trends').upsert({
        country: trend.country,
        city: trend.city,
        category: trend.category,
        video_count: trend.count,
        date: new Date().toISOString().split('T')[0],
      });

      actionsCount++;
    }

    return {
      job: 'geo-optimization',
      success: true,
      duration: Date.now() - startTime,
      actionsCount,
    };

  } catch (error) {
    return {
      job: 'geo-optimization',
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function runContentQualityCheck(): Promise<any> {
  const startTime = Date.now();
  let actionsCount = 0;

  try {
    // Check video quality
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .is('quality_checked', null)
      .limit(50);

    for (const video of videos || []) {
      const qualityScore = calculateQualityScore(video);

      await supabase
        .from('videos')
        .update({
          quality_score: qualityScore,
          quality_checked: true,
        })
        .eq('id', video.id);

      actionsCount++;
    }

    // Detect trending videos
    const { data: trending } = await supabase.rpc('get_trending_videos', {
      hours: 24,
      min_views: 100,
    });

    for (const video of trending || []) {
      await supabase
        .from('videos')
        .update({
          is_trending: true,
          trending_detected_at: new Date().toISOString(),
        })
        .eq('id', video.id);

      actionsCount++;
    }

    return {
      job: 'content-quality',
      success: true,
      duration: Date.now() - startTime,
      actionsCount,
    };

  } catch (error) {
    return {
      job: 'content-quality',
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function runSecurityScan(): Promise<any> {
  const startTime = Date.now();
  let actionsCount = 0;

  try {
    // Check for suspicious new accounts
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    for (const user of users || []) {
      const isSuspicious = analyzeBotBehavior(user);

      if (isSuspicious) {
        await supabase.from('user_flags').insert({
          user_id: user.id,
          reason: 'bot-suspicious',
          severity: 'medium',
        });

        actionsCount++;
      }
    }

    // Check for spam content
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    for (const video of videos || []) {
      const isSpam = analyzeSpamContent(video);

      if (isSpam) {
        await supabase.from('content_flags').insert({
          video_id: video.id,
          reason: 'spam',
        });

        actionsCount++;
      }
    }

    return {
      job: 'security-scan',
      success: true,
      duration: Date.now() - startTime,
      actionsCount,
    };

  } catch (error) {
    return {
      job: 'security-scan',
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function runPerformanceOptimization(): Promise<any> {
  const startTime = Date.now();
  let actionsCount = 0;

  try {
    // Clean up old logs (>30 days)
    const { error } = await supabase
      .from('autopilot_logs')
      .delete()
      .lt('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!error) actionsCount++;

    // More performance optimizations would go here
    // - Analyze slow queries
    // - Optimize indexes
    // - Cache warming
    // - etc.

    return {
      job: 'performance-optimization',
      success: true,
      duration: Date.now() - startTime,
      actionsCount,
    };

  } catch (error) {
    return {
      job: 'performance-optimization',
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function runTrendDetection(): Promise<any> {
  const startTime = Date.now();
  let actionsCount = 0;

  try {
    // Trend detection logic would go here
    // For now, just a placeholder

    return {
      job: 'trend-detection',
      success: true,
      duration: Date.now() - startTime,
      actionsCount,
    };

  } catch (error) {
    return {
      job: 'trend-detection',
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function optimizeTitle(title: string, city?: string): string {
  let optimized = title;
  if (optimized.length > 60) {
    optimized = optimized.substring(0, 57) + '...';
  }
  if (city && !optimized.includes(city)) {
    optimized = `${optimized} | ${city}`;
  }
  return optimized;
}

function generateSEODescription(video: any): string {
  const description = video.description || video.title;
  let optimized = description.substring(0, 155);
  if (video.location_city) {
    optimized += ` | ${video.location_city}`;
  }
  optimized += ' | Anpip.com';
  return optimized.substring(0, 160);
}

function generateKeywords(video: any): string[] {
  const keywords: string[] = [];
  const titleWords = video.title?.toLowerCase().split(/\s+/) || [];
  keywords.push(...titleWords.filter((w: string) => w.length > 3));
  if (video.location_city) keywords.push(video.location_city.toLowerCase());
  if (video.location_country) keywords.push(video.location_country.toLowerCase());
  return Array.from(new Set(keywords)).slice(0, 10);
}

function calculateQualityScore(video: any): number {
  let score = 50;
  if (video.thumbnail_url) score += 10;
  if (video.description && video.description.length > 50) score += 10;
  if (video.title && video.title.length >= 10 && video.title.length <= 100) score += 10;
  if (video.duration && video.duration > 10) score += 10;
  if (video.location_city) score += 5;
  if (video.market_id) score += 5;
  return Math.min(score, 100);
}

function analyzeBotBehavior(user: any): boolean {
  const accountAge = Date.now() - new Date(user.created_at).getTime();
  const accountAgeHours = accountAge / (1000 * 60 * 60);

  if (accountAgeHours < 1 && user.videos_count > 10) return true;
  if (accountAgeHours < 24 && user.following_count > 100) return true;
  if (user.following_count > 1000 && user.followers_count < 10) return true;

  return false;
}

function analyzeSpamContent(video: any): boolean {
  const title = video.title?.toLowerCase() || '';
  const spamKeywords = ['click here', 'free money', 'buy now', 'limited offer'];
  return spamKeywords.some(keyword => title.includes(keyword));
}

async function logAutopilotRun(results: any[], duration: number): Promise<void> {
  const totalActions = results.reduce((sum, r) => sum + (r.actionsCount || 0), 0);
  const successCount = results.filter(r => r.success).length;

  await supabase.from('autopilot_logs').insert({
    job_id: 'autopilot-cron',
    job_name: 'Autopilot Daily Run',
    success: successCount === results.length,
    duration,
    actions_count: totalActions,
    metrics: { results },
    timestamp: new Date().toISOString(),
  });
}
