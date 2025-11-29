/**
 * VIDEO PROCESSOR WORKER
 * 
 * Holt Jobs aus der Queue und verarbeitet Videos:
 * - Chunk-Kombination
 * - Multi-Quality Transcoding
 * - HLS/DASH Generierung
 * - Thumbnails
 * - Auto-Kapitel für lange Videos
 */

import { createServiceSupabase } from '../lib/supabase';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

let supabase = null as any;
try {
  supabase = createServiceSupabase();
} catch (err) {
  // Fallback: try old env names for backward compatibility
  try {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(
      process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''
    );
  } catch (e) {
    console.error('Unable to initialize Supabase client in worker:', err, e);
    throw err;
  }
}

const WORKER_ID = `worker_${process.env.HOSTNAME || Math.random().toString(36).substr(2, 9)}`;
const POLL_INTERVAL = 5000; // 5 Sekunden
const TEMP_DIR = '/tmp/video-processing';

/**
 * Worker-Hauptschleife
 */
async function main() {
  console.log(`🚀 Video Worker ${WORKER_ID} started`);

  // Erstelle Temp-Verzeichnis
  await fs.mkdir(TEMP_DIR, { recursive: true });

  while (true) {
    try {
      // Hole nächsten Job aus Queue
      const job = await getNextJob();

      if (job) {
        await processJob(job);
      } else {
        // Keine Jobs verfügbar, warte
        await sleep(POLL_INTERVAL);
      }
    } catch (error) {
      console.error('Worker error:', error);
      await sleep(POLL_INTERVAL);
    }
  }
}

/**
 * Holt nächsten Job aus Queue
 */
