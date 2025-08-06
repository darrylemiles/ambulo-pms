    fetch('/components/sidebar.html') 
        .then(res => res.text())
        .then(html => {
            document.getElementById('sidebarContainer').innerHTML = html;
    
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebarToggle');
            const mainContent = document.getElementById('mainContent');
            const overlay = document.getElementById('overlay');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
            // Check if elements exist
            if (!sidebar || !sidebarToggle || !mainContent || !overlay || !mobileMenuBtn) {
                console.error('Required sidebar elements not found in DOM');
                return;
            }
    
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
    
            function handleResize() {
                isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    sidebar.classList.add('hidden');
                    mainContent.classList.add('sidebar-hidden');
                    mainContent.classList.remove('sidebar-collapsed');
                } else {
                    sidebar.classList.remove('hidden');
                    if (isCollapsed) {
                        mainContent.classList.add('sidebar-collapsed');
                        mainContent.classList.remove('sidebar-hidden');
                    } else {
                        mainContent.classList.remove('sidebar-hidden', 'sidebar-collapsed');
                    }
                }
            }
    
            sidebarToggle.addEventListener('click', function () {
                if (!isMobile) {
                    isCollapsed = !isCollapsed;
                    sidebar.classList.toggle('collapsed');
                    mainContent.classList.toggle('sidebar-collapsed');
    
                    const arrow = sidebarToggle.querySelector('span');
                    if (arrow) {
                        arrow.textContent = isCollapsed ? '→' : '←';
                    }
                }
            });
    
            mobileMenuBtn.addEventListener('click', function () {
                if (isMobile) {
                    sidebar.classList.toggle('open');
                    overlay.classList.toggle('active');
                }
            });
    
            overlay.addEventListener('click', function () {
                if (isMobile) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
            });
    
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function () {
                    if (isMobile) {
                        sidebar.classList.remove('open');
                        overlay.classList.remove('active');
                    }
    
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                });
            });
    
            // Add event listeners
            window.addEventListener('resize', updateLayout);
            window.addEventListener('resize', handleResize);
            
            // Initialize layout
            updateLayout();
            handleResize();
        })
        .catch(err => console.error('Error loading sidebar:', err));