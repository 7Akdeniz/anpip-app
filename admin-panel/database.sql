-- =====================================================
-- ANPIP ADMIN-PANEL - DATENBANK-SCHEMA
-- Für MySQL/MariaDB
-- =====================================================

-- Datenbank erstellen (optional - kann in phpMyAdmin übersprungen werden)
CREATE DATABASE IF NOT EXISTS anpip_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE anpip_admin;

-- =====================================================
-- ADMIN-BENUTZER TABELLE
-- =====================================================
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
  `email` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` TIMESTAMP NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Standard-Admin-User anlegen
-- Passwort: 123456 (bitte nach Login ändern!)
INSERT INTO `admin_users` (`username`, `password_hash`, `role`, `email`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'admin@anpip.com');

-- =====================================================
-- AUTOPILOT-AKTIONEN TABELLE
-- =====================================================
CREATE TABLE `autopilot_actions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `action_type` VARCHAR(50) NOT NULL COMMENT 'z.B. text_correction, spam_detection, video_flagged',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` ENUM('pending', 'approved', 'rejected', 'auto_executed') DEFAULT 'pending',
  `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `decided_at` TIMESTAMP NULL,
  `decided_by_admin_id` INT UNSIGNED NULL,
  `related_content_type` VARCHAR(50) COMMENT 'video, comment, user, etc.',
  `related_content_id` INT UNSIGNED NULL,
  `related_user_id` INT UNSIGNED NULL,
  `metadata` JSON COMMENT 'Zusätzliche Daten im JSON-Format',
  INDEX idx_status (status),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at),
  INDEX idx_priority (priority),
  FOREIGN KEY (decided_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Beispiel-Daten für Autopilot
INSERT INTO `autopilot_actions` (`action_type`, `title`, `description`, `status`, `priority`, `metadata`) VALUES
('spam_detection', 'Verdächtiger User erkannt', 'User @test123 hat 50 identische Kommentare in 2 Minuten gepostet', 'pending', 'high', '{"user_id": 123, "comment_count": 50}'),
('text_correction', 'Rechtschreibfehler in Video-Titel', 'Video #456: "Tollle Reise" → "Tolle Reise"', 'pending', 'low', '{"video_id": 456, "old_text": "Tollle Reise", "new_text": "Tolle Reise"}'),
('content_flag', 'Video von mehreren Usern gemeldet', 'Video #789 wurde 12x als unangemessen gemeldet', 'pending', 'critical', '{"video_id": 789, "report_count": 12}'),
('user_verification', 'Ungewöhnliche Anmelde-Aktivität', 'User @celebrity99 hat sich von 5 verschiedenen Ländern angemeldet', 'pending', 'medium', '{"user_id": 99, "countries": ["DE", "US", "CN", "BR", "IN"]}');

-- =====================================================
-- AUTOPILOT-EINSTELLUNGEN TABELLE
-- =====================================================
CREATE TABLE `autopilot_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TINYINT(1) DEFAULT 0,
  `description` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_admin_id` INT UNSIGNED NULL,
  FOREIGN KEY (updated_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Standard-Einstellungen
INSERT INTO `autopilot_settings` (`setting_key`, `setting_value`, `description`) VALUES
('auto_text_corrections', 0, 'Autopilot darf kleine Textkorrekturen automatisch ausführen'),
('auto_spam_delete', 0, 'Autopilot darf Spam automatisch löschen'),
('require_critical_approval', 1, 'Für kritische Änderungen IMMER Bestätigung nötig'),
('auto_flag_suspicious', 1, 'Verdächtige Inhalte automatisch zur Überprüfung markieren');

-- =====================================================
-- SYSTEM-LOGS TABELLE
-- =====================================================
CREATE TABLE `system_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `log_type` VARCHAR(50) NOT NULL COMMENT 'login, autopilot, user_action, error, etc.',
  `message` TEXT NOT NULL,
  `severity` ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT UNSIGNED NULL,
  `ip_address` VARCHAR(45),
  `user_agent` VARCHAR(255),
  INDEX idx_log_type (log_type),
  INDEX idx_created_at (created_at),
  INDEX idx_severity (severity),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DEMO-DATEN FÜR USER & CONTENT
-- (Diese Tabellen werden normalerweise von deiner Hauptapp genutzt)
-- =====================================================

-- Beispiel: Anpip User-Tabelle
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `status` ENUM('active', 'suspended', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_active_at` TIMESTAMP NULL,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo-User
INSERT INTO `users` (`username`, `email`, `status`) VALUES
('johndoe', 'john@example.com', 'active'),
('janedoe', 'jane@example.com', 'active'),
('test_user', 'test@example.com', 'suspended');

-- Beispiel: Videos/Content-Tabelle
CREATE TABLE IF NOT EXISTS `videos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255),
  `status` ENUM('published', 'flagged', 'removed', 'pending') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `views` INT UNSIGNED DEFAULT 0,
  `report_count` INT UNSIGNED DEFAULT 0,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo-Videos
INSERT INTO `videos` (`user_id`, `title`, `status`, `views`, `report_count`) VALUES
(1, 'Meine erste Reise nach Bali', 'published', 15420, 0),
(2, 'Cooking Tutorial - Pizza', 'published', 8932, 0),
(3, 'Suspicious Content', 'flagged', 234, 5);

-- =====================================================
-- STATISTIKEN & DASHBOARD-DATEN (Views)
-- =====================================================

-- View für Dashboard-Statistiken
CREATE OR REPLACE VIEW `dashboard_stats` AS
SELECT
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) AS users_today,
  (SELECT COUNT(*) FROM videos) AS total_videos,
  (SELECT COUNT(*) FROM videos WHERE DATE(created_at) = CURDATE()) AS videos_today,
  (SELECT COUNT(*) FROM autopilot_actions WHERE status = 'pending') AS pending_autopilot_actions,
  (SELECT COUNT(*) FROM videos WHERE status = 'flagged') AS flagged_content;

-- =====================================================
-- FERTIG!
-- =====================================================
-- Alle Tabellen wurden erstellt.
-- Standard-Login: admin / 123456
-- Bitte Passwort nach erstem Login ändern!
