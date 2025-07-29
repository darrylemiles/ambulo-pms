        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mainContent = document.getElementById('mainContent');
        const overlay = document.getElementById('overlay');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');

        let isCollapsed = false;
        let isMobile = window.innerWidth <= 768;

        function updateLayout() {
            isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('sidebar-collapsed');
                mainContent.classList.add('sidebar-hidden');
            } else {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                mainContent.classList.remove('sidebar-hidden');
                
                if (isCollapsed) {
                    sidebar.classList.add('collapsed');
                    mainContent.classList.add('sidebar-collapsed');
                } else {
                    sidebar.classList.remove('collapsed');
                    mainContent.classList.remove('sidebar-collapsed');
                }
            }
        }

        sidebarToggle.addEventListener('click', function() {
            if (!isMobile) {
                isCollapsed = !isCollapsed;
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('sidebar-collapsed');
                
                const arrow = sidebarToggle.querySelector('span');
                arrow.textContent = isCollapsed ? '→' : '←';
            }
        });

        mobileMenuBtn.addEventListener('click', function() {
            if (isMobile) {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            }
        });

        overlay.addEventListener('click', function() {
            if (isMobile) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });

        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                if (isMobile) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
                
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        window.addEventListener('resize', updateLayout);
        updateLayout();

        // Add interactive effects to cards
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Add hover effects to bars in chart
        document.querySelectorAll('.bar').forEach((bar, index) => {
            bar.addEventListener('mouseenter', function() {
                this.style.transform = 'scaleY(1.1)';
                this.style.background = 'linear-gradient(to top, #2563eb, #3b82f6)';
            });
            
            bar.addEventListener('mouseleave', function() {
                this.style.transform = 'scaleY(1)';
                this.style.background = 'linear-gradient(to top, #3b82f6, #60a5fa)';
            });
        });