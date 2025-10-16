let rentedSpaces = [];

let paymentHistory = [];

let selectedSpace = null;
const MAX_PAYMENT_PROOF_FILES = 5;
let uploadedFiles = [];

const FALLBACK_PAYMENT_METHODS = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Check", label: "Check" },
    { value: "Other", label: "Other (GCash / Maya)" },
];

let paymentModalCharges = [];
let selectedChargeIds = new Set();

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

function getQrPlaceholderSrc(label = "QR") {
    const sanitizedLabel = String(label).replace(/[^a-z0-9\s/+-]/gi, "").toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='24' font-family='Arial'>${sanitizedLabel}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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

    const chargeList = document.getElementById("payment-charge-list");
    if (chargeList) {
        chargeList.addEventListener("change", handleChargeSelectionChange);
    }

    const payFullBtn = document.getElementById("pay-full-btn");
    if (payFullBtn) {
        payFullBtn.addEventListener("click", setPaymentAmountToFull);
    }

    const toggleSelectAllBtn = document.getElementById("toggle-select-all");
    if (toggleSelectAllBtn) {
        toggleSelectAllBtn.addEventListener("click", toggleSelectAllCharges);
    }

    const paymentMethodSelect = document.getElementById("payment-method");
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener("change", (event) => {
            renderPaymentInstructions(event.target.value || "");
        });
    }
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

        if (selectedSpace) {
            selectedSpace.displayedCharges = Array.isArray(displayedCharges)
                ? [...displayedCharges]
                : [];
        }

        const hasFilter = !!(filterMonth || filterYear);
        let pendingListHtml = "";
        if (displayedCharges.length > 0) {
            // Fetch pending payments for these charges and cache in a map for quick lookup
            // Note: this is async; we prefetch and then re-render once loaded.
            (async () => {
                const pendingMap = await fetchPendingPaymentsForCharges(displayedCharges);
                window.__pendingPaymentsMap = pendingMap;
                // Re-render to include indicators
                loadPaymentBreakdown();
            })();
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
                            ${renderChargePaymentIndicator(ch)}
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

async function fetchPendingPaymentsForCharges(charges) {
    try {
        const ids = (charges || [])
            .map((c) => c.charge_id || c.chargeId || c.id)
            .filter((v) => v != null)
            .map(String);
        if (!ids.length) return {};

        const token = getJwtToken();
        const query = new URLSearchParams({ charge_ids: ids.join(","), status: "Pending" }).toString();
        const resp = await fetch(`${API_BASE_URL}/payments/search/by-charge?${query}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resp.ok) return {};
        const data = await resp.json();
        const map = {};
        (data.payments || []).forEach((p) => {
            const key = String(p.charge_id);
            if (!map[key]) map[key] = [];
            map[key].push(p);
        });
        return map;
    } catch (e) {
        console.warn("fetchPendingPaymentsForCharges error", e);
        return {};
    }
}

function renderChargePaymentIndicator(charge) {
    try {
        if (!charge) return "";
        const key = String(charge.charge_id || charge.chargeId || charge.id || "");
        if (!key) return "";
        const pendingMap = window.__pendingPaymentsMap || {};
        const group = pendingMap[key];
        if (!group || !group.length) return "";
        const pendingAmount = Number(group.reduce((s, p) => s + (Number(p.amount_paid || p.amount || 0)), 0));
        const formattedAmount = pendingAmount
            ? `₱${formatCurrency(pendingAmount)}`
            : "Pending payment submitted";
        return `
            <div class="charge-payment-status payment-pending" style="margin-top:6px;">
                <i class="fas fa-hourglass-half"></i>
                <span>${formattedAmount} (Pending)</span>
            </div>
        `;
    } catch (err) {
        console.warn("renderChargePaymentIndicator error", err);
        return "";
    }
}

function getPendingAmountForCharge(charge) {
    try {
        const key = String(charge?.charge_id || charge?.chargeId || charge?.id || "");
        if (!key) return 0;
        const map = window.__pendingPaymentsMap || {};
        const list = map[key] || [];
        const total = list.reduce((s, p) => s + (Number(p.amount_paid || p.amount || 0)), 0);
        return Number(total) || 0;
    } catch (e) {
        return 0;
    }
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

function openPaymentModal(defaultAmount) {
    if (!selectedSpace) {
        showAlert("error", "Please select a rental space first.");
        return;
    }

    const modal = document.getElementById("payment-modal");
    if (!modal) return;

    resetModalForm();
    preparePaymentModal(
        typeof defaultAmount === "number" && !Number.isNaN(defaultAmount)
            ? defaultAmount
            : undefined
    );

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closePaymentModal() {
    const modal = document.getElementById("payment-modal");
    modal.classList.remove("active");
    document.body.style.overflow = "auto";

    resetModalForm();
}

function resetModalForm() {
    uploadedFiles = [];
    paymentModalCharges = [];
    selectedChargeIds = new Set();

    const fileInput = document.getElementById("payment-proof");
    const submitBtn = document.getElementById("submit-payment-btn");
    const alerts = document.querySelectorAll(".alert");
    const chargeList = document.getElementById("payment-charge-list");
    const countSpan = document.getElementById("selected-charge-count");
    const totalSpan = document.getElementById("selected-charge-total");
    const amountInput = document.getElementById("payment-amount");
    const payFullBtn = document.getElementById("pay-full-btn");
    const toggleSelectAllBtn = document.getElementById("toggle-select-all");
    const methodSelect = document.getElementById("payment-method");

    if (chargeList) {
        chargeList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-file-circle-question"></i></div>
                <div>No charges selected yet.</div>
            </div>
        `;
    }
    if (countSpan) countSpan.textContent = "0 charges selected";
    if (totalSpan) totalSpan.textContent = "₱0.00";
    if (amountInput) {
        amountInput.value = "";
        amountInput.disabled = true;
    }
    if (payFullBtn) payFullBtn.disabled = true;
    if (toggleSelectAllBtn) {
        toggleSelectAllBtn.disabled = true;
        toggleSelectAllBtn.textContent = "Select All";
    }
    renderPaymentMethodOptions();
    if (methodSelect) {
        methodSelect.value = "";
    }
    renderPaymentInstructions("");

    if (fileInput) fileInput.value = "";
    if (submitBtn) submitBtn.disabled = true;

    renderUploadedFilesPreview();

    alerts.forEach((alert) => alert.classList.remove("active"));
}

function updateFileLimitHint() {
    const hint = document.getElementById("file-limit-hint");
    if (!hint) return;
    hint.textContent = `${uploadedFiles.length} of ${MAX_PAYMENT_PROOF_FILES} images selected (PNG, JPG, JPEG).`;
    hint.style.color = uploadedFiles.length >= MAX_PAYMENT_PROOF_FILES ? "#dc2626" : "#047857";
}

function renderUploadedFilesPreview() {
    const preview = document.getElementById("file-preview");
    const list = document.getElementById("file-preview-list");
    const empty = document.getElementById("file-preview-empty");
    const submitBtn = document.getElementById("submit-payment-btn");

    if (!preview || !list || !empty) {
        updateFileLimitHint();
        return;
    }

    if (!uploadedFiles.length) {
        preview.classList.remove("active");
        list.innerHTML = "";
        empty.style.display = "flex";
    } else {
        preview.classList.add("active");
        empty.style.display = "none";
        list.innerHTML = uploadedFiles
            .map((file, index) => {
                const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
                return `
                    <div class="preview-item">
                        <i class="fas fa-file-image"></i>
                        <div class="preview-meta">
                            <strong>${escapeHtml(file.name)}</strong>
                            <small>${sizeMb} MB</small>
                        </div>
                        <button type="button" class="preview-remove" onclick="removeUploadedImage(${index})" aria-label="Remove ${escapeHtml(file.name)}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            })
            .join("");
    }

    if (submitBtn) {
        submitBtn.disabled = uploadedFiles.length === 0;
    }

    updateFileLimitHint();
}

function handleFileUpload(event) {
    const input = event && event.target ? event.target : null;
    const files = input ? Array.from(input.files || []) : [];

    if (!files.length) {
        if (input) input.value = "";
        return;
    }

    let addedCount = 0;
    let errorMessage = "";

    files.forEach((file) => {
        if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
            if (!errorMessage) {
                errorMessage = `${file.name} must be a PNG, JPG, or JPEG image.`;
            }
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            if (!errorMessage) {
                errorMessage = `${file.name} exceeds the 5MB file size limit.`;
            }
            return;
        }

        if (uploadedFiles.length >= MAX_PAYMENT_PROOF_FILES) {
            if (!errorMessage) {
                errorMessage = `You can upload up to ${MAX_PAYMENT_PROOF_FILES} images. Remove an existing proof to add another.`;
            }
            return;
        }

        const duplicate = uploadedFiles.some(
            (existing) =>
                existing.name === file.name &&
                existing.size === file.size &&
                existing.lastModified === file.lastModified
        );

        if (duplicate) {
            if (!errorMessage) {
                errorMessage = `${file.name} has already been added.`;
            }
            return;
        }

        uploadedFiles.push(file);
        addedCount += 1;
    });

    if (input) input.value = "";

    if (errorMessage && addedCount > 0) {
        showModalAlert(
            "error",
            `${errorMessage} Added ${addedCount} image${addedCount > 1 ? "s" : ""} successfully.`
        );
    } else if (errorMessage) {
        showModalAlert("error", errorMessage);
    } else if (addedCount > 0) {
        showModalAlert(
            "success",
            `Added ${addedCount} image${addedCount > 1 ? "s" : ""}. You can remove or add more before submitting.`
        );
    }

    renderUploadedFilesPreview();
}

function removeUploadedImage(index) {
    if (index < 0 || index >= uploadedFiles.length) return;
    uploadedFiles.splice(index, 1);
    renderUploadedFilesPreview();
    showModalAlert("success", "Image removed. You can upload another before submitting.");
}

async function submitPayment() {
    const submitBtn = document.getElementById("submit-payment-btn");

    if (!selectedSpace) {
        showModalAlert("error", "Please select a rental space.");
        return;
    }

    if (selectedChargeIds.size === 0) {
        showModalAlert("error", "Please select at least one charge to pay.");
        return;
    }

    const selectedCharges = getSelectedCharges();
    if (!selectedCharges.length) {
        showModalAlert("error", "Please select at least one charge to pay.");
        return;
    }

    const amountInput = document.getElementById("payment-amount");
    const paymentMethodSelect = document.getElementById("payment-method");

    const amountValue = amountInput ? parseFloat(amountInput.value) : NaN;
    if (!amountInput || Number.isNaN(amountValue) || amountValue <= 0) {
        showModalAlert("error", "Enter a valid payment amount greater than 0.");
        return;
    }

    const totalSelected = calculateSelectedChargesTotal();
    if (amountValue > totalSelected + 0.01) {
        showModalAlert(
            "error",
            "Payment amount cannot exceed the total of the selected charges."
        );
        return;
    }

    if (!paymentMethodSelect || !paymentMethodSelect.value) {
        showModalAlert("error", "Please select a payment method.");
        return;
    }

    if (!uploadedFiles.length) {
        showModalAlert(
            "error",
            "Please upload at least one image (PNG, JPG, JPEG) as payment proof."
        );
        return;
    }

    const primaryCharge = selectedCharges[0];
    const chargeIdForApi =
        primaryCharge?.charge_id ||
        primaryCharge?.chargeId ||
        primaryCharge?.id ||
        primaryCharge?.id_charge ||
        null;

    if (!chargeIdForApi) {
        showModalAlert(
            "error",
            "We couldn't determine which charge to attach this payment to. Please try again or contact support."
        );
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading"></div> Processing...';

    const token = getJwtToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append("chargeId", chargeIdForApi);
    formData.append("paymentDate", new Date().toISOString().split("T")[0]);
    formData.append("amountPaid", amountValue.toFixed(2));
    formData.append("paymentMethod", paymentMethodSelect.value);
    formData.append("user_id", getCurrentUserId());

    const additionalCharges = selectedCharges.slice(1);
    const noteSegments = [
        `Submitted via tenant portal covering ${selectedCharges.length} charge${selectedCharges.length === 1 ? "" : "s"}.`,
    ];
    if (additionalCharges.length) {
        const refs = additionalCharges
            .map((charge) =>
                charge.charge_id ||
                charge.chargeId ||
                charge.id ||
                resolveChargeIdentifier(charge)
            )
            .join(", ");
        noteSegments.push(`Additional charge references: ${refs}`);
    }
    formData.append("notes", noteSegments.join(" "));

    uploadedFiles.forEach((file) => {
        formData.append("proofs", file);
    });

    try {
        const response = await fetch(`${API_BASE_URL}/payments/create-payment`, {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || "Failed to submit payment confirmation.");
        }

        const result = await response.json().catch(() => ({}));

        showModalAlert(
            "success",
            result.message || "Payment confirmation submitted! We'll review it shortly."
        );

        const chargeSummary = selectedCharges
            .map((charge) =>
                charge.charge_type ||
                charge.type ||
                charge.description ||
                resolveChargeIdentifier(charge)
            )
            .join(", ");

        paymentHistory.unshift({
            id: result.payment_id || Date.now(),
            date: new Date().toISOString().split("T")[0],
            space: selectedSpace.title,
            description: selectedCharges.length
                ? `Payment for ${selectedCharges.length} charge${selectedCharges.length === 1 ? "" : "s"}: ${chargeSummary}`
                : `Payment confirmation - ${new Date().toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                  })}`,
            amount: Number(amountValue.toFixed(2)),
            reference: result.payment_id || generateReference(),
            status: "pending",
            method: paymentMethodSelect.value,
            charge_ids: selectedCharges.map((charge) =>
                resolveChargeIdentifier(charge)
            ),
        });
        loadPaymentHistory();

        uploadedFiles = [];
        renderUploadedFilesPreview();

        try {
            await refreshSelectedSpaceData();
        } catch (refreshError) {
            console.warn("Failed to refresh lease data after payment submission", refreshError);
        }

        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted Successfully!';

        setTimeout(() => {
            submitBtn.innerHTML =
                '<i class="fas fa-paper-plane"></i> Submit Payment Confirmation';
            closePaymentModal();
        }, 2500);
    } catch (error) {
        console.error("submitPayment error:", error);
        showModalAlert(
            "error",
            error.message || "Failed to submit payment confirmation. Please try again."
        );
        submitBtn.disabled = false;
        submitBtn.innerHTML =
            '<i class="fas fa-paper-plane"></i> Submit Payment Confirmation';
    }
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

function getPaymentMethods() {
    if (
        typeof window !== "undefined" &&
        window.AppConstants &&
        Array.isArray(window.AppConstants.PAYMENT_METHODS)
    ) {
        return window.AppConstants.PAYMENT_METHODS;
    }
    return FALLBACK_PAYMENT_METHODS;
}

function renderPaymentMethodOptions(selectedValue = "") {
    const methodSelect = document.getElementById("payment-method");
    if (!methodSelect) return;

    const methods = getPaymentMethods();
    const baseOption = '<option value="">Select a payment method</option>';
    const optionsHtml = methods
        .map(
            (method) =>
                `<option value="${escapeHtml(method.value)}">${escapeHtml(
                    method.label || method.value
                )}</option>`
        )
        .join("");

    methodSelect.innerHTML = `${baseOption}${optionsHtml}`;
    if (selectedValue) {
        methodSelect.value = selectedValue;
    }
}

function resolveChargeIdentifier(charge, fallbackIndex = 0) {
    if (!charge) {
        return `ui-charge-${fallbackIndex}`;
    }
    if (!charge.__ui_id) {
        const rawId =
            charge.charge_id ??
            charge.chargeId ??
            charge.id ??
            charge.id_charge ??
            charge.reference ??
            null;
        charge.__ui_id = rawId ? String(rawId) : `ui-charge-${fallbackIndex}`;
    }
    return charge.__ui_id;
}

function preparePaymentModal(defaultAmount) {
    renderPaymentMethodOptions();
    renderPaymentInstructions("");

    paymentModalCharges = Array.isArray(selectedSpace?.pendingCharges)
        ? [...selectedSpace.pendingCharges]
        : [];
    selectedChargeIds = new Set();

    // Pre-fetch pending payments for these charges and refresh modal once loaded
    (async () => {
        const pendingMap = await fetchPendingPaymentsForCharges(paymentModalCharges);
        window.__pendingPaymentsMap = pendingMap;
        renderPaymentChargeList();
        updatePaymentSummary();
    })();

    const chargeList = document.getElementById("payment-charge-list");
    const amountInput = document.getElementById("payment-amount");
    const payFullBtn = document.getElementById("pay-full-btn");
    const toggleSelectAllBtn = document.getElementById("toggle-select-all");

    if (amountInput) {
        amountInput.value = "";
        amountInput.disabled = paymentModalCharges.length === 0;
    }
    if (payFullBtn) {
        payFullBtn.disabled = paymentModalCharges.length === 0;
    }
    if (toggleSelectAllBtn) {
        toggleSelectAllBtn.disabled = paymentModalCharges.length === 0;
    }

    const methodSelect = document.getElementById("payment-method");
    if (methodSelect) {
        methodSelect.value = "";
    }

    if (!chargeList) {
        return;
    }

    if (paymentModalCharges.length === 0) {
        chargeList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-file-circle-question"></i></div>
                <div>No pending charges available for payment.</div>
                <small>Select a different month or space to see other charges.</small>
            </div>
        `;
        updatePaymentSummary();
        return;
    }

    paymentModalCharges.sort((a, b) => {
        const dateA = new Date(a.due_date || a.charge_date || a.dueDate || a.created_at || 0);
        const dateB = new Date(b.due_date || b.charge_date || b.dueDate || b.created_at || 0);
        return dateA - dateB;
    });

    paymentModalCharges.forEach((charge, index) => {
        selectedChargeIds.add(resolveChargeIdentifier(charge, index));
    });

    renderPaymentChargeList();

    const totalSelected = calculateSelectedChargesTotal();
    if (amountInput) {
        amountInput.disabled = false;
        const initialAmount =
            typeof defaultAmount === "number" && !Number.isNaN(defaultAmount)
                ? defaultAmount
                : totalSelected;
        amountInput.value =
            initialAmount && initialAmount > 0
                ? Number(initialAmount).toFixed(2)
                : "";
    }
    if (payFullBtn) {
        payFullBtn.disabled = totalSelected <= 0;
    }
    if (toggleSelectAllBtn) {
        toggleSelectAllBtn.disabled = false;
    }

    updatePaymentSummary();
}

function renderPaymentChargeList() {
    const chargeList = document.getElementById("payment-charge-list");
    if (!chargeList) return;

    if (paymentModalCharges.length === 0) {
        chargeList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-file-circle-question"></i></div>
                <div>No pending charges available for payment.</div>
            </div>
        `;
        return;
    }

    const listHtml = paymentModalCharges
        .map((charge, index) => {
            const chargeId = resolveChargeIdentifier(charge, index);
            const amount = parseFloat(charge.amount) || 0;
            const chargeType = charge.charge_type || charge.type || charge.title || "Charge";
            const description = charge.description ? escapeHtml(charge.description) : "";
            const dueDateRaw = charge.due_date || charge.charge_date || charge.dueDate || charge.created_at || "";
            const dueDateLabel = dueDateRaw
                ? `Due ${escapeHtml(formatDate(dueDateRaw))}`
                : "Due date not specified";
            const rawDisplayId =
                charge.charge_id ||
                charge.chargeId ||
                charge.id ||
                charge.id_charge ||
                charge.reference ||
                null;
            const displayChargeId = rawDisplayId ? String(rawDisplayId) : "Not provided";

            // build pending payment indicator via server-fetched map (status=Pending)
            let paymentIndicator = "";
            const pendingAmt = getPendingAmountForCharge(charge);
            if (pendingAmt > 0) {
                paymentIndicator = `<div class="charge-payment-status payment-pending"><i class="fas fa-hourglass-half"></i> Submitted ₱${formatCurrency(pendingAmt)} (Pending)</div>`;
            }

            return `
                <label class="charge-option">
                    <input type="checkbox" class="charge-checkbox" data-charge-id="${escapeHtml(
                        chargeId
                    )}" ${selectedChargeIds.has(chargeId) ? "checked" : ""}>
                    <div class="charge-details">
                        <div class="charge-type">${escapeHtml(chargeType)}</div>
                        ${description ? `<div class="charge-description">${description}</div>` : ""}
                        <div class="charge-meta">
                            <span>${dueDateLabel}</span>
                            <span>Charge ID: ${escapeHtml(displayChargeId)}</span>
                        </div>
                        ${paymentIndicator}
                    </div>
                    <div class="charge-amount">₱${formatCurrency(amount)}</div>
                </label>
            `;
        })
        .join("");

    chargeList.innerHTML = listHtml;
}

function updatePaymentSummary() {
    const countSpan = document.getElementById("selected-charge-count");
    const totalSpan = document.getElementById("selected-charge-total");
    const payFullBtn = document.getElementById("pay-full-btn");
    const toggleSelectAllBtn = document.getElementById("toggle-select-all");
    const amountInput = document.getElementById("payment-amount");

    const selectedCount = selectedChargeIds.size;
    const totalSelected = calculateSelectedChargesTotal();

    if (countSpan) {
        countSpan.textContent = `${selectedCount} charge${selectedCount === 1 ? "" : "s"} selected`;
    }
    if (totalSpan) {
        totalSpan.textContent = `₱${formatCurrency(totalSelected)}`;
    }

    if (payFullBtn) {
        payFullBtn.disabled = selectedCount === 0 || totalSelected <= 0;
    }

    if (toggleSelectAllBtn) {
        toggleSelectAllBtn.disabled = paymentModalCharges.length === 0;
        toggleSelectAllBtn.textContent =
            selectedCount > 0 && selectedCount === paymentModalCharges.length
                ? "Clear All"
                : "Select All";
    }

    if (amountInput) {
        if (paymentModalCharges.length === 0) {
            amountInput.disabled = true;
        }
        if (selectedCount === 0) {
            amountInput.value = "";
        }
        // Cap the amount to the allowed maximum (charges minus pending)
        const allowedMax = totalSelected;
        if (allowedMax >= 0) {
            const current = parseFloat(amountInput.value || 0) || 0;
            if (current > allowedMax) {
                amountInput.value = String(allowedMax.toFixed(2));
            }
            amountInput.max = String(allowedMax.toFixed(2));
        }
    }
}

function calculateSelectedChargesTotal() {
    let total = 0;
    paymentModalCharges.forEach((charge, index) => {
        const chargeId = resolveChargeIdentifier(charge, index);
        if (selectedChargeIds.has(chargeId)) {
            const raw = parseFloat(charge.amount) || 0;
            const pendingAmt = getPendingAmountForCharge(charge);
            const net = Math.max(0, raw - (pendingAmt || 0));
            total += net;
        }
    });
    return total;
}

function setPaymentAmountToFull() {
    const amountInput = document.getElementById("payment-amount");
    if (!amountInput) return;

    const total = calculateSelectedChargesTotal();
    amountInput.value = total > 0 ? Number(total).toFixed(2) : "";
}

function renderPaymentInstructions(methodValue) {
    const container = document.getElementById("payment-method-instructions");
    if (!container) return;

    if (!methodValue) {
        container.innerHTML = `
            <div class="instruction-placeholder">
                <i class="fas fa-info-circle"></i>
                Select a payment method to view the payment details.
            </div>
        `;
        return;
    }

    let content = "";

    if (methodValue === "Cash") {
        content = `
            <div class="instruction-card">
                <h4><i class="fas fa-building"></i>Cash Payment</h4>
                <div class="instruction-note">Visit the property management office during business hours to settle your balance in cash. Bring a valid ID and mention your lease reference when paying.</div>
            </div>
        `;
    } else if (methodValue === "Bank Transfer") {
        content = `
            <div class="instruction-card">
                <h4><i class="fas fa-university"></i>Bank Transfer</h4>
                <div class="qr-card">
                    <div class="qr-placeholder">
                        <img src="${getQrPlaceholderSrc("BANK QR")}" alt="Bank transfer QR code placeholder">
                    </div>
                    <div class="instruction-note">After transferring, upload your payment proof and keep the reference number for verification.</div>
                </div>
                <div class="instruction-meta">
                    <span><strong>Bank</strong>BDO Unibank</span>
                    <span><strong>Account Name</strong>Ambulo Property Management</span>
                    <span><strong>Account No.</strong>0000-1234-5678</span>
                    <span><strong>Branch</strong>Makati Avenue</span>
                </div>
            </div>
        `;
    } else if (methodValue === "Check") {
        content = `
            <div class="instruction-card">
                <h4><i class="fas fa-money-check-pen"></i>Check Payment</h4>
                <div class="instruction-note">Issue checks payable to <strong>Ambulo Property Management</strong>. Kindly write your full name, unit, and contact number at the back of the check. Post-dated checks are accepted for future-dated payments.</div>
            </div>
        `;
    } else if (methodValue === "Other") {
        content = `
            <div class="instruction-grid two-cols">
                <div class="instruction-card">
                    <h4><i class="fas fa-mobile-screen"></i>GCash</h4>
                    <div class="qr-card">
                        <div class="qr-placeholder">
                            <img src="${getQrPlaceholderSrc("GCASH")}" alt="GCash payment QR code placeholder">
                        </div>
                        <div class="instruction-meta">
                            <span><strong>Account Name</strong>Ambulo PMS</span>
                            <span><strong>GCash Number</strong>+63 917 000 0000</span>
                            <span><strong>Reference</strong>Include lease ID</span>
                        </div>
                    </div>
                </div>
                <div class="instruction-card">
                    <h4><i class="fas fa-wallet"></i>Maya</h4>
                    <div class="qr-card">
                        <div class="qr-placeholder">
                            <img src="${getQrPlaceholderSrc("MAYA")}" alt="Maya payment QR code placeholder">
                        </div>
                        <div class="instruction-meta">
                            <span><strong>Account Name</strong>Ambulo PMS</span>
                            <span><strong>Maya Number</strong>+63 918 123 4567</span>
                            <span><strong>Reference</strong>Include lease ID</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="instruction-note">Upload a screenshot of the successful wallet transfer and keep the in-app transaction ID for our verification team.</div>
        `;
    } else {
        content = `
            <div class="instruction-placeholder">
                <i class="fas fa-info-circle"></i>
                No instructions available for this payment method yet.
            </div>
        `;
    }

    container.innerHTML = content;
}
function toggleSelectAllCharges() {
    if (paymentModalCharges.length === 0) return;

    const shouldSelectAll = selectedChargeIds.size !== paymentModalCharges.length;
    selectedChargeIds = new Set();

    if (shouldSelectAll) {
        paymentModalCharges.forEach((charge, index) => {
            selectedChargeIds.add(resolveChargeIdentifier(charge, index));
        });
    }

    renderPaymentChargeList();
    updatePaymentSummary();
}

function handleChargeSelectionChange(event) {
    const target = event.target;
    if (!target || !target.classList.contains("charge-checkbox")) return;

    const chargeId = target.dataset.chargeId;
    if (!chargeId) return;

    if (target.checked) {
        selectedChargeIds.add(chargeId);
    } else {
        selectedChargeIds.delete(chargeId);
    }

    updatePaymentSummary();
}

function getSelectedCharges() {
    const selected = [];
    paymentModalCharges.forEach((charge, index) => {
        const chargeId = resolveChargeIdentifier(charge, index);
        if (selectedChargeIds.has(chargeId)) {
            selected.push(charge);
        }
    });
    return selected;
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
window.removeUploadedImage = removeUploadedImage;
window.submitPayment = submitPayment;
window.escapeHtml = escapeHtml;
