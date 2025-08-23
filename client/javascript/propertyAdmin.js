import formatAddress from "../utils/formatAddress.js";
import formatDate from "../utils/formatDate.js";

let properties = [];
let filteredProperties = [];

let isAddingProperty = false;
let inlineFormHandler = null;

let isEditingProperty = false;
let currentEditPropertyId = null;
let editInlineFormHandler = null;

let editShowcaseImages = [];
const MAX_SHOWCASE_IMAGES = 10;
let deletedShowcaseImages = [];

let currentPage = 1;
let pageSize = 8;
let totalProperties = 0;

let currentStatusFilter = "all";
let currentAddressFilter = "all";
let currentSearchQuery = "";
window.currentStatusFilter = "all";

// API Configuration
const API_BASE_URL = "/api/v1/properties";

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing...");
  populateAddressFilterDropdown(); // <-- Add this line
  loadProperties(1, pageSize);
  setupEventListeners();

  const addressFilterDropdown = document.getElementById("addressFilterDropdown");
  if (addressFilterDropdown) {
    addressFilterDropdown.addEventListener("change", handleAddressFilterChange);
  }

  const clearBtn = document.getElementById("clearFiltersBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      // Reset search
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.value = "";
      currentSearchQuery = "";

      // Reset status filter
      currentStatusFilter = "all";
      updateStatusDropdownLabel("all");
      highlightActiveStatus("all");

      // Reload properties
      loadProperties(1, pageSize);
    });
  }
});

// Load properties from backend
async function loadProperties(page = 1, limit = pageSize) {
  try {
    showLoadingState();

    const addressFilter = getAddressFilterValue();
    let url = API_BASE_URL;
    let params = [];

    // Always send address filter (base)
    if (addressFilter !== "all") {
      params.push(`address_id=${encodeURIComponent(addressFilter)}`);
    }

    // Always send status filter
    if (currentStatusFilter && currentStatusFilter !== "all") {
      params.push(`property_status=${encodeURIComponent(mapStatusToBackend(currentStatusFilter))}`);
    }

    // Always send search filter
    if (currentSearchQuery && currentSearchQuery.trim() !== "") {
      params.push(`search=${encodeURIComponent(currentSearchQuery.trim())}`);
    }

    params.push(`page=${page}`);
    params.push(`limit=${limit}`);

    if (params.length) {
      url += "?" + params.join("&");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();

    if (result.properties) {
      properties = result.properties.map(transformPropertyData);
      totalProperties = result.total || result.properties.length;
      currentPage = result.page || 1;
      pageSize = result.limit || pageSize;

      filteredProperties = properties;
      renderProperties();
      renderPagination();
      hideLoadingState();
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error loading properties:", error);
    showErrorState();
  }
}

function transformPropertyData(backendProperty) {
  return {
    id: backendProperty.property_id,
    property_name: backendProperty.property_name || "Unnamed Property",
    location: formatAddress(backendProperty, false),
    status: mapPropertyStatus(backendProperty.property_status),
    base_rent: backendProperty.base_rent || 0,
    floor_area_sqm: backendProperty.floor_area_sqm || 0,
    description: backendProperty.description || "",
    display_image: backendProperty.display_image,
    property_pictures: backendProperty.property_pictures || [],
    advance_months: backendProperty.advance_months || 0,
    security_deposit_months: backendProperty.security_deposit_months || 2,
    minimum_lease_term_months: backendProperty.minimum_lease_term_months || 24,
    address_id: backendProperty.address_id,
    // Include individual address fields for extraction
    building_name: backendProperty.building_name,
    street: backendProperty.street,
    barangay: backendProperty.barangay,
    city: backendProperty.city,
    province: backendProperty.province,
    postal_code: backendProperty.postal_code,
    country: backendProperty.country,
    created_at: backendProperty.created_at,
    updated_at: backendProperty.updated_at,
  };
}

function renderPagination() {
  const paginationContainerId = "paginationContainer";
  let container = document.getElementById(paginationContainerId);

  if (isAddingProperty || isEditingProperty) {
    if (container) {
      container.innerHTML = "";
      container.style.display = "none";
    }
    return;
  }

  if (!container) {
    container = document.createElement("div");
    container.id = paginationContainerId;
    container.style.textAlign = "center";
    container.style.margin = "20px 0";
    document.getElementById("propertiesGrid").after(container);
  }

  // Hide pagination if less than a full page
  if (totalProperties <= pageSize) {
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  container.style.display = "block";

  // Calculate total pages
  const totalPages = Math.ceil(totalProperties / pageSize);
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<nav aria-label="Property pagination"><ul class="pagination justify-content-center">`;

  // Previous button
  html += `<li class="page-item${currentPage === 1 ? " disabled" : ""}">
    <a class="page-link" href="#" onclick="goToPage(${
      currentPage - 1
    });return false;">Previous</a>
  </li>`;

  // Page numbers (show up to 5 pages for brevity)
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);
  if (currentPage <= 3) end = Math.min(5, totalPages);
  if (currentPage > totalPages - 2) start = Math.max(1, totalPages - 4);

  for (let i = start; i <= end; i++) {
    html += `<li class="page-item${
      i === parseInt(currentPage) ? " active" : ""
    }">  
    <a class="page-link" href="#" onclick="goToPage(${i});return false;">${i}</a>
  </li>`;
  }

  // Next button
  html += `<li class="page-item${
    currentPage === totalPages ? " disabled" : ""
  }">
    <a class="page-link" href="#" onclick="goToPage(${
      currentPage + 1
    });return false;">Next</a>
  </li>`;

  html += `</ul></nav>`;

  container.innerHTML = html;
}

// Map backend property status to frontend status
function mapPropertyStatus(backendStatus) {
  const statusMap = {
    Available: "available",
    Occupied: "occupied",
    Maintenance: "maintenance",
    "Under Maintenance": "maintenance",
  };
  return statusMap[backendStatus] || "available";
}

// Map frontend status to backend status
function mapStatusToBackend(frontendStatus) {
  const statusMap = {
    available: "Available",
    occupied: "Occupied",
    maintenance: "Maintenance",
  };
  return statusMap[frontendStatus] || "Available";
}

function setupEventListeners() {
  // Search functionality
  document
    .getElementById("searchInput")
    .addEventListener("input", function (e) {
      searchProperties(e.target.value);
    });

  // Profile dropdown
  document
    .getElementById("profileBtnIcon")
    .addEventListener("click", function (e) {
      e.stopPropagation();
      const dropdown = document.getElementById("dropdownMenu");
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    document.getElementById("dropdownMenu").style.display = "none";
    closeAllDropdowns();
  });
}

function getAddressFilterValue() {
  return localStorage.getItem("addressFilter") || "all";
}
function setAddressFilterValue(val) {
  localStorage.setItem("addressFilter", val);
}

// Populate the address filter dropdown
async function populateAddressFilterDropdown() {
  const dropdown = document.getElementById("addressFilterDropdown");
  if (!dropdown) return;

  // Save current value to restore after repopulating
  const prevValue = getAddressFilterValue();

  // Clear and add "All Addresses"
  dropdown.innerHTML = `<option value="all">All Addresses</option>`;

  try {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch addresses");
    const result = await response.json();

    // Use unique address_id/building_name pairs
    const uniqueAddresses = new Map();
    result.addresses.forEach((address) => {
      if (address.address_id) {
        // Use building_name if available, else fallback to formatted address
        let label = address.building_name?.trim();
        if (!label) {
          label = formatAddress(address, false);
        }
        uniqueAddresses.set(address.address_id, label);
      }
    });

    // Sort by label
    const sorted = Array.from(uniqueAddresses.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );

    sorted.forEach(([address_id, label]) => {
      const option = document.createElement("option");
      option.value = address_id;
      option.textContent = label;
      dropdown.appendChild(option);
    });

    // Restore previous value (or default to "all")
    dropdown.value = prevValue;
  } catch (error) {
    console.error("Error populating address filter:", error);
  }
}

async function filterByAddress(addressId, page = 1, limit = pageSize) {
  try {
    let url = API_BASE_URL;
    let params = [];
    if (addressId !== "all") {
      params.push(`address_id=${encodeURIComponent(addressId)}`);
    }
    params.push(`page=${page}`);
    params.push(`limit=${limit}`);
    if (params.length) {
      url += "?" + params.join("&");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      const result = await response.json();
      if (result.properties) {
        properties = result.properties.map(transformPropertyData);
        filteredProperties = [...properties];
        totalProperties = result.total || result.properties.length;
        currentPage = result.page || 1;
        renderProperties();
        renderPagination();
      }
    } else {
      // fallback to client-side filtering
      filterPropertiesByAddress(addressId);
    }
  } catch (error) {
    console.error("Address filter error:", error);
    filterPropertiesByAddress(addressId);
  }
  closeAllDropdowns();
}

async function fetchPropertiesForAddress(addressId) {
  let url = API_BASE_URL;
  let params = [];
  if (addressId !== "all") {
    params.push(`address_id=${encodeURIComponent(addressId)}`);
  }
  if (params.length) {
    url += "?" + params.join("&");
  }
  try {
    showLoadingState();
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (response.ok) {
      const result = await response.json();
      properties = result.properties.map(transformPropertyData);
      totalProperties = result.total || result.properties.length;
    } else {
      properties = [];
      totalProperties = 0;
    }
  } catch (error) {
    properties = [];
    totalProperties = 0;
  }
  hideLoadingState();
}

async function handleAddressFilterChange() {
  const dropdown = document.getElementById("addressFilterDropdown");
  if (!dropdown) return;
  const value = dropdown.value;
  currentAddressFilter = value;
  setAddressFilterValue(value);

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  currentSearchQuery = "";
  currentStatusFilter = "all";
  updateStatusDropdownLabel("all");
  highlightActiveStatus("all");

  loadProperties(1, pageSize);
}

function renderProperties() {
  const grid = document.getElementById("propertiesGrid");

  if (!grid) {
    console.error("Properties grid element not found!");
    return;
  }

  if (filteredProperties.length === 0) {
    grid.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-home fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No properties found</h5>
                    <p class="text-muted">Try adjusting your search criteria or add a new property.</p>
                </div>
            </div>
        `;
    return;
  }

  grid.innerHTML = filteredProperties
    .map(
      (property) => `
        <div class="property-card-wrapper">
            <div class="property-card h-100" data-id="${property.id}">
                <!-- Property Image Section -->
                <div class="property-image-container">
                    <div class="property-image ${
                      getPropertyImageSrc(property) ? "" : "no-image"
                    }">
                        ${
                          getPropertyImageSrc(property)
                            ? `<img src="${getPropertyImageSrc(
                                property
                              )}" alt="${
                                property.property_name
                              }" class="img-fluid">`
                            : `
                                <div class="no-image-placeholder">
                                    <i class="fas fa-image fa-2x text-muted mb-2"></i>
                                    <small class="text-muted">No Image Available</small>
                                </div>
                            `
                        }
                        <div class="image-overlay">
                            <button class="btn-image-action" onclick="openEditPropertyForm('${
                              property.id
                            }')" title="Edit Property">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                    <div class="status-badge-container">
                        <span class="status-badge status-${property.status}">
                            <i class="fas ${getStatusIcon(
                              property.status
                            )} me-1"></i>
                            ${
                              property.status.charAt(0).toUpperCase() +
                              property.status.slice(1)
                            }
                        </span>
                    </div>
                </div>
                
                <!-- Property Info Section -->
                <div class="property-card-body">
                    <!-- Header Section -->
                    <div class="property-header-section">
                        <h5 class="property-title">${
                          property.property_name
                        }</h5>
                        <p class="property-location">
                            <i class="fas fa-map-marker-alt text-muted me-1"></i>
                            ${property.location}
                        </p>
                    </div>
                    
                    <!-- Price Section -->
                    <div class="property-price-section">
                        <div class="price-main">₱${property.base_rent.toLocaleString()}</div>
                        <div class="price-label">per month</div>
                    </div>
                    
                    <!-- Key Details Grid -->
                    <div class="property-details-grid">
                        <div class="detail-card">
                            <div class="detail-icon">
                                <i class="fas fa-ruler-combined"></i>
                            </div>
                            <div class="detail-content">
                                <div class="detail-value">${
                                  property.floor_area_sqm
                                }</div>
                                <div class="detail-label">m² Area</div>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="detail-content">
                                <div class="detail-value">${
                                  property.minimum_lease_term_months
                                } MONTHS</div>
                                <div class="detail-label">Minimum Lease Time</div>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="detail-content">
                                <div class="detail-value">${
                                  property.security_deposit_months
                                } MONTHS</div>
                                <div class="detail-label">Security Deposit</div>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-icon">
                                <i class="fa-sharp fa-solid fa-money-bill-wave"></i>
                            </div>
                            <div class="detail-content">
                                <div class="detail-value">${
                                  property.advance_months
                                } MONTHS </div>
                                <div class="detail-label">Advance Payment</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions Section -->
                    <div class="property-actions">
                        <button class="btn btn-outline-primary btn-sm flex-fill" onclick="showPropertyDetails('${
                          property.id
                        }')">
                            <i class="fas fa-eye me-1"></i>
                            View Details
                        </button>
                        <button class="btn btn-primary btn-sm flex-fill" onclick="openEditPropertyForm('${
                          property.id
                        }')">
                            <i class="fas fa-edit me-1"></i>
                            Edit
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="removeProperty('${
                          property.id
                        }')" title="Remove Property">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Helper function to get status icon
