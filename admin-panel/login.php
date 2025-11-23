<?php
/**
 * ANPIP ADMIN-PANEL - LOGIN-SEITE
 */

session_start();
require_once 'config.php';

// Wenn bereits eingeloggt, zum Dashboard weiterleiten
if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$error = '';

// Login-Formular verarbeiten
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = clean($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    // CSRF-Token prüfen
    if (!verifyCsrfToken($csrfToken)) {
        $error = 'Ungültige Anfrage. Bitte versuche es erneut.';
    } elseif (empty($username) || empty($password)) {
        $error = 'Bitte Benutzername und Passwort eingeben.';
    } else {
        // Benutzer aus Datenbank abrufen
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ? AND is_active = 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        // Passwort überprüfen
        if ($user && password_verify($password, $user['password_hash'])) {
            // Login erfolgreich
            $_SESSION['admin_user_id'] = $user['id'];
            $_SESSION['admin_username'] = $user['username'];
            $_SESSION['admin_role'] = $user['role'];
            
            // Letzten Login aktualisieren
            $updateStmt = $pdo->prepare("UPDATE admin_users SET last_login_at = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);
            
            // System-Log
            logSystem('login', "Admin '{$user['username']}' hat sich eingeloggt", 'info');
            
            // Weiterleitung zum Dashboard
            header('Location: index.php');
            exit;
        } else {
            $error = 'Ungültiger Benutzername oder Passwort.';
            logSystem('login_failed', "Fehlgeschlagener Login-Versuch für Benutzer: $username", 'warning');
        }
    }
}

// CSRF-Token generieren
$csrfToken = generateCsrfToken();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anpip Admin - Login</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Logo / Header -->
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-2">🚀 Anpip</h1>
            <p class="text-purple-200">Admin Panel</p>
        </div>

        <!-- Login-Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Anmelden</h2>

            <?php if ($error): ?>
                <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700"><?php echo $error; ?></p>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <form method="POST" action="" class="space-y-6">
                <input type="hidden" name="csrf_token" value="<?php echo $csrfToken; ?>">

                <!-- Benutzername -->
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                        Benutzername
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required
                        autocomplete="username"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="admin"
                        value="<?php echo $_POST['username'] ?? ''; ?>"
                    >
                </div>

                <!-- Passwort -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        Passwort
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required
                        autocomplete="current-password"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="••••••••"
                    >
                </div>

                <!-- Login-Button -->
                <button 
                    type="submit"
                    class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition duration-200 shadow-lg"
                >
                    Anmelden
                </button>
            </form>

            <!-- Hinweis -->
            <div class="mt-6 text-center text-sm text-gray-500">
                <p>Standard-Zugangsdaten:</p>
                <p class="font-mono bg-gray-100 px-2 py-1 rounded mt-1">admin / 123456</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-6 text-purple-200 text-sm">
            <p>&copy; <?php echo date('Y'); ?> Anpip.com - Weltmarke in Entwicklung 🌍</p>
        </div>
    </div>
</body>
</html>
