<?php
/**
 * ANPIP ADMIN-PANEL - KONFIGURATION
 * 
 * WICHTIG: Diese Datei enthält sensible Zugangsdaten!
 * Bitte nach dem Upload die Datenbank-Zugangsdaten anpassen.
 */

// =====================================================
// DATENBANK-KONFIGURATION
// =====================================================
// Diese Werte bei deinem Webhoster anpassen!

define('DB_HOST', 'localhost');          // Meistens: localhost
define('DB_NAME', 'anpip_admin');        // Dein Datenbankname
define('DB_USER', 'root');               // Dein Datenbank-Benutzername
define('DB_PASS', '');                   // Dein Datenbank-Passwort
define('DB_CHARSET', 'utf8mb4');

// =====================================================
// SICHERHEITS-EINSTELLUNGEN
// =====================================================

// Session-Einstellungen
define('SESSION_NAME', 'ANPIP_ADMIN_SESSION');
define('SESSION_LIFETIME', 7200); // 2 Stunden in Sekunden

// CSRF-Token (wird automatisch generiert)
define('CSRF_TOKEN_NAME', 'csrf_token');

// Passwort-Einstellungen
define('PASSWORD_MIN_LENGTH', 8);

// =====================================================
// ANWENDUNGS-EINSTELLUNGEN
// =====================================================

// Base URL (ohne abschließenden Slash)
// Beispiele:
// - https://admin.anpip.com
// - https://anpip.com/admin
// - http://localhost/anpip/admin-panel
define('BASE_URL', 'http://localhost/anpip/admin-panel');

// Zeitzone
define('TIMEZONE', 'Europe/Berlin');
date_default_timezone_set(TIMEZONE);

// Debug-Modus (auf Produktiv-Server auf false setzen!)
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// =====================================================
// DATENBANKVERBINDUNG
// =====================================================

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        die("Datenbankverbindung fehlgeschlagen: " . $e->getMessage());
    } else {
        die("Ein technischer Fehler ist aufgetreten. Bitte kontaktiere den Administrator.");
    }
}

// =====================================================
// HILFSFUNKTIONEN
// =====================================================

/**
 * Bereinigt Benutzereingaben (XSS-Schutz)
 */
function clean($input) {
    if (is_array($input)) {
        return array_map('clean', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Generiert ein CSRF-Token
 */
function generateCsrfToken() {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

/**
 * Überprüft ein CSRF-Token
 */
function verifyCsrfToken($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

/**
 * JSON-Response senden
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Überprüft, ob User eingeloggt ist
 */
function isLoggedIn() {
    return isset($_SESSION['admin_user_id']) && isset($_SESSION['admin_username']);
}

/**
 * Leitet zur Login-Seite weiter, wenn nicht eingeloggt
 */
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Aktuellen eingeloggten Admin-User abrufen
 */
function getCurrentAdmin() {
    global $pdo;
    if (!isLoggedIn()) {
        return null;
    }
    
    $stmt = $pdo->prepare("SELECT id, username, role, email FROM admin_users WHERE id = ?");
    $stmt->execute([$_SESSION['admin_user_id']]);
    return $stmt->fetch();
}

/**
 * System-Log erstellen
 */
function logSystem($type, $message, $severity = 'info') {
    global $pdo;
    
    $userId = $_SESSION['admin_user_id'] ?? null;
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    $stmt = $pdo->prepare("
        INSERT INTO system_logs (log_type, message, severity, user_id, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([$type, $message, $severity, $userId, $ipAddress, $userAgent]);
}

/**
 * Formatiert Datum/Uhrzeit für deutsche Anzeige
 */
function formatDateTime($timestamp) {
    if (!$timestamp) return '-';
    $date = new DateTime($timestamp);
    return $date->format('d.m.Y H:i');
}

/**
 * Formatiert relative Zeit (z.B. "vor 5 Minuten")
 */
function timeAgo($timestamp) {
    if (!$timestamp) return '-';
    
    $time = strtotime($timestamp);
    $diff = time() - $time;
    
    if ($diff < 60) return 'gerade eben';
    if ($diff < 3600) return floor($diff / 60) . ' Min. her';
    if ($diff < 86400) return floor($diff / 3600) . ' Std. her';
    if ($diff < 604800) return floor($diff / 86400) . ' Tage her';
    
    return formatDateTime($timestamp);
}
