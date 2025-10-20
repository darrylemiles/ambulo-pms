import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import assistantController from "../controllers/assistantControllers.js";

const router = express.Router();

router.post("/session/init", protect, assistantController.initSession);

router.get("/me/profile", protect, assistantController.getMyProfile);
router.get("/me/tickets", protect, assistantController.getMyTickets);
router.get("/me/lease", protect, assistantController.getMyLease);
router.get("/me/charges", protect, assistantController.getMyCharges);
router.get("/me/payments", protect, assistantController.getMyPayments);
router.get("/faqs", protect, assistantController.getFaqs);
router.get(
    "/me/messages/summary",
    protect,
    assistantController.getMessagesSummary
);

export default router;
