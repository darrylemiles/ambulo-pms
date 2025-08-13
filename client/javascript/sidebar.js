fetch("/components/sidebar.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("sidebarContainer").innerHTML = html;

    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const mainContent = document.getElementById("mainContent");
    const overlay = document.getElementById("overlay");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");

    // Check if elements exist
    if (
      !sidebar ||
      !sidebarToggle ||
      !mainContent ||
      !overlay ||
      !mobileMenuBtn
    ) {
      console.error("Required sidebar elements not found in DOM");
      return;
    }

    let isCollapsed = false;
    let isMobile = window.innerWidth <= 768;

    // Store collapsed state in localStorage to persist across pages
    function saveCollapsedState() {
      localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }

    function loadCollapsedState() {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        isCollapsed = saved === 'true';
        if (isCollapsed && !isMobile) {
          sidebar.classList.add("collapsed");
          mainContent.classList.add("sidebar-collapsed");
          updateToggleIcon();
        }
      }
    }

    function updateToggleIcon() {
      const icon = sidebarToggle.querySelector("i");
      if (icon) {
        if (isCollapsed) {
          icon.className = "fas fa-chevron-right";
          sidebarToggle.title = "Expand Sidebar";
        } else {
          icon.className = "fas fa-chevron-left";
          sidebarToggle.title = "Collapse Sidebar";
        }
      }
    }

    // Add active state function here
    function setActiveNavItem() {
      // Get current page name from URL
      const currentPage = window.location.pathname.split('/').pop().split('.')[0] || 'adminDashboard';
      const navLinks = document.querySelectorAll('.nav-link');
      
      // Remove all active classes first
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to current page
      navLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage || 
            (currentPage === 'adminDashboard' && linkPage === 'dashboard') ||
            (currentPage === 'propertyAdmin' && linkPage === 'propertyAdmin')) {
          link.classList.add('active');
        }
      });
    }

    function updateLayout() {
      isMobile = window.innerWidth <= 768;

      if (isMobile) {
        sidebar.classList.remove("collapsed");
        mainContent.classList.remove("sidebar-collapsed");
        mainContent.classList.add("sidebar-hidden");
        isCollapsed = false; // Reset collapsed state on mobile
      } else {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
        mainContent.classList.remove("sidebar-hidden");

        if (isCollapsed) {
          sidebar.classList.add("collapsed");
          mainContent.classList.add("sidebar-collapsed");
        } else {
          sidebar.classList.remove("collapsed");
          mainContent.classList.remove("sidebar-collapsed");
        }
      }
      updateToggleIcon();
    }

    function handleResize() {
      const wasMobile = isMobile;
      isMobile = window.innerWidth <= 768;

      // Only update if mobile state actually changed
      if (wasMobile !== isMobile) {
        updateLayout();
      }
    }

    sidebarToggle.addEventListener("click", function () {
      if (!isMobile) {
        isCollapsed = !isCollapsed;
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("sidebar-collapsed");
        updateToggleIcon();
        saveCollapsedState(); // Save state when toggling
      }
    });

    sidebarToggle.addEventListener("mouseenter", function () {
      this.classList.add("hover-effect");
    });

    sidebarToggle.addEventListener("mouseleave", function () {
      this.classList.remove("hover-effect");
    });

    mobileMenuBtn.addEventListener("click", function () {
      if (isMobile) {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
      }
    });

    overlay.addEventListener("click", function () {
      if (isMobile) {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
      }
    });

    // Updated nav-link click handler - PRESERVE COLLAPSED STATE
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        // Only prevent default for non-functional links (those with href="#")
        if (this.getAttribute('href') === '#') {
          e.preventDefault();
        }

        // Close mobile menu if open
        if (isMobile) {
          sidebar.classList.remove("open");
          overlay.classList.remove("active");
        }

        // DON'T manually update active state here - let the page load handle it
        // DON'T modify sidebar collapsed state when navigating
        
        // For functional links, let the browser handle navigation naturally
        // The active state will be set by setActiveNavItem() on the new page
      });
    });

    // Add event listeners
    window.addEventListener("resize", handleResize);

    // Initialize layout and set active state
    loadCollapsedState(); // Load saved state first
    updateLayout();
    
    // Call setActiveNavItem after DOM is ready
    setTimeout(() => {
      setActiveNavItem();
    }, 100); // Small delay to ensure all elements are loaded
  })
  .catch((err) => console.error("Error loading sidebar:", err));