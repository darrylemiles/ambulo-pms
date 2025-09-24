let allUsers = [];
let allProperties = [];
let userLeases = {};

import formatCurrency from "../utils/formatCurrency.js";
import formatStatus from "../utils/formatStatus.js";
import formatRequestType from "../utils/formatRequestType.js";
import formatPriority from "../utils/formatPriority.js";
import formatDate from "../utils/formatDate.js";
import formatAttachments from "../utils/formatAttachments.js";
import fetchCompanyDetails from "../api/loadCompanyInfo.js";

let tickets = [];
let allTickets = [];
let currentlyExpandedTicket = null;

let minDate = null;
let maxDate = null;
let currentFromDate = null;
let currentToDate = null;

// Global variables for tenant data
let tenantsList = [];
let filteredTenants = [];
let selectedTenantIndex = -1;

document.addEventListener("DOMContentLoaded", function () {
  const profileBtn = document.getElementById("profileBtn");
  const dropdownMenu = document.getElementById("profileMenu");

  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
      if (
        !profileBtn.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.classList.remove("show");
      }
    });
  }

  const logoutLink = document.querySelector('a[href="login.html"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  loadTickets();

  setInterval(checkAndUpdateTicketStatuses, 1 * 60 * 1000);
  setTimeout(checkAndUpdateTicketStatuses, 2000);

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterTickets);
  }

  initializeDatePickers();

  initializeFileUpload();
  initializeModal();
  initializeEditModal();

  const sidebarToggle =
    document.querySelector(".mobile-menu-btn") ||
    document.querySelector(".sidebar-toggle") ||
    document.querySelector("[data-sidebar-toggle]");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      const mainContent = document.getElementById("mainContent");
      const isExpanded = mainContent.classList.contains("expanded");

      if (isExpanded) {
        mainContent.classList.remove("expanded");
      } else {
        mainContent.classList.add("expanded");
      }
    });
  }

  const sidebar =
    document.querySelector(".sidebar") ||
    document.querySelector("#sidebar") ||
    document.querySelector("[data-sidebar]");

  if (sidebar) {
    const sidebarRect = sidebar.getBoundingClientRect();
    const isVisible =
      sidebarRect.width > 0 &&
      window.getComputedStyle(sidebar).visibility !== "hidden";

    const mainContent = document.getElementById("mainContent");
    if (!isVisible) {
      mainContent.classList.add("expanded");
    }
  }
});

async function setDynamicInfo() {
  const company = await fetchCompanyDetails();
  if (!company) return;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  document.title = company.company_name
    ? `Maintenance - ${company.company_name}`
    : "Maintenance";
}

document.addEventListener("DOMContentLoaded", () => {
  setDynamicInfo();
});


async function fetchAllUsersAndProperties() {

  let page = 1;
  let users = [];
  let hasMore = true;
  while (hasMore) {
    const usersRes = await fetch(`/api/v1/users?page=${page}`, { credentials: "include" });
    const usersData = await usersRes.json();
    const pageUsers = usersData.users || [];
    users = users.concat(pageUsers);
    hasMore = pageUsers.length === 6;
    page++;
  }
  allUsers = users;

  let props = [];
  let propPage = 1;
  let propHasMore = true;
  while (propHasMore) {
    const propsRes = await fetch(`/api/v1/properties?page=${propPage}`, { credentials: "include" });
    const propsData = await propsRes.json();
    const pageProps = propsData.properties || [];
    props = props.concat(pageProps);
    propHasMore = pageProps.length === 6;
    propPage++;
  }
  allProperties = props;

  const leasesRes = await fetch("/api/v1/leases", { credentials: "include" });
  const leasesData = await leasesRes.json();
  userLeases = {};
  (leasesData.leases || []).forEach(lease => {
    if (!userLeases[lease.user_id]) userLeases[lease.user_id] = [];
    userLeases[lease.user_id].push({ lease_id: lease.lease_id, property_id: lease.property_id });
  });
}

function populateRequestedByDropdown() {
  const requestedBySelect = document.getElementById("requestedBy");
  if (!requestedBySelect) return;
  requestedBySelect.innerHTML = "";

  allUsers.forEach(user => {
    const hasActiveLease = userLeases[user.user_id] && userLeases[user.user_id].length > 0;
    if (hasActiveLease) {
      const option = document.createElement("option");
      option.value = user.user_id;
      let nameParts = [user.first_name, user.middle_name, user.last_name, user.suffix].filter(Boolean);
      let displayName = nameParts.join(" ");
      if (!displayName) displayName = user.full_name || user.name || user.username || "";
      option.textContent = displayName;
      option.setAttribute("data-userid", user.user_id);
      requestedBySelect.appendChild(option);
    }
  });

  const adminOptionExists = Array.from(requestedBySelect.options).some(opt => opt.value === "ADMIN");
  if (!adminOptionExists) {
    const adminOption = document.createElement("option");
    adminOption.value = "ADMIN";
    adminOption.textContent = "Admin";
    adminOption.setAttribute("data-userid", "ADMIN");
    requestedBySelect.appendChild(adminOption);
  }
}

