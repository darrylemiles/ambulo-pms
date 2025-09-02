import fetchCompanyDetails from "../utils/loadCompanyInfo.js";

function setupNavbarFeatures() {
  const navbar =
    document.querySelector("header") || document.getElementById("navbar");

  const revealElements = document.querySelectorAll(".reveal-element");

  const revealOnScroll = () => {
    revealElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("revealed");
      }
    });
  };

  // Sticky navbar
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    revealOnScroll();
  };

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Scroll reveal animation
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      }
    });
  }, observerOptions);

  // Observe all reveal elements
  document.querySelectorAll(".reveal-element").forEach((el) => {
    observer.observe(el);
  });

  // Navbar background on scroll
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)";
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
    }
  });

  // Form submission
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const message = formData.get("message");

    // Simple validation
    if (!name || !email || !message) {
      alert("Please fill in all required fields.");
      return;
    }

    // Simulate form submission
    const button = this.querySelector("button");
    const originalText = button.textContent;
    button.textContent = "Sending...";
    button.disabled = true;

    setTimeout(() => {
      alert("Thank you for your inquiry! We will contact you soon.");
      this.reset();
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  });

  // Add some interactive elements
  document.querySelectorAll(".property-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-15px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Parallax effect for hero section
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector(".hero");
    const speed = scrolled * 0.5;
    parallax.style.transform = `translateY(${speed}px)`;
  });
}

async function setDynamicHomepageContent() {
  const data = await fetchCompanyDetails();
  if (!data || !data[0]) return;
  const company = data[0];

  // Brand name in hero section
  const brandNameEl = document.getElementById("dynamic-company-name");
  if (brandNameEl)
    brandNameEl.textContent = company.company_name || "Ambulo Properties";

  // Contact Info Section
  const emailEl = document.getElementById("dynamic-company-email");
  if (emailEl) emailEl.textContent = company.email || "N/A";

  const phoneEl = document.getElementById("dynamic-company-phone");
  if (phoneEl) phoneEl.textContent = company.phone_number || "N/A";

  const altPhoneEl = document.getElementById("dynamic-company-alt-phone");
  if (altPhoneEl) altPhoneEl.textContent = company.alt_phone_number || "N/A";

  const addressEl = document.getElementById("dynamic-company-address");
  if (addressEl) {
    addressEl.innerHTML = `
            ${company.house_no ? company.house_no + ", " : ""}
            ${company.street_address ? company.street_address + ", " : ""}
            ${company.city ? company.city + ", " : ""}
            ${company.province ? company.province + ", " : ""}
            ${company.zip_code ? company.zip_code + ", " : ""}
            ${company.country || ""}
        `
      .replace(/,\s*,/g, ", ")
      .replace(/,\s*$/, "");
  }

  const hoursEl = document.getElementById("dynamic-company-hours");
  if (hoursEl)
    hoursEl.innerHTML = (company.business_hours || "").replace(/\n/g, "<br>");

  // Dynamic tab logo (favicon)
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  // Dynamic tab title
  document.title = company.company_name
    ? `Welcome to ${company.company_name}`
    : "Ambulo Properties - Homepage";
}

document.addEventListener("DOMContentLoaded", () => {
  setDynamicHomepageContent();
  setupNavbarFeatures();
});
