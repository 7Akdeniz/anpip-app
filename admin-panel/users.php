<?php
/**
 * ANPIP ADMIN-PANEL - USER-VERWALTUNG
 */

session_start();
require_once 'config.php';
requireLogin();

$currentAdmin = getCurrentAdmin();

// Pagination
$perPage = 25;
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $perPage;

// Filter
$filterStatus = clean($_GET['status'] ?? '');
$search = clean($_GET['search'] ?? '');

// User sperren/entsperren
if (isset($_GET['action']) && isset($_GET['user_id'])) {
    $userId = (int)$_GET['user_id'];
    $action = clean($_GET['action']);
    $csrfToken = $_GET['csrf_token'] ?? '';
    
    if (verifyCsrfToken($csrfToken)) {
        if ($action === 'suspend') {
            $pdo->prepare("UPDATE users SET status = 'suspended' WHERE id = ?")->execute([$userId]);
            logSystem('user_action', "User #$userId wurde gesperrt", 'warning');
        } elseif ($action === 'activate') {
            $pdo->prepare("UPDATE users SET status = 'active' WHERE id = ?")->execute([$userId]);
            logSystem('user_action', "User #$userId wurde entsperrt", 'info');
        } elseif ($action === 'ban') {
            $pdo->prepare("UPDATE users SET status = 'banned' WHERE id = ?")->execute([$userId]);
            logSystem('user_action', "User #$userId wurde permanent gebannt", 'warning');
        }
        
        header('Location: users.php');
        exit;
    }
}

// Anzahl der User
$countSql = "SELECT COUNT(*) FROM users WHERE 1=1";
$countParams = [];

if ($filterStatus && in_array($filterStatus, ['active', 'suspended', 'banned'])) {
    $countSql .= " AND status = ?";
    $countParams[] = $filterStatus;
}

if ($search) {
    $countSql .= " AND (username LIKE ? OR email LIKE ?)";
    $countParams[] = "%$search%";
    $countParams[] = "%$search%";
}

$countStmt = $pdo->prepare($countSql);
$countStmt->execute($countParams);
$totalUsers = $countStmt->fetchColumn();
$totalPages = ceil($totalUsers / $perPage);

// User abrufen
$sql = "SELECT * FROM users WHERE 1=1";
$params = [];

if ($filterStatus && in_array($filterStatus, ['active', 'suspended', 'banned'])) {
    $sql .= " AND status = ?";
    $params[] = $filterStatus;
}

