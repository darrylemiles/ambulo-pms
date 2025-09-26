document.addEventListener("DOMContentLoaded", async function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.user_id) return;

  const res = await fetch(`/api/v1/leases/users/${user.user_id}`);
  const data = await res.json();
  const leases = Array.isArray(data) ? data : data.leases || [];

  window._leases = leases;

  renderOverview(user, leases);
  renderProperties(leases);
});

function renderOverview(user, leases) {
  const grid = document.querySelector(".overview-grid");
  if (!grid) return;

  const activeLeases = leases.filter((l) => l.lease_status === "ACTIVE").length;
  const now = new Date();
  let nextPaymentDate = null;
  leases.forEach(l => {
    const startDate = new Date(l.lease_start_date);
    const endDate = new Date(l.lease_end_date);
    let paymentDate = new Date(startDate);
    let freq = (l.payment_frequency || '').toLowerCase();
    let intervalMonths = 1;
    if (freq.includes('quarter')) intervalMonths = 3;
    else if (freq.includes('semi')) intervalMonths = 6;
    else if (freq.includes('year')) intervalMonths = 12;
    while (paymentDate <= now && paymentDate < endDate) {
      paymentDate.setMonth(paymentDate.getMonth() + intervalMonths);
    }
    if (paymentDate > now && paymentDate < endDate) {
      if (!nextPaymentDate || paymentDate < nextPaymentDate) {
        nextPaymentDate = new Date(paymentDate);
      }
    }
  });

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
      <div class="value">${nextPaymentDate ? nextPaymentDate.toLocaleDateString() : "-"}</div>
      <div class="subtitle">${nextPaymentDate ? nextPaymentDate.getFullYear() + " - Due Soon" : ""}</div>
    </div>
  `;
}

function renderProperties(leases) {
  const container = document.getElementById("propertiesContainer");
  if (!container) return;

  container.innerHTML = `<h2 class="section-title">My Leased Spaces</h2>`;

  leases.forEach((lease) => {
    const addressParts = [lease.building_name, lease.street, lease.city, lease.postal_code, lease.country].filter(Boolean);
    const fullAddress = addressParts.join(", ");

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
              <div class="property-address">${fullAddress}</div>
            </div>
            <div class="property-status status-${lease.lease_status.toLowerCase()}">${lease.lease_status}</div>
          </div>
          <div class="property-details">
            <div class="detail-item"><div class="detail-label">Monthly Rent</div><div class="detail-value price">₱${Number(lease.monthly_rent).toLocaleString()}</div></div>
            <div class="detail-item"><div class="detail-label">Lease Start</div><div class="detail-value">${new Date(lease.lease_start_date).toLocaleDateString()}</div></div>
            <div class="detail-item"><div class="detail-label">Lease End</div><div class="detail-value">${new Date(lease.lease_end_date).toLocaleDateString()}</div></div>
          </div>
          <div class="contract-section">
            <div class="contract-header">
              <div class="contract-title">Lease #${lease.lease_id}</div>
              <div class="contract-actions">
                <button class="btn btn-primary" onclick="viewLeaseDetails('${lease.lease_id}')">View Lease Details</button>
                <button class="btn btn-secondary" onclick="viewPayments('${lease.lease_id}')">View Payments</button>
              </div>
            </div>
            <div class="contract-details">
              <div class="contract-item"><div class="contract-label">Security Deposit</div><div class="contract-value highlight">₱${Number(lease.security_deposit_months * lease.monthly_rent).toLocaleString()}</div></div>
              <div class="contract-item"><div class="contract-label">Next Payment Due</div><div class="contract-value highlight">${new Date(lease.lease_end_date).toLocaleDateString()}</div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

function viewLeaseDetails(leaseId) {
  if (!window._leases) return;
  const lease = window._leases.find((l) => l.lease_id === leaseId);
  if (!lease) return;

  const modal = document.getElementById("contractModal");
  const title = document.getElementById("contractModalTitle");
  const content = document.getElementById("contractContent");

  title.textContent = `Lease Details - ${lease.property_name}`;

  const addressParts = [lease.street, lease.city, lease.postal_code, lease.country].filter(Boolean);
  const fullAddress = addressParts.join(", ");

  let html = `
    <div style="padding: 1rem;">
      <h4 style="margin-bottom: 1rem; color: #44444E;">Property Information</h4>
      <div class="term-item">
        <span class="term-label">Property Name:</span>
        <span class="term-value">${lease.property_name}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Address:</span>
        <span class="term-value">${fullAddress || "N/A"}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Lease Status:</span>
        <span class="term-value">${lease.lease_status}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Lease Period:</span>
        <span class="term-value">${new Date(lease.lease_start_date).toLocaleDateString()} &ndash; ${new Date(lease.lease_end_date).toLocaleDateString()}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Monthly Rent:</span>
        <span class="term-value">₱${Number(lease.monthly_rent).toLocaleString()}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Payment Frequency:</span>
        <span class="term-value">${lease.payment_frequency}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Security Deposit:</span>
        <span class="term-value">${lease.security_deposit_months} month(s)</span>
      </div>
      <div class="term-item">
        <span class="term-label">Advance Payment:</span>
        <span class="term-value">${lease.advance_payment_months} month(s)</span>
      </div>
      <div class="term-item">
        <span class="term-label">Quarterly Tax (%):</span>
        <span class="term-value">${lease.quarterly_tax_percentage || "0.00"}%</span>
      </div>
      <div class="term-item">
        <span class="term-label">Late Fee (%):</span>
        <span class="term-value">${lease.late_fee_percentage || "0.00"}%</span>
      </div>
      <div class="term-item">
        <span class="term-label">Grace Period (days):</span>
        <span class="term-value">${lease.grace_period_days || "0"}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Auto-Termination After (months):</span>
        <span class="term-value">${lease.auto_termination_after_months || "N/A"}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Advance Forfeited on Cancel:</span>
        <span class="term-value">${lease.advance_payment_forfeited_on_cancel ? "Yes" : "No"}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Termination After Nonpayment (days):</span>
        <span class="term-value">${lease.termination_trigger_days || "N/A"}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Notice Before Cancel (days):</span>
        <span class="term-value">${lease.notice_before_cancel_days || "N/A"}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Notice Before Renewal (days):</span>
        <span class="term-value">${lease.notice_before_renewal_days || "N/A"}</span>
      </div>
      <div class="term-item">
        <span class="term-label">Rent Increase on Renewal (%):</span>
        <span class="term-value">${lease.rent_increase_on_renewal || "0.00"}%</span>
      </div>
<!--     <div class="term-item">
        <span class="term-label">Renewal Count:</span>
        <span class="term-value">${lease.renewal_count || "0"}</span>
      </div> -->
      <div class="term-item">
        <span class="term-label">Notes:</span>
        <span class="term-value">${lease.notes || "None"}</span>
      </div>
    </div>
  `;

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

window.viewLeaseDetails = viewLeaseDetails;
window.viewPayments = viewPayments;
window.closeModal = closeModal;