function getStatusIcon(status) {
  const iconMap = {
    available: "fa-check-circle",
    occupied: "fa-user",
    maintenance: "fa-tools",
  };
  return iconMap[status] || "fa-circle";
}

// Get property image source
function getPropertyImageSrc(property) {
  if (property.display_image) {
    return property.display_image;
  }
  if (property.property_pictures && property.property_pictures.length > 0) {
    return property.property_pictures[0].image_url;
  }
  return null;
}

// Show loading state
function showLoadingState() {
  const grid = document.getElementById("propertiesGrid");
  grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <div style="font-size: 18px; color: #666; margin-bottom: 10px;">Loading properties...</div>
                    <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4a90e2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
            `;
}

// Show error state
function showErrorState() {
  const grid = document.getElementById("propertiesGrid");
  grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #dc2626;">
                    <div style="font-size: 18px; margin-bottom: 15px;">Failed to load properties</div>
                    <button onclick="loadProperties()" style="background: #4a90e2; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
}

function hideLoadingState() {
}

function openAddModal() {
  hideEditPropertyForm();
  showAddPropertyForm();
}

function closeAddModal() {
  hideAddPropertyForm();
}

function openEditPropertyForm(id) {
  const property = properties.find((p) => p.id === id);
  if (!property) {
    console.error("Property not found:", id);
    return;
  }

  showEditPropertyForm(id);
}

function closeEditModal() {
  hideEditPropertyForm();
}

function closeDetailsModal() {
  if (detailsModal) {
    detailsModal.close();
  }
}

// Search and filter functions
function searchProperties(query) {
  currentSearchQuery = query;
  loadProperties(1, pageSize);
}

function toggleDropdown(dropdownId) {
  event.stopPropagation();
  closeAllDropdowns();
  const dropdown = document.getElementById(dropdownId);
  dropdown.classList.toggle("show");
}

function closeAllDropdowns() {
  document
    .querySelectorAll(".property-dropdown-content")
    .forEach((dropdown) => {
      dropdown.classList.remove("show");
    });
}

function updateStatusDropdownLabel(status) {
  const label = document.getElementById("currentStatusLabel");
  if (!label) return;
  let text = "Status";
  let color = "#64748b";
  let icon = '<i class="fas fa-list me-2"></i>';

  switch (status) {
    case "available":
      text = "Available";
      color = "#059669";
      icon = '<i class="fas fa-check-circle me-2"></i>';
      break;
    case "occupied":
      text = "Occupied";
      color = "#2563eb";
      icon = '<i class="fas fa-user me-2"></i>';
      break;
    case "maintenance":
      text = "Maintenance";
      color = "#d97706";
      icon = '<i class="fas fa-tools me-2"></i>';
      break;
    case "all":
    default:
      text = "All";
      color = "#64748b";
      icon = '<i class="fas fa-list me-2"></i>';
      break;
  }
  label.innerHTML =
    icon + `<span style="color:${color};font-weight:600;">${text}</span>`;
}

function highlightActiveStatus(status) {
  document.querySelectorAll("#statusDropdown a").forEach((a) => {
    a.classList.remove("active");
    if (a.classList.contains(status)) a.classList.add("active");
  });
}

function filterByStatus(status) {
  currentStatusFilter = status;
  updateStatusDropdownLabel(status);
  highlightActiveStatus(status);
  loadProperties(1, pageSize);
  closeAllDropdowns();
}

function showAddPropertyForm() {
  isAddingProperty = true;
  updateBreadcrumb();
  showFormContainer();
  setupInlineForm();
  hidePropertyDetails();

  const addressFilterDropdown = document.getElementById(
    "addressFilterDropdownContainer"
  );
  if (addressFilterDropdown) addressFilterDropdown.style.display = "none";
}

function hideAddPropertyForm() {
  if (
    confirm("Are you sure you want to cancel? All entered data will be lost.")
  ) {
    isAddingProperty = false;
    updateBreadcrumb();
    showPropertiesGrid();
    resetInlineForm();

    // Ensure proper visibility reset
    const addPropertyBtn = document.querySelector(".new-ticket-btn");
    const propertyControls = document.getElementById("propertyControls");

    if (addPropertyBtn) addPropertyBtn.style.display = "flex";
    if (propertyControls) propertyControls.style.display = "flex";
  }
}

// Replace your existing updateBreadcrumb function
function updateBreadcrumb(customBreadcrumbs = null) {
  const breadcrumbNav = document.getElementById("breadcrumbNav");
  const propertyControls = document.getElementById("propertyControls");
  const addPropertyBtn = document.querySelector(".new-ticket-btn");

  if (customBreadcrumbs) {
    // Custom breadcrumbs for property details view
    const breadcrumbItems = customBreadcrumbs
      .map((item) => {
        if (item.active) {
          return `<li class="breadcrumb-item active" aria-current="page">
          ${item.text}
        </li>`;
        } else {
          return `<li class="breadcrumb-item">
          <a href="#" onclick="${item.onclick}">
            ${item.text}
          </a>
        </li>`;
        }
      })
      .join("");

    breadcrumbNav.innerHTML = breadcrumbItems;

    // Hide controls when showing custom breadcrumbs
    if (propertyControls) propertyControls.style.display = "none";
    if (addPropertyBtn) addPropertyBtn.style.display = "none";
  } else if (isAddingProperty) {
    breadcrumbNav.innerHTML = `
      <li class="breadcrumb-item">
        <a href="#" onclick="hideAddPropertyForm()">
          <i class="fas fa-home me-2"></i>Properties
        </a>
      </li>
      <li class="breadcrumb-item active" aria-current="page">
        <i class="fas fa-plus me-2"></i>Add New Property
      </li>
    `;
    if (propertyControls) propertyControls.style.display = "none";
    if (addPropertyBtn) addPropertyBtn.style.display = "none";
  } else if (isEditingProperty) {
    const property = properties.find((p) => p.id === currentEditPropertyId);
    const propertyName = property ? property.property_name : "Property";

    breadcrumbNav.innerHTML = `
      <li class="breadcrumb-item">
        <a href="#" onclick="hideEditPropertyForm(false)">
          <i class="fas fa-home me-2"></i>Properties
        </a>
      </li>
      <li class="breadcrumb-item active" aria-current="page">
        <i class="fas fa-edit me-2"></i>Edit ${propertyName}
      </li>
    `;
    if (propertyControls) propertyControls.style.display = "none";
    if (addPropertyBtn) addPropertyBtn.style.display = "none";
  } else {
    breadcrumbNav.innerHTML = `
      <li class="breadcrumb-item active" aria-current="page">
        <i class="fas fa-home me-2"></i>Properties
      </li>
    `;
    if (propertyControls) propertyControls.style.display = "flex";
    if (addPropertyBtn) addPropertyBtn.style.display = "flex";
  }
}

// Add new functions for edit form management
function showEditPropertyForm(propertyId) {
  isEditingProperty = true;
  currentEditPropertyId = propertyId;
  updateBreadcrumb();
  showEditFormContainer();
  setupEditInlineForm();
  populateEditForm(propertyId);

  const addressFilterDropdown = document.getElementById(
    "addressFilterDropdownContainer"
  );
  if (addressFilterDropdown) addressFilterDropdown.style.display = "none";
}

// Replace your existing hideEditPropertyForm function
function hideEditPropertyForm(skipConfirmation = false) {
  // Only show confirmation if we're actually in edit mode and user initiated the action
  if (!skipConfirmation && isEditingProperty) {
    if (
      !confirm("Are you sure you want to cancel? All changes will be lost.")
    ) {
      return; // User clicked "Cancel" in the confirmation dialog, so don't proceed
    }
  }

  // User confirmed or we're skipping confirmation, proceed with hiding the form
  isEditingProperty = false;
  currentEditPropertyId = null;

  // Hide the edit form container
  const editContainer = document.getElementById("editPropertyFormContainer");
  if (editContainer) {
    editContainer.style.display = "none";
  }

  updateBreadcrumb();
  showPropertiesGrid();
  resetEditInlineForm();

  // Ensure proper visibility reset
  const addPropertyBtn = document.querySelector(".new-ticket-btn");
  const propertyControls = document.getElementById("propertyControls");

  if (addPropertyBtn) addPropertyBtn.style.display = "flex";
  if (propertyControls) propertyControls.style.display = "flex";
}

function showFormContainer() {
  document.getElementById("propertiesGrid").style.display = "none";
  document.getElementById("editPropertyFormContainer").style.display = "none";
  document.getElementById("addPropertyFormContainer").style.display = "block";

  // Ensure Add Property button is hidden
  const addPropertyBtn = document.querySelector(".new-ticket-btn");
  if (addPropertyBtn) {
    addPropertyBtn.style.display = "none";
  }

  // Hide pagination controls when form is shown
  const paginationContainer = document.getElementById("paginationContainer");
  if (paginationContainer) {
    paginationContainer.style.display = "none";
  }

  // Enable floating actions for add form
  handleFloatingFormActions("addPropertyFormContainer");
}

function showEditFormContainer() {
  document.getElementById("propertiesGrid").style.display = "none";
  document.getElementById("addPropertyFormContainer").style.display = "none";
  document.getElementById("editPropertyFormContainer").style.display = "block";
  hidePropertyDetails();

  // Ensure Add Property button is hidden
  const addPropertyBtn = document.querySelector(".new-ticket-btn");
  if (addPropertyBtn) {
    addPropertyBtn.style.display = "none";
  }

  const addressFilterDropdown = document.getElementById(
    "addressFilterDropdownContainer"
  );
  if (addressFilterDropdown) addressFilterDropdown.style.display = "none";

  // Hide pagination controls when edit form is shown
  const paginationContainer = document.getElementById("paginationContainer");
  if (paginationContainer) {
    paginationContainer.style.display = "none";
  }

  // Enable floating actions for edit form
  handleFloatingFormActions("editPropertyFormContainer");
}

function handleFloatingFormActions(
  formContainerId,
  actionsClass = ".form-actions"
) {
  const formContainer = document.getElementById(formContainerId);
  if (!formContainer) return;

  const actions = formContainer.querySelector(actionsClass);
  if (!actions) return;

  function checkFloating() {
    const rect = actions.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;

    // If the bottom of the actions is below the viewport, float it
    if (rect.bottom > windowHeight - 10) {
      actions.classList.add("floating-actions");
    } else {
      actions.classList.remove("floating-actions");
    }
  }

  // Initial check and on scroll/resize
  checkFloating();
  window.addEventListener("scroll", checkFloating, { passive: true });
  window.addEventListener("resize", checkFloating);
}

function showPropertiesGrid() {
  // Hide all form containers
  const addContainer = document.getElementById("addPropertyFormContainer");
  const editContainer = document.getElementById("editPropertyFormContainer");
  const detailsContainer = document.getElementById(
    "propertyDetailsViewContainer"
  );

  if (addContainer) addContainer.style.display = "none";
  if (editContainer) editContainer.style.display = "none";
  if (detailsContainer) detailsContainer.style.display = "none";

  // Show properties grid
  const propertiesGrid = document.getElementById("propertiesGrid");
  if (propertiesGrid) {
    propertiesGrid.style.display = "grid";
  }

  const addressFilterDropdown = document.getElementById(
    "addressFilterDropdownContainer"
  );
  if (addressFilterDropdown)
    addressFilterDropdown.style.display = "inline-block";

  // Show controls and Add Property button
  const propertyControls = document.getElementById("propertyControls");
  const addPropertyBtn = document.querySelector(".new-ticket-btn");

  if (propertyControls) propertyControls.style.display = "flex";
  if (addPropertyBtn) addPropertyBtn.style.display = "flex";

  // Show pagination controls when grid is shown
  const paginationContainer = document.getElementById("paginationContainer");
  if (paginationContainer) {
    paginationContainer.style.display = "block";
  }
}

function setupEditImageShowcase() {
  const showcaseContainer = document.getElementById(
    "editImageShowcaseContainer"
  );
  const uploadPrompt = document.getElementById("editShowcaseUploadPrompt");
  const fileInput = document.getElementById("editShowcaseImageInput");
  const addMoreBtn = document.getElementById("editAddMoreImagesBtn");

  // Click handlers
  uploadPrompt.addEventListener("click", () => {
    if (editShowcaseImages.length < MAX_SHOWCASE_IMAGES) {
      fileInput.click();
    }
  });

  addMoreBtn.addEventListener("click", () => {
    if (editShowcaseImages.length < MAX_SHOWCASE_IMAGES) {
      fileInput.click();
    }
  });

  // File input change handler
  fileInput.addEventListener("change", handleEditShowcaseImageFiles);

  // Drag and drop
  showcaseContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    showcaseContainer.style.borderColor = "#f59e0b";
    showcaseContainer.style.background = "#fffbeb";
  });

  showcaseContainer.addEventListener("dragleave", (e) => {
    e.preventDefault();
    showcaseContainer.style.borderColor = "#cbd5e0";
    showcaseContainer.style.background = "#f9fafb";
  });

  showcaseContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    showcaseContainer.style.borderColor = "#cbd5e0";
    showcaseContainer.style.background = "#f9fafb";

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      handleEditShowcaseImageFiles({ target: { files: imageFiles } });
    }
  });
}

function handleEditShowcaseImageFiles(event) {
  const files = Array.from(event.target.files);
  const remainingSlots = MAX_SHOWCASE_IMAGES - editShowcaseImages.length;

  if (files.length > remainingSlots) {
    showInlineErrorMessage(
      `You can only add ${remainingSlots} more images. Maximum ${MAX_SHOWCASE_IMAGES} images allowed.`
    );
    return;
  }

  files.forEach((file) => {
    if (validateEditShowcaseImage(file)) {
      addEditShowcaseImage(file);
    }
  });

  // Clear the input
  event.target.value = "";
}

function validateEditShowcaseImage(file) {
  // Check file type
  if (!file.type.startsWith("image/")) {
    showInlineErrorMessage(`${file.name} is not a valid image file.`);
    return false;
  }

  // Check file size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showInlineErrorMessage(
      `${file.name} is too large. Maximum file size is 5MB.`
    );
    return false;
  }

  // Check if we've reached the limit
  if (editShowcaseImages.length >= MAX_SHOWCASE_IMAGES) {
    showInlineErrorMessage(`Maximum ${MAX_SHOWCASE_IMAGES} images allowed.`);
    return false;
  }

  return true;
}

function addEditShowcaseImage(file, existingData = null) {
  const imageId = Date.now() + Math.random();
  const imageData = {
    id: imageId,
    file: file,
    description: existingData?.image_desc || "",
    isExisting: !!existingData,
    existingId: existingData?.id || null,
  };

  editShowcaseImages.push(imageData);

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imageData.dataUrl = e.target.result;
    renderEditShowcasePreview();
  };
  reader.readAsDataURL(file);
}

function loadExistingShowcaseImages(property) {
  editShowcaseImages = [];

  if (property.property_pictures && property.property_pictures.length > 0) {
    property.property_pictures.forEach((picture, index) => {
      // Create a mock file object for existing images
      const mockFile = new File([""], `existing-image-${index}.jpg`, {
        type: "image/jpeg",
      });

      const imageData = {
        id: Date.now() + index, // Local ID for frontend tracking
        file: mockFile,
        description: picture.image_desc || "",
        isExisting: true,
        existingId: picture.id, // This should be the actual database ID
        dataUrl: picture.image_url,
      };

      editShowcaseImages.push(imageData);
    });
  }

  renderEditShowcasePreview();
}

function renderEditShowcasePreview() {
  const previewGrid = document.getElementById("editShowcasePreviewGrid");
  const uploadPrompt = document.getElementById("editShowcaseUploadPrompt");
  const addMoreSection = document.getElementById("editShowcaseAddMore");
  const currentCount = document.getElementById("editCurrentImageCount");

  // Update count
  if (currentCount) {
    currentCount.textContent = editShowcaseImages.length;
  }

  if (editShowcaseImages.length === 0) {
    uploadPrompt.style.display = "block";
    addMoreSection.style.display = "none";
    previewGrid.innerHTML = "";
    previewGrid.className = "showcase-preview-grid";
    return;
  }

  uploadPrompt.style.display = "none";
  addMoreSection.style.display =
    editShowcaseImages.length < MAX_SHOWCASE_IMAGES ? "flex" : "none";

  // Update grid class based on count
  previewGrid.className = `showcase-preview-grid count-${editShowcaseImages.length}`;

  // Render images
  previewGrid.innerHTML = editShowcaseImages
    .map(
      (imageData, index) => `
        <div class="showcase-image-card ${
          imageData.isNew ? "new" : ""
        }" data-image-id="${imageData.id}">
            <div class="showcase-image-number">${index + 1}</div>
            <img src="${
              imageData.dataUrl
            }" class="showcase-image-preview" alt="Showcase image ${index + 1}">
            <div class="showcase-image-info">
                <textarea 
                    class="showcase-image-description" 
                    placeholder="Add a description for this image..."
                    data-image-id="${imageData.id}"
                >${imageData.description}</textarea>
                <div class="showcase-image-actions">
                    <button type="button" class="showcase-remove-btn" onclick="removeEditShowcaseImage('${
                      imageData.id
                    }')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Add event listeners for description changes
  previewGrid
    .querySelectorAll(".showcase-image-description")
    .forEach((textarea) => {
      textarea.addEventListener("input", (e) => {
        const imageId = e.target.dataset.imageId;
        const imageData = editShowcaseImages.find((img) => img.id == imageId);
        if (imageData) {
          imageData.description = e.target.value;
        }
      });
    });

  // Remove new class after animation
  setTimeout(() => {
    previewGrid.querySelectorAll(".showcase-image-card.new").forEach((card) => {
      card.classList.remove("new");
    });
  }, 300);
}

