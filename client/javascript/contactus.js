import fetchCompanyDetails from "../utils/loadCompanyInfo.js";
const API_BASE_URL = "/api/v1";

document.addEventListener("DOMContentLoaded", fetchAndRenderContactFAQs);

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

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)";
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
    }
  }
});

document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const faqItem = question.parentElement;
    const isActive = faqItem.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("active");
    });

    if (!isActive) {
      faqItem.classList.add("active");
    }
  });
});

document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const originalText = submitBtn.textContent;

  const formData = new FormData(this);
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const businessType = formData.get("businessType");
  const spaceSize = formData.get("spaceSize");
  const budget = formData.get("budget");
  const message = formData.get("message");

  if (!firstName || !lastName || !email || !message) {
    alert("Please fill in all required fields.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  submitBtn.textContent = "Sending Message...";
  submitBtn.disabled = true;

  setTimeout(() => {
    alert(
      `Thank you, ${firstName}! Your inquiry has been received. We'll contact you within 24 hours regarding your commercial space requirements.`
    );

    this.reset();

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    if (businessType) {
      setTimeout(() => {
        alert(
          `We've noted your interest in ${businessType} space. Our leasing specialist will prepare relevant options for you.`
        );
      }, 1000);
    }
  }, 2000);
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

document.querySelectorAll("input, textarea, select").forEach((field) => {
  field.addEventListener("focus", function () {
    this.parentElement.style.transform = "scale(1.02)";
  });

  field.addEventListener("blur", function () {
    this.parentElement.style.transform = "scale(1)";
  });
});

document.querySelectorAll(".contact-item").forEach((item) => {
  item.addEventListener("mouseenter", function () {
    this.style.background = "rgba(255, 255, 255, 0.1)";
  });

  item.addEventListener("mouseleave", function () {
    this.style.background = "rgba(255, 255, 255, 0.05)";
  });
});

const messageTextarea = document.getElementById("message");
messageTextarea.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});



