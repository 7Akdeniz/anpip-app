<?php
/**
 * ANPIP ADMIN-PANEL - LOGOUT
 */

session_start();

// Session-Daten löschen
$_SESSION = [];

// Session-Cookie löschen
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Session zerstören
session_destroy();

// Zur Login-Seite weiterleiten
header('Location: login.php');
exit;