if ($search) {
    $sql .= " AND (username LIKE ? OR email LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
$params[] = $perPage;
$params[] = $offset;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$users = $stmt->fetchAll();

$pageTitle = 'User-Verwaltung';
include 'includes/header.php';

$csrfToken = generateCsrfToken();
?>

<!-- Statistiken -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    <?php
    $userStats = [
        'total' => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
        'active' => $pdo->query("SELECT COUNT(*) FROM users WHERE status = 'active'")->fetchColumn(),
        'suspended' => $pdo->query("SELECT COUNT(*) FROM users WHERE status = 'suspended'")->fetchColumn(),
        'banned' => $pdo->query("SELECT COUNT(*) FROM users WHERE status = 'banned'")->fetchColumn(),
    ];
    ?>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div class="text-sm text-gray-500 font-medium">Gesamt</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($userStats['total']); ?></div>
    </div>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div class="text-sm text-gray-500 font-medium">Aktiv</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($userStats['active']); ?></div>
    </div>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
        <div class="text-sm text-gray-500 font-medium">Gesperrt</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($userStats['suspended']); ?></div>
    </div>
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
        <div class="text-sm text-gray-500 font-medium">Gebannt</div>
        <div class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($userStats['banned']); ?></div>
    </div>
</div>

<!-- Filter -->
<div class="bg-white rounded-xl shadow-md p-6 mb-6">
    <form method="GET" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Suche</label>
            <input 
                type="text" 
                name="search" 
                value="<?php echo $search; ?>"
                placeholder="Username oder E-Mail..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select name="status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">Alle Status</option>
                <option value="active" <?php echo $filterStatus === 'active' ? 'selected' : ''; ?>>Aktiv</option>
                <option value="suspended" <?php echo $filterStatus === 'suspended' ? 'selected' : ''; ?>>Gesperrt</option>
                <option value="banned" <?php echo $filterStatus === 'banned' ? 'selected' : ''; ?>>Gebannt</option>
            </select>
        </div>
        <div class="flex items-end">
            <button type="submit" class="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium">
                Filtern
            </button>
        </div>
    </form>
</div>

<!-- User-Tabelle -->
<div class="bg-white rounded-xl shadow-md overflow-hidden">
    <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
            👥 User-Liste 
            <span class="text-gray-500 text-base font-normal">(<?php echo number_format($totalUsers); ?> User)</span>
        </h2>
    </div>

    <?php if (count($users) > 0): ?>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registriert</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <?php foreach ($users as $user): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                #<?php echo $user['id']; ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-sm">
                                        <?php echo strtoupper(substr($user['username'], 0, 2)); ?>
                                    </div>
                                    <div class="ml-3">
                                        <div class="text-sm font-medium text-gray-900">
                                            <?php echo clean($user['username']); ?>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo clean($user['email']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <?php
                                $statusColors = [
                                    'active' => 'bg-green-100 text-green-800',
                                    'suspended' => 'bg-orange-100 text-orange-800',
                                    'banned' => 'bg-red-100 text-red-800'
                                ];
                                $statusLabels = [
                                    'active' => '✅ Aktiv',
                                    'suspended' => '⏸️ Gesperrt',
                                    'banned' => '🚫 Gebannt'
                                ];
                                ?>
                                <span class="px-3 py-1 text-xs font-semibold rounded-full <?php echo $statusColors[$user['status']]; ?>">
                                    <?php echo $statusLabels[$user['status']]; ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo formatDateTime($user['created_at']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <div class="flex space-x-2">
                                    <?php if ($user['status'] === 'active'): ?>
                                        <a href="?action=suspend&user_id=<?php echo $user['id']; ?>&csrf_token=<?php echo $csrfToken; ?>" 
                                           onclick="return confirm('User wirklich sperren?')"
                                           class="text-orange-600 hover:text-orange-900 font-medium">
                                            Sperren
                                        </a>
                                    <?php else: ?>
                                        <a href="?action=activate&user_id=<?php echo $user['id']; ?>&csrf_token=<?php echo $csrfToken; ?>" 
                                           class="text-green-600 hover:text-green-900 font-medium">
                                            Entsperren
                                        </a>
                                    <?php endif; ?>
                                    
                                    <?php if ($user['status'] !== 'banned'): ?>
                                        <span class="text-gray-300">|</span>
                                        <a href="?action=ban&user_id=<?php echo $user['id']; ?>&csrf_token=<?php echo $csrfToken; ?>" 
                                           onclick="return confirm('User PERMANENT bannen?')"
                                           class="text-red-600 hover:text-red-900 font-medium">
                                            Bannen
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
                        <a href="?page=<?php echo $page - 1; ?>&status=<?php echo $filterStatus; ?>&search=<?php echo urlencode($search); ?>" 
                           class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            ← Zurück
                        </a>
                    <?php endif; ?>
                    
                    <?php if ($page < $totalPages): ?>
                        <a href="?page=<?php echo $page + 1; ?>&status=<?php echo $filterStatus; ?>&search=<?php echo urlencode($search); ?>" 
                           class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Weiter →
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>
    <?php else: ?>
        <div class="text-center py-16">
            <div class="text-6xl mb-4">👥</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Keine User gefunden</h3>
            <p class="text-gray-600">Es wurden keine User mit diesen Filterkriterien gefunden.</p>
        </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>
