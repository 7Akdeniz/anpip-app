<?php
/**
 * ANPIP ADMIN-PANEL - ADMIN-USER-VERWALTUNG
 */

session_start();
require_once 'config.php';
requireLogin();

$currentAdmin = getCurrentAdmin();
$message = '';
$messageType = '';

// Nur Super-Admins dürfen hier rein
if ($currentAdmin['role'] !== 'super_admin') {
    die('Zugriff verweigert. Nur Super-Admins dürfen Admin-User verwalten.');
}

// Neuen Admin erstellen
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_admin'])) {
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    if (!verifyCsrfToken($csrfToken)) {
        $message = 'Ungültiges CSRF-Token';
        $messageType = 'error';
    } else {
        $username = clean($_POST['username'] ?? '');
        $email = clean($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $role = clean($_POST['role'] ?? 'admin');
        
        if (empty($username) || empty($password)) {
            $message = 'Benutzername und Passwort sind erforderlich';
            $messageType = 'error';
        } elseif (strlen($password) < PASSWORD_MIN_LENGTH) {
            $message = 'Passwort muss mindestens ' . PASSWORD_MIN_LENGTH . ' Zeichen lang sein';
            $messageType = 'error';
        } else {
            // Prüfen, ob Username schon existiert
            $checkStmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ?");
            $checkStmt->execute([$username]);
            
            if ($checkStmt->fetch()) {
                $message = 'Benutzername existiert bereits';
                $messageType = 'error';
            } else {
                // Admin erstellen
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                
                $insertStmt = $pdo->prepare("
                    INSERT INTO admin_users (username, password_hash, role, email)
                    VALUES (?, ?, ?, ?)
                ");
                
                if ($insertStmt->execute([$username, $passwordHash, $role, $email])) {
                    logSystem('admin_created', "Neuer Admin-User erstellt: $username (Rolle: $role)", 'info');
                    $message = 'Admin-User erfolgreich erstellt!';
                    $messageType = 'success';
                } else {
                    $message = 'Fehler beim Erstellen des Admin-Users';
                    $messageType = 'error';
                }
            }
        }
    }
}

// Admin deaktivieren/aktivieren
if (isset($_GET['action']) && isset($_GET['admin_id'])) {
    $adminId = (int)$_GET['admin_id'];
    $action = clean($_GET['action']);
    $csrfToken = $_GET['csrf_token'] ?? '';
    
    if (verifyCsrfToken($csrfToken) && $adminId !== $currentAdmin['id']) {
        if ($action === 'deactivate') {
            $pdo->prepare("UPDATE admin_users SET is_active = 0 WHERE id = ?")->execute([$adminId]);
            logSystem('admin_action', "Admin-User #$adminId wurde deaktiviert", 'warning');
        } elseif ($action === 'activate') {
            $pdo->prepare("UPDATE admin_users SET is_active = 1 WHERE id = ?")->execute([$adminId]);
            logSystem('admin_action', "Admin-User #$adminId wurde aktiviert", 'info');
        }
        
        header('Location: admin-users.php');
        exit;
    }
}

// Alle Admin-User abrufen
$admins = $pdo->query("SELECT * FROM admin_users ORDER BY created_at DESC")->fetchAll();

$pageTitle = 'Admin-User verwalten';
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

<!-- Neuen Admin erstellen -->
<div class="bg-white rounded-xl shadow-md p-6 mb-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4">➕ Neuen Admin-User erstellen</h2>
    
    <form method="POST" class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input type="hidden" name="csrf_token" value="<?php echo $csrfToken; ?>">
        <input type="hidden" name="create_admin" value="1">
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Benutzername *</label>
            <input 
                type="text" 
                name="username" 
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="admin_user"
            >
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
            <input 
                type="email" 
                name="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="admin@anpip.com"
            >
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Passwort *</label>
            <input 
                type="password" 
                name="password" 
                required
                minlength="<?php echo PASSWORD_MIN_LENGTH; ?>"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
            >
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rolle</label>
            <select name="role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="super_admin">Super Admin</option>
            </select>
        </div>
        
        <div class="flex items-end">
            <button type="submit" class="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium">
                Erstellen
            </button>
        </div>
    </form>
</div>

<!-- Admin-User Liste -->
<div class="bg-white rounded-xl shadow-md overflow-hidden">
    <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
            🔐 Admin-User 
            <span class="text-gray-500 text-base font-normal">(<?php echo count($admins); ?> User)</span>
        </h2>
    </div>

    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rolle</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Erstellt</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Letzter Login</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <?php foreach ($admins as $admin): ?>
                    <tr class="hover:bg-gray-50 <?php echo $admin['id'] === $currentAdmin['id'] ? 'bg-purple-50' : ''; ?>">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            #<?php echo $admin['id']; ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                                    <?php echo strtoupper(substr($admin['username'], 0, 1)); ?>
                                </div>
                                <div class="ml-3">
                                    <div class="text-sm font-medium text-gray-900">
                                        <?php echo clean($admin['username']); ?>
                                        <?php if ($admin['id'] === $currentAdmin['id']): ?>
                                            <span class="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Du</span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <?php echo clean($admin['email']); ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <?php
                            $roleColors = [
                                'super_admin' => 'bg-red-100 text-red-800',
                                'admin' => 'bg-blue-100 text-blue-800',
                                'moderator' => 'bg-green-100 text-green-800'
                            ];
                            $roleLabels = [
                                'super_admin' => '👑 Super Admin',
                                'admin' => '🔐 Admin',
                                'moderator' => '👮 Moderator'
                            ];
                            ?>
                            <span class="px-3 py-1 text-xs font-semibold rounded-full <?php echo $roleColors[$admin['role']]; ?>">
                                <?php echo $roleLabels[$admin['role']]; ?>
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <?php if ($admin['is_active']): ?>
                                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    ✅ Aktiv
                                </span>
                            <?php else: ?>
                                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    ⏸️ Deaktiviert
                                </span>
                            <?php endif; ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <?php echo formatDateTime($admin['created_at']); ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <?php echo $admin['last_login_at'] ? timeAgo($admin['last_login_at']) : 'Nie'; ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <?php if ($admin['id'] !== $currentAdmin['id']): ?>
                                <?php if ($admin['is_active']): ?>
                                    <a href="?action=deactivate&admin_id=<?php echo $admin['id']; ?>&csrf_token=<?php echo $csrfToken; ?>" 
                                       onclick="return confirm('Admin-User wirklich deaktivieren?')"
                                       class="text-orange-600 hover:text-orange-900 font-medium">
                                        Deaktivieren
                                    </a>
                                <?php else: ?>
                                    <a href="?action=activate&admin_id=<?php echo $admin['id']; ?>&csrf_token=<?php echo $csrfToken; ?>" 
                                       class="text-green-600 hover:text-green-900 font-medium">
                                        Aktivieren
                                    </a>
                                <?php endif; ?>
                            <?php else: ?>
                                <span class="text-gray-400">-</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Info-Box -->
<div class="mt-6 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
    <div class="flex items-start">
        <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </div>
        <div class="ml-3">
            <h3 class="text-lg font-bold text-blue-900 mb-2">ℹ️ Rollen-Erklärung</h3>
            <ul class="text-blue-800 space-y-1">
                <li><strong>👑 Super Admin:</strong> Volle Rechte inkl. Admin-User-Verwaltung</li>
                <li><strong>🔐 Admin:</strong> Kann User, Inhalte und Autopilot verwalten</li>
                <li><strong>👮 Moderator:</strong> Kann nur Inhalte moderieren (eingeschränkte Rechte)</li>
            </ul>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