function populateUnitNoDropdown(userId) {
  const unitNoSelect = document.getElementById("unitNo");
  if (!unitNoSelect) return;
  unitNoSelect.innerHTML = "";
  let options = [];
  if (!userId) return;

  if (userId === "ADMIN") {
    options = allProperties.map(prop => {
      const hasLease = Object.values(userLeases).some(leases => leases.some(l => l.property_id === prop.property_id));
      let label = prop.property_name;
      if (hasLease) {
        label = "\u{1F7E2} " + label;
      }
      return { value: prop.property_id, label, address: prop.building_address || "" };
    });
  } else {
    const user = allUsers.find(u => u.user_id === userId);
    if (user && user.role === "ADMIN") {
      options = allProperties.map(prop => ({ value: prop.property_id, label: prop.property_name, address: prop.building_address || "" }));
    } else if (userLeases[userId]) {
      options = userLeases[userId].map(lease => {
        const prop = allProperties.find(p => p.property_id === lease.property_id);
        return prop ? { value: lease.lease_id, label: prop.property_name, address: prop.building_address || "" } : null;
      }).filter(Boolean);
    }
  }
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.innerHTML = `<span style='font-weight:500;'>${opt.label}</span>${opt.address ? `<br><span style='font-size:12px;color:#888;'>${opt.address}</span>` : ""}`;
    if (opt.address) {
      option.setAttribute("data-address", opt.address);
    }
    unitNoSelect.appendChild(option);
  });

  if (unitNoSelect.tomselect) {
    unitNoSelect.tomselect.clearOptions();
    options.forEach(opt => {
      unitNoSelect.tomselect.addOption({ value: opt.value, text: opt.label, address: opt.address });
    });
    unitNoSelect.tomselect.refreshOptions(false);
  }
}

function initializeTomSelectDropdowns() {
  new TomSelect("#requestedBy", {
    create: false,
    sortField: { field: "text", direction: "asc" },
    placeholder: "Select or search user...",
    pagination: false,
    maxOptions: 1000,
    onChange: function(value) {
      const unitNoSelect = document.getElementById("unitNo");
      if (unitNoSelect) {
        while (unitNoSelect.options.length > 0) {
          unitNoSelect.remove(0);
        }
        if (unitNoSelect.tomselect) {
          unitNoSelect.tomselect.clear();
          unitNoSelect.tomselect.clearOptions();
          unitNoSelect.tomselect.refreshOptions(false);
        }
      }
      populateUnitNoDropdown(value);
      if (unitNoSelect && unitNoSelect.options.length === 1) {
        unitNoSelect.selectedIndex = 0;
      }
    },
    render: {
      option: function(data, escape) {
        // Show user_id as subtitle in dropdown options
        let userId = "";
        if (data.$option) {
          userId = data.$option.getAttribute("data-userid") || "";
        }
        return `<div>
          <div style='font-weight:500;'>${escape(data.text)}</div>
          <div style='font-size:12px;color:#888;'>${escape(userId)}</div>
        </div>`;
      },
      item: function(data, escape) {
        return `<div style='font-weight:500;'>${escape(data.text)}</div>`;
      }
    }
  });
  new TomSelect("#unitNo", {
    create: false,
    sortField: { field: "text", direction: "asc" },
    placeholder: "Select property...",
    render: {
      option: function(data, escape) {
        let address = data.address || "";
        return `<div>
          <div style='font-weight:500;'>${escape(data.text)}</div>
          ${address ? `<div style='font-size:12px;color:#888;'>${escape(address)}</div>` : ""}
        </div>`;
      },
      item: function(data, escape) {
        return `<div style='font-weight:500;'>${escape(data.text)}</div>`;
      }
    }
  });
}

async function setupNewTicketModalDropdowns() {
  await fetchAllUsersAndProperties();
  populateRequestedByDropdown();
  initializeTomSelectDropdowns();
}

document.addEventListener("DOMContentLoaded", () => {
  setupNewTicketModalDropdowns();
});

function initializeDatePickers() {
  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");

  if (fromDateInput && toDateInput) {
    fromDateInput.addEventListener("change", function () {
      currentFromDate = this.value;
      updateToDateRestrictions();
      filterTicketsByDateRange();
    });

    toDateInput.addEventListener("change", function () {
      currentToDate = this.value;
      updateFromDateRestrictions();
      filterTicketsByDateRange();
    });
  }
}

function updateDateRestrictions() {
  if (allTickets.length === 0) return;

  const createdDates = allTickets
    .map((ticket) => {
      const createdDate = new Date(ticket.created_at);
      return createdDate;
    })
    .filter((date) => !isNaN(date));

  const endDates = allTickets
    .map((ticket) => {
      if (ticket.end_date) {
        const endDate = new Date(ticket.end_date);
        return endDate;
      }
      return null;
    })
    .filter((date) => date !== null && !isNaN(date));
  if (createdDates.length === 0) return;

  minDate = new Date(Math.min(...createdDates));

  if (endDates.length > 0) {
    maxDate = new Date(Math.max(...endDates));
  } else {
    maxDate = new Date(Math.max(...createdDates));
    console.log("No end_dates found, using latest created_at as maxDate");
  }

  const minDateStr = minDate.toISOString().split("T")[0];
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");

  if (fromDateInput && toDateInput) {
    fromDateInput.min = minDateStr;
    fromDateInput.max = maxDateStr;
    toDateInput.min = minDateStr;
    toDateInput.max = maxDateStr;

    if (!currentFromDate) {
      currentFromDate = minDateStr;
      fromDateInput.value = minDateStr;
    }

    if (!currentToDate) {
      currentToDate = maxDateStr;
      toDateInput.value = maxDateStr;
    }

  }
}

function updateToDateRestrictions() {
  const toDateInput = document.getElementById("toDate");
  if (toDateInput && currentFromDate) {
    toDateInput.min = currentFromDate;

    if (currentToDate && currentToDate < currentFromDate) {
      currentToDate = currentFromDate;
      toDateInput.value = currentFromDate;
    }
  }
}

function updateFromDateRestrictions() {
  const fromDateInput = document.getElementById("fromDate");
  if (fromDateInput && currentToDate) {
    fromDateInput.max = currentToDate;

    if (currentFromDate && currentFromDate > currentToDate) {
      currentFromDate = currentToDate;
      fromDateInput.value = currentToDate;
    }
  }
}

