import formatTime from "../utils/formatTime.js";
import formatCurrency from "../utils/formatCurrency.js";
import formatStatus from "../utils/formatStatus.js";
import formatRequestType from "../utils/formatRequestType.js";
import formatPriority from "../utils/formatPriority.js";
import formatDate from "../utils/formatDate.js";
import formatAttachments from "../utils/formatAttachments.js";
import fetchCompanyDetails from "../utils/loadCompanyInfo.js";

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
  const profileBtn = document.getElementById("profileBtnIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener("click", function () {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (event) {
      if (
        !profileBtn.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.style.display = "none";
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
                <span>${ticket.unit_no || "N/A"}</span>
                <span class="status-badge ${priorityClass}">${formatPriority(
        ticket.priority
      )}</span>
                <span>${formatRequestType(ticket.request_type)}</span>
                <span>${
                  formatDate(ticket.start_date) || "Not set"
                }</span>
                <span>${
                  formatDate(ticket.end_date) || "Not set"
                }</span>
                
                <!-- Action buttons - Only show assign button if status is PENDING -->
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
                
                <!-- Expand button -->
                <button class="expand-btn" onclick="toggleTicketDetails('${
                  ticket.ticket_id
                }')" title="Expand Details">
                    <span class="expand-icon">▼</span>
                </button>
            </div>
            
            <!-- ✅ ADD BACK THE EXPANDED DETAILS HTML -->
            <div class="ticket-details" id="details-${ticket.ticket_id}">
                <div class="details-grid">
                    <!-- Basic Information -->
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
                    
                    <!-- Contact Information -->
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
                    
                    <!-- Schedule Information -->
                    <div class="detail-item">
                        <strong>Start Time</strong>
                        <span>${
                          formatTime(ticket.start_time) ||
                          "Not scheduled"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>End Time</strong>
                        <span>${
                          formatTime(ticket.end_time) ||
                          "Not scheduled"
                        }</span>
                    </div>
                    
                    <!-- Cost Information -->
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
                      ticket.attachments
                        ? `
                    <div class="detail-item full-width">
                        <strong>Attachments</strong>
                        <div class="attachments-list">
                            ${formatAttachments(ticket.attachments)}
                        </div>
                    </div>`
                        : ""
                    }
                </div>
                
                <!-- Date information as simple text below attachments -->
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
  const expandIcon = ticketItem.querySelector(".expand-icon");

  if (currentlyExpandedTicket && currentlyExpandedTicket !== ticketId) {
    const currentDetails = document.getElementById(
      `details-${currentlyExpandedTicket}`
    );
    const currentTicketItem = document.querySelector(
      `[data-ticket-id="${currentlyExpandedTicket}"]`
    );
    const currentExpandIcon = currentTicketItem.
    currentDetails.classList.remove("expanded");
    currentExpandIcon.textContent = "▼";
    currentTicketItem.classList.remove("expanded");

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

function expandTicket(ticketId, details, ticketItem, expandIcon) {
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
  document.getElementById("editTicketId").value = ticket.ticket_id;

  document.getElementById("editTicketIdDisplay").value = ticket.ticket_id;
  document.getElementById("editUnitNo").value = ticket.unit_no || "";
  document.getElementById("editStatus").value = formatStatus(
    ticket.ticket_status
  );
  document.getElementById("editRequestedBy").value =
    ticket.requested_by_name || "Unknown";
  document.getElementById("editCreatedAt").value = formatDate(
    ticket.created_at, true
  );

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
  if (startDateField) {
    let formattedStartDate = "";
    if (ticket.start_date) {
      if (
        typeof ticket.start_date === "string" &&
        ticket.start_date.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        formattedStartDate = ticket.start_date;
      } else {
        const dateObj = new Date(ticket.start_date);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          formattedStartDate = `${year}-${month}-${day}`;
        }
      }
    }

    console.log(
      "Setting start_date:",
      ticket.start_date,
      "-> formatted:",
      formattedStartDate
    );
    startDateField.value = formattedStartDate;

    if (isNotEditable) {
      startDateField.disabled = true;
      startDateField.classList.add("readonly-field");
    } else {
      startDateField.disabled = false;
      startDateField.classList.remove("readonly-field");
      const today = new Date().toISOString().split("T")[0];
      startDateField.min = today;
    }
  }

  const startTimeField = document.getElementById("editStartTime");
  if (startTimeField) {
    startTimeField.value = ticket.start_time || "";

    if (isNotEditable) {
      startTimeField.disabled = true;
      startTimeField.classList.add("readonly-field");
    } else {
      startTimeField.disabled = false;
      startTimeField.classList.remove("readonly-field");
    }
  }

  const endDateField = document.getElementById("editEndDate");
  if (endDateField) {
    let formattedEndDate = "";
    if (ticket.end_date) {
      if (
        typeof ticket.end_date === "string" &&
        ticket.end_date.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        formattedEndDate = ticket.end_date;
      } else {
        const dateObj = new Date(ticket.end_date);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          formattedEndDate = `${year}-${month}-${day}`;
        }
      }
    }
    endDateField.value = formattedEndDate;

    if (isNotEditable) {
      endDateField.disabled = true;
      endDateField.classList.add("readonly-field");
    } else {
      endDateField.disabled = false;
      endDateField.classList.remove("readonly-field");
    }
  }

  const endTimeField = document.getElementById("editEndTime");
  if (endTimeField) {
    endTimeField.value = ticket.end_time || "";

    if (isNotEditable) {
      endTimeField.disabled = true;
      endTimeField.classList.add("readonly-field");
    } else {
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

  displayCurrentAttachments(ticket.attachments);

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

  const ticketData = {
    ticket_title: formData.get("ticket_title").trim(),
    request_type: formData.get("request_type"),
    description: formData.get("description").trim(),
    priority: formData.get("priority"),
    start_date: formData.get("start_date") || null,
    start_time: formData.get("start_time") || null,
    end_date: formData.get("end_date") || null,
    end_time: formData.get("end_time") || null,
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

function initializeEditModal() {
  const editModal = document.getElementById("editTicketModal");
  if (editModal) {
    editModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeEditTicketModal();
      }
    });
  }

  const editTicketForm = document.getElementById("editTicketForm");
  if (editTicketForm) {
    editTicketForm.addEventListener("submit", submitEditTicket);
  }

  initializeEditFileUpload();

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      editModal &&
      editModal.classList.contains("active")
    ) {
      closeEditTicketModal();
    }
  });
}

