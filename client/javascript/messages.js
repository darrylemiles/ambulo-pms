import { getJwtToken } from "/utils/getCookie.js";

const announcements = [];

let chatContacts = [];
const chatMessagesCache = {};

let currentAnnouncementFilter = "all";
let currentChatContact = null;
let currentPage = 1;
let announcementsPerPage = 6;

let socket = null;
let jwtToken = null;
let currentUser = null;
let typingTimeouts = {};
const API_BASE = "/api/v1";
let pendingAttachments = [];

document.addEventListener("DOMContentLoaded", async function () {
    jwtToken = getJwtToken();
    try {
        const userStr = localStorage.getItem("user");
        if (userStr) currentUser = JSON.parse(userStr);
    } catch { }

    renderAnnouncements();
    setupEventListeners();

    tryInitSocket();

    await loadConversationsOnly();
    renderChatContacts();
    updateAnnouncementsBadge();
    updateChatBadge();

    const role =
        currentUser && currentUser.role
            ? String(currentUser.role).toUpperCase()
            : "TENANT";
    const newMsgBtn = document.querySelector(
        'button[onclick="openNewMessageModal()"]'
    );
    if (newMsgBtn) {
        newMsgBtn.style.display =
            role === "ADMIN" || role === "MANAGER" ? "inline-flex" : "none";
    }
});

function switchTab(tabName, tabElement) {
    document
        .querySelectorAll(".nav-tab")
        .forEach((tab) => tab.classList.remove("active"));
    document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

    tabElement.classList.add("active");
    document.getElementById(tabName + "Tab").classList.add("active");

    if (tabName === "chat" && !currentChatContact) {
        if (chatContacts.length > 0) {
            selectChatContact(chatContacts[0].id);
        }
    }
}

function tryInitSocket() {
    try {
        if (!jwtToken) return;
        if (typeof io === "undefined") {
            console.warn("Socket.io client not loaded; skipping realtime");
            return;
        }
        socket = io({ auth: { token: jwtToken } });

        socket.on("connect", () => {
            console.info("Socket connected", socket.id);
        });

        socket.on("disconnect", (reason) => {
            console.info("Socket disconnected", reason);
        });

        socket.on("new_message", (msg) => {
            if (currentChatContact) {
                const convWith = [msg.sender_user_id, msg.recipient_user_id].find(
                    (id) => id != currentUser.user_id
                );
                if (convWith == currentChatContact) {
                    if (!chatMessagesCache[currentChatContact])
                        chatMessagesCache[currentChatContact] = [];
                    chatMessagesCache[currentChatContact].push({
                        id: msg.message_id,
                        text: msg.message,
                        sent: msg.sender_user_id == currentUser.user_id,
                        time: formatTime(msg.created_at),
                    });
                    const contact = chatContacts.find((c) => c.id == currentChatContact);
                    renderChatMain(contact);
                    scrollChatToBottom();
                    return;
                }
            }

            const contact = chatContacts.find((c) => c.id == msg.sender_user_id);
            if (contact) {
                contact.unreadCount = (contact.unreadCount || 0) + 1;
                updateChatBadge();
                renderChatContacts();
            }
        });

        socket.on("message_sent", (msg) => {
            const otherUserId =
                msg.sender_user_id == currentUser.user_id
                    ? msg.recipient_user_id
                    : msg.sender_user_id;
            if (currentChatContact && currentChatContact == otherUserId) {
                if (!chatMessagesCache[currentChatContact])
                    chatMessagesCache[currentChatContact] = [];
                chatMessagesCache[currentChatContact].push({
                    id: msg.message_id,
                    text: msg.message,
                    sent: msg.sender_user_id == currentUser.user_id,
                    time: formatTime(msg.created_at),
                });
                const contact = chatContacts.find((c) => c.id == currentChatContact);
                renderChatMain(contact);
                scrollChatToBottom();
            }
        });

        socket.on("conversation_updated", (payload) => {
            const otherId = payload.otherUserId;
            const c = chatContacts.find((x) => x.id == otherId);
            if (c) {
                c.lastMessage = payload.lastMessage;
                c.lastTime = payload.lastMessageTime
                    ? formatTime(payload.lastMessageTime)
                    : c.lastTime;
                renderChatContacts();
            }
        });

        socket.on("user_typing", (data) => {
            const { userId, isTyping } = data;
            if (
                currentChatContact &&
                parseInt(userId) === parseInt(currentChatContact)
            ) {
                showTypingIndicator(isTyping);
            }
        });

        socket.on("user_online", (data) => {
            const found = chatContacts.find((c) => c.id == data.userId);
            if (found) {
                found.online = true;
                renderChatContacts();
            }
        });

        socket.on("user_offline", (data) => {
            const found = chatContacts.find((c) => c.id == data.userId);
            if (found) {
                found.online = false;
                renderChatContacts();
            }
        });

        socket.on("message_deleted", (info) => {
            const { message_id, conversation_id } = info;
            if (currentChatContact && chatMessagesCache[currentChatContact]) {
                chatMessagesCache[currentChatContact] = chatMessagesCache[
                    currentChatContact
                ].filter((m) => m.id != message_id);
                const contact = chatContacts.find((c) => c.id == currentChatContact);
                renderChatMain(contact);
            }
        });

        socket.on("message_updated", (updated) => {
            if (currentChatContact && chatMessagesCache[currentChatContact]) {
                const idx = chatMessagesCache[currentChatContact].findIndex(
                    (m) => m.id == updated.message_id
                );
                if (idx >= 0) {
                    chatMessagesCache[currentChatContact][idx].text = updated.message;
                    const contact = chatContacts.find((c) => c.id == currentChatContact);
                    renderChatMain(contact);
                }
            }
        });
    } catch (err) {
        console.warn("Socket init failed", err);
    }
}

