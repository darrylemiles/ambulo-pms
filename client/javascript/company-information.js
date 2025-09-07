// Data storage using in-memory objects
let companyId = null;

// API Configuration
const API_BASE_URL = "/api/v1/company-details";
const ABOUT_API_URL = "/api/v1/about-us";

let websiteData = {
  company: {
    name: "Ambulo Properties",
    tagline: "Commercial Real Estate Excellence",
    founded: 2018,
    logo: null,
  },
  about: {
    story: {
      title: "Our Story",
    },
    mvv: {
      mission:
        "To empower local entrepreneurs and businesses by providing premium commercial spaces that foster growth, innovation, and community connection in Silang, Cavite.",
      vision:
        "To be the premier commercial real estate destination in Cavite, known for our commitment to tenant success, community development, and innovative property management solutions.",
      values:
        "Integrity, Innovation, Community Focus, and Tenant Success. We believe in building lasting relationships and creating value for all stakeholders in our commercial ecosystem.",
    },
  },
  services: {
    title: "Our Services",
    description:
      "Comprehensive commercial real estate solutions tailored to your business needs",
    items: [
      {
        id: 1,
        title: "Commercial Leasing",
        description:
          "Premium commercial spaces designed to accommodate various business types with flexible lease terms and competitive rates.",
      },
      {
        id: 2,
        title: "Property Management",
        description:
          "Full-service property management ensuring optimal operations, maintenance, and tenant satisfaction.",
      },
      {
        id: 3,
        title: "Business Consultation",
        description:
          "Expert guidance to help businesses choose the right commercial space and optimize their operations for success.",
      },
      {
        id: 4,
        title: "Space Customization",
        description:
          "Tailored space modifications and improvements to meet specific business requirements and brand aesthetics.",
      },
      {
        id: 5,
        title: "Community Building",
        description:
          "Fostering a collaborative business environment that encourages networking and mutual growth among tenants.",
      },
      {
        id: 6,
        title: "Digital Solutions",
        description:
          "Modern technology solutions to streamline operations and enhance the commercial leasing experience.",
      },
    ],
  },
  advantages: {
    title: "Why Choose Ambulo Properties",
    description:
      "Discover the competitive advantages that make us Silang's preferred commercial real estate partner",
    items: [
      {
        id: 1,
        title: "Prime Strategic Location",
        description:
          "Situated on Kapt. Sayas Street in the heart of Silang, offering high visibility, excellent foot traffic, and easy accessibility for customers and clients.",
        icon: "fas fa-map-marker-alt",
      },
      {
        id: 2,
        title: "Proven Track Record",
        description:
          "Five years of successful property management with 100% occupancy rate, demonstrating our commitment to tenant satisfaction and business success.",
        icon: "fas fa-chart-line",
      },
      {
        id: 3,
        title: "Premium Facilities",
        description:
          "Modern, well-maintained commercial spaces with professional amenities, reliable utilities, and contemporary design that enhances your business image.",
        icon: "fas fa-building",
      },
      {
        id: 4,
        title: "Security & Safety",
        description:
          "Comprehensive security measures, safe environment, and 24/7 monitoring to ensure the protection of your business and customers.",
        icon: "fas fa-shield-alt",
      },
      {
        id: 5,
        title: "Competitive Pricing",
        description:
          "Flexible lease terms with competitive rates that provide excellent value for money, helping your business maintain healthy profit margins.",
        icon: "fas fa-dollar-sign",
      },
      {
        id: 6,
        title: "Exceptional Service",
        description:
          "Dedicated property management team providing responsive support, proactive maintenance, and personalized attention to each tenant's needs.",
        icon: "fas fa-concierge-bell",
      },
      {
        id: 7,
        title: "Business Growth Support",
        description:
          "We're invested in your success, offering consultation, networking opportunities, and resources to help your business thrive and expand.",
        icon: "fas fa-rocket",
      },
    ],
  },
};

const availableIcons = [
  "fas fa-map-marker-alt",
  "fas fa-chart-line",
  "fas fa-building",
  "fas fa-shield-alt",
  "fas fa-dollar-sign",
  "fas fa-concierge-bell",
  "fas fa-rocket",
  "fas fa-star",
  "fas fa-trophy",
  "fas fa-handshake",
  "fas fa-users",
  "fas fa-tools",
  "fas fa-lightbulb",
  "fas fa-heart",
  "fas fa-medal",
  "fas fa-crown",
  "fas fa-gem",
  "fas fa-thumbs-up",
  "fas fa-check-circle",
  "fas fa-award",
];

let currentEditingServiceId = null;
let currentEditingAdvantageId = null;
let selectedIcon = "";
let hasUnsavedChanges = false;

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadCompanyInfo().then(() => {
    setupRealtimeValidation();
  });
  loadFormData();
  setupEventListeners();
  setupLogoHandling();
  setupAltLogoHandling();
  setupRealtimeValidation();
  renderServices();
  renderAdvantages();
  console.log("CMS initialized successfully");
});

function setupEventListeners() {
  // Tab functionality
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.tab);
    });
  });

  // Form inputs change tracking
  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      hasUnsavedChanges = true;
      showAutoSave();
    });
  });

  // Service form submission
  document
    .getElementById("service-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      updateService();
    });

  // Advantage form submission
  document
    .getElementById("advantage-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      updateAdvantage();
    });

  // Close modals when clicking outside
  document
    .getElementById("service-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeServiceModal();
      }
    });

  document
    .getElementById("advantage-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeAdvantageModal();
      }
    });

  document
    .getElementById("preview-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closePreviewModal();
      }
    });

  // Warn before leaving if there are unsaved changes
  window.addEventListener("beforeunload", function (e) {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "";
      return "You have unsaved changes. Are you sure you want to leave?";
    }
  });
}

function setupLogoHandling() {
  const logoInput = document.getElementById("logo-input");
  const logoPreview = document.getElementById("logo-preview");

  // File input change event
  logoInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      handleLogoFile(file);
    }
  });

  // Drag and drop functionality
  logoPreview.addEventListener("click", () => {
    if (!logoPreview.classList.contains("has-image")) {
      logoInput.click();
    }
  });

  logoPreview.addEventListener("dragover", (e) => {
    e.preventDefault();
    logoPreview.classList.add("drag-over");
  });

  logoPreview.addEventListener("dragleave", () => {
    logoPreview.classList.remove("drag-over");
  });

  logoPreview.addEventListener("drop", (e) => {
    e.preventDefault();
    logoPreview.classList.remove("drag-over");

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleLogoFile(files[0]);
    }
  });
}

