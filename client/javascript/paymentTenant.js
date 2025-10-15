let rentedSpaces = [];

let paymentHistory = [
    {
        id: 1,
        date: "2025-08-01",
        space: "Unit 2A",
        description: "Monthly Rent - August 2025",
        amount: 15000,
        reference: "GC123456789",
        status: "paid",
    },
    {
        id: 2,
        date: "2025-08-05",
        space: "Unit 2A",
        description: "Electricity Bill - July 2025",
        amount: 2500,
        reference: "BDO987654321",
        status: "paid",
    },
    {
        id: 3,
        date: "2025-07-28",
        space: "Storage Unit B1",
        description: "Monthly Rent - July 2025",
        amount: 3000,
        reference: "GC555666777",
        status: "paid",
    },
    {
        id: 4,
        date: "2025-07-15",
        space: "Unit 2A",
        description: "Water Bill - June 2025",
        amount: 800,
        reference: "BDO111222333",
        status: "paid",
    },
    {
        id: 5,
        date: "2025-08-25",
        space: "Office Suite 3B",
        description: "Security Deposit",
        amount: 25000,
        reference: "PENDING001",
        status: "pending",
    },
];

let selectedSpace = null;
let uploadedFile = null;

const API_BASE_URL = "/api/v1";

function escapeJsString(val) {
    return String(val).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function getJwtToken() {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "token") {
            return value;
        }
    }
    return null;
}

function getCurrentUserId() {
    const token = getJwtToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.user_id;
    } catch (e) {
        console.error("Error decoding JWT:", e);
        return null;
    }
}

async function fetchRentedSpaces() {
    const userId = getCurrentUserId();
    if (!userId) {
        console.error("No user ID found");
        return;
    }

    try {
        const token = getJwtToken();
        const response = await fetch(
            `${API_BASE_URL}/leases?user_id=${encodeURIComponent(userId)}`,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch leases");
        }

        const data = await response.json();
        let leases = Array.isArray(data) ? data : data.leases || [];

        leases = leases.filter((lease) => lease.user_id === userId);

        const enrichedLeases = await Promise.all(
            leases.map(async (lease) => {
                let address = "Address not available";
                if (lease.property_id) {
                    try {
                        const propResponse = await fetch(
                            `${API_BASE_URL}/properties/${encodeURIComponent(
                                lease.property_id
                            )}`,
                            {
                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                            }
                        );
                        if (propResponse.ok) {
                            const propData = await propResponse.json();
                            const property = propData.property || propData;
                            if (property.address) {
                                const addr = property.address;
                                address = `${addr.street || ""}, ${addr.city || ""}, ${addr.country || ""
                                    }`
                                    .replace(/^,\s*|,\s*$/g, "")
                                    .trim();
                            }
                        }
                    } catch (e) {
                        console.warn(
                            "Failed to fetch property for lease",
                            lease.lease_id,
                            e
                        );
                    }
                }

                return {
                    ...lease,
                    address,
                };
            })
        );

        rentedSpaces = enrichedLeases.map((lease) => ({
            id: lease.lease_id,
            title: lease.property_name || "Unknown Property",
            status: lease.lease_status || "Unknown",
            address: lease.address,
            monthlyRent: parseFloat(lease.monthly_rent) || 0,
            selected: false,

            dueDate:
                lease.next_due_date || calculateNextDueDate(lease.lease_start_date),

            lease_start_date:
                lease.lease_start_date || lease.start_date || lease.lease_start || null,

            gracePeriodDays:
                parseInt(lease.grace_period_days || lease.gracePeriodDays || 0, 10) ||
                0,

            security_deposit_months:
                parseInt(
                    lease.security_deposit_months || lease.securityDepositMonths || 0,
                    10
                ) || 0,
            advance_payment_months:
                parseInt(
                    lease.advance_payment_months || lease.advancePaymentMonths || 0,
                    10
                ) || 0,
            quarterly_tax_percentage:
                parseFloat(
                    lease.quarterly_tax_percentage || lease.quarterlyTaxPercentage || 0
                ) || 0,
        }));
    } catch (error) {
        console.error("Error fetching rented spaces:", error);
        rentedSpaces = [];
    }
}

function calculateNextDueDate(startDate) {
    if (!startDate) return "2025-09-01";
    const start = new Date(startDate);
    const now = new Date();

    const nextDue = new Date(now.getFullYear(), now.getMonth(), start.getDate());
    if (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 1);
    }
    return nextDue.toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", function () {
    initializePage();
});

