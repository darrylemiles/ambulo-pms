const CACHE_KEY = "aboutUsData";
const FORCE_REFRESH_KEY = "forceRefreshAboutUs";
const API_URL = "/api/v1/about-us";

async function fetchAboutUsDetails(forceRefresh = false) {
  if (forceRefresh || sessionStorage.getItem(FORCE_REFRESH_KEY) === "true") {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(FORCE_REFRESH_KEY);
  }

  let about = null;
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      about = JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(CACHE_KEY);
    }
  }
  if (!about) {
    try {
      const res = await fetch(API_URL);
      const result = await res.json();
      about = result.data && result.data[0] ? result.data[0] : null;
      if (about) sessionStorage.setItem(CACHE_KEY, JSON.stringify(about));
    } catch (err) {
      console.error("Failed to fetch About Us data:", err);
      return null;
    }
  }
  return about;
}

export default fetchAboutUsDetails;