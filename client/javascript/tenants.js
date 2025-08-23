import formatDate from "../utils/formatDate.js";
import formatStatus from "../utils/formatStatus.js"

// Global variables
let tenants = [];
let allTenants = [];
let selectedTenants = new Set();
let currentView = "grid";
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

// API Configuration
const API_BASE_URL = "/api/v1";

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, checking elements...");

  const requiredElements = [
    "gridView",
    "listView", 
    "loadingState",
    "errorState",
    "searchInput",
    "statusFilter",
    "listSelectAll", // Added this
    "bulkActionsBar" // Added this
  ];
  requiredElements.forEach((id) => {
    const element = document.getElementById(id);
    console.log(`Element ${id}:`, element ? "Found" : "Missing");
  });

  loadTenants();
  updateSelectAllButton();
  setupEventListeners();
});

// Load tenants from backend
async function loadTenants(page = 1, filters = {}) {
  if (isLoading) return;

  try {
    isLoading = true;
    showLoadingState();

    const queryParams = new URLSearchParams({
      page: page,
      limit: 12,
      ...filters,
    });

    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("API Response:", result);

    if (result.users) {
      tenants = result.users;
      allTenants = [...tenants];

      if (result.pagination) {
        currentPage = result.pagination.currentPage;
        totalPages = result.pagination.totalPages;
      }

      renderTenants();
      renderPagination();
      hideLoadingState();

      if (tenants.length === 0) {
        showEmptyState();
      }
    } else {
      console.error("No users property in response:", result);
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error loading tenants:", error);
    showErrorState();
  } finally {
    isLoading = false;
  }
}

function renderTenants() {
  if (currentView === "grid") {
    renderGridView();
  } else {
    renderListView();
  }

  // Update selection states after rendering
  updateSelectAllButton();
  updateListSelectAll();
  updateBulkActionsBar(); // Added this
}

// Render grid view
function renderGridView() {
  const container = document.getElementById("gridView");

  if (tenants.length === 0) {
    container.innerHTML = "";
    return;
  }

  const cardsHTML = tenants
    .map((tenant) => {
      const initials = getInitials(tenant.first_name, tenant.last_name);
      const fullName = `${tenant.first_name || ""} ${tenant.last_name || ""}`.trim();
      const isSelected = selectedTenants.has(tenant.user_id);

      const avatarHTML = generateAvatarHTML(tenant);

      return `
        <div class="tenant-card ${isSelected ? "selected" : ""}" data-tenant="${tenant.user_id}">
          <div class="tenant-card-header">
            <div class="tenant-info">
              <div class="tenant-avatar">
                ${avatarHTML}
              </div>
              <div class="tenant-details">
                <h4>${fullName || "No Name"}</h4>
                <p>${tenant.email || "No Email"}</p>
              </div>
            </div>
            <input type="checkbox" class="checkbox" ${isSelected ? "checked" : ""}>
          </div>
          
          <div class="tenant-card-body">
            <div class="tenant-meta-item">
              <span class="label">Phone:</span>
              <span class="value">${tenant.phone_number || "Not provided"}</span>
            </div>
            <div class="tenant-meta-item">
              <span class="label">Business:</span>
              <span class="value">${tenant.business_name || "N/A"}</span>
            </div>
          </div>
          
          <div class="tenant-meta">
            <span class="status-badge status-${(tenant.status || "active").toLowerCase()}">
              ${formatStatus(tenant.status) || "Active"}
            </span>
            <span class="created-date">${formatDate(tenant.created_at)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = cardsHTML;
  setupGridEventListeners();
}

// Render list view
function renderListView() {
  const container = document.getElementById("listContainer");

  if (!container) {
    console.error("❌ listContainer not found in DOM!");
    return;
  }

  if (tenants.length === 0) {
    console.log("No tenants to render");
    container.innerHTML = "";
    return;
  }

  const rowsHTML = tenants
    .map((tenant) => {
      const fullName = `${tenant.first_name || ""} ${tenant.last_name || ""}`.trim();
      const isSelected = selectedTenants.has(tenant.user_id);
      const avatarHTML = generateAvatarHTML(tenant, "small");
      return `
        <div class="tenant-list-item ${isSelected ? "selected" : ""}" data-tenant="${tenant.user_id}">
          <div class="list-col list-col-checkbox">
            <input type="checkbox" class="list-checkbox" ${isSelected ? "checked" : ""}>
          </div>
          <div class="list-col list-col-name">
            <div class="tenant-info">
              <div class="tenant-avatar">
                ${avatarHTML}
              </div>
              <div style="margin-left: 0.5rem;">
                <div style="font-weight: 500;">${fullName || "No Name"}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">${tenant.business_name || ""}</div>
              </div>
            </div>
          </div>
          <div class="list-col list-col-email">${tenant.email || "No Email"}</div>
          <div class="list-col list-col-phone">${tenant.phone_number || "Not provided"}</div>
          <div class="list-col list-col-status">
            <span class="status-badge status-${(tenant.status || "active").toLowerCase()}">
              ${formatStatus ? formatStatus(tenant.status) : tenant.status || "Active"}
            </span>
          </div>
          <div class="list-col list-col-created">${formatDate ? formatDate(tenant.created_at) : tenant.created_at}</div>
          <div class="list-col list-col-actions">
            <button class="action-btn" onclick="editTenant('${tenant.user_id}')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn" onclick="deleteTenant('${tenant.user_id}')" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = rowsHTML;
  setupListEventListeners();
}

function updateBulkActionsBar() {
  const bulkActionsBar = document.getElementById("bulkActionsBar");
  const selectedCount = document.getElementById("selectedCount");
  
  if (!bulkActionsBar || !selectedCount) return;

  if (selectedTenants.size > 0) {
    bulkActionsBar.style.display = "flex";
    selectedCount.textContent = `${selectedTenants.size} selected`;
  } else {
    bulkActionsBar.style.display = "none";
  }
}

// NEW: Clear all selections
function clearSelection() {
  selectedTenants.clear();
  document.querySelectorAll(".tenant-card").forEach((card) => {
    card.classList.remove("selected");
    const checkbox = card.querySelector(".checkbox");
    if (checkbox) checkbox.checked = false;
  });
  document.querySelectorAll(".tenant-list-item").forEach((item) => {
    item.classList.remove("selected");
    const checkbox = item.querySelector(".list-checkbox");
    if (checkbox) checkbox.checked = false;
  });
  updateSelectAllButton();
  updateListSelectAll();
  updateBulkActionsBar();
}

// NEW: Message selected tenants
function messageSelected() {
  if (selectedTenants.size === 0) {
    alert("Please select tenants to message.");
    return;
  }
  
  const selectedIds = Array.from(selectedTenants);
  alert(`Messaging ${selectedTenants.size} selected tenant(s)`);
}

function exportSelected() {
  if (selectedTenants.size === 0) {
    alert("Please select tenants to export.");
    return;
  }
  
  const selectedIds = Array.from(selectedTenants);
  alert(`Exporting ${selectedTenants.size} selected tenant(s)`);
}

function searchTenants() {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  
  if (!searchInput || !statusFilter) {
    console.error('Search elements not found');
    return;
  }
  
  const searchTerm = searchInput.value.trim();
  const statusValue = statusFilter.value;

  const filters = {};
  if (searchTerm) filters.search = searchTerm;
  if (statusValue) filters.status = statusValue;

  currentPage = 1;
  loadTenants(1, filters);
}

function filterTenants() {
  searchTenants();
}

function showLoadingState() {
  document.getElementById("loadingState").style.display = "flex";
  document.getElementById("errorState").style.display = "none";
  document.getElementById("emptyState").style.display = "none";
  document.getElementById("gridView").style.display = "none";
  document.getElementById("listView").style.display = "none";
}

function hideLoadingState() {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("errorState").style.display = "none";
  document.getElementById("emptyState").style.display = "none";

  if (currentView === "grid") {
    document.getElementById("gridView").style.display = "grid";
    document.getElementById("listView").style.display = "none";
  } else {
    document.getElementById("gridView").style.display = "none";
    document.getElementById("listView").style.display = "flex";
  }
}

function showErrorState() {
  document.getElementById("errorState").style.display = "flex";
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("gridView").style.display = "none";
  document.getElementById("listView").style.display = "none";
  document.getElementById("emptyState").style.display = "none";
}

function showEmptyState() {
  document.getElementById("emptyState").style.display = "flex";
  document.getElementById("gridView").style.display = "none";
  document.getElementById("listView").style.display = "none";
}

// View toggle function
function toggleView(viewType) {
  const buttons = document.querySelectorAll(".view-btn");
  const gridView = document.getElementById("gridView");
  const listView = document.getElementById("listView");

  buttons.forEach((btn) => btn.classList.remove("active"));
  const targetBtn = document.querySelector(`[data-view="${viewType}"]`);
  if (targetBtn) targetBtn.classList.add("active");

  // Update global view state
  currentView = viewType;

  if (viewType === "list") {
    gridView.style.display = "none";
    listView.style.display = "flex";
    renderListView();
  } else {
    gridView.style.display = "grid";
    listView.style.display = "none";
    renderGridView();
  }

}

function setupEventListeners() {
  let searchTimeout;
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(searchTenants, 300);
    });
    
    searchInput.addEventListener("keypress", function(e) {
      if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        searchTenants();
      }
    });
  }

  // Status filter
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", searchTenants);
  }

  const profileBtn = document.getElementById("profileBtnIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");
  
  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function() {
      dropdownMenu.style.display = "none";
    });
  }
}