async function initializePage() {
    await fetchRentedSpaces();
    loadRentedSpaces();
    loadPaymentHistory();
    showNoSpaceAlert();

    populateMonthYearFilters();

    if (rentedSpaces.length > 0) {
        setTimeout(() => {
            selectSpace(rentedSpaces[0].id);
        }, 500);
    }

    setupEventListeners();
}

function populateMonthYearFilters() {
    const monthSelect = document.getElementById("filter-month");
    const yearSelect = document.getElementById("filter-year");
    if (!monthSelect || !yearSelect) return;

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    monthSelect.innerHTML = "";
    months.forEach((m, idx) => {
        const opt = document.createElement("option");
        opt.value = String(idx + 1).padStart(2, "0");
        opt.textContent = m;

        opt.dataset.monthIndex = String(idx + 1);
        monthSelect.appendChild(opt);
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    for (let y = currentYear + 1; y >= currentYear - 5; y--) {
        const opt = document.createElement("option");
        opt.value = String(y);
        opt.textContent = String(y);
        yearSelect.appendChild(opt);
    }

    const resetBtn = document.getElementById("reset-filter");

    const defaultMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    const defaultYear = String(currentYear);
    monthSelect.value = defaultMonth;
    yearSelect.value = defaultYear;

    monthSelect.addEventListener("change", () => {
        updateMonthAvailability();
        if (selectedSpace) refreshSelectedSpaceData();
    });
    yearSelect.addEventListener("change", () => {
        updateMonthAvailability();
        if (selectedSpace) refreshSelectedSpaceData();
    });

    if (resetBtn)
        resetBtn.addEventListener("click", () => resetBreakdownFilter());
}

function getActiveFilter() {
    const month = document.getElementById("filter-month")?.value || "";
    const year = document.getElementById("filter-year")?.value || "";
    return { month, year };
}

/**
 * Disable month options in the month select that are earlier than the selectedSpace.lease_start_date
 * Visually disables them by setting disabled attribute and adding a 'disabled-month' class
 */
function updateMonthAvailability() {
    const monthSelect = document.getElementById("filter-month");
    const yearSelect = document.getElementById("filter-year");
    if (!monthSelect || !yearSelect) return;

    Array.from(monthSelect.options).forEach((opt) => {
        opt.disabled = false;
        opt.classList.remove("disabled-month");
    });

    if (!selectedSpace || !selectedSpace.lease_start_date) return;

    const leaseStart = new Date(selectedSpace.lease_start_date);
    if (isNaN(leaseStart.getTime())) return;

    const selectedYear =
        parseInt(yearSelect.value, 10) || leaseStart.getFullYear();

    if (selectedYear < leaseStart.getFullYear()) {
        Array.from(monthSelect.options).forEach((opt) => {
            opt.disabled = true;
            opt.classList.add("disabled-month");
        });
        return;
    }

    if (selectedYear === leaseStart.getFullYear()) {
        const startMonth = leaseStart.getMonth() + 1;
        Array.from(monthSelect.options).forEach((opt) => {
            const m = parseInt(opt.value, 10);
            if (m < startMonth) {
                opt.disabled = true;
                opt.classList.add("disabled-month");
            }
        });

        const curMonth = parseInt(monthSelect.value, 10);
        if (curMonth && curMonth < startMonth) {
            monthSelect.value = String(startMonth).padStart(2, "0");
        }
        return;
    }
}

function resetBreakdownFilter() {
    const monthSel = document.getElementById("filter-month");
    const yearSel = document.getElementById("filter-year");
    const now = new Date();
    const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");
    const defaultYear = String(now.getFullYear());
    if (monthSel) monthSel.value = defaultMonth;
    if (yearSel) yearSel.value = defaultYear;

    if (selectedSpace) selectSpace(selectedSpace.id);
}

/**
 * Refresh data (charges, totals, breakdown) for the currently selected space
 * using the current month/year filter without resetting the filter controls.
 */
async function refreshSelectedSpaceData() {
    if (!selectedSpace) return;
    try {
        const activeFilter = getActiveFilter();
        const charges = await fetchPendingCharges(selectedSpace.id, activeFilter);
        selectedSpace.pendingCharges = charges;
    } catch (e) {
        selectedSpace.pendingCharges = [];
    }

    await loadPaymentTotal();
    await loadPaymentBreakdown();
}

function setupEventListeners() {
    window.onclick = function (event) {
        const modal = document.getElementById("payment-modal");
        if (event.target === modal) {
            closePaymentModal();
        }
    };

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closePaymentModal();
        } else if (event.key >= "1" && event.key <= "9") {
            const spaceIndex = parseInt(event.key) - 1;
            if (
                rentedSpaces[spaceIndex] &&
                !document.getElementById("payment-modal").classList.contains("active")
            ) {
                selectSpace(rentedSpaces[spaceIndex].id);
            }
        }
    });
}