function removeEditShowcaseImage(imageId) {
  const imageToRemove = editShowcaseImages.find((img) => img.id == imageId);

  if (imageToRemove && imageToRemove.isExisting && imageToRemove.existingId) {
    const validId = parseInt(imageToRemove.existingId);
    if (!isNaN(validId) && validId > 0) {
      deletedShowcaseImages.push(validId);
      console.log("Added image to deletion list:", validId);
    } else {
      console.warn("Invalid existing image ID:", imageToRemove.existingId);
    }
  }

  editShowcaseImages = editShowcaseImages.filter((img) => img.id != imageId);
  renderEditShowcasePreview();
}

function getEditShowcaseImagesForSubmission() {
  const newImages = editShowcaseImages.filter((img) => !img.isExisting);
  const updatedImages = editShowcaseImages.filter(
    (img) => img.isExisting && img.existingId
  );
  const deletedImages = deletedShowcaseImages.filter(
    (id) => id && id !== "undefined" && !isNaN(id)
  );

  return {
    newImages: newImages.map((imageData) => ({
      file: imageData.file,
      description: imageData.description,
    })),
    updatedImages: updatedImages.map((imageData) => ({
      existingId: imageData.existingId,
      description: imageData.description,
    })),
    deletedImages: deletedImages,
  };
}

