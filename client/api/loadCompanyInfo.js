const API_BASE_URL = "/api/v1/company-details";

async function fetchCompanyDetails() {
  const forceRefresh = sessionStorage.getItem("companyDetailsForceRefresh") === "true";
  const cached = sessionStorage.getItem("companyDetails");
  if (cached && !forceRefresh) {
    try {
      const data = JSON.parse(cached);
      const company = data[0] || data;
      const logoHtml = company.icon_logo_url
        ? `<img src="${company.icon_logo_url}" alt="Company Logo" class="company-logo" />`
        : "";
      const altLogoHtml = company.alt_logo_url
        ? `<img src="${company.alt_logo_url}" alt="Alternate Company Logo" class="company-alt-logo" />`
        : "";
      return { ...company, logoHtml, altLogoHtml };
    } catch {
      sessionStorage.removeItem("companyDetails");
    }
  }
  if (forceRefresh) {
    sessionStorage.removeItem("companyDetailsForceRefresh");
  }
  try {
    const res = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) throw new Error("Failed to fetch company details");
    const data = await res.json();
    sessionStorage.setItem("companyDetails", JSON.stringify(data));
    const company = data[0] || data;
    const logoHtml = company.icon_logo_url
      ? `<img src="${company.icon_logo_url}" alt="Company Logo" class="company-logo" />`
      : "";
    const altLogoHtml = company.alt_logo_url
      ? `<img src="${company.alt_logo_url}" alt="Alternate Company Logo" class="company-alt-logo" />`
      : "";
    return { ...company, logoHtml, altLogoHtml };
  } catch (err) {
    console.error("Error fetching company details:", err);
    return null;
  }
}

export default fetchCompanyDetails;