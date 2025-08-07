// Global variables
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

  // Add logout event listener
  const logoutLink = document.querySelector('a[href="login.html"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  loadTickets();

  setInterval(checkAndUpdateTicketStatuses, 1 * 60 * 1000); // Check every minute
  setTimeout(checkAndUpdateTicketStatuses, 2000); // Initial check after 2 seconds

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterTickets);
  }

  initializeDatePickers();

  initializeFileUpload();
  initializeModal();
  initializeEditModal();

  handleSidebarToggle();

  // If you have a sidebar toggle button, add event listener
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

  // Auto-detect sidebar state on load
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

// Initialize date pickers with restrictions
function initializeDatePickers() {
  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");

  if (fromDateInput && toDateInput) {
    // Add event listeners for date changes
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




// Update date restrictions based on available ticket data
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

  // Minimum date from created_at (earliest ticket creation)
  minDate = new Date(Math.min(...createdDates));

  // Maximum date from end_date (latest ticket end date)
  // If no end_dates exist, fall back to latest created_at
  if (endDates.length > 0) {
    maxDate = new Date(Math.max(...endDates));
  } else {
    // Fallback to latest created_at if no end_dates are available
    maxDate = new Date(Math.max(...createdDates));
    console.log("No end_dates found, using latest created_at as maxDate");
  }

  // Format dates for input restrictions (YYYY-MM-DD)
  const minDateStr = minDate.toISOString().split("T")[0];
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");

  if (fromDateInput && toDateInput) {
    // Set restrictions
    fromDateInput.min = minDateStr;
    fromDateInput.max = maxDateStr;
    toDateInput.min = minDateStr;
    toDateInput.max = maxDateStr;

    // Set default values if not already set
    if (!currentFromDate) {
      currentFromDate = minDateStr;
      fromDateInput.value = minDateStr;
    }

    if (!currentToDate) {
      currentToDate = maxDateStr;
      toDateInput.value = maxDateStr;
    }

    // Log for debugging
    console.log(`Date restrictions set:`);
    console.log(`- From date range: ${minDateStr} (earliest created_at)`);
    console.log(
      `- To date range: ${maxDateStr} (latest ${
        endDates.length > 0 ? "end_date" : "created_at (fallback)"
      })`
    );
    console.log(
      `- Available tickets with end_date: ${endDates.length}/${allTickets.length}`
    );
  }
}

// Update "To" date restrictions based on "From" date selection
function updateToDateRestrictions() {
  const toDateInput = document.getElementById("toDate");
  if (toDateInput && currentFromDate) {
    // "To" date cannot be earlier than "From" date
    toDateInput.min = currentFromDate;

    // If current "To" date is earlier than "From" date, update it
    if (currentToDate && currentToDate < currentFromDate) {
      currentToDate = currentFromDate;
      toDateInput.value = currentFromDate;
    }
  }
}

// Update "From" date restrictions based on "To" date selection
function updateFromDateRestrictions() {
  const fromDateInput = document.getElementById("fromDate");
  if (fromDateInput && currentToDate) {
    // "From" date cannot be later than "To" date
    fromDateInput.max = currentToDate;

    // If current "From" date is later than "To" date, update it
    if (currentFromDate && currentFromDate > currentToDate) {
      currentFromDate = currentToDate;
      fromDateInput.value = currentToDate;
    }
  }
}

// Filter tickets based on date range
function filterTicketsByDateRange() {
  let filteredTickets = allTickets;

  // Apply search filter first if there's a search term
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

  // Apply date range filter
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

// Update filter status display
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

    // Update the display values
    console.log(`Filtering tickets from ${fromFormatted} to ${toFormatted}`);
    console.log(`Showing ${tickets.length} of ${allTickets.length} tickets`);

    // Show tickets that are created, end, or span within the date range
    const activeTickets = tickets.filter(
      (t) => t.ticket_status !== "completed"
    ).length;
    console.log(`Active tickets in range: ${activeTickets}`);
  }
}

// Update the existing filterTickets function to work with date filtering
function filterTickets() {
  filterTicketsByDateRange();
}

// Update the loadTickets function to set up date restrictions
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

      // Set up date restrictions after loading tickets
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

