import fetchCompanyDetails from '/api/loadCompanyInfo.js';

let rentedSpaces = [];

let paymentHistory = [];
let paymentHistoryPage = 1;
const paymentHistoryLimit = 10;
let paymentHistoryTotalPages = 1;
let isPaymentHistoryLoading = false;

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
        return payload.user_id || payload.id || null;
    } catch (e) {
        console.error("Error decoding JWT:", e);
        return null;
    }
}

function normalizePaymentStatus(status) {
    const raw = String(status || "").trim();
    const lower = raw.toLowerCase();
    const pretty = raw
        ? raw
            .split(" ")
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(" ")
        : "Pending";

    if (["confirmed", "completed", "paid"].includes(lower)) {
        return { className: "paid", label: pretty || "Confirmed" };
    }
    if (["pending", "awaiting", "processing"].includes(lower)) {
        return { className: "pending", label: pretty || "Pending" };
    }
    if (["rejected", "cancelled", "failed"].includes(lower)) {
        return { className: "overdue", label: pretty || "Rejected" };
    }
    return { className: "pending", label: pretty || "Pending" };
}

function mapPaymentRecordToHistory(record = {}) {
    const createdAtRaw =
        record.created_at || record.payment_date || new Date().toISOString();
    const createdAt = new Date(createdAtRaw);
    const safeDate = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
    const isoDate = safeDate.toISOString().split("T")[0];
    const { className, label } = normalizePaymentStatus(record.status);

    const amountValue = Number(record.amount_paid ?? record.amount ?? 0);
    const propertyName =
        record.property_name ||
        record.charge_description ||
        record.charge_type ||
        "Payment";
    const description =
        record.charge_description || record.charge_type || "Payment";
    const notes = record.notes || record.payment_notes || record.note || "";

    return {
        id: record.payment_id || record.id || `${Date.now()}`,
        date: isoDate,
        space: propertyName,
        description,
        amount: Number.isFinite(amountValue) ? amountValue : 0,
        reference:
            record.payment_id || record.reference || record.reference_number || "-",
        method: record.payment_method || "",
        statusClass: className,
        statusLabel: label,
        rawStatus: record.status || label,
        notes:
            typeof notes === "string" ? notes : notes ? JSON.stringify(notes) : "",
    };
}

