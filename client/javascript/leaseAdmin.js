import fetchCompanyDetails from "../utils/loadCompanyInfo.js";

async function setDynamicInfo() {
  const company = await fetchCompanyDetails();
  if (!company) return;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  document.title = company.company_name
    ? `Manage Leases - ${company.company_name}`
    : "Manage Leases";
}

document.addEventListener("DOMContentLoaded", () => {
  setDynamicInfo();
});

class LeaseManager {
  constructor() {
    this.leases = this.getInitialData();
    this.currentLease = null;
    this.editMode = false;
    this.leaseIdCounter = Math.max(
      ...this.leases.map((l) => parseInt(l.id.replace("LSE", ""))),
      0
    );
    this.uploadedFiles = [];
    this.tenantNames = {
      1: "John Smith",
      2: "Sarah Johnson",
      3: "Mike Davis",
      4: "Lisa Wilson",
      5: "Robert Chen",
    };
    this.propertyNames = {
      1: "Sunset Apartments - Unit 2A",
      2: "Downtown Plaza - Office 301",
      3: "Garden View Complex - Unit 1B",
      4: "Ocean Breeze Tower - Unit 5C",
      5: "City Center Mall - Shop 12",
    };
  }

  getInitialData() {
    return [
      {
        id: "LSE001",
        tenantId: 1,
        tenantName: "John Smith",
        propertyId: 1,
        propertyName: "Sunset Apartments - Unit 2A",
        startDate: "2024-01-15",
        endDate: "2024-12-15",
        status: "ACTIVE",
        monthlyRent: 25000,
        paymentFrequency: "Monthly",
        quarterlyTax: 5,
        securityDeposit: 2,
        advancePayment: 1,
        lateFee: 10,
        gracePeriod: 5,
        isSecurityRefundable: true,
        advanceForfeited: false,
        autoTerminationMonths: 3,
        terminationTriggerDays: 61,
        noticeCancelDays: 30,
        noticeRenewalDays: 60,
        rentIncreaseRenewal: 5,
        notes:
          "Reliable tenant with excellent payment history. Property includes parking space.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "LSE002",
        tenantId: 2,
        tenantName: "Sarah Johnson",
        propertyId: 2,
        propertyName: "Downtown Plaza - Office 301",
        startDate: "2023-06-01",
        endDate: "2024-05-31",
        status: "EXPIRED",
        monthlyRent: 45000,
        paymentFrequency: "Monthly",
        quarterlyTax: 7,
        securityDeposit: 3,
        advancePayment: 2,
        lateFee: 15,
        gracePeriod: 7,
        isSecurityRefundable: true,
        advanceForfeited: true,
        autoTerminationMonths: 2,
        terminationTriggerDays: 61,
        noticeCancelDays: 60,
        noticeRenewalDays: 90,
        rentIncreaseRenewal: 8,
        notes:
          "Commercial lease for small business. Needs renewal discussion for extension.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "LSE003",
        tenantId: 3,
        tenantName: "Mike Davis",
        propertyId: 3,
        propertyName: "Garden View Complex - Unit 1B",
        startDate: "2024-03-01",
        endDate: "2025-02-28",
        status: "ACTIVE",
        monthlyRent: 18000,
        paymentFrequency: "Monthly",
        quarterlyTax: 4,
        securityDeposit: 2,
        advancePayment: 1,
        lateFee: 8,
        gracePeriod: 3,
        isSecurityRefundable: true,
        advanceForfeited: false,
        autoTerminationMonths: 3,
        terminationTriggerDays: 61,
        noticeCancelDays: 30,
        noticeRenewalDays: 45,
        rentIncreaseRenewal: 3,
        notes:
          "First-time renter, requires occasional follow-up on payment schedules.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  getAllLeases() {
    return [...this.leases];
  }

  getLeaseById(id) {
    return this.leases.find((lease) => lease.id === id);
  }

  addLease(leaseData) {
    this.leaseIdCounter++;
    const newLease = {
      ...leaseData,
      id: `LSE${String(this.leaseIdCounter).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.leases.push(newLease);
    return newLease;
  }

  updateLease(id, leaseData) {
    const index = this.leases.findIndex((lease) => lease.id === id);
    if (index !== -1) {
      this.leases[index] = {
        ...leaseData,
        id,
        createdAt: this.leases[index].createdAt,
        updatedAt: new Date().toISOString(),
      };
      return this.leases[index];
    }
    return null;
  }

  deleteLease(id) {
    const index = this.leases.findIndex((lease) => lease.id === id);
    if (index !== -1) {
      const deleted = this.leases.splice(index, 1)[0];
      return deleted;
    }
    return null;
  }

  filterLeases(filters) {
    return this.leases.filter((lease) => {
      if (filters.status && lease.status !== filters.status) return false;
      if (
        filters.tenant &&
        !lease.tenantName.toLowerCase().includes(filters.tenant.toLowerCase())
      )
        return false;
      if (
        filters.property &&
        !lease.propertyName
          .toLowerCase()
          .includes(filters.property.toLowerCase())
      )
        return false;
      if (filters.date) {
        const filterDate = new Date(filters.date);
        const startDate = new Date(lease.startDate);
        const endDate = new Date(lease.endDate);
        if (filterDate < startDate || filterDate > endDate) return false;
      }
      return true;
    });
  }
}

// Initialize the system
const leaseManager = new LeaseManager();
let deleteLeaseId = null;

// Navigation Functions
function showListView() {
  document.getElementById("listView").classList.remove("hidden");
  document.getElementById("formView").classList.add("hidden");
  document.getElementById("detailView").classList.add("hidden");
  loadLeaseTable();
}

function showCreateView() {
  document.getElementById("listView").classList.add("hidden");
  document.getElementById("formView").classList.remove("hidden");
  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("formTitle").textContent = "Create New Lease";
  leaseManager.editMode = false;
  clearForm();
  clearErrors();
  showTab("details");
}

function showDetailView(leaseId) {
  const lease = leaseManager.getLeaseById(leaseId);
  if (!lease) {
    showToast("Lease not found", "error");
    return;
  }

  document.getElementById("listView").classList.add("hidden");
  document.getElementById("formView").classList.add("hidden");
  document.getElementById("detailView").classList.remove("hidden");
  leaseManager.currentLease = lease;
  loadDetailView(lease);
}

function showEditView(leaseId) {
  const lease = leaseManager.getLeaseById(leaseId);
  if (!lease) {
    showToast("Lease not found", "error");
    return;
  }

  document.getElementById("listView").classList.add("hidden");
  document.getElementById("formView").classList.remove("hidden");
  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("formTitle").textContent = "Edit Lease";
  leaseManager.editMode = true;
  leaseManager.currentLease = lease;
  loadForm(lease);
  clearErrors();
  showTab("details");
}

// Tab Management
function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.add("hidden");
  });

  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab content
  document.getElementById(tabName + "Tab").classList.remove("hidden");

  // Add active class to clicked tab button
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

// Initialize tab event listeners
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");
      showTab(tabName);
    });
  });

  // Set up file input handler
  document
    .getElementById("fileInput")
    .addEventListener("change", handleFileSelection);

  showListView();
});

// Form Validation
function validateForm() {
  let isValid = true;
  clearErrors();

  const requiredFields = [
    { id: "tenantId", message: "Please select a tenant" },
    { id: "propertyId", message: "Please select a property" },
    { id: "startDate", message: "Please enter a start date" },
    { id: "endDate", message: "Please enter an end date" },
    { id: "monthlyRent", message: "Please enter monthly rent amount" },
  ];

  requiredFields.forEach((field) => {
    const element = document.getElementById(field.id);
    const value = element.value.trim();

    if (!value) {
      showError(field.id, field.message);
      isValid = false;
    }
  });

  // Validate date range
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);

  if (startDate && endDate && startDate >= endDate) {
    showError("endDate", "End date must be after start date");
    isValid = false;
  }

  // Validate monthly rent
  const monthlyRent = parseFloat(document.getElementById("monthlyRent").value);
  if (monthlyRent && monthlyRent <= 0) {
    showError("monthlyRent", "Monthly rent must be greater than 0");
    isValid = false;
  }

  return isValid;
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(fieldId + "-error");

  field.classList.add("error");
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearErrors() {
  document
    .querySelectorAll(".error-message")
    .forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".form-input, .form-select").forEach((field) => {
    field.classList.remove("error");
  });
}

// Data Loading and Display
function loadLeaseTable() {
  const tableBody = document.getElementById("leaseTableBody");
  const emptyState = document.getElementById("emptyState");
  const leases = getFilteredLeases();

  tableBody.innerHTML = "";

  if (leases.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  leases.forEach((lease) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>
                        <strong style="color: #1f2937; font-weight: 700;">${
                          lease.id
                        }</strong>
                    </td>
                    <td>
                        <div style="font-weight: 600; color: #111827;">${
                          lease.tenantName
                        }</div>
                        <div style="font-size: 12px; color: #6b7280;">ID: ${
                          lease.tenantId
                        }</div>
                    </td>
                    <td>
                        <div style="font-weight: 500; color: #111827;">${
                          lease.propertyName
                        }</div>
                        <div style="font-size: 12px; color: #6b7280;">Property ID: ${
                          lease.propertyId
                        }</div>
                    </td>
                    <td>
                        <div style="font-size: 13px; font-weight: 500;">${formatDate(
                          lease.startDate
                        )}</div>
                        <div style="font-size: 12px; color: #6b7280;">to ${formatDate(
                          lease.endDate
                        )}</div>
                        <div style="font-size: 11px; color: #9ca3af;">${getDuration(
                          lease.startDate,
                          lease.endDate
                        )}</div>
                    </td>
                    <td>
                        <span class="status-badge status-${lease.status.toLowerCase()}">${
      lease.status
    }</span>
                    </td>
                    <td>
                        <div style="font-weight: 700; color: #059669; font-size: 16px;">₱${lease.monthlyRent.toLocaleString()}</div>
                        <div style="font-size: 12px; color: #6b7280;">${
                          lease.paymentFrequency
                        }</div>
                    </td>
                    <td>
                        <div style="font-weight: 500;">${getNextDueDate(
                          lease
                        )}</div>
                    </td>
                    <td>
                        <button class="action-btn action-view" onclick="showDetailView('${
                          lease.id
                        }')" title="View Details"><i class="fa-solid fa-eye"></i></button>
                        <button class="action-btn action-edit" onclick="showEditView('${
                          lease.id
                        }')" title="Edit Lease"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn action-delete" onclick="showDeleteModal('${
                          lease.id
                        }')" title="Delete Lease"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

function getFilteredLeases() {
  const filters = {
    status: document.getElementById("filterStatus").value,
    tenant: document.getElementById("filterTenant").value,
    property: document.getElementById("filterProperty").value,
    date: document.getElementById("filterDate").value,
  };

  return leaseManager.filterLeases(filters);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.round(diffDays / 30);
  return months > 1 ? `${months} months` : `${diffDays} days`;
}

function getNextDueDate(lease) {
  const today = new Date();
  const endDate = new Date(lease.endDate);

  if (today > endDate) return '<span style="color: #ef4444;">Expired</span>';
  if (lease.status !== "ACTIVE")
    return '<span style="color: #6b7280;">N/A</span>';

  const startDay = new Date(lease.startDate).getDate();
  let nextDue = new Date(today.getFullYear(), today.getMonth(), startDay);

  // If we've passed this month's due date, move to next month
  if (today.getDate() > startDay) {
    nextDue.setMonth(nextDue.getMonth() + 1);
  }

  return formatDate(nextDue.toISOString().split("T")[0]);
}

// Form Management
function loadForm(lease) {
  document.getElementById("tenantId").value = lease.tenantId || "";
  document.getElementById("propertyId").value = lease.propertyId || "";
  document.getElementById("startDate").value = lease.startDate || "";
  document.getElementById("endDate").value = lease.endDate || "";
  document.getElementById("status").value = lease.status || "PENDING";
  document.getElementById("monthlyRent").value = lease.monthlyRent || "";
  document.getElementById("paymentFrequency").value =
    lease.paymentFrequency || "Monthly";
  document.getElementById("quarterlyTax").value = lease.quarterlyTax || "";
  document.getElementById("securityDeposit").value =
    lease.securityDeposit || "";
  document.getElementById("advancePayment").value = lease.advancePayment || "";
  document.getElementById("lateFee").value = lease.lateFee || "";
  document.getElementById("gracePeriod").value = lease.gracePeriod || "";
  document.getElementById("isSecurityRefundable").checked =
    lease.isSecurityRefundable !== false;
  document.getElementById("advanceForfeited").checked =
    lease.advanceForfeited === true;
  document.getElementById("autoTerminationMonths").value =
    lease.autoTerminationMonths || "";
  document.getElementById("terminationTriggerDays").value =
    lease.terminationTriggerDays || 61;
  document.getElementById("noticeCancelDays").value =
    lease.noticeCancelDays || "";
  document.getElementById("noticeRenewalDays").value =
    lease.noticeRenewalDays || "";
  document.getElementById("rentIncreaseRenewal").value =
    lease.rentIncreaseRenewal || "";
  document.getElementById("notes").value = lease.notes || "";
}

function clearForm() {
  document.getElementById("tenantId").value = "";
  document.getElementById("propertyId").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("status").value = "PENDING";
  document.getElementById("monthlyRent").value = "";
  document.getElementById("paymentFrequency").value = "Monthly";
  document.getElementById("quarterlyTax").value = "";
  document.getElementById("securityDeposit").value = "";
  document.getElementById("advancePayment").value = "";
  document.getElementById("lateFee").value = "";
  document.getElementById("gracePeriod").value = "";
  document.getElementById("isSecurityRefundable").checked = true;
  document.getElementById("advanceForfeited").checked = false;
  document.getElementById("autoTerminationMonths").value = "";
  document.getElementById("terminationTriggerDays").value = "61";
  document.getElementById("noticeCancelDays").value = "";
  document.getElementById("noticeRenewalDays").value = "";
  document.getElementById("rentIncreaseRenewal").value = "";
  document.getElementById("notes").value = "";
  leaseManager.uploadedFiles = [];
  updateUploadedFilesList();
}

function saveLease() {
  if (!validateForm()) {
    showToast("Please correct the errors in the form", "error");
    return;
  }

  const saveBtn = document.getElementById("saveBtn");
  const saveText = document.getElementById("saveText");

  // Show loading state
  saveBtn.disabled = true;
  saveText.textContent = "Saving...";

  setTimeout(() => {
    const formData = {
      tenantId: parseInt(document.getElementById("tenantId").value),
      tenantName:
        leaseManager.tenantNames[document.getElementById("tenantId").value],
      propertyId: parseInt(document.getElementById("propertyId").value),
      propertyName:
        leaseManager.propertyNames[document.getElementById("propertyId").value],
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      status: document.getElementById("status").value,
      monthlyRent: parseFloat(document.getElementById("monthlyRent").value),
      paymentFrequency: document.getElementById("paymentFrequency").value,
      quarterlyTax:
        parseFloat(document.getElementById("quarterlyTax").value) || 0,
      securityDeposit:
        parseInt(document.getElementById("securityDeposit").value) || 0,
      advancePayment:
        parseInt(document.getElementById("advancePayment").value) || 0,
      lateFee: parseFloat(document.getElementById("lateFee").value) || 0,
      gracePeriod: parseInt(document.getElementById("gracePeriod").value) || 0,
      isSecurityRefundable: document.getElementById("isSecurityRefundable")
        .checked,
      advanceForfeited: document.getElementById("advanceForfeited").checked,
      autoTerminationMonths:
        parseInt(document.getElementById("autoTerminationMonths").value) || 0,
      terminationTriggerDays:
        parseInt(document.getElementById("terminationTriggerDays").value) || 61,
      noticeCancelDays:
        parseInt(document.getElementById("noticeCancelDays").value) || 0,
      noticeRenewalDays:
        parseInt(document.getElementById("noticeRenewalDays").value) || 0,
      rentIncreaseRenewal:
        parseFloat(document.getElementById("rentIncreaseRenewal").value) || 0,
      notes: document.getElementById("notes").value,
      uploadedFiles: [...leaseManager.uploadedFiles],
    };

    try {
      if (leaseManager.editMode && leaseManager.currentLease) {
        leaseManager.updateLease(leaseManager.currentLease.id, formData);
        showToast("Lease updated successfully!");
      } else {
        leaseManager.addLease(formData);
        showToast("New lease created successfully!");
      }

      showListView();
    } catch (error) {
      showToast("Error saving lease. Please try again.", "error");
      console.error("Save error:", error);
    } finally {
      // Reset button state
      saveBtn.disabled = false;
      saveText.textContent = "Save Lease";
    }
  }, 800); // Simulate processing time
}

function cancelForm() {
  const hasUnsavedChanges = checkForUnsavedChanges();

  if (hasUnsavedChanges) {
    showCancelModal();
  } else {
    // No changes made, just go back immediately
    resetFormState();
    showListView();
  }
}

function showCancelModal() {
  const modal = document.getElementById("cancelModal");
  const message = document.getElementById("cancelModalMessage");

  if (leaseManager.editMode) {
    message.textContent =
      "Are you sure you want to cancel editing this lease? Any unsaved changes will be lost.";
  } else {
    message.textContent =
      "Are you sure you want to cancel creating this lease? Any entered data will be lost.";
  }

  modal.classList.add("show");
}

function hideCancelModal() {
  document.getElementById("cancelModal").classList.remove("show");
}

function confirmCancel() {
  resetFormState();
  showListView();
  hideCancelModal();
  showToast("Changes discarded successfully");
}

function checkForUnsavedChanges() {
  // Check if any form fields have been modified
  const formFields = [
    "tenantId",
    "propertyId",
    "startDate",
    "endDate",
    "status",
    "monthlyRent",
    "paymentFrequency",
    "quarterlyTax",
    "securityDeposit",
    "advancePayment",
    "lateFee",
    "gracePeriod",
    "autoTerminationMonths",
    "terminationTriggerDays",
    "noticeCancelDays",
    "noticeRenewalDays",
    "rentIncreaseRenewal",
    "notes",
  ];

  return (
    formFields.some((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field.type === "checkbox") {
        return field.checked !== field.defaultChecked;
      }
      return field.value !== field.defaultValue;
    }) || leaseManager.uploadedFiles.length > 0
  );
}

function resetFormState() {
  // Clear form data
  clearForm();
  clearErrors();

  // Reset manager state
  leaseManager.editMode = false;
  leaseManager.currentLease = null;
  leaseManager.uploadedFiles = [];

  // Reset form title
  document.getElementById("formTitle").textContent = "Create New Lease";
}

// Detail View Functions
function loadDetailView(lease) {
  document.getElementById("detailTitle").textContent = `Lease ${lease.id}`;
  document.getElementById(
    "detailSubtitle"
  ).textContent = `${lease.tenantName} • ${lease.propertyName}`;

  // Basic Info
  document.getElementById("basicInfo").innerHTML = `
                <div class="info-item">
                    <div class="info-label">Lease ID</div>
                    <div class="info-value">${lease.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                        <span class="status-badge status-${lease.status.toLowerCase()}">${
    lease.status
  }</span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tenant</div>
                    <div class="info-value">${lease.tenantName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Property</div>
                    <div class="info-value">${lease.propertyName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Start Date</div>
                    <div class="info-value">${formatDate(lease.startDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">End Date</div>
                    <div class="info-value">${formatDate(lease.endDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Duration</div>
                    <div class="info-value">${getDuration(
                      lease.startDate,
                      lease.endDate
                    )}</div>
                </div>
            `;

  // Financial Info
  document.getElementById("financialInfo").innerHTML = `
                <div class="info-item">
                    <div class="info-label">Monthly Rent</div>
                    <div class="info-value" style="font-size: 20px; font-weight: 700; color: #059669;">
                        ₱${lease.monthlyRent.toLocaleString()}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Payment Frequency</div>
                    <div class="info-value">${lease.paymentFrequency}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Quarterly Tax</div>
                    <div class="info-value">${lease.quarterlyTax}%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Security Deposit</div>
                    <div class="info-value">${
                      lease.securityDeposit
                    } month(s)</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Advance Payment</div>
                    <div class="info-value">${
                      lease.advancePayment
                    } month(s)</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Late Fee</div>
                    <div class="info-value">${lease.lateFee}%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Grace Period</div>
                    <div class="info-value">${lease.gracePeriod} days</div>
                </div>
            `;

  // Rules Info
  document.getElementById("rulesInfo").innerHTML = `
                <div class="info-item">
                    <div class="info-label">Security Refundable</div>
                    <div class="info-value">${
                      lease.isSecurityRefundable ? "Yes" : "No"
                    }</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Advance Forfeited</div>
                    <div class="info-value">${
                      lease.advanceForfeited ? "Yes" : "No"
                    }</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Auto-Termination</div>
                    <div class="info-value">${
                      lease.autoTerminationMonths
                    } month(s)</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Termination Trigger</div>
                    <div class="info-value">${
                      lease.terminationTriggerDays
                    } days</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Cancel Notice</div>
                    <div class="info-value">${lease.noticeCancelDays} days</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Renewal Notice</div>
                    <div class="info-value">${
                      lease.noticeRenewalDays
                    } days</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Rent Increase</div>
                    <div class="info-value">${lease.rentIncreaseRenewal}%</div>
                </div>
            `;

  // Update payment info in sidebar
  document.getElementById("nextDueDate").textContent = getNextDueDate(
    lease
  ).replace(/<[^>]*>/g, "");
  document.getElementById(
    "amountDue"
  ).textContent = `₱${lease.monthlyRent.toLocaleString()}`;

  // Show/hide notes card
  const notesCard = document.getElementById("notesCard");
  const leaseNotes = document.getElementById("leaseNotes");

  if (lease.notes && lease.notes.trim()) {
    leaseNotes.textContent = lease.notes;
    notesCard.style.display = "block";
  } else {
    notesCard.style.display = "none";
  }
}

function editCurrentLease() {
  if (leaseManager.currentLease) {
    showEditView(leaseManager.currentLease.id);
  }
}

// Filter Functions
function applyFilters() {
  loadLeaseTable();
}

function clearFilters() {
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterTenant").value = "";
  document.getElementById("filterProperty").value = "";
  document.getElementById("filterDate").value = "";
  loadLeaseTable();
}

// Modal Functions
function showDeleteModal(leaseId) {
  deleteLeaseId = leaseId;
  document.getElementById("deleteModal").classList.add("show");
}

function hideDeleteModal() {
  deleteLeaseId = null;
  document.getElementById("deleteModal").classList.remove("show");
}

function confirmDelete() {
  if (deleteLeaseId) {
    const deletedLease = leaseManager.deleteLease(deleteLeaseId);
    if (deletedLease) {
      showToast("Lease deleted successfully");
      loadLeaseTable();
    } else {
      showToast("Error deleting lease", "error");
    }
  }
  hideDeleteModal();
}

// File Upload Functions
function handleFileUpload() {
  document.getElementById("fileInput").click();
}

function handleFileSelection(event) {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      showToast("File size should be less than 10MB", "error");
      return;
    }

    leaseManager.uploadedFiles.push({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      uploadDate: new Date().toISOString(),
    });
  });

  updateUploadedFilesList();
  event.target.value = ""; // Reset input
}

function updateUploadedFilesList() {
  const container = document.getElementById("uploadedFiles");

  if (leaseManager.uploadedFiles.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = leaseManager.uploadedFiles
    .map(
      (file, index) => `
                <div class="file-item">
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${file.size}</span>
                    </div>
                    <button class="action-btn action-delete" onclick="removeFile(${index})" title="Remove file">🗑️</button>
                </div>
            `
    )
    .join("");
}

function removeFile(index) {
  leaseManager.uploadedFiles.splice(index, 1);
  updateUploadedFilesList();
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Toast Notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const title = document.getElementById("toastTitle");
  const messageEl = document.getElementById("toastMessage");

  title.textContent = type === "error" ? "Error!" : "Success!";
  messageEl.textContent = message;

  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// Quick Actions (placeholders for demo)
function generateContract() {
  showToast("Contract generation feature coming soon!");
}

function sendReminder() {
  showToast("Payment reminder sent successfully!");
}

function terminateLease() {
  if (confirm("Are you sure you want to terminate this lease?")) {
    showToast("Lease termination process initiated");
  }
}

function viewPaymentHistory() {
  showToast("Payment history feature coming soon!");
}

function viewAllActivity() {
  showToast("Activity log feature coming soon!");
}

function downloadDocument(docType) {
  showToast(`Downloading ${docType}...`);
}

function uploadNewDocument() {
  showToast("Document upload feature coming soon!");
}

// Click outside modal to close
window.addEventListener("click", function (event) {
  const deleteModal = document.getElementById("deleteModal");
  const cancelModal = document.getElementById("cancelModal");

  if (event.target === deleteModal) {
    hideDeleteModal();
  }
  if (event.target === cancelModal) {
    hideCancelModal();
  }
});

// Initialize the application
showListView();
