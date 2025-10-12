import fetchCompanyDetails from "../api/loadCompanyInfo.js";

let submissions = [];
const API_BASE_URL = "/api/v1";

async function loadDynamicCompanyInfo() {
    try {
        const company = await fetchCompanyDetails();
        if (!company) return;

        if (company.company_name) {
            document.title = "Contact Submissions";
        }

        try {
            const icons = document.querySelectorAll('link[rel~="icon"]');
            if (icons && icons.length) {
                icons.forEach((link) => {
                    if (company.icon_logo_url) link.href = company.icon_logo_url;
                    else if (company.alt_logo_url) link.href = company.alt_logo_url;
                });
            } else {
                const link = document.createElement("link");
                link.rel = "icon";
                link.type = "image/png";
                link.href =
                    company.icon_logo_url ||
                    company.alt_logo_url ||
                    "/assets/favicon/favicon-32x32.png";
                document.head.appendChild(link);
            }
        } catch (e) {
            console.warn("Failed to set favicon", e);
        }

        try {
            const logoContainer = document.getElementById("companyLogo");
            if (logoContainer && company.logoHtml) {
                logoContainer.innerHTML = company.logoHtml;
            }
        } catch (e) { }
    } catch (err) {
        console.warn("Could not load company details:", err);
    }
}

var currentPage = 1;
var pageLimit = 10;
var totalItems = 0;

var serverStats = null;

