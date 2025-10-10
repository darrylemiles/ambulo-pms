const CACHE_KEY = "contactFaqs";
const FORCE_REFRESH_KEY = "forceRefreshFaqs";
const API_URL = "/api/v1/faqs/";

async function fetchFaqs(forceRefresh = false) {
  if (forceRefresh || sessionStorage.getItem(FORCE_REFRESH_KEY) === "true") {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(FORCE_REFRESH_KEY);
  }

  let faqs = null;
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      faqs = JSON.parse(cached);
      console.log("FAQs: loaded from cache");
    } catch {
      sessionStorage.removeItem(CACHE_KEY);
    }
  }
  if (!faqs) {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      faqs = Array.isArray(data.message) ? data.message : [];
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(faqs));
      console.log("FAQs: fetched from API");
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
      return [];
    }
  }
  return faqs;
}

function clearFaqsCache() {
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.setItem(FORCE_REFRESH_KEY, "true");
}

export {
    fetchFaqs,
    clearFaqsCache
}