function filterTicketsByDateRange() {
  let filteredTickets = allTickets;

  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  if (searchTerm) {
    filteredTickets = filteredTickets.filter((ticket) => {
      return (
        ticket.ticket_id?.toLowerCase().includes(searchTerm) ||
        ticket.ticket_title?.toLowerCase().includes(searchTerm) ||
        ticket.description?.toLowerCase().includes(searchTerm) ||
        ticket.assigned_to?.toLowerCase().includes(searchTerm) ||
        ticket.user_id?.toLowerCase().includes(searchTerm) ||
        ticket.requested_by_name?.toLowerCase().includes(searchTerm) ||
        ticket.requested_by_email?.toLowerCase().includes(searchTerm) ||
        ticket.ticket_status?.toLowerCase().includes(searchTerm) ||
        ticket.priority?.toLowerCase().includes(searchTerm) ||
        ticket.request_type?.toLowerCase().includes(searchTerm)
      );
    });
  }

  if (currentFromDate && currentToDate) {
    const fromDate = new Date(currentFromDate);
    const toDate = new Date(currentToDate);

    toDate.setHours(23, 59, 59, 999);

    filteredTickets = filteredTickets.filter((ticket) => {
      const ticketCreatedDate = new Date(ticket.created_at);
      const ticketEndDate = ticket.end_date ? new Date(ticket.end_date) : null;

      const createdInRange =
        ticketCreatedDate >= fromDate && ticketCreatedDate <= toDate;
      const endInRange =
        ticketEndDate && ticketEndDate >= fromDate && ticketEndDate <= toDate;
      const spansRange =
        ticketCreatedDate <= fromDate &&
        ticketEndDate &&
        ticketEndDate >= toDate;

      return createdInRange || endInRange || spansRange;
    });
  }

  tickets = filteredTickets;
  renderTickets();
  updateFilterStatus();
}

function updateFilterStatus() {
  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");

  if (fromDateInput && toDateInput && currentFromDate && currentToDate) {
    const fromDate = new Date(currentFromDate);
    const toDate = new Date(currentToDate);

    const fromFormatted = fromDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const toFormatted = toDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const activeTickets = tickets.filter(
      (t) => t.ticket_status !== "completed"
    ).length;
  }
}

function filterTickets() {
  filterTicketsByDateRange();
}

async function loadTickets() {
  try {
    const response = await fetch("/api/v1/tickets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      allTickets = data.tickets || [];
      tickets = allTickets;

      updateDateRestrictions();

      renderTickets();
    } else {
      console.error("Failed to load tickets:", response.statusText);
      renderTickets();
    }
  } catch (error) {
    console.error("Error loading tickets:", error);
    renderTickets();
  }
}

function clearFilters() {
  const searchInput = document.getElementById("searchInput");
  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");

  if (searchInput) {
    searchInput.value = "";
  }

  if (fromDateInput && toDateInput && minDate && maxDate) {
    const minDateStr = minDate.toISOString().split("T")[0];
    const maxDateStr = maxDate.toISOString().split("T")[0];

    currentFromDate = minDateStr;
    currentToDate = maxDateStr;

    fromDateInput.value = minDateStr;
    toDateInput.value = maxDateStr;

    fromDateInput.min = minDateStr;
    fromDateInput.max = maxDateStr;
    toDateInput.min = minDateStr;
    toDateInput.max = maxDateStr;
  }

  tickets = allTickets;
  renderTickets();
}