function setupListEventListeners() {
  const listItems = document.querySelectorAll(".tenant-list-item");
  listItems.forEach((item) => {
    const checkbox = item.querySelector(".list-checkbox");
    if (checkbox) {
      checkbox.addEventListener("click", function (e) {
        e.stopPropagation();
        const tenantId = item.dataset.tenant;

        if (this.checked) {
          selectedTenants.add(tenantId);
          item.classList.add("selected");
        } else {
          selectedTenants.delete(tenantId);
          item.classList.remove("selected");
        }

        updateSelectAllButton();
        updateListSelectAll();
        updateBulkActionsBar(); 
      });
    }

    item.addEventListener("click", function (e) {
      if (e.target.classList.contains("action-btn") || 
          e.target.type === "checkbox" ||
          e.target.closest(".action-btn")) { // Added closest check for icon clicks
        return;
      }

      const tenantId = item.dataset.tenant;
      const checkbox = item.querySelector(".list-checkbox");

      toggleTenantSelection(tenantId, item, checkbox);
      updateListSelectAll();
      updateBulkActionsBar(); 
    });
  });
}

function setupGridEventListeners() {
  const tenantCards = document.querySelectorAll(".tenant-card");
  tenantCards.forEach((card) => {
    const checkbox = card.querySelector(".checkbox");
    if (checkbox) {
      checkbox.addEventListener("click", function (e) {
        e.stopPropagation();
        const tenantId = card.dataset.tenant;

        if (this.checked) {
          selectedTenants.add(tenantId);
          card.classList.add("selected");
        } else {
          selectedTenants.delete(tenantId);
          card.classList.remove("selected");
        }

        updateSelectAllButton();
        updateBulkActionsBar(); // Added this
      });
    }

    card.addEventListener("click", function (e) {
      if (e.target.type === "checkbox") {
        return;
      }

      const tenantId = card.dataset.tenant;
      const checkbox = card.querySelector(".checkbox");

      toggleTenantSelection(tenantId, card, checkbox);
      updateBulkActionsBar(); // Added this
    });
  });
}

