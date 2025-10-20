import usersServices from "../services/usersServices.js";
import ticketsServices from "../services/ticketsServices.js";
import leaseServices from "../services/leaseServices.js";
import paymentsServices from "../services/paymentsServices.js";
import chargesServices from "../services/chargesServices.js";
import faqsServices from "../services/faqsServices.js";
import messagesServices from "../services/messagesServices.js";

const initSession = async (req, res) => {
    try {
        const { user_id, role, first_name, last_name, email } = req.user || {};
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const claims = {
            user_id,
            role,
            display_name:
                [first_name, last_name].filter(Boolean).join(" ") || email || "User",
        };

        return res.json({
            message: "Assistant session initialized",
            claims,
        });
    } catch (e) {
        return res
            .status(500)
            .json({ message: e.message || "Failed to init assistant session" });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const { user_id } = req.user || {};
        const user = await usersServices.getSingleUserById(user_id);

        const { password_hash, ...safe } = user;
        return res.json({ profile: safe });
    } catch (e) {
        return res
            .status(500)
            .json({ message: e.message || "Failed to get profile" });
    }
};

const getMyTickets = async (req, res) => {
    try {
        const { user_id } = req.user || {};
        const { page = 1, limit = 10, status } = req.query;
        const data = await ticketsServices.getTicketsByUserId(user_id, {
            page,
            limit,
        });

        const tickets =
            status && String(status).toLowerCase() !== "all"
                ? data.tickets.filter(
                    (t) =>
                        String(t.ticket_status).toUpperCase() ===
                        String(status).toUpperCase()
                )
                : data.tickets;
        return res.json({
            tickets,
            pagination: data.pagination,
        });
    } catch (e) {
        return res
            .status(500)
            .json({ message: e.message || "Failed to get tickets" });
    }
};

export default {
    initSession,
    getMyProfile,
    getMyTickets,
    async getMyLease(req, res) {
        try {
            const { user_id } = req.user || {};
            const leases = await leaseServices.getLeaseByUserId(user_id);

            const sorted = (leases || [])
                .slice()
                .sort(
                    (a, b) =>
                        new Date(b.lease_start_date || 0) -
                        new Date(a.lease_start_date || 0)
                );
            const current =
                sorted.find((l) => String(l.lease_status).toUpperCase() === "ACTIVE") ||
                sorted.find(
                    (l) => String(l.lease_status).toUpperCase() === "PENDING"
                ) ||
                sorted[0] ||
                null;
            return res.json({ current, all: leases });
        } catch (e) {
            return res
                .status(500)
                .json({ message: e.message || "Failed to get lease" });
        }
    },
    async getMyCharges(req, res) {
        try {
            const { user_id } = req.user || {};
            const { status } = req.query || {};
            const rows = await chargesServices.getChargeByUserId(user_id);
            const filtered =
                status && String(status).toLowerCase() !== "all"
                    ? rows.filter(
                        (r) =>
                            String(r.canonical_status).toUpperCase() ===
                            String(status).toUpperCase()
                    )
                    : rows;
            const summary = {
                total: filtered.length,
                outstanding: filtered.filter(
                    (r) =>
                        String(r.canonical_status).toUpperCase() !== "PAID" &&
                        String(r.canonical_status).toUpperCase() !== "WAIVED"
                ).length,
                overdue: filtered.filter(
                    (r) =>
                        new Date(r.due_date) < new Date() &&
                        (r.canonical_status || "").toUpperCase() !== "PAID"
                ).length,
                totalAmount: filtered.reduce((s, r) => s + Number(r.amount || 0), 0),
                totalPaid: filtered.reduce((s, r) => s + Number(r.total_paid || 0), 0),
            };
            return res.json({ charges: filtered, summary });
        } catch (e) {
            return res
                .status(500)
                .json({ message: e.message || "Failed to get charges" });
        }
    },
    async getMyPayments(req, res) {
        try {
            const { user_id } = req.user || {};
            const { page = 1, limit = 10 } = req.query;
            const data = await paymentsServices.getPaymentsByUserId(user_id, {
                page,
                limit,
            });
            return res.json(data);
        } catch (e) {
            return res
                .status(500)
                .json({ message: e.message || "Failed to get payments" });
        }
    },
    async getFaqs(req, res) {
        try {
            const rows = await faqsServices.getAllFaqs();
            const faqs = (rows || [])
                .filter((r) => r.is_active === 1 || r.is_active === true)
                .map((r) => ({ id: r.faq_id, question: r.question, answer: r.answer }));
            return res.json({ faqs });
        } catch (e) {
            return res
                .status(500)
                .json({ message: e.message || "Failed to get FAQs" });
        }
    },
    async getMessagesSummary(req, res) {
        try {
            const { user_id } = req.user || {};
            const convs = await messagesServices.getConversations(user_id);
            const sorted = (convs || [])
                .slice()
                .sort(
                    (a, b) =>
                        new Date(b.last_message_time || 0) -
                        new Date(a.last_message_time || 0)
                );
            const top = sorted.slice(0, 5).map((c) => ({
                other_user_id: c.other_user_id,
                other_user_name: c.other_user_name,
                last_message: c.last_message,
                last_message_time: c.last_message_time,
            }));
            return res.json({ count: convs?.length || 0, recent: top });
        } catch (e) {
            return res
                .status(500)
                .json({ message: e.message || "Failed to get messages summary" });
        }
    },
};
