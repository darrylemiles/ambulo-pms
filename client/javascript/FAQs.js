import fetchCompanyDetails from "../api/loadCompanyInfo.js";
import { fetchFaqs, clearFaqsCache } from "../utils/loadFaqs.js";

let faqIdCounter = 0;
let currentEditingId = null;
let latestFaqs = [];
const API_BASE_URL = "/api/v1/faqs";

async function setDynamicInfo() {
  const company = await fetchCompanyDetails();
  if (!company) return;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  document.title = company.company_name
    ? `Manage FAQs - ${company.company_name}`
    : "Manage FAQs";
}

document.addEventListener("DOMContentLoaded", () => {
  setDynamicInfo();
});

document.addEventListener("DOMContentLoaded", function () {
  fetchAndRenderFAQs();
  updateFAQCounter();

  document.documentElement.style.scrollBehavior = "smooth";

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "s") {
        e.preventDefault();
      } else if (e.key === "n") {
        e.preventDefault();
        addFAQ();
      }
    }

    if (e.key === "Escape") {
      const openModals = document.querySelectorAll(".modal-overlay.show");
      openModals.forEach((modal) => {
        hideModal(modal.id);
      });
    }
  });

  setTimeout(() => {
    showNotification(
      "Welcome to FAQ Management! Use Ctrl+N to add new FAQ, Ctrl+S to save.",
      "info"
    );
  }, 1000);
});

async function fetchAndRenderFAQs() {
  try {
    const res = await fetch(API_BASE_URL);
    const data = await res.json();
    const faqs = Array.isArray(data.message) ? data.message : [];
    latestFaqs = faqs;

    const faqList = document.getElementById("faq-list");
    faqList.innerHTML = "";

    faqs.forEach((faq) => {
      const isActive = String(faq.is_active) === "1";
      const activeBadge = isActive
        ? `<span class="faq-active-badge" style="background:#22c55e; color:#fff; font-size:12px; border-radius:6px; padding:2px 8px; margin-right:8px;">Active</span>`
        : `<span class="faq-active-badge" style="background:#64748b; color:#fff; font-size:12px; border-radius:6px; padding:2px 8px; margin-right:8px;">Inactive</span>`;

      const faqHtml = `
    <div class="faq-item" data-id="${faq.faq_id}" data-active="${faq.is_active
        }" data-sort-order="${faq.sort_order}">
      <div class="faq-question" onclick="toggleFAQ(this)">
        <h4 style="display: flex; align-items: center;">
          <span class="faq-sort-order" style="font-size: 0.95em; color: #64748b; margin-right: 10px;">
            <i class="fas fa-sort-numeric-down"></i> ${faq.sort_order}
          </span>
          ${activeBadge}
          ${escapeHtml(faq.question)}
        </h4>
        <span class="faq-icon">
          <i class="fas fa-chevron-down"></i>
        </span>
      </div>
      <div class="faq-answer">
        <p>${escapeHtml(faq.answer)}</p>
        <div class="action-buttons">
          <button class="btn btn-primary" onclick="editFAQ(${faq.faq_id})">
            <i class="fas fa-edit"></i>
            Edit
          </button>
          <button class="btn btn-danger" onclick="deleteFAQ(${faq.faq_id
        }, this)">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
      faqList.insertAdjacentHTML("beforeend", faqHtml);
    });

    faqIdCounter =
      faqs.length > 0 ? Math.max(...faqs.map((f) => f.faq_id)) + 1 : 1;
    updateFAQCounter();
  } catch (err) {
    showNotification("Failed to load FAQs from server.", "error");
    try {
      const faqs = await fetchFaqs();
      latestFaqs = faqs;

      const faqList = document.getElementById("faq-list");
      faqList.innerHTML = "";

      faqs.forEach((faq) => {
        const isActive = String(faq.is_active) === "1";
        const activeBadge = isActive
          ? `<span class=\"faq-active-badge\" style=\"background:#22c55e; color:#fff; font-size:12px; border-radius:6px; padding:2px 8px; margin-right:8px;\">Active</span>`
          : `<span class=\"faq-active-badge\" style=\"background:#64748b; color:#fff; font-size:12px; border-radius:6px; padding:2px 8px; margin-right:8px;\">Inactive</span>`;

        const faqHtml = `
      <div class=\"faq-item\" data-id=\"${faq.faq_id}\" data-active=\"${faq.is_active}\" data-sort-order=\"${faq.sort_order}\">\n      <div class=\"faq-question\" onclick=\"toggleFAQ(this)\">\n        <h4 style=\"display: flex; align-items: center;\">\n          <span class=\"faq-sort-order\" style=\"font-size: 0.95em; color: #64748b; margin-right: 10px;\">\n            <i class=\"fas fa-sort-numeric-down\"></i> ${faq.sort_order}\n          </span>\n          ${activeBadge}\n          ${escapeHtml(faq.question)}\n        </h4>\n        <span class=\"faq-icon\">\n          <i class=\"fas fa-chevron-down\"></i>\n        </span>\n      </div>\n      <div class=\"faq-answer\">\n        <p>${escapeHtml(faq.answer)}</p>\n        <div class=\"action-buttons\">\n          <button class=\"btn btn-primary\" onclick=\"editFAQ(${faq.faq_id})\">\n            <i class=\"fas fa-edit\"></i>\n            Edit\n          </button>\n          <button class=\"btn btn-danger\" onclick=\"deleteFAQ(${faq.faq_id}, this)\">\n            <i class=\"fas fa-trash\"></i>\n            Delete\n          </button>\n        </div>\n      </div>\n    </div>\n  `;
        faqList.insertAdjacentHTML("beforeend", faqHtml);
      });

      faqIdCounter =
        faqs.length > 0 ? Math.max(...faqs.map((f) => f.faq_id)) + 1 : 1;
      updateFAQCounter();
    } catch (err) {
      showNotification("Failed to load FAQs from server.", "error");
      console.error(err);
    }
  }
}

