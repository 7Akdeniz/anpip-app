<?php
/**
 * ANPIP ADMIN-PANEL - AUTOPILOT: LETZTE ÄNDERUNGEN / HISTORIE
 */

session_start();
require_once 'config.php';
requireLogin();

$currentAdmin = getCurrentAdmin();

// Pagination
$perPage = 50;
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $perPage;

// Filter
$filterStatus = clean($_GET['status'] ?? '');
$filterType = clean($_GET['type'] ?? '');

// Anzahl der Gesamteinträge
$countSql = "SELECT COUNT(*) FROM autopilot_actions WHERE status IN ('approved', 'rejected', 'auto_executed')";
$countParams = [];

if ($filterStatus && in_array($filterStatus, ['approved', 'rejected', 'auto_executed'])) {
    $countSql .= " AND status = ?";
    $countParams[] = $filterStatus;
}

if ($filterType) {
    $countSql .= " AND action_type = ?";
    $countParams[] = $filterType;
}

$countStmt = $pdo->prepare($countSql);
$countStmt->execute($countParams);
$totalItems = $countStmt->fetchColumn();
$totalPages = ceil($totalItems / $perPage);

// Aktionen abrufen
$sql = "SELECT a.*, u.username as decided_by_username
        FROM autopilot_actions a
        LEFT JOIN admin_users u ON a.decided_by_admin_id = u.id
        WHERE a.status IN ('approved', 'rejected', 'auto_executed')";

$params = [];

if ($filterStatus && in_array($filterStatus, ['approved', 'rejected', 'auto_executed'])) {
    $sql .= " AND a.status = ?";
    $params[] = $filterStatus;
}

if ($filterType) {
    $sql .= " AND a.action_type = ?";
    $params[] = $filterType;
}

$sql .= " ORDER BY a.decided_at DESC LIMIT ? OFFSET ?";
$params[] = $perPage;
$params[] = $offset;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$actions = $stmt->fetchAll();

// Verfügbare Types
$typesStmt = $pdo->query("SELECT DISTINCT action_type FROM autopilot_actions WHERE status IN ('approved', 'rejected', 'auto_executed')");
$availableTypes = $typesStmt->fetchAll(PDO::FETCH_COLUMN);

$pageTitle = 'Autopilot: Letzte Änderungen';
include 'includes/header.php';
?>

<!-- Filter Bar -->
<div class="bg-white rounded-xl shadow-md p-6 mb-6">
    <form method="GET" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Status Filter -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select name="status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">Alle Status</option>
                <option value="approved" <?php echo $filterStatus === 'approved' ? 'selected' : ''; ?>>Bestätigt</option>
                <option value="rejected" <?php echo $filterStatus === 'rejected' ? 'selected' : ''; ?>>Abgelehnt</option>
                <option value="auto_executed" <?php echo $filterStatus === 'auto_executed' ? 'selected' : ''; ?>>Auto-Ausgeführt</option>
            </select>
        </div>

        <!-- Typ Filter -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Typ</label>
            <select name="type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">Alle Typen</option>
                <?php foreach ($availableTypes as $type): ?>
                    <option value="<?php echo $type; ?>" <?php echo $filterType === $type ? 'selected' : ''; ?>>
                        <?php echo clean($type); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <!-- Filter Button -->
        <div class="flex items-end">
            <button type="submit" class="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium">
                Filtern
            </button>
        </div>
    </form>
</div>

<!-- Statistiken -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <?php
    $stats = [
        'approved' => $pdo->query("SELECT COUNT(*) FROM autopilot_actions WHERE status = 'approved'")->fetchColumn(),
        'rejected' => $pdo->query("SELECT COUNT(*) FROM autopilot_actions WHERE status = 'rejected'")->fetchColumn(),
        'auto_executed' => $pdo->query("SELECT COUNT(*) FROM autopilot_actions WHERE status = 'auto_executed'")->fetchColumn(),
    ];
    ?>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div class="text-sm text-gray-500 font-medium">Bestätigt</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($stats['approved']); ?></div>
    </div>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
        <div class="text-sm text-gray-500 font-medium">Abgelehnt</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($stats['rejected']); ?></div>
    </div>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div class="text-sm text-gray-500 font-medium">Auto-Ausgeführt</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($stats['auto_executed']); ?></div>
    </div>
</div>

<!-- Historie-Tabelle -->
<div class="bg-white rounded-xl shadow-md overflow-hidden">
    <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
            📜 Historie 
            <span class="text-gray-500 text-base font-normal">(<?php echo number_format($totalItems); ?> Einträge)</span>
        </h2>
    </div>

    <?php if (count($actions) > 0): ?>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktion</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ergebnis</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entscheider</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <?php foreach ($actions as $action): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo formatDateTime($action['decided_at']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    <?php echo clean($action['action_type']); ?>
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-medium text-gray-900"><?php echo clean($action['title']); ?></div>
                                <div class="text-sm text-gray-500"><?php echo clean(substr($action['description'], 0, 100)); ?>...</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <?php
                                $statusColors = [
                                    'approved' => 'bg-green-100 text-green-800',
                                    'rejected' => 'bg-red-100 text-red-800',
                                    'auto_executed' => 'bg-blue-100 text-blue-800'
                                ];
                                $statusIcons = [
                                    'approved' => '✅',
                                    'rejected' => '❌',
                                    'auto_executed' => '🤖'
                                ];
                                $statusLabels = [
                                    'approved' => 'Bestätigt',
                                    'rejected' => 'Abgelehnt',
                                    'auto_executed' => 'Auto-Ausgeführt'
                                ];
                                ?>
                                <span class="px-3 py-1 text-xs font-semibold rounded-full <?php echo $statusColors[$action['status']]; ?>">
                                    <?php echo $statusIcons[$action['status']] . ' ' . $statusLabels[$action['status']]; ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo $action['decided_by_username'] ? clean($action['decided_by_username']) : 'System'; ?>
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
                        <a href="?page=<?php echo $page - 1; ?>&status=<?php echo $filterStatus; ?>&type=<?php echo $filterType; ?>" 
                           class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            ← Zurück
                        </a>
                    <?php endif; ?>
                    
                    <?php if ($page < $totalPages): ?>
                        <a href="?page=<?php echo $page + 1; ?>&status=<?php echo $filterStatus; ?>&type=<?php echo $filterType; ?>" 
                           class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Weiter →
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>
    <?php else: ?>
        <div class="text-center py-16">
            <div class="text-6xl mb-4">📭</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Keine Historie vorhanden</h3>
            <p class="text-gray-600">Es wurden noch keine Autopilot-Aktionen abgeschlossen.</p>
        </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>
