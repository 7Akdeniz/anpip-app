# 🚀 Quick Start Guide - Anpip 2025 Optimizations

## Immediate Actions After Deployment

### 1. Verify SEO Setup
```bash
# Check robots.txt
curl https://anpip.com/robots.txt

# Check main sitemap
curl https://anpip.com/sitemap.xml

# Check video sitemap
curl https://anpip.com/sitemap-videos.xml

# Check market sitemap
curl https://anpip.com/sitemap-market.xml
```

### 2. Submit to Search Engines

#### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: `https://anpip.com`
3. Submit sitemaps:
   - `https://anpip.com/sitemap.xml`
   - `https://anpip.com/sitemap-videos.xml`
   - `https://anpip.com/sitemap-market.xml`

#### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Add site: `https://anpip.com`
3. Submit sitemaps (same as Google)

#### Yandex Webmaster
1. Go to https://webmaster.yandex.com
2. Add site and submit sitemaps

### 3. Test Web Vitals

#### Using PageSpeed Insights
```
https://pagespeed.web.dev/?url=https://anpip.com
```

#### Using Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

Target Scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

### 4. Test PWA Installation

#### Mobile (iOS/Android)
1. Open https://anpip.com in Safari/Chrome
2. Look for "Add to Home Screen" prompt
3. Install and test offline functionality

#### Desktop (Chrome/Edge)
1. Open https://anpip.com
2. Look for install icon in address bar
3. Click and install
4. Test as standalone app

### 5. Verify Schema.org Markup

#### Rich Results Test
```
https://search.google.com/test/rich-results?url=https://anpip.com
```

#### Schema Markup Validator
```
https://validator.schema.org/#url=https://anpip.com
```

### 6. Test Accessibility

#### WAVE Tool
```
https://wave.webaim.org/report#/https://anpip.com
```

#### axe DevTools
1. Install axe browser extension
2. Run audit on https://anpip.com
3. Fix any issues

### 7. Monitor Performance

#### Set Up Web Vitals Monitoring
```typescript
// In your app/_layout.tsx or main entry point:
import { initWebVitals } from '@/lib/webVitals';

initWebVitals((metrics) => {
  console.log('Web Vitals:', metrics);
  
  // Send to your analytics
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify(metrics),
  });
});
```

#### Check Core Web Vitals
```javascript
// Open Browser Console
import { getWebVitalsMetrics, getPerformanceRating } from '@/lib/webVitals';

const metrics = getWebVitalsMetrics();
console.log('LCP:', getPerformanceRating('LCP', metrics.lcp));
console.log('FID:', getPerformanceRating('FID', metrics.fid));
console.log('CLS:', getPerformanceRating('CLS', metrics.cls));
```

---

## Using the New Features

### 1. Add SEO to a Page

```typescript
import { generateMetaTags, generateVideoSchema } from '@/lib/seo';
import { Head } from 'expo-router';

export default function VideoPage({ video }) {
  const metaTags = generateMetaTags({
    title: video.description || 'Anpip Video',
    description: `${video.description} | Anpip`,
    canonical: `https://anpip.com/video/${video.id}`,
    ogType: 'video.other',
    ogImage: video.thumbnail_url,
    ogVideo: video.video_url,
    keywords: ['video', 'social media', video.location_city],
    geoPosition: `${video.location_lat},${video.location_lon}`,
    geoPlacename: video.location_city,
  });

  const videoSchema = generateVideoSchema({
    title: video.description,
    description: video.description,
    uploadDate: video.created_at,
    thumbnailUrl: video.thumbnail_url,
    contentUrl: video.video_url,
    duration: 'PT30S', // ISO 8601 format
    location: {
      name: video.location_city,
      latitude: video.location_lat,
      longitude: video.location_lon,
    },
  });

  return (
    <>
      <Head>
        <div dangerouslySetInnerHTML={{ __html: metaTags }} />
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
      </Head>
      {/* Your content */}
    </>
  );
}
```

### 2. Use GEO Services

```typescript
import { 
  getBrowserLocation, 
  calculateDistance,
  sortByDistance 
} from '@/lib/geoService';

// Get user location
const userLocation = await getBrowserLocation();

// Calculate distance
const distance = calculateDistance(
  userLocation.lat,
  userLocation.lon,
  videoLat,
  videoLon
);

// Sort items by distance
const sortedVideos = sortByDistance(videos, userLocation);
```

### 3. Optimize Video Performance

```typescript
import { useVideoPerformance } from '@/hooks/useVideoPerformance';

function VideoPlayer({ videoUrl }) {
  const videoRef = useRef(null);
  const { isVisible, isLoading, isReady } = useVideoPerformance(videoRef, {
    autoplay: true,
    muted: true,
    enableLazyLoad: true,
    intersectionThreshold: 0.5,
  });

  return (
    <video
      ref={videoRef}
      src={isVisible ? videoUrl : undefined}
      data-video-player
    >
      {isLoading && <Spinner />}
    </video>
  );
}
```

### 4. Track Custom Metrics

```typescript
import { markPerformance, measurePerformance } from '@/lib/performance';

// Mark start
markPerformance('video-load-start');

// ... load video ...

// Mark end
markPerformance('video-load-end');

// Measure
measurePerformance('video-load', 'video-load-start', 'video-load-end');
```

### 5. Implement Accessibility

```typescript
import { 
  announceForAccessibility,
  generateVideoLabel,
  setupKeyboardNavigation 
} from '@/lib/accessibility';

// Initialize
useEffect(() => {
  setupKeyboardNavigation();
}, []);

// Announce to screen readers
announceForAccessibility('Video hochgeladen');

// Generate accessible label
const label = generateVideoLabel(
  video.description,
  video.username,
  video.likes_count,
  video.location_city
);
```

---

## Troubleshooting

### Service Worker Not Updating
```bash
# Clear cache and reload
# In Browser: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

# Or programmatically:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

### Sitemap Not Found
```bash
# Check vercel.json rewrites
# Ensure these are present:
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

### Web Vitals Not Tracking
```bash
# Make sure you initialized in _layout.tsx:
import { initWebVitals } from '@/lib/webVitals';

useEffect(() => {
  initWebVitals((metrics) => {
    console.log('Metrics:', metrics);
  });
}, []);
```

---

## Performance Checklist

- [ ] PageSpeed score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] All images lazy loaded
- [ ] Videos use poster frames
- [ ] Service Worker active
- [ ] Brotli compression enabled
- [ ] CDN configured

## SEO Checklist

- [ ] Robots.txt submitted
- [ ] Sitemaps submitted to Google
- [ ] Sitemaps submitted to Bing
- [ ] Schema.org markup valid
- [ ] Meta tags complete
- [ ] Open Graph working
- [ ] Canonical URLs set
- [ ] Hreflang tags present
- [ ] Mobile-friendly test passed
- [ ] Rich results showing

## Accessibility Checklist

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast WCAG AA
- [ ] Skip links present
- [ ] ARIA labels correct
- [ ] Focus indicators visible
- [ ] Reduced motion respected
- [ ] Alt text on images
- [ ] Captions on videos
- [ ] Form labels present

---

**Ready to dominate search rankings! 🚀**
