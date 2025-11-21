/**
 * Web Vitals Analytics API
 * POST /api/analytics/vitals+api.ts
 * Sammelt und speichert Core Web Vitals Metriken
 */

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const {
      lcp,
      fid,
      cls,
      inp,
      fcp,
      ttfb,
      videoLoadTime,
      apiResponseTime,
      timestamp,
      url,
    } = data;

    // Log to console (in production, send to database/analytics service)
    console.log('📊 Web Vitals:', {
      lcp: lcp ? `${Math.round(lcp)}ms` : 'N/A',
      fid: fid ? `${Math.round(fid)}ms` : 'N/A',
      cls: cls ? cls.toFixed(3) : 'N/A',
      inp: inp ? `${Math.round(inp)}ms` : 'N/A',
      fcp: fcp ? `${Math.round(fcp)}ms` : 'N/A',
      ttfb: ttfb ? `${Math.round(ttfb)}ms` : 'N/A',
      url,
    });

    // Rate metrics
    const ratings = {
      lcp: rateMetric('LCP', lcp),
      fid: rateMetric('FID', fid),
      cls: rateMetric('CLS', cls),
      inp: rateMetric('INP', inp),
      fcp: rateMetric('FCP', fcp),
      ttfb: rateMetric('TTFB', ttfb),
    };

    // In production: Save to database (Supabase, PostgreSQL, etc.)
    // const { error } = await supabase.from('web_vitals').insert({
    //   lcp, fid, cls, inp, fcp, ttfb,
    //   videoLoadTime, apiResponseTime,
    //   timestamp, url,
    //   user_agent: request.headers.get('user-agent'),
    //   ratings,
    // });

    // Calculate overall score (0-100)
    const score = calculateOverallScore(ratings);

    return new Response(
      JSON.stringify({
        success: true,
        ratings,
        score,
        message: score >= 90 ? 'Excellent!' : score >= 70 ? 'Good' : 'Needs improvement',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to save metrics' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Rate a metric (good/needs-improvement/poor)
 */
function rateMetric(
  metric: string,
  value: number | undefined
): 'good' | 'needs-improvement' | 'poor' | 'n/a' {
  if (value === undefined) return 'n/a';

  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    INP: { good: 200, poor: 500 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metric];
  if (!threshold) return 'n/a';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Calculate overall performance score (0-100)
 */
function calculateOverallScore(ratings: Record<string, string>): number {
  const weights = {
    lcp: 25,
    fid: 15,
    cls: 15,
    inp: 25, // INP replaces FID in 2024
    fcp: 10,
    ttfb: 10,
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(ratings).forEach(([metric, rating]) => {
    if (rating === 'n/a') return;

    const weight = weights[metric as keyof typeof weights] || 0;
    const score = rating === 'good' ? 100 : rating === 'needs-improvement' ? 60 : 0;

    totalScore += score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}