async function fetchPaymentHistory(page = 1) {
    const token = getJwtToken();
    const userId = getCurrentUserId();

    if (!token || !userId) {
        isPaymentHistoryLoading = false;
        paymentHistory = [];
        loadPaymentHistory();
        renderPaymentHistoryPagination();
        return;
    }

    try {
        isPaymentHistoryLoading = true;
        renderPaymentHistoryPagination();
        loadPaymentHistory();

        const qs = new URLSearchParams({
            page: String(page || 1),
            limit: String(paymentHistoryLimit),
        }).toString();
        const resp = await fetch(
            `${API_BASE_URL}/payments/users/${encodeURIComponent(userId)}?${qs}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resp.status === 401 || resp.status === 403) {
            isPaymentHistoryLoading = false;
            paymentHistory = [];
            loadPaymentHistory();
            renderPaymentHistoryPagination();
            return;
        }

        if (!resp.ok)
            throw new Error(`Failed to fetch payment history (${resp.status})`);

        const data = await resp.json().catch(() => ({}));
        const rows = Array.isArray(data.payments) ? data.payments : [];
        paymentHistory = rows.map(mapPaymentRecordToHistory);
        paymentHistoryPage = Number(data.page || page) || 1;
        paymentHistoryTotalPages = Number(data.totalPages || 1) || 1;
        isPaymentHistoryLoading = false;
        loadPaymentHistory();
        renderPaymentHistoryPagination();
    } catch (error) {
        console.error("fetchPaymentHistory error:", error);
        isPaymentHistoryLoading = false;
        paymentHistory = [];
        paymentHistoryPage = 1;
        paymentHistoryTotalPages = 1;
        loadPaymentHistory();
        renderPaymentHistoryPagination();
    }
}

function getQrPlaceholderSrc(label = "QR") {
    const sanitizedLabel = String(label)
        .replace(/[^a-z0-9\s/+-]/gi, "")
        .toUpperCase();
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

(function initTooltip() {
    let tipEl = null;
    let hideTimer = null;
    let currentTarget = null;

    function ensureTip() {
        if (!tipEl) {
            tipEl = document.createElement("div");
            tipEl.className = "tooltip";
            document.body.appendChild(tipEl);
        }
        return tipEl;
    }

    function positionTip(target) {
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const tip = ensureTip();
        const padding = 8;
        const gap = 10;

        const width = tip.offsetWidth || 0;
        const height = tip.offsetHeight || 0;

        const preferTop = rect.top >= height + gap + padding;

        let x = rect.left + (rect.width - width) / 2;
        x = Math.max(padding, Math.min(window.innerWidth - width - padding, x));

        let y;
        if (preferTop) {
            y = rect.top - height - gap;
            tip.classList.add("above");
            tip.classList.remove("below");
        } else {
            y = rect.bottom + gap;
            tip.classList.add("below");
            tip.classList.remove("above");
        }

        if (y < padding) y = padding;
        if (y + height > window.innerHeight - padding) {
            y = Math.max(padding, window.innerHeight - height - padding);
        }

        const targetCenterX = rect.left + rect.width / 2;
        let arrowLeft = targetCenterX - x;

        arrowLeft = Math.max(8, Math.min(width - 8, arrowLeft));
        tip.style.setProperty("--arrow-left", Math.round(arrowLeft) + "px");

        tip.style.left = x + "px";
        tip.style.top = y + "px";
    }

    function showTip(target) {
        clearTimeout(hideTimer);
        const content = target.getAttribute("data-tooltip");
        if (!content) return;
        currentTarget = target;
        const tip = ensureTip();
        tip.textContent = content;

        tip.style.left = "-10000px";
        tip.style.top = "-10000px";
        tip.classList.add("show");
        requestAnimationFrame(() => positionTip(target));
    }

    function hideTip() {
        if (!tipEl) return;
        tipEl.classList.remove("show");
        tipEl.classList.remove("above");
        tipEl.classList.remove("below");
        currentTarget = null;
    }

    document.addEventListener("mouseover", (e) => {
        const t = e.target.closest("[data-tooltip]");
        if (t) showTip(t);
    });
    document.addEventListener("focusin", (e) => {
        const t = e.target.closest("[data-tooltip]");
        if (t) showTip(t);
    });
    document.addEventListener("mouseout", (e) => {
        if (!currentTarget) return;

        const related = e.relatedTarget;
        if (
            related &&
            (related === currentTarget || currentTarget.contains(related))
        )
            return;
        hideTimer = setTimeout(hideTip, 80);
    });
    document.addEventListener("focusout", () => {
        hideTimer = setTimeout(hideTip, 80);
    });

    window.addEventListener(
        "scroll",
        () => {
            if (currentTarget && tipEl && tipEl.classList.contains("show"))
                positionTip(currentTarget);
        },
        true
    );
    window.addEventListener("resize", () => {
        if (currentTarget && tipEl && tipEl.classList.contains("show"))
            positionTip(currentTarget);
    });
})();

async function initializePage() {
    
    try {
        const company = await fetchCompanyDetails();
        if (company) {
            if (company.name) document.title = `${company.name} · Payment`;
            
            const fav = company.icon_logo_url || company.alt_logo_url || company.logo || null;
            if (fav) {
                let link = document.querySelector('link[rel="icon"]');
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = fav;
            }
            
            window.__companyDetails = company;
        }
    } catch (err) {
        console.warn('Could not load company details for favicon/title', err);
    }

    await fetchRentedSpaces();
    loadRentedSpaces();
    loadPaymentHistory();
    await fetchPaymentHistory(1);
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

async function refreshSelectedSpaceData() {
    if (!selectedSpace) return;
    try {
        const activeFilter = getActiveFilter();
        const charges = await fetchPendingCharges(selectedSpace.id, activeFilter);

        const normalized = (Array.isArray(charges) ? charges : [])
            .map((c) => {
                const total = Number(c.amount) || 0;
                const paid = Number(c.total_paid || 0) || 0;
                const remaining = Math.max(0, total - paid);
                return { ...c, remaining_amount: remaining };
            })
            .filter((c) => {
                const status = String(
                    c.canonical_status || c.status || ""
                ).toUpperCase();
                const isWaived = status === "WAIVED";
                const isPaid =
                    status === "PAID" ||
                    Number(c.total_paid || 0) >= Number(c.amount || 0);
                return !isWaived && !isPaid && Number(c.remaining_amount) > 0;
            });
        selectedSpace.pendingCharges = normalized;
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
                statusText.includes("active") ||
                statusText.includes("paid") ||
                statusText.includes("occupied")
            ) {
                statusClass = "paid";
            } else {
                statusClass = urgencyClass;
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

                const normalized = (Array.isArray(charges) ? charges : [])
                    .map((c) => {
                        const total = Number(c.amount) || 0;
                        const paid = Number(c.total_paid || 0) || 0;
                        const remaining = Math.max(0, total - paid);
                        return {
                            ...c,
                            remaining_amount: remaining,
                        };
                    })
                    .filter((c) => {
                        const status = String(
                            c.canonical_status || c.status || ""
                        ).toUpperCase();
                        const isWaived = status === "WAIVED";
                        const isPaid =
                            status === "PAID" ||
                            Number(c.total_paid || 0) >= Number(c.amount || 0);
                        return !isWaived && !isPaid && Number(c.remaining_amount) > 0;
                    });
                selectedSpace.pendingCharges = normalized;
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
            ? charges
                .filter((c) => {
                    const rem =
                        typeof c.remaining_amount === "number"
                            ? Number(c.remaining_amount) || 0
                            : Math.max(
                                0,
                                (Number(c.amount) || 0) - (Number(c.total_paid || 0) || 0)
                            );
                    const status = String(
                        c.canonical_status || c.status || ""
                    ).toUpperCase();
                    return rem > 0 && status !== "WAIVED" && status !== "PAID";
                })
                .reduce(
                    (s, c) =>
                        s +
                        (parseFloat(
                            c.remaining_amount != null ? c.remaining_amount : c.amount
                        ) || 0),
                    0
                )
            : 0;

    const now = new Date();
    const activeFilter = getActiveFilter();
    let periodLabel;
    if (activeFilter.month || activeFilter.year) {
        const y = activeFilter.year
            ? parseInt(activeFilter.year, 10)
            : now.getFullYear();
        const mIndex = activeFilter.month
            ? parseInt(activeFilter.month, 10) - 1
            : now.getMonth();
        const ref = new Date(y, Math.max(0, Math.min(11, mIndex)), 1);
        periodLabel = ref.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });
    } else {
        periodLabel = now.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });
    }

    let displayedTotal = totalFixed;
    let chargesForTotal = charges;
    if (charges.length > 0 && (activeFilter.month || activeFilter.year)) {
        chargesForTotal = charges.filter((c) => {
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
        });
        chargesForTotal = chargesForTotal.filter((c) => {
            const rem =
                typeof c.remaining_amount === "number"
                    ? Number(c.remaining_amount) || 0
                    : Math.max(
                        0,
                        (Number(c.amount) || 0) - (Number(c.total_paid || 0) || 0)
                    );
            const status = String(c.canonical_status || c.status || "").toUpperCase();
            return rem > 0 && status !== "WAIVED" && status !== "PAID";
        });
        displayedTotal = chargesForTotal.reduce(
            (s, c) =>
                s +
                (parseFloat(
                    c.remaining_amount != null ? c.remaining_amount : c.amount
                ) || 0),
            0
        );
    }

    const lateFeeTotal = (chargesForTotal || []).reduce(
        (s, c) => s + (parseFloat(c.late_fee_amount) || 0),
        0
    );
    const baseTotal = (chargesForTotal || []).reduce((s, c) => {
        const base =
            typeof c.original_amount === "number" && c.original_amount !== null
                ? Number(c.original_amount) || 0
                : (parseFloat(c.amount) || 0) - (parseFloat(c.late_fee_amount) || 0);
        return s + base;
    }, 0);

    if (container) {
        const lateFeeHtml =
            lateFeeTotal > 0
                ? `
            <div class="late-fee-hint-compact" data-tooltip="Base total: ₱${formatCurrency(
                    baseTotal
                )} + Late fees: ₱${formatCurrency(
                    lateFeeTotal
                )} = Final total: ₱${formatCurrency(
                    displayedTotal
                )}" style="text-align:center;margin:16px auto 8px auto;max-width:300px;">
                <i class="fas fa-info-circle"></i>
                <span>Includes late fees (hover to see breakdown)</span>
            </div>
        `
                : "";

        container.innerHTML = `
                    <div class="total-section">
                        <div class="total-label">
                            <i class="fas fa-calendar-days"></i>
                            ${periodLabel} - Total Due
                        </div>
                        <div class="total-amount" title="Total remaining including any late fees: ₱${formatCurrency(
            displayedTotal
        )}">
                            ₱${formatCurrency(displayedTotal)}
                        </div>
                        ${lateFeeHtml}
                        <button class="pay-now-btn" ${displayedTotal > 0 ? "" : "disabled"
            } onclick="openPaymentModal(${displayedTotal})">
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

        displayedCharges = (displayedCharges || []).filter((c) => {
            const status = String(c.canonical_status || c.status || "").toUpperCase();
            const isWaived = status === "WAIVED";
            const isPaid =
                status === "PAID" || Number(c.total_paid || 0) >= Number(c.amount || 0);
            const remaining =
                typeof c.remaining_amount === "number"
                    ? Number(c.remaining_amount) || 0
                    : Math.max(
                        0,
                        (Number(c.amount) || 0) - (Number(c.total_paid || 0) || 0)
                    );
            return !isWaived && !isPaid && remaining > 0;
        });

        if (selectedSpace) {
            selectedSpace.displayedCharges = Array.isArray(displayedCharges)
                ? [...displayedCharges]
                : [];
        }

        const hasFilter = !!(filterMonth || filterYear);
        let pendingListHtml = "";
        if (displayedCharges.length > 0) {
            const idsKey = JSON.stringify(
                displayedCharges
                    .map((c) => String(c.charge_id || c.chargeId || c.id || ""))
                    .filter(Boolean)
                    .sort()
            );
            if (window.__pendingPaymentsKey !== idsKey) {
                window.__pendingPaymentsKey = idsKey;
                (async () => {
                    const pendingMap = await fetchPendingPaymentsForCharges(
                        displayedCharges
                    );
                    window.__pendingPaymentsMap = pendingMap;

                    loadPaymentBreakdown();
                })();
            }
            pendingListHtml = displayedCharges
                .map((ch) => {
                    const totalAmt = parseFloat(ch.amount) || 0;
                    const lateFeeAmt = parseFloat(ch.late_fee_amount) || 0;
                    const baseAmt =
                        typeof ch.original_amount === "number" &&
                            ch.original_amount !== null
                            ? Number(ch.original_amount) || 0
                            : totalAmt - lateFeeAmt;
                    const remaining =
                        typeof ch.remaining_amount === "number"
                            ? Number(ch.remaining_amount) || 0
                            : Math.max(0, totalAmt - (Number(ch.total_paid || 0) || 0));
                    const titleTxt =
                        lateFeeAmt > 0
                            ? `Base: ₱${formatCurrency(
                                baseAmt
                            )} + Late fee: ₱${formatCurrency(
                                lateFeeAmt
                            )} = ₱${formatCurrency(totalAmt)}`
                            : `Amount: ₱${formatCurrency(totalAmt)}`;
                    const feeHint = lateFeeAmt > 0 ? `` : "";
                    return `
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
                            ch.due_date ||
                            ch.charge_date ||
                            ch.dueDate ||
                            "",
                            selectedSpace && selectedSpace.gracePeriodDays
                                ? selectedSpace.gracePeriodDays
                                : 0
                        )}
                ${renderChargePaymentIndicator(ch)}
                ${lateFeeAmt > 0
                            ? `<div class="late-fee-small" data-tooltip="Base: ₱${formatCurrency(
                                baseAmt
                            )} + Late fee: ₱${formatCurrency(
                                lateFeeAmt
                            )} = ₱${formatCurrency(
                                totalAmt
                            )}"><i class='fas fa-info-circle'></i> Late fee applied</div>`
                            : ""
                        }
                        </div>
                        <span class="breakdown-amount" title="${titleTxt}">₱${formatCurrency(
                            remaining
                        )}</span>
                    </div>
                `;
                })
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
                (s, c) =>
                    s +
                    (parseFloat(
                        c.remaining_amount != null ? c.remaining_amount : c.amount
                    ) || 0),
                0
            );
        } else if (charges.length > 0) {
            totalPendingAmount = charges.reduce(
                (s, c) =>
                    s +
                    (parseFloat(
                        c.remaining_amount != null ? c.remaining_amount : c.amount
                    ) || 0),
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

    if (!tbody) return;

    if (isPaymentHistoryLoading) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="loading loading-sm" style="margin-right:8px;"></div>
                    Fetching payment history...
                </td>
            </tr>
        `;
        return;
    }

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

    tbody.innerHTML = paymentHistory
        .map(
            (payment) => `
                <tr>
                    <td>${formatDate(payment.date)}</td>
                    <td>
                        <strong>${escapeHtml(payment.space)}</strong>
                        ${payment.method
                    ? `<span class="history-method">${escapeHtml(
                        payment.method
                    )}</span>`
                    : ""
                }
                    </td>
                    <td>${escapeHtml(payment.description)}</td>
                    <td class="history-amount">₱${formatCurrency(
                    payment.amount
                )}</td>
                    <td>
                        <code style="background: rgba(102, 126, 234, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-family: 'Courier New', monospace;">
                            ${escapeHtml(payment.reference)}
                        </code>
                        <button class="copy-btn" onclick="copyToClipboard('${escapeJsString(
                    payment.reference
                )}')" style="margin-left: 0.5rem;">
                            <i class="fas fa-copy"></i>
                        </button>
                    </td>
                    <td>
                        ${(() => {
                    const tooltip = escapeHtml(
                        payment.notes
                            ? String(payment.notes)
                                .replace(/\s+/g, " ")
                                .trim()
                            : "No notes provided"
                    );
                    const attr =
                        payment.statusClass === "overdue"
                            ? ` data-tooltip="${tooltip}"`
                            : "";
                    return `<span class="status ${payment.statusClass}"${attr}>`;
                })()}
                            ${escapeHtml(payment.statusLabel)}
                        </span>
                    </td>
                </tr>
            `
        )
        .join("");
}

