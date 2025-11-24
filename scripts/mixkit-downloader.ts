/**
 * MIXKIT MUSIC DOWNLOADER & UPLOADER
 * 
 * Lädt Mixkit Musik herunter, extrahiert Metadaten und lädt sie in Supabase Storage hoch
 * 
 * Features:
 * - Batch Download von Mixkit-Tracks
 * - Metadaten-Extraktion (Titel, BPM, Genre, etc.)
 * - Upload zu Supabase Storage
 * - Datenbank-Eintrag
 * - Fehlerbehandlung & Retry-Logik
 * - Progress Tracking
 * 
 * Usage:
 *   npx ts-node scripts/mixkit-downloader.ts
 */

import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore - Dev dependency for music download script
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
// @ts-ignore - Dev dependency for metadata extraction
import * as musicMetadata from 'music-metadata'

// ============================================
// CONFIG
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const DOWNLOAD_DIR = path.join(__dirname, '../temp/mixkit-downloads')
const STORAGE_BUCKET = 'mixkit-music'
const BATCH_SIZE = 5 // Parallel Downloads
const MAX_RETRIES = 3

// ============================================
// MIXKIT TRACKS DATA
// ============================================

interface MixkitTrackData {
  mixkit_id: string
  title: string
  description?: string
  genre: string
  mood?: string
  tags?: string[]
  bpm?: number
  duration_seconds?: number
  download_url: string
  original_url: string
}

// Beispiel-Tracks (kann später durch Scraper ersetzt werden)
const MIXKIT_TRACKS: MixkitTrackData[] = [
  {
    mixkit_id: 'mixkit-tech-house-vibes-130',
    title: 'Tech House Vibes',
    description: 'Energetic tech house beat perfect for modern videos',
    genre: 'electronic',
    mood: 'energetic',
    tags: ['tech-house', 'upbeat', 'modern'],
    bpm: 128,
    download_url: 'https://assets.mixkit.co/music/download/mixkit-tech-house-vibes-130.mp3',
    original_url: 'https://mixkit.co/free-stock-music/tech-house-vibes-130/',
  },
  {
    mixkit_id: 'mixkit-dreaming-big-31',
    title: 'Dreaming Big',
    description: 'Inspiring and uplifting piano melody',
    genre: 'cinematic',
    mood: 'inspiring',
    tags: ['piano', 'emotional', 'motivational'],
    bpm: 80,
    download_url: 'https://assets.mixkit.co/music/download/mixkit-dreaming-big-31.mp3',
    original_url: 'https://mixkit.co/free-stock-music/dreaming-big-31/',
  },
  {
    mixkit_id: 'mixkit-hip-hop-02',
    title: 'Hip Hop 02',
    description: 'Urban hip hop beat with strong bass',
    genre: 'hip-hop',
    mood: 'cool',
    tags: ['urban', 'rap', 'bass'],
    bpm: 95,
    download_url: 'https://assets.mixkit.co/music/download/mixkit-hip-hop-02.mp3',
    original_url: 'https://mixkit.co/free-stock-music/hip-hop-02/',
  },
  // Weitere Tracks können hier hinzugefügt werden
]

// ============================================
// SUPABASE CLIENT
// ============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
  },
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 Created directory: ${dir}`)
  }
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const writer = fs.createWriteStream(outputPath)
  
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    timeout: 120000, // 2 minutes
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function extractMetadata(filePath: string) {
  try {
    const metadata = await musicMetadata.parseFile(filePath)
    return {
      duration: metadata.format.duration,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
      format: metadata.format.container,
    }
  } catch (error) {
    console.warn(`⚠️ Could not extract metadata: ${error}`)
    return null
  }
}

async function uploadToSupabase(
  filePath: string,
  storagePath: string
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'audio/mpeg',
      cacheControl: '31536000', // 1 year
      upsert: true,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath)

  return publicUrl
}

async function insertTrackToDatabase(
  trackData: MixkitTrackData,
  storageUrl: string,
  fileSize: number,
  metadata: any
) {
  const { data, error } = await supabase
    .from('mixkit_tracks')
    .insert({
      mixkit_id: trackData.mixkit_id,
      title: trackData.title,
      description: trackData.description,
      genre: trackData.genre,
      mood: trackData.mood,
      tags: trackData.tags || [],
      bpm: trackData.bpm,
      duration_seconds: metadata?.duration ? Math.round(metadata.duration) : trackData.duration_seconds,
      storage_url: storageUrl,
      storage_provider: 'supabase',
      file_size_bytes: fileSize,
      file_format: 'mp3',
      bitrate_kbps: metadata?.bitrate ? Math.round(metadata.bitrate / 1000) : 320,
      sample_rate: metadata?.sampleRate || 44100,
      license: 'Mixkit License',
      license_url: 'https://mixkit.co/license/#sfxFree',
      attribution_required: false,
      commercial_use_allowed: true,
      original_url: trackData.original_url,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`)
  }

  return data
}