function initializeEditFileUpload() {
  const fileInput = document.getElementById("editFileInput");
  const attachmentsArea = document.querySelector(
    "#editTicketModal .attachments-area"
  );

  if (!fileInput || !attachmentsArea) return;

  fileInput.addEventListener("change", function (e) {
    handleEditFileSelection(e.target.files);
  });

  attachmentsArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.style.borderColor = "#3b82f6";
    this.style.backgroundColor = "#f0f9ff";
  });

  attachmentsArea.addEventListener("dragleave", function (e) {
    e.preventDefault();
    this.style.borderColor = "#d1d5db";
    this.style.backgroundColor = "#fafafa";
  });

  attachmentsArea.addEventListener("drop", function (e) {
    e.preventDefault();
    this.style.borderColor = "#d1d5db";
    this.style.backgroundColor = "#fafafa";

    const files = e.dataTransfer.files;
    handleEditFileSelection(files);

    fileInput.files = files;
  });
}

function handleEditFileSelection(files) {
  const attachmentsArea = document.querySelector(
    "#editTicketModal .attachments-area span"
  );
  const maxSize = AppConstants.FILE_UPLOAD.MAX_SIZE;
  const validTypes = AppConstants.FILE_UPLOAD.ALLOWED_TYPES;

  if (!files || files.length === 0) {
    resetEditFileUploadDisplay();
    return;
  }

  let validFiles = 0;
  let fileNames = [];
  let errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.size > maxSize) {
      errors.push(`${file.name} is too large (max 10MB)`);
      continue;
    }

    const isValidType = validTypes.includes(file.type);
    if (!isValidType) {
      errors.push(`${file.name} is not a supported file type (${file.type})`);
      continue;
    }

    validFiles++;
    fileNames.push(file.name);
  }

  if (errors.length > 0) {
    alert("Some files were not added:\n\n" + errors.join("\n"));
  }

  if (validFiles > 0) {
    const displayText =
      validFiles === 1
        ? `📎 ${fileNames[0]} (will be added)`
        : `📎 ${validFiles} new files selected: ${fileNames.join(", ")}`;

    attachmentsArea.textContent = displayText;
    attachmentsArea.style.color = "#374151";
  } else {
    resetEditFileUploadDisplay();
  }
}