function toggleFAQ(element) {
  const faqItem = element.closest(".faq-item");
  const isOpen = faqItem.classList.contains("open");

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.classList.remove("open");
  });

  if (!isOpen) {
    faqItem.classList.add("open");
  }
}
function addFAQ() {
  currentEditingId = null;
  document.getElementById("modalTitle").textContent = "Add New FAQ";

  document.getElementById("faqQuestion").value = "";
  document.getElementById("faqAnswer").value = "";
  document.getElementById("editingFAQId").value = "";

  document
    .getElementById("faqQuestion")
    .parentElement.parentElement.classList.add("full-width");
  document
    .getElementById("faqAnswer")
    .parentElement.parentElement.classList.add("full-width");
  document.getElementById("editingFAQId").value = "";

  let combinedRow = document.getElementById("faqStatusSortRow");
  if (combinedRow) combinedRow.remove();

  combinedRow = document.createElement("div");
  combinedRow.className = "form-row";
  combinedRow.id = "faqStatusSortRow";
  combinedRow.innerHTML = `
    <div class="form-group" style="width: 48%; display: inline-block; margin-right: 4%;">
      <label class="form-label">Public Page Visibility:</label>
      <select class="form-input" id="faqIsActive">
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
    </div>
    <div class="form-group" style="width: 48%; display: inline-block;">
      <label class="form-label">Sort Order:</label>
      <input type="number" class="form-input" id="faqSortOrder" min="1" value="${faqIdCounter}">
    </div>
  `;
  document.getElementById("faqForm").appendChild(combinedRow);

  document.getElementById("faqIsActive").value = "1";
  document.getElementById("faqSortOrder").value = faqIdCounter;

  document.getElementById("saveFAQBtn").innerHTML =
    '<i class="fas fa-save"></i> Save FAQ';
  console.log("[Modal Debug] addFAQ() called");
  showModal("faqModal");
}

function editFAQ(id) {
  const faq = latestFaqs.find((f) => String(f.faq_id) === String(id));
  if (!faq) return;

  currentEditingId = id;
  document.getElementById("modalTitle").textContent = "Edit FAQ";
  document.getElementById("faqQuestion").value = faq.question || "";
  document.getElementById("faqAnswer").value = faq.answer || "";
  document.getElementById("editingFAQId").value = id;

  document
    .getElementById("faqQuestion")
    .parentElement.parentElement.classList.add("full-width");
  document
    .getElementById("faqAnswer")
    .parentElement.parentElement.classList.add("full-width");

  let combinedRow = document.getElementById("faqStatusSortRow");
  if (combinedRow) combinedRow.remove();

  combinedRow = document.createElement("div");
  combinedRow.className = "form-row";
  combinedRow.id = "faqStatusSortRow";
  combinedRow.innerHTML = `
    <div class="form-group" style="width: 48%; display: inline-block; margin-right: 4%;">
      <label class="form-label">Public Page Visibility:</label>
      <select class="form-input" id="faqIsActive">
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
    </div>
    <div class="form-group" style="width: 48%; display: inline-block;">
      <label class="form-label">Sort Order:</label>
      <input type="number" class="form-input" id="faqSortOrder" min="1" value="${faq.sort_order}">
    </div>
  `;
  document.getElementById("faqForm").appendChild(combinedRow);

  document.getElementById("faqIsActive").value = faq.is_active;
  document.getElementById("faqSortOrder").value = faq.sort_order;

  document.getElementById("saveFAQBtn").innerHTML =
    '<i class="fas fa-save"></i> Update FAQ';
  console.log(`[Modal Debug] editFAQ(${id}) called`);
  showModal("faqModal");
}

