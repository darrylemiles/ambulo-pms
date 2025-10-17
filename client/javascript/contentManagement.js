import fetchCompanyDetails from "../api/loadCompanyInfo.js";

const appState = {
    currentCategory: null,
    isLoading: false,
};

document.addEventListener("DOMContentLoaded", function () {
    initializeApp();
    setDynamicInfo();
});

function initializeApp() {
    setupEventListeners();
    initializeSearch();
    loadUserData();
}

async function setDynamicInfo() {
    const company = await fetchCompanyDetails();
    if (!company) return;

    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && company.icon_logo_url) {
        favicon.href = company.icon_logo_url;
    }

    document.title = company.company_name
        ? `Content Management - ${company.company_name}`
        : "Content Management";
}

function setupEventListeners() { }

function initializeSearch() { }

function navigateToCategory(event, category) {
    const card = event.currentTarget;

    card.style.opacity = "0.7";
    card.style.transform = "scale(0.98)";

    appState.currentCategory = category;
    showNotification(`Navigating to ${category.replace("-", " ")}...`, "info");

    const categoryUrls = {
        "company-information": "/company-information.html",
        "building-addresses": "/building-addresses.html",
        faqs: "/FAQs.html",
        "website-content": "/website-content.html",
    };

    const targetUrl = categoryUrls[category];

    if (targetUrl) {
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 500);
    } else {
        const href = card.getAttribute("href");
        if (href && href !== "#") {
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        } else {
            setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "scale(1)";
                showNotification(`Page for ${category} not found`, "error");
            }, 500);
        }
    }
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("show");
    }, 100);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function loadUserData() { }

const CMS = {
    navigateToCategory: function (category) {
        const categoryUrls = {
            "company-information": "/company-information.html",
            "building-addresses": "/building-addresses.html",
            faqs: "/FAQs.html",
            "website-content": "/website-content.html",
        };

        const appState = {
            currentCategory: null,
            isLoading: false,
        };

        document.addEventListener("DOMContentLoaded", function () {
            initializeApp();
        });

        function initializeApp() {
            setupEventListeners();

            initializeSearch();
            loadUserData();
        }

        function setupEventListeners() {
            document.querySelectorAll(".category-card").forEach((card) => {
                card.addEventListener("click", function (e) {
                    const category = this.dataset.category || "unknown";
                    navigateToCategory(e, category);
                });
            });
        }

        function initializeSearch() { }

        function navigateToCategory(event, category) {
            const card = event.currentTarget;

            card.style.opacity = "0.7";
            card.style.transform = "scale(0.98)";

            appState.currentCategory = category;

            showNotification(
                `Navigating to ${category.replace("-", " ")}...`,
                "info"
            );

            setTimeout(() => {
                window.location.href = card.href;
            }, 300);
        }

        function showNotification(message, type = "info") {
            const notification = document.createElement("div");
            notification.className = `notification ${type}`;
            notification.textContent = message;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add("show");
            }, 100);

            setTimeout(() => {
                notification.classList.remove("show");
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        function loadUserData() { }

        const CMS = {
            navigateToCategory: function (category) {
                const categoryUrls = {
                    "company-information": "/company-information.html",
                    "building-addresses": "/building-addresses.html",
                    faqs: "/FAQs.html",
                    "lease-terms": "/lease-terms-cms.html",
                };

                const targetUrl = categoryUrls[category];
                if (targetUrl) {
                    window.location.href = targetUrl;
                }
            },

            getCategoryData: async function (category) {
                try {
                    const response = await fetch(`/api/categories/${category}`);
                    if (!response.ok) throw new Error("Failed to fetch category data");
                    return await response.json();
                } catch (error) {
                    console.error("CMS Error:", error);
                    throw error;
                }
            },

            logActivity: function (action, details) { },
        };

        window.ListingsCMS = {
            appState,
            navigateToCategory,
            CMS,
            showNotification,
        };
    },
};