function showDeleteConfirmationModal(ticket) {
  const modalHtml = `
        <div class="delete-confirmation-modal" id="deleteModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ Confirm Deletion</h3>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to permanently delete this ticket?</p>
                    <div class="ticket-info">
                        <strong>Ticket ID:</strong> ${ticket.ticket_id}<br>
                        <strong>Title:</strong> ${ticket.ticket_title}<br>
                        <strong>Unit:</strong> ${ticket.unit_no}<br>
                        <strong>Status:</strong> ${formatStatus(
                          ticket.ticket_status
                        )}
                    </div>
                    <p class="warning-text">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeDeleteModal()">Cancel</button>
                    <button type="button" class="btn-danger" onclick="confirmDelete('${
                      ticket.ticket_id
                    }')">Delete Ticket</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) {
    modal.remove();
  }
}

async function confirmDelete(ticketId) {
  closeDeleteModal();

  try {
    const ticket = allTickets.find((t) => t.ticket_id === ticketId);

    if (!ticket) {
      alert("Ticket not found");
      return;
    }

    const response = await fetch(`/api/v1/tickets/${ticketId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      alert(
        `✅ Ticket deleted successfully!\n\nTicket "${ticket.ticket_title}" has been permanently removed.`
      );

      allTickets = allTickets.filter((t) => t.ticket_id !== ticketId);
      tickets = tickets.filter((t) => t.ticket_id !== ticketId);

      renderTickets();

      if (currentlyExpandedTicket === ticketId) {
        currentlyExpandedTicket = null;
      }

    } else {
      throw new Error(result.message || "Failed to delete ticket");
    }
  } catch (error) {
    console.error("Error deleting ticket:", error);

    let errorMessage = "Failed to delete ticket";

    if (
      error.message.includes("permission") ||
      error.message.includes("authorized")
    ) {
      errorMessage = "You do not have permission to delete this ticket";
    } else if (error.message.includes("not found")) {
      errorMessage = "Ticket not found or already deleted";
    } else if (error.message.includes("completed")) {
      errorMessage = "Cannot delete completed tickets";
    } else {
      errorMessage = error.message || "An unexpected error occurred";
    }

    alert(
      `❌ Error: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`
    );
  }
}

async function deleteTicket(ticketId) {
  event.stopPropagation();

  try {
    const ticket = allTickets.find((t) => t.ticket_id === ticketId);

    if (!ticket) {
      alert("Ticket not found");
      return;
    }

    showDeleteConfirmationModal(ticket);
  } catch (error) {
    console.error("Error preparing delete confirmation:", error);
    alert("Error preparing delete confirmation. Please try again.");
  }
}

async function openNewTicketModal() {
  const modal = document.getElementById("newTicketModal");
  modal.classList.add("active");

  await loadTenants();

  const today = new Date().toISOString().split("T")[0];
  const startDateInput = document.getElementById("startDate");
  if (startDateInput) {
    startDateInput.min = today;
    startDateInput.value = today;
    startDateInput.removeEventListener("change", toggleTimeFields);
    startDateInput.addEventListener("change", toggleTimeFields);
    toggleTimeFields();
  }

  document.getElementById("newTicketForm").reset();
  resetFileUploadDisplay();

  const requestedByInput = document.getElementById("requestedBy");
  if (requestedByInput) {
    requestedByInput.value = "";
    requestedByInput.removeAttribute("data-tenant-id");
    requestedByInput.removeAttribute("data-tenant-email");
  }
  hideDropdown();

  if (startDateInput) {
    startDateInput.value = today;
    toggleTimeFields();
  }
}

