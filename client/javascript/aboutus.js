import fetchCompanyDetails from "../api/loadCompanyInfo.js";
import fetchAboutUsDetails from "../api/loadAboutUs.js";

async function fetchAboutUsData() {
  return await fetchAboutUsDetails();
}

async function setDynamicCompanyInfo() {
  const company = await fetchCompanyDetails();
  if (!company) return;

  const heroTitle = document.querySelector(".hero-content h1 .dynamic-company-name");
  if (heroTitle) {
    heroTitle.textContent = company.company_name || "Ambulo Properties";
  }

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  document.title = company.company_name
    ? `About ${company.company_name}`
    : "About";
}

async function populateAboutUsPage() {
  const about = await fetchAboutUsData();
  if (!about) return;

  const storyTitle = document.querySelector(".story-section-title");
  if (storyTitle) {
    storyTitle.textContent = about.story_section_title || "Our Story";
  }

  const storyContent = document.querySelector(".story-section-content");
  if (storyContent) {
    storyContent.innerHTML = about.story_content || "";
  }

  const missionCard = document.getElementById("mission-card");
  if (missionCard) {
    missionCard.querySelector("h3").textContent = "Our Mission";
    missionCard.querySelector("p").innerHTML = about.mission || "";
  }
  const visionCard = document.getElementById("vision-card");
  if (visionCard) {
    visionCard.querySelector("h3").textContent = "Our Vision";
    visionCard.querySelector("p").innerHTML = about.vision || "";
  }
  const valuesCard = document.getElementById("values-card");
  if (valuesCard) {
    valuesCard.querySelector("h3").textContent = "Our Values";
    valuesCard.querySelector("p").innerHTML = about.core_values || "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setDynamicCompanyInfo();
  populateAboutUsPage();

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

  document.querySelectorAll(".reveal-element").forEach((el) => {
    observer.observe(el);
  });

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

  function animateCounters() {
    const counters = document.querySelectorAll(".stat-number");
    const speed = 200;

    counters.forEach((counter) => {
      const updateCount = () => {
        const target = counter.innerText.replace("%", "").replace("+", "");
        const count = +counter.getAttribute("data-count") || 0;
        const inc = Math.ceil(target / speed);

        if (count < target) {
          counter.setAttribute("data-count", count + inc);
          counter.innerText = count + inc;
          if (counter.innerText.includes("%")) counter.innerText += "%";
          if (counter.innerText.includes("+")) counter.innerText += "+";
          setTimeout(updateCount, 1);
        } else {
          counter.innerText = target;
          if (target == 100) counter.innerText += "%";
          if (target == 50) counter.innerText += "+";
        }
      };
      updateCount();
    });
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  });

  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll(
      ".hero::before, .stats-section::before"
    );

    parallaxElements.forEach((element) => {
      const speed = 0.5;
      element.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
});