<?php
/**
 * ANPIP ADMIN-PANEL - DASHBOARD (STARTSEITE)
 */

session_start();
require_once 'config.php';
requireLogin();

$currentAdmin = getCurrentAdmin();

// Dashboard-Statistiken abrufen
$statsStmt = $pdo->query("SELECT * FROM dashboard_stats");
$stats = $statsStmt->fetch();

// Letzte Autopilot-Aktionen abrufen
$autopilotStmt = $pdo->query("
    SELECT a.*, u.username as decided_by_username
    FROM autopilot_actions a
    LEFT JOIN admin_users u ON a.decided_by_admin_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 10
");
$recentActions = $autopilotStmt->fetchAll();

$pageTitle = 'Dashboard';
include 'includes/header.php';
?>

<!-- Dashboard Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    
    <!-- User Gesamt -->
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm font-medium">User Gesamt</p>
                <p class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($stats['total_users']); ?></p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            </div>
        </div>
        <p class="text-green-600 text-sm mt-3">+<?php echo number_format($stats['users_today']); ?> heute</p>
    </div>

    <!-- Videos Gesamt -->
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm font-medium">Videos Gesamt</p>
                <p class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($stats['total_videos']); ?></p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
                <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
            </div>
        </div>
        <p class="text-green-600 text-sm mt-3">+<?php echo number_format($stats['videos_today']); ?> heute</p>
    </div>

    <!-- Offene Autopilot-Aktionen -->
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm font-medium">Offene Bestätigungen</p>
                <p class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($stats['pending_autopilot_actions']); ?></p>
            </div>
            <div class="bg-orange-100 rounded-full p-3">
                <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        </div>
        <?php if ($stats['pending_autopilot_actions'] > 0): ?>
            <a href="autopilot-pending.php" class="text-orange-600 text-sm mt-3 inline-block hover:underline">→ Jetzt bearbeiten</a>
        <?php else: ?>
            <p class="text-gray-400 text-sm mt-3">Alles erledigt ✓</p>
        <?php endif; ?>
    </div>

    <!-- Gemeldete Inhalte -->
    <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm font-medium">Gemeldete Inhalte</p>
                <p class="text-3xl font-bold text-gray-800 mt-2"><?php echo number_format($stats['flagged_content']); ?></p>
            </div>
            <div class="bg-red-100 rounded-full p-3">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
        </div>
        <?php if ($stats['flagged_content'] > 0): ?>
            <a href="content.php?filter=flagged" class="text-red-600 text-sm mt-3 inline-block hover:underline">→ Überprüfen</a>
        <?php else: ?>
            <p class="text-gray-400 text-sm mt-3">Keine Meldungen</p>
        <?php endif; ?>
    </div>

</div>

<!-- Letzte Autopilot-Aktionen -->
<div class="bg-white rounded-xl shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4">🤖 Letzte Autopilot-Aktionen</h2>
    
    <?php if (count($recentActions) > 0): ?>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschreibung</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zeit</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bearbeitet von</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <?php foreach ($recentActions as $action): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    <?php echo clean($action['action_type']); ?>
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-900 font-medium"><?php echo clean($action['title']); ?></div>
                                <div class="text-sm text-gray-500"><?php echo clean(substr($action['description'], 0, 80)); ?>...</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <?php
                                $statusColors = [
                                    'pending' => 'bg-yellow-100 text-yellow-800',
                                    'approved' => 'bg-green-100 text-green-800',
                                    'rejected' => 'bg-red-100 text-red-800',
                                    'auto_executed' => 'bg-blue-100 text-blue-800'
                                ];
                                $statusLabels = [
                                    'pending' => 'Offen',
                                    'approved' => 'Bestätigt',
                                    'rejected' => 'Abgelehnt',
                                    'auto_executed' => 'Auto-Ausgeführt'
                                ];
                                ?>
                                <span class="px-3 py-1 text-xs font-semibold rounded-full <?php echo $statusColors[$action['status']]; ?>">
                                    <?php echo $statusLabels[$action['status']]; ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo timeAgo($action['created_at']); ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <?php echo $action['decided_by_username'] ? clean($action['decided_by_username']) : '-'; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        
        <div class="mt-4 text-center">
            <a href="autopilot-history.php" class="text-purple-600 hover:text-purple-800 font-medium">
                Alle Aktionen anzeigen →
            </a>
        </div>
    <?php else: ?>
        <div class="text-center py-8 text-gray-400">
            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>Noch keine Autopilot-Aktionen vorhanden</p>
        </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>
