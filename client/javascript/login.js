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
      const response = await fetch("http://localhost:5000/api/v1/users/login", {
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