function saveFAQ() {
  const question = document.getElementById("faqQuestion").value.trim();
  const answer = document.getElementById("faqAnswer").value.trim();
  const sortOrder =
    parseInt(document.getElementById("faqSortOrder").value, 10) || faqIdCounter;
  const isActive = document.getElementById("faqIsActive").value;

  if (!question || !answer) {
    showNotification(
      "Please fill in both question and answer fields.",
      "error"
    );
    return;
  }

  if (currentEditingId) {
    updateExistingFAQ(currentEditingId, question, answer, sortOrder, isActive);
    showNotification("FAQ updated successfully!", "success");
  } else {
    createNewFAQ(question, answer, sortOrder, isActive);
    showNotification("New FAQ added successfully!", "success");
    updateFAQCounter();
  }

  closeFAQModal();
  triggerAutoSave();
}

async function updateExistingFAQ(id, question, answer, sortOrder, isActive) {
  const faqData = {
    question,
    answer,
    sort_order: sortOrder,
    is_active: isActive,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faqData),
    });
    if (!res.ok) throw new Error("Failed to update FAQ");
    clearFaqsCache();
    await fetchAndRenderFAQs();
  } catch (err) {
    showNotification("Error updating FAQ: " + err.message, "error");
  }
}

async function createNewFAQ(question, answer, sortOrder, isActive) {
  const faqData = {
    question,
    answer,
    sort_order: sortOrder,
    is_active: isActive,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/create-faq`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faqData),
    });
    if (!res.ok) throw new Error("Failed to save FAQ");
    clearFaqsCache();
    await fetchAndRenderFAQs();
  } catch (err) {
    showNotification("Error saving FAQ: " + err.message, "error");
  }
}

function deleteFAQ(id, element) {
  if (
    confirm(
      "Are you sure you want to delete this FAQ? This action cannot be undone."
    )
  ) {
    fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete FAQ");
        clearFaqsCache();
        const faqItem = element.closest(".faq-item");
        if (faqItem) {
          faqItem.style.transform = "translateX(-100%)";
          faqItem.style.opacity = "0";
          setTimeout(() => {
            faqItem.remove();
            updateFAQCounter();
            showNotification("FAQ deleted successfully!", "success");
            triggerAutoSave();
            // Optionally refresh FAQ list from backend
            fetchAndRenderFAQs();
          }, 300);
        }
      })
      .catch((err) => {
        showNotification("Error deleting FAQ: " + err.message, "error");
      });
  }
}

function updateFAQCounter() {
  const count = document.querySelectorAll(".faq-item").length;
  document.getElementById("faqCountBadge").textContent = count;
}

function filterFAQs() {
  const searchTerm = document
    .getElementById("faqSearchInput")
    .value.toLowerCase();

  const filteredFaqs = latestFaqs
    .filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm) ||
        faq.answer.toLowerCase().includes(searchTerm)
    )
    .sort((a, b) => a.sort_order - b.sort_order);

  const faqList = document.getElementById("faq-list");
  faqList.innerHTML = "";

  filteredFaqs.forEach((faq) => {
    const faqHtml = `
      <div class="faq-item" data-id="${faq.faq_id}" data-active="${faq.is_active
      }" data-sort-order="${faq.sort_order}">
        <div class="faq-question" onclick="toggleFAQ(this)">
          <h4>${escapeHtml(faq.question)}</h4>
          <span class="faq-icon">
            <i class="fas fa-chevron-down"></i>
          </span>
        </div>
        <div class="faq-answer">
          <p>${escapeHtml(faq.answer)}</p>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="editFAQ(${faq.faq_id})">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button class="btn btn-danger" onclick="deleteFAQ(${faq.faq_id
      }, this)">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
    faqList.insertAdjacentHTML("beforeend", faqHtml);
  });

  updateFAQCounter();
}

function previewFAQ() {
  console.log("[Modal Debug] previewFAQ() called");
  generatePreview();
  showModal("previewModal");
}

function generatePreview() {
  const title =
    document.getElementById("faq-title")?.value || "Frequently Asked Questions";
  const description =
    document.getElementById("faq-desc")?.value ||
    "Find answers to common questions";

  let previewHTML = `
    <div style="text-align: center; margin-bottom: 40px;">
      <h2 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 16px;">${escapeHtml(
    title
  )}</h2>
      <p style="font-size: 16px; color: #64748b; line-height: 1.6;">${escapeHtml(
    description
  )}</p>
    </div>
    <div style="display: flex; flex-direction: column; gap: 20px;">
  `;

  latestFaqs
    .filter((faq) => String(faq.is_active) === "1")
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((faq) => {
      previewHTML += `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
          <h4 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">${escapeHtml(
        faq.question
      )}</h4>
          <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0;">${escapeHtml(
        faq.answer
      )}</p>
        </div>
      `;
    });

  previewHTML += "</div>";
  document.getElementById("previewContent").innerHTML = previewHTML;
}

