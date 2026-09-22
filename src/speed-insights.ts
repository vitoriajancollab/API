/**
 * Vercel Speed Insights Configuration
 * 
 * IMPORTANT NOTE:
 * Vercel Speed Insights is designed for CLIENT-SIDE performance monitoring.
 * It measures browser-based Core Web Vitals like:
 * - Time to First Byte (TTFB)
 * - Largest Contentful Paint (LCP)
 * - Cumulative Layout Shift (CLS)
 * - First Contentful Paint (FCP)
 * - First Input Delay (FID)
 * 
 * This Express API is a backend service that returns JSON responses,
 * not HTML pages. Speed Insights will NOT provide meaningful metrics
 * for pure API endpoints.
 * 
 * WHEN TO USE THIS:
 * - If you add HTML page routes to this Express app
 * - If you serve a frontend application from this server
 * 
 * For backend API monitoring, consider:
 * - Vercel's built-in logging and analytics
 * - APM tools (New Relic, Datadog, etc.)
 * - Custom middleware for request/response timing
 */

import { Request, Response, NextFunction } from "express";

/**
 * Speed Insights HTML injection script
 * This script should be injected into HTML responses
 * Package installed: @vercel/speed-insights
 */
export const SPEED_INSIGHTS_SCRIPT = `
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
`;

/**
 * Middleware to inject Speed Insights into HTML responses
 * Only applies if you serve HTML pages from this API
 */
export function speedInsightsMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;

  res.send = function (data: any): Response {
    // Only inject for HTML responses
    if (res.getHeader('Content-Type')?.toString().includes('text/html') && typeof data === 'string') {
      // Inject Speed Insights before closing </head> or </body> tag
      if (data.includes('</head>')) {
        data = data.replace('</head>', `${SPEED_INSIGHTS_SCRIPT}</head>`);
      } else if (data.includes('</body>')) {
        data = data.replace('</body>', `${SPEED_INSIGHTS_SCRIPT}</body>`);
      }
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Example of how to use Speed Insights if you add HTML routes:
 * 
 * import { speedInsightsMiddleware } from './speed-insights';
 * 
 * app.use(speedInsightsMiddleware);
 * 
 * app.get('/html-page', (req, res) => {
 *   res.send(`
 *     <!DOCTYPE html>
 *     <html>
 *       <head><title>My Page</title></head>
 *       <body>
 *         <h1>Hello World</h1>
 *       </body>
 *     </html>
 *   `);
 * });
 */