async function fetchSubmissions(page = 1) {
    try {
        currentPage = page || 1;

        const search = document.getElementById("searchInput")
            ? document.getElementById("searchInput").value.trim()
            : "";
        const statusRaw = document.getElementById("statusFilter")
            ? document.getElementById("statusFilter").value
            : "";
        const type = document.getElementById("typeFilter")
            ? document.getElementById("typeFilter").value
            : "";
        const fromDate = document.getElementById("fromDate")
            ? document.getElementById("fromDate").value
            : "";
        const toDate = document.getElementById("toDate")
            ? document.getElementById("toDate").value
            : "";

        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("limit", String(pageLimit));
        if (search) params.set("search", search);
        const status = mapStatusForApi(statusRaw);
        if (status) params.set("status", status);
        if (type) params.set("type", type);
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);

        const url = `${API_BASE_URL}/contact-us?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch submissions");
        const data = await res.json();

        serverStats = data.stats || data.totals || data.counts || null;

        submissions = Array.isArray(data.submissions)
            ? data.submissions
            : Array.isArray(data)
                ? data
                : data.submissions || [];
        totalItems =
            typeof data.total === "number"
                ? data.total
                : data.totalCount || submissions.length;
        pageLimit = typeof data.limit === "number" ? data.limit : pageLimit;

        if (type) {
            filteredSubmissions = submissions.filter(function (s) {
                return (
                    String(s.type || "").toLowerCase() === String(type).toLowerCase()
                );
            });
        } else {
            filteredSubmissions = [...submissions];
        }
        updateStats();
        loadSubmissions();
        renderPagination();
    } catch (err) {
        showNotification("Error loading submissions: " + err.message, "error");
        submissions = [];
        filteredSubmissions = [];
        totalItems = 0;
        updateStats();
        loadSubmissions();
        renderPagination();
    }
}
var currentSubmission = null;
var currentSort = { column: null, direction: "asc" };
var filteredSubmissions = [...submissions];

var emailTemplates = {
    "product-support": {
        subject: "Re: Product Inquiry - Detailed Information",
        message:
            "Dear [Customer Name],\n\nThank you for your interest in our premium subscription plans. I'm happy to provide you with the detailed information you requested.\n\nOur premium plans include:\n- Advanced features and functionality\n- Priority customer support\n- Extended storage options\n- Enterprise-level security\n\nFor detailed pricing and bulk discount information, I've attached our pricing guide. I'd also be happy to schedule a call to discuss your specific needs and how we can best serve your organization.\n\nPlease let me know if you have any questions or would like to proceed with a consultation.\n\nBest regards,\n[Your Name]\nCustomer Success Team",
    },
    "technical-support": {
        subject: "Re: Technical Issue - Resolution Steps",
        message:
            "Dear [Customer Name],\n\nThank you for contacting our technical support team. I understand you're experiencing issues, and I'm here to help resolve this for you.\n\nBased on your description, here are the steps we recommend:\n\n1. Clear your browser cache and cookies\n2. Try logging in using an incognito/private browsing window\n3. Ensure you're using the correct login URL\n4. Check if caps lock is enabled when entering your password\n\nIf these steps don't resolve the issue, please don't hesitate to reach out. We can also schedule a screen-sharing session to work through this together.\n\nOur technical team is available Monday-Friday 9AM-6PM EST for additional support.\n\nBest regards,\n[Your Name]\nTechnical Support Team",
    },
    billing: {
        subject: "Re: Billing Question - Account Review",
        message:
            "Dear [Customer Name],\n\nThank you for reaching out regarding your billing inquiry. I've reviewed your account and can see the charges you're referring to.\n\nI've identified the duplicate charge and have initiated a refund for the incorrect billing. You should see the refund processed within 3-5 business days. I've also added a credit to your account as an apology for the inconvenience.\n\nI've reviewed your billing settings to prevent this from happening again. If you have any additional questions about your account or billing, please don't hesitate to contact us.\n\nBest regards,\n[Your Name]\nBilling Support Team",
    },
    general: {
        subject: "Re: Your Inquiry - We're Here to Help",
        message:
            "Dear [Customer Name],\n\nThank you for contacting us and for your suggestion about adding a dark mode option. We really appreciate feedback from users like you!\n\nI'm pleased to let you know that dark mode is actually on our development roadmap for the next quarter. Your feedback helps us prioritize features that matter most to our users.\n\nI'll make sure to add you to our beta testing list so you can try out the dark mode feature before it's officially released.\n\nWe value your feedback and are always looking for ways to improve our service. If you have any additional questions or suggestions, please don't hesitate to contact us.\n\nBest regards,\n[Your Name]\nCustomer Service Team",
    },
};

function showNotification(message, type = "success") {
    var notification = document.getElementById("notification");
    var notificationText = document.getElementById("notificationText");

    notificationText.textContent = message;

    if (type === "error") {
        notification.style.background =
            "linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%)";
    } else {
        notification.style.background =
            "linear-gradient(135deg, var(--success-color) 0%, #059669 100%)";
    }

    notification.classList.add("show");

    setTimeout(function () {
        notification.classList.remove("show");
    }, 4000);
}

function updateStats() {
    var pageTotal = submissions.length;
    var pagePending = submissions.filter(function (s) {
        var status = (s.status || "").toLowerCase();
        return (
            status === "pending" || status === "pending response" || status === "new"
        );
    }).length;
    var pageResponded = submissions.filter(function (s) {
        var status = (s.status || "").toLowerCase();
        return (
            status === "responded" || status === "replied" || status === "resolved"
        );
    }).length;
    var pageResponseRate =
        pageTotal > 0 ? Math.round((pageResponded / pageTotal) * 100) : 0;

    document.getElementById("totalCount").textContent = pageTotal;
    document.getElementById("pendingCount").textContent = pagePending;
    document.getElementById("respondedCount").textContent = pageResponded;
    document.getElementById("responseRate").textContent = pageResponseRate + "%";

    if (
        serverStats &&
        (typeof serverStats.total === "number" ||
            typeof serverStats.pending === "number" ||
            typeof serverStats.responded === "number")
    ) {
        var sTotal = serverStats.total || totalItems || pageTotal;
        var sPending =
            serverStats.pending ||
            serverStats.pendingCount ||
            (serverStats.statusCounts && serverStats.statusCounts.pending) ||
            pagePending;
        var sResponded =
            serverStats.responded ||
            serverStats.replied ||
            serverStats.respondedCount ||
            (serverStats.statusCounts && serverStats.statusCounts.responded) ||
            pageResponded;
        document.getElementById("totalCount").textContent = sTotal;
        document.getElementById("pendingCount").textContent = sPending;
        document.getElementById("respondedCount").textContent = sResponded;
        var sRate = sTotal > 0 ? Math.round((sResponded / sTotal) * 100) : 0;
        document.getElementById("responseRate").textContent = sRate + "%";
        return;
    }

    var total =
        typeof totalItems === "number" && totalItems >= 0 ? totalItems : pageTotal;
    if (!total || total <= pageTotal) {
        return;
    }

    (async function fetchAggregatedCounts() {
        try {
            const perPage = 1000;
            const pages = Math.max(1, Math.ceil(total / perPage));

            var aggPending = 0;
            var aggResponded = 0;

            for (let p = 1; p <= pages; p++) {
                const params = new URLSearchParams();
                params.set("page", String(p));
                params.set("limit", String(perPage));
                const url = `${API_BASE_URL}/contact-us?${params.toString()}`;
                const res = await fetch(url);
                if (!res.ok)
                    throw new Error(
                        "Failed to fetch page " + p + " for aggregated stats"
                    );
                const data = await res.json();
                const rows = Array.isArray(data.submissions)
                    ? data.submissions
                    : Array.isArray(data)
                        ? data
                        : data.submissions || [];
                rows.forEach(function (s) {
                    const st = (s.status || "").toLowerCase();
                    if (st === "pending" || st === "pending response" || st === "new")
                        aggPending++;
                    else if (st === "responded" || st === "replied" || st === "resolved")
                        aggResponded++;
                });
            }

            var finalTotal = total;
            document.getElementById("totalCount").textContent = finalTotal;
            document.getElementById("pendingCount").textContent = aggPending;
            document.getElementById("respondedCount").textContent = aggResponded;
            var finalRate =
                finalTotal > 0 ? Math.round((aggResponded / finalTotal) * 100) : 0;
            document.getElementById("responseRate").textContent = finalRate + "%";
        } catch (err) {
            console.warn("Aggregated stats load failed:", err);
        }
    })();
}

function clearFilters() {
    var si = document.getElementById("searchInput");
    var sf = document.getElementById("statusFilter");
    var tf = document.getElementById("typeFilter");
    var fd = document.getElementById("fromDate");
    var td = document.getElementById("toDate");

    if (si) si.value = "";
    if (sf) sf.value = "";
    if (tf) tf.value = "";
    if (fd) fd.value = "";
    if (td) td.value = "";

    fetchSubmissions(1);
    showNotification("Filters cleared successfully!");
}

function filterSubmissions() {
    fetchSubmissions(1);
}

function sortTable(column) {
    var direction =
        currentSort.column === column && currentSort.direction === "asc"
            ? "desc"
            : "asc";
    currentSort = { column: column, direction: direction };

    document.querySelectorAll("th").forEach(function (th) {
        th.classList.remove("sort-asc", "sort-desc");
    });
    document
        .querySelector("th[onclick=\"sortTable('" + column + "')\"]")
        .classList.add("sort-" + direction);

    filteredSubmissions.sort(function (a, b) {
        var aVal;
        var bVal;

        if (column === "name") {
            aVal = ((a.first_name || "") + " " + (a.last_name || ""))
                .trim()
                .toLowerCase();
            bVal = ((b.first_name || "") + " " + (b.last_name || ""))
                .trim()
                .toLowerCase();
        } else if (column === "date") {
            aVal = a.submitted_at || a.date || a.created_at || "";
            bVal = b.submitted_at || b.date || b.created_at || "";
            aVal = aVal ? new Date(aVal).getTime() : 0;
            bVal = bVal ? new Date(bVal).getTime() : 0;
        } else if (column === "status") {
            aVal = (a.status || "").toLowerCase();
            bVal = (b.status || "").toLowerCase();
        } else {
            aVal = a[column];
            bVal = b[column];
            if (typeof aVal === "string") aVal = aVal.toLowerCase();
            if (typeof bVal === "string") bVal = bVal.toLowerCase();
        }

        if (aVal === undefined || aVal === null) aVal = "";
        if (bVal === undefined || bVal === null) bVal = "";

        if (typeof aVal === "number" && typeof bVal === "number") {
            if (aVal < bVal) return direction === "asc" ? -1 : 1;
            if (aVal > bVal) return direction === "asc" ? 1 : -1;
            return 0;
        }

        aVal = String(aVal);
        bVal = String(bVal);
        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
    });

    loadSubmissions();
}

function loadSubmissions() {
    var tbody = document.querySelector("#submissionsTable tbody");
    var noResults = document.getElementById("noResults");
    tbody.innerHTML = "";

    if (filteredSubmissions.length === 0) {
        noResults.style.display = "block";
        return;
    } else {
        noResults.style.display = "none";
    }

    filteredSubmissions.forEach(function (submission, index) {
        var row = tbody.insertRow();

        var fullName =
            (submission.first_name || "") +
            (submission.last_name ? " " + submission.last_name : "");

        var formattedDate = submission.submitted_at
            ? new Date(submission.submitted_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
            : "";

        var rawSubject = submission.subject || "";
        var sanitized = sanitizeSubject(rawSubject);
        var subject =
            sanitized.length > 60 ? sanitized.substring(0, 60) + "..." : sanitized;

        var statusText = submission.status
            ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1)
            : "";
        var statusClass = submission.status
            ? "status-" + submission.status.toLowerCase().replace(" ", "-")
            : "";

        var startIndex = Math.max(
            0,
            (Number(currentPage || 1) - 1) * Number(pageLimit || 10)
        );
        row.innerHTML =
            "<td>" +
            (startIndex + index + 1) +
            "</td>" +
            "<td><strong>" +
            fullName +
            "</strong></td>" +
            "<td>" +
            (submission.email || "") +
            "</td>" +
            "<td>" +
            renderSubjectCell(subject, rawSubject, submission) +
            "</td>" +
            "<td>" +
            formattedDate +
            "</td>" +
            '<td><span class="status-badge ' +
            statusClass +
            '">' +
            statusText +
            "</span></td>" +
            '<td><button class="view-btn" onclick="openModal(' +
            submission.id +
            ')"><i class="fas fa-eye"></i> View</button></td>';
    });
}

function renderPagination() {
    const container = document.getElementById("pagination");
    if (!container) return;

    container.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageLimit));

    const prev = document.createElement("button");
    prev.textContent = "‹ Prev";
    prev.className = "btn";
    prev.disabled = currentPage <= 1;
    prev.onclick = () => changePage(currentPage - 1);
    container.appendChild(prev);

    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

    for (let p = start; p <= end; p++) {
        const btn = document.createElement("button");
        btn.textContent = String(p);
        btn.className = "btn";
        if (p === currentPage) {
            btn.disabled = true;
            btn.style.fontWeight = "700";
        } else {
            btn.onclick = () => changePage(p);
        }
        container.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Next ›";
    next.className = "btn";
    next.disabled = currentPage >= totalPages;
    next.onclick = () => changePage(currentPage + 1);
    container.appendChild(next);
}

function changePage(page) {
    if (page < 1) page = 1;
    const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageLimit));
    if (page > totalPages) page = totalPages;
    fetchSubmissions(page);
}

function openModal(id) {
    currentSubmission = submissions.find(function (s) {
        return s.id === id;
    });
    if (!currentSubmission) return;

    var fullName =
        (currentSubmission.first_name || "") +
        (currentSubmission.last_name ? " " + currentSubmission.last_name : "");
    document.getElementById("modalName").textContent = fullName;
    document.getElementById("modalEmail").textContent =
        currentSubmission.email || "";

    var rawSub = currentSubmission.subject || "";
    var sanitized = sanitizeSubject(rawSub);
    var propId = null;
    var propName = null;

    if (currentSubmission.property || currentSubmission.property_info) {
        var p = currentSubmission.property || currentSubmission.property_info;
        propId = p.property_id || p.propertyId || p.id || null;
        propName = p.property_name || p.name || null;
    }

    if (!propId) {
        var m =
            rawSub.match(/\[property:\s*([A-Za-z0-9-]+)\s*\|\s*([^\]]+)\]/i) ||
            rawSub.match(/property[:#]?\s*([A-Za-z0-9-]+)\s*[-|:]\s*([^\(]+)/i) ||
            rawSub.match(/property_name[:=]\s*([^|;\n\r]+)/i);
        if (m) {
            propId = m[1] || propId;
            propName = (m[2] || "").trim();
        }
    }

    var modalSubjectEl = document.getElementById("modalSubject");

    if (!propId && rawSub) {
        var mUuid = rawSub.match(
            /[-\s:|#\u2013\u2014]*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s*$/i
        );
        if (mUuid && mUuid[1]) {
            propId = mUuid[1];
        } else {
            var mNum = rawSub.match(/[-\s:|#\u2013\u2014]*(\d{4,})\s*$/);
            if (mNum && mNum[1]) propId = mNum[1];
        }
    }

    var baseName = propName || rawSub || "";
    if (propId && baseName) {
        try {
            var rx = new RegExp(
                "[\\s\\-:|#\\u2013\\u2014]*" + escapeRegExp(String(propId)) + "\\s*$",
                "i"
            );
            baseName = baseName.replace(rx, "");
        } catch (e) {
            /* noop */
        }

        baseName = baseName.replace(/[\s\-\u2013\u2014:|\/]+$/g, "");
    }

    if (propId) {
        var cleanId = String(propId)
            .trim()
            .replace(/^[-\s:|#\u2013\u2014]+|[-\s:|#\u2013\u2014]+$/g, "");
        var linkText =
            ((propName ? propName : baseName) || sanitized) + " - " + cleanId;
        modalSubjectEl.innerHTML =
            '<a href="#" title="View property" class="subject-link" onclick="openPropertyModal(\'' +
            cleanId.replace(/'/g, "\\'") +
            "', " +
            (currentSubmission.id || "null") +
            '); return false;">' +
            escapeHtml(linkText) +
            "</a>";
    } else {
        var clean = (rawSub || "").replace(/[\s\-\u2013\u2014:|\/]+$/g, "");
        modalSubjectEl.textContent = sanitizeSubject(clean);
    }

    try {
        var btype =
            currentSubmission.business_type ||
            currentSubmission.businessType ||
            currentSubmission.company_type ||
            currentSubmission.type ||
            "";
        var bEl = document.getElementById("modalBusinessType");
        if (bEl) bEl.textContent = btype || "";
    } catch (e) {
        /* noop */
    }

    try {
        var prefSize =
            currentSubmission.preferred_space_size ||
            currentSubmission.preferredSpaceSize ||
            currentSubmission.space_size ||
            "";
        var budgetRaw =
            currentSubmission.monthly_budget_range ||
            currentSubmission.monthly_budget ||
            currentSubmission.budget_range ||
            currentSubmission.budget ||
            "";
        var sizeEl = document.getElementById("modalPreferredSize");
        var budgetEl = document.getElementById("modalMonthlyBudget");

        if (prefSize) {
            var rawSize = String(prefSize).trim();
            var displaySize = "";
            var lower = rawSize.toLowerCase();
            var parsedPrimary = null;
            var parsedSecondary = null;

            var category = "";
            if (/\bsmall\b/i.test(lower)) category = "Small";
            else if (/\bmedium\b/i.test(lower)) category = "Medium";
            else if (/\blarge\b/i.test(lower)) category = "Large";
            else if (/flex|flexible/i.test(lower)) category = "Flexible";

            var mRange = rawSize.match(/([0-9,\.]+)\s*[-–—]\s*([0-9,\.]+)/);
            if (mRange) {
                var n1 = Number(mRange[1].replace(/[^0-9.]/g, ""));
                var n2 = Number(mRange[2].replace(/[^0-9.]/g, ""));
                if (!isNaN(n1) && !isNaN(n2)) {
                    var formattedRange =
                        n1.toLocaleString() + "–" + n2.toLocaleString() + " sqm";

                    var mid = (n1 + n2) / 2;
                    if (!category) {
                        if (mid < 50) category = "Small";
                        else if (mid <= 100) category = "Medium";
                        else category = "Large";
                    }
                    parsedPrimary = n1;
                    parsedSecondary = n2;
                    displaySize = category
                        ? category + " (" + formattedRange + ")"
                        : formattedRange;
                }
            } else {
                var mNum = rawSize.match(/([0-9,\.]+)/);
                if (mNum && /^\s*[0-9,\.]+\s*(sqm|m2)?\s*$/i.test(rawSize)) {
                    var n = Number(mNum[1].replace(/[^0-9.]/g, ""));
                    if (!isNaN(n)) {
                        var fmt = n.toLocaleString() + " sqm";
                        if (!category) {
                            if (n < 50) category = "Small";
                            else if (n <= 100) category = "Medium";
                            else category = "Large";
                        }
                        parsedPrimary = n;
                        displaySize = category ? category + " (" + fmt + ")" : fmt;
                    }
                }
            }

            if (!displaySize && category) {
                var canonical = "";
                if (category === "Small") canonical = "<50 sqm";
                else if (category === "Medium") canonical = "50–100 sqm";
                else if (category === "Large") canonical = ">100 sqm";
                else if (category === "Flexible") canonical = "";

                if (canonical)
                    displaySize = category + (canonical ? " (" + canonical + ")" : "");
                else displaySize = category;
            }

            if (!displaySize) {
                displaySize = rawSize;
            }

            if (sizeEl) {
                var showRaw = false;
                try {
                    if (parsedPrimary !== null) {
                        var rawNumMatch = rawSize.match(/([0-9,\.]+)/);
                        if (rawNumMatch) {
                            var rawNum = Number(rawNumMatch[1].replace(/[^0-9.]/g, ""));
                            if (!isNaN(rawNum)) {
                                if (parsedSecondary !== null) {
                                    if (
                                        rawNum < parsedPrimary - 0.01 ||
                                        rawNum > parsedSecondary + 0.01
                                    )
                                        showRaw = true;
                                } else {
                                    if (Math.abs(rawNum - parsedPrimary) > 0.01) showRaw = true;
                                }
                            } else {
                                showRaw = true;
                            }
                        } else {
                            showRaw = true;
                        }
                    } else {
                        if (category) showRaw = false;
                        else if (displaySize && displaySize !== rawSize) showRaw = true;
                    }
                } catch (e) {
                    showRaw = true;
                }

                if (displaySize) {
                    if (showRaw) {
                        sizeEl.innerHTML =
                            escapeHtml(displaySize) +
                            ' <small style="color:var(--text-muted); font-size:0.9rem;">' +
                            escapeHtml(rawSize) +
                            "</small>";
                    } else {
                        sizeEl.textContent = displaySize;
                    }
                } else {
                    sizeEl.textContent = rawSize || "";
                }
            }
        } else if (sizeEl) {
            sizeEl.textContent = "";
        }

        if (budgetRaw) {
            var budgetText = "";
            var raw = String(budgetRaw).trim();

            var mUnder = raw.match(/under\s*\D*([0-9,\.]+)/i);
            var mOver = raw.match(/over\s*\D*([0-9,\.]+)/i);

            var mRange = raw.match(/([0-9,\.]+)\s*[-–—]\s*([0-9,\.]+)/);

            if (mRange) {
                var n1 = Number(mRange[1].replace(/[^0-9.]/g, ""));
                var n2 = Number(mRange[2].replace(/[^0-9.]/g, ""));
                if (!isNaN(n1) && !isNaN(n2))
                    budgetText = "₱" + n1.toLocaleString() + " – ₱" + n2.toLocaleString();
            } else if (mUnder) {
                var n = Number(mUnder[1].replace(/[^0-9.]/g, ""));
                if (!isNaN(n)) budgetText = "Under ₱" + n.toLocaleString();
                else budgetText = raw;
            } else if (mOver) {
                var n = Number(mOver[1].replace(/[^0-9.]/g, ""));
                if (!isNaN(n)) budgetText = "Over ₱" + n.toLocaleString();
                else budgetText = raw;
            } else if (!isNaN(Number(raw.replace(/[^0-9.-]+/g, "")))) {
                var num = Number(raw.replace(/[^0-9.-]+/g, ""));
                budgetText = "₱" + num.toLocaleString();
            } else {
                budgetText = raw;
            }

            if (budgetEl) budgetEl.textContent = budgetText;
        } else if (budgetEl) {
            budgetEl.textContent = "";
        }
    } catch (e) {
        /* noop */
    }

    if (document.getElementById("modalType"))
        document.getElementById("modalType").textContent = "";
    document.getElementById("modalDate").textContent =
        currentSubmission.submitted_at
            ? new Date(currentSubmission.submitted_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : "";
    document.getElementById("modalId").textContent = "#" + currentSubmission.id;
    document.getElementById("modalMessage").textContent =
        currentSubmission.message || "";

    var badge = document.getElementById("modalStatusBadge");
    if (badge) {
        var st = currentSubmission.status || "Pending Response";
        badge.textContent = st;
        badge.className =
            "status-badge " + ("status-" + st.toLowerCase().replace(/ /g, "-"));
    }

    var replyBase = sanitizeSubject(currentSubmission.subject || "");
    if (propName) {
        replyBase = sanitizeSubject(propName);
    }

    replyBase = replyBase.replace(/[\s\-\u2013\u2014:\|\/]+$/g, "");
    document.getElementById("replySubject").value = "Re: " + replyBase;
    document.getElementById("templateSelect").value = "";
    document.getElementById("replyMessage").value = "";
    document.getElementById("templateInfo").style.display = "none";

    document.getElementById("submissionModal").classList.add("show");
}

function closeModal() {
    document.getElementById("submissionModal").classList.remove("show");
    currentSubmission = null;
}

function updateStatus() {
    if (!currentSubmission) return;

    var oldStatus = currentSubmission.status || "Pending Response";
    var newStatus = oldStatus.toLowerCase().includes("respond")
        ? "Pending Response"
        : "Responded";
    currentSubmission.status = newStatus;

    var submissionIndex = submissions.findIndex(function (s) {
        return s.id === currentSubmission.id;
    });
    if (submissionIndex !== -1) {
        submissions[submissionIndex].status = newStatus;
        filterSubmissions();
        updateStats();
        showNotification('Status updated to "' + newStatus + '"', "success");
    }

    var badge = document.getElementById("modalStatusBadge");
    if (badge) {
        badge.textContent = newStatus;
        badge.className =
            "status-badge " +
            ("status-" + newStatus.toLowerCase().replace(/ /g, "-"));
    }
}

function loadTemplate() {
    var templateSelect = document.getElementById("templateSelect");
    var selectedTemplate = templateSelect.value;
    var replyMessage = document.getElementById("replyMessage");
    var replySubject = document.getElementById("replySubject");
    var templateInfo = document.getElementById("templateInfo");

    if (selectedTemplate && emailTemplates[selectedTemplate]) {
        var template = emailTemplates[selectedTemplate];
        var fullName =
            (currentSubmission.first_name || "") +
            (currentSubmission.last_name ? " " + currentSubmission.last_name : "");
        replySubject.value = template.subject;
        replyMessage.value = template.message.replace("[Customer Name]", fullName);
        templateInfo.style.display = "block";
    } else if (selectedTemplate === "custom") {
        var customBase = sanitizeSubject(currentSubmission.subject || "");
        customBase = customBase.replace(/[\s\-\u2013\u2014:\|\/]+$/g, "");
        replySubject.value = "Re: " + customBase;
        replyMessage.value = "";
        templateInfo.style.display = "none";
    } else {
        templateInfo.style.display = "none";
    }
}

function sendResponse() {
    var subject = document.getElementById("replySubject").value.trim();
    var message = document.getElementById("replyMessage").value.trim();
    var sendBtn = document.querySelector(".send-btn");

    if (!subject || !message) {
        showNotification(
            "Please fill in both subject and message before sending.",
            "error"
        );
        return;
    }

    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Sending...';

    setTimeout(function () {
        showNotification(
            "Email sent successfully to " + currentSubmission.email + "!"
        );

        if (currentSubmission.status === "Pending Response") {
            currentSubmission.status = "Responded";
            var badge = document.getElementById("modalStatusBadge");
            if (badge) {
                badge.textContent = "Responded";
                badge.className = "status-badge status-responded";
            }

            var submissionIndex = submissions.findIndex(function (s) {
                return s.id === currentSubmission.id;
            });
            if (submissionIndex !== -1) {
                submissions[submissionIndex].status = "Responded";
                filterSubmissions();
                updateStats();
            }
        }

        var postReplyBase = sanitizeSubject(currentSubmission.subject || "");
        if (currentSubmission.property || currentSubmission.property_info) {
            var p = currentSubmission.property || currentSubmission.property_info;
            if (p.property_name || p.name)
                postReplyBase = sanitizeSubject(p.property_name || p.name);
        } else if (typeof propName !== "undefined" && propName) {
            postReplyBase = sanitizeSubject(propName);
        }
        postReplyBase = postReplyBase.replace(/[\s\-\u2013\u2014:\|\/]+$/g, "");
        document.getElementById("replySubject").value = "Re: " + postReplyBase;
        document.getElementById("replyMessage").value = "";
        document.getElementById("templateSelect").value = "";
        document.getElementById("templateInfo").style.display = "none";

        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>Send Response';
    }, 2000);
}

document
    .getElementById("submissionModal")
    .addEventListener("click", function (e) {
        if (e.target === this) {
            closeModal();
        }
    });

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeModal();
    }
});

var draftTimer;
document.getElementById("replyMessage").addEventListener("input", function () {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(function () {
        console.log("Draft saved automatically");
    }, 2000);
});

function sanitizeSubject(text) {
    if (!text) return "";

    return text
        .replace(
            /\[?\s*(?:property[_\s-]?id|propertyid|prop[_\s-]?id|property)\s*[:=#-]?\s*([A-Za-z0-9-]*\d+[A-Za-z0-9-]*)\s*\]?/gi,
            ""
        )

        .replace(/\(?#\s*\d+\)?/g, "")
        .replace(/\(property\s*#\s*\d+\)/gi, "")

        .replace(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
            ""
        )
        .trim();
}

function renderSubjectCell(displayText, rawText, submission) {
    try {
        var propId = null;
        var propName = null;
        if (submission && (submission.property || submission.property_info)) {
            var p = submission.property || submission.property_info;
            propId = p.property_id || p.propertyId || p.id || null;
            propName = p.property_name || p.name || null;
        }

        if (!propId && rawText) {
            var m =
                rawText.match(/\[property:\s*([A-Za-z0-9-]+)\s*\|\s*([^\]]+)\]/i) ||
                rawText.match(/property[:#]?\s*([A-Za-z0-9-]+)\s*[-|:]\s*([^\(]+)/i) ||
                rawText.match(/property[_\s-]?id[:=#]?\s*([A-Za-z0-9-]+)/i);
            if (m) {
                propId = propId || (m[1] && m[1].trim());
                propName = propName || (m[2] && m[2].trim());
            }
        }

        if (propId) {
            var label = escapeHtml(displayText || propName || propId);
            var idLink =
                ' <a href="#" title="View property" class="subject-link small" onclick="openPropertyModal(\'' +
                String(propId).replace(/'/g, "\\'") +
                "'," +
                (submission.id || "null") +
                '); return false;">' +
                escapeHtml(propId) +
                "</a>";
            return label + idLink;
        }
    } catch (e) {
        console.warn("renderSubjectCell error", e);
    }
    return escapeHtml(displayText);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function openPropertyModal(propertyId, submissionId) {
    try {
        var submission = submissions.find((s) => s.id === submissionId) || null;
        var prop = null;
        if (submission && (submission.property || submission.property_info)) {
            prop = submission.property || submission.property_info;
        }

        if (!prop) {
            prop = await fetchPropertyById(propertyId);
        }

        showPropertyInModal(
            prop || {
                property_name: "Unknown",
                street: "",
                city: "",
                province: "",
                base_rent: "—",
                floor_area_sqm: "—",
            }
        );
        document.getElementById("propertyDetailModal").classList.add("show");
    } catch (err) {
        console.warn("Failed to open property modal", err);
        showNotification("Could not load property details", "error");
    }
}

function closePropertyModal() {
    document.getElementById("propertyDetailModal").classList.remove("show");
}

async function fetchPropertyById(id) {
    if (!id) return null;
    const cleanId = String(id).trim();

    function unwrapProperty(payload) {
        if (!payload) return null;

        if (payload.property) return payload.property;
        if (payload.data) {
            const d = payload.data;
            if (d.property) return d.property;
            if (Array.isArray(d) && d.length) return d[0];
            if (typeof d === "object") return d;
        }
        if (payload.properties) {
            const arr = payload.properties;
            if (Array.isArray(arr) && arr.length) {
                const found = arr.find((p) => (p.property_id || p.id) === cleanId);
                return found || arr[0];
            }
        }
        if (Array.isArray(payload) && payload.length) return payload[0];

        if (payload.property_id || payload.property_name || payload.name)
            return payload;
        return null;
    }

    const endpoints = [
        "/api/v1/properties/" + encodeURIComponent(cleanId),
        "/api/v1/properties?id=" + encodeURIComponent(cleanId),
    ];
    for (const url of endpoints) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                continue;
            }
            const data = await res.json();
            const prop = unwrapProperty(data);
            if (prop) return prop;
        } catch (e) { }
    }
    return null;
}

function showPropertyInModal(p) {
    if (!p) p = {};
    const name = p.property_name || p.name || "Unknown Property";
    document.getElementById("propertyDetailTitle").textContent =
        name || "Property Details";
    document.getElementById("propertyDetailName").textContent = name;

    const addrObj =
        p.address && typeof p.address === "object" && !Array.isArray(p.address)
            ? p.address
            : null;
    const addressParts = [
        p.building_name || (addrObj && addrObj.building_name),
        p.street || (addrObj && addrObj.street),
        p.barangay || (addrObj && addrObj.barangay),
        p.city || (addrObj && addrObj.city) || p.city_town,
        p.province || (addrObj && addrObj.province),
        p.postal_code || (addrObj && addrObj.postal_code),
        p.country || (addrObj && addrObj.country),
    ].filter(Boolean);
    const address = addressParts.join(", ");
    document.getElementById("propertyDetailAddress").textContent =
        address || p.location || "";

    const rent = p.base_rent ?? p.rent ?? p.monthly_rent;
    document.getElementById("propertyDetailRent").textContent =
        rent !== undefined && rent !== null && rent !== "" ? String(rent) : "—";

    const area = p.floor_area_sqm ?? p.area_sqm ?? p.floor_area;
    document.getElementById("propertyDetailArea").textContent =
        area !== undefined && area !== null && area !== "" ? area + " sqm" : "—";

    const status = (p.property_status || p.status || "").toString().trim();

    function mapPropertyStatusClass(st) {
        if (!st) return "";
        const s = st.toLowerCase();
        if (s === "available") return "property-available";
        if (s === "occupied" || s === "leased" || s === "rented")
            return "property-occupied";
        if (s.includes("maintenance") || s === "under maintenance")
            return "property-maintenance";
        if (s === "reserved" || s === "pending") return "property-reserved";

        return "property-archived";
    }
    const propClass = mapPropertyStatusClass(status);
    if (status) {
        document.getElementById("propertyDetailStatus").innerHTML =
            '<span class="property-status ' +
            propClass +
            '">' +
            escapeHtml(status) +
            "</span>";
    } else {
        document.getElementById("propertyDetailStatus").innerHTML = "";
    }
    const img = p.display_image || p.image_url || (p.images && p.images[0]) || "";
    if (img) document.getElementById("propertyDetailImage").src = img;
}

function init() {
    loadDynamicCompanyInfo();
    fetchSubmissions();

    var fd = document.getElementById("fromDate");
    var td = document.getElementById("toDate");
    if (fd)
        fd.addEventListener("change", function () {
            fetchSubmissions(1);
        });
    if (td)
        td.addEventListener("change", function () {
            fetchSubmissions(1);
        });

    var si = document.getElementById("searchInput");
    if (si) {
        var t;
        si.addEventListener("input", function () {
            clearTimeout(t);
            t = setTimeout(function () {
                fetchSubmissions(1);
            }, 300);
        });
    }
}

init();

window.openModal = openModal;
window.closeModal = closeModal;
window.filterSubmissions = filterSubmissions;
window.clearFilters = clearFilters;
window.sortTable = sortTable;
window.updateStatus = updateStatus;

window.openPropertyModal = openPropertyModal;
window.closePropertyModal = closePropertyModal;

function mapStatusForApi(val) {
    if (!val) return "";
    var s = String(val).trim().toLowerCase();
    if (s === "pending response" || s === "pending-response" || s === "pending")
        return "pending";
    if (s === "responded" || s === "replied" || s === "resolved")
        return "replied";
    if (s === "archived") return "archived";
    return s;
}