function setupAltLogoHandling() {
  const altLogoInput = document.getElementById("alt-logo-input");
  const altLogoPreview = document.getElementById("alt-logo-preview");

  // File input change event
  altLogoInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      handleAltLogoFile(file);
    }
  });

  // Drag and drop functionality
  altLogoPreview.addEventListener("click", () => {
    if (!altLogoPreview.classList.contains("has-image")) {
      altLogoInput.click();
    }
  });

  altLogoPreview.addEventListener("dragover", (e) => {
    e.preventDefault();
    altLogoPreview.classList.add("drag-over");
  });

  altLogoPreview.addEventListener("dragleave", () => {
    altLogoPreview.classList.remove("drag-over");
  });

  altLogoPreview.addEventListener("drop", (e) => {
    e.preventDefault();
    altLogoPreview.classList.remove("drag-over");
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleAltLogoFile(files[0]);
    }
  });
}

function handleAltLogoFile(file) {
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification("Alternate logo file size must be less than 5MB", "error");
    return;
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    showNotification(
      "Please upload a valid image file (JPEG, PNG, GIF, WebP)",
      "error"
    );
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const altLogoData = e.target.result;
    websiteData.company.altLogo = altLogoData;
    displayAltLogo(altLogoData);
    hasUnsavedChanges = true;
    showNotification("Alternate logo uploaded successfully!", "success");
  };
  reader.readAsDataURL(file);
}

function displayAltLogo(altLogoData) {
  const altLogoPreview = document.getElementById("alt-logo-preview");
  const removeAltLogoBtn = document.getElementById("remove-alt-logo-btn");

  altLogoPreview.innerHTML = `<img src="${altLogoData}" alt="Alternate Logo" class="logo-image">`;
  altLogoPreview.classList.add("has-image");
  removeAltLogoBtn.style.display = "inline-flex";
}

function removeAltLogo() {
  if (confirm("Are you sure you want to remove the alternate logo?")) {
    const altLogoPreview = document.getElementById("alt-logo-preview");
    const removeAltLogoBtn = document.getElementById("remove-alt-logo-btn");

    altLogoPreview.innerHTML = `
            <div class="logo-placeholder">
                <i class="fas fa-image"></i>
                <p>No alternate logo uploaded</p>
                <small>Click to upload or drag & drop</small>
            </div>
        `;
    altLogoPreview.classList.remove("has-image");
    removeAltLogoBtn.style.display = "none";
    websiteData.company.altLogo = null;
    hasUnsavedChanges = true;
    showNotification("Alternate logo removed successfully!", "success");
  }
}

function triggerAltLogoUpload() {
  document.getElementById("alt-logo-input").click();
}

function switchTab(tabId) {
  // Remove active class from all tabs and content
  document
    .querySelectorAll(".tab-button")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));

  // Add active class to clicked tab
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");

  showNotification(`Switched to ${tabId} management`, "info");
}

function loadFormData() {
  // Load company data
  document.getElementById("company-name").value = websiteData.company.name;

  // Load logo if exists
  if (websiteData.company.logo) {
    displayLogo(websiteData.company.logo);
  }

  // Load alternate logo if exists
  if (websiteData.company.altLogo) {
    displayAltLogo(websiteData.company.altLogo);
  }

  // Load about data
  document.getElementById("story-title").value = websiteData.about.story.title;

  // Load services data
  document.getElementById("services-title").value = websiteData.services.title;
  document.getElementById("services-desc").value =
    websiteData.services.description;

  // Load advantages data
  document.getElementById("advantages-title").value =
    websiteData.advantages.title;
  document.getElementById("advantages-desc").value =
    websiteData.advantages.description;
}

function triggerLogoUpload() {
  document.getElementById("logo-input").click();
}

function handleLogoFile(file) {
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification("Logo file size must be less than 5MB", "error");
    return;
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    showNotification(
      "Please upload a valid image file (JPEG, PNG, GIF, WebP)",
      "error"
    );
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const logoData = e.target.result;
    websiteData.company.logo = logoData;
    displayLogo(logoData);
    hasUnsavedChanges = true;
    showNotification("Logo uploaded successfully!", "success");
  };
  reader.readAsDataURL(file);
}

function displayLogo(logoData) {
  const logoPreview = document.getElementById("logo-preview");
  const removeLogo = document.getElementById("remove-logo-btn");

  logoPreview.innerHTML = `<img src="${logoData}" alt="Company Logo" class="logo-image">`;
  logoPreview.classList.add("has-image");
  removeLogo.style.display = "inline-flex";
}

function removeLogo() {
  if (confirm("Are you sure you want to remove the company logo?")) {
    const logoPreview = document.getElementById("logo-preview");
    const removeLogo = document.getElementById("remove-logo-btn");

    logoPreview.innerHTML = `
                    <div class="logo-placeholder">
                        <i class="fas fa-building"></i>
                        <p>No logo uploaded</p>
                        <small>Click to upload or drag & drop</small>
                    </div>
                `;
    logoPreview.classList.remove("has-image");
    removeLogo.style.display = "none";
    websiteData.company.logo = null;
    hasUnsavedChanges = true;
    showNotification("Logo removed successfully!", "success");
  }
}

//#region Company Information

