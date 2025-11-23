            </div>
        </main>
    </div>

    <!-- JavaScript -->
    <script>
        // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-menu-hidden');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 1024) {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    sidebar.classList.add('mobile-menu-hidden');
                }
            }
        });

        // Auto-refresh für offene Bestätigungen (optional)
        <?php if (basename($_SERVER['PHP_SELF']) === 'autopilot-pending.php'): ?>
        // Seite alle 30 Sekunden aktualisieren, wenn auf Autopilot-Pending-Seite
        // setTimeout(() => location.reload(), 30000);
        <?php endif; ?>
    </script>
</body>
</html>