function renderTickets() {
  const container = document.getElementById("ticketsContainer");
  if (!container) return;

  if (tickets.length === 0) {
    container.innerHTML = '<div class="no-tickets">No tickets found</div>';
    return;
  }

  const ticketRows = tickets
    .map((ticket) => {
      const statusClass = ticket.ticket_status
        ? `status-${ticket.ticket_status.toLowerCase().replace(/[^a-z_]/g, "")}`
        : "status-pending";
      const priorityClass = ticket.priority
        ? `priority-${ticket.priority.toLowerCase()}`
        : "priority-medium";
      const isPending =
        ticket.ticket_status &&
        ticket.ticket_status.toUpperCase() ===
          AppConstants.TICKET_STATUSES.PENDING;
      let attachmentsForDisplay = ticket.attachments;
      if (Array.isArray(attachmentsForDisplay)) {
        attachmentsForDisplay = attachmentsForDisplay.join(",");
      } else if (attachmentsForDisplay && typeof attachmentsForDisplay !== "string") {
        attachmentsForDisplay = String(attachmentsForDisplay);
      }

      let startDateDisplay = "Not set";
      let endDateDisplay = "Not set";
      if (ticket.start_datetime) {
        const dt = new Date(ticket.start_datetime);
        if (!isNaN(dt.getTime())) {
          startDateDisplay = formatDate(dt.toISOString(), false) +
            " " + dt.toTimeString().slice(0,5);
        }
      }
      if (ticket.end_datetime) {
        const dt = new Date(ticket.end_datetime);
        if (!isNaN(dt.getTime())) {
          endDateDisplay = formatDate(dt.toISOString(), false) +
            " " + dt.toTimeString().slice(0,5);
        }
      }

      return `
        <div class="ticket-item" data-ticket-id="${ticket.ticket_id}">
            <!-- Main row - ensure exact column alignment -->
            <div class="ticket-row">
                <span class="status-badge ${statusClass}">${formatStatus(
        ticket.ticket_status
      )}</span>
                <span class="ticket-title">${
                  ticket.ticket_title || "N/A"
                }</span>
                <span>${ticket.property_name || "N/A"}</span>
                <span class="status-badge ${priorityClass}">${formatPriority(
        ticket.priority
      )}</span>
                <span>${
                  formatRequestType(ticket.request_type)
                }</span>
                <span>${startDateDisplay}</span>
                <span>${endDateDisplay}</span>
                <div class="row-actions">
                    <button class="action-btn action-btn-edit" onclick="editTicket('${
                      ticket.ticket_id
                    }'); event.stopPropagation();" title="Update">
                        ✏️
                    </button>
                    ${
                      isPending
                        ? `
                    <button class="action-btn action-btn-assign" onclick="assignTicket('${ticket.ticket_id}'); event.stopPropagation();" title="Assign">
                        👤
                    </button>
                    `
                        : ""
                    }
                    <button class="action-btn action-btn-delete" onclick="deleteTicket('${
                      ticket.ticket_id
                    }'); event.stopPropagation();" title="Delete">
                        🗑️
                    </button>
                </div>
                <button class="expand-btn" onclick="toggleTicketDetails('${
                  ticket.ticket_id
                }')" title="Expand Details">
                    <span class="expand-icon">▼</span>
                </button>
            </div>
            <div class="ticket-details" id="details-${ticket.ticket_id}">
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Ticket ID</strong>
                        <span>${ticket.ticket_id}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Current Status</strong>
                        <span class="status-badge ${statusClass}">${formatStatus(
        ticket.ticket_status
      )}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Requested By</strong>
                        <span title="${ticket.requested_by_email || ""}">${
        ticket.requested_by_name || ticket.user_id || "Unknown"
      }</span>
                    </div>
                    <div class="detail-item">
                        <strong>Assigned To</strong>
                        <span>${ticket.assigned_to || "Unassigned"}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Start Time</strong>
                        <span>${
                          ticket.start_datetime ? formatDate(new Date(ticket.start_datetime).toISOString(), true) : "Not scheduled"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>End Time</strong>
                        <span>${
                          ticket.end_datetime ? formatDate(new Date(ticket.end_datetime).toISOString(), true) : "Not scheduled"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>Maintenance Cost</strong>
                        <span class="cost-display">${
                          formatCurrency(ticket.maintenance_cost) ||
                          "Not estimated"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>Priority Level</strong>
                        <span class="status-badge ${priorityClass}">${formatPriority(
        ticket.priority
      )}</span>
                    </div>
                    ${
                      ticket.description
                        ? `
                    <div class="detail-item full-width">
                        <strong>Description</strong>
                        <span>${ticket.description}</span>
                    </div>`
                        : ""
                    }
                    ${
                      ticket.notes
                        ? `
                    <div class="detail-item full-width">
                        <strong>Additional Notes</strong>
                        <div class="notes-content">${ticket.notes}</div>
                    </div>`
                        : ""
                    }
                    ${
                      attachmentsForDisplay
                        ? `
                    <div class="detail-item full-width">
                        <strong>Attachments</strong>
                        <div class="attachments-list">
                            ${formatAttachments(attachmentsForDisplay)}
                        </div>
                    </div>`
                        : ""
                    }
                </div>
                <div class="ticket-dates-info">
                    <div class="date-info-item">
                        <span class="date-label">Created:</span>
                        <span class="date-value">${formatDate(
                          ticket.created_at, true
                        )}</span>
                    </div>
                    <div class="date-info-item">
                        <span class="date-label">Last Updated:</span>
                        <span class="date-value">${formatDate(
                          ticket.updated_at, true
                        )}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    })
    .join("");
  container.innerHTML = ticketRows;
  currentlyExpandedTicket = null;
}

function toggleTicketDetails(ticketId) {
  const details = document.getElementById(`details-${ticketId}`);
  const ticketItem = document.querySelector(`[data-ticket-id="${ticketId}"]`);
  const expandIcon = ticketItem ? ticketItem.querySelector(".expand-icon") : null;

  if (!details || !ticketItem || !expandIcon) return;

  if (currentlyExpandedTicket && currentlyExpandedTicket !== ticketId) {
    const currentDetails = document.getElementById(`details-${currentlyExpandedTicket}`);
    const currentTicketItem = document.querySelector(`[data-ticket-id="${currentlyExpandedTicket}"]`);
    const currentExpandIcon = currentTicketItem ? currentTicketItem.querySelector(".expand-icon") : null;
    if (currentDetails && currentExpandIcon && currentTicketItem) {
      currentDetails.classList.remove("expanded");
      currentExpandIcon.textContent = "▼";
      currentTicketItem.classList.remove("expanded");
    }
    setTimeout(() => {
      expandTicket(ticketId, details, ticketItem, expandIcon);
    }, 100);
  } else {
    if (details.classList.contains("expanded")) {
      details.classList.remove("expanded");
      expandIcon.textContent = "▼";
      ticketItem.classList.remove("expanded");
      currentlyExpandedTicket = null;
    } else {
      expandTicket(ticketId, details, ticketItem, expandIcon);
    }
  }
}

async function checkAndUpdateTicketStatuses() {
  try {
    const response = await fetch("/api/v1/tickets/update-ticket-statuses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      console.log("Ticket statuses updated successfully");
      await loadTickets();
    }
  } catch (error) {
    console.error("Error updating ticket statuses:", error);
  }
}


async function editTicket(ticketId) {
  event.stopPropagation();

  try {
    console.log(`Opening edit modal for ticket: ${ticketId}`);

    const response = await fetch(`/api/v1/tickets/${ticketId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch ticket details");
    }

    const result = await response.json();
    const ticket = result.ticket;

    const isCompleted =
      ticket.ticket_status &&
      ticket.ticket_status.toUpperCase() ===
        AppConstants.TICKET_STATUSES.COMPLETED;
    const isCancelled =
      ticket.ticket_status &&
      ticket.ticket_status.toUpperCase() ===
        AppConstants.TICKET_STATUSES.CANCELLED;

    if (isCompleted || isCancelled) {
      const statusText = isCompleted ? "completed" : "cancelled";
      const proceedMessage = `This ticket is ${statusText} and cannot be edited.\n\nWould you like to view its details anyway?`;

      if (!confirm(proceedMessage)) {
        return;
      }
    }

    populateEditForm(ticket);

    const modal = document.getElementById("editTicketModal");
    modal.classList.add("active");
  } catch (error) {
    console.error("Error opening edit modal:", error);
    alert("Failed to load ticket details. Please try again.");
  }
}

function populateEditForm(ticket) {
  const editTicketId = document.getElementById("editTicketId");
  if (editTicketId) editTicketId.value = ticket.ticket_id;
  const editTicketIdDisplay = document.getElementById("editTicketIdDisplay");
  if (editTicketIdDisplay) editTicketIdDisplay.value = ticket.ticket_id;
    const editUnitNoLabel = document.querySelector('label[for="editUnitNo"]');
    if (editUnitNoLabel) editUnitNoLabel.textContent = "Unit/Property";
    const editUnitNo = document.getElementById("editUnitNo");
    if (editUnitNo) {
      let unitOrProperty = "";
      if (ticket.property_name) {
        unitOrProperty = ticket.property_name;
        if (ticket.unit_number) {
          unitOrProperty += ` (${ticket.unit_number})`;
        }
      } else if (ticket.unit_number) {
        unitOrProperty = ticket.unit_number;
      } else if (ticket.lease_id) {
        unitOrProperty = ticket.lease_id;
      }
      editUnitNo.value = unitOrProperty;
    }
  const editStatus = document.getElementById("editStatus");
  if (editStatus) editStatus.value = formatStatus(ticket.ticket_status);
  const editRequestedBy = document.getElementById("editRequestedBy");
  if (editRequestedBy) editRequestedBy.value = ticket.requested_by_name || "Unknown";
  const editCreatedAt = document.getElementById("editCreatedAt");
  if (editCreatedAt) editCreatedAt.value = formatDate(ticket.created_at, true);

  const isCompleted =
    ticket.ticket_status &&
    ticket.ticket_status.toUpperCase() ===
      AppConstants.TICKET_STATUSES.COMPLETED;
  const isCancelled =
    ticket.ticket_status &&
    ticket.ticket_status.toUpperCase() ===
      AppConstants.TICKET_STATUSES.CANCELLED;
  const isNotEditable = isCompleted || isCancelled;
  const isPendingOrAssigned =
    ticket.ticket_status &&
    (ticket.ticket_status.toUpperCase() ===
      AppConstants.TICKET_STATUSES.PENDING ||
      ticket.ticket_status.toUpperCase() ===
        AppConstants.TICKET_STATUSES.ASSIGNED);

  const editableFields = [
    "editTicketTitle",
    "editRequestType",
    "editPriority",
    "editStartDate",
    "editStartTime",
    "editEndDate",
    "editEndTime",
    "editMaintenanceCosts",
    "editDescription",
    "editNotes",
  ];

  editableFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = isNotEditable;
      if (isNotEditable) {
        field.classList.add("readonly-field");
      } else {
        field.classList.remove("readonly-field");
      }
    }
  });

  document.getElementById("editTicketTitle").value = ticket.ticket_title || "";
  document.getElementById("editRequestType").value = ticket.request_type || "";
  document.getElementById("editPriority").value = ticket.priority || "";
  document.getElementById("editMaintenanceCosts").value =
    ticket.maintenance_cost || "";
  document.getElementById("editDescription").value = ticket.description || "";
  document.getElementById("editNotes").value = ticket.notes || "";

  const startDateField = document.getElementById("editStartDate");
  const startTimeField = document.getElementById("editStartTime");
  if (startDateField && startTimeField) {
    let startDate = "";
    let startTime = "";
    if (ticket.start_datetime) {
      const dt = new Date(ticket.start_datetime);
      if (!isNaN(dt.getTime())) {
        startDate = dt.toISOString().split("T")[0];
        startTime = dt.toTimeString().slice(0,5); 
      }
    }
    startDateField.value = startDate;
    startTimeField.value = startTime;

    if (isNotEditable) {
      startDateField.disabled = true;
      startDateField.classList.add("readonly-field");
      startTimeField.disabled = true;
      startTimeField.classList.add("readonly-field");
    } else {
      startDateField.disabled = false;
      startDateField.classList.remove("readonly-field");
      startTimeField.disabled = false;
      startTimeField.classList.remove("readonly-field");
      const today = new Date().toISOString().split("T")[0];
      startDateField.min = today;
    }
  }

  const endDateField = document.getElementById("editEndDate");
  const endTimeField = document.getElementById("editEndTime");
  if (endDateField && endTimeField) {
    let endDate = "";
    let endTime = "";
    if (ticket.end_datetime) {
      const dt = new Date(ticket.end_datetime);
      if (!isNaN(dt.getTime())) {
        endDate = dt.toISOString().split("T")[0];
        endTime = dt.toTimeString().slice(0,5);
      }
    }
    endDateField.value = endDate;
    endTimeField.value = endTime;

    if (isNotEditable) {
      endDateField.disabled = true;
      endDateField.classList.add("readonly-field");
      endTimeField.disabled = true;
      endTimeField.classList.add("readonly-field");
    } else {
      endDateField.disabled = false;
      endDateField.classList.remove("readonly-field");
      endTimeField.disabled = false;
      endTimeField.classList.remove("readonly-field");
    }
  }

  handleStatusFieldEditing(ticket, isPendingOrAssigned, isNotEditable);

  const assignedToGroup = document.getElementById("editAssignedToGroup");
  const assignedToInput = document.getElementById("editAssignedTo");

  if (ticket.assigned_to && ticket.assigned_to.trim() !== "") {
    assignedToGroup.style.display = "flex";
    assignedToInput.value = ticket.assigned_to;
    assignedToInput.disabled = true;
    assignedToInput.classList.add("readonly-field");
  } else {
    assignedToGroup.style.display = "none";
    assignedToInput.value = "";
  }

  const fileInput = document.getElementById("editFileInput");
  const attachmentsArea = document.querySelector(
    "#editTicketModal .attachments-area"
  );

  if (fileInput && attachmentsArea) {
    fileInput.disabled = isNotEditable;
    if (isNotEditable) {
      attachmentsArea.style.opacity = "0.5";
      attachmentsArea.style.pointerEvents = "none";
      attachmentsArea.querySelector("span").textContent =
        "📎 File upload disabled for this ticket status";
    } else {
      attachmentsArea.style.opacity = "1";
      attachmentsArea.style.pointerEvents = "auto";
      resetEditFileUploadDisplay();
    }
  }

  displayCurrentAttachments(Array.isArray(ticket.attachments) ? ticket.attachments.join(",") : ticket.attachments);

  if (!isNotEditable) {
    document.getElementById("editFileInput").value = "";
    resetEditFileUploadDisplay();
  }
  const submitBtn = document.querySelector("#editTicketModal .btn-submit");
  if (submitBtn) {
    submitBtn.disabled = isNotEditable;
    if (isNotEditable) {
      submitBtn.textContent = isCompleted
        ? "Cannot Edit Completed Ticket"
        : "Cannot Edit Cancelled Ticket";
      submitBtn.style.opacity = "0.5";
    } else {
      submitBtn.textContent = "Update Ticket";
      submitBtn.style.opacity = "1";
    }
  }
}

