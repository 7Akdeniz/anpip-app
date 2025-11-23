<?php
/**
 * ANPIP ADMIN-PANEL - CONTENT / VIDEO-VERWALTUNG
 */

session_start();
require_once 'config.php';
requireLogin();

$currentAdmin = getCurrentAdmin();

// Pagination
$perPage = 20;
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $perPage;

// Filter
$filterStatus = clean($_GET['filter'] ?? '');

// Video-Status ändern
if (isset($_GET['action']) && isset($_GET['video_id'])) {
    $videoId = (int)$_GET['video_id'];
    $action = clean($_GET['action']);
    $csrfToken = $_GET['csrf_token'] ?? '';
    
    if (verifyCsrfToken($csrfToken)) {
        if ($action === 'flag') {
            $pdo->prepare("UPDATE videos SET status = 'flagged' WHERE id = ?")->execute([$videoId]);
            logSystem('content_action', "Video #$videoId wurde markiert", 'warning');
        } elseif ($action === 'remove') {
            $pdo->prepare("UPDATE videos SET status = 'removed' WHERE id = ?")->execute([$videoId]);
            logSystem('content_action', "Video #$videoId wurde entfernt", 'warning');
        } elseif ($action === 'restore') {
            $pdo->prepare("UPDATE videos SET status = 'published' WHERE id = ?")->execute([$videoId]);
            logSystem('content_action', "Video #$videoId wurde wiederhergestellt", 'info');
        }
        
        header('Location: content.php' . ($filterStatus ? "?filter=$filterStatus" : ''));
        exit;
    }
}

// Anzahl der Videos
$countSql = "SELECT COUNT(*) FROM videos WHERE 1=1";
$countParams = [];

if ($filterStatus && in_array($filterStatus, ['published', 'flagged', 'removed', 'pending'])) {
    $countSql .= " AND status = ?";
    $countParams[] = $filterStatus;
}

$countStmt = $pdo->prepare($countSql);
$countStmt->execute($countParams);
$totalVideos = $countStmt->fetchColumn();
$totalPages = ceil($totalVideos / $perPage);

// Videos abrufen
$sql = "SELECT v.*, u.username 
        FROM videos v 
        LEFT JOIN users u ON v.user_id = u.id 
        WHERE 1=1";
$params = [];

if ($filterStatus && in_array($filterStatus, ['published', 'flagged', 'removed', 'pending'])) {
    $sql .= " AND v.status = ?";
    $params[] = $filterStatus;
}

$sql .= " ORDER BY v.created_at DESC LIMIT ? OFFSET ?";
$params[] = $perPage;
$params[] = $offset;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$videos = $stmt->fetchAll();

$pageTitle = 'Videos / Inhalte';
include 'includes/header.php';

$csrfToken = generateCsrfToken();
?>

<!-- Statistiken -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    <?php
    $videoStats = [
        'total' => $pdo->query("SELECT COUNT(*) FROM videos")->fetchColumn(),
        'published' => $pdo->query("SELECT COUNT(*) FROM videos WHERE status = 'published'")->fetchColumn(),
        'flagged' => $pdo->query("SELECT COUNT(*) FROM videos WHERE status = 'flagged'")->fetchColumn(),
        'removed' => $pdo->query("SELECT COUNT(*) FROM videos WHERE status = 'removed'")->fetchColumn(),
    ];
    ?>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div class="text-sm text-gray-500 font-medium">Gesamt</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($videoStats['total']); ?></div>
    </div>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div class="text-sm text-gray-500 font-medium">Veröffentlicht</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($videoStats['published']); ?></div>
    </div>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
        <div class="text-sm text-gray-500 font-medium">Gemeldet</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($videoStats['flagged']); ?></div>
    </div>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
        <div class="text-sm text-gray-500 font-medium">Entfernt</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($videoStats['removed']); ?></div>
    </div>
</div>