// Company information functions
async function loadCompanyInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}`);
    const companies = await res.json();
    const company = companies[0];
    if (company) {
      companyId = company.id;
      document.getElementById("company-name").value =
        company.company_name || "";
      document.getElementById("company-email").value = company.email || "";
      document.getElementById("company-phone").value =
        company.phone_number || "";
      document.getElementById("company-alt-phone").value =
        company.alt_phone_number || "";
      document.getElementById("company-description").value =
        company.business_desc || "";
      document.getElementById("company-business-hours").value =
        company.business_hours || "";

      // Address fields
      document.getElementById("company-house-no").value =
        company.house_no || "";
      document.getElementById("company-street-address").value =
        company.street_address || "";
      document.getElementById("company-city").value = company.city || "";
      document.getElementById("company-province").value =
        company.province || "";
      document.getElementById("company-zip-code").value =
        company.zip_code || "";
      document.getElementById("company-country").value = company.country || "";

      if (company.icon_logo_url) displayLogo(company.icon_logo_url);
      if (company.alt_logo_url) displayAltLogo(company.alt_logo_url);
    }
  } catch (err) {
    showNotification("Failed to load company info.", "error");
  }
}

async function saveCompanyInfo() {
  const saveBtn = document.getElementById("save-company-btn");
  if (!validateCompanyInfoForm()) return;

  // Show loading spinner
  saveBtn.classList.add("btn-loading");
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<span class="spinner"></span>Saving...`;

  const formData = new FormData();
  formData.append(
    "company_name",
    document.getElementById("company-name").value.trim()
  );
  formData.append(
    "email",
    document.getElementById("company-email").value.trim()
  );
  formData.append(
    "phone_number",
    document.getElementById("company-phone").value.trim()
  );
  formData.append(
    "alt_phone_number",
    document.getElementById("company-alt-phone").value.trim()
  );
  formData.append(
    "business_desc",
    document.getElementById("company-description").value.trim()
  );
  formData.append(
    "business_hours",
    document.getElementById("company-business-hours").value.trim()
  );
  // Address fields
  formData.append(
    "house_no",
    document.getElementById("company-house-no").value.trim()
  );
  formData.append(
    "street_address",
    document.getElementById("company-street-address").value.trim()
  );
  formData.append("city", document.getElementById("company-city").value.trim());
  formData.append(
    "province",
    document.getElementById("company-province").value.trim()
  );
  formData.append(
    "zip_code",
    document.getElementById("company-zip-code").value.trim()
  );
  formData.append(
    "country",
    document.getElementById("company-country").value.trim()
  );

  // Handle logo files
  const logoInput = document.getElementById("logo-input");
  if (logoInput.files[0]) formData.append("icon_logo_url", logoInput.files[0]);
  const altLogoInput = document.getElementById("alt-logo-input");
  if (altLogoInput.files[0])
    formData.append("alt_logo_url", altLogoInput.files[0]);

  try {
    let res;
    if (companyId) {
      // Update existing company info
      res = await fetch(`${API_BASE_URL}/${companyId}`, {
        method: "PATCH",
        body: formData,
      });
    } else {
      // Create new company info
      res = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        body: formData,
      });
    }
    if (res.ok) {
      showNotification("Company information saved successfully!", "success");
      hasUnsavedChanges = false;
      // If created, get new ID and reload info
      if (!companyId) {
        const data = await res.json();
        companyId = data.id;
        await loadCompanyInfo();
      }
    } else {
      showNotification("Failed to save company info.", "error");
    }
  } catch (err) {
    showNotification("Error saving company info.", "error");
  } finally {
    // Restore button state
    saveBtn.classList.remove("btn-loading");
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="fas fa-save"></i> Save Company Info`;
  }
}

function previewCompanyInfo() {
  const name = document.getElementById("company-name").value.trim();
  const email = document.getElementById("company-email").value.trim();
  const phone = document.getElementById("company-phone").value.trim();
  const description = document
    .getElementById("company-description")
    .value.trim();
  const businessHours = document
    .getElementById("company-business-hours")
    .value.trim();
  const logo = document
    .getElementById("logo-preview")
    .querySelector("img")?.src;
  const altLogo = document
    .getElementById("alt-logo-preview")
    .querySelector("img")?.src;

  // Address fields
  const houseNo = document.getElementById("company-house-no").value.trim();
  const streetAddress = document
    .getElementById("company-street-address")
    .value.trim();
  const city = document.getElementById("company-city").value.trim();
  const province = document.getElementById("company-province").value.trim();
  const zipCode = document.getElementById("company-zip-code").value.trim();
  const country = document.getElementById("company-country").value.trim();

  const addressHtml = `
    <div style="margin-bottom: 18px;">
      <h4>Company Address</h4>
      <p>
        ${houseNo ? houseNo + ", " : ""}
        ${streetAddress ? streetAddress + ", " : ""}
        ${city ? city + ", " : ""}
        ${province ? province + ", " : ""}
        ${zipCode ? zipCode + ", " : ""}
        ${country}
      </p>
    </div>
  `;

  const previewContent = `
    <div class="company-profile-card">
      <div class="company-header">
        <div class="company-logo-display">
          ${
            logo
              ? `<img src="${logo}" alt="Company Logo">`
              : `<i class="fas fa-building"></i>`
          }
        </div>
        <div class="company-details">
          <h2>${name}</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
        </div>
      </div>
      ${addressHtml}
      <p>${description}</p>
      <h4>Business Hours</h4>
      <p>${businessHours}</p>
      <div>
        <h4>Alternate Logo</h4>
        ${
          altLogo
            ? `<img src="${altLogo}" alt="Alternate Logo">`
            : `<i class="fas fa-image"></i>`
        }
      </div>
    </div>
  `;
  showPreview("Company Profile Preview", previewContent);
}

function validateCompanyInfoForm() {
  const name = document.getElementById("company-name").value.trim();
  const email = document.getElementById("company-email").value.trim();
  const phone = document.getElementById("company-phone").value.trim();
  const description = document
    .getElementById("company-description")
    .value.trim();
  const businessHours = document
    .getElementById("company-business-hours")
    .value.trim();
  const logo = document.getElementById("logo-preview").querySelector("img");
  const altLogo = document
    .getElementById("alt-logo-preview")
    .querySelector("img");

  // Address fields
  const streetAddress = document
    .getElementById("company-street-address")
    .value.trim();
  const city = document.getElementById("company-city").value.trim();
  const province = document.getElementById("company-province").value.trim();
  const zipCode = document.getElementById("company-zip-code").value.trim();
  const country = document.getElementById("company-country").value.trim();

  if (
    !name ||
    !email ||
    !phone ||
    !businessHours ||
    !description ||
    !logo ||
    !altLogo ||
    !streetAddress ||
    !city ||
    !province ||
    !zipCode ||
    !country
  ) {
    showNotification(
      "All fields except House No. are required, including both logos and address.",
      "error"
    );
    return false;
  }
  return true;
}

function setupRealtimeValidation() {
  const requiredFields = [
    { id: "company-name", warning: "Company name is required." },
    { id: "company-email", warning: "Email is required." },
    { id: "company-phone", warning: "Phone number is required." },
    { id: "company-description", warning: "Business description is required." },
    { id: "company-business-hours", warning: "Business hours are required." },
    { id: "company-street-address", warning: "Street address is required." },
    { id: "company-city", warning: "City is required." },
    { id: "company-province", warning: "Province is required." },
    { id: "company-zip-code", warning: "Zip code is required." },
    { id: "company-country", warning: "Country is required." },
  ];

  requiredFields.forEach((field) => {
    const input = document.getElementById(field.id);
    const warningSpan = document.getElementById(`${field.id}-warning`);
    if (!input) return;
    if (!warningSpan) return;
    input.addEventListener("input", () => {
      if (!input.value.trim()) {
        warningSpan.textContent = field.warning;
        warningSpan.style.display = "inline";
      } else {
        warningSpan.textContent = "";
        warningSpan.style.display = "none";
      }
    });
    // Initial validation
    if (!input.value.trim()) {
      warningSpan.textContent = field.warning;
      warningSpan.style.display = "inline";
    } else {
      warningSpan.textContent = "";
      warningSpan.style.display = "none";
    }
  });

  function validateLogoPreview() {
    const logoImg = document
      .getElementById("logo-preview")
      .querySelector("img");
    const logoWarning = document.getElementById("logo-preview-warning");
    if (!logoWarning) return;
    if (!logoImg) {
      logoWarning.textContent = "Company logo is required.";
      logoWarning.style.display = "inline";
    } else {
      logoWarning.textContent = "";
      logoWarning.style.display = "none";
    }
  }

  function validateAltLogoPreview() {
    const altLogoImg = document
      .getElementById("alt-logo-preview")
      .querySelector("img");
    const altLogoWarning = document.getElementById("alt-logo-preview-warning");
    if (!altLogoWarning) return;
    if (!altLogoImg) {
      altLogoWarning.textContent = "Alternate logo is required.";
      altLogoWarning.style.display = "inline";
    } else {
      altLogoWarning.textContent = "";
      altLogoWarning.style.display = "none";
    }
  }

  // Validate on logo changes
  document
    .getElementById("logo-input")
    .addEventListener("change", validateLogoPreview);
  document
    .getElementById("alt-logo-input")
    .addEventListener("change", validateAltLogoPreview);

  // Also validate on displayLogo/displayAltLogo calls
  const origDisplayLogo = window.displayLogo;
  window.displayLogo = function (...args) {
    origDisplayLogo.apply(this, args);
    validateLogoPreview();
  };
  const origDisplayAltLogo = window.displayAltLogo;
  window.displayAltLogo = function (...args) {
    origDisplayAltLogo.apply(this, args);
    validateAltLogoPreview();
  };

  // Initial validation
  requiredFields.forEach((field) => {
    const input = document.getElementById(field.id);
    input.dispatchEvent(new Event("input"));
  });
  validateLogoPreview();
  validateAltLogoPreview();
}

// function resetCompanyInfo() {
//   if (
//     confirm(
//       "Are you sure you want to reset all company information to default values? This will also remove the uploaded logo."
//     )
//   ) {
//     // Reset to default values
//     websiteData.company = {
//       name: "Ambulo Properties",
//       logo: null,
//     };

//     loadFormData();

//     const logoPreview = document.getElementById("logo-preview");
//     const removeLogoBtn = document.getElementById("remove-logo-btn");
//     logoPreview.innerHTML = `
//                     <div class="logo-placeholder">
//                         <i class="fas fa-building"></i>
//                         <p>No logo uploaded</p>
//                         <small>Click to upload or drag & drop</small>
//                     </div>
//                 `;
//     logoPreview.classList.remove("has-image");
//     removeLogoBtn.style.display = "none";

//     websiteData.company.altLogo = null;
//     // Reset alt logo display
//     const altLogoPreview = document.getElementById("alt-logo-preview");
//     const removeAltLogoBtn = document.getElementById("remove-alt-logo-btn");
//     altLogoPreview.innerHTML = `
//     <div class="logo-placeholder">
//         <i class="fas fa-image"></i>
//         <p>No alternate logo uploaded</p>
//         <small>Click to upload or drag & drop</small>
//     </div>
// `;
//     altLogoPreview.classList.remove("has-image");
//     removeAltLogoBtn.style.display = "none";

//     hasUnsavedChanges = true;
//     showNotification("Company information reset to defaults!", "success");
//   }
// }

function renderServices() {
  const servicesList = document.getElementById("services-list");
  servicesList.innerHTML = "";

  websiteData.services.items.forEach((service) => {
    const serviceElement = createServiceElement(service);
    servicesList.appendChild(serviceElement);
  });
}

function createServiceElement(service) {
  const div = document.createElement("div");
  div.className = "service-item";
  div.innerHTML = `
                <h4>${service.title}</h4>
                <p>${service.description}</p>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="editService(${service.id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteService(${service.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            `;
  return div;
}

//#endregion

function renderAdvantages() {
  const advantagesList = document.getElementById("advantages-list");
  advantagesList.innerHTML = "";

  websiteData.advantages.items.forEach((advantage) => {
    const advantageElement = createAdvantageElement(advantage);
    advantagesList.appendChild(advantageElement);
  });
}

function createAdvantageElement(advantage) {
  const div = document.createElement("div");
  div.className = "advantage-item";
  div.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px;">
                    <div class="icon-preview">
                        <i class="${advantage.icon}"></i>
                    </div>
                    <div>
                        <h4>${advantage.title}</h4>
                    </div>
                </div>
                <p>${advantage.description}</p>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="editAdvantage(${advantage.id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteAdvantage(${advantage.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            `;
  return div;
}

//#region ABOUT US
document.addEventListener("DOMContentLoaded", function () {
  generateAboutImageUploads();

    if (document.getElementById("story-content-editor")) {
      window.storyQuill = new Quill("#story-content-editor", {
        theme: "snow",
        placeholder: "Write your story here...",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["link", "blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });
    }
  
    if (document.getElementById("homepage-about-content-editor")) {
    window.homepageAboutQuill = new Quill("#homepage-about-content-editor", {
      theme: "snow",
      placeholder: "Enter About Us content...",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["link", "blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
    });
  }
  
  loadAboutUsContent();

});

function setAboutUsSession(data) {
  sessionStorage.setItem("aboutUsData", JSON.stringify(data));
}

function getAboutUsSession() {
  const data = sessionStorage.getItem("aboutUsData");
  return data ? JSON.parse(data) : null;
}

async function loadAboutUsContent(forceRefresh = false) {
  let about = null;

  if (!forceRefresh) {
    about = getAboutUsSession();
  }

  if (!about) {
    try {
      const res = await fetch(ABOUT_API_URL);
      const result = await res.json();
      about = result.data && result.data[0] ? result.data[0] : null;
      if (about) setAboutUsSession(about);
    } catch (err) {
      showNotification("Failed to load About Us content.", "error");
      return;
    }
  }

  if (!about) return;

  document.getElementById("story-title").value =
    about.story_section_title || "";

  if (window.storyQuill && about.story_content) {
    window.storyQuill.root.innerHTML = about.story_content;
  }

  document.getElementById("mission-text").value = about.mission || "";
  document.getElementById("vision-text").value = about.vision || "";
  document.getElementById("values-text").value = about.core_values || "";
  document.getElementById("homepage-about-subtitle").value =
    about.homepage_about_subtitle || "";
  
  if (window.homepageAboutQuill && about.homepage_about_content) {
    window.homepageAboutQuill.root.innerHTML = about.homepage_about_content;
  }

  for (let i = 1; i <= 4; i++) {
    const imgUrl = about[`about_img${i}`];
    const img = document.getElementById(`aboutImage${i}Current`);
    const placeholder = document.getElementById(`aboutImagePlaceholder${i}`);
    const removeBtn = document.getElementById(`removeAboutImageBtn${i}`);
    if (imgUrl) {
      img.src = imgUrl;
      img.style.display = "block";
      placeholder.style.display = "none";
      removeBtn.style.display = "inline-flex";
    } else {
      img.src = "";
      img.style.display = "none";
      placeholder.style.display = "block";
      removeBtn.style.display = "none";
    }
  }
}

async function saveAboutContent() {
  const saveBtn = document.querySelector("#about .btn-success");
  saveBtn.classList.add("btn-loading");
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<span class="spinner"></span>Saving...`;

  const formData = new FormData();
  formData.append(
    "story_section_title",
    document.getElementById("story-title").value.trim()
  );
  formData.append(
    "story_content",
    window.storyQuill ? window.storyQuill.root.innerHTML : ""
  );
  formData.append(
    "mission",
    document.getElementById("mission-text").value.trim()
  );
  formData.append(
    "vision",
    document.getElementById("vision-text").value.trim()
  );
  formData.append(
    "core_values",
    document.getElementById("values-text").value.trim()
  );
  formData.append(
    "homepage_about_subtitle",
    document.getElementById("homepage-about-subtitle").value.trim()
  );
  formData.append(
    "homepage_about_content",
    window.homepageAboutQuill ? window.homepageAboutQuill.root.innerHTML : ""
  );

  for (let i = 1; i <= 4; i++) {
    const fileInput = document.getElementById(`aboutImage${i}`);
    if (fileInput && fileInput.files[0]) {
      formData.append(`about_img${i}`, fileInput.files[0]);
    }
  }

  try {
    const res = await fetch(ABOUT_API_URL);
    const result = await res.json();
    const exists = result.data && result.data.length > 0;

    let saveRes;
    if (!exists) {
      // Insert new row
      saveRes = await fetch(`${ABOUT_API_URL}/create-about-us`, {
        method: "POST",
        body: formData,
      });
    } else {
      saveRes = await fetch(`${ABOUT_API_URL}`, {
        method: "PATCH",
        body: formData,
      });
    }

    if (saveRes.ok) {
      showNotification("About Us content saved successfully!", "success");
      hasUnsavedChanges = false;
      await loadAboutUsContent(true);
    } else {
      showNotification("Failed to save About Us content.", "error");
    }
  } catch (err) {
    showNotification("Error saving About Us content.", "error");
  } finally {
    saveBtn.classList.remove("btn-loading");
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="fas fa-save"></i> Save About Content`;
  }
}

function previewAbout() {
  const previewContent = `
                <div style="font-family: 'Poppins', sans-serif; line-height: 1.6;">
                    <h2 style="color: #2c3e50; margin-bottom: 20px;">${websiteData.about.story.title}</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px;">
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px;">
                            <h4 style="color: #3b82f6; margin-bottom: 10px;">Mission</h4>
                            <p style="color: #64748b; font-size: 14px;">${websiteData.about.mvv.mission}</p>
                        </div>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px;">
                            <h4 style="color: #3b82f6; margin-bottom: 10px;">Vision</h4>
                            <p style="color: #64748b; font-size: 14px;">${websiteData.about.mvv.vision}</p>
                        </div>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px;">
                            <h4 style="color: #3b82f6; margin-bottom: 10px;">Values</h4>
                            <p style="color: #64748b; font-size: 14px;">${websiteData.about.mvv.values}</p>
                        </div>
                    </div>
                </div>
            `;

  showPreview("About Page Preview", previewContent);
}
function generateAboutImageUploads() {
  const grid = document.getElementById("aboutImagesGrid");
  grid.innerHTML = "";

  for (let i = 1; i <= 4; i++) {
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-upload-container";
    imageContainer.innerHTML = `
      <div class="form-group">
        <label class="form-label">About Image ${i}</label>
        <div class="image-upload" id="aboutImageUpload${i}" onclick="document.getElementById('aboutImage${i}').click()" style="position: relative;">
          <div class="upload-placeholder" id="aboutImagePlaceholder${i}">
            <i class="fas fa-image"></i>
            <p>Upload image ${i}</p>
            <small>Recommended size: 800x600px</small>
          </div>
          <img id="aboutImage${i}Current" class="current-image" alt="About Image ${i}" style="display:none; max-width:100%; max-height:160px; position:absolute; top:0; left:0; right:0; bottom:0; margin:auto;">
          <button type="button" class="btn btn-danger" id="removeAboutImageBtn${i}" style="display:none; position:absolute; top:8px; right:8px; z-index:2;" onclick="removeAboutImage(${i})">
            <i class="fas fa-trash"></i>
            Remove
          </button>
        </div>
        <input type="file" id="aboutImage${i}" accept="image/*" style="display: none;">
      </div>
    `;
    grid.appendChild(imageContainer);

    // Add preview handler for this input
    setTimeout(() => {
      const fileInput = document.getElementById(`aboutImage${i}`);
      const img = document.getElementById(`aboutImage${i}Current`);
      const placeholder = document.getElementById(`aboutImagePlaceholder${i}`);
      const removeBtn = document.getElementById(`removeAboutImageBtn${i}`);

      fileInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function (e) {
            img.src = e.target.result;
            img.style.display = "block";
            placeholder.style.display = "none";
            removeBtn.style.display = "inline-flex";
          };
          reader.readAsDataURL(file);
        }
      });
    }, 0);
  }
}

// Remove image handler
window.removeAboutImage = function (i) {
  const fileInput = document.getElementById(`aboutImage${i}`);
  const img = document.getElementById(`aboutImage${i}Current`);
  const placeholder = document.getElementById(`aboutImagePlaceholder${i}`);
  const removeBtn = document.getElementById(`removeAboutImageBtn${i}`);
  fileInput.value = "";
  img.src = "";
  img.style.display = "none";
  placeholder.style.display = "block";
  removeBtn.style.display = "none";
};

//#endregion

// Services content functions
function addService() {
  // Clear the form and set up for adding new service
  currentEditingServiceId = "new";
  document.getElementById("service-title-input").value = "";
  document.getElementById("service-desc-input").value = "";
  document.querySelector("#service-modal .modal-title").textContent =
    "Add New Service";
  document.querySelector('#service-form button[type="submit"]').innerHTML =
    '<i class="fas fa-plus"></i> Add Service';

  document.getElementById("service-modal").classList.add("show");
}

function editService(id) {
  const service = websiteData.services.items.find((s) => s.id === id);
  if (!service) return;

  currentEditingServiceId = id;
  document.getElementById("service-title-input").value = service.title;
  document.getElementById("service-desc-input").value = service.description;
  document.querySelector("#service-modal .modal-title").textContent =
    "Edit Service";
  document.querySelector('#service-form button[type="submit"]').innerHTML =
    '<i class="fas fa-save"></i> Save Service';

  document.getElementById("service-modal").classList.add("show");
}

function updateService() {
  const title = document.getElementById("service-title-input").value.trim();
  const description = document
    .getElementById("service-desc-input")
    .value.trim();

  if (!title || !description) {
    showNotification("Please fill in both title and description.", "error");
    return;
  }

  if (currentEditingServiceId === "new") {
    // Adding new service
    const newId =
      websiteData.services.items.length > 0
        ? Math.max(...websiteData.services.items.map((s) => s.id)) + 1
        : 1;
    const newService = {
      id: newId,
      title: title,
      description: description,
    };

    websiteData.services.items.push(newService);
    showNotification("New service added successfully!", "success");
  } else {
    // Updating existing service
    const service = websiteData.services.items.find(
      (s) => s.id === currentEditingServiceId
    );
    if (service) {
      service.title = title;
      service.description = description;
      showNotification("Service updated successfully!", "success");
    }
  }

  renderServices();
  closeServiceModal();
  hasUnsavedChanges = true;
}

function deleteService(id) {
  const service = websiteData.services.items.find((s) => s.id === id);
  if (!service) return;

  if (
    confirm(
      `Are you sure you want to delete the service "${service.title}"? This action cannot be undone.`
    )
  ) {
    websiteData.services.items = websiteData.services.items.filter(
      (s) => s.id !== id
    );
    renderServices();
    hasUnsavedChanges = true;
    showNotification("Service deleted successfully!", "success");
  }
}

function closeServiceModal() {
  document.getElementById("service-modal").classList.remove("show");
  currentEditingServiceId = null;

  // Reset form
  document.getElementById("service-title-input").value = "";
  document.getElementById("service-desc-input").value = "";
  document.querySelector("#service-modal .modal-title").textContent =
    "Edit Service";
  document.querySelector('#service-form button[type="submit"]').innerHTML =
    '<i class="fas fa-save"></i> Save Service';
}

function saveServicesContent() {
  websiteData.services.title = document.getElementById("services-title").value;
  websiteData.services.description =
    document.getElementById("services-desc").value;

  hasUnsavedChanges = false;
  showNotification("Services content saved successfully!", "success");
  console.log("Services data saved:", websiteData.services);
}

function previewServices() {
  const previewContent = `
                <div style="font-family: 'Poppins', sans-serif;">
                    <h2 style="color: #2c3e50; margin-bottom: 10px;">${
                      websiteData.services.title
                    }</h2>
                    <p style="color: #64748b; margin-bottom: 30px;">${
                      websiteData.services.description
                    }</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        ${websiteData.services.items
                          .map(
                            (service) => `
                            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <h4 style="color: #1e293b; margin-bottom: 10px; font-size: 18px;">${service.title}</h4>
                                <p style="color: #64748b; line-height: 1.6; font-size: 14px;">${service.description}</p>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            `;

  showPreview("Services Preview", previewContent);
}

// Advantages/Why Choose functions
function addAdvantage() {
  currentEditingAdvantageId = "new";
  selectedIcon = "";
  document.getElementById("advantage-title-input").value = "";
  document.getElementById("advantage-desc-input").value = "";
  document.querySelector("#advantage-modal .modal-title").textContent =
    "Add New Advantage";
  document.querySelector('#advantage-form button[type="submit"]').innerHTML =
    '<i class="fas fa-plus"></i> Add Advantage';

  renderIconSelector();
  document.getElementById("advantage-modal").classList.add("show");
}

function editAdvantage(id) {
  const advantage = websiteData.advantages.items.find((a) => a.id === id);
  if (!advantage) return;

  currentEditingAdvantageId = id;
  selectedIcon = advantage.icon;
  document.getElementById("advantage-title-input").value = advantage.title;
  document.getElementById("advantage-desc-input").value = advantage.description;
  document.querySelector("#advantage-modal .modal-title").textContent =
    "Edit Advantage";
  document.querySelector('#advantage-form button[type="submit"]').innerHTML =
    '<i class="fas fa-save"></i> Save Advantage';

  renderIconSelector();
  document.getElementById("advantage-modal").classList.add("show");
}

function renderIconSelector() {
  const iconSelector = document.getElementById("icon-selector");
  iconSelector.innerHTML = "";

  availableIcons.forEach((iconClass) => {
    const iconDiv = document.createElement("div");
    iconDiv.className = `icon-option ${
      selectedIcon === iconClass ? "selected" : ""
    }`;
    iconDiv.innerHTML = `<i class="${iconClass}"></i>`;
    iconDiv.addEventListener("click", () => selectIcon(iconClass));
    iconSelector.appendChild(iconDiv);
  });
}

function selectIcon(iconClass) {
  selectedIcon = iconClass;
  document.querySelectorAll(".icon-option").forEach((option) => {
    option.classList.remove("selected");
  });
  event.target.closest(".icon-option").classList.add("selected");
}

function updateAdvantage() {
  const title = document.getElementById("advantage-title-input").value.trim();
  const description = document
    .getElementById("advantage-desc-input")
    .value.trim();

  if (!title || !description || !selectedIcon) {
    showNotification(
      "Please fill in title, description, and select an icon.",
      "error"
    );
    return;
  }

  if (currentEditingAdvantageId === "new") {
    // Adding new advantage
    const newId =
      websiteData.advantages.items.length > 0
        ? Math.max(...websiteData.advantages.items.map((a) => a.id)) + 1
        : 1;
    const newAdvantage = {
      id: newId,
      title: title,
      description: description,
      icon: selectedIcon,
    };

    websiteData.advantages.items.push(newAdvantage);
    showNotification("New advantage added successfully!", "success");
  } else {
    // Updating existing advantage
    const advantage = websiteData.advantages.items.find(
      (a) => a.id === currentEditingAdvantageId
    );
    if (advantage) {
      advantage.title = title;
      advantage.description = description;
      advantage.icon = selectedIcon;
      showNotification("Advantage updated successfully!", "success");
    }
  }

  renderAdvantages();
  closeAdvantageModal();
  hasUnsavedChanges = true;
}

function deleteAdvantage(id) {
  const advantage = websiteData.advantages.items.find((a) => a.id === id);
  if (!advantage) return;

  if (
    confirm(
      `Are you sure you want to delete the advantage "${advantage.title}"? This action cannot be undone.`
    )
  ) {
    websiteData.advantages.items = websiteData.advantages.items.filter(
      (a) => a.id !== id
    );
    renderAdvantages();
    hasUnsavedChanges = true;
    showNotification("Advantage deleted successfully!", "success");
  }
}

function closeAdvantageModal() {
  document.getElementById("advantage-modal").classList.remove("show");
  currentEditingAdvantageId = null;
  selectedIcon = "";

  // Reset form
  document.getElementById("advantage-title-input").value = "";
  document.getElementById("advantage-desc-input").value = "";
  document.querySelector("#advantage-modal .modal-title").textContent =
    "Edit Advantage";
  document.querySelector('#advantage-form button[type="submit"]').innerHTML =
    '<i class="fas fa-save"></i> Save Advantage';
}

function saveAdvantagesContent() {
  websiteData.advantages.title =
    document.getElementById("advantages-title").value;
  websiteData.advantages.description =
    document.getElementById("advantages-desc").value;

  hasUnsavedChanges = false;
  showNotification("Advantages content saved successfully!", "success");
  console.log("Advantages data saved:", websiteData.advantages);
}

function previewAdvantages() {
  const previewContent = `
                <div style="font-family: 'Poppins', sans-serif;">
                    <h2 style="color: #2c3e50; margin-bottom: 10px; text-align: center;">${
                      websiteData.advantages.title
                    }</h2>
                    <p style="color: #64748b; margin-bottom: 40px; text-align: center; font-size: 18px;">${
                      websiteData.advantages.description
                    }</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
                        ${websiteData.advantages.items
                          .map(
                            (advantage, index) => `
                            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 20px; padding: 30px; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(0,0,0,0.1); position: relative; overflow: hidden; animation: slideInUp 0.6s ease ${
                              index * 0.1
                            }s both;">
                                <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(45deg, #3b82f6, #60a5fa); border-radius: 50%; opacity: 0.1;"></div>
                                <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px; position: relative; z-index: 1;">
                                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #60a5fa); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; flex-shrink: 0;">
                                        <i class="${advantage.icon}"></i>
                                    </div>
                                    <div>
                                        <h4 style="color: #1e293b; margin: 0; font-size: 1.4em; font-weight: 600;">${
                                          advantage.title
                                        }</h4>
                                    </div>
                                </div>
                                <p style="color: #64748b; line-height: 1.7; font-size: 1.05em; position: relative; z-index: 1; margin: 0;">${
                                  advantage.description
                                }</p>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
                <style>
                    @keyframes slideInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                </style>
            `;

  showPreview("Why Choose Preview", previewContent);
}

// Global functions
function saveAllContent() {
  saveCompanyInfo();
  saveAboutContent();
  saveServicesContent();
  saveAdvantagesContent();
  showNotification("All content saved successfully!", "success");
}

function previewWebsite() {
  const company = websiteData.company;
  const logoDisplay = company.logo
    ? `<img src="${company.logo}" alt="${company.name} Logo" style="height: 60px; width: auto; margin-right: 15px;">`
    : `<i class="fas fa-building" style="font-size: 3rem; color: #3b82f6; margin-right: 15px;"></i>`;

  const fullPreviewContent = `
                <div style="font-family: 'Poppins', sans-serif;">
                    <div style="text-align: center; margin-bottom: 50px; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px;">
                        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                            ${logoDisplay}
                            <div>
                                <h1 style="color: white; font-size: 3em; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${
                                  company.name
                                }</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 1.3em; margin: 5px 0 0 0;">${
                                  company.tagline
                                }</p>
                            </div>
                        </div>
                        <p style="font-size: 1.1em; line-height: 1.6; max-width: 800px; margin: 0 auto; opacity: 0.95;">Founded in ${
                          company.founded
                        }, delivering commercial real estate excellence</p>
                    </div>
                    
                    <section style="margin-bottom: 60px;">
                        <h2 style="color: #2c3e50; margin-bottom: 30px; text-align: center; font-size: 2.5em;">${
                          websiteData.about.story.title
                        }</h2>
                    </section>
                    
                    <section style="margin-bottom: 60px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
                            <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; border-radius: 20px;">
                                <h3 style="margin-bottom: 20px; font-size: 1.8em;">Mission</h3>
                                <p style="line-height: 1.7; font-size: 1.05em;">${
                                  websiteData.about.mvv.mission
                                }</p>
                            </div>
                            <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #10b981, #34d399); color: white; border-radius: 20px;">
                                <h3 style="margin-bottom: 20px; font-size: 1.8em;">Vision</h3>
                                <p style="line-height: 1.7; font-size: 1.05em;">${
                                  websiteData.about.mvv.vision
                                }</p>
                            </div>
                            <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; border-radius: 20px;">
                                <h3 style="margin-bottom: 20px; font-size: 1.8em;">Values</h3>
                                <p style="line-height: 1.7; font-size: 1.05em;">${
                                  websiteData.about.mvv.values
                                }</p>
                            </div>
                        </div>
                    </section>

                    <section style="margin-bottom: 60px; background: #f8fafc; padding: 60px 40px; border-radius: 24px;">
                        <h2 style="color: #2c3e50; margin-bottom: 15px; text-align: center; font-size: 2.5em;">${
                          websiteData.advantages.title
                        }</h2>
                        <p style="color: #64748b; margin-bottom: 50px; text-align: center; font-size: 1.2em; max-width: 700px; margin-left: auto; margin-right: auto; margin-bottom: 50px;">${
                          websiteData.advantages.description
                        }</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 30px; max-width: 1400px; margin: 0 auto;">
                            ${websiteData.advantages.items
                              .map(
                                (advantage) => `
                                <div style="background: white; border: 2px solid #e5e7eb; border-radius: 20px; padding: 30px; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                                    <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(45deg, #3b82f6, #60a5fa); border-radius: 50%; opacity: 0.1;"></div>
                                    <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px; position: relative; z-index: 1;">
                                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #60a5fa); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; flex-shrink: 0;">
                                            <i class="${advantage.icon}"></i>
                                        </div>
                                        <div>
                                            <h4 style="color: #1e293b; margin: 0; font-size: 1.4em; font-weight: 600;">${advantage.title}</h4>
                                        </div>
                                    </div>
                                    <p style="color: #64748b; line-height: 1.7; font-size: 1.05em; position: relative; z-index: 1; margin: 0;">${advantage.description}</p>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 60px;">
                        <h2 style="color: #2c3e50; margin-bottom: 15px; text-align: center; font-size: 2.5em;">${
                          websiteData.services.title
                        }</h2>
                        <p style="color: #64748b; margin-bottom: 50px; text-align: center; font-size: 1.2em; max-width: 600px; margin-left: auto; margin-right: auto;">${
                          websiteData.services.description
                        }</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 30px; max-width: 1400px; margin: 0 auto;">
                            ${websiteData.services.items
                              .map(
                                (service) => `
                                <div style="background: white; border: 2px solid #e5e7eb; border-radius: 20px; padding: 30px; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                                    <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(45deg, #10b981, #34d399); border-radius: 50%; opacity: 0.1;"></div>
                                    <h4 style="color: #1e293b; margin-bottom: 18px; font-size: 1.4em; font-weight: 600; position: relative; z-index: 1;">${service.title}</h4>
                                    <p style="color: #64748b; line-height: 1.7; font-size: 1.05em; position: relative; z-index: 1;">${service.description}</p>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </section>
                </div>
            `;

  showPreview("Complete Website Preview", fullPreviewContent);
}

function publishChanges() {
  if (hasUnsavedChanges) {
    if (!confirm("You have unsaved changes. Save before publishing?")) {
      return;
    }
    saveAllContent();
  }

  if (
    confirm("Are you sure you want to publish all changes to the live website?")
  ) {
    showNotification("Publishing changes to live website...", "info");

    // Simulate publishing process with progress
    const steps = [
      "Validating content...",
      "Generating pages...",
      "Optimizing assets...",
      "Deploying to server...",
      "Updating cache...",
    ];

    let currentStep = 0;
    const publishInterval = setInterval(() => {
      if (currentStep < steps.length) {
        showNotification(steps[currentStep], "info");
        currentStep++;
      } else {
        clearInterval(publishInterval);
        showNotification(
          "Website published successfully! Changes are now live.",
          "success"
        );
        hasUnsavedChanges = false;
      }
    }, 800);
  }
}

function goBack() {
  if (hasUnsavedChanges) {
    if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
      showNotification("Returning to dashboard...", "info");
      // In a real app, this would navigate back
    }
  } else {
    showNotification("Returning to dashboard...", "info");
    // In a real app, this would navigate back
  }
}

function showPreview(title, content) {
  document.querySelector("#preview-modal .modal-title").textContent = title;
  document.getElementById("preview-content").innerHTML = content;
  document.getElementById("preview-modal").classList.add("show");
}

function closePreviewModal() {
  document.getElementById("preview-modal").classList.remove("show");
}

function showNotification(message, type = "info") {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
                <i class="fas fa-${
                  type === "success"
                    ? "check-circle"
                    : type === "error"
                    ? "exclamation-triangle"
                    : "info-circle"
                }"></i>
                ${message}
            `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

function showAutoSave() {
  clearTimeout(window.autoSaveTimeout);
  window.autoSaveTimeout = setTimeout(() => {
    // Auto-save current data
    const currentTab = document.querySelector(".tab-button.active").dataset.tab;

    if (currentTab === "company") {
      const nameInput = document.getElementById("company-name");
      websiteData.company.name = nameInput ? nameInput.value : "";
    } else if (currentTab === "about") {
      websiteData.about.story.title =
        document.getElementById("story-title").value;
      websiteData.about.mvv.mission =
        document.getElementById("mission-text").value;
      websiteData.about.mvv.vision =
        document.getElementById("vision-text").value;
      websiteData.about.mvv.values =
        document.getElementById("values-text").value;
    } else if (currentTab === "services") {
      websiteData.services.title =
        document.getElementById("services-title").value;
      websiteData.services.description =
        document.getElementById("services-desc").value;
    } else if (currentTab === "advantages") {
      websiteData.advantages.title =
        document.getElementById("advantages-title").value;
      websiteData.advantages.description =
        document.getElementById("advantages-desc").value;
    }

    console.log("Auto-saved:", websiteData);

    const indicator = document.createElement("div");
    indicator.className = "auto-save-indicator";
    indicator.innerHTML = '<i class="fas fa-check"></i> Auto-saved';

    document.body.appendChild(indicator);
    setTimeout(() => indicator.classList.add("show"), 100);
    setTimeout(() => {
      indicator.classList.remove("show");
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }, 2000);

    hasUnsavedChanges = false;
  }, 3000);
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl+S or Cmd+S to save
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveAllContent();
  }

  // Ctrl+P or Cmd+P to preview
  if ((e.ctrlKey || e.metaKey) && e.key === "p") {
    e.preventDefault();
    previewWebsite();
  }

  // Escape to close modals
  if (e.key === "Escape") {
    closeServiceModal();
    closeAdvantageModal();
    closePreviewModal();
  }
});

window.closePreviewModal = closePreviewModal;
window.previewCompanyInfo = previewCompanyInfo;
window.saveCompanyInfo = saveCompanyInfo;
window.addService = addService;
window.previewAbout = previewAbout;
window.saveAboutContent = saveAboutContent;
window.editService = editService;
window.updateService = updateService;
window.deleteService = deleteService;
window.closeServiceModal = closeServiceModal;
window.saveServicesContent = saveServicesContent;
window.previewServices = previewServices;
window.addAdvantage = addAdvantage;
window.editAdvantage = editAdvantage;
window.updateAdvantage = updateAdvantage;
window.deleteAdvantage = deleteAdvantage;
window.closeAdvantageModal = closeAdvantageModal;
window.saveAdvantagesContent = saveAdvantagesContent;
window.previewAdvantages = previewAdvantages;
window.saveAllContent = saveAllContent;