function closeNewTicketModal() {
  const modal = document.getElementById("newTicketModal");
  modal.classList.remove("active");

  document.getElementById("newTicketForm").reset();
  resetFileUploadDisplay();
}

function resetFileUploadDisplay() {
  const attachmentsArea = document.querySelector(".attachments-area span");
  if (attachmentsArea) {
    attachmentsArea.textContent =
      "📎 Click here to upload files or drag and drop";
    attachmentsArea.style.color = "#6b7280";
  }
}

function toggleTimeFields() {
  const startDateInput = document.getElementById("startDate");
  const startTimeGroup = document.getElementById("startTimeGroup");

  if (startDateInput.value) {
    startTimeGroup.style.display = "flex";
    startTimeGroup.classList.add("visible");

    setTimeout(() => {
      startTimeGroup.style.opacity = "1";
    }, 10);
  } else {
    hideTimeFields();
  }
}

function hideTimeFields() {
  const startTimeGroup = document.getElementById("startTimeGroup");
  const startTimeInput = document.getElementById("startTime");

  if (startTimeGroup) {
    startTimeGroup.style.opacity = "0";
    startTimeGroup.classList.remove("visible");
    setTimeout(() => {
      startTimeGroup.style.display = "none";
    }, 300);
  }
  if (startTimeInput) startTimeInput.value = "";
}

function initializeFileUpload() {
  const fileInput = document.getElementById("fileInput");
  const attachmentsArea = document.querySelector(".attachments-area");

  if (!fileInput || !attachmentsArea) return;

  fileInput.addEventListener("change", function (e) {
    handleFileSelection(e.target.files);
  });

  attachmentsArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.style.borderColor = "#3b82f6";
    this.style.backgroundColor = "#f0f9ff";
  });

  attachmentsArea.addEventListener("dragleave", function (e) {
    e.preventDefault();
    this.style.borderColor = "#d1d5db";
    this.style.backgroundColor = "#fafafa";
  });

  attachmentsArea.addEventListener("drop", function (e) {
    e.preventDefault();
    this.style.borderColor = "#d1d5db";
    this.style.backgroundColor = "#fafafa";

    const files = e.dataTransfer.files;
    handleFileSelection(files);

    fileInput.files = files;
  });
}

function handleFileSelection(files) {
  const attachmentsArea = document.querySelector(".attachments-area span");
  const maxSize = AppConstants.FILE_UPLOAD.MAX_SIZE;
  const validTypes = AppConstants.FILE_UPLOAD.ALLOWED_TYPES;

  if (!files || files.length === 0) {
    resetFileUploadDisplay();
    return;
  }

  let validFiles = 0;
  let fileNames = [];
  let errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.size > maxSize) {
      errors.push(`${file.name} is too large (max 10MB)`);
      continue;
    }

    const isValidType = validTypes.includes(file.type);
    if (!isValidType) {
      errors.push(`${file.name} is not a supported file type (${file.type})`);
      continue;
    }

    validFiles++;
    fileNames.push(file.name);
  }

  if (errors.length > 0) {
    alert("Some files were not added:\n\n" + errors.join("\n"));
  }

  if (validFiles > 0) {
    const displayText =
      validFiles === 1
        ? `📎 ${fileNames[0]}`
        : `📎 ${validFiles} files selected: ${fileNames.join(", ")}`;

    attachmentsArea.textContent = displayText;
    attachmentsArea.style.color = "#374151";
  } else {
    resetFileUploadDisplay();
  }
}