// Setup edit inline form
function setupEditInlineForm() {
  if (editInlineFormHandler) return; // Already setup

  // Setup image upload
  setupEditInlineImageUpload();

  // Setup image showcase
  setupEditImageShowcase();

  // Setup address handlers
  setupEditInlineAddressHandlers();

  // Setup real-time validation for edit form
  setupRealTimeValidation(true);

  // Setup form submission
  const form = document.getElementById("inlineEditPropertyForm");
  form.addEventListener("submit", handleEditInlineFormSubmit);

  // Load existing addresses
  loadEditInlineAddresses();

  editInlineFormHandler = true;
}

function populateEditForm(propertyId) {
  // Clear deleted images list when starting to edit a property
  deletedShowcaseImages = [];

  const property = properties.find((p) => p.id === propertyId);
  if (!property) {
    console.error("Property not found:", propertyId);
    return;
  }

  // Populate basic property fields
  const fieldMappings = {
    editPropertyName: property.property_name,
    editFloorArea: property.floor_area_sqm,
    editPropertyStatus: mapStatusToBackend(property.status),
    editBaseRent: property.base_rent,
    editAdvanceMonths: property.advance_months,
    editSecurityDeposit: property.security_deposit_months,
    editLeaseTerm: property.minimum_lease_term_months,
    editDescription: property.description || "",
  };

  // Populate each field
  Object.entries(fieldMappings).forEach(([fieldId, value]) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value || "";
    } else {
      console.warn(`Field ${fieldId} not found`);
    }
  });

  // Populate address field
  const addressSelect = document.getElementById("editInlineAddressSelect");
  if (addressSelect && property.address_id) {
    addressSelect.value = property.address_id;
    // Update Tom Select value as well
    if (window.editInlineAddressTomSelect) {
      window.editInlineAddressTomSelect.setValue(property.address_id, true);
    }
  } else if (addressSelect) {
    addressSelect.value = "";
    if (window.editInlineAddressTomSelect) {
      window.editInlineAddressTomSelect.clear(true);
    }
  }

  // Set existing display image
  const uploadContainer = document.getElementById(
    "editInlineImageUploadContainer"
  );
  if (uploadContainer && uploadContainer.setExistingImage) {
    uploadContainer.setExistingImage(property.display_image);
  }

  // Load existing showcase images
  loadExistingShowcaseImages(property);
}

function validateImage(file) {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!validTypes.includes(file.type)) {
    showInlineErrorMessage(
      `${file.name} is not a valid image file (JPG, PNG, GIF)`
    );
    return false;
  }

  // Check file size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showInlineErrorMessage(
      `${file.name} is too large. Maximum file size is 5MB`
    );
    return false;
  }

  return true;
}

