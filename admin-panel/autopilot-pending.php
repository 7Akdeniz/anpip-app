<?php
/**
 * ANPIP ADMIN-PANEL - AUTOPILOT: OFFENE BESTÄTIGUNGEN
 */

session_start();
require_once 'config.php';
requireLogin();

$currentAdmin = getCurrentAdmin();

// Filter-Parameter
$filterType = clean($_GET['type'] ?? '');
$search = clean($_GET['search'] ?? '');
$filterPriority = clean($_GET['priority'] ?? '');

// Autopilot-Aktion bestätigen oder ablehnen (AJAX)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_id'])) {
    $actionId = (int)$_POST['action_id'];
    $decision = clean($_POST['decision'] ?? ''); // 'approve' oder 'reject'
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    if (!verifyCsrfToken($csrfToken)) {
        jsonResponse(['success' => false, 'message' => 'Ungültiges CSRF-Token'], 400);
    }
    
    if (!in_array($decision, ['approve', 'reject'])) {
        jsonResponse(['success' => false, 'message' => 'Ungültige Aktion'], 400);
    }
    
    $newStatus = ($decision === 'approve') ? 'approved' : 'rejected';
    
    $updateStmt = $pdo->prepare("
        UPDATE autopilot_actions 
        SET status = ?, decided_by_admin_id = ?, decided_at = NOW(), updated_at = NOW()
        WHERE id = ?
    ");
    
    if ($updateStmt->execute([$newStatus, $currentAdmin['id'], $actionId])) {
        // Log erstellen
        $action = $pdo->query("SELECT * FROM autopilot_actions WHERE id = $actionId")->fetch();
        $logMessage = "Autopilot-Aktion #{$actionId} ({$action['action_type']}) wurde " . 
                      ($decision === 'approve' ? 'bestätigt' : 'abgelehnt');
        logSystem('autopilot_decision', $logMessage, 'info');
        
        jsonResponse(['success' => true, 'message' => 'Erfolgreich gespeichert']);
    } else {
        jsonResponse(['success' => false, 'message' => 'Datenbankfehler'], 500);
    }
}

// Offene Aktionen abrufen mit Filtern
$sql = "SELECT * FROM autopilot_actions WHERE status = 'pending'";
$params = [];

if ($filterType) {
    $sql .= " AND action_type = ?";
    $params[] = $filterType;
}

if ($filterPriority) {
    $sql .= " AND priority = ?";
    $params[] = $filterPriority;
}