async function loadTenants() {
  try {
    const response = await fetch("/api/v1/users?role=TENANT", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      tenantsList = data.users || [];
      console.log(`Loaded ${tenantsList.length} tenants for autocomplete`);
    } else {
      console.error("Failed to load tenants:", response.statusText);
      tenantsList = [];
    }
  } catch (error) {
    console.error("Error loading tenants:", error);
    tenantsList = [];
  }
}

function initializeAutocomplete() {
  const requestedByInput = document.getElementById("requestedBy");
  const dropdown = document.getElementById("requestedByDropdown");

  if (!requestedByInput || !dropdown) return;

  requestedByInput.addEventListener("input", function (e) {
    const query = e.target.value.toLowerCase().trim();

    if (query.length < 1) {
      hideDropdown();
      return;
    }

    filterTenants(query);
    showDropdown();
  });

  requestedByInput.addEventListener("focus", function (e) {
    const query = e.target.value.toLowerCase().trim();
    if (query.length >= 1) {
      filterTenants(query);
      showDropdown();
    }
  });

  requestedByInput.addEventListener("blur", function (e) {
    setTimeout(() => {
      hideDropdown();
    }, 200);
  });

  requestedByInput.addEventListener("keydown", function (e) {
    if (!dropdown.classList.contains("show")) return;

    const items = dropdown.querySelectorAll(".autocomplete-item");

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedTenantIndex = Math.min(
          selectedTenantIndex + 1,
          items.length - 1
        );
        updateHighlight(items);
        break;

      case "ArrowUp":
        e.preventDefault();
        selectedTenantIndex = Math.max(selectedTenantIndex - 1, -1);
        updateHighlight(items);
        break;

      case "Enter":
        e.preventDefault();
        if (selectedTenantIndex >= 0 && items[selectedTenantIndex]) {
          selectTenant(filteredTenants[selectedTenantIndex]);
        }
        break;

      case "Escape":
        hideDropdown();
        break;
    }
  });

  document.addEventListener("click", function (e) {
    if (!requestedByInput.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  });
}

function filterTenants(query) {
  filteredTenants = tenantsList.filter((tenant) => {
    const name = (tenant.first_name + " " + tenant.last_name).toLowerCase();
    const email = tenant.email.toLowerCase();
    const unit = tenant.unit_no ? tenant.unit_no.toLowerCase() : "";

    return (
      name.includes(query) || email.includes(query) || unit.includes(query)
    );
  });

  selectedTenantIndex = -1;
  renderDropdown();
}

function renderDropdown() {
  const dropdown = document.getElementById("requestedByDropdown");

  if (filteredTenants.length === 0) {
    dropdown.innerHTML =
      '<div class="autocomplete-no-results">No tenants found</div>';
    return;
  }

  const html = filteredTenants
    .map(
      (tenant, index) => `
        <div class="autocomplete-item" 
             data-index="${index}"
             onclick="selectTenant(filteredTenants[${index}])">
            <div class="tenant-name">${tenant.first_name} ${
        tenant.last_name
      }</div>
            <div class="tenant-email">${tenant.email}</div>
            ${
              tenant.unit_no
                ? `<div class="tenant-unit">Unit: ${tenant.unit_no}</div>`
                : ""
            }
        </div>
    `
    )
    .join("");

  dropdown.innerHTML = html;
}

function updateHighlight(items) {
  items.forEach((item, index) => {
    item.classList.toggle("highlighted", index === selectedTenantIndex);
  });
}

function selectTenant(tenant) {
  const requestedByInput = document.getElementById("requestedBy");
  const displayName = `${tenant.first_name} ${tenant.last_name}`;

  requestedByInput.value = displayName;
  requestedByInput.setAttribute("data-tenant-id", tenant.user_id);
  requestedByInput.setAttribute("data-tenant-email", tenant.email);

  hideDropdown();
}

function showDropdown() {
  const dropdown = document.getElementById("requestedByDropdown");
  dropdown.classList.add("show");
}

