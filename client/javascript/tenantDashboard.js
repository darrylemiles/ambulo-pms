    fetch('../client/components/sidebar.html') 
      .then(res => res.text())
      .then(html => {
        document.getElementById('sidebarContainer').innerHTML = html;

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

        sidebarToggle.addEventListener('click', function () {
          if (!isMobile) {
            isCollapsed = !isCollapsed;
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');

            const arrow = sidebarToggle.querySelector('span');
            arrow.textContent = isCollapsed ? '→' : '←';
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

        window.addEventListener('resize', updateLayout);
        updateLayout();
      })
      .catch(err => console.error('Error loading sidebar:', err));
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

            // Profile dropdown
    document.addEventListener('DOMContentLoaded', () => {
      const profileBtn = document.getElementById('profileBtnIcon');
      const dropdownMenu = document.getElementById('dropdownMenu');

      if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener('click', () => {
          dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        window.addEventListener('click', (e) => {
          if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
          }
        });
      }


      // Card hover effect
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function () {
          this.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', function () {
          this.style.transform = 'translateY(0)';
        });
      });

      // Bar chart hover effect
      document.querySelectorAll('.bar').forEach((bar) => {
        bar.addEventListener('mouseenter', function () {
          this.style.transform = 'scaleY(1.1)';
          this.style.background = 'linear-gradient(to top, #030303ff, #3b82f6)';
        });
        bar.addEventListener('mouseleave', function () {
          this.style.transform = 'scaleY(1)';
          this.style.background = 'linear-gradient(to top, #3b82f6, #60a5fa)';
        });
      });
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

        document.addEventListener('DOMContentLoaded', () => {
        const profileBtn = document.getElementById('profileBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');

        profileBtn.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        window.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
            }
        });
        });