// Setup edit image upload
function setupEditInlineImageUpload() {
  const uploadContainer = document.getElementById(
    "editInlineImageUploadContainer"
  );
  const uploadPrompt = document.getElementById("editInlineUploadPrompt");
  const imagePreview = document.getElementById("editInlineImagePreview");
  const previewImage = document.getElementById("editInlinePreviewImage");
  const fileInput = document.getElementById("editInlineDisplayImageInput");
  const removeBtn = document.getElementById("editInlineRemoveImageBtn");
  const changeBtn = document.getElementById("editInlineChangeImageBtn");

  if (
    !uploadContainer ||
    !uploadPrompt ||
    !imagePreview ||
    !previewImage ||
    !fileInput
  ) {
    console.warn("Edit inline image upload elements not found");
    return;
  }

  let uploadedFile = null;
  let shouldRemoveExistingImage = false; // Flag to track if existing image should be removed

  // Click handlers
  uploadPrompt.addEventListener("click", () => {
    fileInput.click();
  });

  if (changeBtn) {
    changeBtn.addEventListener("click", () => {
      fileInput.click();
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      // Clear uploaded file
      uploadedFile = null;
      fileInput.value = "";

      // Mark existing image for removal
      shouldRemoveExistingImage = true;

      // Hide preview and show upload prompt
      imagePreview.style.display = "none";
      uploadPrompt.style.display = "block";
    });
  }

  // File input change handler
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reset removal flag when new image is selected
      shouldRemoveExistingImage = false;

      if (validateImage(file)) {
        uploadedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
          uploadPrompt.style.display = "none";
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Expose functions for form submission
  uploadContainer.getUploadedImage = () => uploadedFile;
  uploadContainer.shouldRemoveImage = () => shouldRemoveExistingImage;

  // Function to reset the upload container
  uploadContainer.reset = () => {
    uploadedFile = null;
    shouldRemoveExistingImage = false;
    fileInput.value = "";
    imagePreview.style.display = "none";
    uploadPrompt.style.display = "block";
  };

  // Function to set existing image for editing
  uploadContainer.setExistingImage = (imageUrl) => {
    if (imageUrl) {
      shouldRemoveExistingImage = false;
      previewImage.src = imageUrl;
      uploadPrompt.style.display = "none";
      imagePreview.style.display = "block";
    } else {
      uploadPrompt.style.display = "block";
      imagePreview.style.display = "none";
    }
  };
}

// Setup edit address handlers (similar to add form)
function setupEditInlineAddressHandlers() {
  const addNewAddressBtn = document.getElementById(
    "editInlineAddNewAddressBtn"
  );
  const newAddressForm = document.getElementById("editInlineNewAddressForm");
  const saveNewAddressBtn = document.getElementById(
    "editInlineSaveNewAddressBtn"
  );
  const cancelNewAddressBtn = document.getElementById(
    "editInlineCancelNewAddressBtn"
  );
  const addressSelect = document.getElementById("editInlineAddressSelect");

  // Show/hide new address form
  addNewAddressBtn.addEventListener("click", () => {
    const isVisible = newAddressForm.style.display !== "none";
    newAddressForm.style.display = isVisible ? "none" : "block";
    addNewAddressBtn.innerHTML = isVisible
      ? '<i class="fas fa-plus me-1"></i> Add New Address'
      : '<i class="fas fa-minus me-1"></i> Cancel New Address';
  });

  // Cancel new address
  cancelNewAddressBtn.addEventListener("click", () => {
    clearEditInlineAddressForm();
    newAddressForm.style.display = "none";
    addNewAddressBtn.innerHTML =
      '<i class="fas fa-plus me-1"></i> Add New Address';
  });

  // Save new address
  saveNewAddressBtn.addEventListener("click", () => {
    const newAddress = collectEditInlineAddressData();
    if (validateEditInlineAddress(newAddress)) {
      addEditInlineAddressToSelect(newAddress);
      clearEditInlineAddressForm();
      newAddressForm.style.display = "none";
      addNewAddressBtn.innerHTML =
        '<i class="fas fa-plus me-1"></i> Add New Address';
      showInlineSuccessMessage(
        "Address prepared! It will be saved when you update the property."
      );
    }
  });

  // When existing address is selected, clear new address form
  addressSelect.addEventListener("change", () => {
    if (addressSelect.value) {
      clearEditInlineAddressForm();
      newAddressForm.style.display = "none";
      addNewAddressBtn.innerHTML =
        '<i class="fas fa-plus me-1"></i> Add New Address';
    }
  });
}

// Helper functions for edit address handling
function collectEditInlineAddressData() {
  return {
    street: document.getElementById("editInlineNewStreet").value.trim(),
    barangay: document.getElementById("editInlineNewBarangay").value.trim(),
    city: document.getElementById("editInlineNewCity").value.trim(),
    province: document.getElementById("editInlineNewProvince").value.trim(),
    postal_code: document
      .getElementById("editInlineNewPostalCode")
      .value.trim(),
    country: document.getElementById("editInlineNewCountry").value.trim(),
  };
}

function validateEditInlineAddress(address) {
  const requiredFields = ["street", "city"];
  const missingFields = requiredFields.filter((field) => !address[field]);

  if (missingFields.length > 0) {
    alert(
      `Please fill in the following required fields: ${missingFields.join(
        ", "
      )}`
    );
    return false;
  }

  return true;
}

function addEditInlineAddressToSelect(newAddress) {
  const addressSelect = document.getElementById("editInlineAddressSelect");
  const tempId = "temp_" + Date.now();

  const addressWithTempId = {
    ...newAddress,
    address_id: tempId,
    is_new: true,
  };

  const formatted = formatAddress(newAddress, false);

  const option = document.createElement("option");
  option.value = tempId;
  option.textContent = `${formatted} (New - will be created)`;
  option.dataset.addressData = JSON.stringify(addressWithTempId);
  option.selected = true;

  addressSelect.appendChild(option);
}

function clearEditInlineAddressForm() {
  document.getElementById("editInlineNewStreet").value = "";
  document.getElementById("editInlineNewBarangay").value = "";
  document.getElementById("editInlineNewCity").value = "";
  document.getElementById("editInlineNewProvince").value = "";
  document.getElementById("editInlineNewPostalCode").value = "";
  document.getElementById("editInlineNewCountry").value = "Philippines";
}

// Add this fallback function for cached properties
function populateAddressSelectFromCachedProperties(
  selectElement,
  propertiesData
) {
  selectElement.innerHTML =
    '<option value="">Select an existing address (optional)</option>';

  // Extract unique addresses from properties
  const uniqueAddresses = new Map();

  propertiesData.forEach((property) => {
    // Only process properties that have address data and address_id
    if (
      property.address_id &&
      (property.building_name || property.street || property.city)
    ) {
      const addressKey = [
        property.building_name,
        property.street,
        property.barangay,
        property.city,
        property.province,
        property.country,
      ]
        .filter((part) => part && part.trim())
        .join("|");

      if (addressKey && !uniqueAddresses.has(addressKey)) {
        uniqueAddresses.set(addressKey, {
          address_id: property.address_id,
          formatted: formatAddress(addressKey, false),
        });
      }
    }
  });

  if (uniqueAddresses.size === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No addresses available";
    option.disabled = true;
    selectElement.appendChild(option);
    return;
  }

  // Sort addresses alphabetically
  const sortedAddresses = Array.from(uniqueAddresses.values()).sort((a, b) =>
    a.formatted.localeCompare(b.formatted)
  );

  sortedAddresses.forEach((address) => {
    const option = document.createElement("option");
    option.value = address.address_id;
    option.textContent = address.formatted;
    selectElement.appendChild(option);
  });
}

async function loadEditInlineAddresses() {
  const addressSelect = document.getElementById("editInlineAddressSelect");
  if (!addressSelect) {
    console.error("Edit address select element not found");
    return;
  }

  // Remove any previous Tom Select instance
  if (window.editInlineAddressTomSelect) {
    window.editInlineAddressTomSelect.destroy();
    window.editInlineAddressTomSelect = null;
  }

  addressSelect.innerHTML = '<option value="">Loading addresses...</option>';

  try {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      const result = await response.json();
      if (result.addresses && Array.isArray(result.addresses)) {
        addressSelect.innerHTML =
          '<option value="">Select an existing address (optional)</option>';

        // Populate options...
        result.addresses.forEach((address) => {
          const lines = formatAddress(address, true);
          const option = document.createElement("option");
          option.value = address.address_id;
          option.textContent = `${lines.line1} — ${lines.line2}`;
          addressSelect.appendChild(option);
        });

        // Initialize Tom Select
        window.editInlineAddressTomSelect = new TomSelect(addressSelect, {
          create: false,
          sortField: {
            field: "text",
            direction: "asc",
          },
          render: {
            option: function (data, escape) {
              let [line1, line2] = (data.text || "").split(" — ");
              return `<div>
                <span style="font-weight:600;">${escape(line1 || "")}</span><br>
                <span style="font-size:0.92em;color:#64748b;">${escape(
                  line2 || ""
                )}</span>
              </div>`;
            },
            item: function (data, escape) {
              let [line1, line2] = (data.text || "").split(" — ");
              return `<div>
                <span style="font-weight:600;">${escape(line1 || "")}</span>
                <span style="font-size:0.92em;color:#64748b;">${escape(
                  line2 || ""
                )}</span>
              </div>`;
            },
          },
          placeholder: "Select an existing address (optional)",
          dropdownInput:
            '<input type="text" autocomplete="off" class="ts-dropdown-input" placeholder="Type to search addresses...">',
        });

        return;
      }
      throw new Error("Invalid response format");
    } else {
      throw new Error(`Server error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching addresses for EDIT form:", error);
    populateAddressSelectFromCachedProperties(addressSelect, properties);
  }
}

async function handleEditInlineFormSubmit(event) {
  event.preventDefault();

  if (!validateForm(true)) {
    const submitBtn = document.getElementById("editInlineSubmitBtn");
    submitBtn.style.animation = "shake 0.5s ease-in-out";
    setTimeout(() => {
      submitBtn.style.animation = "";
    }, 500);

    showInlineErrorMessage(
      "Please fix the validation errors before submitting."
    );
    return;
  }

  const submitBtn = document.getElementById("editInlineSubmitBtn");
  const originalText = submitBtn.innerHTML;

  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-1"></i> Updating Property...';

    // Create FormData
    const formData = new FormData(event.target);

    // Handle address data (existing logic)
    const addressSelect = document.getElementById("editInlineAddressSelect");
    if (addressSelect.value && addressSelect.value !== "") {
      if (addressSelect.value.startsWith("temp_")) {
        // New address
        const selectedOption =
          addressSelect.options[addressSelect.selectedIndex];
        const addressData = JSON.parse(selectedOption.dataset.addressData);

        // Remove temp data
        delete addressData.address_id;
        delete addressData.is_new;

        // Add address fields to form data
        Object.entries(addressData).forEach(([key, value]) => {
          if (value && value.trim()) {
            formData.append(key, value);
          }
        });

        formData.delete("address_id");
      } else {
        // Existing address
        formData.set("address_id", addressSelect.value);
      }
    } else {
      formData.delete("address_id");
    }

    // Handle display image
    const uploadContainer = document.getElementById(
      "editInlineImageUploadContainer"
    );
    const uploadedImage = uploadContainer.getUploadedImage();
    const shouldRemoveImage = uploadContainer.shouldRemoveImage();

    if (uploadedImage) {
      // New image uploaded
      formData.set("display_image", uploadedImage);
    } else if (shouldRemoveImage) {
      // Mark existing image for removal
      formData.set("remove_display_image", "true");
    }

    // Add showcase images data with validation
    const showcaseData = getEditShowcaseImagesForSubmission();

    // Add new images
    if (showcaseData.newImages && showcaseData.newImages.length > 0) {
      showcaseData.newImages.forEach((imageData) => {
        formData.append("showcase_images", imageData.file);
        formData.append("showcase_descriptions", imageData.description);
      });
    }

    // Add updated existing images - only if we have valid IDs
    if (showcaseData.updatedImages && showcaseData.updatedImages.length > 0) {
      showcaseData.updatedImages.forEach((imageData) => {
        const validId = parseInt(imageData.existingId);
        if (!isNaN(validId) && validId > 0) {
          formData.append("existing_image_ids", validId);
          formData.append("existing_descriptions", imageData.description);
        } else {
          console.warn(
            "Skipping invalid existing image ID:",
            imageData.existingId
          );
        }
      });
    }

    // Add deleted images - only valid numeric IDs
    if (showcaseData.deletedImages && showcaseData.deletedImages.length > 0) {
      showcaseData.deletedImages.forEach((deletedId) => {
        const validId = parseInt(deletedId);
        if (!isNaN(validId) && validId > 0) {
          formData.append("deleted_image_ids", validId);
        } else {
          console.warn("Skipping invalid deleted image ID:", deletedId);
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/${currentEditPropertyId}`, {
      method: "PATCH",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();

      // Reload properties to get fresh data including new addresses
      await loadProperties();

      showInlineSuccessMessage("Property updated successfully!");

      // Navigate directly to properties list without confirmation - UPDATED
      setTimeout(() => {
        // Reset edit state and hide form WITHOUT confirmation
        isEditingProperty = false;
        currentEditPropertyId = null;

        // Hide edit form container immediately
        const editContainer = document.getElementById(
          "editPropertyFormContainer"
        );
        if (editContainer) {
          editContainer.style.display = "none";
        }

        // Show properties grid and update UI
        showPropertiesGrid();
        updateBreadcrumb();
        resetEditInlineForm();

        // Ensure proper visibility reset
        const addPropertyBtn = document.querySelector(".new-ticket-btn");
        const propertyControls = document.getElementById("propertyControls");

        if (addPropertyBtn) addPropertyBtn.style.display = "flex";
        if (propertyControls) propertyControls.style.display = "flex";
      }, 1500);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating property:", error);
    showInlineErrorMessage(
      error.message || "Failed to update property. Please try again."
    );
  } finally {
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function setupInlineImageUpload() {
  const uploadContainer = document.getElementById("inlineImageUploadContainer");
  const fileInput = document.getElementById("inlineDisplayImageInput");
  const uploadPrompt = document.getElementById("inlineUploadPrompt");
  const imagePreview = document.getElementById("inlineImagePreview");
  const previewImage = document.getElementById("inlinePreviewImage");
  const removeImageBtn = document.getElementById("inlineRemoveImageBtn");
  const changeImageBtn = document.getElementById("inlineChangeImageBtn");

  let uploadedImage = null;

  // Click to upload
  uploadContainer.addEventListener("click", (e) => {
    if (
      e.target === uploadContainer ||
      e.target.closest("#inlineUploadPrompt")
    ) {
      fileInput.click();
    }
  });

  // Drag and drop
  uploadContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = "#3b82f6";
    uploadContainer.style.background = "#eff6ff";
  });

  uploadContainer.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = "#cbd5e0";
    uploadContainer.style.background = "#f9fafb";
  });

  uploadContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = "#cbd5e0";
    uploadContainer.style.background = "#f9fafb";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleInlineImageFile(files[0]);
    }
  });

  // File input change
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleInlineImageFile(e.target.files[0]);
    }
  });

  // Remove image
  removeImageBtn.addEventListener("click", () => {
    uploadedImage = null;
    fileInput.value = "";
    uploadPrompt.style.display = "block";
    imagePreview.style.display = "none";
  });

  // Change image
  changeImageBtn.addEventListener("click", () => {
    fileInput.click();
  });

  function handleInlineImageFile(file) {
    // Use the shared validateImage function
    if (validateImage(file)) {
      uploadedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadPrompt.style.display = "none";
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      // Clear the input if validation fails
      fileInput.value = "";
      uploadedImage = null;
    }
  }

  // Store reference for form submission
  uploadContainer.getUploadedImage = () => uploadedImage;
}

