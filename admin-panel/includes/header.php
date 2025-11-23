<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? 'Dashboard'; ?> - Anpip Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Smooth Transitions */
        * {
            transition: all 0.2s ease;
        }
        
        /* Mobile Menu Toggle */
        .mobile-menu-hidden {
            transform: translateX(-100%);
        }
    </style>
</head>
<body class="bg-gray-100">
    
    <!-- Mobile Menu Button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
        <button id="mobileMenuBtn" class="bg-white p-3 rounded-lg shadow-lg">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        </button>
    </div>

    <div class="flex h-screen overflow-hidden">
        
        <!-- Sidebar -->
        <aside id="sidebar" class="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex-shrink-0 fixed lg:relative h-full z-40 mobile-menu-hidden lg:transform-none">
            <div class="p-6">
                <!-- Logo -->
                <div class="flex items-center space-x-3 mb-8">
                    <div class="text-3xl">🚀</div>
                    <div>
                        <h1 class="text-xl font-bold">Anpip Admin</h1>
                        <p class="text-xs text-gray-400">Weltmarke Panel</p>
                    </div>
                </div>

                <!-- User Info -->
                <div class="bg-gray-800 rounded-lg p-3 mb-6">
                    <div class="flex items-center space-x-3">
                        <div class="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                            <?php echo strtoupper(substr($currentAdmin['username'], 0, 1)); ?>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate"><?php echo clean($currentAdmin['username']); ?></p>
                            <p class="text-xs text-gray-400"><?php echo clean($currentAdmin['role']); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <nav class="space-y-1">
                    <a href="index.php" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 <?php echo basename($_SERVER['PHP_SELF']) === 'index.php' ? 'bg-gray-700' : ''; ?>">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <span>Dashboard</span>
                    </a>

                    <a href="users.php" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 <?php echo basename($_SERVER['PHP_SELF']) === 'users.php' ? 'bg-gray-700' : ''; ?>">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                        <span>User</span>
                    </a>

                    <a href="content.php" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 <?php echo basename($_SERVER['PHP_SELF']) === 'content.php' ? 'bg-gray-700' : ''; ?>">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        <span>Videos / Inhalte</span>
                    </a>

                    <!-- Autopilot Section -->
                    <div class="pt-4 pb-2">
                        <p class="px-4 text-xs font-semibold text-gray-400 uppercase">Autopilot</p>
                    </div>

                    <a href="autopilot-pending.php" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 <?php echo basename($_SERVER['PHP_SELF']) === 'autopilot-pending.php' ? 'bg-gray-700' : ''; ?>">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Offene Bestätigungen</span>
                        <?php
                        $pendingCount = $pdo->query("SELECT COUNT(*) FROM autopilot_actions WHERE status = 'pending'")->fetchColumn();
                        if ($pendingCount > 0):
                        ?>
                            <span class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"><?php echo $pendingCount; ?></span>
                        <?php endif; ?>
                    </a>

                    <a href="autopilot-history.php" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 <?php echo basename($_SERVER['PHP_SELF']) === 'autopilot-history.php' ? 'bg-gray-700' : ''; ?>">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Letzte Änderungen</span>
                    </a>

                    <a href="autopilot-settings.php" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 <?php echo basename($_SERVER['PHP_SELF']) === 'autopilot-settings.php' ? 'bg-gray-700' : ''; ?>">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>Einstellungen</span>
                    </a>

                    <!-- System Section -->
                    <div class="pt-4 pb-2">
                        <p class="px-4 text-xs font-semibold text-gray-400 uppercase">System</p>
                    </div>

                    <a href="admin-users.php" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 <?php echo basename($_SERVER['PHP_SELF']) === 'admin-users.php' ? 'bg-gray-700' : ''; ?>">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        <span>Admin-User</span>
                    </a>

                    <a href="logout.php" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-700 mt-4">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span>Logout</span>
                    </a>
                </nav>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto">
            <div class="container mx-auto px-4 lg:px-8 py-8">
                <!-- Page Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-800"><?php echo $pageTitle ?? 'Dashboard'; ?></h1>
                    <p class="text-gray-600 mt-1">Willkommen zurück, <?php echo clean($currentAdmin['username']); ?>! 👋</p>
                </div>

                <!-- Page Content -->
