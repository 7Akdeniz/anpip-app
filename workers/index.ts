/**
 * Background Worker Entry Point
 * Startet alle Background Job Workers
 * 
 * Usage:
 *   npm run workers
 *   oder
 *   npx ts-node workers/index.ts
 */

import { getBackgroundJobQueue } from '../lib/background-jobs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚀 Anpip.com Background Workers Starting...');
console.log('📊 Environment:', {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
  hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
});

// Initialize job queue
const queue = getBackgroundJobQueue(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('✅ Job queue initialized');
console.log('🔄 Starting job processing...');

// Start processing jobs
queue.startProcessing();

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ Background Workers Running');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('Supported Job Types:');
console.log('  • video-processing       - Video compression & quality levels');
console.log('  • thumbnail-generation   - Thumbnail extraction');
console.log('  • ai-content-generation  - AI-powered content');
console.log('  • transcription          - Whisper transcription');
console.log('  • seo-generation         - SEO metadata');
console.log('  • video-repair           - Auto video repair');
console.log('  • audio-enhancement      - Audio improvement');
console.log('  • chapter-detection      - AI chapter detection');
console.log('  • translation            - Multi-language translation');
console.log('');
console.log('Press Ctrl+C to stop');
console.log('');

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('');
  console.log('📴 Shutting down workers...');
  queue.stopProcessing();
  
  // Wait for jobs to finish
  setTimeout(() => {
    console.log('✅ Workers stopped successfully');
    process.exit(0);
  }, 2000);
}

// Health check endpoint (optional)
if (process.env.ENABLE_HEALTH_CHECK === 'true') {
  const http = require('http');
  const port = process.env.WORKER_PORT || 3001;
  
  http.createServer((req: any, res: any) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }).listen(port, () => {
    console.log(`🏥 Health check available at http://localhost:${port}/health`);
  });
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown();
});