function setupInlineAddressHandlers() {
  const addNewAddressBtn = document.getElementById("inlineAddNewAddressBtn");
  const newAddressForm = document.getElementById("inlineNewAddressForm");
  const saveNewAddressBtn = document.getElementById("inlineSaveNewAddressBtn");
  const cancelNewAddressBtn = document.getElementById(
    "inlineCancelNewAddressBtn"
  );
  const addressSelect = document.getElementById("inlineAddressSelect");

  // Show/hide new address form
  addNewAddressBtn.addEventListener("click", () => {
    const isVisible = newAddressForm.style.display !== "none";
    newAddressForm.style.display = isVisible ? "none" : "block";
    addNewAddressBtn.innerHTML = isVisible
      ? '<i class="fas fa-plus me-1"></i> Add New Address'
      : '<i class="fas fa-minus me-1"></i> Cancel New Address';
  });

  // Cancel new address
  cancelNewAddressBtn.addEventListener("click", () => {
    clearInlineAddressForm();
    newAddressForm.style.display = "none";
    addNewAddressBtn.innerHTML =
      '<i class="fas fa-plus me-1"></i> Add New Address';
  });

  // Save new address
  saveNewAddressBtn.addEventListener("click", () => {
    const newAddress = collectInlineAddressData();
    if (validateInlineAddress(newAddress)) {
      addInlineAddressToSelect(newAddress);
      clearInlineAddressForm();
      newAddressForm.style.display = "none";
      addNewAddressBtn.innerHTML =
        '<i class="fas fa-plus me-1"></i> Add New Address';
      showInlineSuccessMessage(
        "Address prepared! It will be saved when you create the property."
      );
    }
  });

  // When existing address is selected, clear new address form
  addressSelect.addEventListener("change", () => {
    if (addressSelect.value) {
      clearInlineAddressForm();
      newAddressForm.style.display = "none";
      addNewAddressBtn.innerHTML =
        '<i class="fas fa-plus me-1"></i> Add New Address';
    }
  });
}

function collectInlineAddressData() {
  return {
    street: document.getElementById("inlineNewStreet").value.trim(),
    barangay: document.getElementById("inlineNewBarangay").value.trim(),
    city: document.getElementById("inlineNewCity").value.trim(),
    province: document.getElementById("inlineNewProvince").value.trim(),
    postal_code: document.getElementById("inlineNewPostalCode").value.trim(),
    country: document.getElementById("inlineNewCountry").value.trim(),
  };
}

function validateInlineAddress(address) {
  const requiredFields = ["street", "city"];
  const missingFields = requiredFields.filter((field) => !address[field]);

  if (missingFields.length > 0) {
    alert(
      `Please fill in the following required fields: ${missingFields.join(
        ", "
      )}`
    );
    return false;
  }

  return true;
}

function addInlineAddressToSelect(newAddress) {
  const addressSelect = document.getElementById("inlineAddressSelect");
  const tempId = "temp_" + Date.now();

  const addressWithTempId = {
    ...newAddress,
    address_id: tempId,
    is_new: true,
  };

  const formatted = formatAddress(addressWithTempId, true);

  const option = document.createElement("option");
  option.value = tempId;
  option.textContent = `${formatted} (New - will be created)`;
  option.dataset.addressData = JSON.stringify(addressWithTempId);
  option.selected = true;

  addressSelect.appendChild(option);
}

function clearInlineAddressForm() {
  document.getElementById("inlineNewStreet").value = "";
  document.getElementById("inlineNewBarangay").value = "";
  document.getElementById("inlineNewCity").value = "";
  document.getElementById("inlineNewProvince").value = "";
  document.getElementById("inlineNewPostalCode").value = "";
  document.getElementById("inlineNewCountry").value = "Philippines";
}