const style = document.createElement("style");
style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
        `;
document.head.appendChild(style);

const inputs = document.querySelectorAll("input, textarea, select");
inputs.forEach((input) => {
  input.addEventListener("blur", function () {
    validateField(this);
  });
});

function validateField(field) {
  const value = field.value.trim();
  const isRequired = field.hasAttribute("required");

  field.classList.remove("valid", "invalid");

  if (isRequired && !value) {
    field.classList.add("invalid");
    return false;
  }

  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      field.classList.add("invalid");
      return false;
    }
  }

  if (value) {
    field.classList.add("valid");
  }

  return true;
}

const validationStyle = document.createElement("style");
validationStyle.textContent = `
            .form-group input.valid, 
            .form-group textarea.valid, 
            .form-group select.valid {
                border-color: #10b981;
                background: #f0fdf4;
            }
            
            .form-group input.invalid, 
            .form-group textarea.invalid, 
            .form-group select.invalid {
                border-color: #ef4444;
                background: #fef2f2;
            }
        `;
document.head.appendChild(validationStyle);

async function setDynamicContactInfo() {
  const company = await fetchCompanyDetails();
  if (!company) return;

  const phoneBoxes = document.querySelectorAll(
    ".contact-item-box .contact-item-content h4"
  );
  phoneBoxes.forEach((h4) => {
    if (h4.textContent.includes("Phone Number")) {
      const icon = h4.parentElement.parentElement.querySelector(".contact-icon");
      if (icon) icon.innerHTML = `<i class="fa-solid fa-phone"></i>`;
      const pList = h4.parentElement.querySelectorAll("p");
      if (pList[0]) {
        let phoneText = company.phone_number || "";
        if (company.alt_phone_number) {
          phoneText += ` <span style="color:#888;font-size:0.95em;">| ${company.alt_phone_number}</span>`;
        }
        pList[0].innerHTML = phoneText;
      }
      if (pList[1]) {
        pList[1].innerHTML = `<span>Available during business hours</span>`;
      }
      h4.style.marginBottom = "0.25em";
      if (pList[0]) pList[0].style.marginTop = "0.25em";
      if (pList[1]) pList[1].style.marginTop = "0.1em";
    }
  });

  phoneBoxes.forEach((h4) => {
    if (h4.textContent.includes("Email Address")) {
      const icon = h4.parentElement.parentElement.querySelector(".contact-icon");
      if (icon) icon.innerHTML = `<i class="fa-solid fa-envelope"></i>`;
      const pList = h4.parentElement.querySelectorAll("p");
      if (pList[0]) pList[0].innerHTML = `<strong>${company.email || ""}</strong>`;
      if (pList[1]) pList[1].innerHTML = `<span>We respond within 24 hours</span>`;
      h4.style.marginBottom = "0.25em";
      if (pList[0]) pList[0].style.marginTop = "0.25em";
      if (pList[1]) pList[1].style.marginTop = "0.1em";
    }
  });

  phoneBoxes.forEach((h4) => {
    if (h4.textContent.includes("Office Location")) {
      const icon = h4.parentElement.parentElement.querySelector(".contact-icon");
      if (icon) icon.innerHTML = `<i class="fa-solid fa-location-dot"></i>`;
      const pList = h4.parentElement.querySelectorAll("p");
      if (pList[0]) pList[0].innerHTML = `<strong>${company.street_address || ""}</strong>`;
      if (pList[1]) pList[1].innerHTML = `<span>${company.city || ""}, ${company.province || ""}, ${company.country || ""}</span>`;
      h4.style.marginBottom = "0.25em";
      if (pList[0]) pList[0].style.marginTop = "0.25em";
      if (pList[1]) pList[1].style.marginTop = "0.1em";
    }
  });

  phoneBoxes.forEach((h4) => {
    if (h4.textContent.includes("Business Hours")) {
      const icon = h4.parentElement.parentElement.querySelector(".contact-icon");
      if (icon) icon.innerHTML = `<i class="fa-solid fa-clock"></i>`;
      const pList = h4.parentElement.querySelectorAll("p");
      if (company.business_hours) {
        const hours = company.business_hours.split("\n");
        pList.forEach((p, idx) => {
          p.innerHTML = `<span>${hours[idx] || ""}</span>`;
          p.style.marginTop = idx === 0 ? "0.25em" : "0.1em";
        });
      }
      h4.style.marginBottom = "0.25em";
    }
  });

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  document.title = company.company_name
    ? `Contact Us`
    : "Ambulo Properties - Contact Us";

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = company.meta_description || "Contact Ambulo Properties for your commercial space needs.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setDynamicContactInfo();
});


async function fetchAndRenderContactFAQs() {
    try {
        const res = await fetch(`${API_BASE_URL}/faqs/`);
        const data = await res.json();
        const faqs = Array.isArray(data.message) ? data.message : [];

        const faqContainer = document.getElementById("faq-container");
        faqContainer.innerHTML = "";

        faqs
            .filter(faq => String(faq.is_active) === "1")
            .sort((a, b) => a.sort_order - b.sort_order)
            .forEach((faq, idx) => {
                const faqHtml = `
                    <div class="faq-item reveal-element" style="transition-delay: ${0.1 + idx * 0.1}s;">
                        <div class="faq-question">
                            <h4>${escapeHtml(faq.question)}</h4>
                            <span class="faq-icon">▼</span>
                        </div>
                        <div class="faq-answer">
                            <p></br>${escapeHtml(faq.answer)}</p>
                        </div>
                    </div>
                `;
                faqContainer.insertAdjacentHTML("beforeend", faqHtml);
            });

        attachFAQListeners();

    } catch (err) {
        document.getElementById("faq-container").innerHTML =
            "<div style='color: #e53e3e; padding: 16px;'>Unable to load FAQs at this time.</div>";
    }
}

function attachFAQListeners() {
    document.querySelectorAll(".faq-question").forEach((question) => {
        question.addEventListener("click", () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains("active");

            document.querySelectorAll(".faq-item").forEach((item) => {
                item.classList.remove("active");
            });

            if (!isActive) {
                faqItem.classList.add("active");
            }
        });
    });
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