function formatTime(raw) {
    try {
        const d = new Date(raw);
        if (isNaN(d)) return raw;
        return d.toLocaleString();
    } catch (e) {
        return raw;
    }
}

function renderAnnouncements() {
    let filtered = announcements;

    if (currentAnnouncementFilter !== "all") {
        filtered = announcements.filter((a) => {
            if (currentAnnouncementFilter === "important")
                return a.priority === "high";
            return a.category === currentAnnouncementFilter;
        });
    }

    filtered.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    const startIndex = (currentPage - 1) * announcementsPerPage;
    const endIndex = startIndex + announcementsPerPage;
    const paginatedAnnouncements = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / announcementsPerPage);

    let html = "";
    paginatedAnnouncements.forEach((announcement) => {
        const pinnedClass = announcement.pinned ? "pinned" : "";
        const pinnedIcon = announcement.pinned
            ? '<i class="fas fa-thumbtack announcement-pin"></i>'
            : "";

        html += `
            <div class="announcement-card ${pinnedClass}" onclick="viewAnnouncement(${announcement.id
            })">
                <div class="announcement-header">
                    <span class="announcement-category ${announcement.category
            }">
                        <i class="fas fa-${getCategoryIcon(
                announcement.category
            )}"></i>
                        ${announcement.category}
                    </span>
                    ${pinnedIcon}
                </div>
                <h3 class="announcement-title">${announcement.title}</h3>
                <p class="announcement-content">${announcement.content}</p>
                <div class="announcement-footer">
                    <div class="announcement-meta">
                        <span><i class="fas fa-calendar"></i> ${announcement.date
            }</span>
                        <span><i class="fas fa-clock"></i> ${announcement.time
            }</span>
                    </div>
                    <div class="announcement-priority ${announcement.priority}">
                        <i class="fas fa-circle"></i>
                        ${announcement.priority}
                    </div>
                </div>
            </div>
        `;
    });

    if (!html) {
        html = `
            <div style="padding: 1rem; color: var(--text-muted);">No announcements yet.</div>
        `;
    }
    document.getElementById("announcementsList").innerHTML = html;

    if (totalPages > 1) {
        const paginationHTML = createPagination(
            filtered.length,
            currentPage,
            announcementsPerPage
        );
        document
            .querySelector(".announcements-list-container")
            .insertAdjacentHTML("beforeend", paginationHTML);
    }
}

function getCategoryIcon(category) {
    const icons = {
        general: "info-circle",
        maintenance: "tools",
        events: "calendar-alt",
        policy: "file-alt",
        emergency: "exclamation-triangle",
    };
    return icons[category] || "info-circle";
}

function setAnnouncementFilter(filter, buttonElement) {
    currentAnnouncementFilter = filter;
    currentPage = 1;

    document
        .querySelectorAll(".filter-chip")
        .forEach((btn) => btn.classList.remove("active"));
    buttonElement.classList.add("active");

    renderAnnouncements();
}