async function loadInlineAddresses() {
  const addressSelect = document.getElementById("inlineAddressSelect");
  if (!addressSelect) return;

  // Remove any previous Tom Select instance
  if (window.inlineAddressTomSelect) {
    window.inlineAddressTomSelect.destroy();
    window.inlineAddressTomSelect = null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      const result = await response.json();
      if (result.addresses && Array.isArray(result.addresses)) {
        addressSelect.innerHTML =
          '<option value="">Select an existing address (optional)</option>';

        result.addresses.forEach((address) => {
          const lines = formatAddress(address, true);
          const option = document.createElement("option");
          option.value = address.address_id;
          option.textContent = `${lines.line1} — ${lines.line2}`;
          addressSelect.appendChild(option);
        });

        // Initialize Tom Select
        window.inlineAddressTomSelect = new TomSelect(addressSelect, {
          create: false,
          sortField: {
            field: "text",
            direction: "asc",
          },
          render: {
            option: function (data, escape) {
              let [line1, line2] = (data.text || "").split(" — ");
              return `<div>
                <span style="font-weight:600;">${escape(line1 || "")}</span><br>
                <span style="font-size:0.92em;color:#64748b;">${escape(
                  line2 || ""
                )}</span>
              </div>`;
            },
            item: function (data, escape) {
              let [line1, line2] = (data.text || "").split(" — ");
              return `<div>
                <span style="font-weight:600;">${escape(line1 || "")}</span>
                <span style="font-size:0.92em;color:#64748b;">${escape(
                  line2 || ""
                )}</span>
              </div>`;
            },
          },
          placeholder: "Select an existing address (optional)",
        });

        return;
      }
      throw new Error("Invalid response format");
    } else {
      throw new Error(`Server error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching addresses for CREATE form:", error);
    populateAddressSelectFromCachedProperties(addressSelect, properties);
  }
}

async function handleInlineFormSubmit(event) {
  event.preventDefault();

  if (!validateForm(false)) {
    const submitBtn = document.getElementById("inlineSubmitBtn");
    submitBtn.style.animation = "shake 0.5s ease-in-out";
    setTimeout(() => {
      submitBtn.style.animation = "";
    }, 500);

    showInlineErrorMessage(
      "Please fix the validation errors before submitting."
    );
    return;
  }

  const submitBtn = document.getElementById("inlineSubmitBtn");
  const originalText = submitBtn.innerHTML;

  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-1"></i> Adding Property...';

    // Create FormData
    const formData = new FormData(event.target);

    // Handle address data
    const addressSelect = document.getElementById("inlineAddressSelect");
    if (addressSelect.value && addressSelect.value !== "") {
      if (addressSelect.value.startsWith("temp_")) {
        // New address
        const selectedOption =
          addressSelect.options[addressSelect.selectedIndex];
        const addressData = JSON.parse(selectedOption.dataset.addressData);

        delete addressData.address_id;
        delete addressData.is_new;

        // Add address fields to form data
        Object.entries(addressData).forEach(([key, value]) => {
          if (value && value.trim()) {
            formData.append(key, value);
          }
        });

        formData.delete("address_id");
      } else {
        // Existing address
        formData.set("address_id", addressSelect.value);
      }
    } else {
      formData.delete("address_id");
    }

    // Add uploaded image
    const uploadContainer = document.getElementById(
      "inlineImageUploadContainer"
    );
    const uploadedImage = uploadContainer.getUploadedImage();
    if (uploadedImage) {
      formData.set("display_image", uploadedImage);
    }

    const response = await fetch(API_BASE_URL + "/create-property", {
      method: "POST",
      body: formData,
    });

    // Check if response is ok
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error ||
            errorData.message ||
            `Server error: ${response.status}`;
        } catch (jsonError) {
          console.error("Failed to parse error JSON:", jsonError);
          errorMessage = `Server error: ${response.status} - ${response.statusText}`;
        }
      } else {
        // Get text response for non-JSON errors
        try {
          const errorText = await response.text();
          console.error("Server error response:", errorText);
          errorMessage =
            errorText ||
            `Server error: ${response.status} - ${response.statusText}`;
        } catch (textError) {
          console.error("Failed to get error text:", textError);
          errorMessage = `Server error: ${response.status} - ${response.statusText}`;
        }
      }

      throw new Error(errorMessage);
    }

    // Try to parse successful response
    let result;
    try {
      const responseText = await response.text();

      if (!responseText.trim()) {
        throw new Error("Server returned empty response");
      }

      result = JSON.parse(responseText);
      console.log("Property created successfully:", result);
    } catch (jsonError) {
      console.error("Failed to parse success response:", jsonError);
      throw new Error("Server returned invalid response format");
    }

    await loadProperties();

    showInlineSuccessMessage("Property added successfully!");

    // Navigate directly to properties list without confirmation
    setTimeout(() => {
      navigateToPropertiesListDirectly();
    }, 1500);
  } catch (error) {
    console.error("Error creating property:", error);
    showInlineErrorMessage(
      error.message || "Failed to add property. Please try again."
    );
  } finally {
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Add this new function to reset form without user interaction
function resetInlineFormSilently() {
  const form = document.getElementById("inlineAddPropertyForm");
  if (form) {
    form.reset();
  }

  // Clear all validation errors
  clearAllErrors(false);

  // Reset image upload
  const uploadContainer = document.getElementById("inlineImageUploadContainer");
  const uploadPrompt = document.getElementById("inlineUploadPrompt");
  const imagePreview = document.getElementById("inlineImagePreview");
  const fileInput = document.getElementById("inlineDisplayImageInput");

  if (fileInput) fileInput.value = "";
  if (uploadPrompt) uploadPrompt.style.display = "block";
  if (imagePreview) imagePreview.style.display = "none";

  // Reset address form
  clearInlineAddressForm();
  const newAddressForm = document.getElementById("inlineNewAddressForm");
  const addNewAddressBtn = document.getElementById("inlineAddNewAddressBtn");
  if (newAddressForm) newAddressForm.style.display = "none";
  if (addNewAddressBtn)
    addNewAddressBtn.innerHTML =
      '<i class="fas fa-plus me-1"></i> Add New Address';
}

// Update the setupInlineForm function to include validation setup
function setupInlineForm() {
  if (inlineFormHandler) return; // Already setup

  // Setup image upload
  setupInlineImageUpload();

  // Setup address handlers
  setupInlineAddressHandlers();

  // Setup real-time validation
  setupRealTimeValidation(false);

  // Setup form submission
  const form = document.getElementById("inlineAddPropertyForm");
  form.addEventListener("submit", handleInlineFormSubmit);

  // Load existing addresses
  loadInlineAddresses();

  inlineFormHandler = true;
}

// Update resetInlineForm to clear validation errors
function resetInlineForm() {
  const form = document.getElementById("inlineAddPropertyForm");
  if (form) {
    form.reset();
  }

  // Clear all validation errors
  clearAllErrors(false);

  // Reset image upload
  const uploadContainer = document.getElementById("inlineImageUploadContainer");
  const uploadPrompt = document.getElementById("inlineUploadPrompt");
  const imagePreview = document.getElementById("inlineImagePreview");
  const fileInput = document.getElementById("inlineDisplayImageInput");

  if (fileInput) fileInput.value = "";
  if (uploadPrompt) uploadPrompt.style.display = "block";
  if (imagePreview) imagePreview.style.display = "none";

  // Reset address form
  clearInlineAddressForm();
  resetEditInlineForm();
  const newAddressForm = document.getElementById("inlineNewAddressForm");
  const addNewAddressBtn = document.getElementById("inlineAddNewAddressBtn");
  if (newAddressForm) newAddressForm.style.display = "none";
  if (addNewAddressBtn)
    addNewAddressBtn.innerHTML =
      '<i class="fas fa-plus me-1"></i> Add New Address';

  // Remove Tom Select instances if they exist
  if (window.inlineAddressTomSelect) {
    window.inlineAddressTomSelect.destroy();
    window.inlineAddressTomSelect = null;
  }
  if (window.editInlineAddressTomSelect) {
    window.editInlineAddressTomSelect.destroy();
    window.editInlineAddressTomSelect = null;
  }
}

function showInlineSuccessMessage(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    z-index: 1000000;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showInlineErrorMessage(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    z-index: 1000000;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

const FIELD_VALIDATION_RULES = {
  propertyName: {
    required: true,
    message: "Property name is required",
  },
  floorArea: {
    required: true,
    min: 0.01,
    message: "Floor area must be greater than 0",
  },
  propertyStatus: {
    required: true,
    message: "Property status is required",
  },
  baseRent: {
    required: true,
    min: 0,
    message: "Monthly rent must be greater than or equal to 0",
  },
  advanceMonths: {
    required: true,
    min: 0,
    message: "Advance payment must be greater than or equal to 0",
  },
  securityDeposit: {
    required: true,
    min: 0,
    message: "Security deposit must be greater than or equal to 0",
  },
  leaseTerm: {
    required: true,
    min: 1,
    message: "Minimum lease term must be at least 1 month",
  },
};

// Helper function to generate form-specific field configs
function getFieldConfig(fieldName, isEditForm = false) {
  const baseConfig = FIELD_VALIDATION_RULES[fieldName];
  const prefix = isEditForm ? "edit" : "";
  const capitalizedFieldName =
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

  return {
    id: isEditForm ? `edit${capitalizedFieldName}` : fieldName,
    errorId: isEditForm
      ? `edit${capitalizedFieldName}Error`
      : `${fieldName}Error`,
    ...baseConfig,
  };
}

// Unified validation functions
function validateField(fieldConfig) {
  const field = document.getElementById(fieldConfig.id);
  const errorElement = document.getElementById(fieldConfig.errorId);

  if (!field || !errorElement) {
    console.warn(`Field or error element not found: ${fieldConfig.id}`);
    return true; // Skip validation if elements don't exist
  }

  const value = field.value.trim();

  // Clear previous error state
  clearFieldError(field, errorElement);

  // Check if required field is empty
  if (fieldConfig.required && !value) {
    showFieldError(field, errorElement, fieldConfig.message);
    return false;
  }

  // Check minimum value for numeric fields
  if (fieldConfig.min !== undefined && value) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < fieldConfig.min) {
      showFieldError(field, errorElement, fieldConfig.message);
      return false;
    }
  }

  // If validation passes, show success state
  showFieldSuccess(field);
  return true;
}

function showFieldError(field, errorElement, message) {
  field.classList.add("error");
  field.classList.remove("success");
  errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
  errorElement.classList.add("show");

  // Add pulse animation to label
  const label = field.closest(".form-group").querySelector("label");
  if (label) {
    label.classList.add("required-highlight");
    setTimeout(() => label.classList.remove("required-highlight"), 500);
  }
}

function showFieldSuccess(field) {
  field.classList.remove("error");
  field.classList.add("success");
}

function clearFieldError(field, errorElement) {
  field.classList.remove("error", "success");
  errorElement.classList.remove("show");
  errorElement.innerHTML = "";
}

// Unified form validation function
function validateForm(isEditForm = false) {
  const formContainer = isEditForm
    ? "#editPropertyFormContainer"
    : "#addPropertyFormContainer";

  // Clear all errors for the specific form
  clearAllErrors(isEditForm);

  const errors = [];
  let isValid = true;

  // Validate each field
  Object.keys(FIELD_VALIDATION_RULES).forEach((fieldName) => {
    const fieldConfig = getFieldConfig(fieldName, isEditForm);
    if (!validateField(fieldConfig)) {
      errors.push(fieldConfig.message);
      isValid = false;
    }
  });

  // Show validation summary if there are errors
  if (errors.length > 0) {
    showValidationSummary(errors, isEditForm);

    // Scroll to first error
    const firstErrorField = document.querySelector(
      `${formContainer} .form-group input.error, ${formContainer} .form-group select.error`
    );
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      firstErrorField.focus();
    }
  }

  return isValid;
}

function clearAllErrors(isEditForm = false) {
  Object.keys(FIELD_VALIDATION_RULES).forEach((fieldName) => {
    const fieldConfig = getFieldConfig(fieldName, isEditForm);
    const field = document.getElementById(fieldConfig.id);
    const errorElement = document.getElementById(fieldConfig.errorId);
    if (field && errorElement) {
      clearFieldError(field, errorElement);
    }
  });

  // Hide validation summary
  const summaryId = isEditForm ? "editValidationSummary" : "validationSummary";
  const validationSummary = document.getElementById(summaryId);
  if (validationSummary) {
    validationSummary.classList.remove("show");
  }
}

function showValidationSummary(errors, isEditForm = false) {
  const summaryId = isEditForm ? "editValidationSummary" : "validationSummary";
  const formContainer = isEditForm
    ? "#editPropertyFormContainer"
    : "#addPropertyFormContainer";

  // Create validation summary if it doesn't exist
  let validationSummary = document.getElementById(summaryId);
  if (!validationSummary) {
    validationSummary = document.createElement("div");
    validationSummary.id = summaryId;
    validationSummary.className = "validation-summary";

    // Insert at the beginning of the first form section
    const firstFormSection = document.querySelector(
      `${formContainer} .form-section`
    );
    if (firstFormSection) {
      firstFormSection.insertBefore(
        validationSummary,
        firstFormSection.firstChild
      );
    }
  }

  const errorList = errors.map((error) => `<li>${error}</li>`).join("");
  validationSummary.innerHTML = `
    <h5><i class="fas fa-exclamation-triangle me-2"></i>Please fix the following errors:</h5>
    <ul>${errorList}</ul>
  `;

  validationSummary.classList.add("show");
  validationSummary.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Unified real-time validation setup
function setupRealTimeValidation(isEditForm = false) {
  const formContainer = isEditForm
    ? "#editPropertyFormContainer"
    : "#addPropertyFormContainer";

  Object.keys(FIELD_VALIDATION_RULES).forEach((fieldName) => {
    const fieldConfig = getFieldConfig(fieldName, isEditForm);
    const field = document.getElementById(fieldConfig.id);

    if (field) {
      // Remove existing listeners to prevent duplicates
      field.removeEventListener("blur", field._validateOnBlur);
      field.removeEventListener("input", field._clearErrorOnInput);

      // Validate on blur (when user leaves the field)
      field._validateOnBlur = () => validateField(fieldConfig);
      field.addEventListener("blur", field._validateOnBlur);

      // Clear error on input (when user starts typing)
      field._clearErrorOnInput = () => {
        if (field.classList.contains("error")) {
          const errorElement = document.getElementById(fieldConfig.errorId);
          clearFieldError(field, errorElement);

          // Hide validation summary if all errors are cleared
          const remainingErrors = document.querySelectorAll(
            `${formContainer} .error-message.show`
          );
          if (remainingErrors.length === 0) {
            const summaryId = isEditForm
              ? "editValidationSummary"
              : "validationSummary";
            const validationSummary = document.getElementById(summaryId);
            if (validationSummary) {
              validationSummary.classList.remove("show");
            }
          }
        }
      };
      field.addEventListener("input", field._clearErrorOnInput);
    }
  });
}

function resetEditInlineForm() {
  const form = document.getElementById("inlineEditPropertyForm");
  if (form) {
    form.reset();
  }

  // Clear all validation errors
  clearAllErrors(true);

  // Reset display image upload
  const uploadContainer = document.getElementById(
    "editInlineImageUploadContainer"
  );
  const uploadPrompt = document.getElementById("editInlineUploadPrompt");
  const imagePreview = document.getElementById("editInlineImagePreview");
  const fileInput = document.getElementById("editInlineDisplayImageInput");

  if (fileInput) fileInput.value = "";
  if (uploadPrompt) uploadPrompt.style.display = "block";
  if (imagePreview) imagePreview.style.display = "none";

  // Reset showcase images
  editShowcaseImages = [];
  deletedShowcaseImages = []; // Clear deleted images list
  renderEditShowcasePreview();

  // Reset address form
  clearEditInlineAddressForm();
  const newAddressForm = document.getElementById("editInlineNewAddressForm");
  const addNewAddressBtn = document.getElementById(
    "editInlineAddNewAddressBtn"
  );
  if (newAddressForm) newAddressForm.style.display = "none";
  if (addNewAddressBtn)
    addNewAddressBtn.innerHTML =
      '<i class="fas fa-plus me-1"></i> Add New Address';
}

function navigateToPropertiesListDirectly() {
  isAddingProperty = false;
  isEditingProperty = false;
  currentEditPropertyId = null;

  // Hide all forms and views without confirmation
  const addContainer = document.getElementById("addPropertyFormContainer");
  const editContainer = document.getElementById("editPropertyFormContainer");
  const detailsContainer = document.getElementById(
    "propertyDetailsViewContainer"
  );

  if (addContainer) addContainer.style.display = "none";
  if (editContainer) editContainer.style.display = "none";
  if (detailsContainer) detailsContainer.style.display = "none";

  // Show properties grid
  showPropertiesGrid();

  // Update breadcrumb
  updateBreadcrumb();

  // Reset forms silently (without user prompts)
  resetInlineFormSilently();
  resetEditInlineForm();

  // Ensure proper visibility reset
  const addPropertyBtn = document.querySelector(".new-ticket-btn");
  const propertyControls = document.getElementById("propertyControls");

  if (addPropertyBtn) addPropertyBtn.style.display = "flex";
  if (propertyControls) propertyControls.style.display = "flex";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPropertyDetails(propertyId) {
  // Hide all other views
  document.getElementById("propertiesGrid").style.display = "none";
  const addContainer = document.getElementById("addPropertyFormContainer");
  const editContainer = document.getElementById("editPropertyFormContainer");
  const paginationContainer = document.getElementById("paginationContainer");

  if (paginationContainer) paginationContainer.style.display = "none";
  if (addContainer) addContainer.style.display = "none";
  if (editContainer) editContainer.style.display = "none";

  // Show details view
  const detailsContainer = document.getElementById(
    "propertyDetailsViewContainer"
  );
  if (detailsContainer) detailsContainer.style.display = "block";

  // Update breadcrumb
  const property = properties.find((p) => p.id === propertyId);
  updateBreadcrumb([
    {
      text: '<i class="fas fa-home me-2"></i>Properties',
      onclick: "navigateToPropertiesListDirectly()",
    },
    {
      text: `<i class="fas fa-eye me-2"></i>${
        property ? property.property_name : "Property Details"
      }`,
      active: true,
    },
  ]);

  // Populate details
  if (property) {
    populatePropertyDetails(property);
  }
}

function hidePropertyDetails() {
  const detailsContainer = document.getElementById(
    "propertyDetailsViewContainer"
  );
  if (detailsContainer) detailsContainer.style.display = "none";

  const addressFilterDropdown = document.getElementById(
    "addressFilterDropdownContainer"
  );
  if (addressFilterDropdown) addressFilterDropdown.style.display = "none";
}

// Update your delete function to reload properties after successful deletion
async function removeProperty(propertyId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${propertyId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      const result = await response.json();

      // Show success message
      showSuccessMessage(result.message || "Property deleted successfully!");

      // 🔥 Reload properties to update the UI
      await loadProperties();
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete property: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error deleting property:", error);
    showErrorMessage(error.message || "Failed to delete property");
  }
}

function populatePropertyDetails(property) {
  // Set title
  const titleElement = document.getElementById("detailsTitle");
  if (titleElement) {
    titleElement.textContent = property.property_name || "Property Details";
  }

  // Prepare all images (display image + showcase images)
  const allImages = [];
  if (property.display_image) {
    allImages.push({
      url: property.display_image,
      description: "Main Display Image",
    });
  }
  if (property.property_pictures && property.property_pictures.length > 0) {
    property.property_pictures.forEach((picture, index) => {
      allImages.push({
        url: picture.image_url,
        description: picture.image_desc || `Showcase Image ${index + 1}`,
      });
    });
  }
  if (allImages.length === 0) {
    allImages.push({
      url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      description: "No Image Available",
    });
  }

  // Carousel state
  let currentIndex = 0;

  // DOM elements
  const mainImg = document.getElementById("carouselMainImage");
  const desc = document.getElementById("carouselImageDescription");
  const prevBtn = document.getElementById("carouselPrevBtn");
  const nextBtn = document.getElementById("carouselNextBtn");
  const thumbs = document.getElementById("carouselThumbnails");
  const zoomBtn = document.getElementById("zoomImageBtn");

  function updateCarousel(idx) {
    currentIndex = idx;
    mainImg.src = allImages[idx].url;
    mainImg.alt = allImages[idx].description;
    desc.textContent = allImages[idx].description || "";
    // Highlight thumbnail
    thumbs.querySelectorAll(".carousel-thumbnail").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === idx);
    });
    // Show/hide arrows
    prevBtn.style.display = allImages.length > 1 ? "" : "none";
    nextBtn.style.display = allImages.length > 1 ? "" : "none";
    zoomBtn.style.display = "block";
  }

  // Thumbnails
  thumbs.innerHTML = allImages
    .map(
      (img, i) =>
        `<img src="${img.url}" alt="Thumb ${i + 1}" class="carousel-thumbnail${
          i === 0 ? " active" : ""
        }" data-idx="${i}">`
    )
    .join("");
  thumbs.querySelectorAll(".carousel-thumbnail").forEach((thumb, i) => {
    thumb.onclick = () => updateCarousel(i);
  });

  // Arrows
  prevBtn.onclick = () =>
    updateCarousel((currentIndex - 1 + allImages.length) % allImages.length);
  nextBtn.onclick = () => updateCarousel((currentIndex + 1) % allImages.length);

  // Zoom
  zoomBtn.onclick = () => openZoomModal(allImages[currentIndex].url);

  // Initial load
  updateCarousel(0);

  // --- NEW: Populate Property Description Card ---
  document.getElementById("detailPropertyName").textContent =
    property.property_name || "N/A";
  document.getElementById("detailFloorArea").textContent =
    property.floor_area_sqm ? `${property.floor_area_sqm} m²` : "N/A";
  document.getElementById("detailLocation").textContent =
    property.location || "N/A";
  document.getElementById("detailDescription").textContent =
    property.description || "No description available";
  document.getElementById("detailStatus").textContent =
    property.status.charAt(0).toUpperCase() + property.status.slice(1);
  document.getElementById("detailStatus").className =
    "details-value status " + property.status;

  // --- Lease Requirements Card ---
  document.getElementById(
    "detailPrice"
  ).textContent = `₱${property.base_rent.toLocaleString()}`;
  document.getElementById(
    "detailLeaseTerm"
  ).textContent = `${property.minimum_lease_term_months} months`;
  document.getElementById(
    "detailSecurityDeposit"
  ).textContent = `${property.security_deposit_months} months`;
  document.getElementById(
    "detailAdvanceMonths"
  ).textContent = `${property.advance_months} months`;
  document.getElementById("detailLastUpdated").textContent = formatDate(
    property.updated_at
  );
}