async function getNextJob() {
  const { data, error } = await supabase
    .from('processing_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return null;

  // Job als "processing" markieren
  await supabase
    .from('processing_queue')
    .update({
      status: 'processing',
      worker_id: WORKER_ID,
      started_at: new Date().toISOString(),
    })
    .eq('id', data.id);

  return data;
}

/**
 * Verarbeitet einen Job
 */
async function processJob(job: any) {
  console.log(`Processing job ${job.id}: ${job.task_type}`);

  try {
    switch (job.task_type) {
      case 'combine_chunks':
        await combineChunks(job);
        break;
      case 'transcode':
        await transcodeVideo(job);
        break;
      case 'thumbnail':
        await generateThumbnails(job);
        break;
      case 'hls_dash':
        await generateStreamingFormats(job);
        break;
      default:
        throw new Error(`Unknown task type: ${job.task_type}`);
    }

    // Job als erfolgreich markieren
    await supabase
      .from('processing_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    console.log(`✅ Job ${job.id} completed`);
  } catch (error: any) {
    console.error(`❌ Job ${job.id} failed:`, error);

    // Retry-Logik
    const newRetryCount = (job.retry_count || 0) + 1;
    const shouldRetry = newRetryCount <= job.max_retries;

    await supabase
      .from('processing_queue')
      .update({
        status: shouldRetry ? 'pending' : 'failed',
        retry_count: newRetryCount,
        error_message: error.message,
        worker_id: null,
      })
      .eq('id', job.id);
  }
}

/**
 * Kombiniert Video-Chunks
 */
async function combineChunks(job: any) {
  const { upload_path } = job;
  const workDir = path.join(TEMP_DIR, job.id);
  await fs.mkdir(workDir, { recursive: true });

  // Download alle Chunks
  const { data: chunks } = await supabase.storage
    .from('videos')
    .list(upload_path);

  if (!chunks) throw new Error('No chunks found');

  const sortedChunks = chunks
    .filter((c) => c.name.startsWith('chunk_'))
    .sort((a, b) => {
      const aIdx = parseInt(a.name.replace('chunk_', ''));
      const bIdx = parseInt(b.name.replace('chunk_', ''));
      return aIdx - bIdx;
    });

  // Download Chunks
  const chunkPaths: string[] = [];
  for (const chunk of sortedChunks) {
    const chunkPath = path.join(workDir, chunk.name);
    const { data } = await supabase.storage
      .from('videos')
      .download(`${upload_path}/${chunk.name}`);

    if (data) {
      await fs.writeFile(chunkPath, Buffer.from(await data.arrayBuffer()));
      chunkPaths.push(chunkPath);
    }
  }

  // Kombiniere mit FFmpeg
  const outputPath = path.join(workDir, 'combined.mp4');
  const concatFile = path.join(workDir, 'concat.txt');
  await fs.writeFile(
    concatFile,
    chunkPaths.map((p) => `file '${p}'`).join('\n')
  );

  await execAsync(`ffmpeg -f concat -safe 0 -i ${concatFile} -c copy ${outputPath}`);

  // Upload kombiniertes Video
  const finalPath = `${upload_path}/original.mp4`;
  const videoData = await fs.readFile(outputPath);

  await supabase.storage.from('videos').upload(finalPath, videoData, {
    contentType: 'video/mp4',
    upsert: true,
  });

  // Lösche Chunks
  for (const chunk of sortedChunks) {
    await supabase.storage.from('videos').remove([`${upload_path}/${chunk.name}`]);
  }

  // Cleanup
  await fs.rm(workDir, { recursive: true, force: true });

  // Trigger Transcoding
  await supabase.from('processing_queue').insert({
    video_id: job.video_id,
    upload_path: finalPath,
    task_type: 'transcode',
    status: 'pending',
    priority: 3,
  });
}

/**
 * Transcode Video in mehrere Qualitäten
 */
async function transcodeVideo(job: any) {
  const { upload_path, video_id } = job;
  const workDir = path.join(TEMP_DIR, job.id);
  await fs.mkdir(workDir, { recursive: true });

  // Download Original
  const { data } = await supabase.storage.from('videos').download(upload_path);
  if (!data) throw new Error('Original video not found');

  const inputPath = path.join(workDir, 'input.mp4');
  await fs.writeFile(inputPath, Buffer.from(await data.arrayBuffer()));

  // Video-Info auslesen
  const { stdout: probeOutput } = await execAsync(
    `ffprobe -v quiet -print_format json -show_format -show_streams ${inputPath}`
  );
  const videoInfo = JSON.parse(probeOutput);
  const videoStream = videoInfo.streams.find((s: any) => s.codec_type === 'video');
  const originalWidth = videoStream.width;
  const originalHeight = videoStream.height;
  const duration = parseFloat(videoInfo.format.duration);

  // Update Video-Metadaten
  await supabase
    .from('videos')
    .update({
      duration,
      original_width: originalWidth,
      original_height: originalHeight,
      codec_name: videoStream.codec_name,
      bitrate: Math.round(parseInt(videoInfo.format.bit_rate) / 1000),
    })
    .eq('id', video_id);

  // Transcoding-Presets
  const qualities = [
    { name: '240p', width: 426, height: 240, bitrate: '400k' },
    { name: '360p', width: 640, height: 360, bitrate: '800k' },
    { name: '480p', width: 854, height: 480, bitrate: '1200k' },
    { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
    { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
  ].filter((q) => q.height <= originalHeight);

  // Transcode jede Qualität
  for (const quality of qualities) {
    const outputPath = path.join(workDir, `${quality.name}.mp4`);

    await execAsync(
      `ffmpeg -i ${inputPath} ` +
        `-vf scale=${quality.width}:${quality.height} ` +
        `-c:v libx264 -preset medium -crf 23 ` +
        `-b:v ${quality.bitrate} ` +
        `-c:a aac -b:a 128k ` +
        `-movflags +faststart ` +
        `${outputPath}`
    );

    // Upload Variante
    const variantData = await fs.readFile(outputPath);
    const variantPath = `${path.dirname(upload_path)}/${quality.name}.mp4`;

    await supabase.storage.from('videos').upload(variantPath, variantData, {
      contentType: 'video/mp4',
      upsert: true,
    });

    // Speichere Variante in DB
    const stats = await fs.stat(outputPath);
    await supabase.from('video_variants').insert({
      video_id,
      quality: quality.name,
      width: quality.width,
      height: quality.height,
      bitrate: parseInt(quality.bitrate),
      file_path: variantPath,
      file_size: stats.size,
      duration,
      codec: 'h264',
      format: 'mp4',
      status: 'ready',
    });
  }

  // Cleanup
  await fs.rm(workDir, { recursive: true, force: true });

  // Trigger Thumbnail & HLS/DASH
  await supabase.from('processing_queue').insertMany([
    {
      video_id,
      upload_path,
      task_type: 'thumbnail',
      status: 'pending',
      priority: 5,
    },
    {
      video_id,
      upload_path,
      task_type: 'hls_dash',
      status: 'pending',
      priority: 5,
    },
  ]);

  // Update Video-Status
  await supabase
    .from('videos')
    .update({
      status: 'ready',
      processing_completed_at: new Date().toISOString(),
    })
    .eq('id', video_id);
}

/**
 * Generiere Thumbnails
 */
async function generateThumbnails(job: any) {
  const { upload_path, video_id } = job;
  const workDir = path.join(TEMP_DIR, job.id);
  await fs.mkdir(workDir, { recursive: true });

  // Download Video
  const { data } = await supabase.storage.from('videos').download(upload_path);
  if (!data) throw new Error('Video not found');

  const inputPath = path.join(workDir, 'input.mp4');
  await fs.writeFile(inputPath, Buffer.from(await data.arrayBuffer()));

  // Video-Duration
  const { stdout: probeOutput } = await execAsync(
    `ffprobe -v quiet -print_format json -show_format ${inputPath}`
  );
  const videoInfo = JSON.parse(probeOutput);
  const duration = parseFloat(videoInfo.format.duration);

  // Generiere Thumbnails bei 5%, 25%, 50%, 75%, 95%
  const positions = [0.05, 0.25, 0.5, 0.75, 0.95];

  for (let i = 0; i < positions.length; i++) {
    const timestamp = duration * positions[i];
    const thumbPath = path.join(workDir, `thumb_${i}.jpg`);

    await execAsync(
      `ffmpeg -ss ${timestamp} -i ${inputPath} -vframes 1 -vf scale=1280:720 ${thumbPath}`
    );

    // Upload Thumbnail
    const thumbData = await fs.readFile(thumbPath);
    const storagePath = `${path.dirname(upload_path)}/thumbnails/thumb_${i}.jpg`;

    await supabase.storage.from('videos').upload(storagePath, thumbData, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    // Speichere in DB
    await supabase.from('video_thumbnails').insert({
      video_id,
      thumbnail_type: 'poster',
      file_path: storagePath,
      width: 1280,
      height: 720,
      timestamp_seconds: timestamp,
      is_primary: i === 2, // Mittleres Thumbnail als Primary
    });
  }

  // Cleanup
  await fs.rm(workDir, { recursive: true, force: true });
}

/**
 * Generiere HLS/DASH Streaming-Formate
 */
async function generateStreamingFormats(job: any) {
  const { upload_path, video_id } = job;
  const workDir = path.join(TEMP_DIR, job.id);
  await fs.mkdir(workDir, { recursive: true });

  // Download Video
  const { data } = await supabase.storage.from('videos').download(upload_path);
  if (!data) throw new Error('Video not found');

  const inputPath = path.join(workDir, 'input.mp4');
  await fs.writeFile(inputPath, Buffer.from(await data.arrayBuffer()));

  // HLS Generierung
  const hlsDir = path.join(workDir, 'hls');
  await fs.mkdir(hlsDir, { recursive: true });

  await execAsync(
    `ffmpeg -i ${inputPath} ` +
      `-codec copy -start_number 0 -hls_time 10 -hls_list_size 0 ` +
      `-f hls ${hlsDir}/master.m3u8`
  );

  // Upload HLS Dateien
  const hlsFiles = await fs.readdir(hlsDir);
  for (const file of hlsFiles) {
    const filePath = path.join(hlsDir, file);
    const fileData = await fs.readFile(filePath);
    const storagePath = `${path.dirname(upload_path)}/hls/${file}`;

    await supabase.storage.from('videos').upload(storagePath, fileData, {
      contentType: file.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T',
      upsert: true,
    });
  }

  // Speichere Manifest in DB
  await supabase.from('video_streaming_manifests').insert({
    video_id,
    manifest_type: 'hls',
    file_path: `${path.dirname(upload_path)}/hls/master.m3u8`,
  });

  // Cleanup
  await fs.rm(workDir, { recursive: true, force: true });
}

/**
 * Helper: Sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start Worker
main().catch(console.error);