function viewAnnouncement(id) {
    const announcement = announcements.find((a) => a.id === id);
    if (!announcement) return;

    document.getElementById("modalAnnouncementTitle").innerHTML = `
        ${announcement.title}
        ${announcement.pinned
            ? '<i class="fas fa-thumbtack" style="color: var(--warning-color); font-size: 1rem; margin-left: 0.5rem;"></i>'
            : ""
        }
    `;

    document.getElementById("modalAnnouncementMeta").innerHTML = `
        <div><i class="fas fa-user"></i> ${announcement.author}</div>
        <div><i class="fas fa-calendar"></i> ${announcement.date}</div>
        <div><i class="fas fa-clock"></i> ${announcement.time}</div>
        <div>
            <span class="announcement-category ${announcement.category}">
                <i class="fas fa-${getCategoryIcon(announcement.category)}"></i>
                ${announcement.category}
            </span>
        </div>
        <div>
            <span class="announcement-priority ${announcement.priority}">
                <i class="fas fa-circle"></i>
                ${announcement.priority}
            </span>
        </div>
    `;

    document.getElementById("modalAnnouncementContent").textContent =
        announcement.content;

    showModal("viewAnnouncementModal");
}

function openCreateAnnouncementModal() {
    document.getElementById("announcementTitle").value = "";
    document.getElementById("announcementCategory").value = "general";
    document.getElementById("announcementContent").value = "";
    document.getElementById("pinAnnouncement").checked = false;
    document.querySelectorAll('input[name="priority"]')[1].checked = true;

    showModal("createAnnouncementModal");
}

function createAnnouncement() {
    const title = document.getElementById("announcementTitle").value;
    const category = document.getElementById("announcementCategory").value;
    const content = document.getElementById("announcementContent").value;
    const pinned = document.getElementById("pinAnnouncement").checked;
    const priority = document.querySelector(
        'input[name="priority"]:checked'
    ).value;

    if (!title || !content) {
        showNotification("Please fill in all required fields", "error");
        return;
    }

    const newAnnouncement = {
        id: announcements.length + 1,
        title,
        category,
        priority,
        content,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        author:
            currentUser && (currentUser.first_name || currentUser.last_name)
                ? `${currentUser.first_name || ""} ${currentUser.last_name || ""
                    }`.trim()
                : "Admin",
        pinned,
    };

    announcements.unshift(newAnnouncement);
    closeModal("createAnnouncementModal");
    renderAnnouncements();
    updateAnnouncementsBadge();
    showNotification("Announcement published successfully!", "success");
}

function createPagination(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return "";

    let paginationHTML = '<div class="pagination-container">';

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    paginationHTML += `
        <div class="pagination-info">
            <i class="fas fa-bullhorn"></i>
            Showing ${startItem}-${endItem} of ${totalItems} announcements
        </div>
    `;

    paginationHTML += '<div class="pagination-controls">';

    paginationHTML += `
        <div class="per-page-selector">
            <span>Show:</span>
            <select id="announcementsPerPageSelect" onchange="changeAnnouncementsPerPage(this.value)">
                <option value="6" ${itemsPerPage === 6 ? "selected" : ""
        }>6</option>
                <option value="12" ${itemsPerPage === 12 ? "selected" : ""
        }>12</option>
                <option value="18" ${itemsPerPage === 18 ? "selected" : ""
        }>18</option>
                <option value="24" ${itemsPerPage === 24 ? "selected" : ""
        }>24</option>
            </select>
        </div>
    `;

    paginationHTML += `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage <= 1 ? "disabled" : ""
        } class="pagination-btn">
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `<button onclick="goToPage(1)" class="pagination-btn">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? "active" : "";
        paginationHTML += `<button onclick="goToPage(${i})" class="pagination-btn ${activeClass}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button onclick="goToPage(${totalPages})" class="pagination-btn">${totalPages}</button>`;
    }

    paginationHTML += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? "disabled" : ""
        } class="pagination-btn">
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationHTML += "</div></div>";

    return paginationHTML;
}