function loadRentedSpaces() {
    const container = document.getElementById("spaces-grid");

    if (rentedSpaces.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon"><i class="fas fa-home"></i></div>
                        <div>No rented spaces found</div>
                        <small>Contact your administrator to set up rental agreements.</small>
                    </div>
                `;
        return;
    }

    container.innerHTML = rentedSpaces
        .map((space) => {
            const daysUntilDue = Math.ceil(
                (new Date(space.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            const grace = parseInt(space.gracePeriodDays || 0, 10) || 0;

            let urgencyClass = "paid";
            if (daysUntilDue < -grace) {
                urgencyClass = "overdue";
            } else if (daysUntilDue <= 3) {
                urgencyClass = "pending";
            } else if (daysUntilDue <= 7) {
                urgencyClass = "pending";
            } else {
                urgencyClass = "paid";
            }

            const statusText = String(space.status || "").toLowerCase();
            let statusClass = "paid";
            if (statusText.includes("pending") || statusText.includes("processing")) {
                statusClass = "pending";
            } else if (
                statusText.includes("overdue") ||
                statusText.includes("late") ||
                statusText.includes("delinquent")
            ) {
                statusClass = "overdue";
            } else if (
                statusText.includes("inactive") ||
                statusText.includes("terminated") ||
                statusText.includes("vacant")
            ) {
                statusClass = "overdue";
            } else if (
                statusText.includes("paid") ||
                statusText.includes("active") ||
                statusText.includes("occupied")
            ) {
                statusClass = "paid";
            }

            if (urgencyClass === "overdue") statusClass = "overdue";

            return `
                    <div class="space-card ${space.selected ? "selected" : ""
                }" onclick="selectSpace('${escapeJsString(
                    space.id
                )}')" data-space-id="${space.id}">
                        <div class="space-header">
                            <div class="space-title">${space.title}</div>
                            <div class="space-status ${statusClass}">${space.status
                }</div>
                        </div>
                        <div class="space-details">
                            <i class="fas fa-location-dot"></i> ${space.address}
                        </div>
                        <div class="space-details" style="margin-top: 0.5rem; font-weight: 500;">
                            <i class="fas fa-calendar-days"></i> Due: ${formatDate(
                    space.dueDate
                )}
                            ${daysUntilDue <= 7
                    ? `<span style="color: #ef4444; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;"><i class="fas fa-exclamation-triangle" style="font-size: 0.875rem;"></i>(${daysUntilDue} days)</span>`
                    : ""
                }
                        </div>
                        <div class="space-rent">₱${formatCurrency(
                    space.monthlyRent
                )}/month</div>
                    </div>
                `;
        })
        .join("");
}

async function fetchPendingCharges(leaseId, filter = {}) {
    if (!leaseId) return [];
    try {
        const token = getJwtToken();

        let url = `${API_BASE_URL}/charges/leases/${encodeURIComponent(leaseId)}`;

        const q = [];
        if (filter && (filter.month || filter.year)) {
            const month = filter.month || "";
            const year = filter.year || "";
            if (month && year) {
                const from = `${year}-${month}-01`;

                const lastDay = new Date(
                    parseInt(year, 10),
                    parseInt(month, 10),
                    0
                ).getDate();
                const to = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
                q.push(`due_date_from=${encodeURIComponent(from)}`);
                q.push(`due_date_to=${encodeURIComponent(to)}`);
            } else if (year && !month) {
                q.push(`due_date_from=${encodeURIComponent(year + "-01-01")}`);
                q.push(`due_date_to=${encodeURIComponent(year + "-12-31")}`);
            } else if (month && !year) {
                const now = new Date();
                const y = String(now.getFullYear());
                const from = `${y}-${month}-01`;
                const lastDay = new Date(
                    parseInt(y, 10),
                    parseInt(month, 10),
                    0
                ).getDate();
                const to = `${y}-${month}-${String(lastDay).padStart(2, "0")}`;
                q.push(`due_date_from=${encodeURIComponent(from)}`);
                q.push(`due_date_to=${encodeURIComponent(to)}`);
            }
        }

        if (q.length) url += `?${q.join("&")}`;

        const resp = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resp.ok) {
            console.warn("Failed to fetch charges for lease", leaseId, resp.status);
            return [];
        }
        const data = await resp.json();

        const charges = Array.isArray(data) ? data : data.charges || [];
        return charges;
    } catch (e) {
        console.error("Error fetching pending charges:", e);
        return [];
    }
}

async function selectSpace(spaceId) {
    rentedSpaces.forEach((space) => {
        space.selected = space.id === spaceId;
    });

    selectedSpace = rentedSpaces.find((space) => space.id === spaceId);

    const monthSel = document.getElementById("filter-month");
    const yearSel = document.getElementById("filter-year");
    if (monthSel && yearSel) {
        const now = new Date();
        monthSel.value = String(now.getMonth() + 1).padStart(2, "0");
        yearSel.value = String(now.getFullYear());

        updateMonthAvailability();

        if (selectedSpace && selectedSpace.lease_start_date) {
            const ls = new Date(selectedSpace.lease_start_date);
            if (!isNaN(ls.getTime())) {
                const selMonth = parseInt(monthSel.value, 10);
                const selYear = parseInt(yearSel.value, 10);
                if (
                    selYear < ls.getFullYear() ||
                    (selYear === ls.getFullYear() && selMonth < ls.getMonth() + 1)
                ) {
                    monthSel.value = String(ls.getMonth() + 1).padStart(2, "0");
                    yearSel.value = String(ls.getFullYear());
                }
            }
        }
    }

    loadRentedSpaces();
    setTimeout(async () => {
        if (selectedSpace) {
            try {
                const activeFilter = getActiveFilter();
                const charges = await fetchPendingCharges(
                    selectedSpace.id,
                    activeFilter
                );
                selectedSpace.pendingCharges = charges;
            } catch (e) {
                selectedSpace.pendingCharges = [];
            }
        }

        await loadPaymentTotal();
        await loadPaymentBreakdown();

        const breakdownElement = document.getElementById("breakdown-container");
        if (breakdownElement) {
            breakdownElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, 150);
}

function loadPaymentTotal() {
    const container = document.getElementById("total-container");

    if (!selectedSpace) {
        if (container) {
            container.innerHTML = "";
        }
        return;
    }

    const charges =
        selectedSpace && Array.isArray(selectedSpace.pendingCharges)
            ? selectedSpace.pendingCharges
            : [];

    const totalFixed =
        charges.length > 0
            ? charges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
            : [
                { label: "Monthly Rent", amount: selectedSpace.monthlyRent },
                {
                    label: "Electricity",
                    amount: Math.floor(Math.random() * 1000) + 2000,
                },
                { label: "Water", amount: Math.floor(Math.random() * 300) + 600 },
                { label: "Maintenance Fee", amount: 500 },
            ].reduce((s, c) => s + c.amount, 0);
    const currentMonth = new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    const activeFilter = getActiveFilter();
    let displayedTotal = totalFixed;
    if (charges.length > 0 && (activeFilter.month || activeFilter.year)) {
        displayedTotal = charges
            .filter((c) => {
                const d = c.due_date || c.charge_date || "";
                if (!d) return false;
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return false;
                const m = String(dt.getMonth() + 1).padStart(2, "0");
                const y = String(dt.getFullYear());
                if (activeFilter.month && activeFilter.year)
                    return m === activeFilter.month && y === activeFilter.year;
                if (activeFilter.month) return m === activeFilter.month;
                if (activeFilter.year) return y === activeFilter.year;
                return true;
            })
            .reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
    }

    if (container) {
        container.innerHTML = `
                    <div class="total-section">
                        <div class="total-label">
                            <i class="fas fa-calendar-days"></i>
                            ${currentMonth} - Total Due
                        </div>
                        <div class="total-amount">₱${formatCurrency(
            displayedTotal
        )}</div>
                        <button class="pay-now-btn" onclick="openPaymentModal(${displayedTotal})">
                            <i class="fas fa-credit-card"></i> Pay Now
                        </button>
                    </div>
                `;
    }
}

function loadPaymentBreakdown() {
    const container = document.getElementById("breakdown-container");
    const noSpaceAlert = document.getElementById("no-space-alert");

    if (!selectedSpace) {
        if (noSpaceAlert) {
            noSpaceAlert.classList.add("active");
        }
        return;
    }

    if (noSpaceAlert) {
        noSpaceAlert.classList.remove("active");
    }

    const fixedCosts = [
        { label: "Monthly Rent", amount: selectedSpace.monthlyRent },
        { label: "Electricity", amount: Math.floor(Math.random() * 1000) + 2000 },
        { label: "Water", amount: Math.floor(Math.random() * 300) + 600 },
        { label: "Maintenance Fee", amount: 500 },
    ];

    const charges =
        selectedSpace && Array.isArray(selectedSpace.pendingCharges)
            ? selectedSpace.pendingCharges
            : [];

    const sdMonths =
        parseInt(selectedSpace.security_deposit_months || 1, 10) || 1;
    const advanceMonths =
        parseInt(selectedSpace.advance_payment_months || 0, 10) || 0;
    const quarterlyPct =
        parseFloat(selectedSpace.quarterly_tax_percentage || 0) || 0;

    const occasionalCosts = [
        {
            label: "Security Deposit",
            amount: selectedSpace.monthlyRent * sdMonths,
            due: "One-time (if applicable)",
            explanation: `Security Deposit = ₱${formatCurrency(
                selectedSpace.monthlyRent
            )} × ${sdMonths} month(s) = ₱${formatCurrency(
                selectedSpace.monthlyRent * sdMonths
            )}`,
        },
        {
            label: "Advance Rent",
            amount: selectedSpace.monthlyRent * advanceMonths,
            due: "One-time (if applicable)",
            explanation: `Advance Rent = ₱${formatCurrency(
                selectedSpace.monthlyRent
            )} × ${advanceMonths} month(s) = ₱${formatCurrency(
                selectedSpace.monthlyRent * advanceMonths
            )}`,
        },

        {
            label: "Quarterly Tax",
            amount: null,
            due: `${quarterlyPct}%`,
            isPercentage: true,
            explanation: `Applied as ${quarterlyPct}% of the assessed quarterly amount`,
        },
    ];

    const totalFixed =
        charges.length > 0
            ? charges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
            : fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);

    const activeFilter = getActiveFilter();
    const filterMonth = activeFilter.month;
    const filterYear = activeFilter.year;

    if (container) {
        let displayedCharges = charges;
        if (charges.length > 0 && (filterMonth || filterYear)) {
            displayedCharges = charges.filter((c) => {
                const d = c.due_date || c.charge_date || c.dueDate || "";
                if (!d) return false;
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return false;
                const m = String(dt.getMonth() + 1).padStart(2, "0");
                const y = String(dt.getFullYear());
                if (filterMonth && filterYear)
                    return m === filterMonth && y === filterYear;
                if (filterMonth) return m === filterMonth;
                if (filterYear) return y === filterYear;
                return true;
            });
        }

        const hasFilter = !!(filterMonth || filterYear);
        let pendingListHtml = "";
        if (displayedCharges.length > 0) {
            pendingListHtml = displayedCharges
                .map(
                    (ch) => `
                    <div class="breakdown-item">
                        <div>
                            <div class="breakdown-label" style="font-size:18px; font-weight:800;">${ch.charge_type || ch.description || "Charge"
                        }</div>
                            ${ch.description
                            ? `<div class="breakdown-desc" style="color:#6b7280; margin:6px 0; font-size:13px;">${escapeHtml(
                                ch.description
                            )}</div>`
                            : ""
                        }
                            ${renderDuePill(
                            ch.due_date || ch.charge_date || ch.dueDate || "",
                            selectedSpace && selectedSpace.gracePeriodDays
                                ? selectedSpace.gracePeriodDays
                                : 0
                        )}
                        </div>
                        <span class="breakdown-amount">₱${formatCurrency(
                            parseFloat(ch.amount) || 0
                        )}</span>
                    </div>
                `
                )
                .join("");
        } else {
            if (hasFilter) {
                pendingListHtml = `
                    <div class="breakdown-empty">
                        <div class="empty-state">
                            <div class="empty-icon"><i class="fas fa-file-invoice"></i></div>
                            <div>No pending charges found for the selected period</div>
                        </div>
                    </div>
                `;
            } else {
                pendingListHtml = fixedCosts
                    .map(
                        (cost) => `
                        <div class="breakdown-item">
                            <span class="breakdown-label">${cost.label}</span>
                            <span class="breakdown-amount">₱${formatCurrency(
                            cost.amount
                        )}</span>
                        </div>
                    `
                    )
                    .join("");
            }
        }

        let totalPendingAmount = 0;
        if (hasFilter) {
            totalPendingAmount = displayedCharges.reduce(
                (s, c) => s + (parseFloat(c.amount) || 0),
                0
            );
        } else if (charges.length > 0) {
            totalPendingAmount = charges.reduce(
                (s, c) => s + (parseFloat(c.amount) || 0),
                0
            );
        } else {
            totalPendingAmount = totalFixed;
        }

        container.innerHTML = `
            <div class="breakdown-grid">
                <div class="breakdown-section">
                    <h3 class="breakdown-title">
                        <i class="fas fa-exclamation-circle"></i>
                        Pending Charges
                    </h3>
                    ${pendingListHtml}
                    <div class="breakdown-item" style="border-top: 2px solid #667eea; padding-top: 0.75rem;">
                        <span class="breakdown-label">Total Pending</span>
                        <span class="breakdown-amount">₱${formatCurrency(
            totalPendingAmount
        )}</span>
                    </div>
                </div>

                <div class="breakdown-section">
                    <h3 class="breakdown-title">
                        <i class="fas fa-clock-rotate-left"></i>
                        Occasional Payments
                    </h3>
                    ${occasionalCosts
                .map((cost) => {
                    const amountHtml = cost.isPercentage
                        ? `${cost.due}`
                        : cost.amount == null
                            ? "-"
                            : `₱${formatCurrency(cost.amount)}`;

                    const dueHtml = cost.due
                        ? `<small style="color: #6b7280; font-style: italic;">${escapeHtml(
                            cost.due
                        )}</small>`
                        : "";
                    const explainHtml = cost.explanation
                        ? `<div class="breakdown-explain" style="color:#6b7280;margin-top:4px;font-size:12px;font-style:italic;">${escapeHtml(
                            cost.explanation
                        )}</div>`
                        : "";

                    return `
                        <div class="breakdown-item">
                            <div>
                                <div class="breakdown-label">${cost.label}</div>
                                ${dueHtml}
                                ${explainHtml}
                            </div>
                            <span class="breakdown-amount">${amountHtml}</span>
                        </div>
                    `;
                })
                .join("")}
                </div>
            </div>
        `;
    }
}

function loadPaymentHistory() {
    const tbody = document.getElementById("payment-tbody");

    if (paymentHistory.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <div class="empty-icon"><i class="fas fa-file-invoice"></i></div>
                            <div>No payment records found</div>
                            <small>Your payment history will appear here once you make payments.</small>
                        </td>
                    </tr>
                `;
        return;
    }

    const sortedHistory = [...paymentHistory].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    tbody.innerHTML = sortedHistory
        .map(
            (payment) => `
                <tr>
                    <td>${formatDate(payment.date)}</td>
                    <td>
                        <strong>${payment.space}</strong>
                    </td>
                    <td>${payment.description}</td>
                    <td style="font-weight: 600; color: #059669;">₱${payment.amount.toLocaleString()}</td>
                    <td>
                        <code style="background: rgba(102, 126, 234, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-family: 'Courier New', monospace;">
                            ${payment.reference}
                        </code>
                        <button class="copy-btn" onclick="copyToClipboard('${payment.reference
                }')" style="margin-left: 0.5rem;">
                            <i class="fas fa-copy"></i>
                        </button>
                    </td>
                    <td>
                        <span class="status ${payment.status}">
                            ${getStatusIcon(payment.status)} ${payment.status}
                        </span>
                    </td>
                </tr>
            `
        )
        .join("");
}

