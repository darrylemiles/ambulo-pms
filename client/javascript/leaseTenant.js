document.addEventListener("DOMContentLoaded", async function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.user_id) return;

  const res = await fetch(`/api/v1/leases/user/${user.user_id}`);
  const data = await res.json();
  const leases = Array.isArray(data) ? data : data.leases || [];

  renderOverview(user, leases);
  renderProperties(leases);
});

function renderOverview(user, leases) {
  const grid = document.querySelector(".overview-grid");
  if (!grid) return;

  const activeLeases = leases.filter((l) => l.lease_status === "ACTIVE").length;
  const nextLease = leases.sort(
    (a, b) => new Date(a.lease_end_date) - new Date(b.lease_end_date)
  )[0];
  const nextDate = nextLease ? new Date(nextLease.lease_end_date) : null;

  grid.innerHTML = `
    <div class="overview-card">
      <h3>Tenant Name</h3>
      <div class="value">${user.first_name} ${user.last_name}</div>
      <div class="subtitle">Primary Account</div>
    </div>
    <div class="overview-card">
      <h3>Active Leases</h3>
      <div class="value">${activeLeases}</div>
      <div class="subtitle">Currently Active</div>
    </div>
    <div class="overview-card">
      <h3>Total Properties</h3>
      <div class="value">${leases.length}</div>
      <div class="subtitle">Under Management</div>
    </div>
    <div class="overview-card">
      <h3>Next Payment</h3>
      <div class="value">${nextDate ? nextDate.toLocaleDateString() : "-"}</div>
      <div class="subtitle">${
        nextDate ? nextDate.getFullYear() + " - Due Soon" : ""
      }</div>
    </div>
  `;
}

function renderProperties(leases) {
  const container = document.getElementById("propertiesContainer");
  if (!container) return;

  container.innerHTML = `<h2 class="section-title">My Leased Spaces</h2>`;

  leases.forEach((lease) => {
    container.innerHTML += `
      <div class="property-card">
        <div class="property-image-container">
                  <img src="${lease.display_image || "/default-property.jpg"}"
             alt="${lease.property_name}"
             class="property-image"
             onerror="this.onerror=null;this.src='/default-property.jpg';">
        </div>
        <div class="property-content">
          <div class="property-header">
            <div>
              <div class="property-title">${lease.property_name}</div>
              <div class="property-address">${
                lease.property_address || ""
              }</div>
            </div>
            <div class="property-status status-${lease.lease_status.toLowerCase()}">${
      lease.lease_status
    }</div>
          </div>
          <div class="property-details">
            <div class="detail-item"><div class="detail-label">Monthly Rent</div><div class="detail-value price">₱${Number(
              lease.monthly_rent
            ).toLocaleString()}</div></div>
            <div class="detail-item"><div class="detail-label">Lease Start</div><div class="detail-value">${new Date(
              lease.lease_start_date
            ).toLocaleDateString()}</div></div>
            <div class="detail-item"><div class="detail-label">Lease End</div><div class="detail-value">${new Date(
              lease.lease_end_date
            ).toLocaleDateString()}</div></div>
          </div>
          <div class="contract-section">
            <div class="contract-header">
              <div class="contract-title">Lease Contract #${
                lease.lease_id
              }</div>
              <div class="contract-actions">
                <button class="btn btn-primary" onclick="viewContract('${
                  lease.lease_id
                }')">View Contract</button>
                <button class="btn btn-secondary" onclick="viewPayments('${
                  lease.lease_id
                }')">View Payments</button>
              </div>
            </div>
            <div class="contract-details">
              <div class="contract-item"><div class="contract-label">Security Deposit</div><div class="contract-value highlight">₱${Number(
                lease.security_deposit_months * lease.monthly_rent
              ).toLocaleString()}</div></div>
              <div class="contract-item"><div class="contract-label">Next Payment Due</div><div class="contract-value highlight">${new Date(
                lease.lease_end_date
              ).toLocaleDateString()}</div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

function viewContract(contractId) {
  const contract = contracts[contractId];
  if (!contract) return;

  const modal = document.getElementById("contractModal");
  const title = document.getElementById("contractModalTitle");
  const content = document.getElementById("contractContent");

  title.textContent = contract.title;

  let html = `<p style="margin-bottom: 2rem; color: #6b7280; font-size: 16px;"><strong>Property:</strong> ${contract.property}</p>`;

  contract.terms.forEach((term) => {
    html += `
                    <div class="term-item">
                        <span class="term-label">${term.label}:</span>
                        <span class="term-value">${term.value}</span>
                    </div>
                `;
  });

  content.innerHTML = html;
  modal.style.display = "block";
}

function viewPayments(contractId) {
  const contract = contracts[contractId];
  if (!contract) return;

  const modal = document.getElementById("paymentModal");
  const title = document.getElementById("paymentModalTitle");
  const content = document.getElementById("paymentContent");

  title.textContent = `Payment Schedule - ${contractId}`;

  let html = "";
  contract.payments.forEach((payment) => {
    const statusClass =
      payment.status === "paid" ? "payment-paid" : "payment-pending";
    const statusText = payment.status === "paid" ? "Paid" : "Pending";
    const itemClass = payment.status === "paid" ? "paid" : "pending";

    html += `
                    <div class="payment-item ${itemClass}">
                        <div class="payment-date">${payment.date}</div>
                        <div class="payment-amount">${payment.amount}</div>
                        <div class="payment-status ${statusClass}">${statusText}</div>
                    </div>
                `;
  });

  content.innerHTML = html;
  modal.style.display = "block";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
  const contractModal = document.getElementById("contractModal");
  const paymentModal = document.getElementById("paymentModal");

  if (event.target === contractModal) {
    contractModal.style.display = "none";
  }
  if (event.target === paymentModal) {
    paymentModal.style.display = "none";
  }
};

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (modal.style.display === "block") {
        modal.style.display = "none";
      }
    });
  }
});

// Add smooth scrolling for navigation links
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});
