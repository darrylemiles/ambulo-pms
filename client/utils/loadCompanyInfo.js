const API_BASE_URL = "/api/v1/company-details";

async function fetchCompanyDetails() {
  try {
    const res = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) throw new Error("Failed to fetch company details");
    const data = await res.json();
    return data; 
  } catch (err) {
    console.error("Error fetching company details:", err);
    return null;
  }
}

export default fetchCompanyDetails;