function goToPage(page) {
    const totalPages = Math.ceil(announcements.length / announcementsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderAnnouncements();
}

function changeAnnouncementsPerPage(newPerPage) {
    announcementsPerPage = parseInt(newPerPage);
    currentPage = 1;
    renderAnnouncements();
}

async function loadConversationsOnly() {
    try {
        chatContacts = [];
        if (currentUser && currentUser.user_id) {
            const convRes = await fetch(
                `${API_BASE}/messages/conversations/${currentUser.user_id}`,
                { credentials: "include" }
            );
            const convs = await convRes.json();
            chatContacts = (convs || []).map((c) => ({
                id: c.other_user_id,
                name: c.other_user_name,
                avatar: getInitialsFromName(c.other_user_name),
                online: false,
                lastMessage: c.last_message || "",
                lastTime: c.last_message_time ? formatTime(c.last_message_time) : "",
                unreadCount: 0,
            }));
        }
    } catch (e) {
        console.error("Failed to load contacts", e);
    }
}

function renderChatContacts() {
    let html = "";
    chatContacts.forEach((contact) => {
        const onlineClass = contact.online ? "online" : "";
        const activeClass = currentChatContact === contact.id ? "active" : "";
        const unreadBadge =
            contact.unreadCount > 0
                ? `<span class="unread-count">${contact.unreadCount}</span>`
                : "";

        html += `
            <div class="contact-item ${activeClass}" onclick="selectChatContact(${contact.id})">
                <div class="contact-avatar ${onlineClass}">${contact.avatar}</div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-last-message">${contact.lastMessage}</div>
                </div>
                <div class="contact-meta">
                    <div class="contact-time">${contact.lastTime}</div>
                    ${unreadBadge}
                </div>
            </div>
        `;
    });

    document.getElementById("chatContacts").innerHTML = html;
}

async function selectChatContact(contactId) {
    currentChatContact = contactId;
    const contact = chatContacts.find((c) => c.id === contactId);

    renderChatContacts();

    if (!chatMessagesCache[contactId]) {
        await loadMessagesForContact(contactId);
    }
    renderChatMain(contact);
}

function renderChatMain(contact) {
    const messages = chatMessagesCache[contact.id] || [];

    let html = `
        <div class="chat-main-header" style="padding: 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem; background: var(--background-white); flex-shrink: 0;">
            <div class="contact-avatar ${contact.online ? "online" : ""}">${contact.avatar
        }</div>
            <div>
                <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin: 0;">${contact.name
        }</h3>
                <p style="font-size: 0.8125rem; color: var(--text-muted); margin: 0;">${contact.online ? "Online now" : "Offline"
        }</p>
            </div>
        </div>
        <div class="chat-messages" id="chatMessages">
            ${renderChatMessages(messages)}
            <div id="typingIndicator" style="display:none; color: var(--text-muted); font-size: 0.8125rem; margin: 0.5rem 1rem;">Typing...</div>
        </div>
        <div class="chat-input-container">
            <div class="chat-input-wrapper">
                <textarea id="chatInput" placeholder="Type your message..." rows="1" oninput="autoResizeTextarea(this)" onkeydown="handleChatKeyDown(event)" onfocus="focusChatInput(this)" onblur="blurChatInput(this)"></textarea>
                <button class="image-upload-btn" onclick="document.getElementById('imageUpload').click()" title="Attach files">
                    <i class="fas fa-image"></i>
                </button>
                <input type="file" id="imageUpload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
                <button class="image-upload-btn" onclick="toggleEmojiPicker()" title="Insert emoji">
                    <i class="fas fa-face-smile"></i>
                </button>
                <button class="chat-send-btn" onclick="sendChatMessage()" id="sendBtn" disabled>
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div id="attachmentsPreview" style="display:none; margin-top:0.5rem; gap:0.5rem; flex-wrap:wrap"></div>
            <div id="emojiPicker" style="display:none; margin-top:0.5rem; background: var(--background-white); border:1px solid var(--border-color); border-radius:0.5rem; padding:0.5rem; max-width:18rem;">
                <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
                    ${[
            "😀",
            "😁",
            "😂",
            "🤣",
            "😊",
            "😍",
            "😘",
            "😎",
            "🤔",
            "😴",
            "👍",
            "🙏",
            "🎉",
            "🔥",
            "✅",
            "❌",
        ]
            .map(
                (e) =>
                    `<button type="button" style="border:none;background:none;font-size:1.25rem;cursor:pointer" onclick="insertEmoji('${e}')">${e}</button>`
            )
            .join("")}
                </div>
            </div>
            <div style="margin-top:0.5rem; color: var(--text-light); font-size: 0.75rem;">Press Enter to send • Shift+Enter for a new line</div>
        </div>
    `;

    document.getElementById("chatMain").innerHTML = html;

    if (socket && currentUser) {
        const otherUserId = contact.id;
        socket.emit("join_conversation", { otherUserId });
    }
}

function renderChatMessages(messages) {
    return messages
        .map((msg) => {
            const sentClass = msg.sent ? "sent" : "received";
            return `
            <div class="message-bubble ${sentClass}">
                <div class="message-text">${msg.text}</div>
                <div class="message-time">${msg.time}</div>
                ${msg.attachments && msg.attachments.length
                    ? `<div class="image-message">${msg.attachments
                        .map(
                            (a) =>
                                `<a href="${a.url
                                }" target="_blank" rel="noopener" style="display:inline-block;margin-top:0.25rem;color:var(--primary-color)"><i class='fas fa-paperclip'></i> ${a.filename || "Attachment"
                                }</a>`
                        )
                        .join("")}</div>`
                    : ""
                }
            </div>
        `;
        })
        .join("");
}

function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (!message || !currentChatContact) return;

    if (!chatMessagesCache[currentChatContact])
        chatMessagesCache[currentChatContact] = [];
    const tmpId = `tmp_${Date.now()}`;
    const optimistic = { id: tmpId, text: message, sent: true, time: "Just now" };
    chatMessagesCache[currentChatContact].push(optimistic);
    input.value = "";
    autoResizeTextarea(input);

    const contact = chatContacts.find((c) => c.id === currentChatContact);
    renderChatMain(contact);
    scrollChatToBottom();

    const attachmentsMeta = pendingAttachments.map((a) => ({
        url: a.url,
        filename: a.filename,
    }));

    fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
            sender_user_id: currentUser.user_id,
            recipient_user_id: currentChatContact,
            message,
            attachments: attachmentsMeta,
        }),
    })
        .then((r) => r.json())
        .then((res) => {
            if (res && res.data) {
                const idx = chatMessagesCache[currentChatContact].findIndex(
                    (m) => m.id === tmpId
                );
                if (idx >= 0)
                    chatMessagesCache[currentChatContact][idx] = {
                        id: res.data.message_id || res.data.id,
                        text: res.data.message || message,
                        sent: true,
                        time: formatTime(res.data.created_at || res.data.createdAt),
                        attachments: res.data.attachments || attachmentsMeta,
                    };

                pendingAttachments = [];
                const preview = document.getElementById("attachmentsPreview");
                if (preview) {
                    preview.innerHTML = "";
                    preview.style.display = "none";
                }
                renderChatMain(contact);
                scrollChatToBottom();
            }
        })
        .catch((err) => {
            console.error("Send message failed", err);
            showNotification("Failed to send message", "error");
        });
}