if ($search) {
    $sql .= " AND (title LIKE ? OR description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$sql .= " ORDER BY 
    CASE priority 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$pendingActions = $stmt->fetchAll();

// Verfügbare Action-Types für Filter
$typesStmt = $pdo->query("SELECT DISTINCT action_type FROM autopilot_actions WHERE status = 'pending'");
$availableTypes = $typesStmt->fetchAll(PDO::FETCH_COLUMN);

$pageTitle = 'Autopilot: Offene Bestätigungen';
include 'includes/header.php';

$csrfToken = generateCsrfToken();
?>

<style>
    .modal {
        display: none;
        position: fixed;
        z-index: 100;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    .modal.active {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

<!-- Filter Bar -->
<div class="bg-white rounded-xl shadow-md p-6 mb-6">
    <form method="GET" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Suche -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Suche</label>
            <input 
                type="text" 
                name="search" 
                value="<?php echo $search; ?>"
                placeholder="Titel oder Beschreibung..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
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

        <!-- Priorität Filter -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priorität</label>
            <select name="priority" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">Alle Prioritäten</option>
                <option value="critical" <?php echo $filterPriority === 'critical' ? 'selected' : ''; ?>>Kritisch</option>
                <option value="high" <?php echo $filterPriority === 'high' ? 'selected' : ''; ?>>Hoch</option>
                <option value="medium" <?php echo $filterPriority === 'medium' ? 'selected' : ''; ?>>Mittel</option>
                <option value="low" <?php echo $filterPriority === 'low' ? 'selected' : ''; ?>>Niedrig</option>
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

<!-- Aktionen-Liste -->
<div class="bg-white rounded-xl shadow-md">
    <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
            🤖 Offene Bestätigungen 
            <span class="text-purple-600">(<?php echo count($pendingActions); ?>)</span>
        </h2>
    </div>

    <?php if (count($pendingActions) > 0): ?>
        <div class="divide-y divide-gray-200">
            <?php foreach ($pendingActions as $action): ?>
                <div class="p-6 hover:bg-gray-50" data-action-id="<?php echo $action['id']; ?>">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <!-- Info -->
                        <div class="flex-1 mb-4 lg:mb-0">
                            <div class="flex items-center space-x-3 mb-2">
                                <!-- Priorität Badge -->
                                <?php
                                $priorityColors = [
                                    'critical' => 'bg-red-100 text-red-800 border-red-300',
                                    'high' => 'bg-orange-100 text-orange-800 border-orange-300',
                                    'medium' => 'bg-yellow-100 text-yellow-800 border-yellow-300',
                                    'low' => 'bg-green-100 text-green-800 border-green-300'
                                ];
                                $priorityLabels = [
                                    'critical' => '🔴 KRITISCH',
                                    'high' => '🟠 HOCH',
                                    'medium' => '🟡 MITTEL',
                                    'low' => '🟢 NIEDRIG'
                                ];
                                ?>
                                <span class="px-3 py-1 text-xs font-bold rounded-full border <?php echo $priorityColors[$action['priority']]; ?>">
                                    <?php echo $priorityLabels[$action['priority']]; ?>
                                </span>

                                <!-- Action Type -->
                                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    <?php echo clean($action['action_type']); ?>
                                </span>

                                <!-- Zeitstempel -->
                                <span class="text-sm text-gray-500">
                                    <?php echo timeAgo($action['created_at']); ?>
                                </span>
                            </div>

                            <!-- Titel -->
                            <h3 class="text-lg font-bold text-gray-800 mb-1">
                                <?php echo clean($action['title']); ?>
                            </h3>

                            <!-- Beschreibung -->
                            <p class="text-gray-600">
                                <?php echo clean($action['description']); ?>
                            </p>

                            <!-- Details-Button -->
                            <?php if ($action['metadata']): ?>
                                <button 
                                    onclick="showDetails(<?php echo $action['id']; ?>)"
                                    class="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
                                >
                                    📋 Mehr Details anzeigen
                                </button>
                            <?php endif; ?>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex space-x-3">
                            <button 
                                onclick="handleAction(<?php echo $action['id']; ?>, 'approve')"
                                class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-md flex items-center space-x-2"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                <span>Bestätigen</span>
                            </button>

                            <button 
                                onclick="handleAction(<?php echo $action['id']; ?>, 'reject')"
                                class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-md flex items-center space-x-2"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                <span>Ablehnen</span>
                            </button>
                        </div>
                    </div>

                    <!-- Versteckter Details-Bereich -->
                    <div id="details-<?php echo $action['id']; ?>" class="hidden mt-4 p-4 bg-gray-100 rounded-lg">
                        <h4 class="font-bold text-gray-800 mb-2">Technische Details:</h4>
                        <pre class="text-sm text-gray-700 overflow-x-auto"><?php echo json_encode(json_decode($action['metadata']), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); ?></pre>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <!-- Keine offenen Aktionen -->
        <div class="text-center py-16">
            <div class="text-6xl mb-4">✅</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Alles erledigt!</h3>
            <p class="text-gray-600">Es gibt aktuell keine offenen Autopilot-Bestätigungen.</p>
            <?php if ($filterType || $search || $filterPriority): ?>
                <a href="autopilot-pending.php" class="inline-block mt-4 text-purple-600 hover:text-purple-800 font-medium">
                    Filter zurücksetzen →
                </a>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>

<!-- JavaScript -->
<script>
const csrfToken = '<?php echo $csrfToken; ?>';

function showDetails(actionId) {
    const detailsDiv = document.getElementById('details-' + actionId);
    detailsDiv.classList.toggle('hidden');
}

async function handleAction(actionId, decision) {
    const confirmMessage = decision === 'approve' 
        ? 'Möchtest du diese Aktion wirklich BESTÄTIGEN?' 
        : 'Möchtest du diese Aktion wirklich ABLEHNEN?';
    
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        const response = await fetch('autopilot-pending.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action_id=${actionId}&decision=${decision}&csrf_token=${csrfToken}`
        });

        const data = await response.json();

        if (data.success) {
            // Erfolgsmeldung
            alert('✅ ' + data.message);
            
            // Element entfernen
            const element = document.querySelector(`[data-action-id="${actionId}"]`);
            element.style.opacity = '0';
            setTimeout(() => element.remove(), 300);
            
            // Seite neu laden nach 1 Sekunde
            setTimeout(() => location.reload(), 1000);
        } else {
            alert('❌ Fehler: ' + data.message);
        }
    } catch (error) {
        alert('❌ Ein Fehler ist aufgetreten: ' + error.message);
    }
}
</script>

<?php include 'includes/footer.php'; ?>