// Add a function to get readable date range for display
function getDateRangeDisplay() {
  if (!currentFromDate || !currentToDate) return "";

  const fromDate = new Date(currentFromDate);
  const toDate = new Date(currentToDate);

  const options = { month: "short", day: "numeric", year: "numeric" };
  const fromFormatted = fromDate.toLocaleDateString("en-US", options);
  const toFormatted = toDate.toLocaleDateString("en-US", options);

  return `${fromFormatted} - ${toFormatted}`;
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

      // Check if status is PENDING to show assign button
      const isPending =
        ticket.ticket_status &&
        ticket.ticket_status.toUpperCase() === "PENDING";

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
                <span>${formatDate(ticket.start_date) || "Not set"}</span>
                <span>${formatDate(ticket.end_date) || "Not set"}</span>
                
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
            
            <!-- Expanded details with updated layout -->
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
                          formatTime(ticket.start_time) || "Not scheduled"
                        }</span>
                    </div>
                    <div class="detail-item">
                        <strong>End Time</strong>
                        <span>${
                          formatTime(ticket.end_time) || "Not scheduled"
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
                        <span class="date-value">${formatDateTime(
                          ticket.created_at
                        )}</span>
                    </div>
                    <div class="date-info-item">
                        <span class="date-label">Last Updated:</span>
                        <span class="date-value">${formatDateTime(
                          ticket.updated_at
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

// Add helper functions for formatting new fields
function formatTime(timeString) {
  if (!timeString) return null;

  // Handle both HH:MM and HH:MM:SS formats
  const timeParts = timeString.split(":");
  if (timeParts.length >= 2) {
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }
  return timeString;
}

function formatCurrency(amount) {
  if (!amount || amount === 0) return null;

  // Convert to number if it's a string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return null;

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

function toggleTicketDetails(ticketId) {
  const details = document.getElementById(`details-${ticketId}`);
  const ticketItem = document.querySelector(`[data-ticket-id="${ticketId}"]`);
  const expandIcon = ticketItem.querySelector(".expand-icon");

  // Close currently expanded ticket if it's different
  if (currentlyExpandedTicket && currentlyExpandedTicket !== ticketId) {
    const currentDetails = document.getElementById(
      `details-${currentlyExpandedTicket}`
    );
    const currentTicketItem = document.querySelector(
      `[data-ticket-id="${currentlyExpandedTicket}"]`
    );
    const currentExpandIcon = currentTicketItem.querySelector(".expand-icon");

    // Collapse the currently expanded ticket
    currentDetails.classList.remove("expanded");
    currentExpandIcon.textContent = "▼";
    currentTicketItem.classList.remove("expanded");

    setTimeout(() => {
      expandTicket(ticketId, details, ticketItem, expandIcon);
    }, 100);
  } else {
    // No other ticket is expanded, or clicking the same ticket
    if (details.classList.contains("expanded")) {
      // Collapse this ticket
      details.classList.remove("expanded");
      expandIcon.textContent = "▼";
      ticketItem.classList.remove("expanded");
      currentlyExpandedTicket = null;
    } else {
      // Expand this ticket
      expandTicket(ticketId, details, ticketItem, expandIcon);
    }
  }
}

function expandTicket(ticketId, details, ticketItem, expandIcon) {
  details.classList.add("expanded");
  expandIcon.textContent = "▲";
  ticketItem.classList.add("expanded");
  currentlyExpandedTicket = ticketId;

  // Smooth scroll to the expanded content
  setTimeout(() => {
    details.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, 200);
}

function formatStatus(status) {
  if (!status)
    return '<span class="status-badge status-pending">Pending</span>';

  const statusLower = status.toLowerCase().replace(/[^a-z_]/g, "");
  const statusClass = `status-${statusLower}`;

  const statusMap = {
    pending: "Pending",
    assigned: "Assigned",
    inprogress: "In Progress",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  const displayText =
    statusMap[statusLower] ||
    status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");

  return displayText; // Return just the text, not wrapped in span since you already wrap it in renderTickets
}

// Add a similar function for priority (keep only this one)
function formatPriority(priority) {
  if (!priority) return "Medium";

  const priorityLower = priority.toLowerCase();
  const displayText = priority.charAt(0).toUpperCase() + priority.slice(1);

  return displayText; // Return just the text
}

// Add function for request type
function formatRequestType(type) {
  if (!type) return "General";

  const displayText = type.charAt(0).toUpperCase() + type.slice(1);

  return displayText; // Return just the text
}

// Add a function to periodically check and update ticket statuses
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
      // Reload tickets to show updated statuses
      await loadTickets();
    }
  } catch (error) {
    console.error("Error updating ticket statuses:", error);
  }
}

function formatPriority(priority) {
  if (!priority) return "Medium";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAttachments(attachments) {
  if (!attachments) return "";

  const attachmentsList = attachments.split(",");
  return attachmentsList
    .map((attachment) => {
      const fileName = attachment.trim().split("/").pop();
      return `<a href="${attachment.trim()}" target="_blank" class="attachment-link">${fileName}</a>`;
    })
    .join(", ");
}

// Filter tickets based on search
function filterTickets() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const searchTerm = searchInput.value.toLowerCase();

  if (searchTerm === "") {
    tickets = allTickets;
  } else {
    tickets = allTickets.filter((ticket) => {
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

  renderTickets();
}

// Clear search filters
function clearFilters() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
    tickets = allTickets;
    renderTickets();
  }
}


// Update the editTicket function to add initial checks:
async function editTicket(ticketId) {
    event.stopPropagation();
    
    try {
        console.log(`Opening edit modal for ticket: ${ticketId}`);
        
        // Fetch ticket details
        const response = await fetch(`/api/v1/tickets/${ticketId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch ticket details');
        }

        const result = await response.json();
        const ticket = result.ticket;
        
        // Check if ticket is in a state that allows viewing but not editing
        const isCompleted = ticket.ticket_status && ticket.ticket_status.toUpperCase() === 'COMPLETED';
        const isCancelled = ticket.ticket_status && ticket.ticket_status.toUpperCase() === 'CANCELLED';
        
        if (isCompleted || isCancelled) {
            const statusText = isCompleted ? 'completed' : 'cancelled';
            const proceedMessage = `This ticket is ${statusText} and cannot be edited.\n\nWould you like to view its details anyway?`;
            
            if (!confirm(proceedMessage)) {
                return;
            }
        }

        // Populate the edit form
        populateEditForm(ticket);
        
        // Show the modal
        const modal = document.getElementById('editTicketModal');
        modal.classList.add('active');
        
    } catch (error) {
        console.error('Error opening edit modal:', error);
        alert('Failed to load ticket details. Please try again.');
    }
}


function populateEditForm(ticket) {
    // Hidden ticket ID
    document.getElementById('editTicketId').value = ticket.ticket_id;
    
    // Read-only fields
    document.getElementById('editTicketIdDisplay').value = ticket.ticket_id;
    document.getElementById('editUnitNo').value = ticket.unit_no || '';
    document.getElementById('editStatus').value = formatStatus(ticket.ticket_status);
    document.getElementById('editRequestedBy').value = ticket.requested_by_name || 'Unknown';
    document.getElementById('editCreatedAt').value = formatDateTime(ticket.created_at);
    
    // Debug: Log the ticket data to see what we're getting
    console.log('Populating edit form with ticket data:', ticket);
    console.log('start_date:', ticket.start_date, 'end_date:', ticket.end_date);
    console.log('start_time:', ticket.start_time, 'end_time:', ticket.end_time);
    
    // Check if ticket is editable
    const isCompleted = ticket.ticket_status && ticket.ticket_status.toUpperCase() === 'COMPLETED';
    const isCancelled = ticket.ticket_status && ticket.ticket_status.toUpperCase() === 'CANCELLED';
    const isNotEditable = isCompleted || isCancelled;
    const isPendingOrAssigned = ticket.ticket_status && 
        (ticket.ticket_status.toUpperCase() === 'PENDING' || ticket.ticket_status.toUpperCase() === 'ASSIGNED');
    
    // Editable fields (NOW INCLUDES start_date and start_time)
    const editableFields = [
        'editTicketTitle', 'editRequestType', 'editPriority', 
        'editStartDate', 'editStartTime', // ✅ ADDED these to editable fields
        'editEndDate', 'editEndTime', 'editMaintenanceCosts', 
        'editDescription', 'editNotes'
    ];
    
    editableFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.disabled = isNotEditable;
            if (isNotEditable) {
                field.classList.add('readonly-field');
            } else {
                field.classList.remove('readonly-field');
            }
        }
    });
    
    // Populate basic editable fields
    document.getElementById('editTicketTitle').value = ticket.ticket_title || '';
    document.getElementById('editRequestType').value = ticket.request_type || '';
    document.getElementById('editPriority').value = ticket.priority || '';
    document.getElementById('editMaintenanceCosts').value = ticket.maintenance_cost || '';
    document.getElementById('editDescription').value = ticket.description || '';
    document.getElementById('editNotes').value = ticket.notes || '';
    
    // Handle start_date - NOW EDITABLE
    const startDateField = document.getElementById('editStartDate');
    if (startDateField) {
        let formattedStartDate = '';
        if (ticket.start_date) {
            if (typeof ticket.start_date === 'string' && ticket.start_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                formattedStartDate = ticket.start_date;
            } else {
                const dateObj = new Date(ticket.start_date);
                if (!isNaN(dateObj.getTime())) {
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    formattedStartDate = `${year}-${month}-${day}`;
                }
            }
        }
        
        console.log('Setting start_date:', ticket.start_date, '-> formatted:', formattedStartDate);
        startDateField.value = formattedStartDate;
        
        // Apply disabled state only if not editable
        if (isNotEditable) {
            startDateField.disabled = true;
            startDateField.classList.add('readonly-field');
        } else {
            startDateField.disabled = false;
            startDateField.classList.remove('readonly-field');
            // Set minimum date to today for future scheduling
            const today = new Date().toISOString().split('T')[0];
            startDateField.min = today;
        }
    }
    
    // Handle start_time - NOW EDITABLE
    const startTimeField = document.getElementById('editStartTime');
    if (startTimeField) {
        startTimeField.value = ticket.start_time || '';
        
        // Apply disabled state only if not editable
        if (isNotEditable) {
            startTimeField.disabled = true;
            startTimeField.classList.add('readonly-field');
        } else {
            startTimeField.disabled = false;
            startTimeField.classList.remove('readonly-field');
        }
    }
    
    // Handle end_date
    const endDateField = document.getElementById('editEndDate');
    if (endDateField) {
        let formattedEndDate = '';
        if (ticket.end_date) {
            if (typeof ticket.end_date === 'string' && ticket.end_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                formattedEndDate = ticket.end_date;
            } else {
                const dateObj = new Date(ticket.end_date);
                if (!isNaN(dateObj.getTime())) {
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    formattedEndDate = `${year}-${month}-${day}`;
                }
            }
        }
        
        console.log('Setting end_date:', ticket.end_date, '-> formatted:', formattedEndDate);
        endDateField.value = formattedEndDate;
        
        if (isNotEditable) {
            endDateField.disabled = true;
            endDateField.classList.add('readonly-field');
        } else {
            endDateField.disabled = false;
            endDateField.classList.remove('readonly-field');
        }
    }
    
    // Handle end_time
    const endTimeField = document.getElementById('editEndTime');
    if (endTimeField) {
        endTimeField.value = ticket.end_time || '';
        
        if (isNotEditable) {
            endTimeField.disabled = true;
            endTimeField.classList.add('readonly-field');
        } else {
            endTimeField.disabled = false;
            endTimeField.classList.remove('readonly-field');
        }
    }
    
    // Handle manual status editing
    handleStatusFieldEditing(ticket, isPendingOrAssigned, isNotEditable);
    
    // Handle assigned_to field - ALWAYS READ-ONLY
    const assignedToGroup = document.getElementById('editAssignedToGroup');
    const assignedToInput = document.getElementById('editAssignedTo');
    
    if (ticket.assigned_to && ticket.assigned_to.trim() !== '') {
        assignedToGroup.style.display = 'flex';
        assignedToInput.value = ticket.assigned_to;
        assignedToInput.disabled = true;
        assignedToInput.classList.add('readonly-field');
    } else {
        assignedToGroup.style.display = 'none';
        assignedToInput.value = '';
    }
    
    // Handle file upload (disable if not editable)
    const fileInput = document.getElementById('editFileInput');
    const attachmentsArea = document.querySelector('#editTicketModal .attachments-area');
    
    if (fileInput && attachmentsArea) {
        fileInput.disabled = isNotEditable;
        if (isNotEditable) {
            attachmentsArea.style.opacity = '0.5';
            attachmentsArea.style.pointerEvents = 'none';
            attachmentsArea.querySelector('span').textContent = '📎 File upload disabled for this ticket status';
        } else {
            attachmentsArea.style.opacity = '1';
            attachmentsArea.style.pointerEvents = 'auto';
            resetEditFileUploadDisplay();
        }
    }
    
    // Handle current attachments
    displayCurrentAttachments(ticket.attachments);
    
    // Reset file input for new attachments
    if (!isNotEditable) {
        document.getElementById('editFileInput').value = '';
        resetEditFileUploadDisplay();
    }
    
    // Update submit button
    const submitBtn = document.querySelector('#editTicketModal .btn-submit');
    if (submitBtn) {
        submitBtn.disabled = isNotEditable;
        if (isNotEditable) {
            submitBtn.textContent = isCompleted ? 'Cannot Edit Completed Ticket' : 'Cannot Edit Cancelled Ticket';
            submitBtn.style.opacity = '0.5';
        } else {
            submitBtn.textContent = 'Update Ticket';
            submitBtn.style.opacity = '1';
        }
    }
}

// Replace the handleStatusFieldEditing function with this corrected version:
function handleStatusFieldEditing(ticket, isPendingOrAssigned, isNotEditable) {
    const statusGroup = document.getElementById('editStatus').parentElement;
    const currentStatus = ticket.ticket_status;
    
    // Remove existing status select if it exists
    const existingSelect = document.getElementById('editStatusSelect');
    if (existingSelect) {
        existingSelect.remove();
    }
    
    // If ticket can have status manually changed to CANCELLED
    if (isPendingOrAssigned && !isNotEditable) {
        // Replace the read-only status field with a select
        const statusSelect = document.createElement('select');
        statusSelect.id = 'editStatusSelect';
        statusSelect.name = 'ticket_status';
        statusSelect.className = 'form-control';
        
        // Add current status as default option
        const currentOption = document.createElement('option');
        currentOption.value = '';
        currentOption.textContent = `Keep as ${formatStatus(currentStatus)}`;
        statusSelect.appendChild(currentOption);
        
        // Add cancelled option
        const cancelledOption = document.createElement('option'); // FIX: Properly declare the variable
        cancelledOption.value = 'CANCELLED';
        cancelledOption.textContent = 'Cancel Ticket';
        statusSelect.appendChild(cancelledOption);
        
        // Hide the read-only field and show the select
        document.getElementById('editStatus').style.display = 'none';
        statusGroup.appendChild(statusSelect);
        
        // Update label to indicate it's editable
        const label = statusGroup.querySelector('label');
        label.innerHTML = 'Current Status <span style="color: #059669; font-size: 12px;">(Can be cancelled)</span>';
    } else {
        // Keep as read-only field
        document.getElementById('editStatus').style.display = 'block';
        
        // Update label
        const label = statusGroup.querySelector('label');
        label.innerHTML = 'Current Status';
    }
}

// Display current attachments
function displayCurrentAttachments(attachments) {
    const currentAttachmentsGroup = document.getElementById('currentAttachmentsGroup');
    const currentAttachmentsList = document.getElementById('currentAttachmentsList');
    
    if (attachments && attachments.trim() !== '') {
        currentAttachmentsGroup.style.display = 'block';
        currentAttachmentsList.innerHTML = formatAttachments(attachments);
    } else {
        currentAttachmentsGroup.style.display = 'none';
    }
}

// Close edit ticket modal
function closeEditTicketModal() {
    const modal = document.getElementById('editTicketModal');
    modal.classList.remove('active');
    
    // Reset form
    document.getElementById('editTicketForm').reset();
    resetEditFileUploadDisplay();
}

// Reset file upload display for edit modal
function resetEditFileUploadDisplay() {
    const attachmentsArea = document.querySelector('#editTicketModal .attachments-area span');
    if (attachmentsArea) {
        attachmentsArea.textContent = '📎 Click here to upload additional files or drag and drop';
        attachmentsArea.style.color = '#6b7280';
    }
}



async function submitEditTicket(event) {
    event.preventDefault();
    
    const form = document.getElementById('editTicketForm');
    const submitBtn = document.querySelector('#editTicketModal .btn-submit');
    const ticketId = document.getElementById('editTicketId').value;
    
    // Check if submit button is disabled (completed/cancelled tickets)
    if (submitBtn.disabled) {
        alert('This ticket cannot be edited due to its current status.');
        return;
    }
    
    // Get form values - NOW INCLUDING start_date and start_time
    const formData = new FormData(form);
    
    const ticketData = {
        ticket_title: formData.get('ticket_title').trim(),
        request_type: formData.get('request_type'),
        description: formData.get('description').trim(),
        priority: formData.get('priority'),
        start_date: formData.get('start_date') || null, // ✅ NOW INCLUDED
        start_time: formData.get('start_time') || null, // ✅ NOW INCLUDED
        end_date: formData.get('end_date') || null,
        end_time: formData.get('end_time') || null,
        maintenance_cost: formData.get('maintenance_cost') || null,
        notes: formData.get('notes')?.trim() || null
    };
    
    // Handle manual status change (only for PENDING/ASSIGNED -> CANCELLED)
    const statusSelect = document.getElementById('editStatusSelect');
    if (statusSelect && statusSelect.value === 'CANCELLED') {
        ticketData.ticket_status = 'CANCELLED';
        console.log('Setting ticket_status to CANCELLED in frontend');
    }
    
    console.log('Frontend ticketData before submission:', ticketData);

    // Client-side validation - UPDATED to include start_date validation
    const validationErrors = validateEditTicketForm(ticketData);
    if (validationErrors.length > 0) {
        alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
        return;
    }

    // Special confirmation for cancellation
    let confirmMessage;
    if (ticketData.ticket_status === 'CANCELLED') {
        confirmMessage = `⚠️ CANCEL TICKET CONFIRMATION ⚠️\n\nAre you sure you want to CANCEL this ticket?\n\nTicket: ${ticketData.ticket_title}\n\n⚠️ Once cancelled, this ticket cannot be edited or reactivated!`;
    } else {
        confirmMessage = `Are you sure you want to update this ticket?\n\nTicket: ${ticketData.ticket_title}\nType: ${ticketData.request_type}\nPriority: ${ticketData.priority}`;
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }

    // Disable submit button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = ticketData.ticket_status === 'CANCELLED' ? 'Cancelling...' : 'Updating...';

    try {
        const submitData = new FormData();
        
        // Add all ticket data
        Object.keys(ticketData).forEach(key => {
            if (ticketData[key] !== null && ticketData[key] !== undefined) {
                submitData.append(key, ticketData[key]);
                console.log(`Adding to FormData: ${key} = ${ticketData[key]}`);
            }
        });

        // Add new attachments if any (only if not disabled)
        const fileInput = document.getElementById('editFileInput');
        if (fileInput.files && fileInput.files.length > 0 && !fileInput.disabled) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                
                if (file.size > 10 * 1024 * 1024) {
                    alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                    return;
                }
                
                submitData.append('attachments', file);
            }
        }

        console.log('Updating ticket with data:', Object.fromEntries(submitData));

        const response = await fetch(`/api/v1/tickets/${ticketId}`, {
            method: 'PATCH',
            body: submitData,
            credentials: 'include'
        });

        const result = await response.json();
        console.log('Server response:', result);

        if (response.ok) {
            const statusMessage = ticketData.ticket_status === 'CANCELLED' 
                ? `❌ Ticket cancelled successfully!\n\nTicket "${ticketData.ticket_title}" has been cancelled.`
                : `✅ Ticket updated successfully!\n\nTicket "${ticketData.ticket_title}" has been updated.`;
            
            alert(statusMessage);
            closeEditTicketModal();
            
            // Reload tickets to show updated data
            await loadTickets();
        } else {
            throw new Error(result.message || 'Failed to update ticket');
        }
    } catch (error) {
        console.error('Error updating ticket:', error);
        alert(`❌ Error updating ticket: ${error.message}\n\nPlease try again or contact support if the problem persists.`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Ticket';
    }
}


function validateEditTicketForm(data) {
    const errors = [];
    
    if (!data.ticket_title) errors.push('• Ticket Title is required');
    if (!data.request_type) errors.push('• Request Type is required');
    if (!data.description) errors.push('• Description is required');
    if (!data.priority) errors.push('• Priority is required');
    if (!data.start_date) errors.push('• Start Date is required'); // ✅ ADDED validation
    
    // Validate start date is not in the past (only for new dates)
    if (data.start_date) {
        const selectedDate = new Date(data.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            errors.push('• Start Date cannot be in the past');
        }
    }
    
    // Validate dates if both are provided
    if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        
        if (endDate < startDate) {
            errors.push('• End Date cannot be earlier than Start Date');
        }
    }
    
    // Validate maintenance cost if provided
    if (data.maintenance_cost && (isNaN(data.maintenance_cost) || parseFloat(data.maintenance_cost) < 0)) {
        errors.push('• Maintenance Cost must be a valid positive number');
    }
    
    return errors;
}

// Initialize edit modal functionality
function initializeEditModal() {
    const editModal = document.getElementById('editTicketModal');
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditTicketModal();
            }
        });
    }

    const editTicketForm = document.getElementById('editTicketForm');
    if (editTicketForm) {
        editTicketForm.addEventListener('submit', submitEditTicket);
    }
    
    // Initialize file upload for edit modal
    initializeEditFileUpload();
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && editModal && editModal.classList.contains('active')) {
            closeEditTicketModal();
        }
    });
}

// Initialize file upload for edit modal
function initializeEditFileUpload() {
    const fileInput = document.getElementById('editFileInput');
    const attachmentsArea = document.querySelector('#editTicketModal .attachments-area');
    
    if (!fileInput || !attachmentsArea) return;

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        handleEditFileSelection(e.target.files);
    });

    // Drag and drop functionality
    attachmentsArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#3b82f6';
        this.style.backgroundColor = '#f0f9ff';
    });

    attachmentsArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d1d5db';
        this.style.backgroundColor = '#fafafa';
    });

    attachmentsArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d1d5db';
        this.style.backgroundColor = '#fafafa';
        
        const files = e.dataTransfer.files;
        handleEditFileSelection(files);
        
        // Update file input
        fileInput.files = files;
    });
}

// Handle file selection for edit modal
function handleEditFileSelection(files) {
    const attachmentsArea = document.querySelector('#editTicketModal .attachments-area span');
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!files || files.length === 0) {
        resetEditFileUploadDisplay();
        return;
    }
    
    let validFiles = 0;
    let fileNames = [];
    let errors = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size
        if (file.size > maxSize) {
            errors.push(`${file.name} is too large (max 10MB)`);
            continue;
        }
        
        // Check file type
        const isValidType = validTypes.some(type => file.type.startsWith(type));
        if (!isValidType) {
            errors.push(`${file.name} is not a supported file type`);
            continue;
        }
        
        validFiles++;
        fileNames.push(file.name);
    }
    
    if (errors.length > 0) {
        alert('Some files were not added:\n\n' + errors.join('\n'));
    }
    
    if (validFiles > 0) {
        const displayText = validFiles === 1 
            ? `📎 ${fileNames[0]} (will be added)` 
            : `📎 ${validFiles} new files selected: ${fileNames.join(', ')}`;
        
        attachmentsArea.textContent = displayText;
        attachmentsArea.style.color = '#374151';
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
    // Find the ticket to get its details
    const ticket = allTickets.find((t) => t.ticket_id === ticketId);

    if (!ticket) {
      alert("Ticket not found");
      return;
    }

    console.log(`Deleting ticket: ${ticketId}`);

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

      // Remove from local arrays
      allTickets = allTickets.filter((t) => t.ticket_id !== ticketId);
      tickets = tickets.filter((t) => t.ticket_id !== ticketId);

      // Refresh the display
      renderTickets();

      // If the deleted ticket was expanded, reset the tracking
      if (currentlyExpandedTicket === ticketId) {
        currentlyExpandedTicket = null;
      }

      console.log(`Successfully deleted ticket: ${ticketId}`);
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

// Also update the deleteTicket function to use the modal instead of prompt
async function deleteTicket(ticketId) {
  event.stopPropagation();

  try {
    // Find the ticket to get its details for the modal
    const ticket = allTickets.find((t) => t.ticket_id === ticketId);

    if (!ticket) {
      alert("Ticket not found");
      return;
    }

    // Show the delete confirmation modal
    showDeleteConfirmationModal(ticket);
  } catch (error) {
    console.error("Error preparing delete confirmation:", error);
    alert("Error preparing delete confirmation. Please try again.");
  }
}
function assignTicket(ticketId) {
  event.stopPropagation();
  // TODO: Implement assign functionality - open modal to select assignee
  console.log(`Assigning ticket: ${ticketId}`);
  alert(
    `Assignment functionality for ticket ${ticketId} will be implemented here.`
  );
}

async function openNewTicketModal() {
  const modal = document.getElementById("newTicketModal");
  modal.classList.add("active");

  // Load tenants for autocomplete
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

  // Reset form
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

// Update the toggleTimeFields function for smoother transition
function toggleTimeFields() {
  const startDateInput = document.getElementById("startDate");
  const startTimeGroup = document.getElementById("startTimeGroup");

  if (startDateInput.value) {
    startTimeGroup.style.display = "flex";
    startTimeGroup.classList.add("visible");
    // Small delay to ensure smooth transition
    setTimeout(() => {
      startTimeGroup.style.opacity = "1";
    }, 10);
  } else {
    hideTimeFields();
  }
}

// Update hideTimeFields function
function hideTimeFields() {
  const startTimeGroup = document.getElementById("startTimeGroup");
  const startTimeInput = document.getElementById("startTime");

  if (startTimeGroup) {
    startTimeGroup.style.opacity = "0";
    startTimeGroup.classList.remove("visible");
    // Hide after transition
    setTimeout(() => {
      startTimeGroup.style.display = "none";
    }, 300);
  }
  if (startTimeInput) startTimeInput.value = "";
}

// Update the form validation function to remove end_time and cost validation
function validateTicketForm(data) {
  const errors = [];

  if (!data.unit_no) errors.push("• Unit Number is required");
  if (!data.ticket_title) errors.push("• Ticket Title is required");
  if (!data.request_type) errors.push("• Request Type is required");
  if (!data.description) errors.push("• Description is required");
  if (!data.priority) errors.push("• Priority is required");
  if (!data.start_date) errors.push("• Start Date is required");

  // Validate start date is not in the past
  if (data.start_date) {
    const selectedDate = new Date(data.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errors.push("• Start Date cannot be in the past");
    }
  }

  // Validate unit number format (optional - adjust regex as needed)
  if (
    data.unit_no &&
    !/^[A-Z]?\d+[A-Z]?$/i.test(data.unit_no.replace(/\s/g, ""))
  ) {
    errors.push("• Unit Number should be in format like A101, B205, or 123");
  }

  return errors;
}

// Enhanced file upload functionality
function initializeFileUpload() {
  const fileInput = document.getElementById("fileInput");
  const attachmentsArea = document.querySelector(".attachments-area");

  if (!fileInput || !attachmentsArea) return;

  // File input change handler
  fileInput.addEventListener("change", function (e) {
    handleFileSelection(e.target.files);
  });

  // Drag and drop functionality
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

    // Update file input
    fileInput.files = files;
  });
}

function handleFileSelection(files) {
  const attachmentsArea = document.querySelector(".attachments-area span");
  const maxSize = 10 * 1024 * 1024; // 10MB
  const validTypes = [
    "image/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!files || files.length === 0) {
    resetFileUploadDisplay();
    return;
  }

  let validFiles = 0;
  let fileNames = [];
  let errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`${file.name} is too large (max 10MB)`);
      continue;
    }

    // Check file type
    const isValidType = validTypes.some((type) => file.type.startsWith(type));
    if (!isValidType) {
      errors.push(`${file.name} is not a supported file type`);
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

// Load tenants when modal opens
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

// Initialize autocomplete functionality
function initializeAutocomplete() {
  const requestedByInput = document.getElementById("requestedBy");
  const dropdown = document.getElementById("requestedByDropdown");

  if (!requestedByInput || !dropdown) return;

  // Input event for filtering
  requestedByInput.addEventListener("input", function (e) {
    const query = e.target.value.toLowerCase().trim();

    if (query.length < 1) {
      hideDropdown();
      return;
    }

    filterTenants(query);
    showDropdown();
  });

  // Focus event to show dropdown if there's a value
  requestedByInput.addEventListener("focus", function (e) {
    const query = e.target.value.toLowerCase().trim();
    if (query.length >= 1) {
      filterTenants(query);
      showDropdown();
    }
  });

  // Blur event to hide dropdown (with delay for clicking)
  requestedByInput.addEventListener("blur", function (e) {
    setTimeout(() => {
      hideDropdown();
    }, 200);
  });

  // Keyboard navigation
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

  // Click outside to close
  document.addEventListener("click", function (e) {
    if (!requestedByInput.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  });
}

// Filter tenants based on search query
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

// Render dropdown with filtered results
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

// Update keyboard highlight
function updateHighlight(items) {
  items.forEach((item, index) => {
    item.classList.toggle("highlighted", index === selectedTenantIndex);
  });
}

// Select a tenant
function selectTenant(tenant) {
  const requestedByInput = document.getElementById("requestedBy");
  const displayName = `${tenant.first_name} ${tenant.last_name}`;

  requestedByInput.value = displayName;
  requestedByInput.setAttribute("data-tenant-id", tenant.user_id);
  requestedByInput.setAttribute("data-tenant-email", tenant.email);

  hideDropdown();
}

// Show dropdown
function showDropdown() {
  const dropdown = document.getElementById("requestedByDropdown");
  dropdown.classList.add("show");
}

// Hide dropdown
function hideDropdown() {
  const dropdown = document.getElementById("requestedByDropdown");
  dropdown.classList.remove("show");
  selectedTenantIndex = -1;
}

async function submitNewTicket(event) {
    event.preventDefault();

    const form = document.getElementById("newTicketForm");
    const submitBtn = document.querySelector(".btn-submit");

    // Disable submit button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    try {
        // Get form values
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

        // Handle requested_by field
        if (requestedByInput && requestedByInput.value.trim()) {
            const tenantId = requestedByInput.getAttribute("data-tenant-id");
            if (tenantId) {
                ticketData.user_id = tenantId; // Use tenant's ID
                console.log('Ticket requested by tenant:', tenantId);
            }
        }
        // If requestedBy is empty, don't set user_id - let backend use current user

        console.log('Ticket data being submitted:', ticketData);

        // Create FormData for submission (including files)
        const submitData = new FormData();
        
        // Add all text fields
        Object.keys(ticketData).forEach(key => {
            if (ticketData[key] !== null && ticketData[key] !== undefined) {
                submitData.append(key, ticketData[key]);
            }
        });

        // Add files
        const fileInput = document.getElementById("fileInput");
        if (fileInput.files.length > 0) {
            Array.from(fileInput.files).forEach(file => {
                submitData.append("attachments", file);
            });
        }

        // Submit the ticket
        const response = await fetch('/api/v1/tickets/create-ticket', {
            method: 'POST',
            body: submitData,
            credentials: 'include' // Include cookies for authentication
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✅ Ticket created successfully!\n\nTicket ID: ${result.ticket_id}\nTitle: ${ticketData.ticket_title}`);
            closeNewTicketModal();
            await loadTickets(); // Refresh the tickets list
        } else {
            throw new Error(result.message || 'Failed to create ticket');
        }

    } catch (error) {
        console.error('Error creating ticket:', error);
        alert(`❌ Error creating ticket: ${error.message}`);
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Ticket";
    }
}

async function logout() {
  try {
    const response = await fetch('/api/v1/users/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      // Clear any local storage if you're using it
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login page
      window.location.href = '/login.html';
    } else {
      console.error('Logout failed');
      // Still redirect to login even if logout call fails
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // Still redirect to login even if there's an error
    window.location.href = '/login.html';
  }
}

function initializeModal() {
    const modal = document.getElementById('newTicketModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeNewTicketModal();
            }
        });
    }

    const newTicketForm = document.getElementById('newTicketForm');
    if (newTicketForm) {
        newTicketForm.addEventListener('submit', submitNewTicket);
    }

    // Initialize assign ticket modal (simplified)
    initializeAssignModal();

    initializeFileUpload();
    initializeAutocomplete();

    // ESC key handling
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal && modal.classList.contains('active')) {
                closeNewTicketModal();
            }
            const assignModal = document.getElementById('assignTicketModal');
            if (assignModal && assignModal.classList.contains('active')) {
                closeAssignTicketModal();
            }
        }
    });
}

