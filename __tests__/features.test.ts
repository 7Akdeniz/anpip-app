/**
 * ANPIP.COM - FEATURE TESTS
 * Automatisierte Tests für alle implementierten Funktionen
 */

import { supabase } from '@/lib/supabase';
import {
  likeVideo,
  followUser,
  saveVideo,
  getUserLikes,
  getUserFollows,
  getUserSavedVideos,
  getLiveVideos,
  getFollowingFeed,
  trackView,
  trackShare,
  getUserActivity,
  getRecentlyViewedVideos,
  getNearbyUsers,
  getFriendSuggestions,
} from '@/lib/videoService';
import {
  getUserCoins,
  sendGift,
  getLastGiftSender,
  getVideoGiftHistory,
  getVideoGiftCount,
} from '@/lib/giftService';
import {
  getSound,
  getVideosBySound,
  saveSound,
  getUserSavedSounds,
  getTrendingSounds,
} from '@/lib/musicService';

// Test User IDs
const TEST_USER_1 = 'test-user-1';
const TEST_USER_2 = 'test-user-2';
const TEST_VIDEO_ID = 'test-video-1';

/**
 * Test Suite Runner
 */
export async function runAllTests() {
  console.log('🧪 Starting ANPIP Feature Tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Run test suites
  await testVideoInteractions(results);
  await testFollowSystem(results);
  await testSaveSystem(results);
  await testGiftSystem(results);
  await testMusicSystem(results);
  await testActivityTracking(results);
  await testDiscovery(results);

  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  return results;
}

/**
 * Test Video Interactions (Like, View, Share)
 */
async function testVideoInteractions(results: any) {
  console.log('📹 Testing Video Interactions...');

  try {
    // Test Like
    await likeVideo(TEST_USER_1, TEST_VIDEO_ID);
    const likes = await getUserLikes(TEST_USER_1);
    if (likes.includes(TEST_VIDEO_ID)) {
      console.log('  ✅ Like video');
      results.passed++;
    } else {
      throw new Error('Like not saved');
    }

    // Test Unlike
    await likeVideo(TEST_USER_1, TEST_VIDEO_ID);
    const likesAfterUnlike = await getUserLikes(TEST_USER_1);
    if (!likesAfterUnlike.includes(TEST_VIDEO_ID)) {
      console.log('  ✅ Unlike video');
      results.passed++;
    } else {
      throw new Error('Unlike failed');
    }

    // Test Track View
    await trackView(TEST_USER_1, TEST_VIDEO_ID);
    console.log('  ✅ Track view');
    results.passed++;

    // Test Track Share
    await trackShare(TEST_USER_1, TEST_VIDEO_ID, 'whatsapp');
    console.log('  ✅ Track share');
    results.passed++;

  } catch (error: any) {
    console.log(`  ❌ Video interactions failed: ${error.message}`);
    results.failed++;
    results.errors.push(`Video Interactions: ${error.message}`);
  }
}

/**
 * Test Follow System
 */
async function testFollowSystem(results: any) {
  console.log('\n👥 Testing Follow System...');

  try {
    // Test Follow
    await followUser(TEST_USER_1, TEST_USER_2);
    const follows = await getUserFollows(TEST_USER_1);
    if (follows.includes(TEST_USER_2)) {
      console.log('  ✅ Follow user');
      results.passed++;
    } else {
      throw new Error('Follow not saved');
    }

    // Test Unfollow
    await followUser(TEST_USER_1, TEST_USER_2);
    const followsAfterUnfollow = await getUserFollows(TEST_USER_1);
    if (!followsAfterUnfollow.includes(TEST_USER_2)) {
      console.log('  ✅ Unfollow user');
      results.passed++;
    } else {
      throw new Error('Unfollow failed');
    }

    // Test Following Feed
    const followingFeed = await getFollowingFeed(TEST_USER_1, 10);
    console.log(`  ✅ Following feed (${followingFeed.length} videos)`);
    results.passed++;

  } catch (error: any) {
    console.log(`  ❌ Follow system failed: ${error.message}`);
    results.failed++;
    results.errors.push(`Follow System: ${error.message}`);
  }
}

/**
 * Test Save/Bookmark System
 */
async function testSaveSystem(results: any) {
  console.log('\n🔖 Testing Save System...');

  try {
    // Test Save
    await saveVideo(TEST_USER_1, TEST_VIDEO_ID);
    const saved = await getUserSavedVideos(TEST_USER_1);
    if (saved.includes(TEST_VIDEO_ID)) {
      console.log('  ✅ Save video');
      results.passed++;
    } else {
      throw new Error('Save not recorded');
    }

    // Test Unsave
    await saveVideo(TEST_USER_1, TEST_VIDEO_ID);
    const savedAfterUnsave = await getUserSavedVideos(TEST_USER_1);
    if (!savedAfterUnsave.includes(TEST_VIDEO_ID)) {
      console.log('  ✅ Unsave video');
      results.passed++;
    } else {
      throw new Error('Unsave failed');
    }

  } catch (error: any) {
    console.log(`  ❌ Save system failed: ${error.message}`);
    results.failed++;
    results.errors.push(`Save System: ${error.message}`);
  }
}

/**
 * Test Gift System
 */
async function testGiftSystem(results: any) {
  console.log('\n🎁 Testing Gift System...');

  try {
    // Test Get User Coins
    const coins = await getUserCoins(TEST_USER_1);
    console.log(`  ✅ Get user coins (${coins} coins)`);
    results.passed++;

    // Test Get Gift Count
    const giftCount = await getVideoGiftCount(TEST_VIDEO_ID);
    console.log(`  ✅ Get video gift count (${giftCount} gifts)`);
    results.passed++;

    // Test Get Last Gift Sender
    const lastSender = await getLastGiftSender(TEST_VIDEO_ID);
    console.log(`  ✅ Get last gift sender`);
    results.passed++;

    // Test Get Gift History
    const history = await getVideoGiftHistory(TEST_VIDEO_ID, 10);
    console.log(`  ✅ Get gift history (${history.length} transactions)`);
    results.passed++;

  } catch (error: any) {
    console.log(`  ❌ Gift system failed: ${error.message}`);
    results.failed++;
    results.errors.push(`Gift System: ${error.message}`);
  }
}

/**
 * Test Music System
 */
async function testMusicSystem(results: any) {
  console.log('\n🎵 Testing Music System...');

  try {
    // Test Get Trending Sounds
    const trendingSounds = await getTrendingSounds(10);
    console.log(`  ✅ Get trending sounds (${trendingSounds.length} sounds)`);
    results.passed++;

    // Test Get User Saved Sounds
    const savedSounds = await getUserSavedSounds(TEST_USER_1);
    console.log(`  ✅ Get user saved sounds (${savedSounds.length} sounds)`);
    results.passed++;

  } catch (error: any) {
    console.log(`  ❌ Music system failed: ${error.message}`);
    results.failed++;
    results.errors.push(`Music System: ${error.message}`);
  }
}

/**
 * Test Activity Tracking
 */
async function testActivityTracking(results: any) {
  console.log('\n📊 Testing Activity Tracking...');

  try {
    // Test Get User Activity
    const activity = await getUserActivity(TEST_USER_1, 20);
    console.log(`  ✅ Get user activity (${activity.length} activities)`);
    results.passed++;

    // Test Get Recently Viewed
    const recentlyViewed = await getRecentlyViewedVideos(TEST_USER_1, 10);
    console.log(`  ✅ Get recently viewed (${recentlyViewed.length} videos)`);
    results.passed++;

  } catch (error: any) {
    console.log(`  ❌ Activity tracking failed: ${error.message}`);
    results.failed++;
    results.errors.push(`Activity Tracking: ${error.message}`);
  }
}

/**
 * Test Discovery Features
 */
async function testDiscovery(results: any) {
  console.log('\n🔍 Testing Discovery Features...');

  try {
    // Test Get Friend Suggestions
    const suggestions = await getFriendSuggestions(TEST_USER_1, 10);
    console.log(`  ✅ Get friend suggestions (${suggestions.length} users)`);
    results.passed++;

    // Test Get Live Videos
    const liveVideos = await getLiveVideos(10);
    console.log(`  ✅ Get live videos (${liveVideos.length} videos)`);
    results.passed++;

  } catch (error: any) {
    console.log(`  ❌ Discovery features failed: ${error.message}`);
    results.failed++;
    results.errors.push(`Discovery: ${error.message}`);
  }
}

/**
 * Manual Test Checklist
 */
export const MANUAL_TEST_CHECKLIST = `
╔════════════════════════════════════════════════════════════════╗
║           ANPIP.COM - MANUELLE TEST CHECKLISTE                 ║
╚════════════════════════════════════════════════════════════════╝

🔝 TOP-BAR ICONS
  [ ] Live-Icon: Zeigt nur Live-Videos
  [ ] Freunde-Icon: Öffnet Freunde-Seite
  [ ] Markt-Icon: Zeigt nur Kleinanzeigen-Videos
  [ ] Aktivität-Icon: Öffnet Aktivitätsseite
  [ ] Kamera-Icon: Zeigt alle Videos

👉 RECHTE SEITENLEISTE (Pro Video)
  [ ] Profil + Follow: Follow/Unfollow funktioniert
  [ ] Herz: Like/Unlike funktioniert, Zähler aktualisiert
  [ ] Kommentar: Kommentar-Modal öffnet sich
  [ ] Teilen: Share-Modal öffnet sich, Link kopierbar
  [ ] Bookmark: Video speichern/entfernen funktioniert
  [ ] Geschenk: Gift-Modal öffnet sich
  [ ] Profil unter Geschenk: Zeigt letzten Schenker
  [ ] Musik: Musik-Modal öffnet sich

🔙 BOTTOM NAVIGATION
  [ ] Home: Lädt Hauptfeed
  [ ] Entdecken: Öffnet Explore-Seite
  [ ] Upload: Öffnet Upload-Dialog
  [ ] Nachrichten: Öffnet Chat
  [ ] Profil: Zeigt eigenes Profil

📱 VIDEO-FEED SCROLLING
  [ ] Snap-to-Video: Immer genau 1 Video sichtbar
  [ ] Kein halbes Video: Niemals 2 Videos gleichzeitig
  [ ] Smooth Scrolling: Flüssiges Scrollen ohne Ruckeln
  [ ] Auto-Play: Video startet automatisch
  [ ] View-Tracking: Views werden gezählt

🧪 CROSS-DEVICE TESTS
  [ ] Mobile (iOS/Android): Alle Funktionen OK
  [ ] Tablet (iPad): Layout korrekt, Funktionen OK
  [ ] Desktop/Web: Zentriertes Layout, Funktionen OK
  [ ] Performance: Keine Lags, schnelle Reaktion

🔒 DATENINTEGRITÄT
  [ ] Likes bleiben nach Refresh erhalten
  [ ] Follows bleiben nach Refresh erhalten
  [ ] Gespeicherte Videos bleiben erhalten
  [ ] Activity-Log wird korrekt gespeichert

✨ EDGE CASES
  [ ] Video ohne Standort: Wird nicht in Market angezeigt
  [ ] User ohne Standort: Kann Nearby-Users nicht sehen
  [ ] Keine Following: Following-Feed zeigt "leer"
  [ ] Keine Coins: Gift senden wird blockiert
`;

export default runAllTests;