function handleStatusFieldEditing(ticket, isPendingOrAssigned, isNotEditable) {
  const statusGroup = document.getElementById("editStatus").parentElement;
  const currentStatus = ticket.ticket_status;

  const existingSelect = document.getElementById("editStatusSelect");
  if (existingSelect) {
    existingSelect.remove();
  }

  if (isPendingOrAssigned && !isNotEditable) {
    const statusSelect = document.createElement("select");
    statusSelect.id = "editStatusSelect";
    statusSelect.name = "ticket_status";
    statusSelect.className = "form-control";
    const currentOption = document.createElement("option");
    currentOption.value = "";
    currentOption.textContent = `Keep as ${formatStatus(
      currentStatus
    )}`;
    statusSelect.appendChild(currentOption);

    const cancelledOption = document.createElement("option");
    cancelledOption.value = AppConstants.TICKET_STATUSES.CANCELLED;
    cancelledOption.textContent = "Cancel Ticket";
    statusSelect.appendChild(cancelledOption);

    document.getElementById("editStatus").style.display = "none";
    statusGroup.appendChild(statusSelect);

    const label = statusGroup.querySelector("label");
    label.innerHTML =
      'Current Status <span style="color: #059669; font-size: 12px;">(Can be cancelled)</span>';
  } else {
    document.getElementById("editStatus").style.display = "block";

    const label = statusGroup.querySelector("label");
    label.innerHTML = "Current Status";
  }
}

