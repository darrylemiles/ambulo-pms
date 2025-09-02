import fetchCompanyDetails from "../utils/loadCompanyInfo.js";


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
