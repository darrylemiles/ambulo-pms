import fetchCompanyDetails from "../utils/loadCompanyInfo.js";

fetch("/components/sidebar.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("sidebarContainer").innerHTML = html;
  
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const mainContent = document.getElementById("mainContent");
    const overlay = document.getElementById("overlay");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  
    let isCollapsed = false;
    let isMobile = window.innerWidth <= 768;
  
    function updateLayout() {
      isMobile = window.innerWidth <= 768;
      if (isMobile) {
        sidebar?.classList.remove("collapsed");
        mainContent?.classList.remove("sidebar-collapsed");
        mainContent?.classList.add("sidebar-hidden");
      } else {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("active");
        mainContent?.classList.remove("sidebar-hidden");
        if (isCollapsed) {
          sidebar?.classList.add("collapsed");
          mainContent?.classList.add("sidebar-collapsed");
        } else {
          sidebar?.classList.remove("collapsed");
          mainContent?.classList.remove("sidebar-collapsed");
        }
      }
    }
  
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function () {
        if (!isMobile) {
          isCollapsed = !isCollapsed;
          sidebar?.classList.toggle("collapsed");
          mainContent?.classList.toggle("sidebar-collapsed");
          const arrow = sidebarToggle.querySelector("span");
          arrow.textContent = isCollapsed ? "→" : "←";
        }
      });
    }
  
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", function () {
        if (isMobile) {
          sidebar?.classList.toggle("open");
          overlay?.classList.toggle("active");
        }
      });
    }
  
    if (overlay) {
      overlay.addEventListener("click", function () {
        if (isMobile) {
          sidebar?.classList.remove("open");
          overlay?.classList.remove("active");
        }
      });
    }
  
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", function () {
        if (isMobile) {
          sidebar?.classList.remove("open");
          overlay?.classList.remove("active");
        }
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      });
    });
  
    window.addEventListener("resize", updateLayout);
    updateLayout();
  })
  // ...existing code...


document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtnIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener("click", () => {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    window.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
      }
    });
  }

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  document.querySelectorAll(".bar").forEach((bar) => {
    bar.addEventListener("mouseenter", function () {
      this.style.transform = "scaleY(1.1)";
      this.style.background = "linear-gradient(to top, #3b82f6, #3b82f6)";
    });
    bar.addEventListener("mouseleave", function () {
      this.style.transform = "scaleY(1)";
      this.style.background = "linear-gradient(to top, #3b82f6, #60a5fa)";
    });
  });

  setDynamicInfo();
});

async function setDynamicInfo() {
  const company = await fetchCompanyDetails();
  if (!company) return;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  document.title = company.company_name
    ? `${company.company_name} Admin Dashboard`
    : "Ambulo Properties Admin Dashboard";
}