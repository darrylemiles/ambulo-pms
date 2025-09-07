import fetchCompanyDetails from "../utils/loadCompanyInfo.js";

document.addEventListener("DOMContentLoaded", async () => {
  setDynamicHomepageContent();

  const grid = document.getElementById("homepagePropertyGrid");
  if (grid) {
    const properties = await fetchHomepageProperties();
    grid.innerHTML = properties.map(renderHomepagePropertyCard).join("");

    setTimeout(() => {
      grid.querySelectorAll(".property-card").forEach((card) => {
        card.classList.add("revealed");
      });
      grid.querySelectorAll(".reveal-element").forEach((el) => {
        el.classList.add("revealed");
      });
    }, 100);
  }

  populateHomepageAboutSection();
});

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

async function fetchHomepageProperties() {
  const cacheKey = "homepagePropertiesAll";
  let properties = [];
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      properties = JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  } else {
    const res = await fetch("/api/v1/properties?limit=50");
    if (!res.ok) return [];
    const data = await res.json();
    properties = data.properties || [];
    sessionStorage.setItem(cacheKey, JSON.stringify(properties));
  }

  for (let i = properties.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [properties[i], properties[j]] = [properties[j], properties[i]];
  }
  return properties.slice(0, 6);
}

function renderHomepagePropertyCard(property) {
  const imageUrl =
    property.display_image ||
    (property.property_pictures && property.property_pictures[0]?.image_url) ||
    "/assets/default-property.jpg";
  const address = property.street
    ? `${property.street}, ${property.city}, ${property.province}`
    : property.city || "";

  return `
    <div class="property-card reveal-element scale-up">
      <div class="property-image" style="background-image:url('${imageUrl}');"></div>
      <div class="property-info">
        <div class="property-title">${property.property_name || "Unit"}</div>
        <div class="property-desc">${address}</div>
        <div class="property-price">${
          property.base_rent
            ? `₱ ${Number(property.base_rent).toLocaleString()}/mo`
            : "N/A"
        }</div>
      </div>
    </div>
  `;
}

function getAboutUsSession() {
  const data = sessionStorage.getItem("aboutUsData");
  return data ? JSON.parse(data) : null;
}

async function populateHomepageAboutSection() {
  let about = getAboutUsSession();

  if (!about) {
    try {
      const res = await fetch("/api/v1/about-us");
      const result = await res.json();
      about = result.data && result.data[0] ? result.data[0] : null;
      if (about) sessionStorage.setItem("aboutUsData", JSON.stringify(about));
    } catch (err) {
      console.error("Failed to load About Us content for homepage.", err);
      return;
    }
  }

  if (!about) return;

  const aboutSection = document.querySelector("#about .section-title");
  if (aboutSection) {
    aboutSection.querySelector("h2").textContent = "About Us";
    aboutSection.querySelector("p").textContent =
      about.homepage_about_subtitle ||
      "Building successful businesses through strategic commercial real estate solutions";
  }

  const aboutText = document.querySelector("#about .about-text");
  if (aboutText) {
    aboutText.innerHTML = about.homepage_about_content || "";
  }

  const aboutImages = [
    document.getElementById("about-image-1"),
    document.getElementById("about-image-2"),
    document.getElementById("about-image-3"),
    document.getElementById("about-image-4"),
  ];
  for (let i = 1; i <= 4; i++) {
    const imgUrl = about[`about_img${i}`];
    const imgElem = aboutImages[i - 1];
    if (imgElem) {
      if (imgUrl) {
        imgElem.src = imgUrl;
        imgElem.style.display = "block";
      } else {
        imgElem.src = "";
        imgElem.style.display = "none";
      }
    }
  }
}