function toggleSelectAll() {
  const listSelectAll = document.getElementById("listSelectAll");

  if (listSelectAll && listSelectAll.checked) {
    selectedTenants.clear();
    tenants.forEach((tenant) => selectedTenants.add(tenant.user_id));
    document.querySelectorAll(".tenant-list-item").forEach((item) => {
      item.classList.add("selected");
      const checkbox = item.querySelector(".list-checkbox");
      if (checkbox) checkbox.checked = true;
    });
  } else {
    selectedTenants.clear();
    document.querySelectorAll(".tenant-list-item").forEach((item) => {
      item.classList.remove("selected");
      const checkbox = item.querySelector(".list-checkbox");
      if (checkbox) checkbox.checked = false;
    });
  }

  updateSelectAllButton();
  updateListSelectAll();
  updateBulkActionsBar(); // Added this
}

function updateListSelectAll() {
  const listSelectAll = document.getElementById("listSelectAll");
  if (!listSelectAll) return;

  const totalTenants = tenants.length;

  if (selectedTenants.size === totalTenants && totalTenants > 0) {
    listSelectAll.checked = true;
    listSelectAll.indeterminate = false;
  } else if (selectedTenants.size > 0) {
    listSelectAll.checked = false;
    listSelectAll.indeterminate = true;
  } else {
    listSelectAll.checked = false;
    listSelectAll.indeterminate = false;
  }
}