function displayCurrentAttachments(attachments) {
  const currentAttachmentsGroup = document.getElementById(
    "currentAttachmentsGroup"
  );
  const currentAttachmentsList = document.getElementById(
    "currentAttachmentsList"
  );

  if (attachments && attachments.trim() !== "") {
    currentAttachmentsGroup.style.display = "block";
    currentAttachmentsList.innerHTML = formatAttachments(attachments);
  } else {
    currentAttachmentsGroup.style.display = "none";
  }
}

function closeEditTicketModal() {
  const modal = document.getElementById("editTicketModal");
  modal.classList.remove("active");

  document.getElementById("editTicketForm").reset();
  resetEditFileUploadDisplay();
}

function resetEditFileUploadDisplay() {
  const attachmentsArea = document.querySelector(
    "#editTicketModal .attachments-area span"
  );
  if (attachmentsArea) {
    attachmentsArea.textContent =
      "📎 Click here to upload additional files or drag and drop";
    attachmentsArea.style.color = "#6b7280";
  }
}

async function submitEditTicket(event) {
  event.preventDefault();

  const form = document.getElementById("editTicketForm");
  const submitBtn = document.querySelector("#editTicketModal .btn-submit");
  const ticketId = document.getElementById("editTicketId").value;

  if (submitBtn.disabled) {
    alert("This ticket cannot be edited due to its current status.");
    return;
  }

  const formData = new FormData(form);

  // Combine start_date and start_time into start_datetime
  let start_date = formData.get("start_date") || null;
  let start_time = formData.get("start_time") || null;
  let start_datetime = null;
  if (start_date && start_time) {
    start_datetime = `${start_date}T${start_time}:00`;
  } else if (start_date) {
    start_datetime = `${start_date}T00:00:00`;
  }

  let end_date = formData.get("end_date") || null;
  let end_time = formData.get("end_time") || null;
  let end_datetime = null;
  if (end_date && end_time) {
    end_datetime = `${end_date}T${end_time}:00`;
  } else if (end_date) {
    end_datetime = `${end_date}T00:00:00`;
  }

  const ticketData = {
    ticket_title: formData.get("ticket_title").trim(),
    request_type: formData.get("request_type"),
    description: formData.get("description").trim(),
    priority: formData.get("priority"),
    start_datetime: start_datetime,
    end_datetime: end_datetime,
    maintenance_cost: formData.get("maintenance_cost") || null,
    notes: formData.get("notes")?.trim() || null,
  };

  const statusSelect = document.getElementById("editStatusSelect");
  if (
    statusSelect &&
    statusSelect.value === AppConstants.TICKET_STATUSES.CANCELLED
  ) {
    ticketData.ticket_status = AppConstants.TICKET_STATUSES.CANCELLED;
  }

  const validationErrors = validateEditTicketForm(ticketData);
  if (validationErrors.length > 0) {
    alert("Please fix the following errors:\n\n" + validationErrors.join("\n"));
    return;
  }

  let confirmMessage;
  if (ticketData.ticket_status === AppConstants.TICKET_STATUSES.CANCELLED) {
    confirmMessage = `⚠️ CANCEL TICKET CONFIRMATION ⚠️\n\nAre you sure you want to CANCEL this ticket?\n\nTicket: ${ticketData.ticket_title}\n\n⚠️ Once cancelled, this ticket cannot be edited or reactivated!`;
  } else {
    confirmMessage = `Are you sure you want to update this ticket?\n\nTicket: ${ticketData.ticket_title}\nType: ${ticketData.request_type}\nPriority: ${ticketData.priority}`;
  }

  if (!confirm(confirmMessage)) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent =
    ticketData.ticket_status === AppConstants.TICKET_STATUSES.CANCELLED
      ? "Cancelling..."
      : "Updating...";

  try {
    const submitData = new FormData();

    Object.keys(ticketData).forEach((key) => {
      if (ticketData[key] !== null && ticketData[key] !== undefined) {
        submitData.append(key, ticketData[key]);
        console.log(`Adding to FormData: ${key} = ${ticketData[key]}`);
      }
    });

    const fileInput = document.getElementById("editFileInput");
    if (fileInput.files && fileInput.files.length > 0 && !fileInput.disabled) {
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];

        if (file.size > AppConstants.FILE_UPLOAD.MAX_SIZE) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          return;
        }

        submitData.append("attachments", file);
      }
    }

    const response = await fetch(`/api/v1/tickets/${ticketId}`, {
      method: "PATCH",
      body: submitData,
      credentials: "include",
    });

    const result = await response.json();
    console.log("Server response:", result);

    if (response.ok) {
      const statusMessage =
        ticketData.ticket_status === AppConstants.TICKET_STATUSES.CANCELLED
          ? `❌ Ticket cancelled successfully!\n\nTicket "${ticketData.ticket_title}" has been cancelled.`
          : `✅ Ticket updated successfully!\n\nTicket "${ticketData.ticket_title}" has been updated.`;

      alert(statusMessage);
      closeEditTicketModal();

      await loadTickets();
    } else {
      throw new Error(result.message || "Failed to update ticket");
    }
  } catch (error) {
    console.error("Error updating ticket:", error);
    alert(
      `❌ Error updating ticket: ${error.message}\n\nPlease try again or contact support if the problem persists.`
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Update Ticket";
  }
}