// ============================================
// MAIN PROCESSING
// ============================================

async function processTrack(trackData: MixkitTrackData, retries = 0): Promise<boolean> {
  const filename = `${trackData.mixkit_id}.mp3`
  const localPath = path.join(DOWNLOAD_DIR, filename)
  const storagePath = `tracks/${filename}`

  try {
    console.log(`\n🎵 Processing: ${trackData.title}`)
    console.log(`   ID: ${trackData.mixkit_id}`)

    // 1. Check if already exists in DB
    const { data: existing } = await supabase
      .from('mixkit_tracks')
      .select('id')
      .eq('mixkit_id', trackData.mixkit_id)
      .single()

    if (existing) {
      console.log(`   ⏭️  Already exists in database, skipping...`)
      return true
    }

    // 2. Download
    console.log(`   ⬇️  Downloading...`)
    await downloadFile(trackData.download_url, localPath)
    
    const stats = fs.statSync(localPath)
    console.log(`   ✅ Downloaded (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)

    // 3. Extract Metadata
    console.log(`   🔍 Extracting metadata...`)
    const metadata = await extractMetadata(localPath)
    
    if (metadata) {
      console.log(`   📊 Duration: ${Math.round(metadata.duration || 0)}s, Bitrate: ${Math.round((metadata.bitrate || 0) / 1000)}kbps`)
    }

    // 4. Upload to Supabase
    console.log(`   ☁️  Uploading to Supabase...`)
    const storageUrl = await uploadToSupabase(localPath, storagePath)
    console.log(`   ✅ Uploaded to storage`)

    // 5. Insert to Database
    console.log(`   💾 Saving to database...`)
    await insertTrackToDatabase(trackData, storageUrl, stats.size, metadata)
    console.log(`   ✅ Saved to database`)

    // 6. Cleanup
    fs.unlinkSync(localPath)
    console.log(`   🗑️  Cleaned up local file`)

    console.log(`   ✅ Successfully processed: ${trackData.title}`)
    return true

  } catch (error) {
    console.error(`   ❌ Error processing ${trackData.title}:`, error)

    // Retry logic
    if (retries < MAX_RETRIES) {
      console.log(`   🔄 Retrying (${retries + 1}/${MAX_RETRIES})...`)
      await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1)))
      return processTrack(trackData, retries + 1)
    }

    // Cleanup on failure
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }

    return false
  }
}

async function createStorageBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = buckets?.some(b => b.name === STORAGE_BUCKET)

    if (!exists) {
      console.log(`📦 Creating storage bucket: ${STORAGE_BUCKET}`)
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['audio/mpeg', 'audio/mp3'],
      })

      if (error) throw error
      console.log(`✅ Bucket created successfully`)
    } else {
      console.log(`✅ Bucket already exists: ${STORAGE_BUCKET}`)
    }
  } catch (error) {
    console.error(`❌ Bucket creation error:`, error)
    throw error
  }
}

async function processBatch(tracks: MixkitTrackData[]): Promise<void> {
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
  }

  for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
    const batch = tracks.slice(i, i + BATCH_SIZE)
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tracks.length / BATCH_SIZE)}`)

    const promises = batch.map(track => processTrack(track))
    const batchResults = await Promise.all(promises)

    batchResults.forEach(success => {
      if (success) results.success++
      else results.failed++
    })

    // Small delay between batches
    if (i + BATCH_SIZE < tracks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 FINAL RESULTS:`)
  console.log(`   ✅ Success: ${results.success}`)
  console.log(`   ❌ Failed: ${results.failed}`)
  console.log(`   📝 Total: ${tracks.length}`)
  console.log(`${'='.repeat(60)}\n`)
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎵 MIXKIT MUSIC DOWNLOADER & UPLOADER`)
  console.log(`${'='.repeat(60)}\n`)

  try {
    // 1. Setup
    console.log(`📋 Setup:`)
    console.log(`   Supabase URL: ${SUPABASE_URL}`)
    console.log(`   Download Dir: ${DOWNLOAD_DIR}`)
    console.log(`   Storage Bucket: ${STORAGE_BUCKET}`)
    console.log(`   Tracks to process: ${MIXKIT_TRACKS.length}`)
    console.log(`   Batch size: ${BATCH_SIZE}\n`)

    // 2. Create directories
    ensureDirectoryExists(DOWNLOAD_DIR)

    // 3. Create storage bucket
    await createStorageBucket()

    // 4. Process all tracks
    await processBatch(MIXKIT_TRACKS)

    console.log(`✅ All done!`)

  } catch (error) {
    console.error(`\n❌ Fatal error:`, error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { processTrack, processBatch, MIXKIT_TRACKS }
