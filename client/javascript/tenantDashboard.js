        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mainContent = document.getElementById('mainContent');

        let sidebarCollapsed = false;
        let sidebarHidden = false;

        sidebarToggle.addEventListener('click', function() {
            if (!sidebarHidden) {
                if (!sidebarCollapsed) {
                    sidebar.classList.add('collapsed');
                    mainContent.classList.add('sidebar-collapsed');
                    mainContent.classList.remove('sidebar-hidden');
                    sidebarToggle.innerHTML = '<span>→</span>';
                    sidebarCollapsed = true;
                } else {
                    sidebar.classList.add('hidden');
                    mainContent.classList.add('sidebar-hidden');
                    mainContent.classList.remove('sidebar-collapsed');
                    sidebarToggle.innerHTML = '<span>→</span>';
                    sidebarHidden = true;
                }
            } else {
                sidebar.classList.remove('hidden', 'collapsed');
                mainContent.classList.remove('sidebar-hidden', 'sidebar-collapsed');
                sidebarToggle.innerHTML = '<span>←</span>';
                sidebarCollapsed = false;
                sidebarHidden = false;
            }
        });

        // Calendar navigation functionality
        const currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        function updateCalendar() {
            const monthTitle = document.querySelector('.month-title');
            monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
            
        }

        document.querySelectorAll('.nav-btn').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                if (index === 0) {
                    currentMonth--;
                    if (currentMonth < 0) {
                        currentMonth = 11;
                        currentYear--;
                    }
                } else {
                    currentMonth++;
                    if (currentMonth > 11) {
                        currentMonth = 0;
                        currentYear++;
                    }
                }
                updateCalendar();
            });
        });

        // Add click handlers for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                
                this.classList.add('active');
            });
        });

        //hover effects to cards
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        });

        searchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = 'none';
        });
        
        // Responsive sidebar for mobile
        function handleResize() {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('hidden');
                mainContent.classList.add('sidebar-hidden');
                mainContent.classList.remove('sidebar-collapsed');
            } else if (!sidebarHidden) {
                sidebar.classList.remove('hidden');
                if (sidebarCollapsed) {
                    mainContent.classList.add('sidebar-collapsed');
                    mainContent.classList.remove('sidebar-hidden');
                } else {
                    mainContent.classList.remove('sidebar-hidden', 'sidebar-collapsed');
                }
            }
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Call on initial load