<!-- Filter -->
<div class="bg-white rounded-xl shadow-md p-6 mb-6">
    <div class="flex flex-wrap gap-3">
        <a href="content.php" 
           class="px-4 py-2 rounded-lg font-medium <?php echo !$filterStatus ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'; ?>">
            Alle Videos
        </a>
        <a href="content.php?filter=published" 
           class="px-4 py-2 rounded-lg font-medium <?php echo $filterStatus === 'published' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'; ?>">
            Veröffentlicht
        </a>
        <a href="content.php?filter=flagged" 
           class="px-4 py-2 rounded-lg font-medium <?php echo $filterStatus === 'flagged' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'; ?>">
            Gemeldet (<?php echo $videoStats['flagged']; ?>)
        </a>
        <a href="content.php?filter=removed" 
           class="px-4 py-2 rounded-lg font-medium <?php echo $filterStatus === 'removed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'; ?>">
            Entfernt
        </a>
    </div>
</div>

<!-- Video-Liste -->
<div class="bg-white rounded-xl shadow-md overflow-hidden">
    <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
            🎥 Video-Liste 
            <span class="text-gray-500 text-base font-normal">(<?php echo number_format($totalVideos); ?> Videos)</span>
        </h2>
    </div>

    <?php if (count($videos) > 0): ?>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titel</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploader</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meldungen</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <?php foreach ($videos as $video): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                #<?php echo $video['id']; ?>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-medium text-gray-900">
                                    <?php echo clean($video['title']); ?>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo clean($video['username']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <?php
                                $statusColors = [
                                    'published' => 'bg-green-100 text-green-800',
                                    'flagged' => 'bg-orange-100 text-orange-800',
                                    'removed' => 'bg-red-100 text-red-800',
                                    'pending' => 'bg-yellow-100 text-yellow-800'
                                ];
                                $statusLabels = [
                                    'published' => '✅ Online',
                                    'flagged' => '⚠️ Gemeldet',
                                    'removed' => '🚫 Entfernt',
                                    'pending' => '⏳ Ausstehend'
                                ];
                                ?>
                                <span class="px-3 py-1 text-xs font-semibold rounded-full <?php echo $statusColors[$video['status']]; ?>">
                                    <?php echo $statusLabels[$video['status']]; ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo number_format($video['views']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <?php if ($video['report_count'] > 0): ?>
                                    <span class="text-red-600 font-bold"><?php echo $video['report_count']; ?> 🚩</span>
                                <?php else: ?>
                                    <span class="text-gray-400">0</span>
                                <?php endif; ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo formatDateTime($video['created_at']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <div class="flex flex-col space-y-1">
                                    <?php if ($video['status'] === 'published'): ?>
                                        <a href="?action=flag&video_id=<?php echo $video['id']; ?>&csrf_token=<?php echo $csrfToken; ?>" 
                                           class="text-orange-600 hover:text-orange-900 font-medium">
                                            ⚠️ Markieren
                                        </a>
                                    <?php endif; ?>
                                    
                                    <?php if (in_array($video['status'], ['published', 'flagged'])): ?>
                                        <a href="?action=remove&video_id=<?php echo $video['id']; ?>&csrf_token=<?php echo $csrfToken; ?>" 
                                           onclick="return confirm('Video wirklich entfernen?')"
                                           class="text-red-600 hover:text-red-900 font-medium">
                                            🗑️ Entfernen
                                        </a>
                                    <?php endif; ?>
                                    
                                    <?php if ($video['status'] !== 'published'): ?>
                                        <a href="?action=restore&video_id=<?php echo $video['id']; ?>&csrf_token=<?php echo $csrfToken; ?>" 
                                           class="text-green-600 hover:text-green-900 font-medium">
                                            ↩️ Wiederherstellen
                                        </a>
                                    <?php endif; ?>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
            <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div class="text-sm text-gray-500">
                    Seite <?php echo $page; ?> von <?php echo $totalPages; ?>
                </div>
                <div class="flex space-x-2">
                    <?php if ($page > 1): ?>
                        <a href="?page=<?php echo $page - 1; ?><?php echo $filterStatus ? "&filter=$filterStatus" : ''; ?>" 
                           class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            ← Zurück
                        </a>
                    <?php endif; ?>
                    
                    <?php if ($page < $totalPages): ?>
                        <a href="?page=<?php echo $page + 1; ?><?php echo $filterStatus ? "&filter=$filterStatus" : ''; ?>" 
                           class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Weiter →
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>
    <?php else: ?>
        <div class="text-center py-16">
            <div class="text-6xl mb-4">🎥</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Keine Videos gefunden</h3>
            <p class="text-gray-600">Es wurden keine Videos mit diesem Status gefunden.</p>
        </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>
