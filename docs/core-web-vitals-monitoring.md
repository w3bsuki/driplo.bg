# Core Web Vitals Monitoring Guide

## Overview

This guide documents the implementation of Core Web Vitals monitoring in the Driplo marketplace to track and improve real user performance metrics.

## What are Core Web Vitals?

Core Web Vitals are Google's key metrics for measuring user experience:

1. **LCP (Largest Contentful Paint)** - Loading performance
   - Target: < 2.5 seconds
   - Measures when the main content loads

2. **FID (First Input Delay)** / **INP (Interaction to Next Paint)** - Interactivity
   - FID Target: < 100ms
   - INP Target: < 200ms
   - Measures responsiveness to user input

3. **CLS (Cumulative Layout Shift)** - Visual stability
   - Target: < 0.1
   - Measures unexpected layout shifts

Additional metrics tracked:
- **FCP (First Contentful Paint)** - First render
- **TTFB (Time to First Byte)** - Server response time

## Implementation

### 1. Web Vitals Utility (`/src/lib/utils/web-vitals.ts`)

Core monitoring functionality:
- Automatic metric collection
- Batched reporting
- Connection-aware sampling
- Performance marks and measures

### 2. Debug Component (`/src/lib/components/debug/WebVitalsDebug.svelte`)

Development-only visual monitor showing:
- Real-time metric values
- Color-coded ratings (good/needs-improvement/poor)
- Metric descriptions
- Minimizable interface

### 3. Metrics API (`/src/routes/api/metrics/+server.ts`)

Endpoint for collecting metrics:
- Receives batched metrics
- Ready for analytics integration
- Supports multiple backends

### 4. Integration Points

**App Layout (`/src/routes/+layout.svelte`)**
```javascript
// Initialize monitoring
initWebVitals({
  sendToAnalytics: (metric) => {
    // Send to your analytics service
  },
  sampleRate: dev ? 1 : 0.1, // 100% dev, 10% production
  metadata: {
    version: '1.0.0',
    environment: dev ? 'development' : 'production'
  }
});
```

## Usage

### Basic Setup

1. **Install web-vitals package:**
   ```bash
   pnpm add web-vitals
   ```

2. **Initialize in root layout:**
   Already configured in `/src/routes/+layout.svelte`

3. **View metrics in development:**
   The debug panel appears automatically in dev mode

### Custom Performance Marks

```javascript
import { markPerformance, measurePerformance } from '$lib/utils/web-vitals';

// Mark important events
markPerformance('search-start');

// After operation completes
markPerformance('search-end');

// Measure the duration
const duration = measurePerformance('search-duration', 'search-start', 'search-end');
```

### Monitoring Specific Components

```javascript
import { onMount } from 'svelte';
import { markPerformance } from '$lib/utils/web-vitals';

onMount(() => {
  markPerformance('heavy-component-mounted', {
    component: 'AnalyticsDashboard',
    dataSize: data.length
  });
});
```

## Analytics Integration

### Google Analytics 4

```javascript
initWebVitals({
  sendToAnalytics: (metric) => {
    gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      metric_delta: metric.delta,
      non_interaction: true,
      event_category: 'Web Vitals'
    });
  }
});
```

### Vercel Analytics

```javascript
import { webVitals } from '@vercel/analytics';

initWebVitals({
  sendToAnalytics: (metric) => {
    webVitals(metric);
  }
});
```

### Custom Backend (Supabase)

```sql
-- Create table for metrics
CREATE TABLE web_vitals (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  delta NUMERIC,
  url TEXT,
  connection_type TEXT,
  user_agent TEXT,
  metadata JSONB
);

-- Add indexes
CREATE INDEX idx_web_vitals_created_at ON web_vitals(created_at DESC);
CREATE INDEX idx_web_vitals_name_rating ON web_vitals(name, rating);
```

## Performance Thresholds

### Good Performance
- LCP < 2.5s
- FID < 100ms
- INP < 200ms
- CLS < 0.1
- FCP < 1.8s
- TTFB < 800ms

### Needs Improvement
- LCP 2.5s - 4s
- FID 100ms - 300ms
- INP 200ms - 500ms
- CLS 0.1 - 0.25
- FCP 1.8s - 3s
- TTFB 800ms - 1800ms

### Poor Performance
- LCP > 4s
- FID > 300ms
- INP > 500ms
- CLS > 0.25
- FCP > 3s
- TTFB > 1800ms

## Optimization Strategies

### Improve LCP
1. Optimize images (already implemented)
2. Preload critical resources
3. Reduce server response time
4. Use CDN for assets

### Improve FID/INP
1. Use dynamic imports (implemented)
2. Minimize main thread work
3. Use web workers for heavy computation
4. Debounce/throttle event handlers

### Improve CLS
1. Set dimensions on images/videos
2. Reserve space for dynamic content
3. Avoid inserting content above existing content
4. Use CSS transforms for animations

## Monitoring Dashboard

### Development
- Visual debug panel shows real-time metrics
- Console logging for detailed information
- All metrics collected (100% sample rate)

### Production
- 10% sampling rate by default
- Metrics sent to analytics service
- No visual indicators

### Query Metrics (if using Supabase)

```sql
-- Average metrics by hour
SELECT 
  date_trunc('hour', created_at) as hour,
  name,
  AVG(value) as avg_value,
  COUNT(*) as sample_count,
  COUNT(*) FILTER (WHERE rating = 'good') as good_count,
  COUNT(*) FILTER (WHERE rating = 'poor') as poor_count
FROM web_vitals
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour, name
ORDER BY hour DESC, name;

-- P75 values (what Google uses)
SELECT 
  name,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75_value,
  COUNT(*) as total_samples
FROM web_vitals
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY name;
```

## Debugging Poor Scores

### 1. Use Chrome DevTools
- Lighthouse tab for lab data
- Performance tab for detailed timeline
- Network tab for resource timing

### 2. Check Specific Pages
```javascript
// Add page-specific tracking
initWebVitals({
  metadata: {
    page_type: getPageType($page.url.pathname),
    is_authenticated: !!user
  }
});
```

### 3. Monitor Regressions
Set up alerts when metrics degrade:
```sql
-- Alert when P75 exceeds threshold
SELECT name, p75_value
FROM (
  SELECT 
    name,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75_value
  FROM web_vitals
  WHERE created_at > NOW() - INTERVAL '1 hour'
  GROUP BY name
) metrics
WHERE 
  (name = 'LCP' AND p75_value > 2500) OR
  (name = 'FID' AND p75_value > 100) OR
  (name = 'CLS' AND p75_value > 0.1);
```

## Best Practices

1. **Monitor Continuously**
   - Track metrics in production
   - Set up alerts for regressions
   - Review weekly trends

2. **Optimize Gradually**
   - Focus on pages with most traffic
   - Fix issues causing poor scores
   - Measure impact of changes

3. **Consider User Context**
   - Connection speed affects metrics
   - Device capabilities matter
   - Geographic location impacts TTFB

4. **Test Realistic Scenarios**
   - Use throttling in DevTools
   - Test on real devices
   - Consider slow connections

## Next Steps

1. **Connect to Analytics Service**
   - Choose analytics provider
   - Update sendToAnalytics function
   - Configure dashboards

2. **Set Up Alerts**
   - Define thresholds
   - Configure notifications
   - Create runbooks

3. **Create Performance Budget**
   - Set targets for each metric
   - Integrate into CI/CD
   - Block deploys on regressions

4. **Regular Reviews**
   - Weekly metric reviews
   - Monthly trend analysis
   - Quarterly goal setting