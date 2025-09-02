const API_BASE_URL = "/api/v1/company-details";

async function fetchCompanyDetails() {
  const cached = sessionStorage.getItem("companyDetails");
  if (cached) return JSON.parse(cached);

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
    return data;
  } catch (err) {
    console.error("Error fetching company details:", err);
    return null;
  }
}

export default fetchCompanyDetails;