import fetchCompanyDetails from "../utils/loadCompanyInfo.js";

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

// FAQ Accordion
document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const faqItem = question.parentElement;
    const isActive = faqItem.classList.contains("active");

    // Close all other FAQ items
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Toggle current item
    if (!isActive) {
      faqItem.classList.add("active");
    }
  });
});

// Form submission
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const originalText = submitBtn.textContent;

  // Get form data
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
    // Success message
    alert(
      `Thank you, ${firstName}! Your inquiry has been received. We'll contact you within 24 hours regarding your commercial space requirements.`
    );

    // Reset form
    this.reset();

    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Show additional success message based on business type
    if (businessType) {
      setTimeout(() => {
        alert(
          `We've noted your interest in ${businessType} space. Our leasing specialist will prepare relevant options for you.`
        );
      }, 1000);
    }
  }, 2000);
});

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

// Form field animations
document.querySelectorAll("input, textarea, select").forEach((field) => {
  field.addEventListener("focus", function () {
    this.parentElement.style.transform = "scale(1.02)";
  });

  field.addEventListener("blur", function () {
    this.parentElement.style.transform = "scale(1)";
  });
});

// Contact item hover effects
document.querySelectorAll(".contact-item").forEach((item) => {
  item.addEventListener("mouseenter", function () {
    this.style.background = "rgba(255, 255, 255, 0.1)";
  });

  item.addEventListener("mouseleave", function () {
    this.style.background = "rgba(255, 255, 255, 0.05)";
  });
});

// Auto-expand message textarea
const messageTextarea = document.getElementById("message");
messageTextarea.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});



// Add float animation keyframes
const style = document.createElement("style");
style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
        `;
document.head.appendChild(style);

// Enhanced form validation with real-time feedback
const inputs = document.querySelectorAll("input, textarea, select");
inputs.forEach((input) => {
  input.addEventListener("blur", function () {
    validateField(this);
  });
});

function validateField(field) {
  const value = field.value.trim();
  const isRequired = field.hasAttribute("required");

  // Remove existing validation classes
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

// Add validation styles
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
  const data = await fetchCompanyDetails();
  if (!data || !data[0]) return;
  const company = data[0];

  // Phone Number (with alt phone)
  const phoneBoxes = document.querySelectorAll(
    ".contact-item-box .contact-item-content h4"
  );
  phoneBoxes.forEach((h4) => {
    if (h4.textContent.includes("Phone Number")) {
      const icon = h4.parentElement.parentElement.querySelector(".contact-icon");
      if (icon) icon.innerHTML = `<i class="fa-solid fa-phone"></i>`;
      const pList = h4.parentElement.querySelectorAll("p");
      // Main phone
      if (pList[0]) {
        let phoneText = company.phone_number || "";
        if (company.alt_phone_number) {
          phoneText += ` <span style="color:#888;font-size:0.95em;">| ${company.alt_phone_number}</span>`;
        }
        pList[0].innerHTML = phoneText;
      }
      // Availability
      if (pList[1]) {
        pList[1].innerHTML = `<span>Available during business hours</span>`;
      }
      // Improve header separation
      h4.style.marginBottom = "0.25em";
      if (pList[0]) pList[0].style.marginTop = "0.25em";
      if (pList[1]) pList[1].style.marginTop = "0.1em";
    }
  });

  // Email Address
  phoneBoxes.forEach((h4) => {
    if (h4.textContent.includes("Email Address")) {
      const icon = h4.parentElement.parentElement.querySelector(".contact-icon");
      if (icon) icon.innerHTML = `<i class="fa-solid fa-envelope"></i>`;
      const pList = h4.parentElement.querySelectorAll("p");
      if (pList[0]) pList[0].innerHTML = `<strong>${company.email || ""}</strong>`;
      if (pList[1]) pList[1].innerHTML = `<span;">We respond within 24 hours</span>`;
      h4.style.marginBottom = "0.25em";
      if (pList[0]) pList[0].style.marginTop = "0.25em";
      if (pList[1]) pList[1].style.marginTop = "0.1em";
    }
  });

  // Office Location
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

  // Business Hours
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

  // Dynamic tab logo (favicon)
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  // Dynamic tab title
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
