fetch("/components/sidebar.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("sidebarContainer").innerHTML = html;

    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    // const mainContent = document.getElementById("mainContent");
    const overlay = document.getElementById("overlay");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");

    if (!sidebar || !sidebarToggle || !overlay) {
      console.error("Required sidebar elements not found in DOM");
      return;
    }

    let isCollapsed = false;
    let isMobile = window.innerWidth <= 768;

    function saveCollapsedState() {
      localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    }

    function loadCollapsedState() {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved !== null) {
        isCollapsed = saved === "true";
        if (isCollapsed && !isMobile) {
          sidebar.classList.add("collapsed");
          // mainContent.classList.add("sidebar-collapsed");
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

    function updateMobileToggleIcon() {
      const icon = sidebarToggle.querySelector("i");
      if (icon && isMobile) {
        // On mobile, always show hamburger/bars icon when sidebar is hidden
        if (sidebar.classList.contains("mobile-open")) {
          icon.className = "fas fa-times"; // X icon when sidebar is open
          sidebarToggle.title = "Close Menu";
        } else {
          icon.className = "fas fa-bars"; // Hamburger icon when sidebar is closed
          sidebarToggle.title = "Open Menu";
        }
      }
    }

    // Add active state function here
    function setActiveNavItem() {
      // Get current page name from URL
      const currentPage =
        window.location.pathname.split("/").pop().split(".")[0] ||
        "adminDashboard";
      const navLinks = document.querySelectorAll(".nav-link");

      // Remove all active classes first
      navLinks.forEach((link) => link.classList.remove("active"));

      // Add active class to current page
      navLinks.forEach((link) => {
        const linkPage = link.getAttribute("data-page");
        if (
          linkPage === currentPage ||
          (currentPage === "adminDashboard" && linkPage === "dashboard") ||
          (currentPage === "propertyAdmin" && linkPage === "propertyAdmin")
        ) {
          link.classList.add("active");
        }
      });
    }

    function updateLayout() {
      isMobile = window.innerWidth <= 768;

      if (isMobile) {
        sidebar.classList.remove("collapsed");
        sidebar.classList.remove("mobile-open"); // Reset mobile state
        overlay.classList.remove("active");
        isCollapsed = false;
        updateMobileToggleIcon();
      } else {
        sidebar.classList.remove("open", "mobile-open");
        overlay.classList.remove("active");
        sidebar.classList.add("collapsed"); // Always collapsed on desktop
        updateToggleIcon();
      }
    }

    function handleResize() {
      const wasMobile = isMobile;
      isMobile = window.innerWidth <= 768;

      if (wasMobile !== isMobile) {
        updateLayout();
      }
    }

    sidebarToggle.addEventListener("click", function () {
      if (isMobile) {
        sidebar.classList.toggle("mobile-open");
        overlay.classList.toggle("active");
        updateMobileToggleIcon();
      }
    });

    sidebarToggle.addEventListener("mouseenter", function () {
      this.classList.add("hover-effect");
    });

    sidebarToggle.addEventListener("mouseleave", function () {
      this.classList.remove("hover-effect");
    });

    // Legacy mobile menu button support (if it exists)
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", function () {
        if (isMobile) {
          sidebar.classList.toggle("mobile-open");
          overlay.classList.toggle("active");
          updateMobileToggleIcon();
        }
      });
    }

    overlay.addEventListener("click", function () {
      if (isMobile) {
        sidebar.classList.remove("open", "mobile-open");
        overlay.classList.remove("active");
        updateMobileToggleIcon();
      }
    });

    // Updated nav-link click handler
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        if (this.getAttribute("href") === "#") {
          e.preventDefault();
        }

        if (isMobile) {
          sidebar.classList.remove("open", "mobile-open");
          overlay.classList.remove("active");
          updateMobileToggleIcon();
        }
      });
    });

    // Add event listeners
    window.addEventListener("resize", handleResize);

    loadCollapsedState();
    updateLayout();
    setActiveNavItem();
  })
  .catch((err) => console.error("Error loading sidebar:", err));