function validateEditTicketForm(data) {
  const errors = [];

  if (!data.ticket_title) errors.push("• Ticket Title is required");
  if (!data.request_type) errors.push("• Request Type is required");
  if (!data.description) errors.push("• Description is required");
  if (!data.priority) errors.push("• Priority is required");

  if (data.start_date) {
    const selectedDate = new Date(data.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errors.push("• Start Date cannot be in the past");
    }
  }

  return errors;
}

function openNewTicketModal() {
  const modal = document.getElementById("newTicketModal");
  if (modal) modal.classList.add("active");

  const requestedBySelect = document.getElementById("requestedBy");
  if (requestedBySelect) {
    requestedBySelect.value = "";
    if (requestedBySelect.tomselect) {
      requestedBySelect.tomselect.clear();
    }
  }
}

function initializeFileUpload() {
  const fileInput = document.getElementById("fileInput");
  const attachmentsArea = document.querySelector(".attachments-area");
  if (!fileInput || !attachmentsArea) return;

  fileInput.addEventListener("change", function (e) {
    const files = e.target.files;
    const span = attachmentsArea.querySelector("span");
    if (span) {
      if (files.length > 0) {
        span.textContent = Array.from(files).map(f => f.name).join(", ");
        span.style.color = "#374151";
      } else {
        span.textContent = "📎 Click here to upload files or drag and drop";
        span.style.color = "#6b7280";
      }
    }
  });

  attachmentsArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    attachmentsArea.style.borderColor = "#3b82f6";
    attachmentsArea.style.backgroundColor = "#f0f9ff";
  });
  attachmentsArea.addEventListener("dragleave", function (e) {
    e.preventDefault();
    attachmentsArea.style.borderColor = "#d1d5db";
    attachmentsArea.style.backgroundColor = "#fafafa";
  });
  attachmentsArea.addEventListener("drop", function (e) {
    e.preventDefault();
    attachmentsArea.style.borderColor = "#d1d5db";
    attachmentsArea.style.backgroundColor = "#fafafa";
    const files = e.dataTransfer.files;
    fileInput.files = files;
    const span = attachmentsArea.querySelector("span");
    if (span) {
      if (files.length > 0) {
        span.textContent = Array.from(files).map(f => f.name).join(", ");
        span.style.color = "#374151";
      } else {
        span.textContent = "📎 Click here to upload files or drag and drop";
        span.style.color = "#6b7280";
      }
    }
  });
}