// Add these simplified functions to your maintenance.js file

// Open assign ticket modal
async function assignTicket(ticketId) {
    event.stopPropagation();
    
    try {
        console.log(`Opening assign modal for ticket: ${ticketId}`);
        
        // Fetch ticket details
        const response = await fetch(`/api/v1/tickets/${ticketId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch ticket details');
        }

        const result = await response.json();
        const ticket = result.ticket;
        
        // Check if ticket can be assigned
        const isAssignable = ticket.ticket_status && 
            (ticket.ticket_status.toUpperCase() === 'PENDING' || 
             ticket.ticket_status.toUpperCase() === 'ASSIGNED');
        
        if (!isAssignable) {
            alert(`This ticket cannot be assigned because its status is "${ticket.ticket_status}". Only PENDING or ASSIGNED tickets can be reassigned.`);
            return;
        }

        // Populate the assign form
        populateAssignForm(ticket);
        
        // Show the modal
        const modal = document.getElementById('assignTicketModal');
        modal.classList.add('active');
        
        // Focus on the assignment input
        setTimeout(() => {
            document.getElementById('assignedToInput').focus();
        }, 100);
        
    } catch (error) {
        console.error('Error opening assign modal:', error);
        alert('Failed to load ticket details. Please try again.');
    }
}

// Populate assign form with ticket data
function populateAssignForm(ticket) {
    // Hidden ticket ID
    document.getElementById('assignTicketId').value = ticket.ticket_id;
    
    // Display ticket information
    document.getElementById('assignTicketIdDisplay').value = ticket.ticket_id;
    document.getElementById('assignTicketTitle').value = ticket.ticket_title || '';
    document.getElementById('assignUnitNo').value = ticket.unit_no || '';
    document.getElementById('assignPriority').value = formatPriority(ticket.priority);
    
    // Pre-fill with current assignment if exists
    document.getElementById('assignedToInput').value = ticket.assigned_to || '';
    document.getElementById('assignmentNotes').value = '';
}

// Close assign ticket modal
function closeAssignTicketModal() {
    const modal = document.getElementById('assignTicketModal');
    modal.classList.remove('active');
    
    // Reset form
    document.getElementById('assignTicketForm').reset();
}

// Submit assignment
async function submitAssignment(event) {
    event.preventDefault();
    
    const form = document.getElementById('assignTicketForm');
    const submitBtn = document.querySelector('#assignTicketModal .btn-submit');
    const ticketId = document.getElementById('assignTicketId').value;
    
    // Get form values
    const formData = new FormData(form);
    const assignedTo = formData.get('assigned_to').trim();
    const assignmentNotes = formData.get('assignment_notes')?.trim() || '';
    
    // Validation
    if (!assignedTo) {
        alert('Please specify who to assign this ticket to.');
        document.getElementById('assignedToInput').focus();
        return;
    }
    
    // Confirmation
    const confirmMessage = `Are you sure you want to assign this ticket to "${assignedTo}"?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Disable submit button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Assigning...';
    
    try {
        const ticketData = {
            assigned_to: assignedTo
        };
        
        // Add assignment notes to the ticket notes if provided
        if (assignmentNotes) {
            const currentDate = new Date().toLocaleString();
            const assignmentNote = `[${currentDate}] Assigned to ${assignedTo}: ${assignmentNotes}`;
            ticketData.notes = assignmentNote;
        }
        
        console.log('Assigning ticket with data:', ticketData);
        
        // Submit the assignment
        const response = await fetch(`/api/v1/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticketData),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ Ticket assigned successfully!\n\nTicket has been assigned to: ${assignedTo}`);
            closeAssignTicketModal();
            
            // Reload tickets to show updated assignment
            await loadTickets();
        } else {
            throw new Error(result.message || 'Failed to assign ticket');
        }
        
    } catch (error) {
        console.error('Error assigning ticket:', error);
        alert(`❌ Error assigning ticket: ${error.message}\n\nPlease try again or contact support if the problem persists.`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Assign Ticket';
    }
}

// Initialize assign modal (simplified version)
function initializeAssignModal() {
    const assignModal = document.getElementById('assignTicketModal');
    if (assignModal) {
        // Close modal when clicking outside
        assignModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAssignTicketModal();
            }
        });
    }

    const assignTicketForm = document.getElementById('assignTicketForm');
    if (assignTicketForm) {
        assignTicketForm.addEventListener('submit', submitAssignment);
    }
}