function showNoSpaceAlert() {
    const alert = document.getElementById("no-space-alert");
    if (alert && !selectedSpace) {
        alert.classList.add("active");
    }
}

function hideNoSpaceAlert() {
    const alert = document.getElementById("no-space-alert");
    if (alert) {
        alert.classList.remove("active");
    }
}

function openPaymentModal(amount) {
    if (!selectedSpace) {
        showAlert("error", "Please select a rental space first.");
        return;
    }

    const modal = document.getElementById("payment-modal");
    const modalAmount = document.getElementById("modal-amount");

    if (modalAmount) {
        modalAmount.textContent = `₱${amount.toLocaleString()}`;
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    resetModalForm();
}

function closePaymentModal() {
    const modal = document.getElementById("payment-modal");
    modal.classList.remove("active");
    document.body.style.overflow = "auto";

    resetModalForm();
}

function resetModalForm() {
    uploadedFile = null;
    const filePreview = document.getElementById("file-preview");
    const fileInput = document.getElementById("payment-proof");
    const submitBtn = document.getElementById("submit-payment-btn");
    const alerts = document.querySelectorAll(".alert");

    if (filePreview) filePreview.classList.remove("active");
    if (fileInput) fileInput.value = "";
    if (submitBtn) submitBtn.disabled = true;

    alerts.forEach((alert) => alert.classList.remove("active"));
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    const filePreview = document.getElementById("file-preview");
    const fileName = document.getElementById("file-name");
    const submitBtn = document.getElementById("submit-payment-btn");

    if (file) {
        if (!file.type.startsWith("image/")) {
            showModalAlert("error", "Please upload an image file only.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showModalAlert("error", "File size must be less than 5MB.");
            event.target.value = "";
            return;
        }

        uploadedFile = file;
        if (fileName) {
            fileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(
                1
            )}MB)`;
        }
        if (filePreview) {
            filePreview.classList.add("active");
        }
        if (submitBtn) {
            submitBtn.disabled = false;
        }

        showModalAlert(
            "success",
            "File uploaded successfully! You can now submit your payment confirmation."
        );
    }
}

function removeFile() {
    uploadedFile = null;
    const filePreview = document.getElementById("file-preview");
    const fileInput = document.getElementById("payment-proof");
    const submitBtn = document.getElementById("submit-payment-btn");

    if (filePreview) filePreview.classList.remove("active");
    if (fileInput) fileInput.value = "";
    if (submitBtn) submitBtn.disabled = true;

    showModalAlert(
        "error",
        "File removed. Please upload a new payment confirmation."
    );
}

function submitPayment() {
    const submitBtn = document.getElementById("submit-payment-btn");

    if (!uploadedFile) {
        showModalAlert("error", "Please upload payment confirmation screenshot.");
        return;
    }

    if (!selectedSpace) {
        showModalAlert("error", "Please select a rental space.");
        return;
    }

    submitBtn.innerHTML = '<div class="loading"></div> Processing...';
    submitBtn.disabled = true;

    setTimeout(() => {
        const totalAmount = calculateTotalAmount();
        const newPayment = {
            id: Date.now(),
            date: new Date().toISOString().split("T")[0],
            space: selectedSpace.title,
            description: `Monthly Payment - ${new Date().toLocaleString("en-US", {
                month: "long",
                year: "numeric",
            })}`,
            amount: totalAmount,
            reference: generateReference(),
            status: "pending",
        };

        paymentHistory.unshift(newPayment);
        loadPaymentHistory();

        showModalAlert(
            "success",
            "Payment confirmation submitted successfully! Your payment is now under review and will be processed within 24 hours."
        );

        submitBtn.innerHTML =
            '<i class="fas fa-check"></i> Submitted Successfully!';

        setTimeout(() => {
            submitBtn.innerHTML =
                '<i class="fas fa-paper-plane"></i> Submit Payment Confirmation';
            closePaymentModal();
        }, 2500);
    }, 1500);
}

function calculateTotalAmount() {
    if (!selectedSpace) return 0;

    const baseRent = selectedSpace.monthlyRent;
    const utilities = Math.floor(Math.random() * 1000) + 2000;
    const water = Math.floor(Math.random() * 300) + 600;
    const maintenance = 500;

    return baseRent + utilities + water + maintenance;
}

function formatCurrency(amount) {
    try {
        return Number(amount).toLocaleString();
    } catch (e) {
        return amount;
    }
}

/**
 * Render a due-date pill with formatted date and urgency indicator.
 * dueDateStr: raw date string (ISO or other). graceDays: integer.
 */
function renderDuePill(dueDateStr, graceDays = 0) {
    if (!dueDateStr) return "<small style='color:#6b7280;'>No due date</small>";
    const d = new Date(dueDateStr);
    if (isNaN(d.getTime())) {
        return `<small style='color:#6b7280;'>${dueDateStr}</small>`;
    }

    const today = new Date();
    const todayMid = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    ).getTime();
    const dueMid = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffTime = dueMid - todayMid;
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const grace = parseInt(graceDays || 0, 10) || 0;

    let state = "normal";
    if (daysUntilDue < -grace) state = "overdue";
    else if (daysUntilDue <= 3) state = "due-soon";

    const formatted = formatDate(dueDateStr);

    const baseStyle =
        "display:inline-flex;align-items:center;gap:0.5rem;padding:6px 10px;border-radius:999px;font-weight:700;font-size:13px;";
    if (state === "overdue") {
        const overdueDays = Math.max(Math.abs(daysUntilDue) - grace, 1);
        return `<span class='due-pill overdue' style='${baseStyle}background:#ef4444;color:#fff;'><i class='fas fa-exclamation-triangle' style='font-size:0.9rem;'></i> ${formatted} · ${overdueDays}d overdue</span>`;
    }
    if (state === "due-soon") {
        if (daysUntilDue <= 0) {
            return `<span class='due-pill due-soon' style='${baseStyle}background:#f59e0b;color:#111827;'><i class='fas fa-hourglass-half' style='font-size:0.9rem;'></i> ${formatted} · due${grace > 0 ? ` (grace ${grace}d)` : ""
                }</span>`;
        }
        return `<span class='due-pill due-soon' style='${baseStyle}background:#f59e0b;color:#111827;'><i class='fas fa-hourglass-half' style='font-size:0.9rem;'></i> ${formatted} · in ${daysUntilDue}d</span>`;
    }

    return `<span class='due-pill normal' style='${baseStyle}background:#64748b;color:#fff;'><i class='fas fa-calendar-days' style='font-size:0.85rem;'></i> ${formatted}</span>`;
}

function generateReference() {
    const prefix = Math.random() > 0.5 ? "GC" : "BDO";
    const number = Math.floor(Math.random() * 900000000) + 100000000;
    return `${prefix}${number}`;
}

function showModalAlert(type, message) {
    const successAlert = document.getElementById("modal-success-alert");
    const errorAlert = document.getElementById("modal-error-alert");

    if (successAlert) successAlert.classList.remove("active");
    if (errorAlert) errorAlert.classList.remove("active");

    const alert = document.getElementById(`modal-${type}-alert`);
    if (alert) {
        alert.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-triangle"
            }"></i> ${message}`;
        alert.classList.add("active");

        setTimeout(
            () => {
                alert.classList.remove("active");
            },
            type === "success" ? 8000 : 5000
        );
    }
}

function showAlert(type, message) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert ${type} active`;
    alertDiv.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-triangle"
        }"></i> ${message}`;
    alertDiv.style.position = "fixed";
    alertDiv.style.top = "20px";
    alertDiv.style.right = "20px";
    alertDiv.style.zIndex = "1001";
    alertDiv.style.minWidth = "300px";

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                showAlert("success", "Copied to clipboard!");
            })
            .catch(() => {
                fallbackCopyTextToClipboard(text);
            });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
            showAlert("success", "Copied to clipboard!");
        } else {
            showAlert("error", "Failed to copy to clipboard");
        }
    } catch (err) {
        console.error("Fallback copy failed:", err);
        showAlert("error", "Copy not supported in this browser");
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        const today = new Date();
        const diffTime = today - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7 && diffDays > 0) return `${diffDays} days ago`;
        if (diffDays < 0 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (error) {
        console.error("Date formatting error:", error);
        return dateString;
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getStatusIcon(status) {
    const icons = {
        paid: "✅",
        pending: "⏳",
        overdue: "❌",
    };
    return icons[status] || "📄";
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        const upcomingDue = rentedSpaces.filter((space) => {
            const daysUntilDue = Math.ceil(
                (new Date(space.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            return daysUntilDue <= 7 && daysUntilDue > 0;
        });

        if (upcomingDue.length > 0) {
            showAlert(
                "error",
                `⚠️ ${upcomingDue.length} payment(s) due within 7 days!`
            );
        }
    }, 2000);
});

setInterval(() => {
    const pendingPayments = paymentHistory.filter((p) => p.status === "pending");
    if (pendingPayments.length > 0 && Math.random() > 0.95) {
        const randomPending =
            pendingPayments[Math.floor(Math.random() * pendingPayments.length)];
        randomPending.status = "paid";
        loadPaymentHistory();
        showAlert(
            "success",
            `Payment ${randomPending.reference} has been confirmed!`
        );
    }
}, 10000);

window.selectSpace = selectSpace;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.handleFileUpload = handleFileUpload;
window.escapeHtml = escapeHtml;
