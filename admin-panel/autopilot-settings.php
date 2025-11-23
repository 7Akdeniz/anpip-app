<?php
/**
 * ANPIP ADMIN-PANEL - AUTOPILOT: EINSTELLUNGEN
 */

session_start();
require_once 'config.php';
requireLogin();

$currentAdmin = getCurrentAdmin();
$message = '';
$messageType = '';

// Einstellungen speichern
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    if (!verifyCsrfToken($csrfToken)) {
        $message = 'Ungültiges CSRF-Token';
        $messageType = 'error';
    } else {
        // Alle Einstellungen abrufen
        $settingsStmt = $pdo->query("SELECT setting_key FROM autopilot_settings");
        $allSettings = $settingsStmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($allSettings as $settingKey) {
            $newValue = isset($_POST[$settingKey]) ? 1 : 0;
            
            $updateStmt = $pdo->prepare("
                UPDATE autopilot_settings 
                SET setting_value = ?, updated_at = NOW(), updated_by_admin_id = ?
                WHERE setting_key = ?
            ");
            $updateStmt->execute([$newValue, $currentAdmin['id'], $settingKey]);
        }
        
        logSystem('autopilot_settings', 'Autopilot-Einstellungen wurden aktualisiert', 'info');
        $message = 'Einstellungen erfolgreich gespeichert!';
        $messageType = 'success';
    }
}

// Aktuelle Einstellungen laden
$settingsStmt = $pdo->query("SELECT * FROM autopilot_settings ORDER BY id");
$settings = $settingsStmt->fetchAll();

// Als assoziatives Array umwandeln
$settingsArray = [];
foreach ($settings as $setting) {
    $settingsArray[$setting['setting_key']] = $setting;
}

$pageTitle = 'Autopilot: Einstellungen';
include 'includes/header.php';

$csrfToken = generateCsrfToken();
?>

<!-- Nachricht -->
<?php if ($message): ?>
    <div class="mb-6 <?php echo $messageType === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'; ?> p-4 rounded-lg">
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <?php if ($messageType === 'success'): ?>
                    <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                <?php else: ?>
                    <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                <?php endif; ?>
            </div>
            <div class="ml-3">
                <p class="text-sm <?php echo $messageType === 'success' ? 'text-green-700' : 'text-red-700'; ?>">
                    <?php echo $message; ?>
                </p>
            </div>
        </div>
    </div>
<?php endif; ?>

<!-- Info-Box -->
<div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
    <div class="flex items-start">
        <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </div>
        <div class="ml-3">
            <h3 class="text-lg font-bold text-blue-900 mb-2">🤖 Was ist der Autopilot?</h3>
            <p class="text-blue-800 mb-2">
                Der Autopilot ist ein intelligentes System, das kontinuierlich deine Plattform überwacht und automatisch Probleme erkennt.
                Je nach Einstellung kann er eigenständig handeln oder dich um Bestätigung bitten.
            </p>
            <p class="text-blue-800">
                <strong>Wichtig:</strong> Aktiviere nur Einstellungen, bei denen du dem Autopilot vertraust. 
                Bei kritischen Entscheidungen solltest du immer eine manuelle Bestätigung verlangen.
            </p>
        </div>
    </div>
</div>

<!-- Einstellungsformular -->
<div class="bg-white rounded-xl shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">⚙️ Autopilot-Einstellungen</h2>
    
    <form method="POST" action="">
        <input type="hidden" name="csrf_token" value="<?php echo $csrfToken; ?>">
        
        <div class="space-y-6">
            
            <!-- Einstellung 1: Textkorrekturen -->
            <?php if (isset($settingsArray['auto_text_corrections'])): ?>
                <div class="border-b border-gray-200 pb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                ✏️ Automatische Textkorrekturen
                            </h3>
                            <p class="text-gray-600">
                                <?php echo clean($settingsArray['auto_text_corrections']['description']); ?>
                            </p>
                            <p class="text-sm text-gray-500 mt-2">
                                <strong>Beispiele:</strong> Rechtschreibfehler, doppelte Leerzeichen, fehlende Satzzeichen
                            </p>
                        </div>
                        <div class="ml-6">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="auto_text_corrections" 
                                    class="sr-only peer"
                                    <?php echo $settingsArray['auto_text_corrections']['setting_value'] ? 'checked' : ''; ?>
                                >
                                <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Einstellung 2: Spam automatisch löschen -->
            <?php if (isset($settingsArray['auto_spam_delete'])): ?>
                <div class="border-b border-gray-200 pb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                🚫 Spam automatisch löschen
                            </h3>
                            <p class="text-gray-600">
                                <?php echo clean($settingsArray['auto_spam_delete']['description']); ?>
                            </p>
                            <p class="text-sm text-red-600 mt-2">
                                <strong>⚠️ Achtung:</strong> Bei Aktivierung werden verdächtige Inhalte OHNE Bestätigung gelöscht!
                            </p>
                        </div>
                        <div class="ml-6">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="auto_spam_delete" 
                                    class="sr-only peer"
                                    <?php echo $settingsArray['auto_spam_delete']['setting_value'] ? 'checked' : ''; ?>
                                >
                                <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Einstellung 3: Kritische Bestätigung -->
            <?php if (isset($settingsArray['require_critical_approval'])): ?>
                <div class="border-b border-gray-200 pb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                🔒 Kritische Änderungen immer bestätigen
                            </h3>
                            <p class="text-gray-600">
                                <?php echo clean($settingsArray['require_critical_approval']['description']); ?>
                            </p>
                            <p class="text-sm text-green-600 mt-2">
                                <strong>💡 Empfohlen:</strong> Diese Einstellung sollte IMMER aktiviert sein für maximale Kontrolle.
                            </p>
                        </div>
                        <div class="ml-6">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="require_critical_approval" 
                                    class="sr-only peer"
                                    <?php echo $settingsArray['require_critical_approval']['setting_value'] ? 'checked' : ''; ?>
                                >
                                <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Einstellung 4: Verdächtige Inhalte markieren -->
            <?php if (isset($settingsArray['auto_flag_suspicious'])): ?>
                <div class="pb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                🚩 Verdächtige Inhalte automatisch markieren
                            </h3>
                            <p class="text-gray-600">
                                <?php echo clean($settingsArray['auto_flag_suspicious']['description']); ?>
                            </p>
                            <p class="text-sm text-gray-500 mt-2">
                                <strong>Beispiele:</strong> Ungewöhnliche Aktivitätsmuster, massenhaftes Posten, verdächtige Links
                            </p>
                        </div>
                        <div class="ml-6">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="auto_flag_suspicious" 
                                    class="sr-only peer"
                                    <?php echo $settingsArray['auto_flag_suspicious']['setting_value'] ? 'checked' : ''; ?>
                                >
                                <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

        </div>

        <!-- Speichern-Button -->
        <div class="mt-8 flex justify-end space-x-4">
            <a href="index.php" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700">
                Abbrechen
            </a>
            <button 
                type="submit"
                class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md"
            >
                💾 Einstellungen speichern
            </button>
        </div>
    </form>
</div>

<?php include 'includes/footer.php'; ?>
