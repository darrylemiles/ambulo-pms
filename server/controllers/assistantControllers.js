import usersServices from "../services/usersServices.js";
import ticketsServices from "../services/ticketsServices.js";
import leaseServices from "../services/leaseServices.js";
import paymentsServices from "../services/paymentsServices.js";
import chargesServices from "../services/chargesServices.js";
import faqsServices from "../services/faqsServices.js";
import messagesServices from "../services/messagesServices.js";

const isAdminLike = (role) => ["ADMIN", "MANAGER"].includes(String(role || "").toUpperCase());

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
    /**
     * Admin: search tenants (TENANT role) with basic filters
     */
    async adminSearchTenants(req, res) {
        try {
            const { role } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });

            const { page = 1, limit = 10, search, status, sort, ...rest } = req.query || {};
            const data = await usersServices.getUsers({ page: Number(page), limit: Number(limit), search, status, sort, ...rest });
            return res.json(data);
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to search tenants" });
        }
    },
    /**
     * Admin: list tickets with filters
     */
    async adminListTickets(req, res) {
        try {
            const { role } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });

            const { page = 1, limit = 10, status, priority, request_type, from_date, to_date, search } = req.query || {};
            const result = await ticketsServices.getTickets({ page, limit, status, priority, request_type, from_date, to_date, search });
            return res.json(result);
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to list tickets" });
        }
    },
    /**
     * Admin: aggregate/search charges across leases/tenants
     */
    async adminSearchCharges(req, res) {
        try {
            const { role } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });

            const data = await chargesServices.getAllCharges(req.query || {});
            return res.json(data);
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to search charges" });
        }
    },
    /**
     * Admin: aggregate/search payments
     */
    async adminSearchPayments(req, res) {
        try {
            const { role } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const data = await paymentsServices.getAllPayments(req.query || {});
            return res.json(data);
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to search payments" });
        }
    },
    /**
     * Admin: get one tenant's charges and payments
     */
    async adminGetTenantFinancials(req, res) {
        try {
            const { role } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const { user_id } = req.params;
            if (!user_id) return res.status(400).json({ message: "user_id is required" });

            const { status, page = 1, limit = 10 } = req.query || {};
            const charges = await chargesServices.getChargeByUserId(user_id);
            const filteredCharges = status && String(status).toLowerCase() !== "all"
                ? charges.filter((c) => String(c.canonical_status).toUpperCase() === String(status).toUpperCase())
                : charges;
            const payments = await paymentsServices.getPaymentsByUserId(user_id, { page, limit });
            return res.json({ charges: filteredCharges, payments });
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to get tenant financials" });
        }
    },
    /**
     * Admin: get charges for a lease
     */
    async adminGetLeaseCharges(req, res) {
        try {
            const { role } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const { lease_id } = req.params;
            if (!lease_id) return res.status(400).json({ message: "lease_id is required" });
            const rows = await chargesServices.getChargeByLeaseId(lease_id, req.query || {});
            return res.json({ charges: rows });
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to get lease charges" });
        }
    },
    /**
     * Admin: create a charge (single or set up recurring)
     */
    async adminCreateCharge(req, res) {
        try {
            const { role, user_id: performedBy } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const payload = req.body || {};
            if (!payload.lease_id) return res.status(400).json({ message: "lease_id is required" });
            if (!payload.amount || Number(payload.amount) <= 0) return res.status(400).json({ message: "amount must be > 0" });
            const result = await chargesServices.createCharge(payload);
            return res.status(201).json({ message: "Charge created", charge: result });
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to create charge" });
        }
    },
    /**
     * Admin: create a payment (optionally consolidated via allocations)
     */
    async adminCreatePayment(req, res) {
        try {
            const { role, user_id: performedBy } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const payload = req.body || {};
            const hasAlloc = Array.isArray(payload.allocations) && payload.allocations.length > 0;
            if (hasAlloc) {
                const result = await paymentsServices.createConsolidatedPayment(payload, performedBy);
                return res.status(201).json(result);
            }
            const result = await paymentsServices.createPayment(payload, performedBy);
            return res.status(201).json(result);
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to create payment" });
        }
    },
    /**
     * Admin: update payment status/details (confirm/reject/pending), and optional fields
     */
    async adminUpdatePayment(req, res) {
        try {
            const { role, user_id: performedBy } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const { payment_id } = req.params;
            if (!payment_id) return res.status(400).json({ message: "payment_id is required" });
            const result = await paymentsServices.updatePaymentById(payment_id, req.body || {}, performedBy);
            return res.json(result);
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to update payment" });
        }
    },
    /**
     * Admin: delete payment
     */
    async adminDeletePayment(req, res) {
        try {
            const { role, user_id: performedBy } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const { payment_id } = req.params;
            if (!payment_id) return res.status(400).json({ message: "payment_id is required" });
            const result = await paymentsServices.deletePaymentById(payment_id, performedBy);
            return res.json(result);
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to delete payment" });
        }
    },
    /**
     * Admin: update charge (e.g., description, due_date, status)
     */
    async adminUpdateCharge(req, res) {
        try {
            const { role } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const { charge_id } = req.params;
            if (!charge_id) return res.status(400).json({ message: "charge_id is required" });
            const updated = await chargesServices.updateChargeById(charge_id, req.body || {});
            return res.json({ message: 'Charge updated', charge: updated });
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to update charge" });
        }
    },
    /**
     * Admin: waive a charge (sets status to Waived)
     */
    async adminWaiveCharge(req, res) {
        try {
            const { role } = req.user || {};
            if (!isAdminLike(role)) return res.status(403).json({ message: "Forbidden" });
            const { charge_id } = req.params;
            if (!charge_id) return res.status(400).json({ message: "charge_id is required" });
            const updated = await chargesServices.updateChargeById(charge_id, { status: 'Waived' });
            return res.json({ message: 'Charge waived', charge: updated });
        } catch (e) {
            return res.status(500).json({ message: e.message || "Failed to waive charge" });
        }
    },
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