function toggleTenantSelection(tenantId, element, checkbox) {
  if (selectedTenants.has(tenantId)) {
    selectedTenants.delete(tenantId);
    element.classList.remove("selected");
    checkbox.checked = false;
  } else {
    selectedTenants.add(tenantId);
    element.classList.add("selected");
    checkbox.checked = true;
  }

  updateSelectAllButton();
  updateBulkActionsBar(); 
}

function updateSelectAllButton() {
  const selectAllElements = document.querySelectorAll("#selectAllCheckbox, .selectAllCheckbox");
  const totalTenants = tenants.length;

  selectAllElements.forEach(selectAllCheckbox => {
    if (selectedTenants.size === totalTenants && totalTenants > 0) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else if (selectedTenants.size > 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    }
  });
}

function selectAll() {
  // Check current state
  const allSelected = selectedTenants.size === tenants.length;

  if (allSelected) {
    // Deselect all
    clearSelection();
  } else {
    // Select all
    selectedTenants.clear();
    tenants.forEach((tenant) => selectedTenants.add(tenant.user_id));
    
    document.querySelectorAll(".tenant-card").forEach((card) => {
      card.classList.add("selected");
      const checkbox = card.querySelector(".checkbox");
      if (checkbox) checkbox.checked = true;
    });
    
    document.querySelectorAll(".tenant-list-item").forEach((item) => {
      item.classList.add("selected");
      const checkbox = item.querySelector(".list-checkbox");
      if (checkbox) checkbox.checked = true;
    });
    
    updateSelectAllButton();
    updateListSelectAll();
    updateBulkActionsBar();
  }
}

// Render pagination (unchanged)
function renderPagination() {
  const container = document.getElementById("pagination");

  if (totalPages <= 1) {
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";

  let paginationHTML = "";

  // Previous button
  paginationHTML += `
    <button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} onclick="goToPage(${currentPage - 1})">
      ← Previous
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += '<span class="pagination-ellipsis">...</span>';
    }
  }

  // Next button
  paginationHTML += `
    <button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="goToPage(${currentPage + 1})">
      Next →
    </button>
  `;

  container.innerHTML = paginationHTML;
}

// Utility functions (unchanged)
function getInitials(firstName, lastName) {
  const first = (firstName || "").charAt(0).toUpperCase();
  const last = (lastName || "").charAt(0).toUpperCase();
  return first + last || "??";
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages && page !== currentPage) {
    loadTenants(page);
  }
}

// Action functions
function editTenant(tenantId) {
  console.log("Edit tenant:", tenantId);
  // Implement edit functionality
}

function deleteTenant(tenantId) {
  if (confirm("Are you sure you want to delete this tenant?")) {
    console.log("Delete tenant:", tenantId);
    // Implement delete functionality
  }
}

let currentStep = 1;

function openCreateAccountInline() {
    document.getElementById("createAccountInlineContainer").style.display = "block";
    // Hide the controls row
    const controlsRow = document.querySelector(".controls-row");
    if (controlsRow) controlsRow.style.display = "none";
    // Update breadcrumb for form
    const breadcrumb = document.getElementById("tenantsBreadcrumbNav");
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <li class="breadcrumb-item" style="color: #6b7280;">
                <i class="fas fa-users me-2"></i>Tenants
            </li>
            <li class="breadcrumb-divider"><span>›</span></li>
            <li class="breadcrumb-item active" aria-current="page">
                <i class="fas fa-user-plus me-2"></i> Add New Tenant
            </li>
        `;
    }
    if (document.getElementById("bulkActionsBar")) document.getElementById("bulkActionsBar").style.display = "none";
    if (document.getElementById("pagination")) document.getElementById("pagination").style.display = "none";
    if (document.getElementById("emptyState")) document.getElementById("emptyState").style.display = "none";
    if (document.getElementById("gridView")) document.getElementById("gridView").style.display = "none";
    if (document.getElementById("listView")) document.getElementById("listView").style.display = "none";
}