function hideDropdown() {
  const dropdown = document.getElementById("requestedByDropdown");
  dropdown.classList.remove("show");
  selectedTenantIndex = -1;
}

async function submitNewTicket(event) {
  event.preventDefault();

  const form = document.getElementById("newTicketForm");
  const submitBtn = document.querySelector(".btn-submit");

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating...";

  try {
    const formData = new FormData(form);
    const requestedByInput = document.getElementById("requestedBy");

    const ticketData = {
      unit_no: formData.get("unit_no").trim(),
      ticket_title: formData.get("ticket_title").trim(),
      request_type: formData.get("request_type"),
      description: formData.get("description").trim(),
      priority: formData.get("priority"),
      start_date: formData.get("start_date"),
      start_time: formData.get("start_time") || null,
      assigned_to: formData.get("assigned_to")?.trim() || null,
      notes: formData.get("notes")?.trim() || null,
    };

    if (requestedByInput && requestedByInput.value.trim()) {
      const tenantId = requestedByInput.getAttribute("data-tenant-id");
      if (tenantId) {
        ticketData.user_id = tenantId; 
      }
    }
    const submitData = new FormData();

    Object.keys(ticketData).forEach((key) => {
      if (ticketData[key] !== null && ticketData[key] !== undefined) {
        submitData.append(key, ticketData[key]);
      }
    });

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length > 0) {
      Array.from(fileInput.files).forEach((file) => {
        submitData.append("attachments", file);
      });
    }

    const response = await fetch("/api/v1/tickets/create-ticket", {
      method: "POST",
      body: submitData,
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      alert(
        `✅ Ticket created successfully!\n\nTicket ID: ${result.ticket_id}\nTitle: ${ticketData.ticket_title}`
      );
      closeNewTicketModal();
      await loadTickets();
    } else {
      throw new Error(result.message || "Failed to create ticket");
    }
  } catch (error) {
    console.error("Error creating ticket:", error);
    alert(`❌ Error creating ticket: ${error.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Ticket";
  }
}

function initializeModal() {
  const modal = document.getElementById("newTicketModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeNewTicketModal();
      }
    });
  }

  const newTicketForm = document.getElementById("newTicketForm");
  if (newTicketForm) {
    newTicketForm.addEventListener("submit", submitNewTicket);
  }

  initializeAssignModal();

  initializeFileUpload();
  initializeAutocomplete();

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (modal && modal.classList.contains("active")) {
        closeNewTicketModal();
      }
      const assignModal = document.getElementById("assignTicketModal");
      if (assignModal && assignModal.classList.contains("active")) {
        closeAssignTicketModal();
      }
    }
  });
}

async function assignTicket(ticketId) {
  event.stopPropagation();

  try {
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

    const isAssignable =
      ticket.ticket_status &&
      (ticket.ticket_status.toUpperCase() ===
        AppConstants.TICKET_STATUSES.PENDING ||
        ticket.ticket_status.toUpperCase() ===
          AppConstants.TICKET_STATUSES.ASSIGNED);

    if (!isAssignable) {
      alert(
        `This ticket cannot be assigned because its status is "${ticket.ticket_status}". Only PENDING or ASSIGNED tickets can be reassigned.`
      );
      return;
    }

    populateAssignForm(ticket);

    const modal = document.getElementById("assignTicketModal");
    modal.classList.add("active");

    setTimeout(() => {
      document.getElementById("assignedToInput").focus();
    }, 100);
  } catch (error) {
    console.error("Error opening assign modal:", error);
    alert("Failed to load ticket details. Please try again.");
  }
}

function populateAssignForm(ticket) {
  document.getElementById("assignTicketId").value = ticket.ticket_id;

  document.getElementById("assignTicketIdDisplay").value = ticket.ticket_id;
  document.getElementById("assignTicketTitle").value =
    ticket.ticket_title || "";
  document.getElementById("assignUnitNo").value = ticket.unit_no || "";
  document.getElementById("assignPriority").value = formatPriority(
    ticket.priority
  );

  document.getElementById("assignedToInput").value = ticket.assigned_to || "";
  document.getElementById("assignmentNotes").value = "";
}

function closeAssignTicketModal() {
  const modal = document.getElementById("assignTicketModal");
  modal.classList.remove("active");

  document.getElementById("assignTicketForm").reset();
}

async function submitAssignment(event) {
  event.preventDefault();

  const form = document.getElementById("assignTicketForm");
  const submitBtn = document.querySelector("#assignTicketModal .btn-submit");
  const ticketId = document.getElementById("assignTicketId").value;

  const formData = new FormData(form);
  const assignedTo = formData.get("assigned_to").trim();
  const assignmentNotes = formData.get("assignment_notes")?.trim() || "";

  if (!assignedTo) {
    alert("Please specify who to assign this ticket to.");
    document.getElementById("assignedToInput").focus();
    return;
  }

  const confirmMessage = `Are you sure you want to assign this ticket to "${assignedTo}"?`;
  if (!confirm(confirmMessage)) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Assigning...";

  try {
    const ticketData = {
      assigned_to: assignedTo,
    };
    if (assignmentNotes) {
      const currentDate = new Date().toLocaleString();
      const assignmentNote = `[${currentDate}] Assigned to ${assignedTo}: ${assignmentNotes}`;
      ticketData.notes = assignmentNote;
    }

    const response = await fetch(`/api/v1/tickets/${ticketId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      alert(
        `✅ Ticket assigned successfully!\n\nTicket has been assigned to: ${assignedTo}`
      );
      closeAssignTicketModal();

      await loadTickets();
    } else {
      throw new Error(result.message || "Failed to assign ticket");
    }
  } catch (error) {
    console.error("Error assigning ticket:", error);
    alert(
      `❌ Error assigning ticket: ${error.message}\n\nPlease try again or contact support if the problem persists.`
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Assign Ticket";
  }
}

function initializeAssignModal() {
  const assignModal = document.getElementById("assignTicketModal");
  if (assignModal) {
    assignModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeAssignTicketModal();
      }
    });
  }

  const assignTicketForm = document.getElementById("assignTicketForm");
  if (assignTicketForm) {
    assignTicketForm.addEventListener("submit", submitAssignment);
  }
}