function exportFAQ() {
  const faqData = {
    title: document.getElementById("faq-title")?.value || "",
    description: document.getElementById("faq-desc")?.value || "",
    faqs: [],
    exportDate: new Date().toISOString(),
  };

  latestFaqs.forEach(faq => {
    faqData.faqs.push({
      id: faq.faq_id,
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active,
      sort_order: faq.sort_order
    });
  });

  const dataStr = JSON.stringify(faqData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "faq-content.json";
  link.click();

  showNotification("FAQ content exported successfully!", "success");
}

function importFAQ(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (!Array.isArray(imported.faqs)) {
        showNotification("Invalid FAQ file format.", "error");
        return;
      }
      let importedCount = 0;
      let failedCount = 0;
      const promises = imported.faqs.map(faq =>
        fetch(`${API_BASE_URL}/create-faq`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: faq.question,
            answer: faq.answer,
            sort_order: faq.sort_order,
            is_active: faq.is_active
          })
        })
          .then(res => {
            if (res.ok) importedCount++;
            else failedCount++;
          })
          .catch(() => { failedCount++; })
      );
      Promise.all(promises).then(() => {
        fetchAndRenderFAQs();
        showNotification(
          `Import complete: ${importedCount} added, ${failedCount} failed.`,
          failedCount === 0 ? "success" : "error"
        );
      });
    } catch (err) {
      showNotification("Failed to import FAQs: " + err.message, "error");
    }
  };
  reader.readAsText(file);
}

document.getElementById("faqImportInput").addEventListener("change", function (e) {
  importFAQ(e.target.files[0]);
});

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`[Modal Debug] Modal with id '${modalId}' not found.`);
    return;
  }
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  console.log(`[Modal Debug] Showing modal: #${modalId}`);
}

function closeFAQModal() {
  console.log("[Modal Debug] closeFAQModal() called");
  hideModal("faqModal");
}

function closePreviewModal() {
  console.log("[Modal Debug] closePreviewModal() called");
  hideModal("previewModal");
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`[Modal Debug] Modal with id '${modalId}' not found.`);
    return;
  }
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
  console.log(`[Modal Debug] Hiding modal: #${modalId}`);
}

function goBack() {
  showNotification("Returning to dashboard...", "info");

  setTimeout(() => {
    window.location.href = "#dashboard";
  }, 1000);
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
                <i class="fas fa-${type === "success"
      ? "check-circle"
      : type === "error"
        ? "exclamation-triangle"
        : "info-circle"
    }"></i>
                ${message}
            `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }, 4500);
}

function showButtonLoading(buttonId) {
  const button = document.querySelector(`[onclick*="${buttonId}"]`);
  if (button) {
    button.disabled = true;
    button.style.opacity = "0.7";
    const originalHTML = button.innerHTML;
    button.innerHTML = `<div class="loading-spinner"></div> Saving...`;
    button.setAttribute("data-original-html", originalHTML);
  }
}

function hideButtonLoading(buttonId) {
  const button = document.querySelector(`[onclick*="${buttonId}"]`);
  if (button && button.hasAttribute("data-original-html")) {
    button.disabled = false;
    button.style.opacity = "1";
    button.innerHTML = button.getAttribute("data-original-html");
    button.removeAttribute("data-original-html");
  }
}

function triggerAutoSave() {
  const indicator = document.createElement("div");
  indicator.className = "auto-save-indicator show";
  indicator.innerHTML = '<i class="fas fa-check"></i> Auto-saved';

  document.body.appendChild(indicator);

  setTimeout(() => {
    indicator.classList.remove("show");
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 300);
  }, 2500);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
let autoSaveTimeout;
const inputs = document.querySelectorAll("#faq-title, #faq-desc");
inputs.forEach((input) => {
  input.addEventListener("input", function () {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      triggerAutoSave();
    }, 2000);
  });
});

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    const modalId = e.target.id;
    hideModal(modalId);
  }
});

window.toggleFAQ = toggleFAQ;
window.addFAQ = addFAQ;
window.editFAQ = editFAQ;
window.deleteFAQ = deleteFAQ;
window.closeFAQModal = closeFAQModal;
window.previewFAQ = previewFAQ;
window.saveFAQ = saveFAQ;
window.updateExistingFAQ = updateExistingFAQ;
window.createNewFAQ = createNewFAQ;
window.exportFAQ = exportFAQ;
window.filterFAQs = filterFAQs;
window.goBack = goBack;
window.closePreviewModal = closePreviewModal;