function closeCreateAccountInline() {
    document.getElementById("createAccountInlineContainer").style.display = "none";
    // Show the controls row again
    const controlsRow = document.querySelector(".controls-row");
    if (controlsRow) controlsRow.style.display = "";
    // Restore breadcrumb
    const breadcrumb = document.getElementById("tenantsBreadcrumbNav");
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <li class="breadcrumb-item active" aria-current="page">
                <i class="fas fa-users me-2"></i> Tenants
            </li>
        `;
    }
    if (document.getElementById("bulkActionsBar")) document.getElementById("bulkActionsBar").style.display = "";
    if (document.getElementById("pagination")) document.getElementById("pagination").style.display = "";
    if (document.getElementById("gridView")) document.getElementById("gridView").style.display = "";
    // Optionally show emptyState if needed
}

function resetModal() {
  currentStep = 1;
  updateStepDisplay();
  document.getElementById("createAccountForm").reset();

  const profilePreview = document.querySelector(".profile-preview");
  if (profilePreview) {
    profilePreview.innerHTML = '<div class="profile-preview-content"><i class="fas fa-user-plus"></i><span>Add Photo</span></div>';
  }
}

function updateStepDisplay() {
  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const step = document.getElementById(`step${i}`);
    const connector = document.getElementById(`connector${i}`);
    const formStep = document.getElementById(`formStep${i}`);

    if (i < currentStep) {
      step.className = "step completed";
      if (connector) connector.className = "step-connector completed";
    } else if (i === currentStep) {
      step.className = "step active";
      if (connector) connector.className = "step-connector";
    } else {
      step.className = "step inactive";
      if (connector) connector.className = "step-connector";
    }

    // Show/hide form steps
    if (i === currentStep) {
      formStep.classList.add("active");
    } else {
      formStep.classList.remove("active");
    }
  }

  // Update buttons
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  prevBtn.style.display = currentStep === 1 ? "none" : "block";

  if (currentStep === 3) {
    nextBtn.style.display = "none";
    confirmBtn.style.display = "block";
  } else {
    nextBtn.style.display = "block";
    confirmBtn.style.display = "none";
  }
}

function nextStep() {
  if (validateCurrentStep() && currentStep < 3) {
    currentStep++;
    updateStepDisplay();
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepDisplay();
  }
}

function validateCurrentStep() {
  const currentFormStep = document.getElementById(`formStep${currentStep}`);
  const requiredFields = currentFormStep.querySelectorAll("input[required]");

  for (let field of requiredFields) {
    if (!field.value.trim()) {
      field.focus();
      field.style.borderColor = "#dc3545";
      setTimeout(() => {
        field.style.borderColor = "#e1e8ed";
      }, 3000);
      return false;
    }
  }

  // Additional validation for step 3 (password confirmation)
  if (currentStep === 3) {
    const password = document.getElementById("defaultPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      document.getElementById("confirmPassword").focus();
      return false;
    }

    if (!agreeTerms) {
      alert("Please agree to the terms and privacy policies");
      return false;
    }
  }

  return true;
}

function confirmAccount() {
  if (validateCurrentStep()) {
    // Collect form data
    const formData = new FormData(document.getElementById("createAccountForm"));
    const accountData = {};

    for (let [key, value] of formData.entries()) {
      accountData[key] = value;
    }

    // Show success message
    alert("Tenant account created successfully!");
    console.log("New tenant data:", accountData);

    // Close modal and reload tenants
    closeCreateAccountModal();
    loadTenants(); // Reload to show new tenant
  }
}

function togglePassword(fieldId, toggleBtn) {
  const field = document.getElementById(fieldId);
  const icon = toggleBtn.querySelector('i');

  if (field.type === "password") {
    field.type = "text";
    icon.className = "fas fa-eye-slash";
  } else {
    field.type = "password";
    icon.className = "fas fa-eye";
  }
}

// Avatar functions (unchanged)
function handleAvatarError(imgElement, initials) {
  imgElement.style.display = "none";
  const avatarContainer = imgElement.parentElement;
  
  let initialsDiv = avatarContainer.querySelector('.tenant-avatar-initials');
  if (!initialsDiv) {
    initialsDiv = document.createElement("div");
    initialsDiv.className = "tenant-avatar-initials";
    initialsDiv.textContent = initials;
    avatarContainer.appendChild(initialsDiv);
  }
  
  initialsDiv.style.display = "flex";
}

function getPlaceholderAvatar(name, size = 48) {
  const colors = [
    "#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe",
    "#43e97b", "#38f9d7", "#ffecd2", "#fcb69f", "#a8edea", "#fed6e3",
  ];

  const initials = getInitials(name?.split(" ")[0], name?.split(" ")[1]);
  const colorIndex = (name || "").length % colors.length;
  const backgroundColor = colors[colorIndex];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${backgroundColor.replace("#", "")}&color=ffffff&bold=true`;
}

