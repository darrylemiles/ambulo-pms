fetch("/components/sidebarTenant.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("sidebarContainer-tenant").innerHTML = html;

    // Core DOM elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('overlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const topNavbar = document.querySelector('.top-navbar');
    const mainContent = document.querySelector('.main-content');
    const pageTitle = document.getElementById('pageTitle');
    const searchInput = document.getElementById('searchInput');
    
    // Dropdown elements
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationMenu = document.getElementById('notificationMenu');
    const inboxBtn = document.getElementById('inboxBtn');
    const inboxDropdown = document.getElementById('inboxDropdown');
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');

    // Page title mapping
    const pageTitles = {
      // File-based mapping
      "tenantDashboard.html": "Dashboard",
      "tenantDashboard": "Dashboard",
      "leaseTenant.html": "Lease Information",
      "leaseTenant": "Lease Information", 
      "paymentTenant.html": "Payments",
      "paymentTenant": "Payments",
      "maintenanceTenant.html": "Maintenance Requests",
      "maintenanceTenant": "Maintenance Requests",
      // "documentsTenant.html": "Documents",
      // "documentsTenant": "Documents",

      // Data-page attribute mapping
      dashboard: 'Dashboard',
      lease: 'Lease Information',
      payments: 'Payments',
      maintenance: 'Maintenance Requests',
      messages: 'Messages',
      // documents: 'Documents',
      support: 'Support',

      // Default fallbacks
      index: 'Dashboard',
      "": 'Dashboard'
    };

    // Sample inbox messages data
    const inboxMessages = [
        {
            id: 1,
            sender: "Property Manager",
            subject: "Monthly Rent Reminder",
            preview: "Your rent payment for this month is due on the 30th. Please ensure timely payment to avoid late fees and maintain your good standing with the property.",
            time: "2 hours ago",
            unread: true,
            priority: "high"
        },
        {
            id: 2,
            sender: "Maintenance Team",
            subject: "Work Order #2024-0156 Completed",
            preview: "The plumbing issue in your apartment has been successfully resolved. Our certified technician completed the work and performed quality checks to ensure everything is functioning properly.",
            time: "1 day ago",
            unread: true,
            priority: "medium"
        },
        {
            id: 3,
            sender: "Ambulo Properties",
            subject: "Lease Renewal Opportunity",
            preview: "Your lease agreement is set to expire in 60 days. We would like to discuss renewal options and updated terms. Please contact us at your earliest convenience.",
            time: "3 days ago",
            unread: false,
            priority: "medium"
        },
        {
            id: 4,
            sender: "Community Manager",
            subject: "Exciting Building Amenity Updates",
            preview: "We're excited to announce new premium amenities coming to your building including a state-of-the-art fitness center, rooftop garden, and co-working spaces.",
            time: "1 week ago",
            unread: false,
            priority: "low"
        },
        {
            id: 5,
            sender: "Security Office",
            subject: "Package Delivery Notification",
            preview: "A package has been delivered to your unit and is currently being held at the front desk. Please bring a valid ID to collect your delivery during office hours.",
            time: "2 weeks ago",
            unread: false,
            priority: "medium"
        }
    ];

    // Validate required elements
    if (!sidebar || !sidebarToggle || !overlay) {
      console.error("Required sidebar elements not found in DOM");
      return;
    }

    // Sidebar state management
    let isCollapsed = false;
    let isMobile = window.innerWidth <= 768;

    // === INBOX MESSAGING FUNCTIONS ===
    
    // Populate inbox content
    function populateInbox() {
        const inboxContent = document.getElementById('inboxContent');
        const inboxBadge = document.getElementById('inboxBadge');
        const messagesBadge = document.getElementById('messagesBadge');
        
        if (!inboxContent) return;
        
        const unreadCount = inboxMessages.filter(msg => msg.unread).length;
        
        // Update badges
        if (inboxBadge) {
            if (unreadCount > 0) {
                inboxBadge.textContent = `${unreadCount} New`;
                if (messagesBadge) {
                    messagesBadge.textContent = unreadCount;
                    messagesBadge.style.display = 'flex';
                }
            } else {
                inboxBadge.textContent = 'All Read';
                if (messagesBadge) {
                    messagesBadge.style.display = 'none';
                }
            }
        }
        
        if (inboxMessages.length === 0) {
            inboxContent.innerHTML = `
                <div class="empty-inbox">
                    <div class="empty-inbox-icon">📭</div>
                    <div class="empty-inbox-text">No messages yet</div>
                    <div class="empty-inbox-subtext">You're all caught up!</div>
                </div>
            `;
        } else {
            inboxContent.innerHTML = inboxMessages.map(message => `
                <div class="inbox-item ${message.unread ? 'unread' : ''}" onclick="openMessage(${message.id})">
                    <div class="inbox-item-header">
                        <div class="inbox-sender-section">
                            <span class="inbox-sender">${message.sender}</span>
                            ${message.priority ? `<div class="inbox-priority ${message.priority}"></div>` : ''}
                        </div>
                        <span class="inbox-time">${message.time}</span>
                    </div>
                    <div class="inbox-subject">${message.subject}</div>
                    <div class="inbox-preview">${message.preview}</div>
                </div>
            `).join('');
        }
    }

    // Function to handle message click
    window.openMessage = function(messageId) {
        const message = inboxMessages.find(msg => msg.id === messageId);
        if (message && message.unread) {
            message.unread = false;
            populateInbox();
        }
        alert(`Opening message: "${message.subject}" from ${message.sender}`);
    };

    // === SIDEBAR MANAGEMENT FUNCTIONS ===
    
    function saveCollapsedState() {
      if (!isMobile) {
        localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
      }
    }

    function loadCollapsedState() {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved !== null && !isMobile) {
        isCollapsed = saved === "true";
        if (isCollapsed) {
          sidebar.classList.add("collapsed");
          updateToggleIcon();
          updateContentLayout();
        }
      }
    }

    function updateToggleIcon() {
      const icon = sidebarToggle.querySelector("i");
      if (!icon) return;

      if (isMobile) {
        // Mobile toggle icons
        if (sidebar.classList.contains("mobile-open")) {
          icon.className = "fas fa-times";
          sidebarToggle.title = "Close Menu";
        } else {
          icon.className = "fas fa-bars";
          sidebarToggle.title = "Open Menu";
        }
      } else {
        // Desktop toggle icons
        if (isCollapsed) {
          icon.className = "fas fa-chevron-right";
          sidebarToggle.title = "Expand Sidebar";
        } else {
          icon.className = "fas fa-chevron-left";
          sidebarToggle.title = "Collapse Sidebar";
        }
      }
    }

    function updateContentLayout() {
      if (!isMobile) {
        // Update top navbar position
        if (topNavbar) {
          topNavbar.style.left = isCollapsed ? "80px" : "280px";
        }
        
        // Update main content margin
        if (mainContent) {
          mainContent.style.marginLeft = isCollapsed ? "80px" : "280px";
        }
      }
    }

    function updateLayout() {
      const wasMobile = isMobile;
      isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Mobile layout
        sidebar.classList.remove("collapsed");
        sidebar.classList.remove("mobile-open");
        overlay.classList.remove("active");
        
        // Reset positions for mobile
        if (topNavbar) {
          topNavbar.style.left = "0";
        }
        if (mainContent) {
          mainContent.style.marginLeft = "0";
        }
      } else {
        // Desktop layout
        sidebar.classList.remove("mobile-open");
        overlay.classList.remove("active");
        
        // Restore collapsed state on desktop
        if (isCollapsed) {
          sidebar.classList.add("collapsed");
        }
        
        updateContentLayout();
      }
      
      updateToggleIcon();
    }

    // Enhanced function to update page title
    function updatePageTitle(page) {
      if (pageTitle && pageTitles[page]) {
        pageTitle.textContent = pageTitles[page];
        // Also update document title
        document.title = pageTitles[page] + " | Ambulo PMS";
        console.log('Page title updated to:', pageTitles[page]);
      }
    }

    // Enhanced function to set active navigation item and update title
    function setActiveNavItem(targetPage = null) {
      let currentPage = targetPage;
      
      if (!currentPage) {
        // Auto-detect from URL
        currentPage = window.location.pathname.split("/").pop();
        if (currentPage.includes('.')) {
          currentPage = currentPage.split(".")[0];
        }
        if (!currentPage || currentPage === 'index') {
          currentPage = 'dashboard';
        }
      }

      const navLinks = document.querySelectorAll(".nav-link");

      // Remove active class from all links
      navLinks.forEach((link) => link.classList.remove("active"));

      // Add active class to matching link and update title
      navLinks.forEach((link) => {
        const linkPage = link.getAttribute("data-page");
        const linkHref = link.getAttribute("href");
        let linkFileName = "";
        
        if (linkHref) {
          linkFileName = linkHref.split("/").pop().split(".")[0];
        }

        if (
          linkPage === currentPage ||
          linkFileName === currentPage ||
          (currentPage === "tenantDashboard" && linkPage === "dashboard") ||
          (currentPage === "adminDashboard" && linkPage === "dashboard") ||
          (currentPage === "propertyAdmin" && linkPage === "propertyAdmin") ||
          (currentPage === "index" && linkPage === "dashboard") ||
          (currentPage === "dashboard" && (linkPage === "dashboard" || linkFileName === "tenantDashboard"))
        ) {
          link.classList.add("active");
          
          // Update page title based on the active link
          const pageKey = linkPage || linkFileName || currentPage;
          updatePageTitle(pageKey);
        }
      });
    }

    // === DROPDOWN FUNCTIONALITY ===
    
    function toggleDropdown(menu, button) {
        if (!menu) return;
        
        document.querySelectorAll('.dropdown-menu, .inbox-dropdown-menu').forEach(dropdown => {
            if (dropdown !== menu) {
                dropdown.classList.remove('show', 'active');
            }
        });
        
        if (menu.classList.contains('inbox-dropdown-menu')) {
            menu.classList.toggle('active');
        } else {
            menu.classList.toggle('show');
        }
    }

    // === EVENT LISTENERS ===
    
    // Main sidebar toggle event listener
    sidebarToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      
      if (isMobile) {
        // Mobile toggle
        sidebar.classList.toggle("mobile-open");
        overlay.classList.toggle("active");
      } else {
        // Desktop toggle
        isCollapsed = !isCollapsed;
        sidebar.classList.toggle("collapsed", isCollapsed);
        
        updateContentLayout();
        saveCollapsedState();
      }
      updateToggleIcon();
      
      // Add hover effect
      sidebarToggle.classList.add('hover-effect');
      setTimeout(() => {
          sidebarToggle.classList.remove('hover-effect');
      }, 300);
    });

    // Legacy mobile menu button support
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", function () {
        if (isMobile) {
          sidebar.classList.toggle("mobile-open");
          overlay.classList.toggle("active");
          updateToggleIcon();
        }
      });
    }

    // Overlay click to close on mobile
    overlay.addEventListener("click", function () {
      if (isMobile) {
        sidebar.classList.remove("mobile-open");
        overlay.classList.remove("active");
        updateToggleIcon();
      }
    });

    // Dropdown event listeners
    if (notificationBtn && notificationMenu) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown(notificationMenu, notificationBtn);
        });
    }

    if (inboxBtn && inboxDropdown) {
        inboxBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown(inboxDropdown, inboxBtn);
        });
    }

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown(profileMenu, profileBtn);
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown') && !e.target.closest('.inbox-dropdown')) {
            document.querySelectorAll('.dropdown-menu, .inbox-dropdown-menu').forEach(dropdown => {
                dropdown.classList.remove('show', 'active');
            });
        }
    });

    // Prevent dropdown close when clicking inside
    document.querySelectorAll('.dropdown-menu, .inbox-dropdown-menu').forEach(menu => {
        menu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
            }
        });
    }

    // Enhanced navigation link click handlers
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        if (this.getAttribute("href") === "#") {
          e.preventDefault();
        }

        // Update active state immediately
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        this.classList.add("active");
        
        // Update page title immediately based on data-page attribute or href
        const page = this.dataset.page || this.getAttribute("href").split("/").pop().split(".")[0];
        updatePageTitle(page);

        // Close mobile menu when nav item is clicked
        if (isMobile && sidebar.classList.contains("mobile-open")) {
          sidebar.classList.remove("mobile-open");
          overlay.classList.remove("active");
          updateToggleIcon();
        }
      });
    });

    // Listen for page changes (back/forward browser navigation)
    window.addEventListener("popstate", function() {
      setActiveNavItem();
    });

    // Window resize handler
    window.addEventListener("resize", function() {
      updateLayout();
    });

    // === PROFILE MENU FUNCTIONS ===
    
    window.openProfileSettings = function() {
        console.log('Opening profile settings...');
        if (profileMenu) profileMenu.classList.remove('show');
        alert('Profile settings would open here');
    };

    window.openAccountSettings = function() {
        console.log('Opening account settings...');
        if (profileMenu) profileMenu.classList.remove('show');
        alert('Account settings would open here');
    };

    window.openPreferences = function() {
        console.log('Opening preferences...');
        if (profileMenu) profileMenu.classList.remove('show');
        alert('Preferences would open here');
    };

    window.openHelp = function() {
        console.log('Opening help & support...');
        if (profileMenu) profileMenu.classList.remove('show');
        alert('Help & Support would open here');
    };

    window.logout = function() {
        console.log('Logging out...');
        if (profileMenu) profileMenu.classList.remove('show');
        if (confirm('Are you sure you want to sign out?')) {
            alert('Redirecting to login page...');
        }
    };

    // Notification interactions
    setTimeout(() => {
        document.querySelectorAll('#notificationMenu .dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                const titleElement = this.querySelector('.dropdown-item-title');
                if (titleElement) {
                    console.log('Notification clicked:', titleElement.textContent);
                }
                this.style.opacity = '0.7';
                
                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    let count = parseInt(badge.textContent);
                    if (count > 0) {
                        count--;
                        badge.textContent = count;
                        if (count === 0) {
                            badge.style.display = 'none';
                            const subtitle = document.querySelector('#notificationMenu .dropdown-subtitle');
                            if (subtitle) {
                                subtitle.textContent = 'No unread notifications';
                            }
                        }
                    }
                }
            });
        });
    }, 100);

    // Function to manually set active page (globally accessible)
    function setActivePageManually(pageName) {
      console.log('Manually setting active page to:', pageName);
      setActiveNavItem(pageName);
    }

    // Make function globally available
    window.setActivePageManually = setActivePageManually;

    // === KEYBOARD SHORTCUTS ===
    
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            sidebarToggle.click();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) searchInput.focus();
        }
        
        if (e.key === 'Escape') {
            document.querySelectorAll('.dropdown-menu, .inbox-dropdown-menu').forEach(dropdown => {
                dropdown.classList.remove('show', 'active');
            });
        }
    });

    // === INITIALIZATION ===
    
    // Add smooth scrolling and loading animation
    document.documentElement.style.scrollBehavior = 'smooth';
    
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // Initialize everything
    loadCollapsedState();
    updateLayout();
    setActiveNavItem();
    populateInbox();
    
  })
  .catch((err) => console.error("Error loading sidebar:", err));