function renderPaymentHistoryPagination() {
    let container = document.getElementById("payment-pagination");
    if (!container) {
        const table = document.getElementById("payment-table");
        if (!table || !table.parentElement) return;
        container = document.createElement("div");
        container.id = "payment-pagination";
        container.className = "pagination-bar";
        table.parentElement.appendChild(container);
    }

    const page = paymentHistoryPage;
    const totalPages = paymentHistoryTotalPages;

    const prevDisabled = page <= 1 ? "disabled" : "";
    const nextDisabled = page >= totalPages ? "disabled" : "";

    const displayRange = (() => {
        const start = (page - 1) * paymentHistoryLimit + 1;
        const end = start + paymentHistory.length - 1;
        return `${start}-${end}`;
    })();

    function buildPageList(current, total) {
        const pages = new Set([
            1,
            total,
            current - 2,
            current - 1,
            current,
            current + 1,
            current + 2,
        ]);
        const normalized = [...pages]
            .filter((n) => Number.isFinite(n) && n >= 1 && n <= total)
            .sort((a, b) => a - b);
        const result = [];
        let last = 0;
        for (const p of normalized) {
            if (last && p - last > 1) {
                result.push("ellipsis");
            }
            result.push(p);
            last = p;
        }
        return result;
    }

    const pageItems = buildPageList(page, Math.max(totalPages, 1))
        .map((item) => {
            if (item === "ellipsis") {
                return `<span class="ellipsis" aria-hidden="true">…</span>`;
            }
            const p = Number(item);
            const active = p === page ? "active" : "";
            const disabled = isPaymentHistoryLoading ? "disabled" : "";
            return `<button class="page-btn ${active}" ${disabled} data-action="goto" data-page="${p}" aria-label="Go to page ${p}">${p}</button>`;
        })
        .join("");

    const anyDisabled = isPaymentHistoryLoading ? "disabled" : "";
    const loadingInline = isPaymentHistoryLoading
        ? '<div class="loading loading-sm" style="margin-left:8px;"></div>'
        : "";

    container.innerHTML = `
        <div class="pagination-left">
            <button class="page-btn" ${prevDisabled} ${anyDisabled} data-action="prev" aria-label="Previous page">Prev</button>
            <div class="page-numbers">${pageItems}</div>
            <button class="page-btn" ${nextDisabled} ${anyDisabled} data-action="next" aria-label="Next page">Next</button>
            <span class="page-info">Page ${page} of ${totalPages} · Showing ${displayRange}</span>
            ${loadingInline}
        </div>
    `;

    container.querySelectorAll(".page-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            if (isPaymentHistoryLoading) return;
            const action = e.currentTarget.getAttribute("data-action");
            if (action === "prev" && paymentHistoryPage > 1) {
                await fetchPaymentHistory(paymentHistoryPage - 1);
            } else if (
                action === "next" &&
                paymentHistoryPage < paymentHistoryTotalPages
            ) {
                await fetchPaymentHistory(paymentHistoryPage + 1);
            } else if (action === "goto") {
                const p = Number(e.currentTarget.getAttribute("data-page"));
                if (Number.isFinite(p) && p >= 1 && p <= paymentHistoryTotalPages) {
                    await fetchPaymentHistory(p);
                }
            }
        });
    });
}

