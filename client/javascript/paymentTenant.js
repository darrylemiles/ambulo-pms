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
            dueDate: calculateNextDueDate(lease.lease_start_date),
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
    months.forEach((m, idx) => {
        const opt = document.createElement("option");
        opt.value = String(idx + 1).padStart(2, "0");
        opt.textContent = m;
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
        if (selectedSpace) selectSpace(selectedSpace.id);
    });
    yearSelect.addEventListener("change", () => {
        if (selectedSpace) selectSpace(selectedSpace.id);
    });

    if (resetBtn)
        resetBtn.addEventListener("click", () => resetBreakdownFilter());
}

function getActiveFilter() {
    const month = document.getElementById("filter-month")?.value || "";
    const year = document.getElementById("filter-year")?.value || "";
    return { month, year };
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
            const urgencyClass =
                daysUntilDue <= 3 ? "overdue" : daysUntilDue <= 7 ? "pending" : "paid";

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

    const occasionalCosts = [
        {
            label: "Security Deposit",
            amount: selectedSpace.monthlyRent,
            due: "One-time (if applicable)",
        },
        {
            label: "Advance Rent",
            amount: selectedSpace.monthlyRent,
            due: "One-time (if applicable)",
        },
        { label: "Association Dues", amount: 1200, due: "Quarterly" },
        { label: "Insurance Premium", amount: 2400, due: "Annual" },
    ];

    const totalFixed =
        charges.length > 0
            ? charges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
            : fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);

    const activeFilter = getActiveFilter();
    const filterMonth = activeFilter.month;
    const filterYear = activeFilter.year;

    if (container) {
        container.innerHTML = `
                    <div class="breakdown-grid">
                        <div class="breakdown-section">
                            <h3 class="breakdown-title">
                                <i class="fas fa-exclamation-circle"></i>
                                Pending Charges
                            </h3>
                            ${charges.length > 0
                ? charges
                    .map(
                        (ch) => `
                                <div class="breakdown-item">
                                    <div>
                                        <div class="breakdown-label">${ch.charge_type ||
                            ch.description ||
                            "Charge"
                            }</div>
                                        <small style="color: #6b7280;">Due: ${ch.due_date || ch.charge_date || ""
                            }</small>
                                    </div>
                                    <span class="breakdown-amount">₱${formatCurrency(
                                parseFloat(ch.amount) || 0
                            )}</span>
                                </div>
                            `
                    )
                    .join("")
                : fixedCosts
                    .map(
                        (cost) => `
                                <div class="breakdown-item">
                                    <span class="breakdown-label">${cost.label
                            }</span>
                                    <span class="breakdown-amount">₱${formatCurrency(
                                cost.amount
                            )}</span>
                                </div>
                            `
                    )
                    .join("")
            }
                            <div class="breakdown-item" style="border-top: 2px solid #667eea; padding-top: 0.75rem;">
                                <span class="breakdown-label">Total Pending</span>
                                <span class="breakdown-amount">₱${formatCurrency(
                charges.length > 0 &&
                    (filterMonth || filterYear)
                    ? charges
                        .filter((c) => {
                            const d =
                                c.due_date || c.charge_date || "";
                            if (!d) return false;
                            const dt = new Date(d);
                            if (isNaN(dt.getTime())) return false;
                            const m = String(
                                dt.getMonth() + 1
                            ).padStart(2, "0");
                            const y = String(dt.getFullYear());
                            if (filterMonth && filterYear)
                                return (
                                    m === filterMonth &&
                                    y === filterYear
                                );
                            if (filterMonth)
                                return m === filterMonth;
                            if (filterYear)
                                return y === filterYear;
                            return true;
                        })
                        .reduce(
                            (s, c) =>
                                s + (parseFloat(c.amount) || 0),
                            0
                        )
                    : totalFixed
            )}</span>
                            </div>
                        </div>

                        <div class="breakdown-section">
                            <h3 class="breakdown-title">
                                <i class="fas fa-clock-rotate-left"></i>
                                Occasional Payments
                            </h3>
                            ${occasionalCosts
                .map(
                    (cost) => `
                                <div class="breakdown-item">
                                    <div>
                                        <div class="breakdown-label">${cost.label
                        }</div>
                                        <small style="color: #6b7280; font-style: italic;">${cost.due
                        }</small>
                                    </div>
                                    <span class="breakdown-amount">₱${cost.amount.toLocaleString()}</span>
                                </div>
                            `
                )
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