function canEditTicket(status) {
  if (!status) return true;
  const statusMapping = AppConstants.STATUS_MAPPINGS[status.toUpperCase()];
  return statusMapping ? statusMapping.canEdit : false;
}

function canAssignTicket(status) {
  if (!status) return true;
  const statusMapping = AppConstants.STATUS_MAPPINGS[status.toUpperCase()];
  return statusMapping ? statusMapping.canAssign : false;
}

function canDeleteTicket(status) {
  if (!status) return true;
  const statusMapping = AppConstants.STATUS_MAPPINGS[status.toUpperCase()];
  return statusMapping ? statusMapping.canDelete : false;
}

function getStatusColor(status) {
  if (!status) return "#6b7280";
  const statusMapping = AppConstants.STATUS_MAPPINGS[status.toUpperCase()];
  return statusMapping ? statusMapping.color : "#6b7280";
}

function getPriorityColor(priority) {
  if (!priority) return "#f59e0b";
  const priorityMapping =
    AppConstants.PRIORITY_MAPPINGS[priority.toUpperCase()];
  return priorityMapping ? priorityMapping.color : "#f59e0b";
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

window.openNewTicketModal = openNewTicketModal;
window.closeNewTicketModal = closeNewTicketModal;
window.clearFilters = clearFilters;
window.editTicket = editTicket;
window.deleteTicket = deleteTicket;
window.assignTicket = assignTicket;
window.toggleTicketDetails = toggleTicketDetails;
window.closeEditTicketModal = closeEditTicketModal;
window.closeAssignTicketModal = closeAssignTicketModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.selectTenant = selectTenant;
window.logout = logout;


window.filteredTenants = filteredTenants;