async function fetchPendingPaymentsForCharges(charges) {
    try {
        const ids = (charges || [])
            .map((c) => c.charge_id || c.chargeId || c.id)
            .filter((v) => v != null)
            .map(String);
        if (!ids.length) return {};

        const token = getJwtToken();
        const query = new URLSearchParams({
            charge_ids: ids.join(","),
            status: "Pending",
        }).toString();
        const resp = await fetch(
            `${API_BASE_URL}/payments/search/by-charge?${query}`,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
        );
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
        const pendingAmount = Number(
            group.reduce((s, p) => s + Number(p.amount_paid || p.amount || 0), 0)
        );
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
        const key = String(
            charge?.charge_id || charge?.chargeId || charge?.id || ""
        );
        if (!key) return 0;
        const map = window.__pendingPaymentsMap || {};
        const list = map[key] || [];
        const total = list.reduce(
            (s, p) => s + Number(p.amount_paid || p.amount || 0),
            0
        );
        return Number(total) || 0;
    } catch (e) {
        return 0;
    }
}

function getChargeApiId(charge) {
    return (
        charge?.charge_id ??
        charge?.chargeId ??
        charge?.id ??
        charge?.id_charge ??
        null
    );
}

function getOutstandingBalanceForCharge(charge) {
    if (!charge) return 0;
    const rawRemaining =
        charge.remaining_amount !== undefined && charge.remaining_amount !== null
            ? Number(charge.remaining_amount) || 0
            : (parseFloat(charge.amount) || 0) -
            (Number(charge.total_paid || 0) || 0);
    const pendingAmt = getPendingAmountForCharge(charge);
    const remaining = Number.isFinite(rawRemaining) ? rawRemaining : 0;
    return Math.max(0, remaining - (pendingAmt || 0));
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
    hint.style.color =
        uploadedFiles.length >= MAX_PAYMENT_PROOF_FILES ? "#dc2626" : "#047857";
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
                        <button type="button" class="preview-remove" onclick="removeUploadedImage(${index})" aria-label="Remove ${escapeHtml(
                    file.name
                )}">
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
            `${errorMessage} Added ${addedCount} image${addedCount > 1 ? "s" : ""
            } successfully.`
        );
    } else if (errorMessage) {
        showModalAlert("error", errorMessage);
    } else if (addedCount > 0) {
        showModalAlert(
            "success",
            `Added ${addedCount} image${addedCount > 1 ? "s" : ""
            }. You can remove or add more before submitting.`
        );
    }

    renderUploadedFilesPreview();
}