function scrollChatToBottom() {
    setTimeout(() => {
        const messagesContainer = document.getElementById("chatMessages");
        if (messagesContainer)
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
}

async function loadMessagesForContact(contactId) {
    if (!currentUser || !currentUser.user_id) return;
    const other = contactId;
    const conversationId = [String(currentUser.user_id), String(other)]
        .sort()
        .join("_");
    try {
        const res = await fetch(
            `${API_BASE}/messages?conversationId=${encodeURIComponent(
                conversationId
            )}&sort=created_at ASC&limit=100`,
            { credentials: "include" }
        );
        const data = await res.json();
        const msgs = (data.messages || []).map((m) => ({
            id: m.message_id,
            text: m.message,
            sent: String(m.sender_user_id) === String(currentUser.user_id),
            time: formatTime(m.created_at),
        }));
        chatMessagesCache[contactId] = msgs;
    } catch (e) {
        console.error("Failed to load messages", e);
        chatMessagesCache[contactId] = chatMessagesCache[contactId] || [];
    }
}

function handleChatKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

function autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}

function focusChatInput(textarea) {
    textarea.parentElement.style.borderColor = "var(--primary-color)";
    textarea.parentElement.style.boxShadow =
        "0 0 0 0.1875rem rgba(99, 102, 241, 0.1)";
}

function blurChatInput(textarea) {
    textarea.parentElement.style.borderColor = "var(--border-color)";
    textarea.parentElement.style.boxShadow = "none";
}

function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const form = new FormData();
    files.forEach((f) => form.append("attachments", f));
    fetch(`${API_BASE}/messages/upload-attachments`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${jwtToken}` },
        body: form,
    })
        .then((r) => r.json())
        .then((res) => {
            if (res && res.attachments) {
                pendingAttachments = pendingAttachments.concat(
                    res.attachments.map((a) => ({ url: a.url, filename: a.filename }))
                );
                renderAttachmentsPreview();
            } else {
                showNotification("Failed to attach files", "error");
            }
        })
        .catch((err) => {
            console.error(err);
            showNotification("Failed to attach files", "error");
        });
}

function renderAttachmentsPreview() {
    const el = document.getElementById("attachmentsPreview");
    if (!el) return;
    if (!pendingAttachments.length) {
        el.innerHTML = "";
        el.style.display = "none";
        return;
    }
    el.style.display = "flex";
    el.innerHTML = pendingAttachments
        .map(
            (a, idx) => `
        <div style="display:flex; align-items:center; gap:0.5rem; background: var(--background-light); border:1px solid var(--border-color); border-radius:0.5rem; padding:0.25rem 0.5rem;">
            <i class="fas fa-paperclip" style="color: var(--text-muted)"></i>
            <a href="${a.url
                }" target="_blank" rel="noopener" style="color: var(--text-secondary); font-size: 0.8125rem; max-width: 12rem; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${a.filename || "Attachment"
                }</a>
            <button type="button" style="border:none;background:none;color: var(--error-color); cursor:pointer" onclick="removeAttachment(${idx})"><i class="fas fa-times"></i></button>
        </div>
    `
        )
        .join("");
}

function removeAttachment(index) {
    pendingAttachments.splice(index, 1);
    renderAttachmentsPreview();
}

function toggleEmojiPicker() {
    const picker = document.getElementById("emojiPicker");
    if (picker)
        picker.style.display =
            picker.style.display === "none" || !picker.style.display
                ? "block"
                : "none";
}

function insertEmoji(emoji) {
    const ta = document.getElementById("chatInput");
    if (!ta) return;
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const value = ta.value;
    ta.value = value.slice(0, start) + emoji + value.slice(end);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = start + emoji.length;
    autoResizeTextarea(ta);
    const btn = document.getElementById("sendBtn");
    if (btn) btn.disabled = ta.value.trim().length === 0;
}

function showTypingIndicator(isTyping) {
    const el = document.getElementById("typingIndicator");
    if (!el) return;
    el.style.display = isTyping ? "block" : "none";
}

function updateAnnouncementsBadge() {
    const urgentCount = announcements.filter((a) => a.priority === "high").length;
    const badge = document.getElementById("announcementsBadge");
    if (urgentCount > 0) {
        badge.textContent = urgentCount;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

function updateChatBadge() {
    const totalUnread = chatContacts.reduce(
        (sum, contact) => sum + contact.unreadCount,
        0
    );
    const badge = document.getElementById("chatBadge");
    if (totalUnread > 0) {
        badge.textContent = totalUnread;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add("show");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("show");
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("show");
    }
});

function setupEventListeners() {
    const announcementSearch = document.getElementById("announcementSearch");
    if (announcementSearch) {
        announcementSearch.addEventListener("input", function (e) {
            console.log("Searching:", e.target.value);
        });
    }

    const chatSearchInput = document.getElementById("chatSearchInput");
    if (chatSearchInput) {
        chatSearchInput.addEventListener("input", function (e) {
            console.log("Chat searching:", e.target.value);
        });
    }

    document.addEventListener("input", function (e) {
        if (
            e.target &&
            e.target.id === "chatInput" &&
            socket &&
            currentUser &&
            currentChatContact
        ) {
            socket.emit("typing_start", { otherUserId: currentChatContact });
            clearTimeout(typingTimeouts[currentChatContact]);
            typingTimeouts[currentChatContact] = setTimeout(() => {
                socket.emit("typing_stop", { otherUserId: currentChatContact });
            }, 1200);
        }
        if (e.target && e.target.id === "chatInput") {
            const btn = document.getElementById("sendBtn");
            if (btn) btn.disabled = e.target.value.trim().length === 0;
        }
    });
}

function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    if (type === "error") {
        notification.style.background =
            "linear-gradient(135deg, var(--error-color), #dc2626)";
    } else if (type === "info") {
        notification.style.background =
            "linear-gradient(135deg, var(--secondary-color), #0891b2)";
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "slideOutRight 0.5s ease forwards";
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

const style = document.createElement("style");
style.textContent = `
    @keyframes slideOutRight {
        to {
            transform: translateX(120%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function getInitials(first, last) {
    const a = (first || "").trim()[0] || "";
    const b = (last || "").trim()[0] || "";
    const s = (a + b).toUpperCase();
    return s || "U";
}
function getInitialsFromName(name) {
    const parts = (name || "").trim().split(/\s+/);
    if (parts.length === 0) return "U";
    const a = parts[0][0] || "";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    const s = (a + b).toUpperCase();
    return s || "U";
}


let selectedRecipient = null;
function openNewMessageModal() {
    selectedRecipient = null;
    const results = document.getElementById("recipientResults");
    if (results) results.innerHTML = "";
    const input = document.getElementById("recipientSearch");
    if (input) input.value = "";
    const msg = document.getElementById("newMessageText");
    if (msg) msg.value = "";
    showModal("newMessageModal");
}

async function searchRecipients(query) {
    const results = document.getElementById("recipientResults");
    if (!results) return;
    results.innerHTML =
        '<div style="padding:0.5rem; color: var(--text-muted);">Searching...</div>';
    try {
        const url = `${API_BASE}/users?role=TENANT&limit=20${query ? `&search=${encodeURIComponent(query)}` : ""
            }`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        const users = data.users || [];
        if (users.length === 0) {
            results.innerHTML =
                '<div style="padding:0.5rem; color: var(--text-muted);">No tenants found.</div>';
            return;
        }
        results.innerHTML = users
            .map(
                (u) => `
            <div class="contact-item" style="cursor:pointer" onclick="selectRecipient('${u.user_id
                    }', '${(u.first_name || "").replace(/'/g, "'")}', '${(
                        u.last_name || ""
                    ).replace(/'/g, "'")}')">
                <div class="contact-avatar">${getInitials(
                        u.first_name,
                        u.last_name
                    )}</div>
                <div class="contact-info">
                    <div class="contact-name">${u.first_name || ""} ${u.last_name || ""
                    }</div>
                    <div class="contact-last-message" style="color: var(--text-muted); font-size: 0.8125rem">${u.email || ""
                    }</div>
                </div>
            </div>
        `
            )
            .join("");
    } catch (e) {
        results.innerHTML =
            '<div style="padding:0.5rem; color: var(--error-color);">Failed to search tenants.</div>';
    }
}

function selectRecipient(userId, firstName, lastName) {
    selectedRecipient = String(userId);
    const input = document.getElementById("recipientSearch");
    if (input) input.value = `${firstName} ${lastName}`.trim();
}

async function sendFirstMessage() {
    const message = (
        document.getElementById("newMessageText")?.value || ""
    ).trim();
    if (!selectedRecipient) {
        showNotification("Please select a recipient", "error");
        return;
    }
    if (!message) {
        showNotification("Please type a message", "error");
        return;
    }
    try {
        const resp = await fetch(`${API_BASE}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            credentials: "include",
            body: JSON.stringify({
                sender_user_id: currentUser.user_id,
                recipient_user_id: selectedRecipient,
                message,
            }),
        });
        const data = await resp.json();
        if (resp.ok && data && data.data) {
            closeModal("newMessageModal");

            await loadConversationsOnly();
            renderChatContacts();
            selectChatContact(selectedRecipient);
        } else {
            showNotification(data.message || "Failed to send message", "error");
        }
    } catch (e) {
        console.error(e);
        showNotification("Failed to send message", "error");
    }
}

window.openNewMessageModal = openNewMessageModal;
window.searchRecipients = searchRecipients;
window.selectRecipient = selectRecipient;
window.sendFirstMessage = sendFirstMessage;
window.switchTab = switchTab;
window.setAnnouncementFilter = setAnnouncementFilter;
window.openCreateAnnouncementModal = openCreateAnnouncementModal;
window.createAnnouncement = createAnnouncement;
window.viewAnnouncement = viewAnnouncement;
window.goToPage = goToPage;
window.changeAnnouncementsPerPage = changeAnnouncementsPerPage;
window.selectChatContact = selectChatContact;
window.autoResizeTextarea = autoResizeTextarea;
window.handleChatKeyDown = handleChatKeyDown;
window.handleImageUpload = handleImageUpload;
window.sendChatMessage = sendChatMessage;
window.removeAttachment = removeAttachment;
window.toggleEmojiPicker = toggleEmojiPicker;
window.insertEmoji = insertEmoji;
