// Enhanced unified admin dashboard functionality with sidebar system and component loading
function initializeAdminDashboard() {
    // Load sidebar component first, then initialize all functionality
    fetch("/components/sidebar.html")
        .then((res) => res.text())
        .then((html) => {
            document.getElementById("sidebarContainer").innerHTML = html;
            
            // Initialize all dashboard functionality after sidebar is loaded
            initializeDashboardComponents();
        })
        .catch((err) => {
            console.error("Error loading sidebar:", err);
            // Initialize without sidebar component if loading fails
            initializeDashboardComponents();
        });
}

function initializeDashboardComponents() {
    // DOM element references
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('overlay');
    const topNavbar = document.querySelector('.top-navbar');
    const mainContent = document.querySelector('.main-content') || document.getElementById('mainContent');
    const pageTitle = document.getElementById('pageTitle');
    const searchInput = document.getElementById('searchInput');
    
    // Dropdown elements
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationMenu = document.getElementById('notificationMenu');
    const inboxBtn = document.getElementById('inboxBtn');
    const inboxDropdown = document.getElementById('inboxDropdown');
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');

    // Legacy mobile menu button support
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    // Validate required elements
    if (!sidebar || !sidebarToggle || !overlay) {
        console.error("Required sidebar elements not found in DOM");
        return;
    }

    // Page title mapping for admin pages
    const pageTitles = {
        // File-based mapping
        "adminDashboard.html": "Dashboard",
        "adminDashboard": "Dashboard",
        "propertyAdmin.html": "Properties",
        "propertyAdmin": "Properties",
        "tenants.html": "Tenants",
        "tenants": "Tenants",
        "leaseAdmin.html": "Leases",
        "leaseAdmin": "Leases",
        "paymentAdmin.html": "Payments",
        "paymentAdmin": "Payments",
        "maintenance.html": "Maintenance",
        "maintenance": "Maintenance",
        "inbox.html": "Inbox",
        "inbox": "Inbox",
        "documents.html": "Documents",
        "documents": "Documents",
        "contentManagement.html": "Manage Content",
        "contentManagement": "Manage Content",

        // Data-page attribute mapping
        dashboard: 'Dashboard',
        propertyAdmin: 'Properties',
        tenants: 'Tenants',
        leases: 'Leases',
        payments: 'Payments',
        maintenance: 'Maintenance',
        inbox: 'Inbox',
        documents: 'Documents',
        reports: 'Reports',
        content: 'Manage Content',

        // Default fallbacks
        index: 'Admin Dashboard',
        "": 'Admin Dashboard'
    };

    // Sample admin inbox messages
    const inboxMessages = [
        {
            id: 1,
            sender: "Tenant Support",
            subject: "Urgent: Water Leak in Unit 3B",
            preview: "Emergency maintenance request submitted. Tenant reports significant water leak in bathroom. Immediate response required to prevent property damage.",
            time: "15 minutes ago",
            unread: true,
            priority: "high"
        },
        {
            id: 2,
            sender: "Property Inspector",
            subject: "Monthly Inspection Report - Building A",
            preview: "Completed monthly safety inspection for Building A. Found minor issues with fire extinguishers on floors 2 and 4. Detailed report attached.",
            time: "2 hours ago",
            unread: true,
            priority: "medium"
        },
        {
            id: 3,
            sender: "Legal Department",
            subject: "Lease Agreement Updates Required",
            preview: "New city regulations require updates to standard lease agreements. Please review the attached amendments and implement by next month.",
            time: "1 day ago",
            unread: false,
            priority: "medium"
        },
        {
            id: 4,
            sender: "Accounting",
            subject: "Monthly Financial Summary",
            preview: "Revenue collection at 94% for the month. Three units pending payment follow-up. Overall property performance exceeding projections.",
            time: "2 days ago",
            unread: false,
            priority: "low"
        },
        {
            id: 5,
            sender: "Facilities Management",
            subject: "HVAC System Maintenance Scheduled",
            preview: "Annual HVAC maintenance scheduled for next week. All units will be notified 48 hours in advance. Expect temporary service interruptions.",
            time: "3 days ago",
            unread: false,
            priority: "medium"
        }
    ];

    // Sidebar state management
    let isCollapsed = false;
    let isMobile = window.innerWidth <= 768;

    // === INBOX MESSAGING FUNCTIONS ===
    
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

    function openMessage(messageId) {
        const message = inboxMessages.find(msg => msg.id === messageId);
        if (message && message.unread) {
            message.unread = false;
            populateInbox();
        }
        alert(`Opening message: "${message.subject}" from ${message.sender}`);
    }

    // === SIDEBAR MANAGEMENT FUNCTIONS ===
    
    function saveCollapsedState() {
        try {
            if (!isMobile) {
                localStorage.setItem("adminSidebarCollapsed", isCollapsed.toString());
                // Also save with legacy key for compatibility
                localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
            }
        } catch (e) {
            console.warn("localStorage not available, sidebar state will not persist");
        }
    }

    function loadCollapsedState() {
        try {
            // Try new key first, fallback to legacy key
            let saved = localStorage.getItem("adminSidebarCollapsed");
            if (saved === null) {
                saved = localStorage.getItem("sidebarCollapsed");
            }
            
            if (saved !== null && !isMobile) {
                isCollapsed = saved === "true";
                if (isCollapsed) {
                    sidebar.classList.add("collapsed");
                    updateToggleIcon();
                    updateContentLayout();
                }
            }
        } catch (e) {
            console.warn("Could not load sidebar state from localStorage");
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
                // Legacy class support
                mainContent.classList.toggle("sidebar-collapsed", isCollapsed);
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
                mainContent.classList.remove("sidebar-collapsed");
            }
        } else {
            // Desktop layout
            sidebar.classList.remove("mobile-open", "open"); // Remove mobile classes
            overlay.classList.remove("active");
            
            // Restore collapsed state on desktop
            if (isCollapsed) {
                sidebar.classList.add("collapsed");
            }
            
            updateContentLayout();
        }
        
        updateToggleIcon();
    }

    function updatePageTitle(page) {
        if (pageTitle && pageTitles[page]) {
            pageTitle.textContent = pageTitles[page];
            document.title = pageTitles[page] + " | Ambulo PMS";
            console.log('Page title updated to:', pageTitles[page]);
        }
    }

    function setActiveNavItem(targetPage = null) {
        let currentPage = targetPage;
        
        if (!currentPage) {
            currentPage = window.location.pathname.split("/").pop();
            if (currentPage.includes('.')) {
                currentPage = currentPage.split(".")[0];
            }
            if (!currentPage || currentPage === 'index') {
                currentPage = 'dashboard';
            }
        }

        const navLinks = document.querySelectorAll(".nav-link");

        navLinks.forEach((link) => link.classList.remove("active"));

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
                (currentPage === "adminDashboard" && linkPage === "dashboard") ||
                (currentPage === "propertyAdmin" && linkPage === "propertyAdmin") ||
                (currentPage === "index" && linkPage === "dashboard") ||
                (currentPage === "dashboard" && (linkPage === "dashboard" || linkFileName === "adminDashboard"))
            ) {
                link.classList.add("active");
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
    
    sidebarToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        
        if (isMobile) {
            sidebar.classList.toggle("mobile-open");
            overlay.classList.toggle("active");
        } else {
            isCollapsed = !isCollapsed;
            sidebar.classList.toggle("collapsed", isCollapsed);
            updateContentLayout();
            saveCollapsedState();
        }
        updateToggleIcon();
        
        // Visual feedback
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

    // Hover effects for sidebar toggle
    sidebarToggle.addEventListener("mouseenter", function () {
        this.classList.add("hover-effect");
    });

    sidebarToggle.addEventListener("mouseleave", function () {
        this.classList.remove("hover-effect");
    });

    overlay.addEventListener("click", function () {
        if (isMobile) {
            sidebar.classList.remove("mobile-open", "open");
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

    // Prevent dropdown menu clicks from closing the dropdown
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

    // Navigation link handlers
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", function (e) {
            if (this.getAttribute("href") === "#") {
                e.preventDefault();
            }

            // Update active state
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            this.classList.add("active");
            
            // Update page title
            const page = this.dataset.page || this.getAttribute("href").split("/").pop().split(".")[0];
            updatePageTitle(page);

            // Close mobile sidebar
            if (isMobile && (sidebar.classList.contains("mobile-open") || sidebar.classList.contains("open"))) {
                sidebar.classList.remove("mobile-open", "open");
                overlay.classList.remove("active");
                updateToggleIcon();
            }
        });
    });

    // Window event listeners
    window.addEventListener("popstate", function() {
        setActiveNavItem();
    });

    window.addEventListener("resize", function() {
        updateLayout();
    });

    // === PROFILE MENU FUNCTIONS ===
    
    function openProfileSettings() {
        console.log('Opening profile settings...');
        if (profileMenu) profileMenu.classList.remove('show');
        alert('Admin profile settings would open here');
    }

    function openAccountSettings() {
        console.log('Opening account settings...');
        if (profileMenu) profileMenu.classList.remove('show');
        alert('Account settings would open here');
    }

    function openPreferences() {
        console.log('Opening preferences...');
        if (profileMenu) profileMenu.classList.remove('show');
        alert('Admin preferences would open here');
    }

    function openHelp() {
        console.log('Opening help & support...');
        if (profileMenu) profileMenu.classList.remove('show');
        alert('Admin help & support would open here');
    }

    function logout() {
        console.log('Admin logging out...');
        if (profileMenu) profileMenu.classList.remove('show');
        if (confirm('Are you sure you want to sign out?')) {
            alert('Redirecting to admin login page...');
        }
    }

    // Make functions globally accessible
    window.openMessage = openMessage;
    window.openProfileSettings = openProfileSettings;
    window.openAccountSettings = openAccountSettings;
    window.openPreferences = openPreferences;
    window.openHelp = openHelp;
    window.logout = logout;

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

    // === KEYBOARD SHORTCUTS ===
    
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + B to toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            sidebarToggle.click();
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) searchInput.focus();
        }
        
        // Escape to close dropdowns
        if (e.key === 'Escape') {
            document.querySelectorAll('.dropdown-menu, .inbox-dropdown-menu').forEach(dropdown => {
                dropdown.classList.remove('show', 'active');
            });
        }
    });

    // === INITIALIZATION ===
    
    // Smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Page load animation
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
    
    console.log('Admin dashboard initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminDashboard);
} else {
    initializeAdminDashboard();
}