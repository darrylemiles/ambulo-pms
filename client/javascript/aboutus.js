



async function fetchAboutUsData() {
  try {
    const res = await fetch("/api/v1/about-us");
    const result = await res.json();
    return result.data && result.data[0] ? result.data[0] : null;
  } catch (err) {
    console.error("Failed to fetch About Us data:", err);
    return null;
  }
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

//   const storyImage = document.querySelector(".story-image img");
//   if (storyImage && about.about_img1) {
//     storyImage.src = about.about_img1;
//   }

  // Mission, Vision, Values
  const mvvCards = document.querySelectorAll(".mvv-card");
  if (mvvCards.length >= 3) {
    mvvCards[0].querySelector("h3").textContent = "Our Mission";
    mvvCards[0].querySelector("p").innerHTML = about.mission || "";
    mvvCards[1].querySelector("h3").textContent = "Our Vision";
    mvvCards[1].querySelector("p").innerHTML = about.vision || "";
    mvvCards[2].querySelector("h3").textContent = "Our Values";
    mvvCards[2].querySelector("p").innerHTML = about.core_values || "";
  }
}



document.addEventListener("DOMContentLoaded", () => {
  populateAboutUsPage();

  // ...existing code below...
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