function generateAvatarHTML(tenant, size = "normal") {
  const initials = getInitials(tenant.first_name, tenant.last_name);
  const fullName = `${tenant.first_name || ""} ${tenant.last_name || ""}`.trim();
  const imageSize = size === "small" ? 32 : 48;

  let avatarSrc = tenant.avatar;
  if (!avatarSrc || avatarSrc.trim() === "") {
    avatarSrc = getPlaceholderAvatar(fullName, imageSize);
  }

  return `
    <img src="${avatarSrc}" 
         alt="${fullName}" 
         class="tenant-avatar-img"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
         onload="this.style.display='block'; this.nextElementSibling.style.display='none';">
    <div class="tenant-avatar-initials" style="display: none;">${initials}</div>
  `;
}

// File upload handlers (keeping your existing code but with error handling)
document.addEventListener("DOMContentLoaded", function() {
  const documentUpload = document.getElementById("documentUpload");
  const profileUpload = document.getElementById("profileUpload");
  const createAccountModal = document.getElementById("createAccountModal");

  if (documentUpload) {
    documentUpload.addEventListener("change", function (e) {
      const files = e.target.files;
      const uploadArea = e.target.parentElement;

      if (files.length > 0) {
        uploadArea.querySelector(".upload-text").innerHTML = `<strong>${files.length} file(s) selected</strong><br>${Array.from(files).map((f) => f.name).join(", ")}`;
      }
    });
  }

  if (profileUpload) {
    profileUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      const preview = document.querySelector(".profile-preview");

      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          preview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (createAccountModal) {
    createAccountModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeCreateAccountModal();
      }
    });
  }
});

// Auto-save functions (keeping your existing code)
function autoSaveFormData() {
  const form = document.getElementById("createAccountForm");
  if (!form) return;
  
  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    if (typeof value === "string") {
      data[key] = value;
    }
  }
  try {
    sessionStorage.setItem("tenantFormData", JSON.stringify(data));
  } catch (e) {
    console.log("Could not save form data");
  }
}

function loadSavedFormData() {
  try {
    const savedData = sessionStorage.getItem("tenantFormData");
    if (savedData) {
      const data = JSON.parse(savedData);
      Object.keys(data).forEach((key) => {
        const field = document.querySelector(`[name="${key}"]`);
        if (field && field.type !== "file") {
          field.value = data[key];
        }
      });
    }
  } catch (e) {
    console.log("Could not load saved form data");
  }
}

function clearSavedFormData() {
  try {
    sessionStorage.removeItem("tenantFormData");
  } catch (e) {
    console.log("Could not clear saved form data");
  }
}

setInterval(autoSaveFormData, 30000);

window.toggleView = toggleView;
window.editTenant = editTenant;
window.deleteTenant = deleteTenant;
window.selectAll = selectAll;
window.clearSelection = clearSelection;
window.messageSelected = messageSelected;
window.exportSelected = exportSelected;
window.toggleSelectAll = toggleSelectAll;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.confirmAccount = confirmAccount;
window.togglePassword = togglePassword;
window.handleAvatarError = handleAvatarError;
window.goToPage = goToPage;
window.formatStatus = formatStatus;
window.formatDate = formatDate;
window.openCreateAccountInline = openCreateAccountInline;
window.closeCreateAccountInline = closeCreateAccountInline;