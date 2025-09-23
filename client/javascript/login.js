import fetchCompanyDetails from "../api/loadCompanyInfo.js";

// API Configuration
const API_BASE_URL = "/api/v1/users";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const passwordField = document.getElementById("passwordField");
  const toggleButton = document.getElementById("toggleButton");
  const toggleIcon = document.getElementById("toggleIcon");

  toggleButton.addEventListener("click", function () {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      toggleIcon.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
      passwordField.type = "password";
      toggleIcon.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
  });

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Response is not JSON:", await response.text());
        alert("Server error - please try again");
        return;
      }

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "ADMIN") {
          window.location.href = "adminDashboard.html";
        } else {
          window.location.href = "tenantDashboard.html";
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  });
});

async function setDynamicCompanyDetails() {
  const data = await fetchCompanyDetails();
  if(!data || !data[0]) return;
  const companyDetails = data[0];

  // Brand name
  const brandName = document.getElementById("dynamic-company-name");
  if (brandName) brandName.textContent = companyDetails.company_name || "Your Company";

  // Brand desc
  const brandDesc = document.getElementById("dynamic-company-desc");
  if (brandDesc) brandDesc.textContent = companyDetails.business_desc || "Your trusted partner in property management.";

  // Login icon
  const logoImg = document.getElementById("dynamic-logo");
  if (logoImg) logoImg.src = companyDetails.icon_logo_url || "/assets/logo-property.png";

  // Tab icon
  const favicon = document.getElementById("dynamic-favicon");
  if (favicon) favicon.href = companyDetails.icon_logo_url || "/assets/logo-property.png";

  // Tab title
  document.title = `${companyDetails.company_name || "Ambulo Properties"} Login`;

}

document.addEventListener("DOMContentLoaded", setDynamicCompanyDetails);