function openZoomModal(imgSrc) {
  const modal = document.getElementById("zoomImageModal");
  const img = document.getElementById("zoomedImage");
  if (modal && img) {
    img.src = imgSrc;
    modal.style.display = "flex";
    document.body.classList.add("modal-open");
  }
}

function closeZoomModal() {
  const modal = document.getElementById("zoomImageModal");
  if (modal) {
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  }
}

window.removeEditShowcaseImage = removeEditShowcaseImage;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.openEditPropertyForm = openEditPropertyForm;
window.closeEditModal = closeEditModal;
window.closeDetailsModal = closeDetailsModal;
window.showPropertyDetails = showPropertyDetails;
window.toggleDropdown = toggleDropdown;
window.filterByStatus = filterByStatus;
window.closeZoomModal = closeZoomModal;
window.showAddPropertyForm = showAddPropertyForm;
window.hideAddPropertyForm = hideAddPropertyForm;
window.showEditPropertyForm = showEditPropertyForm;
window.hideEditPropertyForm = hideEditPropertyForm;
window.navigateToPropertiesListDirectly = navigateToPropertiesListDirectly;

window.goToPage = function (page) {
  if (page < 1) page = 1;
  currentPage = page;
  loadProperties(page, pageSize); 
  const grid = document.getElementById("propertiesGrid");
  if (grid) {
    grid.scrollIntoView({ behavior: "smooth" });
  }
};

// Add CSS animation for loading spinner
const style = document.createElement("style");
style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
document.head.appendChild(style);