function removeUploadedImage(index) {
    if (index < 0 || index >= uploadedFiles.length) return;
    uploadedFiles.splice(index, 1);
    renderUploadedFilesPreview();
    showModalAlert(
        "success",
        "Image removed. You can upload another before submitting."
    );
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

    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
        showModalAlert(
            "error",
            "Unable to determine the current user. Please sign in again and retry."
        );
        return;
    }

    let remainingCents = Math.round(amountValue * 100);
    const allocations = [];
    selectedCharges.forEach((charge, index) => {
        if (remainingCents <= 0) return;
        const chargeIdForApi = getChargeApiId(charge);
        if (!chargeIdForApi) return;

        const outstandingCents = Math.max(
            0,
            Math.round(getOutstandingBalanceForCharge(charge) * 100)
        );
        if (outstandingCents <= 0) return;

        const portionCents = Math.min(outstandingCents, remainingCents);
        if (portionCents <= 0) return;

        allocations.push({
            charge,
            chargeId: chargeIdForApi,
            amountCents: portionCents,
            amount: portionCents / 100,
            outstandingCents,
            label:
                charge.charge_type ||
                charge.type ||
                charge.title ||
                `Charge ${index + 1}`,
            displayId: String(
                charge.charge_reference ||
                charge.reference ||
                charge.reference_code ||
                chargeIdForApi ||
                `charge-${index + 1}`
            ),
        });

        remainingCents -= portionCents;
    });

    if (remainingCents > 0 && allocations.length > 0) {
        const lastAllocation = allocations[allocations.length - 1];
        const remainingCapacity = Math.max(
            0,
            lastAllocation.outstandingCents - lastAllocation.amountCents
        );
        if (remainingCapacity > 0) {
            const extra = Math.min(remainingCents, remainingCapacity);
            lastAllocation.amountCents += extra;
            lastAllocation.amount = lastAllocation.amountCents / 100;
            remainingCents -= extra;
        }
    }

    if (!allocations.length) {
        showModalAlert(
            "error",
            "We couldn't determine which charges to pay. Please refresh the page and try again."
        );
        return;
    }

    if (remainingCents > 0) {
        showModalAlert(
            "error",
            "Unable to distribute the entered amount across the selected charges. Please adjust the amount and try again."
        );
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading"></div> Processing...';

    const token = getJwtToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const paymentDate = new Date().toISOString().split("T")[0];
    const allocationSummary = allocations
        .map((alloc) => `${alloc.displayId}: ₱${formatCurrency(alloc.amount)}`)
        .join("; ");

    const createdPaymentIds = [];
    let primaryPaymentId = null;

    try {
        for (let i = 0; i < allocations.length; i++) {
            const allocation = allocations[i];
            const formData = new FormData();
            formData.append("chargeId", allocation.chargeId);
            formData.append("paymentDate", paymentDate);
            formData.append("amountPaid", allocation.amount.toFixed(2));
            formData.append("paymentMethod", paymentMethodSelect.value);
            formData.append("user_id", currentUserId);

            const noteSegments = [
                "Submitted via tenant portal.",
                `Allocation summary: ${allocationSummary}.`,
                `This entry allocates ₱${formatCurrency(allocation.amount)} to ${allocation.label
                } (${allocation.displayId}).`,
            ];
            if (allocations.length > 1) {
                noteSegments.push(`Batch ${i + 1} of ${allocations.length}.`);
            }
            if (i > 0 && primaryPaymentId) {
                noteSegments.push(
                    `Supporting proofs uploaded with payment ${primaryPaymentId}.`
                );
            }
            formData.append("notes", noteSegments.join(" "));

            if (i === 0) {
                uploadedFiles.forEach((file) => {
                    formData.append("proofs", file);
                });
            }

            const response = await fetch(`${API_BASE_URL}/payments/create-payment`, {
                method: "POST",
                headers,
                body: formData,
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(
                    errorBody.message || "Failed to submit payment confirmation."
                );
            }

            const result = await response.json().catch(() => ({}));
            if (!primaryPaymentId && result.payment_id) {
                primaryPaymentId = result.payment_id;
            }
            createdPaymentIds.push(result.payment_id || null);
        }

        const successMessage =
            allocations.length === 1
                ? "Payment confirmation submitted! We'll review it shortly."
                : `Payment confirmations submitted for ${allocations.length} charges! We'll review them shortly.`;

        showModalAlert("success", successMessage);

        await fetchPaymentHistory(1);

        uploadedFiles = [];
        renderUploadedFilesPreview();

        try {
            await refreshSelectedSpaceData();
        } catch (refreshError) {
            console.warn(
                "Failed to refresh lease data after payment submission",
                refreshError
            );
        }

        submitBtn.innerHTML =
            '<i class="fas fa-check"></i> Submitted Successfully!';

        setTimeout(() => {
            submitBtn.innerHTML =
                '<i class="fas fa-paper-plane"></i> Submit Payment Confirmation';
            closePaymentModal();
        }, 2500);
    } catch (error) {
        console.error("submitPayment error:", error);
        const partialMessage = createdPaymentIds.length
            ? ` We recorded ${createdPaymentIds.length} payment${createdPaymentIds.length === 1 ? "" : "s"
            } before the error. We've refreshed the data, but please contact support if anything looks off.`
            : "";
        showModalAlert(
            "error",
            (error.message ||
                "Failed to submit payment confirmation. Please try again.") +
            partialMessage
        );
        if (createdPaymentIds.length) {
            try {
                await fetchPaymentHistory();
                await refreshSelectedSpaceData();
            } catch (refreshError) {
                console.warn(
                    "Failed to refresh data after partial payment submission",
                    refreshError
                );
            }
        }
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

    (async () => {
        const pendingMap = await fetchPendingPaymentsForCharges(
            paymentModalCharges
        );
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
        const dateA = new Date(
            a.due_date || a.charge_date || a.dueDate || a.created_at || 0
        );
        const dateB = new Date(
            b.due_date || b.charge_date || b.dueDate || b.created_at || 0
        );
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
            const lateFeeAmt = parseFloat(charge.late_fee_amount) || 0;
            const baseAmt =
                typeof charge.original_amount === "number" &&
                    charge.original_amount !== null
                    ? Number(charge.original_amount) || 0
                    : amount - lateFeeAmt;
            const chargeType =
                charge.charge_type || charge.type || charge.title || "Charge";
            const description = charge.description
                ? escapeHtml(charge.description)
                : "";
            const dueDateRaw =
                charge.due_date ||
                charge.charge_date ||
                charge.dueDate ||
                charge.created_at ||
                "";
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
            const displayChargeId = rawDisplayId
                ? String(rawDisplayId)
                : "Not provided";

            const pendingAmt = getPendingAmountForCharge(charge);
            let paymentIndicator = "";
            if (pendingAmt > 0) {
                paymentIndicator = `<div class="charge-payment-status payment-pending"><i class="fas fa-hourglass-half"></i> Submitted ₱${formatCurrency(
                    pendingAmt
                )} (Pending)</div>`;
            }
            const remainingAfterPending = getOutstandingBalanceForCharge(charge);
            const titleTooltip =
                lateFeeAmt > 0
                    ? `Base: ₱${formatCurrency(baseAmt)} + Late fee: ₱${formatCurrency(
                        lateFeeAmt
                    )} = ₱${formatCurrency(amount)}`
                    : `Amount: ₱${formatCurrency(amount)}`;

            return `
                <label class="charge-option" title="${escapeHtml(
                titleTooltip
            )}" aria-label="Charge ${escapeHtml(chargeType)}: ${escapeHtml(
                titleTooltip
            )}">
                    <input type="checkbox" class="charge-checkbox" data-charge-id="${escapeHtml(
                chargeId
            )}" ${selectedChargeIds.has(chargeId) ? "checked" : ""}>
                    <div class="charge-details">
                        <div class="charge-type">${escapeHtml(chargeType)}</div>
                        ${description
                    ? `<div class="charge-description">${description}</div>`
                    : ""
                }
                        <div class="charge-meta">
                            <span>${dueDateLabel}</span>
                            <span>Charge ID: ${escapeHtml(
                    displayChargeId
                )}</span>
                        </div>
                        ${paymentIndicator}
                        
                    </div>
                    <div class="charge-amount" title="${lateFeeAmt > 0
                    ? `Base: ₱${formatCurrency(
                        baseAmt
                    )} + Late fee: ₱${formatCurrency(
                        lateFeeAmt
                    )} = ₱${formatCurrency(
                        amount
                    )} | Remaining: ₱${formatCurrency(
                        remainingAfterPending
                    )}`
                    : `Remaining: ₱${formatCurrency(
                        remainingAfterPending
                    )} of ₱${formatCurrency(amount)}`
                }" aria-label="${lateFeeAmt > 0
                    ? `Includes late fee of ₱${formatCurrency(lateFeeAmt)}.`
                    : ""
                }">₱${formatCurrency(remainingAfterPending)}</div>
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
        countSpan.textContent = `${selectedCount} charge${selectedCount === 1 ? "" : "s"
            } selected`;
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
            total += getOutstandingBalanceForCharge(charge);
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
                        <img src="${getQrPlaceholderSrc(
            "BANK QR"
        )}" alt="Bank transfer QR code placeholder">
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
                            <img src="${getQrPlaceholderSrc(
            "GCASH"
        )}" alt="GCash payment QR code placeholder">
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
                            <img src="${getQrPlaceholderSrc(
            "MAYA"
        )}" alt="Maya payment QR code placeholder">
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
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon =
        type === "success"
            ? "check-circle"
            : type === "error"
                ? "exclamation-triangle"
                : "info-circle";
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas fa-${icon}"></i></div>
        <div class="toast-message">${escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    const DURATION = type === "error" ? 9000 : 7000;
    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 300);
    }, DURATION);
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

window.selectSpace = selectSpace;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.handleFileUpload = handleFileUpload;
window.removeUploadedImage = removeUploadedImage;
window.submitPayment = submitPayment;
window.escapeHtml = escapeHtml;
window.copyToClipboard = copyToClipboard;
