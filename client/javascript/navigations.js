(function () {
  function getCookie(name) {
    if (!document || !document.cookie) return null;
    const match = document.cookie.match("(^|;)s*" + name + "s*=s*([^;]+)");
    return match ? match[2] : null;
  }

  function getJwtToken() {
    const token = getCookie("token");
    return token || null;
  }

  function decodeJwtPayload(token) {
    if (!token) return null;
    try {
      var parts = token.split(".");
      if (parts.length < 2) return null;
      var payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (payload.length % 4) payload += "=";
      var json = decodeURIComponent(
        atob(payload)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function ensureScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = Array.from(document.getElementsByTagName("script")).find(
        (s) => s.src && s.src.indexOf(src) !== -1
      );
      if (existing) return resolve(existing);
      var s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = function () {
        resolve(s);
      };
      s.onerror = function (err) {
        reject(err);
      };
      document.head.appendChild(s);
    });
  }

  async function maybeInjectFragment(path, containerId) {
    try {
      if (document.getElementById(containerId)) return;
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) return;
      const html = await res.text();

      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;

      const body = document.body || document.getElementsByTagName("body")[0];
      while (wrapper.firstChild) {
        body.insertBefore(wrapper.firstChild, body.firstChild);
      }
    } catch (e) {
      console.warn("Failed to inject fragment", path, e);
    }
  }

  async function initUnifiedNavigation() {
    var token = getJwtToken();
    var payload = decodeJwtPayload(token);

    var role =
      (payload && (payload.role || payload.user_role || payload.userRole)) ||
      null;

    if (role && typeof role === "string") role = role.toUpperCase();

    var target = "tenant";
    if (role && (role === "ADMIN" || role === "MANAGER" || role === "STAFF"))
      target = "admin";

    if (
      document.getElementById("sidebarContainer") ||
      document.getElementById("navbarContainer")
    ) {
      await maybeInjectFragment("/components/sidebar.html", "sidebarContainer");
      await maybeInjectFragment(
        "/components/top-navbar.html",
        "navbarContainer"
      );
    } else {
      await maybeInjectFragment("/components/top-navbar.html", "navbar");
      await maybeInjectFragment("/components/sidebar.html", "sidebar");
    }

    try {
      await ensureScript("/javascript/navbar.js");
    } catch (e) {
      console.debug("navbar.js not found or failed to load, continuing");
    }

    try {
      if (target === "admin") {
        if (typeof NavigationManager === "undefined") {
          await ensureScript("/javascript/navigationsAdmin.js");
        }
        if (typeof NavigationManager !== "undefined") {
          if (typeof NavigationManager.initializeNavigation === "function") {
            NavigationManager.initializeNavigation();
          } else {
            if (
              typeof NavigationManager === "function" &&
              typeof NavigationManager.initializeNavigation === "undefined"
            ) {
              NavigationManager.prototype &&
                NavigationManager.prototype.init &&
                new NavigationManager();
            }
          }
          return;
        }
      } else {
        if (typeof TenantNavigationManager === "undefined") {
          await ensureScript("/javascript/navigationsTenant.js");
        }
        if (typeof TenantNavigationManager !== "undefined") {
          if (
            typeof TenantNavigationManager.initializeTenantNavigation ===
            "function"
          ) {
            TenantNavigationManager.initializeTenantNavigation();
          } else {
            if (
              typeof TenantNavigationManager === "function" &&
              typeof TenantNavigationManager.initializeTenantNavigation ===
                "undefined"
            ) {
              TenantNavigationManager.prototype &&
                TenantNavigationManager.prototype.init &&
                new TenantNavigationManager();
            }
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to dynamically load navigation script", e);
    }

    if (
      typeof NavigationManager !== "undefined" &&
      typeof NavigationManager.initializeNavigation === "function"
    )
      NavigationManager.initializeNavigation();
    else if (
      typeof TenantNavigationManager !== "undefined" &&
      typeof TenantNavigationManager.initializeTenantNavigation === "function"
    )
      TenantNavigationManager.initializeTenantNavigation();
    else console.warn("No navigation manager available to initialize");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUnifiedNavigation);
  } else {
    initUnifiedNavigation();
  }

  async function setupAdminNavbar() {
    function getCookieLocal(name) {
      if (!document || !document.cookie) return null;
      const match = document.cookie.match(
        "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
      );
      return match ? match[2] : null;
    }

    function getJwtTokenLocal() {
      const token = getCookieLocal("token");
      if (!token) {
        try {
          window.location.href = "/login.html";
        } catch (e) {}
      }
      return token;
    }

    function normalizeLocal(obj) {
      if (!obj || typeof obj !== "object") return null;
      const candidate = obj.user || obj.data || obj;
      const name =
        candidate.name ||
        candidate.fullName ||
        ((candidate.first_name || candidate.firstName) &&
        (candidate.last_name || candidate.lastName)
          ? `${candidate.first_name || candidate.firstName} ${
              candidate.last_name || candidate.lastName
            }`
          : null) ||
        candidate.username ||
        candidate.email ||
        null;
      if (!name) return null;
      const initial = name && name[0] ? name[0].toUpperCase() : "";
      const role =
        candidate.role || candidate.userRole || candidate.user_role || "Admin";
      const avatarUrl =
        candidate.avatar ||
        candidate.avatarUrl ||
        candidate.photo ||
        candidate.profile_image ||
        null;
      return { name, initial, role, avatarUrl };
    }

    async function tryFetchLocal(url, extraHeaders = {}) {
      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json", ...extraHeaders },
        });
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json();
          return normalizeLocal(json);
        } else {
          return null;
        }
      } catch (e) {
        console.warn("Fetch error for", url, e);
        return null;
      }
    }

    function decodeJwtPayloadLocal(token) {
      try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        let payload = parts[1];
        payload = payload.replace(/-/g, "+").replace(/_/g, "/");
        while (payload.length % 4) payload += "=";
        const json = atob(payload);
        return JSON.parse(json);
      } catch (e) {
        return null;
      }
    }

    let user = null;
    try {
      const token = getJwtTokenLocal();
      const payload = decodeJwtPayloadLocal(token);
      const userId =
        payload && (payload.user_id || payload.userId || payload.id);
      if (userId) {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        user = await tryFetchLocal(
          `/api/v1/users/${encodeURIComponent(userId)}`,
          headers
        );
      }
    } catch (e) {
      console.warn("JWT decode or user fetch error", e);
    }

    const profileBtn = document.getElementById("profileBtn");
    const profileAvatar = document.getElementById("profileAvatar");
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const viewAllMessagesBtn = document.getElementById("viewAllMessagesBtn");

    if (user) {
      if (profileBtn) {
        if (user.avatarUrl) {
          profileBtn.style.backgroundImage = `url('${user.avatarUrl}')`;
          profileBtn.style.backgroundSize = "cover";
          profileBtn.style.backgroundPosition = "center";
          profileBtn.textContent = "";
        } else {
          profileBtn.style.backgroundImage = "";
          profileBtn.textContent =
            user.initial || (user.name && user.name[0]) || "";
        }
        profileBtn.title = user.name || "";
      }
      if (profileAvatar) {
        if (user.avatarUrl) {
          profileAvatar.style.backgroundImage = `url('${user.avatarUrl}')`;
          profileAvatar.style.backgroundSize = "cover";
          profileAvatar.style.backgroundPosition = "center";
          profileAvatar.textContent = "";
        } else {
          profileAvatar.style.backgroundImage = "";
          profileAvatar.textContent =
            user.initial || (user.name && user.name[0]) || "";
        }
      }
      if (profileName) {
        profileName.textContent = user.name || "";
      }
      if (profileRole) {
        profileRole.textContent = user.role || "";
      }
      if (viewAllMessagesBtn) viewAllMessagesBtn.href = "/messages.html";
      const contactSubmissionsMenuItem = document.getElementById(
        "contactSubmissionsMenuItem"
      );
      if (contactSubmissionsMenuItem)
        contactSubmissionsMenuItem.style.display = "";
      window.currentAdminUser = user;
    } else {
      if (profileBtn) {
        profileBtn.style.backgroundImage = "";
        profileBtn.textContent = "";
      }
      if (profileAvatar) {
        profileAvatar.style.backgroundImage = "";
        profileAvatar.textContent = "";
      }
      if (profileName) profileName.textContent = "";
      if (profileRole) profileRole.textContent = "";
      if (viewAllMessagesBtn) viewAllMessagesBtn.href = "#";
      const contactSubmissionsMenuItem = document.getElementById(
        "contactSubmissionsMenuItem"
      );
      if (contactSubmissionsMenuItem)
        contactSubmissionsMenuItem.style.display = "none";
      window.currentAdminUser = null;
    }
  }

  function setupSidebarAdmin(role) {
    const sidebarNav = document.getElementById("sidebarNav");
    if (!sidebarNav) return;

    let links = [];
    if (role === "admin") {
      links = [
        {
          href: "/adminDashboard.html",
          icon: "fas fa-chart-line",
          text: "Dashboard",
          page: "dashboard",
          tooltip: "Dashboard",
        },
        {
          href: "/messages.html",
          icon: "fa-solid fa-envelope",
          text: "Messages",
          page: "messagesAdmin",
          tooltip: "Messages",
        },
        { section: "Property Management", isSection: true },
        {
          href: "/propertyAdmin.html",
          icon: "fas fa-building",
          text: "Properties",
          page: "propertyAdmin",
          tooltip: "Properties",
        },
        {
          href: "/tenants.html",
          icon: "fas fa-users",
          text: "Tenants",
          page: "tenants",
          tooltip: "Tenants",
        },
        {
          href: "/documents.html",
          icon: "fa-solid fa-folder",
          text: "Documents",
          page: "documents",
          tooltip: "Documents",
        },
        {
          href: "/leaseAdmin.html",
          icon: "fas fa-file-contract",
          text: "Leases",
          page: "leases",
          tooltip: "Lease Management",
        },
        { section: "Operations", isSection: true },
        {
          href: "/maintenance.html",
          icon: "fas fa-tools",
          text: "Maintenance",
          page: "maintenance",
          tooltip: "Maintenance Requests",
        },
        {
          href: "/paymentAdmin.html",
          icon: "fas fa-credit-card",
          text: "Payments",
          page: "payments",
          tooltip: "Payment Management",
        },
        {
          href: "#",
          icon: "fas fa-chart-bar",
          text: "Reports",
          page: "reports",
          tooltip: "Analytics & Reports",
        },
        { section: "Content Management", isSection: true },
        {
          href: "/contentManagement.html",
          icon: "fa-solid fa-gears",
          text: "Manage Content",
          page: "content",
          tooltip: "Content Management",
        },
      ];
    }

    sidebarNav.innerHTML = links
      .map((link) => {
        if (link.isSection) {
          return `<div class="nav-section"><div class="nav-section-title">${link.section}</div></div>`;
        }
        return `
                <div class="nav-item">
                    <a href="${link.href}" class="nav-link" data-tooltip="${
          link.tooltip || link.text
        }" data-page="${link.page}" title="${link.tooltip || link.text}">
                        <div class="nav-icon"><i class="${link.icon}"></i></div>
                        <span class="nav-text">${link.text}</span>
                    </a>
                </div>
            `;
      })
      .join("");
  }

  class NavigationManager {
    constructor(config = {}) {
      this.config = {
        sidebarSelector: "#sidebar",
        toggleSelector: "#sidebarToggle",
        overlaySelector: "#overlay",
        topNavbarSelector: ".top-navbar",
        mainContentSelector: ".main-content",
        pageTitleSelector: "#pageTitle",
        searchInputSelector: "#searchInput",
        storageKey: "adminSidebarCollapsed",
        ...config,
      };

      this.isCollapsed = false;
      this.isMobile = window.innerWidth <= 768;
      this.inboxMessages = this.getDefaultInboxMessages();

      this.init();
    }

    init() {
      this.cacheDOMElements();
      this.setupPageTitles();
      this.loadCollapsedState();
      this.bindEvents();
      this.updateLayout();
      this.setActiveNavItem();
      this.populateInbox();
      this.addKeyboardShortcuts();
    }

    cacheDOMElements() {
      this.sidebar = document.querySelector(this.config.sidebarSelector);
      this.sidebarToggle = document.querySelector(this.config.toggleSelector);
      this.overlay = document.querySelector(this.config.overlaySelector);
      this.topNavbar = document.querySelector(this.config.topNavbarSelector);
      this.mainContent = document.querySelector(
        this.config.mainContentSelector
      );
      this.pageTitle = document.querySelector(this.config.pageTitleSelector);
      this.pageIcon = document.getElementById("pageIcon");
      this.pageDescription = document.getElementById("pageDescription");
      this.searchInput = document.querySelector(
        this.config.searchInputSelector
      );

      this.notificationBtn = document.getElementById("notificationBtn");
      this.notificationMenu = document.getElementById("notificationMenu");
      this.inboxBtn = document.getElementById("inboxBtn");
      this.inboxDropdown = document.getElementById("inboxDropdown");
      this.profileBtn = document.getElementById("profileBtn");
      this.profileMenu = document.getElementById("profileMenu");
    }

    setupPageTitles() {
      this.pageTitles = {
        "adminDashboard.html": "Dashboard",
        adminDashboard: "Dashboard",
        "propertyAdmin.html": "Properties",
        propertyAdmin: "Properties",
        "tenants.html": "Tenants",
        tenants: "Tenants",
        "leaseAdmin.html": "Leases",
        leaseAdmin: "Leases",
        "paymentAdmin.html": "Payments",
        paymentAdmin: "Payments",
        "maintenance.html": "Maintenance Requests",
        maintenance: "Maintenance Requests",
        "messages.html": "Messages",
        messagesAdmin: "Messages",
        "documents.html": "Documents",
        documents: "Documents",

        "contentManagement.html": "Manage Content",
        contentManagement: "Manage Content",
        "company-information.html": "Manage Content",
        "company-information": "Manage Content",
        "building-addresses.html": "Manage Content",
        "building-addresses": "Manage Content",
        "FAQs.html": "Manage Content",
        FAQs: "Manage Content",
        "lease-terms-cms.html": "Manage Content",
        "lease-terms-cms": "Manage Content",
        "contact-us-submissions.html": "Contact Submissions",
        "contact-us-submissions": "Contact Submissions",
        contactUs: "Contact Submissions",
        "account-profile.html": "Account Settings",
        "account-profile": "Account Settings",

        dashboard: "Dashboard",
        propertyAdmin: "Properties",
        tenants: "Tenants",
        leases: "Leases",
        payments: "Payments",
        maintenance: "Maintenance Requests",
        messagesAdmin: "Messages",
        documents: "Documents",
        reports: "Reports",
        content: "Manage Content",

        index: "Dashboard",
        "": "Dashboard",
      };

      this.pageIcons = {
        "adminDashboard.html": "fas fa-chart-line",
        adminDashboard: "fas fa-chart-line",
        "propertyAdmin.html": "fas fa-building",
        propertyAdmin: "fas fa-building",
        "tenants.html": "fas fa-users",
        tenants: "fas fa-users",
        "leaseAdmin.html": "fas fa-file-contract",
        leaseAdmin: "fas fa-file-contract",
        "paymentAdmin.html": "fas fa-credit-card",
        paymentAdmin: "fas fa-credit-card",
        "maintenance.html": "fas fa-tools",
        maintenance: "fas fa-tools",
        "messages.html": "fas fa-envelope",
        messagesAdmin: "fas fa-envelope",
        "documents.html": "fas fa-folder",
        documents: "fas fa-folder",
        "contentManagement.html": "fas fa-gears",
        contentManagement: "fas fa-gears",
        "company-information.html": "fas fa-gears",
        "company-information": "fas fa-gears",
        "building-addresses.html": "fas fa-gears",
        "building-addresses": "fas fa-gears",
        "FAQs.html": "fas fa-gears",
        FAQs: "fas fa-gears",
        "lease-terms-cms.html": "fas fa-gears",
        "lease-terms-cms": "fas fa-gears",
        "contact-us-submissions.html": "fas fa-comment-dots",
        "contact-us-submissions": "fas fa-comment-dots",
        contactUs: "fas fa-comment-dots",
        "account-profile.html": "fas fa-user-cog",
        "account-profile": "fas fa-user-cog",

        dashboard: "fas fa-chart-line",
        propertyAdmin: "fas fa-building",
        tenants: "fas fa-users",
        leases: "fas fa-file-contract",
        payments: "fas fa-credit-card",
        maintenance: "fas fa-tools",
        messagesAdmin: "fas fa-envelope",
        documents: "fas fa-folder",
        reports: "fas fa-chart-bar",
        content: "fas fa-gears",
        contactUs: "fas fa-comment-dots",

        index: "fas fa-chart-line",
        "": "fas fa-chart-line",
      };

      this.pageDescriptions = {
        "adminDashboard.html":
          "Monitor property performance, track key metrics, and oversee daily operations",
        adminDashboard:
          "Monitor property performance, track key metrics, and oversee daily operations",
        "propertyAdmin.html":
          "Manage property listings, view details, and maintain property information",
        propertyAdmin:
          "Manage property listings, view details, and maintain property information",
        "tenants.html":
          "View tenant information, manage accounts, and track tenant activity",
        tenants:
          "View tenant information, manage accounts, and track tenant activity",
        "leaseAdmin.html":
          "Manage lease agreements, renewals, and rental contract details",
        leaseAdmin:
          "Manage lease agreements, renewals, and rental contract details",
        "paymentAdmin.html":
          "Process payments, track collections, and manage financial transactions",
        paymentAdmin:
          "Process payments, track collections, and manage financial transactions",
        "maintenance.html":
          "Oversee maintenance requests, assign work orders, and track service completion",
        maintenance:
          "Oversee maintenance requests, assign work orders, and track service completion",
        "messages.html":
          "Communicate with tenants and manage property-related correspondence",
        messagesAdmin:
          "Communicate with tenants and manage property-related correspondence",
        "documents.html":
          "Manage property documents, leases, and important administrative files",
        documents:
          "Manage property documents, leases, and important administrative files",
        "contentManagement.html":
          "Configure system settings and manage website content",
        contentManagement:
          "Configure system settings and manage website content",
        "company-information.html":
          "Update company details and business information",
        "company-information":
          "Update company details and business information",
        "building-addresses.html":
          "Manage property addresses and location information",
        "building-addresses":
          "Manage property addresses and location information",
        "FAQs.html":
          "Maintain frequently asked questions and help documentation",
        FAQs: "Maintain frequently asked questions and help documentation",
        "lease-terms-cms.html":
          "Configure lease terms and rental agreement templates",
        "lease-terms-cms":
          "Configure lease terms and rental agreement templates",
        "contact-us-submissions.html":
          "View and manage messages submitted via the Contact Us form",
        "contact-us-submissions":
          "View and manage messages submitted via the Contact Us form",
        contactUs: "View and manage messages submitted via the Contact Us form",
        "account-profile.html":
          "Manage your account details, password, notifications, and verification",
        "account-profile":
          "Manage your account details, password, notifications, and verification",

        dashboard:
          "Monitor property performance, track key metrics, and oversee daily operations",
        propertyAdmin:
          "Manage property listings, view details, and maintain property information",
        tenants:
          "View tenant information, manage accounts, and track tenant activity",
        leases:
          "Manage lease agreements, renewals, and rental contract details",
        payments:
          "Process payments, track collections, and manage financial transactions",
        maintenance:
          "Oversee maintenance requests, assign work orders, and track service completion",
        messagesAdmin:
          "Communicate with tenants and manage property-related correspondence",
        documents:
          "Manage property documents, leases, and important administrative files",
        reports:
          "Generate and analyze property performance and financial reports",
        content: "Configure system settings and manage website content",
        contactUs: "View and manage messages submitted via the Contact Us form",

        index:
          "Monitor property performance, track key metrics, and oversee daily operations",
        "": "Monitor property performance, track key metrics, and oversee daily operations",
      };
    }

    getDefaultInboxMessages() {
      return [
        {
          id: 1,
          sender: "Tenant Support",
          subject: "Urgent: Water Leak in Unit 3B",
          preview:
            "Emergency maintenance request submitted. Tenant reports significant water leak in bathroom. Immediate response required to prevent property damage.",
          time: "15 minutes ago",
          unread: true,
          priority: "high",
        },
        {
          id: 2,
          sender: "Property Inspector",
          subject: "Monthly Inspection Report - Building A",
          preview:
            "Completed monthly safety inspection for Building A. Found minor issues with fire extinguishers on floors 2 and 4. Detailed report attached.",
          time: "2 hours ago",
          unread: true,
          priority: "medium",
        },
        {
          id: 3,
          sender: "Legal Department",
          subject: "Lease Agreement Updates Required",
          preview:
            "New city regulations require updates to standard lease agreements. Please review the attached amendments and implement by next month.",
          time: "1 day ago",
          unread: false,
          priority: "medium",
        },
        {
          id: 4,
          sender: "Accounting",
          subject: "Monthly Financial Summary",
          preview:
            "Revenue collection at 94% for the month. Three units pending payment follow-up. Overall property performance exceeding projections.",
          time: "2 days ago",
          unread: false,
          priority: "low",
        },
        {
          id: 5,
          sender: "Facilities Management",
          subject: "HVAC System Maintenance Scheduled",
          preview:
            "Annual HVAC maintenance scheduled for next week. All units will be notified 48 hours in advance. Expect temporary service interruptions.",
          time: "3 days ago",
          unread: false,
          priority: "medium",
        },
      ];
    }

    saveCollapsedState() {
      try {
        if (!this.isMobile) {
          localStorage.setItem(
            this.config.storageKey,
            this.isCollapsed.toString()
          );
        }
      } catch (e) {
        console.warn("localStorage not available");
      }
    }
    loadCollapsedState() {
      try {
        const saved = localStorage.getItem(this.config.storageKey);
        if (saved !== null && !this.isMobile) {
          this.isCollapsed = saved === "true";
          if (this.isCollapsed && this.sidebar) {
            this.sidebar.classList.add("collapsed");
            this.updateToggleIcon();
            this.updateContentLayout();
          }
        }
      } catch (e) {
        console.warn("Could not load sidebar state");
      }
    }
    updateToggleIcon() {
      if (!this.sidebarToggle) return;
      const icon = this.sidebarToggle.querySelector("i");
      if (!icon) return;
      if (this.isMobile) {
        if (this.sidebar.classList.contains("mobile-open")) {
          icon.className = "fas fa-times";
          this.sidebarToggle.title = "Close Menu";
        } else {
          icon.className = "fas fa-bars";
          this.sidebarToggle.title = "Open Menu";
        }
      } else {
        if (this.isCollapsed) {
          icon.className = "fas fa-chevron-right";
          this.sidebarToggle.title = "Expand Sidebar";
        } else {
          icon.className = "fas fa-chevron-left";
          this.sidebarToggle.title = "Collapse Sidebar";
        }
      }
    }
    updateContentLayout() {
      if (!this.isMobile) {
        if (this.topNavbar) {
          this.topNavbar.style.left = this.isCollapsed ? "80px" : "280px";
        }
        if (this.mainContent) {
          this.mainContent.style.marginLeft = this.isCollapsed
            ? "80px"
            : "280px";
          this.mainContent.classList.toggle(
            "sidebar-collapsed",
            this.isCollapsed
          );
        }
      }
    }
    updateLayout() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) {
        if (this.sidebar) {
          this.sidebar.classList.remove("collapsed");
          this.sidebar.classList.remove("mobile-open");
        }
        if (this.overlay) {
          this.overlay.classList.remove("active");
        }
        if (this.topNavbar) {
          this.topNavbar.style.left = "0";
        }
        if (this.mainContent) {
          this.mainContent.style.marginLeft = "0";
          this.mainContent.classList.remove("sidebar-collapsed");
        }
      } else {
        if (this.sidebar) {
          this.sidebar.classList.remove("mobile-open");
        }
        if (this.overlay) {
          this.overlay.classList.remove("active");
        }
        if (this.isCollapsed && this.sidebar) {
          this.sidebar.classList.add("collapsed");
        }
        this.updateContentLayout();
      }
      this.updateToggleIcon();
    }
    toggleSidebar(e) {
      if (e) e.stopPropagation();
      if (this.isMobile) {
        if (this.sidebar) {
          this.sidebar.classList.toggle("mobile-open");
        }
        if (this.overlay) {
          this.overlay.classList.toggle("active");
        }
      } else {
        this.isCollapsed = !this.isCollapsed;
        if (this.sidebar) {
          this.sidebar.classList.toggle("collapsed", this.isCollapsed);
        }
        this.updateContentLayout();
        this.saveCollapsedState();
      }
      this.updateToggleIcon();
      this.addToggleEffect();
    }
    addToggleEffect() {
      if (this.sidebarToggle) {
        this.sidebarToggle.classList.add("hover-effect");
        setTimeout(() => {
          this.sidebarToggle.classList.remove("hover-effect");
        }, 300);
      }
    }
    closeMobileSidebar() {
      if (this.isMobile) {
        if (this.sidebar) {
          this.sidebar.classList.remove("mobile-open");
        }
        if (this.overlay) {
          this.overlay.classList.remove("active");
        }
        this.updateToggleIcon();
      }
    }
    updatePageTitle(page) {
      let pageKey = page;
      let path = window.location.pathname.split("/").pop();
      let fileName = path.toLowerCase();
      if (
        fileName === "contact-us-submissions.html" ||
        pageKey === "contact-us-submissions" ||
        pageKey === "contactUs"
      ) {
        pageKey = "contactUs";
      } else if (!pageKey) {
        pageKey = path.replace(".html", "") || "dashboard";
      }
      let title =
        this.pageTitles[pageKey] ||
        this.pageTitles[pageKey + ".html"] ||
        this.pageTitles[path] ||
        "Dashboard";
      let icon =
        this.pageIcons[pageKey] ||
        this.pageIcons[pageKey + ".html"] ||
        this.pageIcons[path] ||
        "";
      let description =
        this.pageDescriptions[pageKey] ||
        this.pageDescriptions[pageKey + ".html"] ||
        this.pageDescriptions[path] ||
        "";
      if (this.pageTitle) {
        this.pageTitle.textContent = title;
      }
      if (this.pageIcon && icon) {
        this.pageIcon.className = icon;
      }
      if (this.pageDescription && description) {
        this.pageDescription.textContent = description;
      }
    }
    setActiveNavItem(targetPage = null) {
      let currentPage = targetPage;
      if (!currentPage) {
        currentPage = window.location.pathname.split("/").pop();
        if (currentPage.includes(".")) {
          currentPage = currentPage.split(".")[0];
        }
        if (!currentPage || currentPage === "index") {
          currentPage = "dashboard";
        }
      }
      const path = window.location.pathname.split("/").pop().toLowerCase();
      if (
        path === "contact-us-submissions.html" ||
        currentPage === "contact-us-submissions" ||
        currentPage === "contactUs"
      ) {
        this.updatePageTitle("contactUs");
        return;
      }
      if (
        path === "account-profile.html" ||
        currentPage === "account-profile"
      ) {
        this.updatePageTitle("account-profile");
        return;
      }
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach((link) => link.classList.remove("active"));
      const contentManagementPages = [
        "contentManagement",
        "company-information",
        "building-addresses",
        "FAQs",
        "lease-terms-cms",
      ];
      const isContentPage = contentManagementPages.includes(currentPage);
      navLinks.forEach((link) => {
        const linkPage = link.getAttribute("data-page");
        const linkHref = link.getAttribute("href");
        let linkFileName = "";
        if (linkHref) {
          linkFileName = linkHref.split("/").pop().split(".")[0];
        }
        if (isContentPage && linkPage === "content") {
          link.classList.add("active");
          this.updatePageTitle("content");
          return;
        }
        if (
          linkPage === currentPage ||
          linkFileName === currentPage ||
          (currentPage === "adminDashboard" && linkPage === "dashboard") ||
          (currentPage === "propertyAdmin" && linkPage === "propertyAdmin") ||
          (currentPage === "index" && linkPage === "dashboard") ||
          (currentPage === "dashboard" &&
            (linkPage === "dashboard" || linkFileName === "adminDashboard"))
        ) {
          link.classList.add("active");
          const pageKey = linkPage || linkFileName || currentPage;
          this.updatePageTitle(pageKey);
        }
      });
    }
    populateInbox() {
      const inboxContent = document.getElementById("inboxContent");
      const inboxBadge = document.getElementById("inboxBadge");
      const messagesBadge = document.getElementById("messagesBadge");
      if (!inboxContent) return;
      const unreadCount = this.inboxMessages.filter((msg) => msg.unread).length;
      if (inboxBadge) {
        if (unreadCount > 0) {
          inboxBadge.textContent = `${unreadCount} New`;
          if (messagesBadge) {
            messagesBadge.textContent = unreadCount;
            messagesBadge.style.display = "flex";
          }
        } else {
          inboxBadge.textContent = "All Read";
          if (messagesBadge) {
            messagesBadge.style.display = "none";
          }
        }
      }
      if (this.inboxMessages.length === 0) {
        inboxContent.innerHTML = `<div class="empty-inbox"><div class="empty-inbox-icon">📭</div><div class="empty-inbox-text">No messages yet</div><div class="empty-inbox-subtext">You're all caught up!</div></div>`;
      } else {
        inboxContent.innerHTML = this.inboxMessages
          .map(
            (message) => `
                <div class="inbox-item ${
                  message.unread ? "unread" : ""
                }" onclick="window.navigationManager.openMessage(${
              message.id
            })">
                    <div class="inbox-item-header">
                        <div class="inbox-sender-section">
                            <span class="inbox-sender">${message.sender}</span>
                            ${
                              message.priority
                                ? `<div class="inbox-priority ${message.priority}"></div>`
                                : ""
                            }
                        </div>
                        <span class="inbox-time">${message.time}</span>
                    </div>
                    <div class="inbox-subject">${message.subject}</div>
                    <div class="inbox-preview">${message.preview}</div>
                </div>
            `
          )
          .join("");
      }
    }
    openMessage(messageId) {
      const message = this.inboxMessages.find((msg) => msg.id === messageId);
      if (message && message.unread) {
        message.unread = false;
        this.populateInbox();
      }
    }
    toggleDropdown(menu, button) {
      if (!menu) return;
      document
        .querySelectorAll(".dropdown-menu, .inbox-dropdown-menu")
        .forEach((dropdown) => {
          if (dropdown !== menu) {
            dropdown.classList.remove("show", "active");
          }
        });
      if (menu.classList.contains("inbox-dropdown-menu")) {
        menu.classList.toggle("active");
      } else {
        menu.classList.toggle("show");
      }
    }
    closeAllDropdowns() {
      document
        .querySelectorAll(".dropdown-menu, .inbox-dropdown-menu")
        .forEach((dropdown) => {
          dropdown.classList.remove("show", "active");
        });
    }
    openProfileSettings() {
      this.closeAllDropdowns();
    }
    openAccountSettings() {
      this.closeAllDropdowns();
    }
    openPreferences() {
      this.closeAllDropdowns();
    }
    openHelp() {
      this.closeAllDropdowns();
    }
    logout() {
      this.closeAllDropdowns();
      if (confirm("Are you sure you want to sign out?")) {
        localStorage.clear();
        sessionStorage.clear();
        fetch("/api/v1/users/logout", {
          method: "POST",
          credentials: "include",
        }).finally(() => {
          window.location.href = "/login.html";
        });
      }
    }
    bindEvents() {
      if (this.sidebarToggle) {
        this.sidebarToggle.addEventListener("click", (e) =>
          this.toggleSidebar(e)
        );
      }
      if (this.overlay) {
        this.overlay.addEventListener("click", () => this.closeMobileSidebar());
      }
      if (this.notificationBtn && this.notificationMenu) {
        this.notificationBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleDropdown(this.notificationMenu, this.notificationBtn);
        });
      }
      if (this.inboxBtn && this.inboxDropdown) {
        this.inboxBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleDropdown(this.inboxDropdown, this.inboxBtn);
        });
      }
      if (this.profileBtn && this.profileMenu) {
        this.profileBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleDropdown(this.profileMenu, this.profileBtn);
        });
      }
      document.addEventListener("click", (e) => {
        if (
          !e.target.closest(".dropdown") &&
          !e.target.closest(".inbox-dropdown")
        ) {
          this.closeAllDropdowns();
        }
      });
      document
        .querySelectorAll(".dropdown-menu, .inbox-dropdown-menu")
        .forEach((menu) => {
          menu.addEventListener("click", (e) => e.stopPropagation());
        });
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
          if (link.getAttribute("href") === "#") {
            e.preventDefault();
          }
          document
            .querySelectorAll(".nav-link")
            .forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
          const page =
            link.dataset.page ||
            link.getAttribute("href").split("/").pop().split(".")[0];
          this.updatePageTitle(page);
          this.closeMobileSidebar();
        });
      });
      window.addEventListener("popstate", () => this.setActiveNavItem());
      window.addEventListener("resize", () => this.updateLayout());
      setTimeout(() => {
        document
          .querySelectorAll("#notificationMenu .dropdown-item")
          .forEach((item) => {
            item.addEventListener("click", () => {
              const titleElement = item.querySelector(".dropdown-item-title");
              item.style.opacity = "0.7";
              const badge = document.getElementById("notificationBadge");
              if (badge) {
                let count = parseInt(badge.textContent);
                if (count > 0) {
                  count--;
                  badge.textContent = count;
                  if (count === 0) {
                    badge.style.display = "none";
                    const subtitle = document.querySelector(
                      "#notificationMenu .dropdown-subtitle"
                    );
                    if (subtitle) {
                      subtitle.textContent = "No unread notifications";
                    }
                  }
                }
              }
            });
          });
      }, 100);
    }
    addKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "b") {
          e.preventDefault();
          this.toggleSidebar();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          if (this.searchInput) this.searchInput.focus();
        }
        if (e.key === "Escape") {
          this.closeAllDropdowns();
        }
      });
    }
    static async loadComponent(componentPath, containerId) {
      try {
        const response = await fetch(componentPath);
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = html;
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
        return false;
      }
    }
    static async initializeNavigation(config = {}) {
      const sidebarLoaded = await NavigationManager.loadComponent(
        "/components/sidebar.html",
        "sidebarContainer"
      );
      const navbarLoaded = await NavigationManager.loadComponent(
        "/components/top-navbar.html",
        "navbarContainer"
      );
      if (sidebarLoaded || navbarLoaded) {
        let isCollapsed = false;
        try {
          const saved = localStorage.getItem("adminSidebarCollapsed");
          if (saved !== null) {
            isCollapsed = saved === "true";
          }
        } catch (e) {}
        const sidebar = document.querySelector("#sidebar");
        if (sidebar && isCollapsed) {
          sidebar.classList.add("collapsed");
        }
        setTimeout(() => {
          window.navigationManager = new NavigationManager(config);
          setupAdminNavbar();
          setupSidebarAdmin("admin");
          window.navigationManager.setActiveNavItem();
          const mobileSidebarOpenBtn = document.getElementById(
            "mobileSidebarOpenBtn"
          );
          const sidebar = document.getElementById("sidebar");
          const overlay = document.getElementById("overlay");
          if (mobileSidebarOpenBtn && sidebar && overlay) {
            mobileSidebarOpenBtn.addEventListener("click", function () {
              sidebar.classList.add("mobile-open");
              overlay.classList.add("active");
            });
          }
        }, 10);
      } else {
        window.navigationManager = new NavigationManager(config);
      }
    }
    updateNavigation(updates) {
      if (updates.currentPage) {
        this.setActiveNavItem(updates.currentPage);
      }
      if (updates.pageTitle) {
        this.updatePageTitle(updates.pageTitle);
      }
      if (updates.messages) {
        this.inboxMessages = updates.messages;
        this.populateInbox();
      }
    }
    addNavItem(item) {
      const navContainer = document.querySelector(".sidebar-nav");
      if (!navContainer) return;
      const navItem = document.createElement("div");
      navItem.className = "nav-item";
      navItem.innerHTML = `
            <a href="${item.href || "#"}" class="nav-link" data-tooltip="${
        item.tooltip || item.text
      }" data-page="${item.page || ""}" title="${item.tooltip || item.text}">
                <div class="nav-icon"><i class="${
                  item.icon || "fas fa-circle"
                }"></i></div>
                <span class="nav-text">${item.text}</span>
            </a>
        `;
      if (item.section) {
        const section = navContainer.querySelector(
          `[data-section="${item.section}"]`
        );
        if (section) {
          section.parentNode.insertBefore(navItem, section.nextSibling);
        } else {
          navContainer.appendChild(navItem);
        }
      } else {
        navContainer.appendChild(navItem);
      }
      const link = navItem.querySelector(".nav-link");
      link.addEventListener("click", (e) => {
        if (link.getAttribute("href") === "#") {
          e.preventDefault();
        }
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        const page =
          link.dataset.page ||
          link.getAttribute("href").split("/").pop().split(".")[0];
        this.updatePageTitle(page);
        this.closeMobileSidebar();
      });
    }
    removeNavItem(selector) {
      const item = document.querySelector(selector);
      if (item && item.closest(".nav-item")) {
        item.closest(".nav-item").remove();
      }
    }
    toggleNavVisibility(selector, show) {
      const element = document.querySelector(selector);
      if (element) {
        element.style.display = show ? "" : "none";
      }
    }
    setNavigationTheme(theme) {
      const root = document.documentElement;
      if (theme.colors) {
        Object.entries(theme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
      }
      if (theme.sidebarWidth) {
        root.style.setProperty("--sidebar-width", theme.sidebarWidth);
      }
      if (theme.collapsedWidth) {
        root.style.setProperty(
          "--sidebar-collapsed-width",
          theme.collapsedWidth
        );
      }
    }
    getNavigationState() {
      return {
        isCollapsed: this.isCollapsed,
        isMobile: this.isMobile,
        currentPage: this.getCurrentPage(),
        unreadMessages: this.inboxMessages.filter((msg) => msg.unread).length,
      };
    }
    getCurrentPage() {
      const activeLink = document.querySelector(".nav-link.active");
      return activeLink ? activeLink.dataset.page : null;
    }
    destroy() {
      if (this.sidebarToggle) {
        this.sidebarToggle.removeEventListener("click", this.toggleSidebar);
      }
      window.removeEventListener("resize", this.updateLayout);
      window.removeEventListener("popstate", this.setActiveNavItem);
      Object.keys(this).forEach((key) => {
        if (this[key] instanceof HTMLElement) {
          this[key] = null;
        }
      });
    }
  }

  async function setupTenantNavbar() {
    function getCookieLocal(name) {
      if (!document || !document.cookie) return null;
      const match = document.cookie.match(
        "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
      );
      return match ? match[2] : null;
    }
    function getJwtTokenLocal() {
      const token = getCookieLocal("token");
      if (!token) {
        try {
          window.location.href = "/login.html";
        } catch (e) {}
      }
      return token;
    }
    function normalizeLocal(obj) {
      if (!obj || typeof obj !== "object") return null;
      const candidate = obj.user || obj.data || obj;
      const name =
        candidate.name ||
        candidate.fullName ||
        ((candidate.first_name || candidate.firstName) &&
        (candidate.last_name || candidate.lastName)
          ? `${candidate.first_name || candidate.firstName} ${
              candidate.last_name || candidate.lastName
            }`
          : null) ||
        candidate.username ||
        candidate.email ||
        null;
      if (!name) return null;
      const initial = name && name[0] ? name[0].toUpperCase() : "";
      const role =
        candidate.role || candidate.userRole || candidate.user_role || "Tenant";
      const unit =
        candidate.unit ||
        candidate.unitNumber ||
        candidate.apartment ||
        candidate.user_unit ||
        "";
      const avatarUrl =
        candidate.avatar ||
        candidate.avatarUrl ||
        candidate.photo ||
        candidate.profile_image ||
        null;
      return { name, initial, role, unit, avatarUrl };
    }
    async function tryFetchLocal(url, extraHeaders = {}) {
      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json", ...extraHeaders },
        });
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json();
          return normalizeLocal(json);
        } else {
          return null;
        }
      } catch (e) {
        console.warn("Fetch error for", url, e);
        return null;
      }
    }

    let user = null;
    try {
      const token = getJwtTokenLocal();
      const payload = (function decode(token) {
        try {
          const parts = token.split(".");
          if (parts.length < 2) return null;
          let payload = parts[1];
          payload = payload.replace(/-/g, "+").replace(/_/g, "/");
          while (payload.length % 4) payload += "=";
          const json = atob(payload);
          return JSON.parse(json);
        } catch (e) {
          return null;
        }
      })(token);
      const userId =
        payload && (payload.user_id || payload.userId || payload.id);
      if (userId) {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        user = await tryFetchLocal(
          `/api/v1/users/${encodeURIComponent(userId)}`,
          headers
        );
      }
    } catch (e) {
      console.warn("JWT decode or user fetch error", e);
    }

    const profileBtn = document.getElementById("profileBtn");
    const profileAvatar = document.getElementById("profileAvatar");
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const viewAllMessagesBtn = document.getElementById("viewAllMessagesBtn");

    if (user) {
      if (profileBtn) {
        if (user.avatarUrl) {
          profileBtn.style.backgroundImage = `url('${user.avatarUrl}')`;
          profileBtn.style.backgroundSize = "cover";
          profileBtn.style.backgroundPosition = "center";
          profileBtn.textContent = "";
        } else {
          profileBtn.style.backgroundImage = "";
          profileBtn.textContent =
            user.initial || (user.name && user.name[0]) || "";
        }
        profileBtn.title = user.name || "";
      }
      if (profileAvatar) {
        if (user.avatarUrl) {
          profileAvatar.style.backgroundImage = `url('${user.avatarUrl}')`;
          profileAvatar.style.backgroundSize = "cover";
          profileAvatar.style.backgroundPosition = "center";
          profileAvatar.textContent = "";
        } else {
          profileAvatar.style.backgroundImage = "";
          profileAvatar.textContent =
            user.initial || (user.name && user.name[0]) || "";
        }
      }
      if (profileName) profileName.textContent = user.name || "";
      if (profileRole) {
        const parts = [];
        if (user.role) parts.push(user.role);
        if (user.unit) parts.push(user.unit);
        profileRole.textContent = parts.join(" • ");
      }
      if (viewAllMessagesBtn) viewAllMessagesBtn.href = "/messages.html";
      window.currentTenantUser = user;
    } else {
      if (profileBtn) {
        profileBtn.style.backgroundImage = "";
        profileBtn.textContent = "";
      }
      if (profileAvatar) {
        profileAvatar.style.backgroundImage = "";
        profileAvatar.textContent = "";
      }
      if (profileName) profileName.textContent = "";
      if (profileRole) profileRole.textContent = "";
      if (viewAllMessagesBtn) viewAllMessagesBtn.href = "#";
      window.currentTenantUser = null;
    }
  }

  function setupSidebarTenant(role) {
    const sidebarNav = document.getElementById("sidebarNav");
    if (!sidebarNav) return;
    let links = [];
    if (role === "tenant") {
      links = [
        {
          href: "/tenantDashboard.html",
          icon: "fas fa-chart-line",
          text: "Dashboard",
          page: "dashboard",
          tooltip: "Dashboard Overview",
        },
        {
          href: "/messages.html",
          icon: "fa-solid fa-envelope",
          text: "Messages",
          page: "messages",
          tooltip: "Messages & Communication",
        },
        { section: "Lease", isSection: true },
        {
          href: "/leaseTenant.html",
          icon: "fas fa-file-contract",
          text: "Lease Information",
          page: "leaseTenant",
          tooltip: "Lease Agreement & Details",
        },
        { section: "Payments", isSection: true },
        {
          href: "/paymentTenant.html",
          icon: "fas fa-credit-card",
          text: "Payments",
          page: "paymentTenant",
          tooltip: "Rent & Payment History",
        },
        { section: "Requests", isSection: true },
        {
          href: "/maintenanceTenant.html",
          icon: "fas fa-tools",
          text: "Maintenance",
          page: "maintenanceTenant",
          tooltip: "Maintenance Requests",
        },
      ];
    }
    sidebarNav.innerHTML = links
      .map((link) => {
        if (link.isSection) {
          return `<div class="nav-section"><div class="nav-section-title">${link.section}</div></div>`;
        }
        return `
                <div class="nav-item">
                    <a href="${link.href}" class="nav-link" data-tooltip="${
          link.tooltip || link.text
        }" data-page="${link.page}" title="${link.tooltip || link.text}">
                        <div class="nav-icon"><i class="${link.icon}"></i></div>
                        <span class="nav-text">${link.text}</span>
                    </a>
                </div>
            `;
      })
      .join("");
  }

  //#region TENANT NAVIGATION MANAGER

  class TenantNavigationManager {
    constructor(config = {}) {
      this.config = {
        sidebarSelector: "#sidebar",
        toggleSelector: "#sidebarToggle",
        overlaySelector: "#overlay",
        topNavbarSelector: ".top-navbar",
        mainContentSelector: ".main-content",
        pageTitleSelector: "#pageTitle",
        searchInputSelector: "#searchInput",
        storageKey: "tenantSidebarCollapsed",
        startCollapsed: true,
        ...config,
      };

      this.isMobile = window.innerWidth <= 768;
      this.inboxMessages = this.getDefaultInboxMessages();
      this.isCollapsed = this.getInitialCollapsedState();
      this.init();
    }

    getInitialCollapsedState() {
      try {
        const saved = localStorage.getItem(this.config.storageKey);
        if (saved !== null && !this.isMobile) {
          return saved === "true";
        }
      } catch (e) {}
      return this.config.startCollapsed !== false;
    }
    init() {
      this.cacheDOMElements();
      this.setupPageTitles();
      this.applyInitialCollapsedState();
      this.bindEvents();
      this.updateLayout();
      this.setActiveNavItem();
      this.populateInbox();
      this.addKeyboardShortcuts();
    }
    applyInitialCollapsedState() {
      if (!this.isMobile && this.isCollapsed && this.sidebar) {
        this.sidebar.classList.add("collapsed");
        this.updateToggleIcon();
        this.updateContentLayout();
      }
    }
    cacheDOMElements() {
      this.sidebar = document.querySelector(this.config.sidebarSelector);
      this.sidebarToggle = document.querySelector(this.config.toggleSelector);
      this.overlay = document.querySelector(this.config.overlaySelector);
      this.topNavbar = document.querySelector(this.config.topNavbarSelector);
      this.mainContent = document.querySelector(
        this.config.mainContentSelector
      );
      this.pageTitle = document.querySelector(this.config.pageTitleSelector);
      this.pageIcon = document.getElementById("pageIcon");
      this.pageDescription = document.getElementById("pageDescription");
      this.searchInput = document.querySelector(
        this.config.searchInputSelector
      );
      this.notificationBtn = document.getElementById("notificationBtn");
      this.notificationMenu = document.getElementById("notificationMenu");
      this.inboxBtn = document.getElementById("inboxBtn");
      this.inboxDropdown = document.getElementById("inboxDropdown");
      this.profileBtn = document.getElementById("profileBtn");
      this.profileMenu = document.getElementById("profileMenu");
    }
    setupPageTitles() {
      this.pageTitles = {
        "tenantDashboard.html": "Dashboard",
        tenantDashboard: "Dashboard",
        "leaseTenant.html": "Lease Information",
        leaseTenant: "Lease Information",
        "paymentTenant.html": "Payments",
        paymentTenant: "Payments",
        "maintenanceTenant.html": "Maintenance Requests",
        maintenanceTenant: "Maintenance Requests",
        "messages.html": "Messages",
        messages: "Messages",
        dashboard: "Dashboard",
        leaseTenant: "Lease Information",
        paymentTenant: "Payments",
        maintenanceTenant: "Maintenance Requests",
        messages: "Messages",
        support: "Support",
        index: "Dashboard",
        "": "Dashboard",
        "account-profile.html": "Account Settings",
        "account-profile": "Account Settings",
        accountProfile: "Account Settings",
      };
      this.pageIcons = {
        "tenantDashboard.html": "fas fa-chart-line",
        tenantDashboard: "fas fa-chart-line",
        "leaseTenant.html": "fas fa-file-contract",
        leaseTenant: "fas fa-file-contract",
        "paymentTenant.html": "fas fa-credit-card",
        paymentTenant: "fas fa-credit-card",
        "maintenanceTenant.html": "fas fa-tools",
        maintenanceTenant: "fas fa-tools",
        "messages.html": "fas fa-envelope",
        messages: "fas fa-envelope",
        dashboard: "fas fa-chart-line",
        leaseTenant: "fas fa-file-contract",
        paymentTenant: "fas fa-credit-card",
        maintenanceTenant: "fas fa-tools",
        messages: "fas fa-envelope",
        support: "fas fa-question-circle",
        index: "fas fa-chart-line",
        "": "fas fa-chart-line",
        "account-profile.html": "fas fa-user-cog",
        "account-profile": "fas fa-user-cog",
        accountProfile: "fas fa-user-cog",
      };
      this.pageDescriptions = {
        "tenantDashboard.html":
          "Overview of your rental activity, important notifications, and quick access to key features",
        tenantDashboard:
          "Overview of your rental activity, important notifications, and quick access to key features",
        "leaseTenant.html":
          "View your lease agreement details, terms, and important rental information",
        leaseTenant:
          "View your lease agreement details, terms, and important rental information",
        "paymentTenant.html":
          "Manage your rent payments, view payment history, and set up automatic payments",
        paymentTenant:
          "Manage your rent payments, view payment history, and set up automatic payments",
        "maintenanceTenant.html":
          "Submit maintenance requests and track the status of your service tickets",
        maintenanceTenant:
          "Submit maintenance requests and track the status of your service tickets",
        "messages.html":
          "Communicate with property management and stay updated on important announcements",
        messages:
          "Communicate with property management and stay updated on important announcements",
        dashboard:
          "Overview of your rental activity, important notifications, and quick access to key features",
        leaseTenant:
          "View your lease agreement details, terms, and important rental information",
        paymentTenant:
          "Manage your rent payments, view payment history, and set up automatic payments",
        maintenanceTenant:
          "Submit maintenance requests and track the status of your service tickets",
        messages:
          "Communicate with property management and stay updated on important announcements",
        support:
          "Get help and support for any questions or issues you may have",
        index:
          "Overview of your rental activity, important notifications, and quick access to key features",
        "": "Overview of your rental activity, important notifications, and quick access to key features",
        "account-profile.html":
          "Manage your account settings, personal information, and preferences",
        "account-profile":
          "Manage your account settings, personal information, and preferences",
        accountProfile:
          "Manage your account settings, personal information, and preferences",
      };
    }
    getDefaultInboxMessages() {
      return [
        {
          id: 1,
          sender: "Property Manager",
          subject: "Monthly Rent Reminder",
          preview:
            "Your rent payment for this month is due on the 30th. Please ensure timely payment to avoid late fees and maintain your good standing with the property.",
          time: "2 hours ago",
          unread: true,
          priority: "high",
        },
        {
          id: 2,
          sender: "Maintenance Team",
          subject: "Work Order #2024-0156 Completed",
          preview:
            "The plumbing issue in your apartment has been successfully resolved. Our certified technician completed the work and performed quality checks to ensure everything is functioning properly.",
          time: "1 day ago",
          unread: true,
          priority: "medium",
        },
        {
          id: 3,
          sender: "Ambulo Properties",
          subject: "Lease Renewal Opportunity",
          preview:
            "Your lease agreement is set to expire in 60 days. We would like to discuss renewal options and updated terms. Please contact us at your earliest convenience.",
          time: "3 days ago",
          unread: false,
          priority: "medium",
        },
        {
          id: 4,
          sender: "Community Manager",
          subject: "Exciting Building Amenity Updates",
          preview:
            "We're excited to announce new premium amenities coming to your building including a state-of-the-art fitness center, rooftop garden, and co-working spaces.",
          time: "1 week ago",
          unread: false,
          priority: "low",
        },
        {
          id: 5,
          sender: "Security Office",
          subject: "Package Delivery Notification",
          preview:
            "A package has been delivered to your unit and is currently being held at the front desk. Please bring a valid ID to collect your delivery during office hours.",
          time: "2 weeks ago",
          unread: false,
          priority: "medium",
        },
      ];
    }
    saveCollapsedState() {
      try {
        if (!this.isMobile) {
          localStorage.setItem(
            this.config.storageKey,
            this.isCollapsed.toString()
          );
        }
      } catch (e) {
        console.warn(
          "localStorage not available, sidebar state will not persist"
        );
      }
    }
    loadCollapsedState() {
      try {
        const saved = localStorage.getItem(this.config.storageKey);
        if (saved !== null && !this.isMobile) {
          this.isCollapsed = saved === "true";
          if (this.isCollapsed && this.sidebar) {
            this.sidebar.classList.add("collapsed");
            this.updateToggleIcon();
            this.updateContentLayout();
          }
        }
      } catch (e) {
        console.warn("Could not load sidebar state from localStorage");
      }
    }
    updateToggleIcon() {
      if (!this.sidebarToggle) return;
      const icon = this.sidebarToggle.querySelector("i");
      if (!icon) return;
      if (this.isMobile) {
        if (this.sidebar.classList.contains("mobile-open")) {
          icon.className = "fas fa-times";
          this.sidebarToggle.title = "Close Menu";
        } else {
          icon.className = "fas fa-bars";
          this.sidebarToggle.title = "Open Sidebar";
        }
      } else {
        if (this.isCollapsed) {
          icon.className = "fas fa-chevron-right";
          this.sidebarToggle.title = "Expand Sidebar";
        } else {
          icon.className = "fas fa-chevron-left";
          this.sidebarToggle.title = "Collapse Sidebar";
        }
      }
    }
    updateContentLayout() {
      if (!this.isMobile) {
        if (this.topNavbar) {
          this.topNavbar.style.left = this.isCollapsed ? "80px" : "280px";
        }
        if (this.mainContent) {
          this.mainContent.style.marginLeft = this.isCollapsed
            ? "80px"
            : "280px";
          this.mainContent.classList.toggle(
            "sidebar-collapsed",
            this.isCollapsed
          );
        }
      }
    }
    updateLayout() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) {
        if (this.sidebar) {
          this.sidebar.classList.remove("collapsed");
          this.sidebar.classList.remove("mobile-open");
        }
        if (this.overlay) {
          this.overlay.classList.remove("active");
        }
        if (this.topNavbar) {
          this.topNavbar.style.left = "0";
        }
        if (this.mainContent) {
          this.mainContent.style.marginLeft = "0";
          this.mainContent.classList.remove("sidebar-collapsed");
        }
      } else {
        if (this.sidebar) {
          this.sidebar.classList.remove("mobile-open");
        }
        if (this.overlay) {
          this.overlay.classList.remove("active");
        }
        if (this.isCollapsed && this.sidebar) {
          this.sidebar.classList.add("collapsed");
        }
        this.updateContentLayout();
      }
      this.updateToggleIcon();
    }
    toggleSidebar(e) {
      if (e) e.stopPropagation();
      if (this.isMobile) {
        if (this.sidebar) {
          this.sidebar.classList.toggle("mobile-open");
        }
        if (this.overlay) {
          this.overlay.classList.toggle("active");
        }
      } else {
        this.isCollapsed = !this.isCollapsed;
        if (this.sidebar) {
          this.sidebar.classList.toggle("collapsed", this.isCollapsed);
        }
        this.updateContentLayout();
        this.saveCollapsedState();
      }
      this.updateToggleIcon();
      this.addToggleEffect();
    }

    addToggleEffect() {
      if (this.sidebarToggle) {
        this.sidebarToggle.classList.add("hover-effect");
        setTimeout(() => {
          this.sidebarToggle.classList.remove("hover-effect");
        }, 300);
      }
    }

    closeMobileSidebar() {
      if (this.isMobile) {
        if (this.sidebar) {
          this.sidebar.classList.remove("mobile-open");
        }
        if (this.overlay) {
          this.overlay.classList.remove("active");
        }
        this.updateToggleIcon();
      }
    }

    updatePageTitle(page) {
      if (this.pageTitle && this.pageTitles[page]) {
        this.pageTitle.textContent = this.pageTitles[page];
        document.title = this.pageTitles[page] + " | Ambulo PMS";
      }
      if (this.pageIcon && this.pageIcons[page]) {
        this.pageIcon.className = `page-icon ${this.pageIcons[page]}`;
      }
      if (this.pageDescription && this.pageDescriptions[page]) {
        this.pageDescription.textContent = this.pageDescriptions[page];
      }
    }
    setActiveNavItem(targetPage = null) {
      let currentPage = targetPage;
      if (!currentPage) {
        currentPage = window.location.pathname.split("/").pop();
        if (currentPage.includes(".")) {
          currentPage = currentPage.split(".")[0];
        }
        if (!currentPage || currentPage === "index") {
          currentPage = "dashboard";
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
          (currentPage === "tenantDashboard" && linkPage === "dashboard") ||
          (currentPage === "index" && linkPage === "dashboard") ||
          (currentPage === "dashboard" &&
            (linkPage === "dashboard" || linkFileName === "tenantDashboard"))
        ) {
          link.classList.add("active");
          const pageKey = linkPage || linkFileName || currentPage;
          this.updatePageTitle(pageKey);
        }
      });

      const activeLink = document.querySelector(".nav-link.active");
      if (!activeLink) {
        this.updatePageTitle(currentPage);
      }
    }
    populateInbox() {
      const inboxContent = document.getElementById("inboxContent");
      const inboxBadge = document.getElementById("inboxBadge");
      const messagesBadge = document.getElementById("messagesBadge");
      if (!inboxContent) return;
      const unreadCount = this.inboxMessages.filter((msg) => msg.unread).length;
      if (inboxBadge) {
        if (unreadCount > 0) {
          inboxBadge.textContent = `${unreadCount} New`;
          if (messagesBadge) {
            messagesBadge.textContent = unreadCount;
            messagesBadge.style.display = "flex";
          }
        } else {
          inboxBadge.textContent = "All Read";
          if (messagesBadge) {
            messagesBadge.style.display = "none";
          }
        }
      }
      if (this.inboxMessages.length === 0) {
        inboxContent.innerHTML = ` <div class="empty-inbox"><div class="empty-inbox-icon">📭</div><div class="empty-inbox-text">No messages yet</div><div class="empty-inbox-subtext">You're all caught up!</div></div> `;
      } else {
        inboxContent.innerHTML = this.inboxMessages
          .map(
            (message) =>
              ` <div class="inbox-item ${
                message.unread ? "unread" : ""
              }" onclick="window.tenantNavigationManager.openMessage(${
                message.id
              })"> <div class="inbox-item-header"> <div class="inbox-sender-section"> <span class="inbox-sender">${
                message.sender
              }</span> ${
                message.priority
                  ? `<div class="inbox-priority ${message.priority}"></div>`
                  : ""
              } </div> <span class="inbox-time">${
                message.time
              }</span> </div> <div class="inbox-subject">${
                message.subject
              }</div> <div class="inbox-preview">${
                message.preview
              }</div> </div> `
          )
          .join("");
      }
    }
    openMessage(messageId) {
      const message = this.inboxMessages.find((msg) => msg.id === messageId);
      if (message && message.unread) {
        message.unread = false;
        this.populateInbox();
      }
    }
    toggleDropdown(menu, button) {
      if (!menu) return;
      document
        .querySelectorAll(".dropdown-menu, .inbox-dropdown-menu")
        .forEach((dropdown) => {
          if (dropdown !== menu) {
            dropdown.classList.remove("show", "active");
          }
        });
      if (menu.classList.contains("inbox-dropdown-menu")) {
        menu.classList.toggle("active");
      } else {
        menu.classList.toggle("show");
      }
    }
    closeAllDropdowns() {
      document
        .querySelectorAll(".dropdown-menu, .inbox-dropdown-menu")
        .forEach((dropdown) => {
          dropdown.classList.remove("show", "active");
        });
    }
    logout() {
      this.closeAllDropdowns();
      if (confirm("Are you sure you want to sign out?")) {
        localStorage.clear();
        sessionStorage.clear();
        fetch("/api/v1/users/logout", {
          method: "POST",
          credentials: "include",
        }).finally(() => {
          window.location.href = "/login.html";
        });
      }
    }
    bindEvents() {
      if (this.sidebarToggle) {
        this.sidebarToggle.addEventListener("click", (e) =>
          this.toggleSidebar(e)
        );
      }
      if (this.overlay) {
        this.overlay.addEventListener("click", () => this.closeMobileSidebar());
      }
      if (this.notificationBtn && this.notificationMenu) {
        this.notificationBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleDropdown(this.notificationMenu, this.notificationBtn);
        });
      }
      if (this.inboxBtn && this.inboxDropdown) {
        this.inboxBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleDropdown(this.inboxDropdown, this.inboxBtn);
        });
      }
      if (this.profileBtn && this.profileMenu) {
        this.profileBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleDropdown(this.profileMenu, this.profileBtn);
        });
      }
      document.addEventListener("click", (e) => {
        if (
          !e.target.closest(".dropdown") &&
          !e.target.closest(".inbox-dropdown")
        ) {
          this.closeAllDropdowns();
        }
      });
      document
        .querySelectorAll(".dropdown-menu, .inbox-dropdown-menu")
        .forEach((menu) => {
          menu.addEventListener("click", (e) => e.stopPropagation());
        });
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
          if (link.getAttribute("href") === "#") {
            e.preventDefault();
          }
          document
            .querySelectorAll(".nav-link")
            .forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
          const page =
            link.dataset.page ||
            link.getAttribute("href").split("/").pop().split(".")[0];
          this.updatePageTitle(page);
          this.closeMobileSidebar();
        });
      });
      window.addEventListener("popstate", () => this.setActiveNavItem());
      window.addEventListener("resize", () => this.updateLayout());
      setTimeout(() => {
        document
          .querySelectorAll("#notificationMenu .dropdown-item")
          .forEach((item) => {
            item.addEventListener("click", () => {
              const titleElement = item.querySelector(".dropdown-item-title");
              if (titleElement) {
              }
              item.style.opacity = "0.7";
              const badge = document.getElementById("notificationBadge");
              if (badge) {
                let count = parseInt(badge.textContent);
                if (count > 0) {
                  count--;
                  badge.textContent = count;
                  if (count === 0) {
                    badge.style.display = "none";
                    const subtitle = document.querySelector(
                      "#notificationMenu .dropdown-subtitle"
                    );
                    if (subtitle) {
                      subtitle.textContent = "No unread notifications";
                    }
                  }
                }
              }
            });
          });
      }, 100);
    }
    addKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "b") {
          e.preventDefault();
          this.toggleSidebar();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          if (this.searchInput) this.searchInput.focus();
        }
        if (e.key === "Escape") {
          this.closeAllDropdowns();
        }
      });
    }
    static async loadComponent(componentPath, containerId) {
      try {
        const response = await fetch(componentPath);
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = html;
          return true;
        }
        return false;
      } catch (error) {
        console.error(
          `Error loading tenant component from ${componentPath}:`,
          error
        );
        return false;
      }
    }
    static async initializeTenantNavigation(config = {}) {
      const sidebarLoaded = await TenantNavigationManager.loadComponent(
        "/components/sidebar.html",
        "sidebarContainer"
      );
      const navbarLoaded = await TenantNavigationManager.loadComponent(
        "/components/top-navbar.html",
        "navbarContainer"
      );
      if (sidebarLoaded || navbarLoaded) {
        setTimeout(async () => {
          window.tenantNavigationManager = new TenantNavigationManager(config);
          await setupTenantNavbar();
          setupSidebarTenant("tenant");
          window.tenantNavigationManager.setActiveNavItem();
          const mobileSidebarOpenBtn = document.getElementById(
            "mobileSidebarOpenBtn"
          );
          const sidebar = document.getElementById("sidebar");
          const overlay = document.getElementById("overlay");
          if (mobileSidebarOpenBtn && sidebar && overlay) {
            mobileSidebarOpenBtn.addEventListener("click", function () {
              sidebar.classList.add("mobile-open");
              overlay.classList.add("active");
            });
          }
        }, 10);
      } else {
        window.tenantNavigationManager = new TenantNavigationManager(config);
      }
    }
    updateNavigation(updates) {
      if (updates.currentPage) {
        this.setActiveNavItem(updates.currentPage);
      }
      if (updates.pageTitle) {
        this.updatePageTitle(updates.pageTitle);
      }
      if (updates.messages) {
        this.inboxMessages = updates.messages;
        this.populateInbox();
      }
    }
    addNavItem(item) {
      const navContainer = document.querySelector(".sidebar-nav");
      if (!navContainer) return;
      const navItem = document.createElement("div");
      navItem.className = "nav-item";
      navItem.innerHTML = ` <a href="${
        item.href || "#"
      }" class="nav-link" data-tooltip="${
        item.tooltip || item.text
      }" data-page="${item.page || ""}" title="${
        item.tooltip || item.text
      }"> <div class="nav-icon"><i class="${
        item.icon || "fas fa-circle"
      }"></i></div> <span class="nav-text">${item.text}</span> </a> `;
      if (item.section) {
        const section = navContainer.querySelector(
          `[data-section="${item.section}"]`
        );
        if (section) {
          section.parentNode.insertBefore(navItem, section.nextSibling);
        } else {
          navContainer.appendChild(navItem);
        }
      } else {
        navContainer.appendChild(navItem);
      }
      const link = navItem.querySelector(".nav-link");
      link.addEventListener("click", (e) => {
        if (link.getAttribute("href") === "#") {
          e.preventDefault();
        }
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        const page =
          link.dataset.page ||
          link.getAttribute("href").split("/").pop().split(".")[0];
        this.updatePageTitle(page);
        this.closeMobileSidebar();
      });
    }
    getNavigationState() {
      return {
        isCollapsed: this.isCollapsed,
        isMobile: this.isMobile,
        currentPage: this.getCurrentPage(),
        unreadMessages: this.inboxMessages.filter((msg) => msg.unread).length,
      };
    }
    getCurrentPage() {
      const activeLink = document.querySelector(".nav-link.active");
      return activeLink ? activeLink.dataset.page : null;
    }
    destroy() {
      if (this.sidebarToggle) {
        this.sidebarToggle.removeEventListener("click", this.toggleSidebar);
      }
      window.removeEventListener("resize", this.updateLayout);
      window.removeEventListener("popstate", this.setActiveNavItem);
      Object.keys(this).forEach((key) => {
        if (this[key] instanceof HTMLElement) {
          this[key] = null;
        }
      });
    }
  }

  if (typeof window.NavigationManager === "undefined")
    window.NavigationManager = NavigationManager;
  if (typeof window.TenantNavigationManager === "undefined")
    window.TenantNavigationManager = TenantNavigationManager;

  window.openMessage = (messageId) => {
    if (window.navigationManager) {
      window.navigationManager.openMessage(messageId);
    } else if (window.tenantNavigationManager) {
      window.tenantNavigationManager.openMessage(messageId);
    }
  };

  window.openProfileSettings = () => {
    if (window.navigationManager)
      window.navigationManager.openProfileSettings();
    else if (window.tenantNavigationManager)
      window.tenantNavigationManager.openProfileSettings();
  };

  window.openAccountSettings = () => {
    if (window.navigationManager)
      window.navigationManager.openAccountSettings();
    else if (window.tenantNavigationManager)
      window.tenantNavigationManager.openAccountSettings();
  };

  window.openPreferences = () => {
    if (window.navigationManager) window.navigationManager.openPreferences();
    else if (window.tenantNavigationManager)
      window.tenantNavigationManager.openPreferences();
  };

  window.openHelp = () => {
    if (window.navigationManager) window.navigationManager.openHelp();
    else if (window.tenantNavigationManager)
      window.tenantNavigationManager.openHelp();
  };

  window.logout = () => {
    if (window.navigationManager) window.navigationManager.logout();
    else if (window.tenantNavigationManager)
      window.tenantNavigationManager.logout();
  };

  window.setActivePageManually = function (pageName) {
    if (window.tenantNavigationManager)
      window.tenantNavigationManager.setActiveNavItem(pageName);
    else if (window.navigationManager)
      window.navigationManager.setActiveNavItem(pageName);
  };
})();

//#endregion