function deleteTicket(ticketId) {
  const ticket = allTickets.find(t => t.ticket_id === ticketId);
  if (!ticket) {
    alert("Ticket not found");
    return;
  }
  if (!confirm(`Are you sure you want to delete ticket '${ticket.ticket_title}'? This action cannot be undone.`)) {
    return;
  }
  fetch(`/api/v1/tickets/${ticketId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  })
    .then(res => res.json())
    .then(result => {
      if (result && result.message) alert(result.message);
      allTickets = allTickets.filter(t => t.ticket_id !== ticketId);
      tickets = tickets.filter(t => t.ticket_id !== ticketId);
      renderTickets();
    })
    .catch(err => {
      alert("Failed to delete ticket: " + err.message);
    });
}

function initializeModal() {
  const modal = document.getElementById("newTicketModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.getElementById("newTicketForm").reset();
      }
    });
  }
  const newTicketForm = document.getElementById("newTicketForm");
  if (newTicketForm) {
    newTicketForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(newTicketForm);
      const submitBtn = document.querySelector(".btn-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating...";
      try {
        const response = await fetch("/api/v1/tickets/create-ticket", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        const result = await response.json();
        if (response.ok) {
          alert(`✅ Ticket created successfully!\n\nTicket ID: ${result.ticket_id}`);
          modal.classList.remove("active");
          newTicketForm.reset();
          await loadTickets();
        } else {
          throw new Error(result.message || "Failed to create ticket");
        }
      } catch (error) {
        alert(`❌ Error creating ticket: ${error.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Ticket";
      }
    });
  }
}

function assignTicket(ticketId) {
  const ticket = allTickets.find(t => t.ticket_id === ticketId);
  if (!ticket) {
    alert("Ticket not found");
    return;
  }
  document.getElementById("assignTicketId").value = ticket.ticket_id;
  document.getElementById("assignTicketIdDisplay").value = ticket.ticket_id;
  document.getElementById("assignTicketTitle").value = ticket.ticket_title || "";
  document.getElementById("assignUnitNo").value = ticket.lease_id || "";
  document.getElementById("assignPriority").value = ticket.priority || "";
  document.getElementById("assignedToInput").value = ticket.assigned_to || "";
  document.getElementById("assignmentNotes").value = "";

  const modal = document.getElementById("assignTicketModal");
  if (modal) {
    modal.classList.add("active");
  }

  const assignTicketForm = document.getElementById("assignTicketForm");
  if (assignTicketForm) {
    assignTicketForm.onsubmit = async function(event) {
      event.preventDefault();
      const assignedTo = document.getElementById("assignedToInput").value.trim();
      const assignmentNotes = document.getElementById("assignmentNotes").value.trim();
      if (!assignedTo) {
        alert("Please specify who to assign this ticket to.");
        document.getElementById("assignedToInput").focus();
        return;
      }
      const submitBtn = assignTicketForm.querySelector(".btn-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Assigning...";
      try {
        const ticketData = { assigned_to: assignedTo };
        if (assignmentNotes) {
          ticketData.assignment_notes = assignmentNotes;
        }
        const response = await fetch(`/api/v1/tickets/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketData),
          credentials: "include"
        });
        const result = await response.json();
        if (response.ok) {
          alert("✅ Ticket assigned successfully!");
          modal.classList.remove("active");
          assignTicketForm.reset();
          await loadTickets();
        } else {
          throw new Error(result.message || "Failed to assign ticket");
        }
      } catch (error) {
        alert(`❌ Error assigning ticket: ${error.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Assign Ticket";
      }
    };
  }
}

function initializeEditModal() {
  const modal = document.getElementById("editTicketModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.getElementById("editTicketForm").reset();
      }
    });
  }
  const editTicketForm = document.getElementById("editTicketForm");
  if (editTicketForm) {
    editTicketForm.addEventListener("submit", submitEditTicket);
  }
}

function expandTicket(ticketId, details, ticketItem, expandIcon) {
  if (!details || !ticketItem || !expandIcon) return;
  details.classList.add("expanded");
  expandIcon.textContent = "▲";
  ticketItem.classList.add("expanded");
  currentlyExpandedTicket = ticketId;
  setTimeout(() => {
    details.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, 200);
}


function closeAssignTicketModal() {
  const modal = document.getElementById("assignTicketModal");
  if (modal) {
    modal.classList.remove("active");
  }
  const assignTicketForm = document.getElementById("assignTicketForm");
  if (assignTicketForm) {
    assignTicketForm.reset();
  }
}

function closeNewTicketModal() {
  const modal = document.getElementById("newTicketModal");
  if (modal) {
    modal.classList.remove("active");
  }
  const newTicketForm = document.getElementById("newTicketForm");
  if (newTicketForm) {
    newTicketForm.reset();
  }
}


window.expandTicket = expandTicket;
window.clearFilters = clearFilters;
window.editTicket = editTicket;
window.assignTicket = assignTicket;
window.closeEditTicketModal = closeEditTicketModal;
window.initializeEditModal = initializeEditModal;
window.initializeModal = initializeModal;
window.openNewTicketModal = openNewTicketModal;
window.deleteTicket = deleteTicket;
window.initializeFileUpload = initializeFileUpload;
window.closeAssignTicketModal = closeAssignTicketModal;
window.closeNewTicketModal = closeNewTicketModal;
window.toggleTicketDetails = toggleTicketDetails;
window.submitEditTicket = submitEditTicket;
// window.closeDeleteModal = closeDeleteModal;
// window.confirmDelete = confirmDelete;
// window.selectTenant = selectTenant;
// window.logout = logout;
// window.filteredTenants = filteredTenants;
